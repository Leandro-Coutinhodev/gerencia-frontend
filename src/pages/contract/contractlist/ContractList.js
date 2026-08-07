// src/pages/contracts/ContractList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Eye, Download, Search, FileText,
  Clock, CheckCircle2, XCircle, AlertCircle,
  FileCheck, FileClock, ChevronDown, ExternalLink
} from "lucide-react";
import ContractService from "../../../services/ContractService";
import Alert from "../../../components/alert/Alert";
import CreateContractModal from "../../../modal/createcontractmodal/CreateContractModal";
import config from "../../../config/Config";

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  RASCUNHO: {
    label: "Rascunho",
    color: "bg-gray-100 text-gray-600",
    icon: FileText,
  },
  AGUARDANDO_ASSINATURA: {
    label: "Aguardando Assinaturas",
    color: "bg-yellow-50 text-yellow-700",
    icon: FileClock,
  },
  ASSINADO_PARCIALMENTE: {
    label: "Assinado Parcialmente",
    color: "bg-blue-50 text-blue-700",
    icon: Clock,
  },
  ASSINADO: {
    label: "Assinado",
    color: "bg-green-50 text-green-700",
    icon: CheckCircle2,
  },
  CANCELADO: {
    label: "Cancelado",
    color: "bg-red-50 text-red-700",
    icon: XCircle,
  },
  EXPIRADO: {
    label: "Expirado",
    color: "bg-orange-50 text-orange-700",
    icon: AlertCircle,
  },
  ASSINADO_EXTERNAMENTE: {
    label: "Assinado Externamente",
    color: "bg-purple-50 text-purple-700",
    icon: FileCheck,
  },
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function ContractList() {
  const navigate = useNavigate();

  const [contracts,    setContracts]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [alert,        setAlert]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [modalOpen,    setModalOpen]    = useState(false);
  const [detailId,     setDetailId]     = useState(null); // contrato expandido

  const apiHost = config.URLS.HOST;

  // ── Carregamento ────────────────────────────────────────────────────────────

  const load = async () => {
    setLoading(true);
    try {
      const data = await ContractService.getAll();
      setContracts(Array.isArray(data) ? data : []);
    } catch {
      setAlert({ type: "error", message: "Erro ao carregar contratos." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Filtros ─────────────────────────────────────────────────────────────────

  const filtered = contracts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (c.patientName  || "").toLowerCase().includes(q) ||
      (c.guardianName || "").toLowerCase().includes(q) ||
      (c.templateName || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "TODOS" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Contagens por status para os chips de filtro
  const countByStatus = contracts.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  // ── Download PDF ────────────────────────────────────────────────────────────

  const handleDownload = (contractId) => {
    const url = `${apiHost}/api-gateway/gerencia/contracts/${contractId}/pdf`;
    window.open(url, "_blank");
  };

  // ── Sucesso na criação ──────────────────────────────────────────────────────

  const handleCreateSuccess = () => {
    load();
    setModalOpen(false);
    setAlert({ type: "success", message: "Contrato criado com sucesso!" });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const statusFilterOptions = [
    "TODOS",
    "AGUARDANDO_ASSINATURA",
    "ASSINADO_PARCIALMENTE",
    "ASSINADO",
    "ASSINADO_EXTERNAMENTE",
    "CANCELADO",
    "EXPIRADO",
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">

      {/* Alert */}
      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message}
            onClose={() => setAlert(null)} duration={4000} />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-4">
        Página Inicial <span className="mx-1">›</span>
        <span className="text-gray-700 font-medium">Contratos</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Contratos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie contratos de prestação de serviço e documentos assinados.
          </p>
        </div>

        {/* Botão com dropdown para navegar aos modelos ou criar */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => navigate("/contratos/modelos")}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200
              rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            <FileText size={15} /> Modelos
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5
              rounded-full text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
          >
            <Plus size={16} /> Novo Contrato
          </button>
        </div>
      </div>

      {/* Cards de resumo
      {!loading && contracts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <SummaryCard
            label="Total"
            value={contracts.length}
            color="text-gray-700"
            bg="bg-gray-50"
          />
          <SummaryCard
            label="Aguardando"
            value={(countByStatus["AGUARDANDO_ASSINATURA"] || 0) +
                   (countByStatus["ASSINADO_PARCIALMENTE"] || 0)}
            color="text-yellow-700"
            bg="bg-yellow-50"
          />
          <SummaryCard
            label="Assinados"
            value={(countByStatus["ASSINADO"] || 0) +
                   (countByStatus["ASSINADO_EXTERNAMENTE"] || 0)}
            color="text-green-700"
            bg="bg-green-50"
          />
          <SummaryCard
            label="Cancelados/Expirados"
            value={(countByStatus["CANCELADO"] || 0) +
                   (countByStatus["EXPIRADO"] || 0)}
            color="text-red-700"
            bg="bg-red-50"
          />
        </div>
      )} */}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Busca */}
        <div className="relative flex-1">
          <Search size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por paciente, responsável ou modelo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {/* Status */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none w-full sm:w-56 pl-3 pr-8 py-2 border border-gray-200
              rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2
              focus:ring-primary/30 cursor-pointer"
          >
            <option value="TODOS">Todos os status</option>
            {statusFilterOptions.slice(1).map(s => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s]?.label || s}
              </option>
            ))}
          </select>
          <ChevronDown size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {/* Vazio */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            {search || filterStatus !== "TODOS"
              ? "Nenhum contrato encontrado com esses filtros."
              : "Nenhum contrato cadastrado ainda."}
          </p>
          {!search && filterStatus === "TODOS" && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 text-sm text-primary hover:underline font-medium"
            >
              Criar primeiro contrato
            </button>
          )}
        </div>
      )}

      {/* Tabela */}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Paciente
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Responsável
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide
                  hidden md:table-cell">
                  Modelo
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide
                  hidden lg:table-cell">
                  Assinaturas
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide
                  hidden sm:table-cell">
                  Data
                </th>
                <th className="py-3 px-3 text-center text-xs font-semibold text-gray-500
                  uppercase tracking-wide">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(contract => {
                const statusCfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.RASCUNHO;
                const StatusIcon = statusCfg.icon;
                const isExpanded = detailId === contract.id;
                const totalParticipants  = (contract.participants || []).length;
                const signedParticipants = (contract.participants || [])
                  .filter(p => p.signingStatus === "ASSINADO").length;
                const hasPdf =
                  contract.status === "ASSINADO" ||
                  contract.status === "ASSINADO_EXTERNAMENTE";

                return (
                  <>
                    <tr
                      key={contract.id}
                      className={`border-b border-gray-50 transition hover:bg-gray-50/50
                        ${isExpanded ? "bg-primary/5" : ""}`}
                    >
                      {/* Paciente */}
                      <td className="py-3 px-3">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                          {contract.patientName}
                        </p>
                      </td>

                      {/* Responsável */}
                      <td className="py-3 px-3">
                        <p className="text-sm text-gray-600 truncate max-w-[140px]">
                          {contract.guardianName}
                        </p>
                      </td>

                      {/* Modelo */}
                      <td className="py-3 px-3 hidden md:table-cell">
                        <p className="text-sm text-gray-500 truncate max-w-[120px]">
                          {contract.templateName || (
                            <span className="italic text-gray-400">Upload</span>
                          )}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1
                          rounded-full font-medium ${statusCfg.color}`}>
                          {/* <StatusIcon size={11} /> */}
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Assinaturas */}
                      <td className="py-3 px-3 hidden lg:table-cell">
                        {totalParticipants > 0 ? (
                          <div className="flex items-center gap-2">
                            {/* <div className="flex -space-x-1">
                              {(contract.participants || []).map((p, i) => (
                                <div
                                  key={p.id}
                                  title={`${p.name} (${p.signingStatus})`}
                                  className={`w-5 h-5 rounded-full border-2 border-white
                                    flex items-center justify-center text-white text-xs
                                    ${p.signingStatus === "ASSINADO"
                                      ? "bg-green-500"
                                      : p.signingStatus === "REJEITADO"
                                        ? "bg-red-400"
                                        : "bg-gray-300"
                                    }`}
                                >
                                  {p.signingOrder}
                                </div>
                              ))}
                            </div> */}
                            <span className="text-xs text-gray-500">
                              {signedParticipants}/{totalParticipants}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </td>

                      {/* Data */}
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <p className="text-xs text-gray-400">
                          {contract.createdAt
                            ? new Date(contract.createdAt).toLocaleDateString("pt-BR")
                            : "—"}
                        </p>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {/* Detalhes */}
                          <button
                            onClick={() => setDetailId(isExpanded ? null : contract.id)}
                            title="Ver detalhes"
                            className={`p-1.5 rounded-lg transition
                              ${isExpanded
                                ? "bg-primary/10 text-primary"
                                : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                              }`}
                          >
                            <Eye size={15} />
                          </button>

                          {/* Download PDF */}
                          {hasPdf && (
                            <button
                              onClick={() => handleDownload(contract.id)}
                              title="Baixar PDF assinado"
                              className="p-1.5 text-gray-400 hover:text-primary
                                hover:bg-primary/5 rounded-lg transition"
                            >
                              <Download size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Linha expandida: detalhes dos participantes */}
                    {isExpanded && (
                      <tr key={`detail-${contract.id}`} className="bg-primary/5">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* Info do contrato */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500
                                uppercase tracking-wide mb-2">
                                Informações
                              </p>
                              <dl className="space-y-1 text-sm">
                                <InfoRow label="Paciente"    value={contract.patientName} />
                                <InfoRow label="Responsável" value={contract.guardianName} />
                                <InfoRow
                                  label="Modelo"
                                  value={contract.templateName || "PDF Externo"} />
                                <InfoRow
                                  label="Criado em"
                                  value={contract.createdAt
                                    ? new Date(contract.createdAt)
                                        .toLocaleString("pt-BR")
                                    : "—"} />
                                {contract.hash && (
                                  <InfoRow
                                    label="Hash"
                                    value={contract.hash.substring(0, 16) + "..."} />
                                )}
                              </dl>
                            </div>

                            {/* Participantes */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500
                                uppercase tracking-wide mb-2">
                                Participantes / Fila de Assinatura
                              </p>
                              {(contract.participants || []).length === 0 ? (
                                <p className="text-xs text-gray-400 italic">
                                  Sem fila de assinatura (PDF externo).
                                </p>
                              ) : (
                                <div className="space-y-1.5">
                                  {(contract.participants || []).map(p => (
                                    <div key={p.id}
                                      className="flex items-center gap-2.5">
                                      {/* Indicador */}
                                      <div className={`w-2 h-2 rounded-full flex-shrink-0
                                        ${p.signingStatus === "ASSINADO"
                                          ? "bg-green-500"
                                          : p.signingStatus === "REJEITADO"
                                            ? "bg-red-400"
                                            : "bg-gray-300"
                                        }`} />
                                      {/* Dados */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-xs font-medium text-gray-800">
                                            {p.name}
                                          </span>
                                          <span className="text-xs text-gray-400">
                                            {p.role}
                                          </span>
                                          <span className={`text-xs px-1.5 py-0.5 rounded
                                            font-medium
                                            ${p.signingStatus === "ASSINADO"
                                              ? "bg-green-50 text-green-700"
                                              : p.signingStatus === "REJEITADO"
                                                ? "bg-red-50 text-red-600"
                                                : "bg-gray-100 text-gray-500"
                                            }`}>
                                            {p.signingStatus === "ASSINADO" ? "Assinado"
                                              : p.signingStatus === "REJEITADO" ? "Rejeitado"
                                              : "Pendente"}
                                          </span>
                                        </div>
                                        {p.signedAt && (
                                          <p className="text-xs text-gray-400">
                                            {new Date(p.signedAt).toLocaleString("pt-BR")}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Ações do detalhe */}
                          <div className="flex gap-3 mt-4 pt-3 border-t border-primary/10">
                            {hasPdf && (
                              <button
                                onClick={() => handleDownload(contract.id)}
                                className="flex items-center gap-1.5 text-sm text-primary
                                  font-medium hover:text-primary/80 transition"
                              >
                                <Download size={14} /> Baixar PDF assinado
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rodapé contagem */}
      {!loading && contracts.length > 0 && (
        <p className="text-xs text-gray-400 text-right mt-4">
          {filtered.length} de {contracts.length} contrato
          {contracts.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Modal de criação */}
      <CreateContractModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function SummaryCard({ label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl px-4 py-3`}>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <dt className="text-gray-500 w-24 flex-shrink-0">{label}:</dt>
      <dd className="font-medium text-gray-800 truncate">{value}</dd>
    </div>
  );
}