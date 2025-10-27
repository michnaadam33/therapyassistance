import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { patientsApi } from "@/services/api";
import { PatientFormData } from "@/types";
import { toast } from "react-toastify";

const PatientForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<PatientFormData>>({});
  const [loading, setLoading] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      fetchPatient(parseInt(id));
    }
  }, [isEditMode, id]);

  const fetchPatient = async (patientId: number) => {
    try {
      setLoadingPatient(true);
      const patient = await patientsApi.getById(patientId);
      setFormData({
        name: patient.name,
        phone: patient.phone || "",
        email: patient.email || "",
        notes: patient.notes || "",
      });
    } catch (error) {
      console.error("Error fetching patient:", error);
      toast.error("Błąd podczas pobierania danych pacjenta");
      navigate("/patients");
    } finally {
      setLoadingPatient(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Imię i nazwisko jest wymagane";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Imię i nazwisko musi mieć co najmniej 3 znaki";
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Nieprawidłowy format adresu email";
      }
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "Nieprawidłowy format numeru telefonu";
      } else if (formData.phone.replace(/\D/g, "").length < 9) {
        newErrors.phone = "Numer telefonu musi mieć co najmniej 9 cyfr";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof PatientFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Popraw błędy w formularzu");
      return;
    }

    try {
      setLoading(true);

      const dataToSend: PatientFormData = {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      };

      if (isEditMode && id) {
        await patientsApi.update(parseInt(id), dataToSend);
        toast.success("Dane pacjenta zostały zaktualizowane");
      } else {
        await patientsApi.create(dataToSend);
        toast.success("Pacjent został dodany pomyślnie");
      }

      navigate("/patients");
    } catch (error) {
      console.error("Error saving patient:", error);
      toast.error(
        isEditMode
          ? "Błąd podczas aktualizacji danych pacjenta"
          : "Błąd podczas dodawania pacjenta",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/patients");
  };

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/patients")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Powrót
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edytuj pacjenta" : "Nowy pacjent"}
          </h2>
          <p className="text-sm text-gray-600">
            {isEditMode
              ? "Zaktualizuj dane pacjenta"
              : "Dodaj nowego pacjenta do systemu"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Dane pacjenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Input
                id="name"
                name="name"
                label="Imię i nazwisko *"
                placeholder="np. Jan Kowalski"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                disabled={loading}
                autoFocus
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Adres email"
                placeholder="np. jan.kowalski@email.com"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                disabled={loading}
              />

              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Numer telefonu"
                placeholder="np. +48 123 456 789"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                disabled={loading}
              />

              <Textarea
                id="notes"
                name="notes"
                label="Notatki"
                placeholder="Dodatkowe informacje o pacjencie..."
                value={formData.notes}
                onChange={handleInputChange}
                disabled={loading}
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-500">* Pola wymagane</p>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Anuluj
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditMode ? "Aktualizowanie..." : "Dodawanie..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? "Zaktualizuj" : "Dodaj pacjenta"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientForm;
