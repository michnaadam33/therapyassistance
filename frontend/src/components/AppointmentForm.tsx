import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { X, Calendar, Clock, User, FileText } from "lucide-react";
import { AppointmentFormData, Patient, Appointment } from "../types";
import { appointmentsApi, patientsApi } from "../services/api";
import { toast } from "react-toastify";

interface AppointmentFormProps {
  appointment?: Appointment;
  onClose: () => void;
  onSuccess: () => void;
  preselectedDate?: Date;
  preselectedPatientId?: number;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  onClose,
  onSuccess,
  preselectedDate,
  preselectedPatientId,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    defaultValues: appointment
      ? {
          patient_id: appointment.patient_id,
          date: appointment.date,
          start_time: appointment.start_time.slice(0, 5),
          end_time: appointment.end_time.slice(0, 5),
          notes: appointment.notes || "",
        }
      : {
          patient_id: preselectedPatientId || 0,
          date: preselectedDate
            ? format(preselectedDate, "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd"),
          start_time: "09:00",
          end_time: "10:00",
          notes: "",
        },
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await patientsApi.getAll();
      setPatients(data);
    } catch (error) {
      toast.error("Błąd podczas pobierania listy pacjentów");
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setLoading(true);

      // Format time with seconds
      const formattedData = {
        ...data,
        start_time: `${data.start_time}:00`,
        end_time: `${data.end_time}:00`,
      };

      // Validate that end time is after start time
      const startTime = formattedData.start_time;
      const endTime = formattedData.end_time;
      if (startTime >= endTime) {
        toast.error(
          "Czas zakończenia musi być późniejszy niż czas rozpoczęcia",
        );
        return;
      }

      if (appointment) {
        await appointmentsApi.update(appointment.id, formattedData);
        toast.success("Wizyta została zaktualizowana");
      } else {
        await appointmentsApi.create(formattedData);
        toast.success("Wizyta została dodana");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Wystąpił błąd podczas zapisywania wizyty");
      }
    } finally {
      setLoading(false);
    }
  };

  const watchStartTime = watch("start_time");

  // Auto-update end time when start time changes
  useEffect(() => {
    if (!appointment && watchStartTime) {
      const [hours, minutes] = watchStartTime.split(":").map(Number);
      const endHours = hours + 1;
      if (endHours <= 20) {
        setValue(
          "end_time",
          `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
        );
      }
    }
  }, [watchStartTime, appointment, setValue]);

  // Generate time options for select
  const timeOptions = [];
  for (let hour = 7; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      timeOptions.push(time);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {appointment ? "Edytuj wizytę" : "Nowa wizyta"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Pacjent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="inline mr-1" />
              Pacjent *
            </label>
            <select
              {...register("patient_id", {
                required: "Wybierz pacjenta",
                min: { value: 1, message: "Wybierz pacjenta" },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>-- Wybierz pacjenta --</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.patient_id.message}
              </p>
            )}
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="inline mr-1" />
              Data wizyty *
            </label>
            <input
              type="date"
              {...register("date", {
                required: "Wybierz datę wizyty",
              })}
              min={format(new Date(), "yyyy-MM-dd")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Czas rozpoczęcia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock size={16} className="inline mr-1" />
              Godzina rozpoczęcia *
            </label>
            <select
              {...register("start_time", {
                required: "Wybierz godzinę rozpoczęcia",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeOptions.slice(0, -4).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.start_time && (
              <p className="text-red-500 text-sm mt-1">
                {errors.start_time.message}
              </p>
            )}
          </div>

          {/* Czas zakończenia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock size={16} className="inline mr-1" />
              Godzina zakończenia *
            </label>
            <select
              {...register("end_time", {
                required: "Wybierz godzinę zakończenia",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.end_time && (
              <p className="text-red-500 text-sm mt-1">
                {errors.end_time.message}
              </p>
            )}
          </div>

          {/* Notatki */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText size={16} className="inline mr-1" />
              Notatki
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dodatkowe informacje o wizycie..."
            />
          </div>

          {/* Przyciski */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading
                ? "Zapisywanie..."
                : appointment
                  ? "Zapisz zmiany"
                  : "Dodaj wizytę"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
