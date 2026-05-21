// src/pages/anamnesis/anamnesislist/AnamnesisList.js
import { useEffect, useState } from "react";
import { Pencil, Trash2, Search, Eye, Link2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnamnesisService from "../../../services/AnamnesisService";
import Alert from "../../../components/alert/Alert";
import ConfirmDialog from "../../../components/confirm/ConfirmDialog";
import BuscarPacienteModal from "../../../modal/buscarpacientemodal/BuscarPacienteModal";
import EncaminharAnamneseModal from "../../../modal/encaminharanamnesemodal/EncaminharAnamneseModal";

export default function AnamnesisList() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("encaminhada");
  const [anamneses, setAnamneses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [alert, setAlert] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [anamneseToDelete, setAnamneseToDelete] = useState(null);

  // Fluxo encaminhar
  const [buscarModalOpen, setBuscarModalOpen] = useState(false);
  const [encaminharModalOpen, setEncaminharModalOpen] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [sending, setSending] = useState(false);

  // Controle de link copiado
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  // Paginação
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchAnamneses = async () => {
    try {
      const data = await AnamnesisService.listar();
      setAnamneses(data);
      setFiltered(data);
    } catch (error) {
      console.error("Erro ao carregar anamneses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnamneses();
  }, []);

  // ── Filtro de busca ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!search) {
      setFiltered(anamneses);
    } else {
      const lower = search.toLowerCase();
      setFiltered(
        anamneses.filter((a) => a.patientName?.toLowerCase().includes(lower))
      );
      setPage(1);
    }
  }, [search, anamneses]);

  // ── Copiar link ──────────────────────────────────────────────────────────────

  const handleCopyLink = (anamnese) => {
    if (!anamnese.link) {
      setAlert({ type: "error", message: "Link não disponível para esta anamnese." });
      return;
    }

    navigator.clipboard.writeText(anamnese.link).then(() => {
      setCopiedLinkId(anamnese.id);
      setAlert({ type: "success", message: "Link copiado para a área de transferência!" });
      setTimeout(() => setCopiedLinkId(null), 2000);
    }).catch(() => {
      setAlert({ type: "error", message: "Erro ao copiar link." });
    });
  };

  // ── Fluxo de encaminhamento ──────────────────────────────────────────────────

  // 1. Paciente selecionado no BuscarPacienteModal → abre EncaminharAnamneseModal
  const handleSelectPaciente = (paciente) => {
    setPacienteSelecionado(paciente);
    setBuscarModalOpen(false);
    setEncaminharModalOpen(true);
  };

  // 2. Confirmação no EncaminharAnamneseModal → agora recebe templateId também
  const handleEncaminharConfirm = async (paciente, templateId) => {
    if (!paciente || !templateId) return;

    setSending(true);
    try {
      await AnamnesisService.cadastrar({
        patientId: paciente.id,
        templateId,
      });

      setAlert({
        type: "success",
        message: `Anamnese encaminhada para ${paciente.name || paciente.nome}!`,
      });

      await fetchAnamneses();
      setEncaminharModalOpen(false);
      setPacienteSelecionado(null);
    } catch (error) {
      console.error("Erro ao encaminhar:", error);
      const message = error.response?.data?.message || "Erro ao encaminhar anamnese.";
      setAlert({ type: "error", message });
    } finally {
      setSending(false);
    }
  };

  // ── Exclusão ─────────────────────────────────────────────────────────────────

  const handleDeleteClick = (anamnese) => {
    setAnamneseToDelete(anamnese);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!anamneseToDelete) return;
    try {
      await AnamnesisService.deletar(anamneseToDelete.id);
      await fetchAnamneses();
      setAlert({ type: "success", message: "Anamnese excluída com sucesso!" });
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao excluir anamnese." });
    } finally {
      setConfirmOpen(false);
      setAnamneseToDelete(null);
    }
  };

  // ── Paginação ─────────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(filtered.length / perPage);
  const startIndex = (page - 1) * perPage;
  const currentPageData = filtered.slice(startIndex, startIndex + perPage);

  // ── Agrupamento por paciente (aba Histórico) ───────────────────────────────

  const anamnesesAgrupadas = Object.values(
    anamneses.reduce((acc, a) => {
      const id = a.patientId;
      if (!acc[id]) {
        acc[id] = {
          id,
          nome: a.patientName || "—",
          dataResposta: a.interviewDate
            ? new Date(a.interviewDate).toLocaleDateString("pt-BR")
            : "-",
          totalAnamneses: 0,
        };
      }
      acc[id].totalAnamneses += 1;
      return acc;
    }, {})
  );

  const anamnesesAgrupadasFiltradas = anamnesesAgrupadas.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  // ── Badge de status ──────────────────────────────────────────────────────────

  const statusBadge = (status) => {
    const map = {
      Encaminhada: { label: "Encaminhada",   cls: "bg-blue-100 text-blue-700" },
      Pronto: { label: "Pronto",    cls: "bg-green-100 text-green-700" },
      Análise: { label: "Em Análise",    cls: "bg-amber-100 text-amber-700" },
    };
    const entry = map[status] || { label: status || "-", cls: "bg-gray-100 text-gray-600" };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${entry.cls}`}>
        {entry.label}
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading)
    return <p className="text-center text-gray-500">Carregando anamneses...</p>;

  return (
    <div className="p-6">
      {alert && (
        <div className="flex justify-center mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            duration={4000}
          />
        </div>
      )}

      <div className="text-sm text-gray-500 mb-2">
        Página Inicial &gt; Encaminhar Anamnese
      </div>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Anamneses</h2>

        <button
          className="bg-primary text-white px-5 py-2 rounded-full hover:bg-primary/90
            transition flex items-center gap-2 shadow-sm"
          onClick={() => setBuscarModalOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8l16-5-5 16-2-7-7-2z" />
          </svg>
          Encaminhar Anamnese
        </button>
      </div>

      {/* Tabs + Busca */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {["encaminhada", "historico"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium rounded-t-lg transition
                ${activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab === "encaminhada" ? "Anamnese encaminhada" : "Histórico"}
            </button>
          ))}
        </div>

        <div className="relative w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar paciente"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* ── Aba Encaminhada ── */}
      {activeTab === "encaminhada" && (
        <div className="bg-white rounded-xl shadow p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="pb-2">Nome</th>
                <th className="pb-2">Modelo</th>
                <th className="pb-2">Data da entrevista</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.length > 0 ? (
                currentPageData.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="py-2">{a.patientName}</td>
                    <td className="py-2 text-gray-500 text-xs">
                      {a.template?.name || "-"}
                    </td>
                    <td className="py-2">
                      {a.interviewDate
                        ? new Date(a.interviewDate).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="py-2">{statusBadge(a.status)}</td>
                    <td className="py-2">
                      <div className="flex justify-center gap-3">

                        {/* Copiar link */}
                        <button
                          title="Copiar link da anamnese"
                          onClick={() => handleCopyLink(a)}
                          className="text-primary hover:text-blue-800 transition-colors"
                        >
                          {copiedLinkId === a.id ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Link2 size={18} />
                          )}
                        </button>

                        {/* Editar — desabilitado enquanto status 'E' (ainda não respondida) */}
                        <button
                          title={
                            a.status === "E"
                              ? "Edição disponível após o responsável responder"
                              : "Editar anamnese"
                          }
                          onClick={() => {
                            if (a.status !== "E") navigate(`/anamnese/edit/${a.id}`);
                          }}
                          disabled={a.status === "E"}
                          className={`transition-colors ${
                            a.status === "E"
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-primary hover:text-blue-800"
                          }`}
                        >
                          <Pencil size={18} />
                        </button>

                        {/* Excluir */}
                        <button
                          title="Excluir anamnese"
                          onClick={() => handleDeleteClick(a)}
                          className="text-primary hover:text-blue-800 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    Nenhuma anamnese encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginação */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Exibir</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="border rounded px-2 py-1"
              >
                {[10, 20, 30].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>
                {startIndex + 1}–{Math.min(startIndex + perPage, filtered.length)} de{" "}
                {filtered.length} itens
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >←</button>
              <span>Página {page}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >→</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Aba Histórico ── */}
      {activeTab === "historico" && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-600">
                  <th className="py-3 px-4 font-medium">Nome</th>
                  <th className="py-3 px-4 font-medium">Data da Resposta</th>
                  <th className="py-3 px-4 font-medium text-center">
                    Total de anamneses
                  </th>
                  <th className="py-3 px-4 font-medium text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {anamnesesAgrupadasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-500">
                      Nenhum histórico encontrado.
                    </td>
                  </tr>
                ) : (
                  anamnesesAgrupadasFiltradas.map((paciente) => (
                    <tr
                      key={paciente.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4">{paciente.nome}</td>
                      <td className="py-3 px-4">{paciente.dataResposta}</td>
                      <td className="py-3 px-4 text-center font-medium">
                        {paciente.totalAnamneses} anamnese
                        {paciente.totalAnamneses > 1 ? "s" : ""}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          <button
                            title="Visualizar histórico"
                            onClick={() =>
                              navigate(`/anamnese/historico/${paciente.id}`)
                            }
                            className="text-primary hover:text-primary/70 transition"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação histórico */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Exibir</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="border rounded px-2 py-1"
              >
                {[10, 20, 30].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>
                {startIndex + 1}–{Math.min(startIndex + perPage, anamnesesAgrupadasFiltradas.length)} de{" "}
                {anamnesesAgrupadasFiltradas.length} itens
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >←</button>
              <span>Página {page}</span>
              <button
                onClick={() => setPage((p) =>
                  Math.min(Math.ceil(anamnesesAgrupadasFiltradas.length / perPage), p + 1)
                )}
                disabled={page >= Math.ceil(anamnesesAgrupadasFiltradas.length / perPage)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >→</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modais ── */}
      <BuscarPacienteModal
        isOpen={buscarModalOpen}
        onClose={() => setBuscarModalOpen(false)}
        onSelectPaciente={handleSelectPaciente}
      />

      <EncaminharAnamneseModal
        isOpen={encaminharModalOpen}
        paciente={pacienteSelecionado}
        onClose={() => {
          setEncaminharModalOpen(false);
          setPacienteSelecionado(null);
        }}
        onConfirm={handleEncaminharConfirm}
        sending={sending}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Excluir Anamnese"
        message={
          anamneseToDelete
            ? `Tem certeza que deseja excluir a anamnese de ${anamneseToDelete.patientName}?`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}