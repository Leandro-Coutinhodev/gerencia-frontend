// src/modal/buscarpacientemodal/BuscarPacienteModal.jsx
import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import PatientsService from "../../services/PatientsService";

function BuscarPacienteModal({ isOpen, onClose, onSelectPaciente }) {
  const [cpf, setCpf] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  const buscarPaciente = async (valorCpf) => {
    if (!valorCpf || valorCpf.length < 3) {
      setResultados([]);
      return;
    }
    setLoading(true);
    try {
      const data = await PatientsService.buscarPorCpf(valorCpf);
      setResultados(Array.isArray(data) ? data : [data]);
    } catch (error) {
      setResultados([]);
      console.error("Erro buscarPorCpf:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setResultados([]);
      setPacienteSelecionado(null);
      setCpf("");
      return;
    }

    const handler = setTimeout(() => buscarPaciente(cpf), 500);
    return () => clearTimeout(handler);
  }, [cpf, isOpen]);

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
              placeholder="Digite nome ou CPF do paciente"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Resultados */}
        {loading && (
          <p className="text-sm text-gray-500 italic mb-4">Buscando...</p>
        )}

        {resultados.length > 0 && (
          <ul className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-56 overflow-y-auto mb-6">
            {resultados.map((paciente) => {
              const selecionado = pacienteSelecionado?.id === paciente.id;
              return (
                <li
                  key={paciente.id}
                  className={`p-3 cursor-pointer transition ${selecionado ? "bg-blue-50 border-l-4 border-primary" : "hover:bg-gray-50"
                    }`}
                  onClick={() => setPacienteSelecionado(paciente)}
                >
                  <div className="font-medium text-gray-800">
                    {paciente.name || paciente.nome}
                  </div>
                  <div className="text-sm text-gray-500">
                    CPF: {paciente.cpf || "-"} • Nasc:{" "}
                    {paciente.dateBirth ||
                      paciente.birthDate ||
                      paciente.dataNascimento ||
                      "-"}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && cpf.length >= 3 && resultados.length === 0 && (
          <p className="text-sm text-gray-500 mb-6">Nenhum paciente encontrado.</p>
        )}

        {/* Ações */}
        <div className="flex justify-between items-center mt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm"
          >
            Voltar
          </button>

          <button
            disabled={!pacienteSelecionado}
            onClick={() => onSelectPaciente(pacienteSelecionado)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${pacienteSelecionado
                ? "bg-primary text-white hover:bg-primary/90"
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
