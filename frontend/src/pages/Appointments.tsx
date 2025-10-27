import React, { useState, useEffect } from "react";
import { Plus, Calendar, List, Filter } from "lucide-react";
import AppointmentCalendar from "../components/AppointmentCalendar";
import AppointmentForm from "../components/AppointmentForm";
import { appointmentsApi, patientsApi } from "../services/api";
import { Appointment, Patient } from "../types";
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

const Appointments: React.FC = () => {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<any>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [_appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    nextAppointment: null as Appointment | null,
    nextAppointmentPatient: null as Patient | null,
  });

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    try {
      const [appointmentsData, patientsData] = await Promise.all([
        appointmentsApi.getAll(),
        patientsApi.getAll(),
      ]);
      setAppointments(appointmentsData);
      setPatients(patientsData);
      calculateStats(appointmentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const calculateStats = (appointmentsList: Appointment[]) => {
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

    const futureAppointments = appointmentsList
      .filter((apt) => {
        const aptDate = parseISO(apt.date);
        return isToday(aptDate) || isFuture(aptDate);
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.start_time.localeCompare(b.start_time);
      });

    setStats({
      todayCount: todayAppointments.length,
      weekCount: weekAppointments.length,
      monthCount: monthAppointments.length,
      nextAppointment: futureAppointments[0] || null,
      nextAppointmentPatient: null,
    });
  };

  useEffect(() => {
    if (stats.nextAppointment && patients.length > 0) {
      const patient = patients.find(
        (p) => p.id === stats.nextAppointment?.patient_id,
      );
      setStats((prev) => ({
        ...prev,
        nextAppointmentPatient: patient || null,
      }));
    }
  }, [stats.nextAppointment, patients]);

  const handleAddAppointment = () => {
    setSelectedAppointment(undefined);
    setShowAppointmentForm(true);
  };

  const handleCloseForm = () => {
    setShowAppointmentForm(false);
    setSelectedAppointment(undefined);
  };

  const handleFormSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    handleCloseForm();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-500" />
              Wizyty
            </h1>
            <p className="text-gray-600 mt-1">
              Zarządzaj harmonogramem wizyt pacjentów
            </p>
          </div>

          <button
            onClick={handleAddAppointment}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            Nowa wizyta
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Dzisiejsze wizyty</div>
          <div className="text-2xl font-bold text-gray-800">
            {stats.todayCount}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Wizyty w tym tygodniu</div>
          <div className="text-2xl font-bold text-gray-800">
            {stats.weekCount}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Wizyty w tym miesiącu</div>
          <div className="text-2xl font-bold text-gray-800">
            {stats.monthCount}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Najbliższa wizyta</div>
          <div className="text-sm font-semibold text-blue-600">
            {stats.nextAppointment ? (
              <>
                <div>
                  {format(parseISO(stats.nextAppointment.date), "dd.MM.yyyy")}
                </div>
                <div className="text-xs">
                  {stats.nextAppointment.start_time.slice(0, 5)}
                  {stats.nextAppointmentPatient && (
                    <span className="ml-1">
                      - {stats.nextAppointmentPatient.name}
                    </span>
                  )}
                </div>
              </>
            ) : (
              "-"
            )}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div key={refreshKey}>
        <AppointmentCalendar />
      </div>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <AppointmentForm
          appointment={selectedAppointment}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Additional Features Section */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Dodatkowe funkcje</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="text-blue-500" size={20} />
              <h3 className="font-semibold">Filtrowanie</h3>
            </div>
            <p className="text-sm text-gray-600">
              Filtruj wizyty według pacjenta, daty lub statusu
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <List className="text-green-500" size={20} />
              <h3 className="font-semibold">Widok listy</h3>
            </div>
            <p className="text-sm text-gray-600">
              Przełącz na widok listy wszystkich wizyt
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-purple-500" size={20} />
              <h3 className="font-semibold">Eksport</h3>
            </div>
            <p className="text-sm text-gray-600">
              Eksportuj harmonogram do formatu PDF lub CSV
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
