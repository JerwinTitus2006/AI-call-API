import socketio
from datetime import datetime
from database import get_db
import uuid

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

# Track connected participants: sid -> {meeting_id, name, role}
connected_participants = {}

# Track meeting rooms: meeting_id -> set of sids
meeting_rooms = {}


@sio.event
async def connect(sid, environ, auth):
    print(f"[CONNECT] Client connected: {sid}")


@sio.event
async def disconnect(sid):
    participant = connected_participants.pop(sid, None)
    if participant:
        meeting_id = participant.get("meeting_id")
        if meeting_id and meeting_id in meeting_rooms:
            meeting_rooms[meeting_id].discard(sid)
        
        await sio.emit(
            "participant-left",
            {
                "sid": sid,
                "name": participant.get("name"),
                "role": participant.get("role"),
            },
            room=f"meeting:{participant.get('meeting_id')}",
            skip_sid=sid,
        )
    print(f"[DISCONNECT] Client disconnected: {sid}")


@sio.event
async def join_meeting(sid, data):
    meeting_id = data.get("meeting_id")
    name = data.get("name", "Unknown")
    role = data.get("role", "vendor")

    await sio.enter_room(sid, f"meeting:{meeting_id}")

    connected_participants[sid] = {
        "meeting_id": meeting_id,
        "name": name,
        "role": role,
        "sid": sid,
        "joined_at": datetime.utcnow().isoformat(),
    }

    if meeting_id not in meeting_rooms:
        meeting_rooms[meeting_id] = set()
    meeting_rooms[meeting_id].add(sid)

    # Notify others
    await sio.emit(
        "participant-joined",
        {
            "sid": sid,
            "name": name,
            "role": role,
        },
        room=f"meeting:{meeting_id}",
        skip_sid=sid,
    )

    # Send current participants list to the new joiner
    current = [
        p for s, p in connected_participants.items()
        if p.get("meeting_id") == meeting_id and s != sid
    ]
    await sio.emit("current-participants", current, to=sid)

    print(f"[JOIN] {name} joined meeting {meeting_id}")


@sio.event
async def transcript_chunk(sid, data):
    meeting_id = data.get("meeting_id")
    speaker_name = data.get("speaker_name")
    speaker_role = data.get("speaker_role")
    text = data.get("text", "").strip()
    start_time = data.get("start_time", 0)
    is_final = data.get("is_final", True)

    if not text or not meeting_id:
        return

    segment = {
        "id": str(uuid.uuid4()),
        "speaker_name": speaker_name,
        "speaker_role": speaker_role,
        "text": text,
        "start_time": start_time,
        "end_time": start_time + 5,
        "timestamp": datetime.utcnow().isoformat(),
        "is_final": is_final,
    }

    # Persist final segments to DB
    if is_final:
        try:
            db = get_db()
            seg_doc = {
                **segment,
                "timestamp": datetime.utcnow(),
            }
            await db.transcripts.update_one(
                {"meeting_id": meeting_id},
                {
                    "$push": {"segments": seg_doc},
                    "$inc": {"word_count": len(text.split())},
                    "$set": {"updated_at": datetime.utcnow()},
                },
                upsert=True,
            )
            # Update full_text
            transcript = await db.transcripts.find_one({"meeting_id": meeting_id})
            if transcript:
                full_text = " ".join(
                    s["text"] for s in transcript.get("segments", []) if s.get("is_final")
                )
                await db.transcripts.update_one(
                    {"meeting_id": meeting_id},
                    {"$set": {"full_text": full_text}},
                )
        except Exception as e:
            print(f"[ERROR] DB save error: {e}")

    # Broadcast to everyone in the meeting room
    await sio.emit(
        "transcript-broadcast",
        segment,
        room=f"meeting:{meeting_id}",
    )


@sio.event
async def webrtc_offer(sid, data):
    target_sid = data.get("target")
    await sio.emit("webrtc-offer", {**data, "from": sid}, to=target_sid)


@sio.event
async def webrtc_answer(sid, data):
    target_sid = data.get("target")
    await sio.emit("webrtc-answer", {**data, "from": sid}, to=target_sid)


@sio.event
async def webrtc_ice_candidate(sid, data):
    target_sid = data.get("target")
    await sio.emit("webrtc-ice-candidate", {**data, "from": sid}, to=target_sid)


@sio.event
async def meeting_ended(sid, data):
    meeting_id = data.get("meeting_id")
    await sio.emit(
        "meeting-ended",
        {"meeting_id": meeting_id},
        room=f"meeting:{meeting_id}",
    )
    print(f"[END] Meeting {meeting_id} ended")
