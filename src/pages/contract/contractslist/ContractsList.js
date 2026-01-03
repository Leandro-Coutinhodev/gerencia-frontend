import React, { useState, useEffect } from "react";
import { FileText, Plus, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContractsList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("gerados");
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Mock de dados - substituir pela chamada real à API
  const mockContracts = [
    {
      id: 1,
      patientName: "João Silva Santos",
      cpf: "123.456.789-00",
      responsavel: "Maria Silva",
      telefone: "(91) 98765-4321",
      status: "Assinado",
      createdAt: "2025-01-10"
    },
    {
      id: 2,
      patientName: "Ana Paula Costa",
      cpf: "987.654.321-00",
      responsavel: "Carlos Costa",
      telefone: "(91) 99876-5432",
      status: "Pendente",
      createdAt: "2025-01-12"
    },
    {
      id: 3,
      patientName: "Pedro Henrique Lima",
      cpf: "456.789.123-00",
      responsavel: "Fernanda Lima",
      telefone: "(91) 98123-4567",
      status: "Assinado",
      createdAt: "2025-01-15"
    }
  ];

  useEffect(() => {
    // Simula carregamento de dados
    setTimeout(() => {
      setContracts(mockContracts);
      setFilteredContracts(mockContracts);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredContracts(contracts);
    } else {
      const lower = search.toLowerCase();
      setFilteredContracts(
        contracts.filter((contract) =>
          contract.patientName.toLowerCase().includes(lower) ||
          contract.cpf.includes(lower)
        )
      );
    }
  }, [search, contracts]);

  const handleCreateContract = () => {
    navigate("/contrato/criar");
  };

  const handleViewContract = (contractId) => {
    console.log("Visualizar contrato:", contractId);
    // Navegar para página de visualização do contrato
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D75C4]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-[#f9fafc] min-h-screen">
      <div className="text-sm text-gray-500 mb-4">
        Página Inicial <span className="mx-1">{">"}</span> Encaminhar paciente
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Gerenciamento de Contratos
            </h2>
            <button
              onClick={handleCreateContract}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3D75C4] text-white rounded-lg hover:bg-[#2d5ea3] transition font-medium shadow-sm"
            >
              <Plus size={20} />
              <span>Gerar Contrato</span>
            </button>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="bg-gray-100 p-1 rounded-lg flex w-full sm:w-auto overflow-x-auto">
              <button
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeTab === "gerados"
                    ? "bg-white text-[#3D75C4] shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("gerados")}
              >
                Contratos gerados
              </button>
              <button
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeTab === "historico"
                    ? "bg-white text-[#3D75C4] shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("historico")}
              >
                Histórico de contratos
              </button>
            </div>

            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar paciente"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead>
              <tr className="border-b bg-gray-50 text-primary">
                <th className="py-3 px-4 text-left font-medium">Nome</th>
                <th className="py-3 px-4 text-left font-medium">CPF</th>
                <th className="py-3 px-4 text-left font-medium">Responsável</th>
                <th className="py-3 px-4 text-left font-medium">Telefone</th>
                <th className="py-3 px-4 text-center font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">{contract.patientName}</td>
                    <td className="py-3 px-4">{contract.cpf}</td>
                    <td className="py-3 px-4">{contract.responsavel}</td>
                    <td className="py-3 px-4">{contract.telefone}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button
                          className="text-[#3D75C4] hover:text-[#2d5ea3] transition"
                          title="Visualizar contrato"
                          onClick={() => handleViewContract(contract.id)}
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    Nenhum contrato encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Contrato encaminhado para assinatura
            </h2>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 px-6 py-2.5 bg-[#3D75C4] text-white rounded-lg hover:bg-[#2d5ea3] transition font-medium"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}