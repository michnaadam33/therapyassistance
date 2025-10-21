import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, Lock, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { RegisterData } from "@/types";

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
  terms?: boolean;
}

const Register: React.FC = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch("password");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Brain className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            TherapyAssistance
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Utwórz nowe konto terapeuty
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Rejestracja</CardTitle>
            <CardDescription>
              Wypełnij formularz, aby utworzyć nowe konto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    className="pl-10"
                    {...register("email", {
                      required: "Email jest wymagany",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Nieprawidłowy adres email",
                      },
                    })}
                    error={errors.email?.message}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Hasło"
                    className="pl-10"
                    {...register("password", {
                      required: "Hasło jest wymagane",
                      minLength: {
                        value: 6,
                        message: "Hasło musi mieć minimum 6 znaków",
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message:
                          "Hasło musi zawierać małe i duże litery oraz cyfrę",
                      },
                    })}
                    error={errors.password?.message}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Potwierdź hasło"
                    className="pl-10"
                    {...register("confirmPassword", {
                      required: "Potwierdzenie hasła jest wymagane",
                      validate: (value) =>
                        value === password || "Hasła nie są identyczne",
                    })}
                    error={errors.confirmPassword?.message}
                  />
                </div>
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("terms", {
                    required: "Musisz zaakceptować regulamin",
                  })}
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Akceptuję{" "}
                  <a
                    href="#"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    regulamin
                  </a>{" "}
                  i{" "}
                  <a
                    href="#"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    politykę prywatności
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-destructive">
                  {errors.terms.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Rejestrowanie..." : "Zarejestruj się"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Masz już konto?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Zaloguj się
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
