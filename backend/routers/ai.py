from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel
from datetime import datetime

from database.mongodb import get_db
from middleware.firebase_auth import get_current_user
from services.llm_service import llm_service
from services.ocr_service import ocr_service
from services.voice_service import voice_service

router = APIRouter(prefix="/api/ai", tags=["AI"])


class TextInput(BaseModel):
    content: str


@router.post("/summarize")
async def summarize_text(
    data: TextInput,
    user: dict = Depends(get_current_user),
):
    """สรุปเนื้อหาด้วย AI (Gemini)"""
    db = get_db()

    summary = await llm_service.summarize(data.content)

    # Log usage
    await db.usage_stats.insert_one({
        "user_id": user["uid"],
        "action": "summarize",
        "created_at": datetime.utcnow(),
    })

    return {"summary": summary}


@router.post("/auto-tag")
async def auto_tag(
    data: TextInput,
    user: dict = Depends(get_current_user),
):
    """สร้างแท็กอัตโนมัติด้วย AI"""
    db = get_db()

    tags = await llm_service.auto_tag(data.content)

    # Log usage
    await db.usage_stats.insert_one({
        "user_id": user["uid"],
        "action": "auto_tag",
        "created_at": datetime.utcnow(),
    })

    return {"tags": tags}


@router.post("/ocr")
async def extract_text_from_image(
    image: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """ดึงข้อความจากรูปภาพ (OCR)"""
    db = get_db()

    # Read image file
    image_bytes = await image.read()

    # Extract text
    text = await ocr_service.extract_text(image_bytes)

    # Log usage
    await db.usage_stats.insert_one({
        "user_id": user["uid"],
        "action": "ocr",
        "created_at": datetime.utcnow(),
    })

    return {"text": text, "filename": image.filename}


@router.post("/voice-to-text")
async def voice_to_text(
    audio: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """แปลงเสียงเป็นข้อความ"""
    db = get_db()

    # Read audio file
    audio_bytes = await audio.read()

    # Transcribe
    text = await voice_service.transcribe(audio_bytes)

    # Log usage
    await db.usage_stats.insert_one({
        "user_id": user["uid"],
        "action": "voice",
        "created_at": datetime.utcnow(),
    })

    return {"text": text, "filename": audio.filename}
