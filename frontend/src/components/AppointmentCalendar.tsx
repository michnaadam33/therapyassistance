import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  addMonths,
  addWeeks,
  addDays,
  subMonths,
  subWeeks,
  subDays,
} from "date-fns";
import { pl } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Plus,
  Trash2,
} from "lucide-react";
import { Appointment, Patient } from "../types";
import { appointmentsApi, patientsApi } from "../services/api";
import { toast } from "react-toastify";
import AppointmentForm from "./AppointmentForm";

interface AppointmentWithPatient extends Appointment {
  patient?: Patient;
}

const AppointmentCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>(
    [],
  );
  const [_patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<
    Appointment | undefined
  >();
  const [formPreselectedDate, setFormPreselectedDate] = useState<
    Date | undefined
  >();

  useEffect(() => {
    fetchAppointmentsAndPatients();
  }, []);

  const fetchAppointmentsAndPatients = async () => {
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
    } catch (error) {
      toast.error("Błąd podczas pobierania danych");
    } finally {
      setLoading(false);
    }
  };

  const getMonthDays = () => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getDayAppointments = (date: Date) => {
    return appointments
      .filter((appointment) => isSameDay(parseISO(appointment.date), date))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const handlePreviousPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę wizytę?")) {
      try {
        await appointmentsApi.delete(id);
        toast.success("Wizyta została usunięta");
        fetchAppointmentsAndPatients();
      } catch (error) {
        toast.error("Błąd podczas usuwania wizyty");
      }
    }
  };

  const handleAddAppointment = (date?: Date) => {
    setEditingAppointment(undefined);
    setFormPreselectedDate(date);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormPreselectedDate(undefined);
    setShowAppointmentForm(true);
  };

  const handleFormSuccess = () => {
    setShowAppointmentForm(false);
    setEditingAppointment(undefined);
    setFormPreselectedDate(undefined);
    fetchAppointmentsAndPatients();
  };

  const renderMonthView = () => {
    const days = getMonthDays();

    return (
      <div className="grid grid-cols-7 gap-1">
        {["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"].map((day) => (
          <div
            key={day}
            className="p-2 text-center font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dayAppointments = getDayAppointments(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(day)}
              className={`
                min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors
                ${!isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"}
                ${isSelected ? "ring-2 ring-blue-500" : ""}
                ${isTodayDate ? "bg-blue-50" : ""}
                hover:bg-gray-100
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm">
                  {format(day, "d")}
                </span>
                {isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddAppointment(day);
                    }}
                    className="opacity-0 hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded"
                    title="Dodaj wizytę"
                  >
                    <Plus size={14} className="text-blue-600" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAppointment(appointment);
                    }}
                    className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                    title={`${appointment.start_time} - ${appointment.patient?.name}`}
                  >
                    {appointment.start_time.slice(0, 5)} -{" "}
                    {appointment.patient?.name}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayAppointments.length - 3} więcej
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays();

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayAppointments = getDayAppointments(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <div key={index} className="border rounded-lg">
              <div
                onClick={() => setSelectedDate(day)}
                className={`
                  p-2 text-center cursor-pointer relative
                  ${isTodayDate ? "bg-blue-100" : "bg-gray-50"}
                  ${isSelected ? "ring-2 ring-blue-500" : ""}
                `}
              >
                <div className="text-sm text-gray-600">
                  {format(day, "EEE", { locale: pl })}
                </div>
                <div className="text-lg font-semibold">{format(day, "d")}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddAppointment(day);
                  }}
                  className="absolute top-2 right-2 p-1 hover:bg-blue-200 rounded opacity-0 hover:opacity-100 transition-opacity"
                  title="Dodaj wizytę"
                >
                  <Plus size={14} className="text-blue-600" />
                </button>
              </div>
              <div className="p-2 space-y-2 min-h-[400px]">
                {dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => handleEditAppointment(appointment)}
                    className="p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">
                        {appointment.start_time.slice(0, 5)} -{" "}
                        {appointment.end_time.slice(0, 5)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAppointment(appointment.id);
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      <User size={12} className="inline mr-1" />
                      {appointment.patient?.name}
                    </div>
                    {appointment.notes && (
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        {appointment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayAppointments = getDayAppointments(currentDate);
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

    return (
      <div className="border rounded-lg">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {format(currentDate, "EEEE, d MMMM yyyy", { locale: pl })}
          </h3>
          <button
            onClick={() => handleAddAppointment(currentDate)}
            className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Plus size={16} />
            Dodaj wizytę
          </button>
        </div>
        <div className="overflow-auto max-h-[600px]">
          {hours.map((hour) => {
            const hourStr = hour.toString().padStart(2, "0");
            const hourAppointments = dayAppointments.filter(
              (app) => parseInt(app.start_time.slice(0, 2)) === hour,
            );

            return (
              <div key={hour} className="flex border-b">
                <div className="w-20 p-2 text-right text-sm text-gray-600 border-r">
                  {hourStr}:00
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {hourAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => handleEditAppointment(appointment)}
                      className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-2 cursor-pointer hover:bg-blue-100"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">
                            <Clock size={14} className="inline mr-1" />
                            {appointment.start_time.slice(0, 5)} -{" "}
                            {appointment.end_time.slice(0, 5)}
                          </div>
                          <div className="text-sm text-gray-700 mt-1">
                            <User size={14} className="inline mr-1" />
                            {appointment.patient?.name}
                          </div>
                          {appointment.notes && (
                            <div className="text-sm text-gray-600 mt-2">
                              {appointment.notes}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAppointment(appointment.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSelectedDateAppointments = () => {
    if (!selectedDate || viewMode !== "month") return null;

    const dayAppointments = getDayAppointments(selectedDate);

    return (
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Wizyty na {format(selectedDate, "d MMMM yyyy", { locale: pl })}
          </h3>
          <button
            onClick={() => handleAddAppointment(selectedDate)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            <Plus size={16} />
            Dodaj wizytę
          </button>
        </div>
        {dayAppointments.length === 0 ? (
          <p className="text-gray-500">Brak wizyt w tym dniu</p>
        ) : (
          <div className="space-y-3">
            {dayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => handleEditAppointment(appointment)}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      <Clock size={16} className="inline mr-2" />
                      {appointment.start_time.slice(0, 5)} -{" "}
                      {appointment.end_time.slice(0, 5)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <User size={14} className="inline mr-2" />
                      {appointment.patient?.name}
                    </div>
                    {appointment.notes && (
                      <div className="text-sm text-gray-500 mt-2">
                        {appointment.notes}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAppointment(appointment.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ładowanie kalendarza...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousPeriod}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {viewMode === "month" &&
              format(currentDate, "MMMM yyyy", { locale: pl })}
            {viewMode === "week" &&
              `Tydzień ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM")} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM yyyy")}`}
            {viewMode === "day" &&
              format(currentDate, "d MMMM yyyy", { locale: pl })}
          </h2>
          <button
            onClick={handleNextPeriod}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded ${viewMode === "month" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Miesiąc
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded ${viewMode === "week" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Tydzień
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded ${viewMode === "day" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Dzień
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Dziś
          </button>

          <button
            onClick={() => handleAddAppointment()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} />
            Nowa wizyta
          </button>
        </div>
      </div>

      {/* Calendar view */}
      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}

      {/* Selected date appointments (only for month view) */}
      {renderSelectedDateAppointments()}

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment}
          onClose={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(undefined);
            setFormPreselectedDate(undefined);
          }}
          onSuccess={handleFormSuccess}
          preselectedDate={formPreselectedDate}
        />
      )}
    </div>
  );
};

export default AppointmentCalendar;
