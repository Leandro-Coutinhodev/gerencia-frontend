// src/modal/visualizarpacientemodal/VisualizarPacienteModal.js
// Modal somente leitura com os dados de um paciente (e do responsável vinculado) —
// aberto pelo ícone de "olho" na listagem de pacientes.
import { useEffect } from "react";
import { X, User, Users } from "lucide-react";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  } catch {
    return value;
  }
}

export default function VisualizarPacienteModal({ isOpen, onClose, paciente }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  if (!isOpen || !paciente) return null;

  const guardian = paciente.guardian;
  const endereco = guardian && [
    guardian.addressLine1,
    guardian.number,
    guardian.neighborhood,
    guardian.city && guardian.state ? `${guardian.city}/${guardian.state}` : guardian.city,
  ].filter(Boolean).join(", ");

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center
        justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col
        max-h-[90vh] overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100
          flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User size={15} className="text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Dados do Paciente</h2>
          </div>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100
              rounded-lg transition">
            <X size={17} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-5">
          <div className="bg-gray-50 border border-gray-100 rounded-xl divide-y divide-gray-100">
            <InfoRow label="Nome" value={paciente.name} />
            <InfoRow label="CPF" value={paciente.cpf} />
            <InfoRow label="Data de nascimento" value={formatDate(paciente.dateBirth)} />
            <InfoRow label="Parentesco" value={paciente.kinship} />
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500
              uppercase tracking-wide mb-2">
              <Users size={13} /> Responsável
            </p>
            {guardian ? (
              <div className="bg-gray-50 border border-gray-100 rounded-xl divide-y divide-gray-100">
                <InfoRow label="Nome" value={guardian.name} />
                <InfoRow label="CPF" value={guardian.cpf} />
                <InfoRow label="E-mail" value={guardian.email} />
                <InfoRow label="Telefone" value={guardian.phoneNumber1} />
                {guardian.phoneNumber2 && (
                  <InfoRow label="Telefone 2" value={guardian.phoneNumber2} />
                )}
                <InfoRow label="Endereço" value={endereco} />
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic px-1">
                Nenhum responsável vinculado.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/60
          flex-shrink-0">
          <button onClick={onClose}
            className="px-5 py-2 border border-gray-200 rounded-full text-sm
              font-medium text-gray-600 hover:bg-white transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-xs text-gray-500 w-32 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 truncate">
        {value || "—"}
      </span>
    </div>
  );
}
