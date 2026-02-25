import React, { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, Edit, Eye, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ContractService from "../../../services/ContractService";

/* ── helpers ── */

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR");
};

const getSignatureLabel = (participants) => {
  if (!participants || participants.length === 0) return "Sem participantes";

  const sorted = [...participants].sort((a, b) => a.signingOrder - b.signingOrder);
  const lastSigned = [...sorted].reverse().find((p) => p.signed);

  if (!lastSigned) return "Aguardando assinatura";

  const role = lastSigned.role;
  if (role === "CONTRACTOR") {
    const g = lastSigned.guardian;
    return `Assinado pelo contratante`;
  }
  if (role === "WITNESS") {
    const u = lastSigned.user;
    const name = u?.name || "testemunha";
    return `Assinado por ${name}`;
  }
  return "Assinado";
};

const getStatusInfo = (contract) => {
  const { status, participants } = contract;

  if (status === "COMPLETED") {
    return { label: "Assinado", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
  }

  if (status === "EXPIRED") {
    return { label: "Link expirado", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
  }

  // PENDING_SIGNATURES
  const allSigned = participants?.every((p) => p.signed);
  if (allSigned) {
    return { label: "Assinado", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
  }

  return { label: "Aguardando assinatura", color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
};

/* ── component ── */

export default function ContractsList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("contratos");
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const data = await ContractService.listAll();
      setContracts(data || []);
      setFilteredContracts(data || []);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
    } finally {
      setLoading(false);
    }
  };

  /* search filter */
  useEffect(() => {
    if (!search) {
      setFilteredContracts(contracts);
    } else {
      const lower = search.toLowerCase();
      setFilteredContracts(
        contracts.filter(
          (c) =>
            c.guardian?.name?.toLowerCase().includes(lower) ||
            c.guardian?.email?.toLowerCase().includes(lower) ||
            c.patient?.name?.toLowerCase().includes(lower)
        )
      );
    }
    setCurrentPage(1);
  }, [search, contracts]);

  /* tab filter */
  const displayedContracts =
    activeTab === "historico"
      ? filteredContracts.filter((c) => c.status === "COMPLETED")
      : filteredContracts;

  /* pagination calc */
  const totalItems = displayedContracts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedContracts = displayedContracts.slice(startIdx, startIdx + itemsPerPage);

  /* actions */
  const handleCreateContract = () => navigate("/contrato/criar");

  const handleViewContract = (contract) => {
    if (contract.pdfPath && contract.status === "COMPLETED") {
      window.open(`http://localhost:8080/api-gateway/gerencia/contract/${contract.id}/pdf`, "_blank");
    }
  };

  const handleResendEmail = async (contractId) => {
    try {
      // Implementar endpoint de reenvio se necessário
      console.log("Reenviar e-mail do contrato:", contractId);
    } catch (error) {
      console.error(error);
    }
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
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-5">
        Página Inicial <span className="mx-1">{">"}</span>{" "}
        <span className="text-gray-600">Contrato</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Contrato</h1>
        <button
          onClick={handleCreateContract}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#3D75C4] text-white rounded-lg hover:bg-[#0f172a] transition font-semibold text-sm shadow-sm"
        >
          Criar Contrato
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Tabs + Search */}
        <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              className={`px-5 py-2 text-sm font-semibold rounded-md transition ${
                activeTab === "contratos"
                  ? "bg-white text-[#3D75C4] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => { setActiveTab("contratos"); setCurrentPage(1); }}
            >
              Contratos
            </button>
            <button
              className={`px-5 py-2 text-sm font-semibold rounded-md transition ${
                activeTab === "historico"
                  ? "bg-white text-[#3D75C4] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => { setActiveTab("historico"); setCurrentPage(1); }}
            >
              Histórico de Contrato
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contratante"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-3.5 px-6 text-left font-semibold text-primary text-xs tracking-wide">
                  Nome do(a) contratante
                </th>
                <th className="py-3.5 px-6 text-left font-semibold text-primary text-xs tracking-wide">
                  E-mail
                </th>
                <th className="py-3.5 px-6 text-left font-semibold text-primary text-xs tracking-wide">
                  Data de Criação
                </th>
                <th className="py-3.5 px-6 text-left font-semibold text-primary text-xs tracking-wide">
                  Assinatura
                </th>
                <th className="py-3.5 px-6 text-center font-semibold text-primary text-xs tracking-wide">
                  Status
                </th>
                <th className="py-3.5 px-6 text-center font-semibold text-primary text-xs tracking-wide">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedContracts.length > 0 ? (
                paginatedContracts.map((contract) => {
                  const statusInfo = getStatusInfo(contract);
                  const signatureLabel = getSignatureLabel(contract.participants);

                  return (
                    <tr
                      key={contract.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="py-4 px-6 text-gray-800 font-medium">
                        {contract.guardian?.name || "-"}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {contract.guardian?.email || "-"}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {formatDate(contract.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {signatureLabel}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <span
                            className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
                            style={{
                              color: statusInfo.color,
                              backgroundColor: statusInfo.bg,
                              border: `1px solid ${statusInfo.border}`,
                            }}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleResendEmail(contract.id)}
                            className="p-1.5 rounded-md text-[#3D75C4] hover:bg-blue-50 transition"
                            title="Reenviar e-mail"
                          >
                            <RefreshCw size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/contrato/editar/${contract.id}`)}
                            className="p-1.5 rounded-md text-[#3D75C4] hover:bg-blue-50 transition"
                            title="Editar contrato"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleViewContract(contract)}
                            className="p-1.5 rounded-md text-[#3D75C4] hover:bg-blue-50 transition"
                            title="Visualizar contrato"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    Nenhum contrato encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Exibir</span>
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <span>
              {totalItems > 0
                ? `${startIdx + 1}-${Math.min(startIdx + itemsPerPage, totalItems)} de ${totalItems} itens`
                : "0 itens"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>Página</span>
            <div className="relative">
              <select
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}