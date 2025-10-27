import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  ClipboardList,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { patientsApi, appointmentsApi, sessionNotesApi } from "@/services/api";
import { Patient, Appointment, SessionNote } from "@/types";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import { toast } from "react-toastify";

const PatientDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPatientData(parseInt(id));
    }
  }, [id]);

  const fetchPatientData = async (patientId: number) => {
    try {
      setLoading(true);
      const [patientData, appointmentsData, notesData] = await Promise.all([
        patientsApi.getById(patientId),
        appointmentsApi.getAll(),
        sessionNotesApi.getByPatient(patientId),
      ]);

      setPatient(patientData);
      // Filter appointments for this patient
      const patientAppointments = appointmentsData.filter(
        (apt) => apt.patient_id === patientId,
      );
      setAppointments(
        patientAppointments.sort(
          (a, b) =>
            new Date(b.date + " " + b.start_time).getTime() -
            new Date(a.date + " " + a.start_time).getTime(),
        ),
      );
      setSessionNotes(
        notesData.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      );
    } catch (error) {
      console.error("Error fetching patient data:", error);
      toast.error("Błąd podczas pobierania danych pacjenta");
      navigate("/patients");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!patient) return;

    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć pacjenta ${patient.name}? Ta operacja jest nieodwracalna i usunie również wszystkie powiązane wizyty i notatki.`,
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await patientsApi.delete(patient.id);
      toast.success("Pacjent został usunięty");
      navigate("/patients");
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Błąd podczas usuwania pacjenta");
    } finally {
      setDeleting(false);
    }
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter((apt) => {
        const aptDate = new Date(apt.date + " " + apt.start_time);
        return aptDate >= now;
      })
      .slice(0, 3);
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments
      .filter((apt) => {
        const aptDate = new Date(apt.date + " " + apt.start_time);
        return aptDate < now;
      })
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nie znaleziono pacjenta</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate("/patients")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do listy pacjentów
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/patients")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Powrót
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Szczegóły pacjenta
            </h2>
            <p className="text-sm text-gray-600">
              Pełne informacje o pacjencie
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => navigate(`/patients/${patient.id}/edit`)}
            disabled={deleting}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edytuj
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Usuwanie...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Usuń
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Informacje o pacjencie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {getInitials(patient.name)}
                </span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Imię i nazwisko
                </p>
                <p className="mt-1 text-lg font-semibold">{patient.name}</p>
              </div>
              {patient.email && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {patient.email}
                  </p>
                </div>
              )}
              {patient.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefon</p>
                  <p className="mt-1 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {patient.phone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Data dodania
                </p>
                <p className="mt-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(patient.created_at)}
                </p>
              </div>
            </div>
          </div>
          {patient.notes && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-2">Notatki</p>
              <p className="text-gray-700 whitespace-pre-wrap">
                {patient.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <ClipboardList className="h-5 w-5 mr-2" />
                Nadchodzące wizyty
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/appointments/new")}
              >
                Dodaj wizytę
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getUpcomingAppointments().length > 0 ? (
              <div className="space-y-3">
                {getUpcomingAppointments().map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {formatDate(appointment.date)}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(appointment.start_time)} -{" "}
                          {formatTime(appointment.end_time)}
                        </p>
                      </div>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                ))}
                {appointments.filter(
                  (apt) =>
                    new Date(apt.date + " " + apt.start_time) >= new Date(),
                ).length > 3 && (
                  <Button
                    variant="link"
                    className="w-full"
                    onClick={() => navigate("/appointments")}
                  >
                    Zobacz wszystkie (
                    {
                      appointments.filter(
                        (apt) =>
                          new Date(apt.date + " " + apt.start_time) >=
                          new Date(),
                      ).length
                    }
                    )
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Brak zaplanowanych wizyt
              </p>
            )}
          </CardContent>
        </Card>

        {/* Session Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Ostatnie notatki
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/notes/${patient.id}`)}
              >
                Wszystkie notatki
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionNotes.length > 0 ? (
              <div className="space-y-3">
                {sessionNotes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className="p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <p className="text-sm text-gray-500 mb-1">
                      {formatDate(note.created_at)}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {note.content}
                    </p>
                  </div>
                ))}
                {sessionNotes.length > 3 && (
                  <Button
                    variant="link"
                    className="w-full"
                    onClick={() => navigate(`/notes/${patient.id}`)}
                  >
                    Zobacz wszystkie ({sessionNotes.length})
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Brak notatek z sesji
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Past Appointments */}
      {getPastAppointments().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Historia wizyt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getPastAppointments().map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/appointments/${appointment.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {formatDate(appointment.date)}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(appointment.start_time)} -{" "}
                        {formatTime(appointment.end_time)}
                      </p>
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {appointment.notes}
                    </p>
                  )}
                </div>
              ))}
              {appointments.filter(
                (apt) => new Date(apt.date + " " + apt.start_time) < new Date(),
              ).length > 3 && (
                <Button
                  variant="link"
                  className="w-full"
                  onClick={() => navigate("/appointments")}
                >
                  Zobacz całą historię (
                  {
                    appointments.filter(
                      (apt) =>
                        new Date(apt.date + " " + apt.start_time) < new Date(),
                    ).length
                  }
                  )
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientDetail;
