import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  CreditCardIcon,
  CashIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { paymentsApi } from '../services/api';
import { PaymentWithPatient } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentWithPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPayment();
    }
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const data = await paymentsApi.getById(parseInt(id!));
      setPayment(data);
    } catch (error) {
      console.error('Error fetching payment:', error);
      toast.error('Błąd podczas pobierania szczegółów płatności');
      navigate('/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!payment) return;

    try {
      await paymentsApi.delete(payment.id);
      navigate('/payments');
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    return method === 'CASH' ? (
      <CashIcon className="h-5 w-5" />
    ) : (
      <CreditCardIcon className="h-5 w-5" />
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    return method === 'CASH' ? 'Gotówka' : 'Przelew';
  };

  if (loading) return <LoadingSpinner />;
  if (!payment) return <div>Płatność nie znaleziona</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Nagłówek */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/payments')}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
              </button>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Szczegóły płatności #{payment.id}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Zarejestrowano {format(new Date(payment.created_at), 'dd MMMM yyyy, HH:mm', { locale: pl })}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/payments/${payment.id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edytuj
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Usuń
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Główne informacje */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informacje o płatności */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Informacje o płatności
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Kwota
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="text-lg font-semibold text-green-600">
                      {formatAmount(payment.amount)}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    {getPaymentMethodIcon(payment.payment_method)}
                    <span className="ml-2">Metoda płatności</span>
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </span>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Data płatności
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(payment.payment_date), 'dd MMMM yyyy, HH:mm', { locale: pl })}
                  </dd>
                </div>
                {payment.description && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Opis
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {payment.description}
                    </dd>
                  </div>
                )}
                {payment.updated_at && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Ostatnia aktualizacja
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {format(new Date(payment.updated_at), 'dd MMMM yyyy, HH:mm', { locale: pl })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Powiązane wizyty */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Opłacone wizyty ({payment.appointments.length})
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {payment.appointments.map((appointment) => (
                  <li key={appointment.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CalendarIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(appointment.date), 'dd MMMM yyyy', { locale: pl })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.start_time} - {appointment.end_time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {appointment.is_paid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Opłacona
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Nieopłacona
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Panel boczny z informacjami o pacjencie */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Pacjent
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Imię i nazwisko</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <Link
                      to={`/patients/${payment.patient_id}`}
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {payment.patient_name}
                    </Link>
                  </dd>
                </div>
                {payment.patient_email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a
                        href={`mailto:${payment.patient_email}`}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        {payment.patient_email}
                      </a>
                    </dd>
                  </div>
                )}
                {payment.patient_phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a
                        href={`tel:${payment.patient_phone}`}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        {payment.patient_phone}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-4">
                <Link
                  to={`/patients/${payment.patient_id}`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Zobacz profil pacjenta
                </Link>
              </div>
            </div>
          </div>
        </div>
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
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Usuń płatność
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Czy na pewno chcesz usunąć tę płatność? Powiązane wizyty zostaną oznaczone jako nieopłacone.
                        Ta operacja nie może zostać cofnięta.
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
                  onClick={() => setShowDeleteModal(false)}
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

export default PaymentDetail;
