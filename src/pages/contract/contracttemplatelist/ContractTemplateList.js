// src/pages/contracts/templates/ContractTemplateList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Pencil, ToggleLeft, ToggleRight, FileText,
  ChevronRight, Eye, EyeOff, Search, Layers
} from "lucide-react";
import ContractTemplateService from "../../../services/ContractTemplateService";
import Alert from "../../../components/alert/Alert";
import ConfirmDialog from "../../../components/confirm/ConfirmDialog";

// ── Helpers de label ──────────────────────────────────────────────────────────

const TYPE_LABELS = {
  PRESTACAO_SERVICO: "Prestação de Serviço",
  CONSENTIMENTO:     "Consentimento",
  LGPD:              "LGPD",
  ANAMNESE:          "Anamnese",
  OUTRO:             "Outro",
};

const SIGNING_LABELS = {
  SEQUENCIAL: "Sequencial",
  PARALELO:   "Paralelo",
};

const WITNESS_LABELS = {
  OBRIGATORIO: "Obrigatório",
  OPCIONAL:    "Opcional",
  NAO_UTILIZA: "Sem testemunhas",
};

const TYPE_COLORS = {
  PRESTACAO_SERVICO: "bg-blue-50 text-blue-700",
  CONSENTIMENTO:     "bg-purple-50 text-purple-700",
  LGPD:              "bg-red-50 text-red-700",
  ANAMNESE:          "bg-teal-50 text-teal-700",
  OUTRO:             "bg-gray-100 text-gray-600",
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function ContractTemplateList() {
  const navigate = useNavigate();

  const [templates,       setTemplates]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [alert,           setAlert]           = useState(null);
  const [search,          setSearch]          = useState("");
  const [showInactive,    setShowInactive]    = useState(false);
  const [expandedId,      setExpandedId]      = useState(null);
  const [confirmOpen,     setConfirmOpen]     = useState(false);
  const [confirmTarget,   setConfirmTarget]   = useState(null); // { id, name, active }

  // ── Carregamento ────────────────────────────────────────────────────────────

  const load = async () => {
    setLoading(true);
    try {
      // Busca ativos; se quiser inativos, backend precisaria de endpoint separado
      const data = await ContractTemplateService.getAll();
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      setAlert({ type: "error", message: "Erro ao carregar modelos de contrato." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Filtro local ────────────────────────────────────────────────────────────

  const filtered = templates.filter(t => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = showInactive ? true : t.status !== "INATIVO";
    return matchSearch && matchStatus;
  });

  // ── Toggle ativo/inativo ────────────────────────────────────────────────────

  const handleToggle = (template) => {
    setConfirmTarget(template);
    setConfirmOpen(true);
  };

  const handleToggleConfirm = async () => {
    if (!confirmTarget) return;
    try {
      if (confirmTarget.status === "INATIVO") {
        await ContractTemplateService.reactivate(confirmTarget.id);
        setAlert({ type: "success", message: `Modelo "${confirmTarget.name}" reativado.` });
      } else {
        await ContractTemplateService.deactivate(confirmTarget.id);
        setAlert({ type: "success", message: `Modelo "${confirmTarget.name}" desativado.` });
      }
      load();
    } catch {
      setAlert({ type: "error", message: "Erro ao alterar status do modelo." });
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-xl shadow p-6">

      {/* Alert */}
      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message}
            onClose={() => setAlert(null)} duration={4000} />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-4">
        Página Inicial <span className="mx-1">›</span> Contratos
        <span className="mx-1">›</span>
        <span className="text-gray-700 font-medium">Modelos de Contrato</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Modelos de Contrato</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Crie e gerencie os templates reutilizáveis para gerar contratos.
          </p>
        </div>
        <button
          onClick={() => navigate("/contrato/modelo/novo")}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5
            rounded-full text-sm font-semibold hover:bg-primary/90 transition
            shadow-sm whitespace-nowrap"
        >
          <Plus size={16} /> Novo Modelo
        </button>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none
          px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          Mostrar inativos
        </label>
      </div>

      {/* Estado de loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {/* Estado vazio */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Layers size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            {search ? "Nenhum modelo encontrado para essa busca." : "Nenhum modelo cadastrado."}
          </p>
          {!search && (
            <button
              onClick={() => navigate("/contrato/modelo/novo")}
              className="mt-4 text-sm text-primary hover:underline font-medium"
            >
              Criar primeiro modelo
            </button>
          )}
        </div>
      )}

      {/* Lista de modelos */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(template => {
            const isExpanded = expandedId === template.id;
            const isInactive = template.status === "INATIVO";

            return (
              <div
                key={template.id}
                className={`border rounded-xl transition-all duration-200
                  ${isInactive ? "border-gray-100 opacity-60" : "border-gray-200"}
                  ${isExpanded ? "shadow-sm" : "hover:border-gray-300"}`}
              >
                {/* Linha principal */}
                <div className="flex items-center gap-3 px-4 py-3.5">

                  {/* Ícone */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                    flex-shrink-0 ${isInactive ? "bg-gray-100" : "bg-primary/10"}`}>
                    <FileText size={16}
                      className={isInactive ? "text-gray-400" : "text-primary"} />
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {template.name}
                      </p>
                      {isInactive && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500
                          rounded-full font-medium">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${TYPE_COLORS[template.type] || "bg-gray-100 text-gray-500"}`}>
                        {TYPE_LABELS[template.type] || template.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {SIGNING_LABELS[template.signingMode] || template.signingMode}
                      </span>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className="text-xs text-gray-400">
                        {WITNESS_LABELS[template.witnessConfig] || template.witnessConfig}
                      </span>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className="text-xs text-gray-400">
                        {(template.clauses || []).length} cláusula
                        {(template.clauses || []).length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {/* Editar */}
                    <button
                      onClick={() => navigate(`/contrato/modelo/${template.id}/editar`)}
                      title="Editar modelo"
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5
                        rounded-lg transition"
                    >
                      <Pencil size={15} />
                    </button>

                    {/* Toggle ativo/inativo */}
                    <button
                      onClick={() => handleToggle(template)}
                      title={isInactive ? "Reativar" : "Desativar"}
                      className={`p-2 rounded-lg transition
                        ${isInactive
                          ? "text-gray-300 hover:text-green-500 hover:bg-green-50"
                          : "text-primary/70 hover:text-primary hover:bg-primary/5"
                        }`}
                    >
                      {isInactive
                        ? <ToggleLeft size={20} />
                        : <ToggleRight size={20} />
                      }
                    </button>

                    {/* Expandir */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : template.id)}
                      title={isExpanded ? "Recolher" : "Ver detalhes"}
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50
                        rounded-lg transition"
                    >
                      <ChevronRight size={15}
                        className={`transition-transform duration-200
                          ${isExpanded ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Expansão: detalhes do modelo */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-4">
                    {/* Descrição */}
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                      {/* Cláusulas */}
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase
                          tracking-wide mb-2">
                          Cláusulas
                        </p>
                        <div className="space-y-1.5">
                          {(template.clauses || []).length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Sem cláusulas cadastradas.</p>
                          ) : (
                            (template.clauses || []).map(c => (
                              <div key={c.id}
                                className="flex items-start gap-2 text-sm">
                                <span className="text-xs text-gray-400 font-mono
                                  mt-0.5 w-5 flex-shrink-0">
                                  {c.clauseOrder}.
                                </span>
                                <span className="font-medium text-gray-700">{c.title}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Lateral: variáveis + aceites */}
                      <div className="space-y-4">
                        {/* Variáveis */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase
                            tracking-wide mb-2">
                            Variáveis Manuais
                          </p>
                          {(template.variables || []).filter(v => !v.autoFilled).length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Nenhuma.</p>
                          ) : (
                            <div className="space-y-1">
                              {(template.variables || [])
                                .filter(v => !v.autoFilled)
                                .map(v => (
                                  <code key={v.id}
                                    className="block text-xs text-primary bg-primary/5
                                      px-2 py-0.5 rounded font-mono">
                                    {`{{${v.variableName}}}`}
                                  </code>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Campos de aceite */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase
                            tracking-wide mb-2">
                            Campos de Aceite
                          </p>
                          {(template.acceptFields || []).length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Nenhum.</p>
                          ) : (
                            <div className="space-y-1">
                              {(template.acceptFields || []).map(f => (
                                <div key={f.id}
                                  className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400
                                    flex-shrink-0" />
                                  <span className="truncate">{f.label}</span>
                                  <span className="text-gray-400 flex-shrink-0">
                                    ({f.fieldType?.replace("_", "/")})
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botão editar no rodapé do expand */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => navigate(`/contrato/modelo/${template.id}/editar`)}
                        className="flex items-center gap-1.5 text-sm text-primary
                          hover:text-primary/80 font-medium transition"
                      >
                        <Pencil size={13} /> Editar este modelo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rodapé com contagem */}
      {!loading && templates.length > 0 && (
        <p className="text-xs text-gray-400 text-right mt-4">
          {filtered.length} de {templates.length} modelo
          {templates.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Dialog de confirmação */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={confirmTarget?.status === "INATIVO" ? "Reativar modelo" : "Desativar modelo"}
        message={
          confirmTarget?.status === "INATIVO"
            ? `Reativar o modelo "${confirmTarget?.name}"? Ele voltará a aparecer na criação de contratos.`
            : `Desativar o modelo "${confirmTarget?.name}"? Ele não poderá ser usado em novos contratos.`
        }
        onConfirm={handleToggleConfirm}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
      />
    </div>
  );
}