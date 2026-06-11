from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import StreamingResponse
from database import get_db, get_gridfs
from middleware.auth_middleware import get_current_user
from bson import ObjectId
import io

router = APIRouter(prefix="/api/files", tags=["files"])


@router.post("/upload/{meeting_id}")
async def upload_recording(
    meeting_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    gridfs = get_gridfs()

    meeting = await db.meetings.find_one({"_id": meeting_id})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    content = await file.read()
    
    file_id = await gridfs.upload_from_stream(
        file.filename or f"recording-{meeting_id}.webm",
        io.BytesIO(content),
        metadata={
            "meeting_id": meeting_id,
            "content_type": file.content_type or "video/webm",
            "size": len(content),
        }
    )

    await db.meetings.update_one(
        {"_id": meeting_id},
        {
            "$set": {
                "video_file_id": str(file_id),
                "has_recording": True,
            }
        }
    )

    return {"file_id": str(file_id), "size": len(content), "filename": file.filename}


@router.get("/{file_id}")
async def stream_file(file_id: str):
    gridfs = get_gridfs()
    
    try:
        object_id = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file ID")

    try:
        stream = await gridfs.open_download_stream(object_id)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")

    async def generate():
        while True:
            chunk = await stream.read(65536)
            if not chunk:
                break
            yield chunk

    content_type = "video/webm"
    if stream.metadata:
        content_type = stream.metadata.get("content_type", "video/webm")

    return StreamingResponse(
        generate(),
        media_type=content_type,
        headers={
            "Content-Disposition": f'inline; filename="{stream.filename}"',
            "Accept-Ranges": "bytes",
        }
    )


@router.delete("/{file_id}")
async def delete_file(file_id: str, current_user: dict = Depends(get_current_user)):
    gridfs = get_gridfs()
    
    try:
        object_id = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file ID")

    try:
        await gridfs.delete(object_id)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")

    return {"status": "deleted"}
