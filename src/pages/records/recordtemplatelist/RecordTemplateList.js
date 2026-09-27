// src/pages/records/recordtemplatelist/RecordTemplateList.js
// Lista de modelos de ficha do profissional (ou de todos, para o admin).
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Plus, Pencil, ToggleLeft, ToggleRight,
  ChevronRight, Search, Layers, Dumbbell
} from "lucide-react";
import RecordTemplateService from "../../../services/RecordTemplateService";
import Alert from "../../../components/alert/Alert";
import ConfirmDialog from "../../../components/confirm/ConfirmDialog";

const FIELD_TYPE_LABELS = {
  TEXT: "Texto", TEXTAREA: "Texto longo", DATE: "Data",
  NUMBER: "Número", SCALE: "Escala", CHECKBOX: "Múltipla escolha",
};

function getScope() {
  try {
    const token = localStorage.getItem("token");
    return token ? jwtDecode(token).scope : "";
  } catch {
    return "";
  }
}

export default function RecordTemplateList() {
  const navigate = useNavigate();
  const isAdmin = getScope() === "ADMIN";

  const [templates,     setTemplates]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [alert,         setAlert]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [showInactive,  setShowInactive]  = useState(false);
  const [expandedId,    setExpandedId]    = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await RecordTemplateService.listar();
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      setAlert({ type: "error", message: "Erro ao carregar modelos." });
    } finally {
      setLoading(false);
    }
  };

  const filtered = templates.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      t.name.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q);
    const matchActive = showInactive ? true : t.active;
    return matchSearch && matchActive;
  });

  const handleToggleConfirm = async () => {
    if (!confirmTarget) return;
    try {
      if (confirmTarget.active) {
        await RecordTemplateService.desativar(confirmTarget.id);
      } else {
        await RecordTemplateService.reativar(confirmTarget.id);
      }
      setAlert({
        type: "success",
        message: `Modelo ${confirmTarget.active ? "desativado" : "reativado"}.`,
      });
      load();
    } catch {
      setAlert({ type: "error", message: "Erro ao alterar status." });
    } finally {
      setConfirmTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">

      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message}
            onClose={() => setAlert(null)} duration={4000} />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-4">
        Página Inicial <span className="mx-1">›</span> Fichas de Atendimento
        <span className="mx-1">›</span>
        <span className="text-gray-700 font-medium">Modelos</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center
        justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Modelos de Ficha</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin
              ? "Modelos cadastrados por todos os profissionais."
              : "Templates reutilizáveis combinando atividades e campos gerais."}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => navigate("/fichas/modelo/novo")}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5
              rounded-full text-sm font-semibold hover:bg-primary/90 transition
              shadow-sm whitespace-nowrap">
            <Plus size={16} /> Novo Modelo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar modelos..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg
              text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600
          cursor-pointer px-3 py-2 border border-gray-200 rounded-lg
          hover:bg-gray-50 transition whitespace-nowrap">
          <input type="checkbox" checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
            className="w-4 h-4 rounded" />
          Mostrar inativos
        </label>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8
            border-b-2 border-primary" />
        </div>
      )}

      {/* Vazio */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Layers size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            {search ? "Nenhum modelo encontrado." : "Nenhum modelo cadastrado."}
          </p>
          {!search && !isAdmin && (
            <button onClick={() => navigate("/fichas/modelo/novo")}
              className="mt-3 text-sm text-primary hover:underline font-medium">
              Criar primeiro modelo
            </button>
          )}
        </div>
      )}

      {/* Lista */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(template => {
            const isExpanded = expandedId === template.id;
            const inactive   = !template.active;
            const totalFields = (template.generalFields?.length || 0) +
              (template.activityItems || []).reduce((acc, a) => acc + (a.fields?.length || 0), 0);

            return (
              <div key={template.id}
                className={`border rounded-xl transition-all
                  ${inactive ? "border-gray-100 opacity-60" : "border-gray-200"}
                  ${isExpanded ? "shadow-sm" : "hover:border-gray-300"}`}>

                {/* Linha principal */}
                <div className="flex items-center gap-3 px-4 py-3.5">

                  <div className={`w-9 h-9 rounded-lg flex items-center
                    justify-center flex-shrink-0
                    ${inactive ? "bg-gray-100" : "bg-primary/10"}`}>
                    <Layers size={16}
                      className={inactive ? "text-gray-400" : "text-primary"} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {template.name}
                      </p>
                      {inactive && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100
                          text-gray-500 rounded-full font-medium">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700
                        rounded-full font-medium">
                        {(template.activityItems || []).length} atividade
                        {(template.activityItems || []).length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-gray-400">
                        {totalFields} campo{totalFields !== 1 ? "s" : ""}
                      </span>
                      {isAdmin && template.professionalName && (
                        <span className="text-xs text-gray-400">
                          · {template.professionalName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!isAdmin && (
                      <>
                        <button
                          onClick={() => navigate(`/fichas/modelo/${template.id}/editar`)}
                          className="p-2 text-gray-400 hover:text-primary
                            hover:bg-primary/5 rounded-lg transition">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmTarget(template)}
                          className={`p-2 rounded-lg transition
                            ${inactive
                              ? "text-gray-300 hover:text-green-500 hover:bg-green-50"
                              : "text-primary/70 hover:text-primary hover:bg-primary/5"
                            }`}>
                          {inactive
                            ? <ToggleLeft size={20} />
                            : <ToggleRight size={20} />
                          }
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : template.id)}
                      className="p-2 text-gray-400 hover:text-gray-700
                        hover:bg-gray-50 rounded-lg transition">
                      <ChevronRight size={15}
                        className={`transition-transform duration-200
                          ${isExpanded ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-4">
                    {template.description && (
                      <p className="text-sm text-gray-500 mb-4">
                        {template.description}
                      </p>
                    )}

                    {(template.activityItems || []).map(item => (
                      <div key={item.id} className="mb-4">
                        <p className="text-xs font-semibold text-gray-500
                          uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Dumbbell size={12} /> {item.label}
                        </p>
                        <div className="space-y-1.5 pl-2">
                          {(item.fields || []).map(field => (
                            <FieldRow key={field.id} field={field} />
                          ))}
                        </div>
                      </div>
                    ))}

                    {(template.generalFields || []).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500
                          uppercase tracking-wide mb-2">
                          Campos gerais
                        </p>
                        <div className="space-y-1.5 pl-2">
                          {template.generalFields.map(field => (
                            <FieldRow key={field.id} field={field} />
                          ))}
                        </div>
                      </div>
                    )}

                    {!isAdmin && (
                      <div className="mt-4 pt-3 border-t border-gray-100
                        flex justify-end">
                        <button
                          onClick={() => navigate(`/fichas/modelo/${template.id}/editar`)}
                          className="flex items-center gap-1.5 text-sm text-primary
                            hover:text-primary/80 font-medium transition">
                          <Pencil size={13} /> Editar modelo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && templates.length > 0 && (
        <p className="text-xs text-gray-400 text-right mt-4">
          {filtered.length} de {templates.length} modelo
          {templates.length !== 1 ? "s" : ""}
        </p>
      )}

      <ConfirmDialog
        isOpen={!!confirmTarget}
        title={confirmTarget?.active ? "Desativar modelo" : "Reativar modelo"}
        message={confirmTarget?.active
          ? `Desativar "${confirmTarget?.name}"? Ele não poderá ser usado em novas fichas.`
          : `Reativar "${confirmTarget?.name}"?`
        }
        confirmText={confirmTarget?.active ? "Sim, desativar" : "Sim, reativar"}
        onConfirm={handleToggleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}

function FieldRow({ field }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="font-medium text-gray-700 flex-1 truncate">
        {field.label}
      </span>
      <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5
        rounded-full font-medium flex-shrink-0">
        {FIELD_TYPE_LABELS[field.fieldType] || field.fieldType}
        {field.unit ? ` (${field.unit})` : ""}
      </span>
      {field.required && (
        <span className="text-red-400 text-xs flex-shrink-0">*</span>
      )}
    </div>
  );
}
