// src/modal/agendamentomodal/AgendamentoModal.js
// Criação de agendamento (único ou recorrente) a partir de uma ficha de atendimento do paciente.
import { useState, useEffect } from "react";
import { X, Search, User, FileText, Repeat, CalendarClock } from "lucide-react";
import RecordService from "../../services/RecordService";
import AppointmentService from "../../services/AppointmentService";
import BuscarPacienteModal from "../buscarpacientemodal/BuscarPacienteModal";
import Alert from "../../components/alert/Alert";

const WEEKDAYS = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

export default function AgendamentoModal({
  isOpen, onClose, onSuccess,
  initialDate,
  initialAttendanceRecordId, initialPatientId, initialPatientName,
}) {
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  const [patient,  setPatient]  = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const [records,         setRecords]         = useState([]);
  const [loadingRecords,  setLoadingRecords]  = useState(false);
  const [attendanceRecordId, setAttendanceRecordId] = useState("");

  const [date, setDate] = useState(initialDate || "");
  const [time, setTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [type, setType] = useState("UNICO"); // UNICO | RECORRENTE
  const [notes, setNotes] = useState("");

  const [frequencyType, setFrequencyType] = useState("DIARIA"); // DIARIA | SEMANAL | MENSAL
  const [daysOfWeek,    setDaysOfWeek]    = useState([]);
  const [startDate,     setStartDate]     = useState(initialDate || "");
  const [endDate,       setEndDate]       = useState("");

  // ── Reset / prefill ao abrir ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setAlert(null);
    setDate(initialDate || "");
    setStartDate(initialDate || "");
    setEndDate("");
    setTime("09:00");
    setDurationMinutes(50);
    setType("UNICO");
    setNotes("");
    setFrequencyType("DIARIA");
    setDaysOfWeek([]);

    if (initialPatientId) {
      setPatient({ id: initialPatientId, name: initialPatientName });
    } else {
      setPatient(null);
      setRecords([]);
      setAttendanceRecordId("");
    }
  }, [isOpen, initialDate, initialPatientId, initialPatientName]);

  // ── Carrega as fichas do paciente selecionado ────────────────────────────────
  useEffect(() => {
    if (!isOpen || !patient?.id) return;
    setLoadingRecords(true);
    RecordService.listarPorPaciente(patient.id)
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setRecords(list);
        if (initialAttendanceRecordId) {
          setAttendanceRecordId(String(initialAttendanceRecordId));
        } else if (list.length > 0) {
          setAttendanceRecordId(String(list[0].id));
        } else {
          setAttendanceRecordId("");
        }
      })
      .catch(() => setRecords([]))
      .finally(() => setLoadingRecords(false));
  }, [isOpen, patient?.id, initialAttendanceRecordId]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  const toggleWeekday = (value) => {
    setDaysOfWeek(prev => prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]);
  };

  const handleSubmit = async () => {
    if (!patient?.id) {
      setAlert({ type: "error", message: "Selecione o paciente." });
      return;
    }
    if (!attendanceRecordId) {
      setAlert({ type: "error", message: "Selecione a ficha de atendimento." });
      return;
    }
    if (!time) {
      setAlert({ type: "error", message: "Informe o horário do atendimento." });
      return;
    }
    if (type === "UNICO" && !date) {
      setAlert({ type: "error", message: "Informe a data do agendamento." });
      return;
    }
    if (type === "RECORRENTE") {
      if (!startDate || !endDate) {
        setAlert({ type: "error", message: "Informe a data inicial e a data final da recorrência." });
        return;
      }
      if (frequencyType === "SEMANAL" && daysOfWeek.length === 0) {
        setAlert({ type: "error", message: "Selecione ao menos um dia da semana." });
        return;
      }
    }

    const payload = {
      attendanceRecordId: Number(attendanceRecordId),
      type,
      time,
      durationMinutes: Number(durationMinutes) || 50,
      notes: notes || null,
      date: type === "UNICO" ? date : undefined,
      recurrence: type === "RECORRENTE" ? {
        frequencyType,
        daysOfWeek: frequencyType === "SEMANAL" ? daysOfWeek : undefined,
        startDate,
        endDate,
      } : undefined,
    };

    setSaving(true);
    try {
      await AppointmentService.criar(payload);
      onSuccess();
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data || "Erro ao criar agendamento." });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center
          justify-center z-50 p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col
          max-h-[92vh] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarClock size={15} className="text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Novo Agendamento</h2>
            </div>
            <button onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100
                rounded-lg transition">
              <X size={17} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {alert && (
              <Alert type={alert.type} message={alert.message}
                onClose={() => setAlert(null)} duration={5000} />
            )}

            {/* Paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente <span className="text-red-500 ml-1">*</span>
              </label>
              {patient ? (
                <div className="flex items-center justify-between border-2 border-primary/20
                  bg-primary/5 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <User size={14} className="text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800 truncate">{patient.name}</span>
                  </div>
                  {!initialPatientId && (
                    <button onClick={() => setSearchOpen(true)}
                      className="text-xs text-primary hover:underline font-medium flex-shrink-0">
                      Trocar
                    </button>
                  )}
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2
                    border-dashed border-gray-200 rounded-xl text-sm text-gray-400
                    hover:border-primary hover:text-primary hover:bg-primary/5 transition
                    font-medium">
                  <Search size={14} /> Selecionar paciente
                </button>
              )}
            </div>

            {/* Ficha de atendimento */}
            {patient && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ficha de atendimento <span className="text-red-500 ml-1">*</span>
                </label>
                {loadingRecords ? (
                  <p className="text-xs text-gray-400">Carregando fichas...</p>
                ) : records.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100
                    rounded-xl px-3 py-2.5">
                    Este paciente ainda não possui fichas de atendimento registradas.
                    Registre uma ficha antes de agendar.
                  </p>
                ) : (
                  <div className="relative">
                    <FileText size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select value={attendanceRecordId}
                      onChange={e => setAttendanceRecordId(e.target.value)}
                      className={inputClass + " pl-9 appearance-none"}>
                      {records.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.templateName} — {r.sessionDate
                            ? new Date(r.sessionDate + "T00:00:00").toLocaleDateString("pt-BR")
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Tipo de agendamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de agendamento
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setType("UNICO")}
                  className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition
                    ${type === "UNICO"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                  Único
                </button>
                <button type="button" onClick={() => setType("RECORRENTE")}
                  className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition
                    flex items-center gap-1.5
                    ${type === "RECORRENTE"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                  <Repeat size={13} /> Recorrente
                </button>
              </div>
            </div>

            {/* Data (único) */}
            {type === "UNICO" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data <span className="text-red-500 ml-1">*</span>
                </label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className={inputClass} />
              </div>
            )}

            {/* Recorrência */}
            {type === "RECORRENTE" && (
              <div className="space-y-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Repetir
                  </label>
                  <select value={frequencyType} onChange={e => setFrequencyType(e.target.value)}
                    className={inputClass}>
                    <option value="DIARIA">Diariamente</option>
                    <option value="SEMANAL">Semanalmente</option>
                    <option value="MENSAL">Mensalmente</option>
                  </select>
                </div>

                {frequencyType === "SEMANAL" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Dias da semana <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {WEEKDAYS.map(w => (
                        <label key={w.value}
                          className="flex items-center gap-1.5 text-xs text-gray-600
                            cursor-pointer px-2 py-1.5 border border-gray-200 rounded-lg
                            hover:bg-white transition bg-white">
                          <input type="checkbox" checked={daysOfWeek.includes(w.value)}
                            onChange={() => toggleWeekday(w.value)}
                            className="w-3.5 h-3.5 rounded" />
                          {w.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Data inicial <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Data final <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* Horário e duração */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário <span className="text-red-500 ml-1">*</span>
                </label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (min)
                </label>
                <input type="number" min="5" step="5" value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                  className={inputClass} />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="Observações sobre o agendamento..."
                className={inputClass + " resize-none"} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
            <button onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-full text-sm
                font-medium text-gray-600 hover:bg-white transition">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-full text-sm
                font-semibold hover:bg-primary/90 transition disabled:opacity-50
                flex items-center gap-2">
              {saving && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white
                  rounded-full animate-spin" />
              )}
              {saving ? "Agendando..." : "Agendar"}
            </button>
          </div>
        </div>
      </div>

      <BuscarPacienteModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectPaciente={(p) => { setPatient(p); setSearchOpen(false); }}
      />
    </>
  );
}
