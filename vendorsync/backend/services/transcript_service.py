from database import get_db
from datetime import datetime
import uuid


async def process_segment(meeting_id: str, segment_data: dict) -> dict:
    db = get_db()
    
    segment = {
        "id": str(uuid.uuid4()),
        "speaker_name": segment_data["speaker_name"],
        "speaker_role": segment_data["speaker_role"],
        "text": segment_data["text"],
        "start_time": segment_data.get("start_time", 0),
        "end_time": segment_data.get("end_time", 0),
        "timestamp": datetime.utcnow(),
        "is_final": segment_data.get("is_final", True),
    }

    await db.transcripts.update_one(
        {"meeting_id": meeting_id},
        {
            "$push": {"segments": segment},
            "$inc": {"word_count": len(segment["text"].split())},
            "$set": {"updated_at": datetime.utcnow()},
        },
        upsert=True,
    )

    return segment


async def get_full_transcript_text(meeting_id: str) -> str:
    db = get_db()
    transcript = await db.transcripts.find_one({"meeting_id": meeting_id})
    if not transcript:
        return ""
    segments = transcript.get("segments", [])
    lines = []
    for s in segments:
        if s.get("is_final"):
            lines.append(f"{s['speaker_name']} ({s['speaker_role']}): {s['text']}")
    return "\n".join(lines)
