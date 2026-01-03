// src/modal/buscarpacientemodal/BuscarPacienteModal.jsx
import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import PatientsService from "../../services/PatientsService";

function BuscarPacienteModal({ isOpen, onClose, onSelectPaciente }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  const buscarPaciente = async (termo) => {
    if (!termo || termo.trim().length < 3) {
      setResultados([]);
      return;
    }

    setLoading(true);
    try {
      // Nova função que busca por nome ou CPF
      const data = await PatientsService.buscarPorNomeOuCpf(termo.trim());
      setResultados(Array.isArray(data) ? data : []);
    } catch (error) {
      setResultados([]);
      console.error("Erro ao buscar paciente:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setResultados([]);
      setPacienteSelecionado(null);
      setSearchTerm("");
      return;
    }

    // Debounce: aguarda 500ms após parar de digitar para buscar
    const handler = setTimeout(() => buscarPaciente(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Enviar anamnese para o responsável
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Campo de busca */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar paciente
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Digite o nome ou CPF do paciente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Digite pelo menos 3 caracteres para buscar
          </p>
        </div>

        {/* Resultados */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-gray-500 ml-3">Buscando pacientes...</p>
          </div>
        )}

        {!loading && resultados.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">
              {resultados.length} {resultados.length === 1 ? "paciente encontrado" : "pacientes encontrados"}
            </p>
            <ul className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {resultados.map((paciente) => {
                const selecionado = pacienteSelecionado?.id === paciente.id;
                return (
                  <li
                    key={paciente.id}
                    className={`p-3 cursor-pointer transition ${
                      selecionado
                        ? "bg-blue-50 border-l-4 border-primary"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setPacienteSelecionado(paciente)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {paciente.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          CPF: {paciente.cpf || "Não informado"} • 
                          Nasc: {paciente.dateBirth 
                            ? new Date(paciente.dateBirth).toLocaleDateString("pt-BR")
                            : "Não informado"}
                        </div>
                        {paciente.guardian?.name && (
                          <div className="text-xs text-gray-400 mt-1">
                            Responsável: {paciente.guardian.name}
                          </div>
                        )}
                      </div>
                      {selecionado && (
                        <div className="ml-3">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!loading && searchTerm.trim().length >= 3 && resultados.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Search size={48} className="mx-auto" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Nenhum paciente encontrado</p>
            <p className="text-xs text-gray-500 mt-1">
              Tente buscar por outro nome ou CPF
            </p>
          </div>
        )}

        {!loading && searchTerm.trim().length > 0 && searchTerm.trim().length < 3 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              Digite pelo menos 3 caracteres para iniciar a busca
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
          >
            Cancelar
          </button>

          <button
            disabled={!pacienteSelecionado}
            onClick={() => onSelectPaciente(pacienteSelecionado)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
              pacienteSelecionado
                ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Encaminhar anamnese
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuscarPacienteModal;