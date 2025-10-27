import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "react-toastify";
import {
  Plus,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  Banknote,
  Trash2,
  Eye,
} from "lucide-react";
import { paymentsApi, patientsApi } from "../services/api";
import { PaymentWithPatient, Patient, PaymentStatistics } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentWithPatient[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [filters, setFilters] = useState({
    patient_id: "",
    date_from: "",
    date_to: "",
    payment_method: "",
  });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);

  const itemsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, [currentPage, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Pobierz płatności
      const paymentsParams: any = {
        skip: currentPage * itemsPerPage,
        limit: itemsPerPage,
      };

      if (filters.patient_id) {
        paymentsParams.patient_id = parseInt(filters.patient_id);
      }
      if (filters.date_from) {
        paymentsParams.date_from = filters.date_from;
      }
      if (filters.date_to) {
        paymentsParams.date_to = filters.date_to;
      }
      if (filters.payment_method) {
        paymentsParams.payment_method = filters.payment_method;
      }

      const [paymentsData, patientsData, statsData] = await Promise.all([
        paymentsApi.getAll(paymentsParams),
        patientsApi.getAll(),
        paymentsApi.getStatistics({
          date_from: filters.date_from,
          date_to: filters.date_to,
        }),
      ]);

      setPayments(paymentsData.payments);
      setTotalCount(paymentsData.total);
      setPatients(patientsData);
      setStatistics(statsData);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Błąd podczas pobierania płatności");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(0); // Reset do pierwszej strony przy zmianie filtrów
  };

  const handleDelete = async () => {
    if (!paymentToDelete) return;

    try {
      await paymentsApi.delete(paymentToDelete);
      setShowDeleteModal(false);
      setPaymentToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    return method === "CASH" ? (
      <Banknote className="h-4 w-4 inline mr-1" />
    ) : (
      <CreditCard className="h-4 w-4 inline mr-1" />
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    return method === "CASH" ? "Gotówka" : "Przelew";
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Nagłówek i statystyki */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Płatności</h1>
          <Link
            to="/payments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Dodaj płatność
          </Link>
        </div>

        {/* Statystyki */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Łączna kwota</p>
                  <p className="text-xl font-semibold">
                    {formatAmount(statistics.total_amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {statistics.total_payments} płatności
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Banknote className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Gotówka</p>
                  <p className="text-xl font-semibold">
                    {formatAmount(statistics.cash_amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {statistics.cash_count} płatności
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Przelewy</p>
                  <p className="text-xl font-semibold">
                    {formatAmount(statistics.transfer_amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {statistics.transfer_count} płatności
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtry */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Filtry</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="patient_id"
              className="block text-sm font-medium text-gray-700"
            >
              Pacjent
            </label>
            <select
              id="patient_id"
              name="patient_id"
              value={filters.patient_id}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Wszyscy pacjenci</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="date_from"
              className="block text-sm font-medium text-gray-700"
            >
              Data od
            </label>
            <input
              type="date"
              id="date_from"
              name="date_from"
              value={filters.date_from}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="date_to"
              className="block text-sm font-medium text-gray-700"
            >
              Data do
            </label>
            <input
              type="date"
              id="date_to"
              name="date_to"
              value={filters.date_to}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="payment_method"
              className="block text-sm font-medium text-gray-700"
            >
              Metoda płatności
            </label>
            <select
              id="payment_method"
              name="payment_method"
              value={filters.payment_method}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Wszystkie metody</option>
              <option value="CASH">Gotówka</option>
              <option value="TRANSFER">Przelew</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela płatności */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pacjent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kwota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metoda
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wizyt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opis
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Akcje</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {format(
                      new Date(payment.payment_date),
                      "dd.MM.yyyy HH:mm",
                      { locale: pl },
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.patient_name}
                      </div>
                      {payment.patient_email && (
                        <div className="text-xs text-gray-500">
                          {payment.patient_email}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-green-600">
                    {formatAmount(payment.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {getPaymentMethodIcon(payment.payment_method)}
                    {getPaymentMethodLabel(payment.payment_method)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {payment.appointments.length}{" "}
                    {payment.appointments.length === 1 ? "wizyta" : "wizyt"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {payment.description ? (
                    <span className="truncate max-w-xs inline-block">
                      {payment.description}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      to={`/payments/${payment.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => {
                        setPaymentToDelete(payment.id);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginacja */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Poprzednia
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Następna
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Wyświetlanie{" "}
                  <span className="font-medium">
                    {currentPage * itemsPerPage + 1}
                  </span>{" "}
                  do{" "}
                  <span className="font-medium">
                    {Math.min((currentPage + 1) * itemsPerPage, totalCount)}
                  </span>{" "}
                  z <span className="font-medium">{totalCount}</span> wyników
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Poprzednia
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(totalPages - 1, prev + 1),
                      )
                    }
                    disabled={currentPage === totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Następna
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal potwierdzenia usunięcia */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Usuń płatność
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Czy na pewno chcesz usunąć tę płatność? Powiązane wizyty
                        zostaną oznaczone jako nieopłacone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Usuń
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPaymentToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
