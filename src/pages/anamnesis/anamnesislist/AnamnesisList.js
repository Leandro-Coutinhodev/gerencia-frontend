// src/pages/anamnesis/anamnesislist/AnamnesisList.js
import { useEffect, useState } from "react";
import { Pencil, Trash2, Search, Eye } from "lucide-react";
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

  // fluxo encaminhar
  const [buscarModalOpen, setBuscarModalOpen] = useState(false);
  const [encaminharModalOpen, setEncaminharModalOpen] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [sending, setSending] = useState(false);

  // Paginação
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

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

  // Filtrar pacientes pelo nome
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

  // Selecionar paciente para encaminhar (vindo do modal)
  const handleSelectPaciente = (paciente) => {
    setPacienteSelecionado(paciente);
    setBuscarModalOpen(false);
    setEncaminharModalOpen(true);
  };

  // Confirmar e cadastrar anamnese mínima (encaminhar)
  const handleEncaminharConfirm = async (paciente) => {
    if (!paciente) return;
    setSending(true);
    try {
      await AnamnesisService.cadastrar({ patientId: paciente.id });
      setAlert({
        type: "success",
        message: `Anamnese encaminhada para ${paciente.name || paciente.nome}!`,
      });
      await fetchAnamneses();
      setEncaminharModalOpen(false);
      setPacienteSelecionado(null);
    } catch (error) {
      console.error("Erro ao encaminhar:", error);
      setAlert({ type: "error", message: "Erro ao encaminhar anamnese." });
    } finally {
      setSending(false);
    }
  };

  // Excluir
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

  if (loading)
    return <p className="text-center text-gray-500">Carregando anamneses...</p>;

  // Paginação simples
  const totalPages = Math.ceil(filtered.length / perPage);
  const startIndex = (page - 1) * perPage;
  const currentPageData = filtered.slice(startIndex, startIndex + perPage);

  const anamnesesAgrupadas = Object.values(
    anamneses.reduce((acc, a) => {
      const id = a.patient?.id || a.patientId;
      if (!acc[id]) {
        acc[id] = {
          id,
          nome: a.patient?.name || a.patientName || "—",
          responsavel: a.guardianName || "—",
          dataResposta: new Date(a.interviewDate).toLocaleDateString("pt-BR"),
          totalAnamneses: 0,
        };
      }
      acc[id].totalAnamneses += 1;
      return acc;
    }, {})
  );

  // Filtrar anamneses agrupadas para a aba histórico
  const anamnesesAgrupadasFiltradas = anamnesesAgrupadas.filter(paciente =>
    paciente.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Alertas */}
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

      {/* Cabeçalho: Título (esq) + Botão Encaminhar (dir) - mesma linha */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Anamneses</h2>

        <button
          className="bg-primary text-white px-5 py-2 rounded-full hover:bg-primary/90 transition flex items-center gap-2 shadow-sm"
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
          <span>Encaminhar Anamnese</span>
        </button>
      </div>

      {/* Linha abaixo do cabeçalho: Tabs (esq) e Campo de busca (dir) — mesma linha, acima da tabela */}
      <div className="flex items-center justify-between mb-3">
        {/* Tabs à esquerda */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("encaminhada")}
            className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === "encaminhada"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
              }`}
          >
            Anamnese encaminhada
          </button>

          <button
            onClick={() => setActiveTab("historico")}
            className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === "historico"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
              }`}
          >
            Histórico
          </button>
        </div>

        {/* Campo de busca à direita */}
        <div className="flex items-center">
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Conteúdo da aba "Anamnese encaminhada" */}
      {activeTab === "encaminhada" && (
        <div className="bg-white rounded-xl shadow p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="pb-2">Nome</th>
                <th className="pb-2">Data da entrevista</th>
                <th className="pb-2">Responsável</th>
                <th className="pb-2">Telefone</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.length > 0 ? (
                currentPageData.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="py-2">{a.patientName}</td>
                    <td className="py-2">
                      {a.interviewDate
                        ? new Date(a.interviewDate).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="py-2">{a.guardianName || "-"}</td>
                    <td className="py-2">{a.guardianPhone || "-"}</td>
                    <td className="py-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${a.status === "Encaminhado"
                            ? "bg-blue-100 text-blue-700"
                            : a.status === "Não Respondido"
                              ? "bg-red-100 text-red-700"
                              : a.status === "Em Análise"
                                ? "bg-amber-100 text-amber-700"
                                : a.status === "Pronto"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {a.status}
                      </span>
                    </td>

                    <td className="py-2 flex justify-center gap-3">
                      <button
                        className={`${a.status === "Encaminhada"
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-primary hover:text-blue-800"
                          }`}
                        title={
                          a.status === "Encaminhada"
                            ? "Edição desativada para anamneses encaminhadas"
                            : "Editar anamnese"
                        }
                        onClick={() => {
                          if (a.status !== "Encaminhada") navigate(`/anamnese/edit/${a.id}`);
                        }}
                        disabled={a.status === "Encaminhada"}
                      >
                        <Pencil size={18} />
                      </button>


                      <button
                        className="text-primary hover:text-blue-800"
                        onClick={() => handleDeleteClick(a)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
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
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded px-2 py-1"
              >
                {[10, 20, 30].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <span>
                {startIndex + 1}-{Math.min(startIndex + perPage, filtered.length)} de{" "}
                {filtered.length} itens
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                ←
              </button>
              <span>Página {page}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da aba "Histórico" - CORRIGIDO */}
      {activeTab === "historico" && (
        <div className="bg-white rounded-xl shadow p-6">

          {/* Tabela */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-600">
                  <th className="py-3 px-4 font-medium">Nome</th>
                  <th className="py-3 px-4 font-medium">Data da Resposta</th>
                  <th className="py-3 px-4 font-medium">Responsável</th>
                  <th className="py-3 px-4 font-medium text-center">Total de anamnese</th>
                  <th className="py-3 px-4 font-medium text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {anamnesesAgrupadasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">
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
                      <td className="py-3 px-4">{paciente.responsavel}</td>
                      <td className="py-3 px-4 text-center font-medium">
                        {paciente.totalAnamneses} anamnese
                        {paciente.totalAnamneses > 1 ? "s" : ""}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            className="text-primary hover:text-primary/70 transition"
                            title="Visualizar histórico"
                            onClick={() => navigate(`/anamnese/historico/${paciente.id}`)}
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

          {/* Paginação simulada */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Exibir</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded px-2 py-1"
              >
                {[10, 20, 30].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <span>
                {startIndex + 1}-{Math.min(startIndex + perPage, filtered.length)} de{" "}
                {filtered.length} itens
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                ←
              </button>
              <span>Página {page}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais */}
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