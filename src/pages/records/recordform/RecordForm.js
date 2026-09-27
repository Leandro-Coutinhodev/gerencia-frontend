// src/pages/records/recordform/RecordForm.js
// Preenchimento de uma ficha de atendimento: o profissional seleciona o modelo (via rota),
// o paciente (via query string) e preenche a data da sessão, os campos gerais e os campos
// de cada item de atividade do modelo.
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, Dumbbell } from "lucide-react";
import RecordTemplateService from "../../../services/RecordTemplateService";
import RecordService from "../../../services/RecordService";
import Alert from "../../../components/alert/Alert";

// ── Campo dinâmico por tipo ───────────────────────────────────────────────────
function DynamicField({ field, value, onChange, error }) {
  const baseClass = `w-full border rounded-xl px-3 py-2.5 text-sm
    focus:outline-none focus:ring-2 transition
    ${error
      ? "border-red-300 bg-red-50 focus:ring-red-200"
      : "border-gray-200 focus:ring-primary/30 focus:border-primary"
    }`;

  if (field.fieldType === "TEXT") {
    return (
      <input type="text" value={value || ""} onChange={e => onChange(e.target.value)}
        className={baseClass} />
    );
  }

  if (field.fieldType === "TEXTAREA") {
    return (
      <textarea value={value || ""} onChange={e => onChange(e.target.value)}
        rows={3} maxLength={2000} className={`${baseClass} resize-none`} />
    );
  }

  if (field.fieldType === "DATE") {
    return (
      <input type="date" value={value || ""} onChange={e => onChange(e.target.value)}
        className={baseClass} />
    );
  }

  if (field.fieldType === "NUMBER") {
    return (
      <div className="relative">
        <input type="number" value={value || ""} onChange={e => onChange(e.target.value)}
          placeholder="0" className={baseClass + (field.unit ? " pr-14" : "")} />
        {field.unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs
            text-gray-400 pointer-events-none">
            {field.unit}
          </span>
        )}
      </div>
    );
  }

  if (field.fieldType === "SCALE") {
    const current = value !== undefined && value !== "" ? Number(value) : null;
    return (
      <div>
        <div className="flex items-center gap-1 flex-wrap">
          {[0,1,2,3,4,5,6,7,8,9,10].map(n => {
            const sel = current === n;
            return (
              <button key={n} type="button" onClick={() => onChange(String(n))}
                className={`w-9 h-9 rounded-xl border-2 text-sm font-semibold
                  transition-all
                  ${sel
                    ? "bg-primary text-white border-primary shadow-sm scale-110"
                    : "bg-white text-gray-500 border-gray-200 hover:border-primary/50"
                  }`}>
                {n}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5 px-1">
          <span>Muito ruim</span>
          <span>Excelente</span>
        </div>
      </div>
    );
  }

  if (field.fieldType === "CHECKBOX") {
    const options  = (field.options || []).map(o => o.trim()).filter(Boolean);
    const selected = (value || "").split("|").map(o => o.trim()).filter(Boolean);

    const toggle = (opt) => {
      const next = selected.includes(opt)
        ? selected.filter(s => s !== opt)
        : [...selected, opt];
      onChange(next.join("|"));
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(opt => {
          const checked = selected.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2
                text-sm text-left transition-all
                ${checked
                  ? "border-primary bg-primary/5 text-gray-800"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}>
              <div className={`w-5 h-5 rounded border-2 flex items-center
                justify-center flex-shrink-0 transition-colors
                ${checked ? "bg-primary border-primary" : "bg-white border-gray-300"}`}>
                {checked && (
                  <svg className="w-3 h-3 text-white" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}

function FieldBlock({ field, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <DynamicField field={field} value={value} onChange={onChange} error={error} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function RecordForm() {
  const { templateId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const patientId   = searchParams.get("patientId");
  const patientName = searchParams.get("patientName") || "Paciente";

  const [template,   setTemplate]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [alert,      setAlert]      = useState(null);

  const [sessionDate,     setSessionDate]     = useState(new Date().toISOString().split("T")[0]);
  const [generalAnswers,  setGeneralAnswers]  = useState({});   // { fieldId: value }
  const [activityAnswers, setActivityAnswers] = useState({});   // { activityItemId: { fieldId: value } }
  const [errors,          setErrors]          = useState({});   // { "g_<id>" | "a_<itemId>_<id>": msg }

  useEffect(() => {
    RecordTemplateService.buscarPorId(templateId)
      .then(setTemplate)
      .catch(() => setAlert({ type: "error", message: "Erro ao carregar modelo." }))
      .finally(() => setLoading(false));
  }, [templateId]);

  const setGeneralValue = (fieldId, value) => {
    setGeneralAnswers(prev => ({ ...prev, [fieldId]: value }));
    setErrors(prev => ({ ...prev, [`g_${fieldId}`]: undefined }));
  };

  const setActivityValue = (itemId, fieldId, value) => {
    setActivityAnswers(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), [fieldId]: value },
    }));
    setErrors(prev => ({ ...prev, [`a_${itemId}_${fieldId}`]: undefined }));
  };

  const validate = () => {
    const errs = {};
    (template?.generalFields || []).forEach(f => {
      if (!f.required) return;
      const v = generalAnswers[f.id];
      if (!v || String(v).trim() === "") errs[`g_${f.id}`] = "Campo obrigatório.";
    });
    (template?.activityItems || []).forEach(item => {
      (item.fields || []).forEach(f => {
        if (!f.required) return;
        const v = (activityAnswers[item.id] || {})[f.id];
        if (!v || String(v).trim() === "") errs[`a_${item.id}_${f.id}`] = "Campo obrigatório.";
      });
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!sessionDate) {
      setAlert({ type: "error", message: "Informe a data da sessão." });
      return;
    }
    if (!validate()) {
      setAlert({ type: "error", message: "Preencha todos os campos obrigatórios." });
      return;
    }

    // Converte as chaves de id numérico (React) para string (formato esperado pela API)
    const generalAnswersPayload = Object.fromEntries(
      Object.entries(generalAnswers).map(([k, v]) => [String(k), String(v ?? "")])
    );
    const activityAnswersPayload = Object.fromEntries(
      Object.entries(activityAnswers).map(([itemId, fields]) => [
        String(itemId),
        Object.fromEntries(Object.entries(fields).map(([k, v]) => [String(k), String(v ?? "")])),
      ])
    );

    setSubmitting(true);
    try {
      await RecordService.criar({
        templateId: template.id,
        patientId: Number(patientId),
        sessionDate,
        generalAnswers: generalAnswersPayload,
        activityAnswers: activityAnswersPayload,
      });
      setSuccess(true);
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data || "Erro ao salvar ficha." });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100
        p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center
          justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ficha salva!</h2>
        <p className="text-sm text-gray-500 mb-6">
          A ficha de <strong>{template?.name}</strong> foi registrada com sucesso
          para {patientName}.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(`/fichas/historico/${patientId}`)}
            className="px-5 py-2.5 border border-gray-200 rounded-full text-sm
              font-medium text-gray-600 hover:bg-gray-50 transition">
            Ver histórico
          </button>
          <button onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-primary text-white rounded-full text-sm
              font-semibold hover:bg-primary/90 transition">
            Voltar
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!template) return (
    <div className="p-8 text-center text-gray-500">Modelo não encontrado.</div>
  );

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500
            hover:text-gray-900 transition mb-5 font-medium">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {alert && (
            <div className="mb-5">
              <Alert type={alert.type} message={alert.message}
                onClose={() => setAlert(null)} duration={5000} />
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Paciente: <span className="font-medium text-gray-700">{patientName}</span>
            </p>
          </div>

          {hasErrors && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100
              rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-600">
                Preencha todos os campos obrigatórios antes de salvar.
              </p>
            </div>
          )}

          {/* Data da sessão */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data da sessão <span className="text-red-500 ml-1">*</span>
            </label>
            <input type="date" value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="w-full sm:w-56 border border-gray-200 rounded-xl px-3 py-2.5
                text-sm focus:outline-none focus:ring-2 focus:ring-primary/30
                focus:border-primary transition" />
          </div>

          {/* Atividades */}
          {(template.activityItems || []).map(item => (
            <div key={item.id} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center
                  justify-center flex-shrink-0">
                  <Dumbbell size={13} className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{item.label}</h3>
              </div>
              {(item.fields || []).length === 0 ? (
                <p className="text-xs text-gray-400 italic pl-9">
                  Esta atividade não possui campos configurados.
                </p>
              ) : (
                <div className="space-y-4 pl-9">
                  {item.fields.map(field => (
                    <FieldBlock
                      key={field.id}
                      field={field}
                      value={(activityAnswers[item.id] || {})[field.id]}
                      onChange={v => setActivityValue(item.id, field.id, v)}
                      error={errors[`a_${item.id}_${field.id}`]}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Campos gerais */}
          {(template.generalFields || []).length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Campos gerais
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-5">
                {template.generalFields.map(field => (
                  <FieldBlock
                    key={field.id}
                    field={field}
                    value={generalAnswers[field.id]}
                    onChange={v => setGeneralValue(field.id, v)}
                    error={errors[`g_${field.id}`]}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-gray-200 rounded-full text-sm
                font-medium text-gray-600 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="px-7 py-2.5 bg-primary text-white rounded-full text-sm
                font-semibold hover:bg-primary/90 transition disabled:opacity-50
                flex items-center gap-2">
              {submitting && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white
                  rounded-full animate-spin" />
              )}
              {submitting ? "Salvando..." : "Salvar Ficha"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
