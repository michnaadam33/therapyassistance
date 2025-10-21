export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Patient {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
}

export interface PatientFormData {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  created_at: string;
}

export interface AppointmentFormData {
  patient_id: number;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface SessionNote {
  id: number;
  patient_id: number;
  content: string;
  created_at: string;
}

export interface SessionNoteFormData {
  patient_id: number;
  content: string;
}

export interface ApiError {
  detail: string;
}
