import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { patientsApi } from "@/services/api";
import { Patient } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "react-toastify";

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter((patient) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        patient.name.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.phone?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientsApi.getAll();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Błąd podczas pobierania listy pacjentów");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (id: number, name: string) => {
    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć pacjenta ${name}? Ta operacja jest nieodwracalna.`,
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);
      await patientsApi.delete(id);
      toast.success("Pacjent został usunięty");
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Błąd podczas usuwania pacjenta");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pacjenci</h2>
          <p className="mt-1 text-sm text-gray-600">
            Zarządzaj listą swoich pacjentów
          </p>
        </div>
        <Link to="/patients/new">
          <Button className="mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj pacjenta
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Szukaj po nazwisku, emailu lub telefonie..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {getInitials(patient.name)}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {patient.name}
                      </h3>
                      <div className="mt-1 space-y-1">
                        {patient.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="mr-1 h-3 w-3" />
                            <span className="truncate">{patient.email}</span>
                          </div>
                        )}
                        {patient.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="mr-1 h-3 w-3" />
                            {patient.phone}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1 h-3 w-3" />
                          Dodano: {formatDate(patient.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {patient.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {patient.notes}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Szczegóły
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/notes/${patient.id}`)}
                  >
                    <FileText className="mr-1 h-3 w-3" />
                    Notatki
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/patients/${patient.id}/edit`)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeletePatient(patient.id, patient.name)
                    }
                    disabled={deletingId === patient.id}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {searchQuery ? "Brak wyników wyszukiwania" : "Brak pacjentów"}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {searchQuery
                  ? "Spróbuj zmienić kryteria wyszukiwania"
                  : "Zacznij dodając swojego pierwszego pacjenta"}
              </p>
              {!searchQuery && (
                <Link to="/patients/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj pierwszego pacjenta
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {patients.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Łącznie pacjentów:{" "}
                <span className="font-semibold">{patients.length}</span>
              </div>
              {searchQuery && (
                <div className="text-sm text-gray-600">
                  Znaleziono:{" "}
                  <span className="font-semibold">
                    {filteredPatients.length}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Patients;
