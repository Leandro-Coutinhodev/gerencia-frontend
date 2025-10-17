// src/modal/encaminharanamnese/EncaminharAnamneseModal.jsx
import React from "react";
import { X } from "lucide-react";

function EncaminharAnamneseModal({ isOpen, paciente, onClose, onConfirm, sending = false }) {
  if (!isOpen || !paciente) return null;

  const guardian = paciente.guardian || paciente.guardianDto || {};
  const guardianName = guardian.name || paciente.guardianName || "-";
  const date = paciente.dateBirth || paciente.birthDate || paciente.dataNascimento;
  const formattedDate = date ? new Date(date).toLocaleDateString("pt-BR") : "-";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 relative">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Enviar anamnese para o responsável</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Buscar paciente */}
        <div className="mb-5">
          <label className="block text-sm text-gray-600 mb-1">Buscar paciente</label>
          <input
            type="text"
            placeholder="Digite nome ou CPF do paciente"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled
            value={paciente.name || paciente.nome || ""}
          />
        </div>

        {/* Informações do paciente */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Informações do paciente</h3>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Nome completo</label>
              <input
                type="text"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
                value={paciente.name || paciente.nome || ""}
                disabled
              />
            </div>

            {/* CPF e Data */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">CPF*</label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
                  value={paciente.cpf || ""}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Data de Nascimento*</label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
                  value={formattedDate}
                  disabled
                />
              </div>
            </div>

            {/* Responsável */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Responsável</label>
              <input
                type="text"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
                value={guardianName}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            disabled={sending}
          >
            Voltar
          </button>
          <button
            onClick={() => onConfirm(paciente)}
            disabled={sending}
            className={`px-5 py-2.5 rounded-lg font-medium transition
    ${sending
                ? "bg-primary/60 text-white cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
              }`}
          >
            {sending ? "Enviando..." : "Encaminhar anamnese"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default EncaminharAnamneseModal;
