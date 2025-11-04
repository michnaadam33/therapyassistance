import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  Edit,
  Trash2,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import AppointmentForm from "../components/AppointmentForm";
import { appointmentsApi, patientsApi, paymentsApi } from "../services/api";
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

    // Sort by date and time (most recent first)
    return filtered.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.start_time.localeCompare(a.start_time);
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Dzisiaj</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.todayCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Ten tydzień</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.weekCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Ten miesiąc</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.monthCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Opłacone</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.paidCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Nieopłacone</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.unpaidCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Przychód</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalRevenue} zł
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
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
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    appointment.is_paid
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Main Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {appointment.patient?.name || "Nieznany pacjent"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          {formatDate(appointment.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          {formatTime(appointment.start_time)} -{" "}
                          {formatTime(appointment.end_time)}
                        </span>
                      </div>

                      {appointment.price && (
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {appointment.price} zł
                          </span>
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Notatki:</span>{" "}
                          {appointment.notes}
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Payment Status Badge */}
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.is_paid
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {appointment.is_paid ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Opłacona
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Nieopłacona
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {!appointment.is_paid && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleTogglePaid(appointment)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Oznacz jako opłaconą
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDeleteAppointment(appointment.id)
                          }
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
    </div>
  );
};

export default Appointments;
