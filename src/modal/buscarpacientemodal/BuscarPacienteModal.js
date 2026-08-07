// src/modal/buscarpacientemodal/BuscarPacienteModal.jsx
// Modal genérico de busca de paciente — reutilizável em qualquer contexto.
// Props:
//   isOpen          bool
//   onClose         () => void
//   onSelectPaciente (paciente) => void
//   title?          string  — título do modal          (default: "Buscar Paciente")
//   confirmLabel?   string  — texto do botão confirmar (default: "Selecionar")
//   description?    string  — subtítulo opcional

import { useState, useEffect, useRef } from "react";
import { X, Search, User } from "lucide-react";
import PatientsService from "../../services/PatientsService";

function BuscarPacienteModal({
  isOpen,
  onClose,
  onSelectPaciente,
  title        = "Buscar Paciente",
  confirmLabel = "Selecionar",
  description,
}) {
  const [searchTerm,          setSearchTerm]          = useState("");
  const [resultados,          setResultados]          = useState([]);
  const [loading,             setLoading]             = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const inputRef = useRef(null);

  // Foca o input ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setResultados([]);
      setPacienteSelecionado(null);
      setSearchTerm("");
    }
  }, [isOpen]);

  // Debounce de busca
  useEffect(() => {
    if (!isOpen) return;
    if (!searchTerm || searchTerm.trim().length < 3) {
      setResultados([]);
      return;
    }
    const handler = setTimeout(() => buscar(searchTerm.trim()), 450);
    return () => clearTimeout(handler);
  }, [searchTerm, isOpen]);

  const buscar = async (termo) => {
    setLoading(true);
    try {
      const data = await PatientsService.buscarPorNomeOuCpf(termo);
      setResultados(Array.isArray(data) ? data : []);
    } catch {
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!pacienteSelecionado) return;
    onSelectPaciente(pacienteSelecionado);
  };

  // Fecha com Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasMin = searchTerm.trim().length >= 3;
  const noResults = hasMin && !loading && resultados.length === 0;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col
        max-h-[85vh] overflow-hidden">

        {/* Cabeçalho */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4
          border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-0.5 -mr-1 -mt-0.5
              rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Campo de busca */}
        <div className="px-6 pt-4 pb-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400
                pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Nome ou CPF do paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5
                text-sm focus:outline-none focus:ring-2 focus:ring-primary/30
                focus:border-primary transition placeholder-gray-400"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary
                  rounded-full animate-spin" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1.5 ml-1">
            Digite pelo menos 3 caracteres para buscar
          </p>
        </div>

        {/* Lista de resultados */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-[120px]">

          {/* Aguardando digitação */}
          {!hasMin && !loading && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
              <Search size={36} strokeWidth={1.5} />
              <p className="text-sm mt-2 text-gray-400">Digite para buscar</p>
            </div>
          )}

          {/* Sem resultados */}
          {noResults && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <User size={36} strokeWidth={1.5} className="text-gray-300" />
              <p className="text-sm font-medium mt-2">Nenhum paciente encontrado</p>
              <p className="text-xs text-gray-400 mt-1">
                Tente buscar por outro nome ou CPF
              </p>
            </div>
          )}

          {/* Resultados */}
          {resultados.length > 0 && (
            <>
              <p className="text-xs text-gray-400 mb-2">
                {resultados.length} {resultados.length === 1
                  ? "paciente encontrado"
                  : "pacientes encontrados"}
              </p>
              <ul className="space-y-1.5">
                {resultados.map((paciente) => {
                  const selecionado = pacienteSelecionado?.id === paciente.id;
                  return (
                    <li
                      key={paciente.id}
                      onClick={() => setPacienteSelecionado(paciente)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer
                        transition-all border-2
                        ${selecionado
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-gray-50 hover:bg-gray-100"
                        }`}
                    >
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center
                        flex-shrink-0 text-sm font-bold
                        ${selecionado
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-500"
                        }`}>
                        {paciente.name?.charAt(0).toUpperCase()}
                      </div>

                      {/* Dados */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {paciente.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          CPF: {paciente.cpf || "—"}
                          {paciente.dateBirth && (
                            <> · Nasc: {new Date(paciente.dateBirth)
                              .toLocaleDateString("pt-BR")}</>
                          )}
                        </p>
                        {paciente.guardian?.name && (
                          <p className="text-xs text-gray-400 truncate">
                            Resp: {paciente.guardian.name}
                          </p>
                        )}
                      </div>

                      {/* Check */}
                      {selecionado && (
                        <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0
                          flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex justify-between items-center px-6 py-4
          border-t border-gray-100 bg-gray-50/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-gray-200 text-gray-600
              hover:bg-gray-100 transition text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            disabled={!pacienteSelecionado}
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition
              flex items-center gap-2
              ${pacienteSelecionado
                ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuscarPacienteModal;