// src/pages/records/recordhistory/RecordHistory.js
// Histórico de fichas de atendimento de um paciente: cards de resumo, listagem e
// visualização inline das respostas de cada ficha registrada.
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus, Eye, Search, ClipboardList, Dumbbell, FileText,
  Calendar, Hash, BarChart2, CheckSquare, UserSearch, CalendarClock
} from "lucide-react";
import RecordService from "../../../services/RecordService";
import PatientsService from "../../../services/PatientsService";
import Alert from "../../../components/alert/Alert";
import BuscarPacienteModal from "../../../modal/buscarpacientemodal/BuscarPacienteModal";
import NovaRecordModal from "../../../modal/novarecordmodal/NovaRecordModal";

const FIELD_ICONS = {
  TEXT: FileText, TEXTAREA: FileText, DATE: Calendar,
  NUMBER: Hash, SCALE: BarChart2, CHECKBOX: CheckSquare,
};

function AnswerSummary({ answer }) {
  const { fieldType, value, unit } = answer;

  if (fieldType === "SCALE" && value !== undefined && value !== "" && value != null) {
    const n = Number(value);
    const textColor = n <= 3 ? "text-red-500" : n <= 6 ? "text-yellow-600" : "text-green-600";
    const barColor  = n <= 3 ? "bg-red-400"   : n <= 6 ? "bg-yellow-400"   : "bg-green-400";
    return (
      <div className="flex items-center gap-2">
        <span className={"text-lg font-bold " + textColor}>{n}</span>
        <span className="text-xs text-gray-400">/10</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
          <div className={"h-full rounded-full " + barColor} style={{ width: `${n * 10}%` }} />
        </div>
      </div>
    );
  }

  if (fieldType === "CHECKBOX") {
    const opts = (value || "").split("|").filter(Boolean);
    if (opts.length === 0) return <span className="text-xs text-gray-400 italic">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {opts.map(o => (
          <span key={o} className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700
            border border-teal-100 rounded-full">
            {o}
          </span>
        ))}
      </div>
    );
  }

  if (fieldType === "DATE" && value) {
    try {
      return (
        <span className="text-sm text-gray-700">
          {new Date(value + "T00:00:00").toLocaleDateString("pt-BR")}
        </span>
      );
    } catch {
      return <span className="text-sm text-gray-700">{value}</span>;
    }
  }

  if (fieldType === "NUMBER") {
    return (
      <span className="text-sm text-gray-700">
        {value || value === 0 ? value : <span className="text-gray-400 italic">—</span>}
        {value && unit ? ` ${unit}` : ""}
      </span>
    );
  }

  return (
    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
      {value || <span className="text-gray-400 italic">—</span>}
    </p>
  );
}

function AnswerCard({ answer }) {
  const Icon = FIELD_ICONS[answer.fieldType] || FileText;
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-gray-400 flex-shrink-0" />
        <p className="text-xs font-semibold text-gray-600 truncate">{answer.label}</p>
      </div>
      <AnswerSummary answer={answer} />
    </div>
  );
}

export default function RecordHistory() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient,   setPatient]   = useState(null);
  const [records,   setRecords]   = useState([]);
  const [loading,   setLoading]   = useState(!!patientId);
  const [alert,     setAlert]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [expandedId,setExpandedId]= useState(null);
  const [searchOpen,setSearchOpen]= useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const load = async () => {
    setLoading(true);
    try {
      const [pat, recs] = await Promise.all([
        PatientsService.buscarPorId(patientId),
        RecordService.listarPorPaciente(patientId),
      ]);
      setPatient(pat);
      setRecords(Array.isArray(recs) ? recs : []);
    } catch {
      setAlert({ type: "error", message: "Erro ao carregar histórico de fichas." });
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (p) => {
    setSearchOpen(false);
    navigate(`/fichas/historico/${p.id}`);
  };

  const handleNovaFicha = (templateId) => {
    setModalOpen(false);
    navigate(`/fichas/preencher/${templateId}?patientId=${patientId}&patientName=${encodeURIComponent(patient?.name || "")}`);
  };

  const handleAgendar = (record) => {
    navigate(`/agenda?attendanceRecordId=${record.id}&patientId=${patientId}&patientName=${encodeURIComponent(patient?.name || "")}`);
  };

  // ── Tela sem paciente selecionado ────────────────────────────────────────────
  if (!patientId) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-sm text-gray-400 mb-4">
          Página Inicial <span className="mx-1">›</span> Fichas de Atendimento
          <span className="mx-1">›</span>
          <span className="text-gray-700 font-medium">Histórico</span>
        </div>
        <div className="text-center py-16">
          <UserSearch size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-700 font-semibold mb-1">
            Selecione um paciente para ver o histórico
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Busque o paciente para visualizar ou registrar fichas de atendimento.
          </p>
          <button onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5
              rounded-full text-sm font-semibold hover:bg-primary/90 transition shadow-sm">
            <Search size={15} /> Buscar Paciente
          </button>
        </div>
        <BuscarPacienteModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelectPaciente={handlePatientSelect}
        />
      </div>
    );
  }

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return !q || (r.templateName || "").toLowerCase().includes(q);
  });

  const now = new Date();
  const sessionsThisMonth = records.filter(r => {
    if (!r.sessionDate) return false;
    const d = new Date(r.sessionDate + "T00:00:00");
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const scaleAnswersCount = records.reduce((acc, r) => {
    const generalScales = (r.generalAnswers || []).filter(a => a.fieldType === "SCALE" && a.value).length;
    const activityScales = (r.activityAnswers || []).reduce(
      (a2, act) => a2 + (act.fields || []).filter(f => f.fieldType === "SCALE" && f.value).length, 0
    );
    return acc + generalScales + activityScales;
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow p-6">

      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message}
            onClose={() => setAlert(null)} duration={4000} />
        </div>
      )}

      <div className="text-sm text-gray-400 mb-4">
        Página Inicial <span className="mx-1">›</span> Fichas de Atendimento
        <span className="mx-1">›</span>
        <span className="text-gray-700 font-medium">Histórico</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fichas de Atendimento</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Paciente: <span className="font-medium text-gray-700">
              {loading ? "..." : patient?.name || "—"}
            </span>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200
              rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            <Search size={15} /> Trocar paciente
          </button>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5
              rounded-full text-sm font-semibold hover:bg-primary/90 transition shadow-sm">
            <Plus size={16} /> Nova Ficha
          </button>
        </div>
      </div>

      {!loading && records.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-2xl font-bold text-gray-700">{records.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total</p>
          </div>
          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <p className="text-2xl font-bold text-blue-700">{sessionsThisMonth}</p>
            <p className="text-xs text-gray-500 mt-0.5">Sessões do mês</p>
          </div>
          <div className="bg-purple-50 rounded-xl px-4 py-3">
            <p className="text-2xl font-bold text-purple-700">{scaleAnswersCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Avaliações</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por modelo..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            {search ? "Nenhuma ficha encontrada com esse filtro." : "Nenhuma ficha registrada ainda."}
          </p>
          {!search && (
            <button onClick={() => setModalOpen(true)}
              className="mt-3 text-sm text-primary hover:underline font-medium">
              Registrar primeira ficha
            </button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(record => {
            const isExpanded = expandedId === record.id;
            return (
              <div key={record.id}
                className={`border rounded-xl transition-all
                  ${isExpanded ? "border-gray-200 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}>

                <div className="flex items-center gap-3 px-4 py-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center
                    justify-center flex-shrink-0">
                    <ClipboardList size={16} className="text-blue-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {record.templateName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 flex-wrap">
                      <span>{record.professionalName}</span>
                      <span>·</span>
                      <span>
                        {record.sessionDate
                          ? new Date(record.sessionDate + "T00:00:00").toLocaleDateString("pt-BR")
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <button onClick={() => handleAgendar(record)}
                    title="Agendar atendimento a partir desta ficha"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      text-xs font-medium text-gray-400 hover:text-primary
                      hover:bg-primary/5 transition flex-shrink-0">
                    <CalendarClock size={13} />
                    <span className="hidden sm:block">Agendar</span>
                  </button>

                  <button onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      text-xs font-medium transition
                      ${isExpanded
                        ? "bg-primary/10 text-primary"
                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                      }`}>
                    <Eye size={13} />
                    <span className="hidden sm:block">{isExpanded ? "Fechar" : "Ver"}</span>
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                    {(record.activityAnswers || []).map(act => (
                      <div key={act.templateActivityId}>
                        <p className="text-xs font-semibold text-gray-500 uppercase
                          tracking-wide mb-2 flex items-center gap-1.5">
                          <Dumbbell size={12} /> {act.label}
                        </p>
                        {(act.fields || []).length === 0 ? (
                          <p className="text-xs text-gray-400 italic">Sem campos registrados.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {act.fields.map(f => <AnswerCard key={f.fieldId} answer={f} />)}
                          </div>
                        )}
                      </div>
                    ))}

                    {(record.generalAnswers || []).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase
                          tracking-wide mb-2">
                          Campos gerais
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {record.generalAnswers.map(a => (
                            <AnswerCard key={a.fieldId} answer={a} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && records.length > 0 && (
        <p className="text-xs text-gray-400 text-right mt-4">
          {filtered.length} de {records.length} ficha{records.length !== 1 ? "s" : ""}
        </p>
      )}

      <BuscarPacienteModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectPaciente={handlePatientSelect}
        title="Trocar paciente"
      />

      <NovaRecordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleNovaFicha}
        patientName={patient?.name}
      />
    </div>
  );
}
