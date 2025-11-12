import React, { useEffect, useState } from "react";
import AssistantService from "../../services/AssistantService";
import AnamnesisService from "../../services/AnamnesisService";

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
      setSelectedAssistant(null); // 🔹 limpa seleção anterior ao abrir o modal
      AssistantService.getAll()
        .then((data) => setAssistants(data))
        .catch((err) => console.error("Erro ao carregar assistentes:", err));
    }
  }, [isOpen]);

  const handleSelect = (assistantId) => {
    // 🔹 permite desmarcar o mesmo assistente
    setSelectedAssistant((prev) => (prev === assistantId ? null : assistantId));
  };

  const handleConfirm = async () => {
    if (!selectedAssistant) {
      alert("Selecione um assistente antes de confirmar!");
      return;
    }

    try {
      const referral = await AnamnesisService.getReferralByAnamnesis(anamnese.id);

      if (!referral || !referral.id) {
        alert("Nenhum encaminhamento encontrado para esta anamnese.");
        return;
      }

      await AnamnesisService.assignAssistant(referral.id, selectedAssistant);
      onConfirm();
    } catch (error) {
      console.error("Erro ao vincular assistente:", error);
      alert("Erro ao vincular assistente à anamnese.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Selecione o assistente para encaminhar a anamnese
        </h2>

        <div className="space-y-4 mb-8">
          {assistants.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum assistente disponível.</p>
          )}

          {assistants.map((assistant) => (
            <label
              key={assistant.id}
              onClick={() => handleSelect(assistant.id)}
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all
                ${
                  selectedAssistant === assistant.id
                    ? "border-[#3D75C4] bg-[#3D75C4]/10"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
            >
              <input
                type="checkbox"
                checked={selectedAssistant === assistant.id}
                readOnly
                className="w-4 h-4 accent-[#3D75C4]"
              />
              <span className="text-gray-800 font-medium">{assistant.name}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedAssistant || sending}
            className={`px-5 py-2 rounded-lg font-medium text-white transition
              ${
                !selectedAssistant || sending
                  ? "bg-[#3D75C4]/50 cursor-not-allowed"
                  : "bg-[#3D75C4] hover:bg-[#2F5EA4]"
              }`}
          >
            {sending ? "Encaminhando..." : "Encaminhar paciente"}
          </button>
        </div>
      </div>
    </div>
  );
}
