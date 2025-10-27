import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  FileText,
  Home,
  LogOut,
  Menu,
  X,
  User,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Pacjenci",
    href: "/patients",
    icon: Users,
  },
  {
    title: "Wizyty",
    href: "/appointments",
    icon: Calendar,
  },
  {
    title: "Płatności",
    href: "/payments",
    icon: CreditCard,
  },
];

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="sr-only">Otwórz menu</span>
          {sidebarOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <span className="font-semibold text-primary">
              TherapyAssistance
            </span>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-primary">
              TherapyAssistance
            </h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navItems.map((item) => (
                    <li key={item.title}>
                      <Link
                        to={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                          isActive(item.href)
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:text-primary hover:bg-gray-50",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-6 w-6 shrink-0",
                            isActive(item.href)
                              ? "text-white"
                              : "text-gray-400",
                          )}
                          aria-hidden="true"
                        />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => navigate("/notes")}
                      className={cn(
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors w-full",
                        isActive("/notes")
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:text-primary hover:bg-gray-50",
                      )}
                    >
                      <FileText
                        className={cn(
                          "h-6 w-6 shrink-0",
                          isActive("/notes") ? "text-white" : "text-gray-400",
                        )}
                        aria-hidden="true"
                      />
                      Notatki
                    </button>
                  </li>
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="flex-1 truncate">{user?.email}</span>
                </div>
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Wyloguj
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/80"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Zamknij menu</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <h1 className="text-xl font-bold text-primary">
                    TherapyAssistance
                  </h1>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navItems.map((item) => (
                          <li key={item.title}>
                            <Link
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                                isActive(item.href)
                                  ? "bg-primary text-white"
                                  : "text-gray-700 hover:text-primary hover:bg-gray-50",
                              )}
                            >
                              <item.icon
                                className={cn(
                                  "h-6 w-6 shrink-0",
                                  isActive(item.href)
                                    ? "text-white"
                                    : "text-gray-400",
                                )}
                                aria-hidden="true"
                              />
                              {item.title}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <button
                            onClick={() => {
                              navigate("/notes");
                              setSidebarOpen(false);
                            }}
                            className={cn(
                              "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full",
                              isActive("/notes")
                                ? "bg-primary text-white"
                                : "text-gray-700 hover:text-primary hover:bg-gray-50",
                            )}
                          >
                            <FileText
                              className={cn(
                                "h-6 w-6 shrink-0",
                                isActive("/notes")
                                  ? "text-white"
                                  : "text-gray-400",
                              )}
                              aria-hidden="true"
                            />
                            Notatki
                          </button>
                        </li>
                      </ul>
                    </li>
                    <li className="mt-auto">
                      <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="flex-1 truncate">{user?.email}</span>
                      </div>
                      <Button
                        onClick={() => {
                          logout();
                          setSidebarOpen(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-gray-700 hover:text-primary hover:bg-gray-50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Wyloguj
                      </Button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
