// src/modal/novarecordmodal/NovaRecordModal.js
// Modal de seleção de modelo de ficha para iniciar o preenchimento de uma nova sessão
// para o paciente já em contexto (histórico do paciente).
import { useState, useEffect } from "react";
import { X, ChevronRight, Search, Layers, Dumbbell } from "lucide-react";
import RecordTemplateService from "../../services/RecordTemplateService";

export default function NovaRecordModal({ isOpen, onClose, onSelect, patientName }) {
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    if (!isOpen) { setSearch(""); return; }
    setLoading(true);
    RecordTemplateService.listarAtivosDoProfissional()
      .then(data => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = templates.filter(t => {
    const q = search.toLowerCase();
    return !q ||
      t.name.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q);
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center
        justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col
        max-h-[85vh] overflow-hidden">

        <div className="flex items-start justify-between px-6 pt-5 pb-4
          border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Nova Ficha de Atendimento
            </h2>
            {patientName && (
              <p className="text-xs text-gray-500 mt-0.5">
                Paciente: <span className="font-medium">{patientName}</span>
              </p>
            )}
          </div>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600
              hover:bg-gray-100 rounded-lg transition">
            <X size={17} />
          </button>
        </div>

        <div className="px-6 pt-4 pb-3">
          <div className="relative">
            <Search size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400
                pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar modelos..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl
                text-sm focus:outline-none focus:ring-2 focus:ring-primary/30
                focus:border-primary transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary
                rounded-full animate-spin" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-10">
              <Layers size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                {templates.length === 0
                  ? "Nenhum modelo ativo disponível."
                  : "Nenhum modelo encontrado."}
              </p>
              {templates.length === 0 && (
                <a href="/fichas/modelo/novo"
                  className="text-sm text-primary hover:underline font-medium mt-2 inline-block">
                  Criar modelo de ficha
                </a>
              )}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map(template => (
                <button
                  key={template.id}
                  onClick={() => onSelect(template.id)}
                  className="w-full flex items-center gap-3 p-4 border-2
                    border-gray-100 bg-gray-50 rounded-xl hover:border-primary
                    hover:bg-primary/5 transition-all text-left group">

                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center
                    justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Layers size={18} className="text-blue-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {template.name}
                    </p>
                    {template.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full
                        font-medium bg-blue-50 text-blue-600 flex items-center gap-1">
                        <Dumbbell size={10} />
                        {(template.activityItems || []).length} atividade
                        {(template.activityItems || []).length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={16}
                    className="text-gray-300 group-hover:text-primary
                      transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <button onClick={onClose}
            className="w-full py-2.5 border border-gray-200 rounded-full text-sm
              font-medium text-gray-600 hover:bg-white transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
