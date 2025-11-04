from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.session_note import SessionNote
from app.models.patient import Patient
from app.models.user import User
from app.schemas.session_note import (
    SessionNote as SessionNoteSchema,
    SessionNoteCreate,
    SessionNoteUpdate,
)

router = APIRouter(prefix="/session_notes", tags=["session_notes"])


@router.get("/", response_model=List[SessionNoteSchema])
def get_all_session_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Pobierz wszystkie notatki z sesji
    """
    session_notes = (
        db.query(SessionNote)
        .order_by(SessionNote.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return session_notes


@router.get("/{patient_id}", response_model=List[SessionNoteSchema])
def get_session_notes(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Pobierz notatki z sesji dla konkretnego pacjenta
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pacjent nie został znaleziony",
        )

    session_notes = (
        db.query(SessionNote)
        .filter(SessionNote.patient_id == patient_id)
        .order_by(SessionNote.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return session_notes


@router.post("/", response_model=SessionNoteSchema)
def create_session_note(
    note_data: SessionNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Utwórz nową notatkę z sesji
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == note_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pacjent nie został znaleziony",
        )

    db_note = SessionNote(**note_data.dict())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/note/{note_id}", response_model=SessionNoteSchema)
def get_session_note_by_id(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Pobierz konkretną notatkę po ID
    """
    note = db.query(SessionNote).filter(SessionNote.id == note_id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notatka nie została znaleziona",
        )
    return note


@router.put("/note/{note_id}", response_model=SessionNoteSchema)
def update_session_note(
    note_id: int,
    note_data: SessionNoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Zaktualizuj notatkę z sesji
    """
    note = db.query(SessionNote).filter(SessionNote.id == note_id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notatka nie została znaleziona",
        )

    note.content = note_data.content
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}")
def delete_session_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Usuń notatkę z sesji
    """
    note = db.query(SessionNote).filter(SessionNote.id == note_id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notatka nie została znaleziona",
        )

    db.delete(note)
    db.commit()
    return {"detail": "Notatka została usunięta"}
