// src/modal/activitymodal/ActivityModal.js
// Modal de criação/edição de uma atividade do banco pessoal do profissional.
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ActivityModal({ isOpen, onClose, onSave, initialData }) {
  const isEditing = !!initialData;

  const [name,        setName]        = useState("");
  const [category,    setCategory]    = useState("");
  const [description, setDescription] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(initialData?.name || "");
    setCategory(initialData?.category || "");
    setDescription(initialData?.description || "");
    setError("");
  }, [isOpen, initialData]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("O nome da atividade é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        category: category.trim() || null,
        description: description.trim() || null,
      });
    } catch (err) {
      setError(err.response?.data || "Erro ao salvar atividade.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center
        justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
          border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            {isEditing ? "Editar Atividade" : "Nova Atividade"}
          </h2>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100
              rounded-lg transition">
            <X size={17} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100
              rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da atividade <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Treino de Bíceps"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/30
                focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Ex: Membros Superiores"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/30
                focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Descrição opcional da atividade..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                resize-none focus:outline-none focus:ring-2 focus:ring-primary/30
                focus:border-primary transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100
          bg-gray-50/60">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-full text-sm
              font-medium text-gray-600 hover:bg-white transition">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-full text-sm
              font-semibold hover:bg-primary/90 transition disabled:opacity-50
              flex items-center gap-2">
            {saving && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white
                rounded-full animate-spin" />
            )}
            {saving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Atividade"}
          </button>
        </div>
      </div>
    </div>
  );
}
