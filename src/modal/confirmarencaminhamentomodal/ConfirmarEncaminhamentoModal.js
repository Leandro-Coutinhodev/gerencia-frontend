import React, { useEffect, useState } from "react";
import AssistantService from "../../services/AssistantService";

export default function ConfirmarEncaminhamentoModal({
  isOpen,
  onClose,
  anamnese,
  onConfirm,
  sending,
}) {
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);

  useEffect(() => {
    if (isOpen) {
      AssistantService.getAll()
        .then((data) => setAssistants(data))
        .catch((err) => console.error("Erro ao carregar assistentes:", err));
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedAssistant) {
      alert("Selecione um assistente antes de confirmar!");
      return;
    }
    onConfirm({
      anamnesisId: anamnese?.id,
      receiverId: selectedAssistant,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Confirmar encaminhamento
        </h2>

        <p className="text-sm text-gray-600 mb-3">
          Selecione o assistente que receberá a anamnese:
        </p>

        <select
          className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-4 focus:ring-2 focus:ring-blue-300"
          onChange={(e) => setSelectedAssistant(e.target.value)}
          value={selectedAssistant || ""}
        >
          <option value="">Selecione um assistente...</option>
          {assistants.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={sending}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {sending ? "Enviando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
