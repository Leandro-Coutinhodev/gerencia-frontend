// src/pages/anamnesis/relatorio/VisualizarRelatorio.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, User, Calendar, Loader, AlertCircle, Eye,
} from "lucide-react";
import AnamnesisService from "../../../services/AnamnesisService";

// ── Renderização do valor por tipo — visual limpo, sem badges/ícones por tipo ─────

function FieldValue({ fieldType, value, hasFile, fileName, onView }) {
  if (fieldType === "FILE") {
    if (hasFile) {
      return (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-800">{fileName || "arquivo.pdf"}</span>
          {onView && (
            <button
              type="button"
              onClick={onView}
              className="flex items-center gap-1 text-xs font-medium text-primary
                hover:underline flex-shrink-0"
            >
              <Eye size={13} /> Visualizar
            </button>
          )}
        </div>
      );
    }
    // Encaminhamentos antigos guardavam só um texto indicativo, sem metadados para visualizar
    if (value && value.trim() !== "") {
      return <p className="text-sm text-gray-500">{value}</p>;
    }
    return <p className="text-sm text-gray-400 italic">Nenhum arquivo anexado.</p>;
  }

  if (fieldType === "CHECKBOX") {
    const opts = (value || "").split("|").map(o => o.trim()).filter(Boolean);
    return opts.length > 0 ? (
      <p className="text-sm text-gray-800">{opts.join(", ")}</p>
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

      // Encaminhamentos antigos guardavam, para campos FILE, só um texto indicativo
      // (ex: "[Arquivo: nome.pdf]"), sem o fieldId necessário para buscar o arquivo depois.
      // Tenta recuperar o campo real casando pelo rótulo com as respostas atuais da anamnese,
      // para permitir visualizar o laudo mesmo em relatórios criados antes dessa correção.
      const needsFileResolution = parsed.some(
        (c) => c.fieldType === "FILE" && c.fieldId == null
      );
      if (needsFileResolution && data?.anamnesisId) {
        try {
          const anamnesisData = await AnamnesisService.buscarPorId(data.anamnesisId);
          const normalize = (s) => (s || "").trim().toLowerCase();
          const fileAnswersByLabel = new Map(
            (anamnesisData.answers || [])
              .filter((a) => a.fieldType === "FILE")
              .map((a) => [normalize(a.fieldLabel), a])
          );
          parsed = parsed.map((c) => {
            if (c.fieldType !== "FILE" || c.fieldId != null) return c;
            const match = fileAnswersByLabel.get(normalize(c.label));
            return match
              ? { ...c, fieldId: match.fieldId, hasFile: match.hasFile, fileName: match.fileName }
              : c;
          });
        } catch {
          // Não foi possível recuperar — mantém o texto indicativo original
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

  // Abre em nova aba o arquivo salvo de um campo FILE selecionado neste encaminhamento
  const handleViewFile = async (fieldId) => {
    try {
      const blob = await AnamnesisService.buscarArquivoCampo(relatorio.anamnesisId, fieldId);
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (err) {
      console.error(err);
      setError("Erro ao abrir o arquivo.");
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
              value={relatorio.patientName}
              icon={<User size={15} className="text-primary" />}
            />
            {relatorio.professionalName && (
              <InfoCard
                label="Profissional responsável"
                value={relatorio.professionalName}
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
            <div className="divide-y divide-gray-100">
              {campos.map((campo, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-xs font-medium text-gray-400 uppercase
                    tracking-wide mb-1.5">
                    {campo.label}
                  </p>
                  <FieldValue
                    fieldType={campo.fieldType}
                    value={campo.value}
                    hasFile={campo.hasFile}
                    fileName={campo.fileName}
                    onView={
                      campo.fieldType === "FILE" && campo.hasFile && campo.fieldId != null
                        ? () => handleViewFile(campo.fieldId)
                        : undefined
                    }
                  />
                </div>
              ))}
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