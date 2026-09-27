// src/modal/frequenciamodal/FrequenciaModal.js
// Visualização de uma ocorrência de atendimento e registro de presença/ausência/justificativa.
// Cancelar uma ocorrência de uma série recorrente pede o escopo (RB08 / item 16).
import { useState, useEffect } from "react";
import { X, User, FileText, Calendar, Clock, Repeat } from "lucide-react";
import FrequencyService from "../../services/FrequencyService";
import AppointmentService from "../../services/AppointmentService";
import Alert from "../../components/alert/Alert";

const STATUS_OPTIONS = [
  { value: "AGENDADO",    label: "Agendado" },
  { value: "PRESENTE",    label: "Presente" },
  { value: "AUSENTE",     label: "Ausente" },
  { value: "JUSTIFICADO", label: "Justificado" },
  { value: "CANCELADO",   label: "Cancelado" },
];

const STATUS_DOT = {
  AGENDADO: "bg-blue-500", PRESENTE: "bg-green-500", AUSENTE: "bg-red-500",
  JUSTIFICADO: "bg-amber-500", CANCELADO: "bg-gray-400",
};

const SCOPE_OPTIONS = [
  { value: "THIS",      label: "Somente este atendimento" },
  { value: "FROM_HERE", label: "Este e os próximos" },
  { value: "ALL",       label: "Toda a série" },
];

export default function FrequenciaModal({ isOpen, onClose, onSuccess, frequency }) {
  const [status,      setStatus]      = useState("AGENDADO");
  const [observation, setObservation] = useState("");
  const [cancelScope, setCancelScope] = useState("THIS");
  const [saving,      setSaving]      = useState(false);
  const [alert,       setAlert]       = useState(null);

  useEffect(() => {
    if (!isOpen || !frequency) return;
    setStatus(frequency.status || "AGENDADO");
    setObservation(frequency.observation || "");
    setCancelScope("THIS");
    setAlert(null);
  }, [isOpen, frequency]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  if (!isOpen || !frequency) return null;

  const isRecurringSeries = frequency.appointmentType === "RECORRENTE";
  const showScopePicker = status === "CANCELADO";

  const handleSave = async () => {
    setSaving(true);
    try {
      if (status === "CANCELADO") {
        await AppointmentService.cancelar(frequency.appointmentId, {
          scope: isRecurringSeries ? cancelScope : "ALL",
          frequencyId: frequency.id,
        });
      } else {
        await FrequencyService.atualizarStatus(frequency.id, { status, observation });
      }
      onSuccess();
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data || "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center
        justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[frequency.status] || "bg-gray-400"}`} />
            <h2 className="text-sm font-semibold text-gray-900">Atendimento</h2>
            {isRecurringSeries && (
              <span className="text-[11px] px-2 py-0.5 bg-purple-50 text-purple-600
                rounded-full font-medium flex items-center gap-1">
                <Repeat size={10} /> Recorrente
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100
              rounded-lg transition">
            <X size={17} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {alert && (
            <Alert type={alert.type} message={alert.message}
              onClose={() => setAlert(null)} duration={5000} />
          )}

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
            <InfoRow icon={<User size={13} />} label="Paciente" value={frequency.patientName} />
            <InfoRow icon={<FileText size={13} />} label="Ficha" value={frequency.attendanceFormName} />
            <InfoRow icon={<User size={13} />} label="Profissional" value={frequency.professionalName} />
            <InfoRow icon={<Calendar size={13} />} label="Data"
              value={new Date(frequency.scheduledDate + "T00:00:00").toLocaleDateString("pt-BR")} />
            <InfoRow icon={<Clock size={13} />} label="Horário"
              value={frequency.scheduledTime?.slice(0, 5)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <div className="grid grid-cols-1 gap-1.5">
              {STATUS_OPTIONS.map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border-2
                    cursor-pointer transition-all text-sm
                    ${status === opt.value
                      ? "border-primary bg-primary/5 text-gray-800"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                  <input type="radio" name="freq-status" value={opt.value}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value)}
                    className="w-3.5 h-3.5" />
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[opt.value]}`} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {showScopePicker && isRecurringSeries && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-amber-800 mb-2">
                O que deseja cancelar?
              </p>
              <div className="space-y-1.5">
                {SCOPE_OPTIONS.map(opt => (
                  <label key={opt.value}
                    className="flex items-center gap-2 text-xs text-amber-800 cursor-pointer">
                    <input type="radio" name="cancel-scope" value={opt.value}
                      checked={cancelScope === opt.value}
                      onChange={() => setCancelScope(opt.value)}
                      className="w-3.5 h-3.5" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {!showScopePicker && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observação
              </label>
              <textarea value={observation} onChange={e => setObservation(e.target.value)}
                rows={2} placeholder="Observações sobre o atendimento..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                  resize-none focus:outline-none focus:ring-2 focus:ring-primary/30
                  focus:border-primary transition" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-full text-sm
              font-medium text-gray-600 hover:bg-white transition">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-full text-sm
              font-semibold hover:bg-primary/90 transition disabled:opacity-50
              flex items-center gap-2">
            {saving && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white
                rounded-full animate-spin" />
            )}
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <span className="text-gray-500 w-20 flex-shrink-0">{label}:</span>
      <span className="font-medium text-gray-800 truncate">{value}</span>
    </div>
  );
}
