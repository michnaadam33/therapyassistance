import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  DollarSign,
  User,
  Calendar,
  CreditCard,
  Banknote,
  FileText,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { paymentsApi, patientsApi, appointmentsApi } from "../services/api";
import { Patient, Appointment, PaymentFormData } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const PaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [unpaidAppointments, setUnpaidAppointments] = useState<Appointment[]>(
    [],
  );
  const [formData, setFormData] = useState<PaymentFormData>({
    patient_id: 0,
    amount: 0,
    payment_method: "CASH",
    appointment_ids: [],
    payment_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    description: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.patient_id) {
      fetchUnpaidAppointments();
    } else {
      setUnpaidAppointments([]);
    }
  }, [formData.patient_id]);

  useEffect(() => {
    // Automatyczne obliczanie kwoty na podstawie wybranych wizyt
    if (formData.appointment_ids.length > 0) {
      const selectedAppointments = unpaidAppointments.filter((apt) =>
        formData.appointment_ids.includes(apt.id),
      );

      // Oblicz sumę cen wizyt (zakładamy że każda wizyta ma cenę)
      const totalAmount = selectedAppointments.reduce(
        (sum, apt) => sum + (apt.price || 0),
        0,
      );

      setFormData((prev) => ({ ...prev, amount: totalAmount }));
    } else {
      setFormData((prev) => ({ ...prev, amount: 0 }));
    }
  }, [formData.appointment_ids, unpaidAppointments]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      const [patientsData, appointmentsData] = await Promise.all([
        patientsApi.getAll(),
        appointmentsApi.getAll(),
      ]);
      setPatients(patientsData);
      setAppointments(appointmentsData);

      if (isEditMode && id) {
        const payment = await paymentsApi.getById(parseInt(id));
        setFormData({
          patient_id: payment.patient_id,
          amount: payment.amount,
          payment_method: payment.payment_method,
          appointment_ids: payment.appointments.map((app) => app.id),
          payment_date: format(
            new Date(payment.payment_date),
            "yyyy-MM-dd'T'HH:mm",
          ),
          description: payment.description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Błąd podczas pobierania danych");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUnpaidAppointments = async () => {
    try {
      const unpaidIds = await paymentsApi.getUnpaidAppointments(
        formData.patient_id,
      );
      const unpaid = appointments.filter(
        (app) =>
          app.patient_id === formData.patient_id && unpaidIds.includes(app.id),
      );
      setUnpaidAppointments(unpaid);
    } catch (error) {
      console.error("Error fetching unpaid appointments:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "patient_id" || name === "amount") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAppointmentToggle = (appointmentId: number) => {
    setFormData((prev) => ({
      ...prev,
      appointment_ids: prev.appointment_ids.includes(appointmentId)
        ? prev.appointment_ids.filter((id) => id !== appointmentId)
        : [...prev.appointment_ids, appointmentId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient_id) {
      toast.error("Wybierz pacjenta");
      return;
    }

    if (formData.appointment_ids.length === 0) {
      toast.error("Wybierz co najmniej jedną wizytę");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("Podaj poprawną kwotę");
      return;
    }

    // Walidacja kwoty względem cen wizyt (zakładamy że każda wizyta ma cenę)
    const selectedAppointments = unpaidAppointments.filter((apt) =>
      formData.appointment_ids.includes(apt.id),
    );

    const totalAppointmentsPrice = selectedAppointments.reduce(
      (sum, apt) => sum + (apt.price || 0),
      0,
    );

    // Sprawdź czy kwota jest wystarczająca
    if (formData.amount < totalAppointmentsPrice) {
      toast.error(
        `Kwota płatności (${formatAmount(formData.amount)}) jest mniejsza niż suma cen wybranych wizyt (${formatAmount(totalAppointmentsPrice)})`,
      );
      return;
    }

    // Ostrzeżenie przy nadpłacie > 20%
    const overpaymentThreshold = totalAppointmentsPrice * 1.2;
    if (formData.amount > overpaymentThreshold) {
      const confirmed = window.confirm(
        `Kwota płatności (${formatAmount(formData.amount)}) jest znacznie wyższa niż suma cen wizyt (${formatAmount(totalAppointmentsPrice)}). Czy na pewno chcesz kontynuować?`,
      );
      if (!confirmed) {
        return;
      }
    }

    setLoading(true);
    try {
      if (isEditMode && id) {
        await paymentsApi.update(parseInt(id), formData);
      } else {
        await paymentsApi.create(formData);
      }
      navigate("/payments");
    } catch (error) {
      console.error("Error saving payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  if (loadingData) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {isEditMode ? "Edytuj płatność" : "Dodaj nową płatność"}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Zarejestruj płatność za jedną lub wiele wizyt
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Wybór pacjenta */}
            <div>
              <label
                htmlFor="patient_id"
                className="block text-sm font-medium text-gray-700"
              >
                <User className="h-4 w-4 inline mr-1" />
                Pacjent
              </label>
              <select
                id="patient_id"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleInputChange}
                disabled={isEditMode}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100"
                required
              >
                <option value="">Wybierz pacjenta</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} {patient.email && `(${patient.email})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista nieopłaconych wizyt */}
            {formData.patient_id > 0 && unpaidAppointments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Wybierz wizyty do opłacenia
                </label>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {unpaidAppointments.map((appointment) => (
                    <label
                      key={appointment.id}
                      className="flex items-center p-3 mb-2 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.appointment_ids.includes(
                          appointment.id,
                        )}
                        onChange={() => handleAppointmentToggle(appointment.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">
                            {format(
                              new Date(appointment.date),
                              "dd MMMM yyyy",
                              {
                                locale: pl,
                              },
                            )}
                          </div>
                          <div className="text-sm font-semibold text-green-600">
                            {formatAmount(appointment.price || 0)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.start_time} - {appointment.end_time}
                          {appointment.notes && ` • ${appointment.notes}`}
                        </div>
                      </div>
                      <div className="ml-2">
                        {formData.appointment_ids.includes(appointment.id) && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                {(() => {
                  const selectedAppointments = unpaidAppointments.filter(
                    (apt) => formData.appointment_ids.includes(apt.id),
                  );
                  const totalPrice = selectedAppointments.reduce(
                    (sum, apt) => sum + (apt.price || 0),
                    0,
                  );

                  return (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">
                        Wybrano {formData.appointment_ids.length} z{" "}
                        {unpaidAppointments.length} nieopłaconych wizyt
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        Suma cen: {formatAmount(totalPrice)}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {formData.patient_id > 0 &&
              unpaidAppointments.length === 0 &&
              !isEditMode && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Ten pacjent nie ma nieopłaconych wizyt.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Kwota */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                <DollarSign className="h-4 w-4 inline mr-1" />
                Kwota (PLN)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
              {formData.amount > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {formatAmount(formData.amount)}
                </p>
              )}
              {(() => {
                if (formData.appointment_ids.length === 0) return null;

                const selectedAppointments = unpaidAppointments.filter((apt) =>
                  formData.appointment_ids.includes(apt.id),
                );
                const totalPrice = selectedAppointments.reduce(
                  (sum, apt) => sum + (apt.price || 0),
                  0,
                );

                const difference = formData.amount - totalPrice;

                if (Math.abs(difference) < 0.01) {
                  return (
                    <p className="mt-1 text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Kwota pokrywa cenę wizyt
                    </p>
                  );
                } else if (difference < 0) {
                  return (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Za mało o {formatAmount(Math.abs(difference))}
                    </p>
                  );
                } else if (difference > totalPrice * 0.2) {
                  return (
                    <p className="mt-1 text-sm text-amber-600 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Nadpłata: {formatAmount(difference)}
                    </p>
                  );
                } else {
                  return (
                    <p className="mt-1 text-sm text-blue-600">
                      Nadpłata: {formatAmount(difference)}
                    </p>
                  );
                }
              })()}
            </div>

            {/* Metoda płatności */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metoda płatności
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                  <input
                    type="radio"
                    name="payment_method"
                    value="CASH"
                    checked={formData.payment_method === "CASH"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <span className="flex items-center text-sm font-medium text-gray-900">
                        <Banknote className="h-5 w-5 mr-2 text-green-500" />
                        Gotówka
                      </span>
                    </div>
                  </div>
                  {formData.payment_method === "CASH" && (
                    <CheckCircle className="h-5 w-5 text-indigo-600" />
                  )}
                </label>

                <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                  <input
                    type="radio"
                    name="payment_method"
                    value="TRANSFER"
                    checked={formData.payment_method === "TRANSFER"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <span className="flex items-center text-sm font-medium text-gray-900">
                        <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                        Przelew
                      </span>
                    </div>
                  </div>
                  {formData.payment_method === "TRANSFER" && (
                    <CheckCircle className="h-5 w-5 text-indigo-600" />
                  )}
                </label>
              </div>
            </div>

            {/* Data płatności */}
            <div>
              <label
                htmlFor="payment_date"
                className="block text-sm font-medium text-gray-700"
              >
                <Calendar className="h-4 w-4 inline mr-1" />
                Data i godzina płatności
              </label>
              <input
                type="datetime-local"
                id="payment_date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Opis */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                <FileText className="h-4 w-4 inline mr-1" />
                Opis (opcjonalnie)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Dodatkowe informacje o płatności..."
              />
            </div>
          </div>

          {/* Przyciski akcji */}
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={() => navigate("/payments")}
              className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading
                ? "Zapisywanie..."
                : isEditMode
                  ? "Zaktualizuj"
                  : "Dodaj płatność"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
