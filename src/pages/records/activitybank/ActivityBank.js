// src/pages/records/activitybank/ActivityBank.js
// Banco de atividades: cada profissional cadastra e gerencia suas próprias atividades
// reutilizáveis (ex: "Treino de Bíceps", "Limpeza Dental"), usadas para montar modelos de ficha.
// Admin tem visão total (somente leitura) sobre as atividades de todos os profissionais.
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Plus, Pencil, ToggleLeft, ToggleRight, Search, Dumbbell } from "lucide-react";
import ActivityService from "../../../services/ActivityService";
import Alert from "../../../components/alert/Alert";
import ConfirmDialog from "../../../components/confirm/ConfirmDialog";
import ActivityModal from "../../../modal/activitymodal/ActivityModal";

function getScope() {
  try {
    const token = localStorage.getItem("token");
    return token ? jwtDecode(token).scope : "";
  } catch {
    return "";
  }
}

export default function ActivityBank() {
  const isAdmin = getScope() === "ADMIN";

  const [activities,    setActivities]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [alert,         setAlert]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [showInactive,  setShowInactive]  = useState(false);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await ActivityService.listar();
      setActivities(Array.isArray(data) ? data : []);
    } catch {
      setAlert({ type: "error", message: "Erro ao carregar atividades." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = activities.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.name.toLowerCase().includes(q) ||
      (a.category || "").toLowerCase().includes(q);
    const matchActive = showInactive ? true : a.active;
    return matchSearch && matchActive;
  });

  const handleSave = async (data) => {
    if (editing) {
      await ActivityService.atualizar(editing.id, data);
      setAlert({ type: "success", message: "Atividade atualizada com sucesso." });
    } else {
      await ActivityService.criar(data);
      setAlert({ type: "success", message: "Atividade criada com sucesso." });
    }
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const handleToggleConfirm = async () => {
    if (!confirmTarget) return;
    try {
      await ActivityService.alterarStatus(confirmTarget.id, !confirmTarget.active);
      setAlert({
        type: "success",
        message: `Atividade ${confirmTarget.active ? "desativada" : "reativada"}.`,
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
        <span className="text-gray-700 font-medium">Banco de Atividades</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between
        gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Banco de Atividades</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin
              ? "Atividades cadastradas por todos os profissionais."
              : "Suas atividades reutilizáveis para montar modelos de ficha."}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5
              rounded-full text-sm font-semibold hover:bg-primary/90 transition
              shadow-sm whitespace-nowrap">
            <Plus size={16} /> Nova Atividade
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
            placeholder="Buscar atividades..."
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
          Mostrar inativas
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
          <Dumbbell size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            {search ? "Nenhuma atividade encontrada." : "Nenhuma atividade cadastrada."}
          </p>
          {!search && !isAdmin && (
            <button onClick={() => { setEditing(null); setModalOpen(true); }}
              className="mt-3 text-sm text-primary hover:underline font-medium">
              Cadastrar primeira atividade
            </button>
          )}
        </div>
      )}

      {/* Lista */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(activity => {
            const inactive = !activity.active;
            return (
              <div key={activity.id}
                className={`flex items-center gap-3 px-4 py-3.5 border rounded-xl
                  transition-all
                  ${inactive ? "border-gray-100 opacity-60" : "border-gray-200 hover:border-gray-300"}`}>

                <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                  flex-shrink-0 ${inactive ? "bg-gray-100" : "bg-primary/10"}`}>
                  <Dumbbell size={16}
                    className={inactive ? "text-gray-400" : "text-primary"} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {activity.name}
                    </p>
                    {inactive && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500
                        rounded-full font-medium">
                        Inativa
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {activity.category && (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700
                        rounded-full font-medium">
                        {activity.category}
                      </span>
                    )}
                    {isAdmin && activity.professionalName && (
                      <span className="text-xs text-gray-400">
                        {activity.professionalName}
                      </span>
                    )}
                    {activity.description && (
                      <span className="text-xs text-gray-400 truncate max-w-xs">
                        {activity.description}
                      </span>
                    )}
                  </div>
                </div>

                {!isAdmin && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setEditing(activity); setModalOpen(true); }}
                      className="p-2 text-gray-400 hover:text-primary
                        hover:bg-primary/5 rounded-lg transition">
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmTarget(activity)}
                      className={`p-2 rounded-lg transition
                        ${inactive
                          ? "text-gray-300 hover:text-green-500 hover:bg-green-50"
                          : "text-primary/70 hover:text-primary hover:bg-primary/5"
                        }`}>
                      {inactive ? <ToggleLeft size={20} /> : <ToggleRight size={20} />}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && activities.length > 0 && (
        <p className="text-xs text-gray-400 text-right mt-4">
          {filtered.length} de {activities.length} atividade
          {activities.length !== 1 ? "s" : ""}
        </p>
      )}

      <ActivityModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        initialData={editing}
      />

      <ConfirmDialog
        isOpen={!!confirmTarget}
        title={confirmTarget?.active ? "Desativar atividade" : "Reativar atividade"}
        message={confirmTarget?.active
          ? `Desativar "${confirmTarget?.name}"? Ela não poderá ser usada em novos modelos de ficha.`
          : `Reativar "${confirmTarget?.name}"?`
        }
        confirmText={confirmTarget?.active ? "Sim, desativar" : "Sim, reativar"}
        onConfirm={handleToggleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
