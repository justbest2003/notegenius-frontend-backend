from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NoteCreate(BaseModel):
    """Schema for creating a new note"""
    title: str = Field(..., min_length=1, max_length=200, description="ชื่อโน้ต")
    content: str = Field(default="", description="เนื้อหาโน้ต")
    tags: list[str] = Field(default=[], description="แท็ก")
    category: str = Field(default="", description="หมวดหมู่")
    source: str = Field(default="manual", description="แหล่งที่มา: manual, voice, ocr")
    summary: str = Field(default="", description="สรุปโดย AI")
    used_voice: bool = Field(default=False, description="มีการใช้เสียงในโน้ตนี้")
    used_ocr: bool = Field(default=False, description="มีการใช้ OCR ในโน้ตนี้")


class NoteUpdate(BaseModel):
    """Schema for updating a note"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    tags: Optional[list[str]] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    used_voice: Optional[bool] = None
    used_ocr: Optional[bool] = None


class NoteResponse(BaseModel):
    """Schema for note response"""
    id: str = Field(..., alias="_id")
    user_id: str
    title: str
    content: str = ""
    tags: list[str] = []
    category: str = ""
    source: str = "manual"
    summary: str = ""
    used_voice: bool = False
    used_ocr: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True


class NoteInDB(BaseModel):
    """Schema for note stored in MongoDB"""
    user_id: str
    title: str
    content: str = ""
    tags: list[str] = []
    category: str = ""
    source: str = "manual"
    summary: str = ""
    used_voice: bool = False
    used_ocr: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
