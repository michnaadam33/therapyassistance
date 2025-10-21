"""
API routers for TherapyAssistance backend.
"""

from app.routers import auth, patients, appointments, session_notes

__all__ = [
    "auth",
    "patients",
    "appointments",
    "session_notes",
]
