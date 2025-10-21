from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SessionNoteBase(BaseModel):
    patient_id: int
    content: str


class SessionNoteCreate(SessionNoteBase):
    pass


class SessionNote(SessionNoteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
