// src/modal/encaminharanamnese/EncaminharAnamneseModal.jsx
import { useEffect, useState } from "react";
import { X, ChevronDown, ClipboardList, AlertCircle } from "lucide-react";
import AnamnesisModelService from "../../services/AnamnesisModelService";

function EncaminharAnamneseModal({ isOpen, paciente, onClose, onConfirm, sending = false }) {
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [templateError, setTemplateError] = useState(false);

  // ── Carrega templates ativos ao abrir ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplate(null);
      setTemplateError(false);
      setDropdownOpen(false);
      return;
    }

    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const data = await AnamnesisModelService.getAll();
        setTemplates(data);
      } catch (error) {
        console.error("Erro ao carregar modelos:", error);
        setTemplates([]);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [isOpen]);

  // ── Fechar dropdown ao clicar fora ────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#template-dropdown")) setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!selectedTemplate) {
      setTemplateError(true);
      return;
    }
    onConfirm(paciente, selectedTemplate.id);
  };

  // ── Dados do paciente ─────────────────────────────────────────────────────
  if (!isOpen || !paciente) return null;

  const guardian = paciente.guardian || paciente.guardianDto || {};
  const guardianName = guardian.name || paciente.guardianName || "-";
  const date = paciente.dateBirth || paciente.birthDate || paciente.dataNascimento;
  const formattedDate = date ? new Date(date).toLocaleDateString("pt-BR") : "-";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 relative">

        {/* ── Cabeçalho ── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Enviar anamnese para o responsável
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Confirme os dados e selecione o modelo de formulário
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition rounded-full p-1 hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Informações do paciente ── */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 mb-5">
          <h3 className="text-sm font-medium text-gray-600 mb-3">
            Informações do paciente
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nome completo</label>
              <input
                type="text"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                value={paciente.name || paciente.nome || ""}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">CPF</label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                  value={paciente.cpf || "-"}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                  value={formattedDate}
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Responsável</label>
              <input
                type="text"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                value={guardianName}
                disabled
              />
            </div>
          </div>
        </div>

        {/* ── Seleção de modelo ── */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo de formulário{" "}
            <span className="text-red-500">*</span>
          </label>

          {loadingTemplates ? (
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
              <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Carregando modelos...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Nenhum modelo ativo encontrado.{" "}
                <span className="font-medium">
                  Cadastre um modelo de anamnese antes de encaminhar.
                </span>
              </p>
            </div>
          ) : (
            <div id="template-dropdown" className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border
                  text-sm transition bg-white
                  ${templateError && !selectedTemplate
                    ? "border-red-300 bg-red-50"
                    : selectedTemplate
                      ? "border-primary/40 bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                {selectedTemplate ? (
                  <div className="flex items-center gap-3 text-left">
                    <ClipboardList size={16} className="text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">{selectedTemplate.name}</p>
                      {selectedTemplate.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">
                          {selectedTemplate.description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">Selecione um modelo de formulário</span>
                )}
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform flex-shrink-0 ml-2
                    ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {templateError && !selectedTemplate && (
                <p className="text-xs text-red-500 mt-1">
                  Selecione um modelo antes de encaminhar.
                </p>
              )}

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl
                  border border-gray-100 shadow-lg z-50 max-h-56 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setTemplateError(false);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left text-sm
                        hover:bg-gray-50 transition border-b border-gray-50 last:border-0
                        ${selectedTemplate?.id === template.id ? "bg-primary/5" : ""}`}
                    >
                      <ClipboardList
                        size={15}
                        className="text-primary mt-0.5 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className={`font-medium ${selectedTemplate?.id === template.id
                          ? "text-primary"
                          : "text-gray-700"}`}>
                          {template.name}
                        </p>
                        {template.description && (
                          <p className="text-xs text-gray-400 truncate">
                            {template.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-300 mt-0.5">
                          {template.fields?.length ?? 0} campo
                          {(template.fields?.length ?? 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Ações ── */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700
              hover:bg-gray-100 transition text-sm font-medium disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            onClick={handleConfirm}
            disabled={sending || templates.length === 0}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition flex items-center gap-2
              ${sending || templates.length === 0
                ? "bg-primary/60 text-white cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
              }`}
          >
            {sending && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white
                rounded-full animate-spin" />
            )}
            {sending ? "Enviando..." : "Encaminhar anamnese"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EncaminharAnamneseModal;