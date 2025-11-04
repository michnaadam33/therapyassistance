import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { X, FileText, Save } from "lucide-react";
import { SessionNoteFormData } from "../types";
import { sessionNotesApi } from "../services/api";
import { toast } from "react-toastify";

interface QuickSessionNoteFormProps {
  patientId: number;
  patientName: string;
  appointmentId: number;
  appointmentDate: string;
  existingNoteId?: number;
  existingNoteContent?: string;
  onClose: () => void;
  onSuccess: (noteId: number) => void;
}

const QuickSessionNoteForm: React.FC<QuickSessionNoteFormProps> = ({
  patientId,
  patientName,
  appointmentId,
  appointmentDate,
  existingNoteId,
  existingNoteContent,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const isEditMode = !!existingNoteId;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionNoteFormData>({
    defaultValues: {
      patient_id: patientId,
      content: existingNoteContent || "",
    },
  });

  const onSubmit = async (data: SessionNoteFormData) => {
    try {
      setLoading(true);

      if (isEditMode && existingNoteId) {
        // Update existing note
        await sessionNotesApi.update(existingNoteId, data.content);
        toast.success("Notatka została zaktualizowana");
        onSuccess(existingNoteId);
      } else {
        // Create new note
        const newNote = await sessionNotesApi.create(data);
        toast.success("Notatka została utworzona i przypisana do wizyty");
        onSuccess(newNote.id);
      }

      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Wystąpił błąd podczas zapisywania notatki");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditMode
              ? "Edycja notatki z sesji"
              : "Szybkie dodanie notatki z sesji"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info about appointment */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Pacjent:</span> {patientName}
          </p>
          <p className="text-sm text-blue-800 mt-1">
            <span className="font-medium">Data wizyty:</span> {appointmentDate}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            {isEditMode
              ? "Edytujesz notatkę przypisaną do tej wizyty"
              : "Notatka zostanie automatycznie przypisana do tej wizyty"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden patient_id field */}
          <input type="hidden" {...register("patient_id")} value={patientId} />

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treść notatki *
            </label>
            <textarea
              {...register("content", {
                required: "Treść notatki jest wymagana",
                minLength: {
                  value: 10,
                  message: "Notatka powinna mieć co najmniej 10 znaków",
                },
              })}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder={`Przykład:

Sesja #1 - ${appointmentDate}

Główne tematy:
-
-

Obserwacje:
-

Plan na kolejną sesję:
-
-

Zadania domowe:
-
`}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">
                {errors.content.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Możesz używać formatowania markdown w notatce
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading
                ? "Zapisywanie..."
                : isEditMode
                  ? "Zapisz zmiany"
                  : "Zapisz i przypisz do wizyty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickSessionNoteForm;
