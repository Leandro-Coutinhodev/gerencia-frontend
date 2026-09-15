import { useEffect, useState } from "react";
import { X } from "lucide-react";

function CadastroDespesaModal({ isOpen, onClose, onSave, initialData }) {
  const isEditing = Boolean(initialData);
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setValor("");
      setCategoria("");
      setData(new Date().toISOString().slice(0, 10));
      setError("");
      return;
    }
    if (initialData) {
      setValor(String(initialData.valor ?? ""));
      setCategoria(initialData.categoria || "");
      setData(
        initialData.data
          ? new Date(initialData.data).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10)
      );
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!(Number(valor) > 0)) {
      setError("Informe um valor maior que zero.");
      return;
    }
    if (!categoria.trim()) {
      setError("Informe uma categoria.");
      return;
    }
    setError("");
    onSave({ valor: Number(valor), categoria: categoria.trim(), data });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8">
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? "Editar Despesa" : "Nova Despesa"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: Aluguel, material, salário..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-white font-medium transition-colors shadow-sm bg-[#3D75C4] hover:bg-[#2d5ea3]"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastroDespesaModal;
