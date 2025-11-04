import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  UserCheck,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { patientsApi, appointmentsApi } from "@/services/api";
import { Patient } from "@/types";
import { toast } from "react-toastify";
import AppointmentCalendar from "@/components/AppointmentCalendar";

interface Stats {
  totalPatients: number;
  todayAppointments: number;
  weekAppointments: number;
  recentNotes: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    todayAppointments: 0,
    weekAppointments: 0,
    recentNotes: 0,
  });
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch patients
      const patients = await patientsApi.getAll();
      setRecentPatients(patients.slice(0, 5));

      // Fetch appointments
      const appointments = await appointmentsApi.getAll();

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split("T")[0];

      const todayAppts = appointments.filter((app) => app.date === today);
      const weekAppts = appointments.filter(
        (app) => app.date >= today && app.date <= nextWeekStr,
      );

      setStats({
        totalPatients: patients.length,
        todayAppointments: todayAppts.length,
        weekAppointments: weekAppts.length,
        recentNotes: 0, // This would need a notes endpoint
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Błąd podczas pobierania danych");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Wszyscy pacjenci",
      value: stats.totalPatients,
      icon: Users,
      color: "text-blue-600 bg-blue-100",
      link: "/patients",
    },
    {
      title: "Wizyty dzisiaj",
      value: stats.todayAppointments,
      icon: Calendar,
      color: "text-green-600 bg-green-100",
      link: "/appointments",
    },
    {
      title: "Wizyty w tym tygodniu",
      value: stats.weekAppointments,
      icon: CalendarDays,
      color: "text-purple-600 bg-purple-100",
      link: "/appointments",
    },
    {
      title: "Ostatnie notatki",
      value: stats.recentNotes,
      icon: FileText,
      color: "text-orange-600 bg-orange-100",
      link: "/notes",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-full p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar - takes up 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Kalendarz wizyt
              </CardTitle>
              <Link to="/appointments">
                <Button variant="ghost" size="sm">
                  Zarządzaj wizytami
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <AppointmentCalendar />
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients - takes up 1 column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Ostatni pacjenci
            </CardTitle>
            <Link to="/patients">
              <Button variant="ghost" size="sm">
                Zobacz wszystkich
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentPatients.length > 0 ? (
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {patient.email || "Brak emaila"}
                        </p>
                      </div>
                    </div>
                    <Link to={`/patients/${patient.id}`}>
                      <Button variant="ghost" size="sm">
                        Profil
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Brak pacjentów</p>
                <Link to="/patients/new" className="mt-3">
                  <Button size="sm">Dodaj pacjenta</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Szybkie akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/patients/new">
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Nowy pacjent
              </Button>
            </Link>
            <Link to="/appointments/new">
              <Button className="w-full" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Nowa wizyta
              </Button>
            </Link>
            <Link to="/notes">
              <Button className="w-full" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Nowa notatka
              </Button>
            </Link>
            <Link to="/patients">
              <Button className="w-full" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Raporty
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
