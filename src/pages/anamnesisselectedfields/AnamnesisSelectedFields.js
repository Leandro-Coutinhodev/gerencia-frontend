// src/pages/anamnesis/AnamnesisSelectFields.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import AnamnesisService from "../../services/AnamnesisService";
import Alert from "../../components/alert/Alert";

const UserAvatar = () => (
  <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="32" fill="#E0E0E0" />
    <path d="M32 37C36.4183 37 40 33.4183 40 29C40 24.5817 36.4183 21 32 21C27.5817 21 24 24.5817 24 29C24 33.4183 27.5817 37 32 37Z" fill="#BDBDBD" />
    <path d="M44 48C44 41.9249 39.0751 37 33 37C26.9249 37 22 41.9249 22 48H44Z" fill="#BDBDBD" />
  </svg>
);

const fieldTypeBadge = (type) => {
  const map = {
    TEXT:     "bg-blue-50 text-blue-600",
    TEXTAREA: "bg-purple-50 text-purple-600",
    DATE:     "bg-yellow-50 text-yellow-600",
    CHECKBOX: "bg-green-50 text-green-600",
    FILE:     "bg-red-50 text-red-600",
  };
  const labels = {
    TEXT: "Texto", TEXTAREA: "Texto longo",
    DATE: "Data", CHECKBOX: "Checkbox", FILE: "Arquivo",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[type] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[type] ?? type}
    </span>
  );
};

export default function AnamnesisSelectFields() {
  const { anamneseid } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState(null);

  // Dados da anamnese
  const [anamnesisData, setAnamnesisData] = useState(null);

  // answers renderizáveis: { fieldId, fieldLabel, fieldType, value, hasFile, fileName }
  const [answers, setAnswers] = useState([]);

  // fieldIds selecionados para o encaminhamento
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);

  // ── Carregamento ────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const dto = await AnamnesisService.buscarPorId(anamneseid);
        setAnamnesisData(dto);

        // Monta lista de respostas exibíveis (exclui campos sem resposta)
        const renderableAnswers = (dto.answers ?? [])
          .filter((a) => {
            if (a.fieldType === "FILE") return a.hasFile;
            return a.value !== null && a.value !== undefined && a.value !== "";
          });

        setAnswers(renderableAnswers);
      } catch (err) {
        console.error(err);
        setAlert({ type: "error", message: "Erro ao carregar dados da anamnese." });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [anamneseid]);

  // ── Seleção ─────────────────────────────────────────────────────────────────

  const toggle = (fieldId) =>
    setSelectedFieldIds((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );

  const allSelected =
    answers.length > 0 && answers.every((a) => selectedFieldIds.includes(a.fieldId));

  const handleSelectAll = (checked) => {
    setSelectedFieldIds(checked ? answers.map((a) => a.fieldId) : []);
  };

  // ── Envio ───────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (selectedFieldIds.length === 0) return;

    setSending(true);
    try {
      await AnamnesisService.sendReferral({
        anamnesisId: anamnesisData.id,
        selectedFieldIds,
      });

      setAlert({ type: "success", message: "Encaminhamento criado com sucesso!" });
      setTimeout(() => navigate(-1), 2500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Erro ao encaminhar anamnese.";
      setAlert({ type: "error", message: msg });
    } finally {
      setSending(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando anamnese...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600
            hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">

          {alert && (
            <div className="mb-5">
              <Alert type={alert.type} message={alert.message}
                onClose={() => setAlert(null)} duration={5000} />
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Analisar anamnese</h1>

          {/* Header do paciente */}
          <div className="flex items-center gap-5 pb-6 border-b border-gray-200 mb-6">
            <UserAvatar />
            <div className="flex-1">
              <p className="text-base font-bold text-gray-900">
                {anamnesisData?.patientName ?? "Paciente não identificado"}
              </p>
              {anamnesisData?.interviewDate && (
                <p className="text-sm text-gray-500 mt-0.5">
                  Entrevista:{" "}
                  {new Date(anamnesisData.interviewDate).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })}
                </p>
              )}
              {anamnesisData?.template?.name && (
                <p className="text-sm text-gray-400 mt-0.5">
                  Modelo: <span className="font-medium text-gray-600">
                    {anamnesisData.template.name}
                  </span>
                </p>
              )}
              <button
                onClick={() => window.open(`/laudo/${anamnesisData?.id}`, "_blank")}
                className="mt-1.5 text-sm font-medium text-sky-600 hover:underline
                  inline-flex items-center gap-1"
              >
                Visualizar laudo <ExternalLink size={14} />
              </button>
            </div>
          </div>

          {/* Sem respostas */}
          {answers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Esta anamnese ainda não possui respostas registradas.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">
                  Selecione as respostas a encaminhar
                </h2>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary
                      focus:ring-primary cursor-pointer"
                  />
                  Selecionar todas
                </label>
              </div>

              {/* Lista de respostas */}
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                {answers.map((answer) => {
                  const isSelected = selectedFieldIds.includes(answer.fieldId);

                  return (
                    <div
                      key={answer.fieldId}
                      onClick={() => toggle(answer.fieldId)}
                      className={`flex items-start gap-4 p-4 border-l-4 cursor-pointer
                        transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl
                        ${isSelected
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:bg-gray-50"
                        }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center
                          justify-center flex-shrink-0 transition-colors
                          ${isSelected
                            ? "bg-primary border-primary"
                            : "bg-white border-gray-300"
                          }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800">
                            {answer.fieldLabel}
                          </p>
                          {fieldTypeBadge(answer.fieldType)}
                        </div>

                        {/* Valor por tipo */}
                        {answer.fieldType === "FILE" ? (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FileText size={14} className="text-red-400" />
                            {answer.fileName || "arquivo.pdf"}
                          </div>
                        ) : answer.fieldType === "CHECKBOX" ? (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(answer.value ?? "").split("|").map((opt) => (
                              <span key={opt}
                                className="text-xs px-2 py-0.5 bg-green-50 text-green-700
                                  rounded-full border border-green-100">
                                {opt}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 leading-relaxed
                            whitespace-pre-line line-clamp-3">
                            {answer.value}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Contador */}
              <p className="text-xs text-gray-400 mt-3">
                {selectedFieldIds.length} de {answers.length} campo
                {answers.length !== 1 ? "s" : ""} selecionado
                {selectedFieldIds.length !== 1 ? "s" : ""}
              </p>
            </>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-gray-300 rounded-full text-sm
                font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={selectedFieldIds.length === 0 || sending}
              className={`px-6 py-2.5 rounded-full text-sm font-medium text-white
                transition flex items-center gap-2
                ${selectedFieldIds.length === 0 || sending
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
                }`}
            >
              {sending && (
                <span className="w-3.5 h-3.5 border-2 border-white/40
                  border-t-white rounded-full animate-spin" />
              )}
              {sending ? "Enviando..." : "Encaminhar selecionados"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}