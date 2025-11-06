import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Edit,
  Trash2,
  Filter,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import AppointmentForm from "../components/AppointmentForm";
import QuickSessionNoteForm from "../components/QuickSessionNoteForm";
import {
  appointmentsApi,
  patientsApi,
  paymentsApi,
  sessionNotesApi,
} from "../services/api";
import { Appointment, Patient, PaymentMethod } from "../types";
import { formatDate, formatTime } from "@/lib/utils";
import { toast } from "react-toastify";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isToday,
  isFuture,
  parseISO,
  isWithinInterval,
} from "date-fns";

interface AppointmentWithPatient extends Appointment {
  patient?: Patient;
}

const Appointments: React.FC = () => {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<any>(undefined);
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>(
    [],
  );
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid">(
    "all",
  );
  const [filterDate, setFilterDate] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const [stats, setStats] = useState({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    paidCount: 0,
    unpaidCount: 0,
    totalRevenue: 0,
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAppointment, setPaymentAppointment] =
    useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [showQuickNoteForm, setShowQuickNoteForm] = useState(false);
  const [noteAppointment, setNoteAppointment] =
    useState<AppointmentWithPatient | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, patientsData] = await Promise.all([
        appointmentsApi.getAll(),
        patientsApi.getAll(),
      ]);

      const appointmentsWithPatients = appointmentsData.map((appointment) => ({
        ...appointment,
        patient: patientsData.find((p) => p.id === appointment.patient_id),
      }));

      setAppointments(appointmentsWithPatients);
      setPatients(patientsData);
      calculateStats(appointmentsWithPatients);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Błąd podczas pobierania danych");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointmentsList: AppointmentWithPatient[]) => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const todayAppointments = appointmentsList.filter((apt) =>
      isToday(parseISO(apt.date)),
    );

    const weekAppointments = appointmentsList.filter((apt) => {
      const aptDate = parseISO(apt.date);
      return isWithinInterval(aptDate, { start: weekStart, end: weekEnd });
    });

    const monthAppointments = appointmentsList.filter((apt) => {
      const aptDate = parseISO(apt.date);
      return isWithinInterval(aptDate, { start: monthStart, end: monthEnd });
    });

    const paidAppointments = appointmentsList.filter((apt) => apt.is_paid);
    const unpaidAppointments = appointmentsList.filter((apt) => !apt.is_paid);

    const totalRevenue = paidAppointments.reduce(
      (sum, apt) => sum + (apt.price || 0),
      0,
    );

    setStats({
      todayCount: todayAppointments.length,
      weekCount: weekAppointments.length,
      monthCount: monthAppointments.length,
      paidCount: paidAppointments.length,
      unpaidCount: unpaidAppointments.length,
      totalRevenue,
    });
  };

  const handleAddAppointment = () => {
    setSelectedAppointment(undefined);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleCloseForm = () => {
    setShowAppointmentForm(false);
    setSelectedAppointment(undefined);
  };

  const handleFormSuccess = () => {
    fetchData();
    handleCloseForm();
  };

  const handleTogglePaid = async (appointment: Appointment) => {
    // Oznaczanie jako opłacona - otwórz modal płatności
    setPaymentAppointment(appointment);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentAppointment) return;

    try {
      // Sprawdź czy wizyta ma cenę
      if (!paymentAppointment.price) {
        toast.error(
          "Wizyta nie ma ustawionej ceny. Najpierw edytuj wizytę i dodaj cenę.",
        );
        return;
      }

      // Utwórz płatność
      await paymentsApi.create({
        patient_id: paymentAppointment.patient_id,
        amount: paymentAppointment.price,
        payment_method: paymentMethod,
        appointment_ids: [paymentAppointment.id],
        payment_date: new Date().toISOString(),
        description: `Płatność za wizytę ${formatDate(paymentAppointment.date)}`,
      });

      toast.success("Płatność została zarejestrowana");
      setShowPaymentModal(false);
      setPaymentAppointment(null);
      fetchData();
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Błąd podczas rejestrowania płatności");
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setPaymentAppointment(null);
  };

  const handleAddOrEditNote = async (appointment: AppointmentWithPatient) => {
    setNoteAppointment(appointment);

    // If editing existing note, fetch its content
    if (appointment.session_note_id) {
      try {
        const noteData = await sessionNotesApi.getById(
          appointment.session_note_id,
        );
        setEditingNoteContent(noteData.content);
      } catch (error) {
        toast.error("Błąd podczas pobierania notatki");
        return;
      }
    } else {
      setEditingNoteContent(undefined);
    }

    setShowQuickNoteForm(true);
  };

  const handleQuickNoteSuccess = async (noteId: number) => {
    // Update appointment with the new note (only if it's a new note)
    if (noteAppointment && !noteAppointment.session_note_id) {
      try {
        await appointmentsApi.update(noteAppointment.id, {
          session_note_id: noteId,
        });
        toast.success("Notatka została przypisana do wizyty");
      } catch (error) {
        toast.error("Błąd podczas przypisywania notatki do wizyty");
      }
    }
    fetchData(); // Refresh data
    setShowQuickNoteForm(false);
    setNoteAppointment(null);
  };

  const handleQuickNoteCancel = () => {
    setShowQuickNoteForm(false);
    setNoteAppointment(null);
    setEditingNoteContent(undefined);
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę wizytę?")) {
      return;
    }

    try {
      await appointmentsApi.delete(id);
      toast.success("Wizyta została usunięta");
      fetchData();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Błąd podczas usuwania wizyty");
    }
  };

  const getFilteredAppointments = () => {
    let filtered = [...appointments];

    // Filter by payment status
    if (filterStatus === "paid") {
      filtered = filtered.filter((apt) => apt.is_paid);
    } else if (filterStatus === "unpaid") {
      filtered = filtered.filter((apt) => !apt.is_paid);
    }

    // Filter by date
    const today = new Date();
    if (filterDate === "today") {
      filtered = filtered.filter((apt) => isToday(parseISO(apt.date)));
    } else if (filterDate === "week") {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      filtered = filtered.filter((apt) => {
        const aptDate = parseISO(apt.date);
        return isWithinInterval(aptDate, { start: weekStart, end: weekEnd });
      });
    } else if (filterDate === "month") {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      filtered = filtered.filter((apt) => {
        const aptDate = parseISO(apt.date);
        return isWithinInterval(aptDate, { start: monthStart, end: monthEnd });
      });
    }

    // Sort by date and time (chronologically - newest first)
    return filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return -dateCompare;
      return -a.start_time.localeCompare(b.start_time);
    });
  };

  const filteredAppointments = getFilteredAppointments();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-blue-500" />
            Wizyty
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Zarządzaj wizytami i statusami płatności
          </p>
        </div>
        <Button onClick={handleAddAppointment}>
          <Plus className="mr-2 h-4 w-4" />
          Nowa wizyta
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-gray-600">Dzisiaj</div>
            <div className="text-xl font-bold text-gray-900">
              {stats.todayCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-gray-600">Ten tydzień</div>
            <div className="text-xl font-bold text-gray-900">
              {stats.weekCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-gray-600">Ten miesiąc</div>
            <div className="text-xl font-bold text-gray-900">
              {stats.monthCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-gray-600">Opłacone</div>
            <div className="text-xl font-bold text-green-600">
              {stats.paidCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-gray-600">Nieopłacone</div>
            <div className="text-xl font-bold text-red-600">
              {stats.unpaidCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filtruj:
              </span>
            </div>

            <div className="flex gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <button
                onClick={() => setFilterStatus("all")}
                className={`text-sm px-3 py-1 rounded ${
                  filterStatus === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setFilterStatus("paid")}
                className={`text-sm px-3 py-1 rounded ${
                  filterStatus === "paid"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Opłacone
              </button>
              <button
                onClick={() => setFilterStatus("unpaid")}
                className={`text-sm px-3 py-1 rounded ${
                  filterStatus === "unpaid"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Nieopłacone
              </button>
            </div>

            <div className="flex gap-2">
              <span className="text-sm text-gray-600">Okres:</span>
              <button
                onClick={() => setFilterDate("all")}
                className={`text-sm px-3 py-1 rounded ${
                  filterDate === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setFilterDate("today")}
                className={`text-sm px-3 py-1 rounded ${
                  filterDate === "today"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Dzisiaj
              </button>
              <button
                onClick={() => setFilterDate("week")}
                className={`text-sm px-3 py-1 rounded ${
                  filterDate === "week"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Ten tydzień
              </button>
              <button
                onClick={() => setFilterDate("month")}
                className={`text-sm px-3 py-1 rounded ${
                  filterDate === "month"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Ten miesiąc
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Lista wizyt ({filteredAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length > 0 ? (
            <div className="space-y-1">
              {/* Nagłówek kolumn */}
              <div className="grid grid-cols-12 gap-2 items-center text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2 border-b">
                <div className="col-span-3">Pacjent</div>
                <div className="col-span-2">Data</div>
                <div className="col-span-2">Godziny</div>
                <div className="col-span-1 text-right">Cena</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-3 text-right">Akcje</div>
              </div>

              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`px-3 py-2 rounded border transition-all hover:shadow-md cursor-pointer ${
                    appointment.is_paid
                      ? "border-green-200 bg-green-50/50 hover:bg-green-100/50"
                      : "border-red-200 bg-red-50/50 hover:bg-red-100/50"
                  }`}
                >
                  <div className="grid grid-cols-12 gap-2 items-center text-sm">
                    {/* Pacjent - 3 kolumny */}
                    <div className="col-span-3 flex items-center gap-1.5 min-w-0">
                      <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 truncate">
                        {appointment.patient?.name || "Nieznany"}
                      </span>
                    </div>

                    {/* Data - 2 kolumny */}
                    <div className="col-span-2 text-gray-700 truncate">
                      {formatDate(appointment.date)}
                    </div>

                    {/* Godziny - 2 kolumny */}
                    <div className="col-span-2 flex items-center gap-1 text-gray-700">
                      <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {formatTime(appointment.start_time)}-
                        {formatTime(appointment.end_time)}
                      </span>
                    </div>

                    {/* Cena - 1 kolumna */}
                    <div className="col-span-1 text-gray-700 font-medium text-right">
                      {appointment.price ? `${appointment.price} zł` : "-"}
                    </div>

                    {/* Status - 1 kolumna */}
                    <div className="col-span-1 flex justify-center">
                      {appointment.is_paid ? (
                        <CheckCircle
                          className="h-4 w-4 text-green-600"
                          title="Opłacona"
                        />
                      ) : (
                        <XCircle
                          className="h-4 w-4 text-red-600"
                          title="Nieopłacona"
                        />
                      )}
                    </div>

                    {/* Akcje - 3 kolumny */}
                    <div className="col-span-3 flex items-center justify-end gap-1">
                      {!appointment.is_paid && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleTogglePaid(appointment)}
                          className="bg-green-600 hover:bg-green-700 h-7 px-2 text-xs"
                          title="Oznacz jako opłaconą"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAddOrEditNote(appointment)}
                        className={`h-7 px-2 ${
                          appointment.session_note_id
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        title={
                          appointment.session_note_id
                            ? "Edytuj notatkę"
                            : "Dodaj notatkę"
                        }
                      >
                        <FileText className="h-3 w-3" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAppointment(appointment)}
                        className="h-7 px-2"
                        title="Edytuj wizytę"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50 h-7 px-2"
                        title="Usuń wizytę"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-16 w-16 text-gray-400" />
              <p className="mt-4 text-lg text-gray-600">
                {filterStatus !== "all" || filterDate !== "all"
                  ? "Brak wizyt spełniających wybrane kryteria"
                  : "Brak wizyt"}
              </p>
              <Button onClick={handleAddAppointment} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Dodaj pierwszą wizytę
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <AppointmentForm
          appointment={selectedAppointment}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              Rejestracja płatności
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Pacjent:</p>
                <p className="font-medium">
                  {appointments.find((a) => a.id === paymentAppointment.id)
                    ?.patient?.name || "Nieznany"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Wizyta:</p>
                <p className="font-medium">
                  {formatDate(paymentAppointment.date)}{" "}
                  {formatTime(paymentAppointment.start_time)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Kwota:</p>
                <p className="text-2xl font-bold text-blue-600">
                  {paymentAppointment.price
                    ? `${paymentAppointment.price} zł`
                    : "Brak ceny"}
                </p>
                {!paymentAppointment.price && (
                  <p className="text-xs text-red-600 mt-1">
                    Musisz najpierw ustawić cenę wizyty
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metoda płatności:
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentMethod("CASH")}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === "CASH"
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    💵 Gotówka
                  </button>
                  <button
                    onClick={() => setPaymentMethod("TRANSFER")}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === "TRANSFER"
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    🏦 Przelew
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handlePaymentCancel}
                variant="outline"
                className="flex-1"
              >
                Anuluj
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={!paymentAppointment.price}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Potwierdź płatność
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Note Form Modal */}
      {showQuickNoteForm && noteAppointment && (
        <QuickSessionNoteForm
          patientId={noteAppointment.patient_id}
          patientName={noteAppointment.patient?.name || "Nieznany pacjent"}
          appointmentId={noteAppointment.id}
          appointmentDate={formatDate(noteAppointment.date)}
          existingNoteId={noteAppointment.session_note_id}
          existingNoteContent={editingNoteContent}
          onClose={handleQuickNoteCancel}
          onSuccess={handleQuickNoteSuccess}
        />
      )}
    </div>
  );
};

export default Appointments;
