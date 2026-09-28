// src/modal/visualizarusuariomodal/VisualizarUsuarioModal.js
// Modal somente leitura com os dados de um usuário — aberto pelo ícone de "olho" na
// listagem de usuários.
import { useEffect } from "react";
import { X, User } from "lucide-react";

const ROLE_LABELS = {
  ADMIN: "Gestor",
  SECRETARY: "Secretária",
  PROFESSIONAL: "Profissional",
  ASSISTANT: "Assistente",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  } catch {
    return value;
  }
}

export default function VisualizarUsuarioModal({ isOpen, onClose, usuario }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  if (!isOpen || !usuario) return null;

  const roles = (usuario.roles || [])
    .map((r) => (typeof r === "object" ? r.name : r))
    .map((r) => ROLE_LABELS[r] || r);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center
        justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User size={15} className="text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Dados do Usuário</h2>
          </div>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100
              rounded-lg transition">
            <X size={17} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="bg-gray-50 border border-gray-100 rounded-xl divide-y divide-gray-100">
            <InfoRow label="Nome" value={usuario.name} />
            <InfoRow label="CPF" value={usuario.cpf} />
            <InfoRow label="E-mail" value={usuario.email} />
            <InfoRow label="Telefone" value={usuario.phoneNumber} />
            <InfoRow label="Data de nascimento" value={formatDate(usuario.dateBirth)} />
            <InfoRow label="Permissão" value={roles.length > 0 ? roles.join(", ") : "—"} />
            {usuario.professionalLicense && (
              <InfoRow label="Registro profissional" value={usuario.professionalLicense} />
            )}
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/60">
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
      <span className="text-xs text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 truncate">
        {value || "—"}
      </span>
    </div>
  );
}
