import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import {
  AuthResponse,
  LoginData,
  RegisterData,
  User,
  Patient,
  PatientFormData,
  Appointment,
  AppointmentFormData,
  SessionNote,
  SessionNoteFormData,
  ApiError,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      toast.error('Sesja wygasła. Zaloguj się ponownie.');
    } else if (error.response?.data?.detail) {
      toast.error(error.response.data.detail);
    } else {
      toast.error('Wystąpił błąd. Spróbuj ponownie.');
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    const response = await api.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },
};

// Patients endpoints
export const patientsApi = {
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get<Patient[]>('/patients');
    return response.data;
  },

  getById: async (id: number): Promise<Patient> => {
    const response = await api.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  create: async (data: PatientFormData): Promise<Patient> => {
    const response = await api.post<Patient>('/patients', data);
    return response.data;
  },

  update: async (id: number, data: Partial<PatientFormData>): Promise<Patient> => {
    const response = await api.put<Patient>(`/patients/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },
};

// Appointments endpoints
export const appointmentsApi = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
  },

  getById: async (id: number): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  create: async (data: AppointmentFormData): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  update: async (id: number, data: Partial<AppointmentFormData>): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },
};

// Session notes endpoints
export const sessionNotesApi = {
  getByPatient: async (patientId: number): Promise<SessionNote[]> => {
    const response = await api.get<SessionNote[]>(`/session_notes/${patientId}`);
    return response.data;
  },

  create: async (data: SessionNoteFormData): Promise<SessionNote> => {
    const response = await api.post<SessionNote>('/session_notes', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/session_notes/${id}`);
  },
};

export default api;
