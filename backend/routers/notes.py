from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime
from typing import Optional

from database.mongodb import get_db
from middleware.firebase_auth import get_current_user
from models.note import NoteCreate, NoteUpdate

router = APIRouter(prefix="/api/notes", tags=["Notes"])


def note_to_response(note: dict) -> dict:
    """Convert MongoDB document to response format"""
    note["_id"] = str(note["_id"])
    return note


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    user: dict = Depends(get_current_user),
):
    """สร้างโน้ตใหม่"""
    db = get_db()
    now = datetime.utcnow()

    note_doc = {
        "user_id": user["uid"],
        "title": note_data.title,
        "content": note_data.content,
        "tags": note_data.tags,
        "category": note_data.category,
        "source": note_data.source,
        "summary": note_data.summary,
        "used_voice": note_data.used_voice,
        "used_ocr": note_data.used_ocr,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.notes.insert_one(note_doc)

    # Log usage stat
    await db.usage_stats.insert_one({
        "user_id": user["uid"],
        "action": "create_note",
        "created_at": now,
    })

    note_doc["_id"] = str(result.inserted_id)
    return {"message": "สร้างโน้ตสำเร็จ", "note": note_doc}


@router.get("")
async def get_notes(
    user: dict = Depends(get_current_user),
    search: Optional[str] = None,
    source: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
):
    """ดึงโน้ตทั้งหมดของผู้ใช้"""
    db = get_db()

    # Build query
    query = {"user_id": user["uid"]}

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [search]}},
        ]

    if source and source != "all":
        query["source"] = source

    if category:
        query["category"] = category

    # Execute query
    cursor = db.notes.find(query).sort("updated_at", -1).skip(skip).limit(limit)
    notes = []
    async for note in cursor:
        notes.append(note_to_response(note))

    # Get total count
    total = await db.notes.count_documents({"user_id": user["uid"]})

    return {"notes": notes, "total": total}


@router.get("/{note_id}")
async def get_note(
    note_id: str,
    user: dict = Depends(get_current_user),
):
    """ดึงโน้ตตาม ID"""
    db = get_db()

    try:
        note = await db.notes.find_one({
            "_id": ObjectId(note_id),
            "user_id": user["uid"],
        })
    except Exception:
        raise HTTPException(status_code=400, detail="ID โน้ตไม่ถูกต้อง")

    if not note:
        raise HTTPException(status_code=404, detail="ไม่พบโน้ตนี้")

    return {"note": note_to_response(note)}


@router.put("/{note_id}")
async def update_note(
    note_id: str,
    note_data: NoteUpdate,
    user: dict = Depends(get_current_user),
):
    """แก้ไขโน้ต"""
    db = get_db()

    # Build update dict (only non-None fields)
    update_fields = {
        k: v for k, v in note_data.model_dump().items() if v is not None
    }
    update_fields["updated_at"] = datetime.utcnow()

    try:
        result = await db.notes.update_one(
            {"_id": ObjectId(note_id), "user_id": user["uid"]},
            {"$set": update_fields},
        )
    except Exception:
        raise HTTPException(status_code=400, detail="ID โน้ตไม่ถูกต้อง")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="ไม่พบโน้ตนี้")

    # Fetch updated note
    note = await db.notes.find_one({"_id": ObjectId(note_id)})
    return {"message": "อัพเดตโน้ตสำเร็จ", "note": note_to_response(note)}


@router.delete("/{note_id}")
async def delete_note(
    note_id: str,
    user: dict = Depends(get_current_user),
):
    """ลบโน้ต"""
    db = get_db()

    try:
        result = await db.notes.delete_one({
            "_id": ObjectId(note_id),
            "user_id": user["uid"],
        })
    except Exception:
        raise HTTPException(status_code=400, detail="ID โน้ตไม่ถูกต้อง")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="ไม่พบโน้ตนี้")

    return {"message": "ลบโน้ตสำเร็จ"}
