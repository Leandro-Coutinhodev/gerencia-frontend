// src/pages/agenda/Agenda.js
// Agenda / Frequência: calendário mensal de agendamentos, com resumo do período e filtros.
// Profissional comum vê apenas os próprios agendamentos; admin tem visão total com filtros.
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Plus, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import AppointmentService from "../../services/AppointmentService";
import ProfessionalService from "../../services/ProfessionalService";
import Alert from "../../components/alert/Alert";
import BuscarPacienteModal from "../../modal/buscarpacientemodal/BuscarPacienteModal";
import AgendamentoModal from "../../modal/agendamentomodal/AgendamentoModal";
import FrequenciaModal from "../../modal/frequenciamodal/FrequenciaModal";

const WEEK_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const STATUS_CONFIG = {
  AGENDADO:    { label: "Agendado",    dot: "bg-blue-500",  chip: "bg-blue-50 text-blue-700" },
  PRESENTE:    { label: "Presente",    dot: "bg-green-500", chip: "bg-green-50 text-green-700" },
  AUSENTE:     { label: "Ausente",     dot: "bg-red-500",   chip: "bg-red-50 text-red-700" },
  JUSTIFICADO: { label: "Justificado", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700" },
  CANCELADO:   { label: "Cancelado",   dot: "bg-gray-400",  chip: "bg-gray-100 text-gray-400" },
};

function getScope() {
  try {
    const token = localStorage.getItem("token");
    return token ? jwtDecode(token).scope : "";
  } catch {
    return "";
  }
}

function pad2(n) { return String(n).padStart(2, "0"); }
function toISODate(year, month, day) { return `${year}-${pad2(month + 1)}-${pad2(day)}`; }

function buildMonthCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7; // segunda=0 ... domingo=6
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function Agenda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = getScope() === "ADMIN";

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [occurrences, setOccurrences] = useState([]);
  const [summary,     setSummary]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [alert,       setAlert]       = useState(null);

  const [professionals,     setProfessionals]     = useState([]);
  const [professionalId,    setProfessionalId]    = useState("");
  const [patientFilter,     setPatientFilter]     = useState(null);
  const [statusFilter,      setStatusFilter]      = useState("");
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);

  const [agendamentoOpen,    setAgendamentoOpen]    = useState(false);
  const [agendamentoPrefill, setAgendamentoPrefill] = useState(null);
  const [selectedFrequency,  setSelectedFrequency]  = useState(null);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthStart = toISODate(year, month, 1);
  const monthEnd   = toISODate(year, month, new Date(year, month + 1, 0).getDate());
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);

  useEffect(() => {
    if (!isAdmin) return;
    ProfessionalService.getAll()
      .then(data => setProfessionals(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [isAdmin]);

  // Entrada vinda da ficha de atendimento do paciente ("Agendar atendimento"): mostra o
  // calendário com a ficha já selecionada — o profissional só precisa clicar em um dia.
  const [pendingFicha, setPendingFicha] = useState(null);

  useEffect(() => {
    const attendanceRecordId = searchParams.get("attendanceRecordId");
    const patientId = searchParams.get("patientId");
    const patientName = searchParams.get("patientName");
    if (attendanceRecordId && patientId) {
      setPendingFicha({
        initialAttendanceRecordId: Number(attendanceRecordId),
        initialPatientId: Number(patientId),
        initialPatientName: patientName || "",
      });
      searchParams.delete("attendanceRecordId");
      searchParams.delete("patientId");
      searchParams.delete("patientName");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: monthStart,
        endDate: monthEnd,
        professionalId: isAdmin && professionalId ? professionalId : undefined,
        patientId: patientFilter?.id,
        status: statusFilter || undefined,
      };
      const [occ, sum] = await Promise.all([
        AppointmentService.calendario(params),
        AppointmentService.resumo(params),
      ]);
      setOccurrences(Array.isArray(occ) ? occ : []);
      setSummary(sum);
    } catch {
      setAlert({ type: "error", message: "Erro ao carregar a agenda." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, professionalId, patientFilter, statusFilter]);

  const occurrencesByDate = useMemo(() => {
    const map = {};
    occurrences.forEach(o => {
      if (!map[o.scheduledDate]) map[o.scheduledDate] = [];
      map[o.scheduledDate].push(o);
    });
    return map;
  }, [occurrences]);

  const goToday = () => { const d = new Date(); d.setDate(1); setViewDate(d); };
  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const openNewAppointment = (day) => {
    setAgendamentoPrefill({
      ...(pendingFicha || {}),
      ...(day ? { initialDate: toISODate(year, month, day) } : {}),
    });
    setAgendamentoOpen(true);
  };

  const handleAppointmentSuccess = () => {
    setAgendamentoOpen(false);
    setAgendamentoPrefill(null);
    setPendingFicha(null);
    setAlert({ type: "success", message: "Agendamento criado com sucesso!" });
    load();
  };

  const handleFrequencySuccess = () => {
    setSelectedFrequency(null);
    setAlert({ type: "success", message: "Atendimento atualizado com sucesso!" });
    load();
  };

  const today = new Date();
  const isToday = (day) =>
    day && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="bg-white rounded-xl shadow p-6">

      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message}
            onClose={() => setAlert(null)} duration={4000} />
        </div>
      )}

      <div className="text-sm text-gray-400 mb-4">
        Página Inicial <span className="mx-1">›</span>
        <span className="text-gray-700 font-medium">
          {isAdmin ? "Agenda Geral" : "Minha Agenda"}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isAdmin ? "Agenda Geral" : "Minha Agenda"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin
              ? "Agendamentos e frequência de todos os profissionais."
              : "Seus agendamentos e a frequência dos seus atendimentos."}
          </p>
        </div>
        <button onClick={() => openNewAppointment(null)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5
            rounded-full text-sm font-semibold hover:bg-primary/90 transition
            shadow-sm whitespace-nowrap">
          <Plus size={16} /> Novo Agendamento
        </button>
      </div>

      {pendingFicha && (
        <div className="flex items-center justify-between gap-3 bg-primary/5 border
          border-primary/20 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm text-gray-700">
            Agendando a partir da ficha de <strong>{pendingFicha.initialPatientName}</strong>.
            Clique em um dia do calendário para continuar.
          </p>
          <button onClick={() => setPendingFicha(null)}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium
              flex-shrink-0 underline underline-offset-2">
            Cancelar seleção
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {isAdmin && (
          <select value={professionalId} onChange={e => setProfessionalId(e.target.value)}
            className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2
              text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30
              cursor-pointer">
            <option value="">Todos os profissionais</option>
            {professionals.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}

        {patientFilter ? (
          <span className="flex items-center gap-1.5 text-sm bg-primary/5 text-primary
            border border-primary/20 rounded-lg pl-3 pr-1.5 py-1.5">
            {patientFilter.name}
            <button onClick={() => setPatientFilter(null)}
              className="p-0.5 hover:bg-primary/10 rounded">
              <X size={13} />
            </button>
          </span>
        ) : (
          <button onClick={() => setPatientSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg
              text-sm text-gray-600 hover:bg-gray-50 transition">
            <Search size={14} /> Filtrar paciente
          </button>
        )}

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2
            text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30
            cursor-pointer">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
            <option key={value} value={value}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Resumo do período */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          <SummaryCard label="Agendados"    value={summary.scheduled} color="text-blue-700"  bg="bg-blue-50" />
          <SummaryCard label="Presentes"    value={summary.present}   color="text-green-700" bg="bg-green-50" />
          <SummaryCard label="Ausentes"     value={summary.absent}    color="text-red-700"   bg="bg-red-50" />
          <SummaryCard label="Justificados" value={summary.justified} color="text-amber-700" bg="bg-amber-50" />
          <SummaryCard label="Cancelados"   value={summary.cancelled} color="text-gray-600"  bg="bg-gray-50" />
        </div>
      )}

      {/* Navegação do mês */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">
          {MONTH_LABELS[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={goToday}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200
              rounded-full hover:bg-gray-50 transition mr-1">
            Hoje
          </button>
          <button onClick={goPrevMonth}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
            <ChevronLeft size={16} />
          </button>
          <button onClick={goNextMonth}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
          <span key={value} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} /> {cfg.label}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {WEEK_LABELS.map(w => (
              <div key={w} className="text-center text-xs font-semibold text-gray-500
                uppercase tracking-wide py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) {
                return (
                  <div key={idx}
                    className="border-b border-r border-gray-50 bg-gray-50/40 min-h-[92px]" />
                );
              }
              const dateKey = toISODate(year, month, day);
              const dayOccurrences = occurrencesByDate[dateKey] || [];
              const visible = dayOccurrences.slice(0, 3);
              const overflow = dayOccurrences.length - visible.length;

              return (
                <div key={idx}
                  onClick={() => openNewAppointment(day)}
                  className="border-b border-r border-gray-50 min-h-[92px] p-1.5
                    hover:bg-primary/5 transition-colors cursor-pointer flex flex-col gap-1">
                  <span className={`text-xs font-semibold w-5 h-5 flex items-center
                    justify-center rounded-full flex-shrink-0
                    ${isToday(day) ? "bg-primary text-white" : "text-gray-500"}`}>
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {visible.map(o => {
                      const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.AGENDADO;
                      return (
                        <button key={o.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedFrequency(o); }}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium
                            text-left truncate ${cfg.chip}`}
                          title={`${o.scheduledTime?.slice(0, 5)} ${o.patientName}`}>
                          {o.scheduledTime?.slice(0, 5)} {o.patientName}
                        </button>
                      );
                    })}
                    {overflow > 0 && (
                      <span className="text-[10px] text-gray-400 px-1.5">+{overflow} mais</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BuscarPacienteModal
        isOpen={patientSearchOpen}
        onClose={() => setPatientSearchOpen(false)}
        onSelectPaciente={(p) => { setPatientFilter(p); setPatientSearchOpen(false); }}
        title="Filtrar por paciente"
        confirmLabel="Filtrar"
      />

      <AgendamentoModal
        isOpen={agendamentoOpen}
        onClose={() => { setAgendamentoOpen(false); setAgendamentoPrefill(null); }}
        onSuccess={handleAppointmentSuccess}
        {...(agendamentoPrefill || {})}
      />

      <FrequenciaModal
        isOpen={!!selectedFrequency}
        onClose={() => setSelectedFrequency(null)}
        onSuccess={handleFrequencySuccess}
        frequency={selectedFrequency}
      />
    </div>
  );
}

function SummaryCard({ label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl px-4 py-3`}>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
