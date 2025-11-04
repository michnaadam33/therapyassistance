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
  session_note_id?: number;
  is_paid: boolean;
  price?: number;
  created_at: string;
}

export interface AppointmentFormData {
  patient_id: number;
  date: string;
  start_time: string;
  end_time: string;
  session_note_id?: number;
  is_paid?: boolean;
  price?: number;
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

export type PaymentMethod = "CASH" | "TRANSFER";

export interface Payment {
  id: number;
  patient_id: number;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  description?: string;
  created_at: string;
  updated_at?: string;
  appointments: AppointmentInPayment[];
}

export interface AppointmentInPayment {
  id: number;
  patient_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_paid: boolean;
  price?: number;
}

export interface PaymentWithPatient extends Payment {
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
}

export interface PaymentFormData {
  patient_id: number;
  amount: number;
  payment_method: PaymentMethod;
  appointment_ids: number[];
  payment_date?: string;
  description?: string;
}

export interface PaymentListResponse {
  total: number;
  payments: PaymentWithPatient[];
}

export interface PaymentStatistics {
  total_payments: number;
  total_amount: number;
  cash_amount: number;
  transfer_amount: number;
  cash_count: number;
  transfer_count: number;
}
