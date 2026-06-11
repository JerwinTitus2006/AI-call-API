from fastapi import APIRouter, HTTPException
from datetime import datetime
from database import get_db
from models.transcript import TranscriptSegmentAdd
import uuid

router = APIRouter(prefix="/api/transcripts", tags=["transcripts"])


def serialize_transcript(t: dict) -> dict:
    t["id"] = str(t["_id"])
    t.pop("_id", None)
    if t.get("created_at"):
        t["created_at"] = t["created_at"].isoformat()
    if t.get("updated_at"):
        t["updated_at"] = t["updated_at"].isoformat()
    for seg in t.get("segments", []):
        if seg.get("timestamp") and hasattr(seg["timestamp"], "isoformat"):
            seg["timestamp"] = seg["timestamp"].isoformat()
    return t


@router.get("/{meeting_id}")
async def get_transcript(meeting_id: str):
    db = get_db()
    transcript = await db.transcripts.find_one({"meeting_id": meeting_id})
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return serialize_transcript(transcript)


@router.post("/{meeting_id}/segment")
async def add_segment(meeting_id: str, data: TranscriptSegmentAdd):
    db = get_db()

    segment = {
        "id": str(uuid.uuid4()),
        "speaker_name": data.speaker_name,
        "speaker_role": data.speaker_role,
        "text": data.text,
        "start_time": data.start_time,
        "end_time": data.end_time,
        "timestamp": datetime.utcnow(),
        "is_final": data.is_final,
    }

    await db.transcripts.update_one(
        {"meeting_id": meeting_id},
        {
            "$push": {"segments": segment},
            "$inc": {"word_count": len(data.text.split())},
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
            {"$set": {"full_text": full_text}}
        )

    return {"status": "ok", "segment": segment}
