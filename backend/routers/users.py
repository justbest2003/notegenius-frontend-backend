from fastapi import APIRouter, Depends
from datetime import datetime

from database.mongodb import get_db
from middleware.firebase_auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    """ดึงโปรไฟล์ผู้ใช้ (สร้างใหม่ถ้ายังไม่มี)"""
    db = get_db()

    # Find or create user
    db_user = await db.users.find_one({"firebase_uid": user["uid"]})

    if not db_user:
        # Create new user profile
        now = datetime.utcnow()
        db_user = {
            "firebase_uid": user["uid"],
            "email": user.get("email", ""),
            "display_name": user.get("name", ""),
            "created_at": now,
            "last_login": now,
        }
        await db.users.insert_one(db_user)
    else:
        # Update last login
        await db.users.update_one(
            {"firebase_uid": user["uid"]},
            {"$set": {"last_login": datetime.utcnow()}},
        )

    db_user.pop("_id", None)
    return {"user": db_user}


@router.get("/stats")
async def get_stats(user: dict = Depends(get_current_user)):
    """ดึงสถิติการใช้งาน"""
    db = get_db()
    uid = user["uid"]

    # Count notes by source
    total_notes = await db.notes.count_documents({"user_id": uid})
    voice_notes = await db.notes.count_documents({"user_id": uid, "$or": [{"source": "voice"}, {"used_voice": True}]})
    ocr_notes = await db.notes.count_documents({"user_id": uid, "$or": [{"source": "ocr"}, {"used_ocr": True}]})

    # Count AI usage
    ai_summaries = await db.usage_stats.count_documents({
        "user_id": uid,
        "action": "summarize",
    })

    # Count notes with summaries
    notes_with_summary = await db.notes.count_documents({
        "user_id": uid,
        "summary": {"$ne": ""},
    })

    # Get categories breakdown
    pipeline = [
        {"$match": {"user_id": uid}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    categories = []
    async for doc in db.notes.aggregate(pipeline):
        categories.append({
            "name": doc["_id"] or "ไม่มีหมวดหมู่",
            "count": doc["count"],
        })

    return {
        "stats": {
            "totalNotes": total_notes,
            "aiSummaries": notes_with_summary,
            "voiceNotes": voice_notes,
            "ocrNotes": ocr_notes,
        },
        "categories": categories,
    }
