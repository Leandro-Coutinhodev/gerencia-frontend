// src/pages/anamnesis/relatorio/VisualizarRelatorio.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, User, Calendar,
  Loader, CheckSquare, Type, Hash,
  AlignLeft, Paperclip, AlertCircle,
} from "lucide-react";
import AnamnesisService from "../../../services/AnamnesisService";

// ── Ícone e cor por tipo de campo ─────────────────────────────────────────────

const FIELD_TYPE_CONFIG = {
  TEXT:     { icon: Type,        color: "text-blue-500",  bg: "bg-blue-50"   },
  TEXTAREA: { icon: AlignLeft,   color: "text-purple-500",bg: "bg-purple-50" },
  DATE:     { icon: Calendar,    color: "text-yellow-500",bg: "bg-yellow-50" },
  CHECKBOX: { icon: CheckSquare, color: "text-green-500", bg: "bg-green-50"  },
  FILE:     { icon: Paperclip,   color: "text-red-500",   bg: "bg-red-50"    },
};

function fieldConfig(type) {
  return FIELD_TYPE_CONFIG[type] ?? FIELD_TYPE_CONFIG.TEXT;
}

// ── Renderização do valor por tipo ────────────────────────────────────────────

function FieldValue({ fieldType, value, hasFile, fileName }) {
  if (fieldType === "FILE") {
    return hasFile ? (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Paperclip size={14} className="text-red-400 flex-shrink-0" />
        <span>{fileName || "arquivo.pdf"}</span>
        <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700
          rounded-full font-medium">
          Salvo
        </span>
      </div>
    ) : (
      <p className="text-sm text-gray-400 italic">Nenhum arquivo anexado.</p>
    );
  }

  if (fieldType === "CHECKBOX") {
    const opts = (value || "").split("|").map(o => o.trim()).filter(Boolean);
    return opts.length > 0 ? (
      <div className="flex flex-wrap gap-1.5">
        {opts.map(opt => (
          <span key={opt}
            className="text-xs px-2.5 py-1 bg-green-50 text-green-700
              border border-green-100 rounded-full font-medium">
            {opt}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-400 italic">Nenhuma opção selecionada.</p>
    );
  }

  if (fieldType === "DATE" && value) {
    const formatted = (() => {
      try {
        return new Date(value + "T00:00:00").toLocaleDateString("pt-BR");
      } catch {
        return value;
      }
    })();
    return <p className="text-sm text-gray-800">{formatted}</p>;
  }

  return (
    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
      {value && value.trim() !== "" ? value : (
        <span className="text-gray-400 italic">Sem resposta registrada.</span>
      )}
    </p>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function VisualizarRelatorio() {
  const { referralId } = useParams();
  const navigate = useNavigate();

  const [relatorio, setRelatorio] = useState(null);
  const [campos,    setCampos]    = useState([]); // [{ label, fieldType, value, hasFile, fileName }]
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => { carregar(); }, [referralId]);

  const carregar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnamnesisService.relReferral(referralId);
      setRelatorio(data);

      // selectedFieldsJson: array de { label, fieldType, value }
      // ou string JSON desse array
      let parsed = [];
      if (data?.selectedFieldsJson) {
        const raw = typeof data.selectedFieldsJson === "string"
          ? JSON.parse(data.selectedFieldsJson)
          : data.selectedFieldsJson;

        // Suporte a ambos os formatos:
        // Novo: [{ label, fieldType, value }]
        // Antigo: { fieldName: value } → converte para array
        if (Array.isArray(raw)) {
          parsed = raw;
        } else if (typeof raw === "object") {
          // Formato legado — converte para array para renderização uniforme
          parsed = Object.entries(raw).map(([label, value]) => ({
            label,
            fieldType: "TEXT",
            value: String(value ?? ""),
          }));
        }
      }

      setCampos(parsed);
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      setError("Não foi possível carregar o relatório. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // ── Estados de carregamento / erro ────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white rounded-xl shadow-sm p-8">
        <Loader className="animate-spin mx-auto mb-4 text-primary" size={40} />
        <p className="text-gray-500 text-sm">Carregando relatório...</p>
      </div>
    </div>
  );

  if (error) return (
    <Screen onBack={() => navigate(-1)}>
      <div className="flex items-center gap-3 bg-red-50 border border-red-200
        rounded-xl p-5">
        <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    </Screen>
  );

  if (!relatorio) return (
    <Screen onBack={() => navigate(-1)}>
      <p className="text-center text-gray-500 py-12">Relatório não encontrado.</p>
    </Screen>
  );

  const camposComValor = campos.filter(c =>
    c.fieldType === "FILE" ? c.hasFile : (c.value && c.value.trim() !== "")
  );

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900
            transition text-sm font-medium mb-6"
        >
          <ArrowLeft size={18} /> Voltar
        </button>

        {/* ── Card de cabeçalho ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start
            justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase
                tracking-wide mb-1">
                Relatório de Anamnese
              </p>
              <h1 className="text-xl font-bold text-gray-900">
                Encaminhamento #{relatorio.id}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                <Calendar size={13} />
                {formatarData(relatorio.sentAt)}
              </div>
            </div>
          </div>

          {/* Participantes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3
            pt-4 border-t border-gray-100">
            <InfoCard
              label="Paciente"
              value={relatorio.anamnesis?.patient?.name}
              icon={<User size={15} className="text-primary" />}
            />
            {relatorio.professional?.name && (
              <InfoCard
                label="Profissional responsável"
                value={relatorio.professional.name}
                icon={<User size={15} className="text-primary" />}
              />
            )}
          </div>
        </div>

        {/* ── Card das respostas ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">
              Informações Selecionadas
            </h2>
            <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600
              rounded-full font-medium">
              {camposComValor.length}{" "}
              {camposComValor.length === 1 ? "campo" : "campos"}
            </span>
          </div>

          {/* Sem campos */}
          {campos.length === 0 ? (
            <div className="text-center py-14 border-2 border-dashed
              border-gray-100 rounded-xl">
              <FileText size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 font-medium">
                Nenhum campo foi selecionado neste relatório.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {campos.map((campo, idx) => {
                const cfg = fieldConfig(campo.fieldType);
                const Icon = cfg.icon;

                return (
                  <div
                    key={idx}
                    className="border border-gray-100 rounded-xl p-4
                      hover:border-gray-200 transition-colors"
                  >
                    {/* Label + badge de tipo */}
                    <div className="flex items-start gap-2.5 mb-2.5">
                      <div className={`w-6 h-6 rounded-md flex items-center
                        justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                        <Icon size={13} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 leading-snug">
                          {campo.label}
                        </p>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full
                        font-medium flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                        {campo.fieldType}
                      </span>
                    </div>

                    {/* Valor */}
                    <div className="pl-8">
                      <FieldValue
                        fieldType={campo.fieldType}
                        value={campo.value}
                        hasFile={campo.hasFile}
                        fileName={campo.fileName}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Auxiliares ────────────────────────────────────────────────────────────────

function Screen({ children, onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900
            transition text-sm font-medium mb-6"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3.5">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-gray-800">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}