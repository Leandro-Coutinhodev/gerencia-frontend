// src/pages/contracts/ContractSigningPage.jsx
// Tela pública acessada via link: /contrato/:token
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, XCircle, Lock, AlertCircle } from "lucide-react";
import ContractService from "../../services/ContractService";

export default function ContractSigningPage() {
  const { token } = useParams();

  const [loading,  setLoading]  = useState(true);
  const [signing,  setSigning]  = useState(false);
  const [status,   setStatus]   = useState(null); // 'ready'|'already_signed'|'invalid'|'done'
  const [view,     setView]     = useState(null); // ContractSigningViewDTO
  const [error,    setError]    = useState(null);

  // Estado dos campos de aceite: { [fieldId]: string }
  const [acceptResponses, setAcceptResponses] = useState({});
  const [acceptedTerms,   setAcceptedTerms]   = useState(false);

  // ── Carrega dados do contrato ─────────────────────────────────────

  useEffect(() => {
    ContractService.getSigningView(token)
      .then(dto => {
        setView(dto);
        if (dto.signingStatus === "ASSINADO") {
          setStatus("already_signed");
        } else {
          setStatus("ready");
        }
      })
      .catch(() => setStatus("invalid"))
      .finally(() => setLoading(false));
  }, [token]);

  // ── Assinar ───────────────────────────────────────────────────────

  const handleSign = async () => {
    // Valida campos de aceite obrigatórios
    const required = (view?.acceptFields || []).filter(f => f.required);
    for (const f of required) {
      const val = acceptResponses[f.id];
      if (!val || val === "false" || val.trim() === "") {
        setError("Preencha todos os campos de aceite obrigatórios.");
        return;
      }
    }

    if (!acceptedTerms) {
      setError("Você precisa concordar com os termos do contrato para prosseguir.");
      return;
    }

    setSigning(true);
    setError(null);
    try {
      await ContractService.sign(token, true, acceptResponses);
      setStatus("done");
    } catch (err) {
      setError(err.response?.data || "Erro ao registrar assinatura.");
    } finally {
      setSigning(false);
    }
  };

  // ── Renders de estado ─────────────────────────────────────────────

  if (loading) return (
    <Screen>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Carregando contrato...</p>
    </Screen>
  );

  if (status === "invalid") return (
    <Screen>
      <XCircle className="text-red-400 mx-auto mb-4" size={56} />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Link inválido</h2>
      <p className="text-gray-500 text-sm">
        Este link de assinatura não existe ou expirou. Contate a clínica.
      </p>
    </Screen>
  );

  if (status === "already_signed") return (
    <Screen>
      <Lock className="text-primary mx-auto mb-4" size={56} />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Já assinado</h2>
      <p className="text-gray-500 text-sm">
        Você já assinou este contrato anteriormente.
      </p>
    </Screen>
  );

  if (status === "done") return (
    <Screen>
      <CheckCircle className="text-green-500 mx-auto mb-4" size={56} />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Assinado com sucesso!</h2>
      <p className="text-gray-500 text-sm">
        Sua assinatura foi registrada. Obrigado, {view?.participantName}.
      </p>
    </Screen>
  );

  // ── Tela de assinatura ────────────────────────────────────────────

  const acceptFields = view?.acceptFields || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Cabeçalho */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                Assinatura Eletrônica
              </p>
              <h1 className="text-xl font-bold text-gray-900">
                Contrato para Assinatura
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Olá, <span className="font-semibold">{view?.participantName}</span>
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                ${view?.participantRole === "RESPONSAVEL"
                  ? "bg-blue-50 text-blue-600"
                  : view?.participantRole === "EMPRESA"
                    ? "bg-green-50 text-green-600"
                    : "bg-amber-50 text-amber-600"
                }`}>
                {view?.participantRole}
              </span>
            </div>
          </div>
        </div>

        {/* Conteúdo do Contrato */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2
            border-b border-gray-100">
            Contrato
          </h2>
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed
              max-h-96 overflow-y-auto pr-2"
            dangerouslySetInnerHTML={{ __html: view?.renderedContent || "" }}
          />
        </div>

        {/* Campos de aceite */}
        {acceptFields.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Campos de Aceite
            </h2>
            <div className="space-y-4">
              {acceptFields.map(field => (
                <AcceptFieldInput
                  key={field.id}
                  field={field}
                  value={acceptResponses[field.id] || ""}
                  onChange={val => setAcceptResponses(prev =>
                    ({ ...prev, [field.id]: val }))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Termo de concordância + Assinar */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100
              rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <div
              onClick={() => setAcceptedTerms(v => !v)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center
                flex-shrink-0 mt-0.5 transition-colors cursor-pointer
                ${acceptedTerms
                  ? "bg-primary border-primary"
                  : "bg-white border-gray-300 hover:border-primary"
                }`}
            >
              {acceptedTerms && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-700">
              Li e concordo com todos os termos e cláusulas deste contrato.
              Entendo que esta assinatura eletrônica tem validade legal.
            </span>
          </label>

          <button
            onClick={handleSign}
            disabled={signing || !acceptedTerms}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm
              hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {signing && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white
                rounded-full animate-spin" />
            )}
            {signing ? "Registrando assinatura..." : "Assinar Contrato"}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Sua assinatura será registrada com data, hora e endereço IP.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Campo de aceite dinâmico ──────────────────────────────────────────

function AcceptFieldInput({ field, value, onChange }) {
  const labelEl = (
    <p className="text-sm font-medium text-gray-800 mb-1">
      {field.label}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </p>
  );

  if (field.fieldType === "CHECKBOX") {
    return (
      <div>
        {labelEl}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={value === "true"}
            onChange={e => onChange(e.target.checked ? "true" : "false")}
            className="w-4 h-4 rounded" />
          <span className="text-sm text-gray-600">Sim, concordo</span>
        </label>
      </div>
    );
  }

  if (field.fieldType === "SIM_NAO") {
    return (
      <div>
        {labelEl}
        <div className="flex gap-4">
          {["true", "false"].map(v => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`field_${field.id}`}
                value={v} checked={value === v}
                onChange={() => onChange(v)}
                className="w-4 h-4" />
              <span className="text-sm text-gray-600">{v === "true" ? "Sim" : "Não"}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.fieldType === "DATE") {
    return (
      <div>
        {labelEl}
        <input type="date" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
    );
  }

  // TEXT e SIGNATURE (assinatura por texto simples)
  return (
    <div>
      {labelEl}
      {field.fieldType === "SIGNATURE" && (
        <p className="text-xs text-gray-400 mb-1">
          Digite seu nome completo como assinatura
        </p>
      )}
      <input type="text" value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.fieldType === "SIGNATURE" ? "Seu nome completo..." : ""}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/30
          ${field.fieldType === "SIGNATURE"
            ? "font-signature text-lg italic border-b-2 border-b-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
            : ""}`}
      />
    </div>
  );
}

// ── Tela centralizada ─────────────────────────────────────────────────

function Screen({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100
      flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center w-full">
        {children}
      </div>
    </div>
  );
}