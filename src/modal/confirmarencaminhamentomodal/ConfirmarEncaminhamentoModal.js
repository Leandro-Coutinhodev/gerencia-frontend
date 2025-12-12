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
  const [showEmailOption, setShowEmailOption] = useState(false);
  const [sendViaEmail, setSendViaEmail] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedAssistant(null);
      setShowEmailOption(false);
      setSendViaEmail(false);
      AssistantService.getAll()
        .then((data) => setAssistants(data))
        .catch((err) => console.error("Erro ao carregar assistentes:", err));
    }
  }, [isOpen]);

  const handleSelect = (assistantId) => {
    setSelectedAssistant((prev) => (prev === assistantId ? null : assistantId));
  };

  const handleNext = () => {
    if (!selectedAssistant) {
      alert("Selecione um assistente antes de continuar!");
      return;
    }
    setShowEmailOption(true);
  };

  const handleConfirm = async () => {
    try {
      const referral = await AnamnesisService.getReferralByAnamnesis(anamnese.id);
      if (!referral || !referral.id) {
        alert("Nenhum encaminhamento encontrado para esta anamnese.");
        return;
      }

      if (sendViaEmail) {
        await AnamnesisService.assignAssistantEmail(referral.id, selectedAssistant);
      } else {
        await AnamnesisService.assignAssistant(referral.id, selectedAssistant);
      }

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
        {!showEmailOption ? (
          <>
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
                onClick={handleNext}
                disabled={!selectedAssistant}
                className={`px-5 py-2 rounded-lg font-medium text-white transition
                  ${
                    !selectedAssistant
                      ? "bg-[#3D75C4]/50 cursor-not-allowed"
                      : "bg-[#3D75C4] hover:bg-[#2F5EA4]"
                  }`}
              >
                Continuar
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowEmailOption(false)}
              className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Como deseja encaminhar o relatório?
            </h2>

            <div className="space-y-4 mb-8">
              <label
                onClick={() => setSendViaEmail(false)}
                className={`flex items-start gap-4 border rounded-xl px-5 py-4 cursor-pointer transition-all
                  ${
                    !sendViaEmail
                      ? "border-[#3D75C4] bg-[#3D75C4]/10"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <input
                  type="radio"
                  checked={!sendViaEmail}
                  readOnly
                  className="w-4 h-4 mt-1 accent-[#3D75C4]"
                />
                <div>
                  <div className="text-gray-800 font-medium mb-1">Encaminhamento Direto</div>
                  <p className="text-sm text-gray-600">
                    O assistente receberá o relatório diretamente no sistema
                  </p>
                </div>
              </label>

              <label
                onClick={() => setSendViaEmail(true)}
                className={`flex items-start gap-4 border rounded-xl px-5 py-4 cursor-pointer transition-all
                  ${
                    sendViaEmail
                      ? "border-[#3D75C4] bg-[#3D75C4]/10"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <input
                  type="radio"
                  checked={sendViaEmail}
                  readOnly
                  className="w-4 h-4 mt-1 accent-[#3D75C4]"
                />
                <div>
                  <div className="text-gray-800 font-medium mb-1">Enviar por Email</div>
                  <p className="text-sm text-gray-600">
                    O assistente receberá uma notificação por email com o relatório
                  </p>
                </div>
              </label>
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
                disabled={sending}
                className={`px-5 py-2 rounded-lg font-medium text-white transition
                  ${
                    sending
                      ? "bg-[#3D75C4]/50 cursor-not-allowed"
                      : "bg-[#3D75C4] hover:bg-[#2F5EA4]"
                  }`}
              >
                {sending ? "Encaminhando..." : "Encaminhar paciente"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}