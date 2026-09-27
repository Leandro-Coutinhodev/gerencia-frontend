import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Pencil, Trash2 } from "lucide-react";
import FinanceiroService from "../../../services/FinanceiroService";
import CadastroCobrancaModal from "../../../modal/cadastrocobrancamodal/CadastroCobrancaModal";
import DarBaixaModal from "../../../modal/darbaixamodal/DarBaixaModal";
import Alert from "../../../components/alert/Alert";
import ConfirmDialog from "../../../components/confirm/ConfirmDialog";

const STATUS_FILTROS = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "PAGO", label: "Pago" },
  { value: "ATRASADO", label: "Atrasado" },
];

function statusExibicao(cobranca) {
  if (cobranca.atrasado) return "ATRASADO";
  return cobranca.status;
}

const STATUS_LABEL = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  ATRASADO: "Atrasado",
};

const STATUS_COLOR = {
  PENDENTE: "bg-yellow-50 text-yellow-700",
  PAGO: "bg-green-50 text-green-700",
  ATRASADO: "bg-red-50 text-red-700",
};

function CobrancaList() {
  const [searchParams] = useSearchParams();
  const statusDaUrl = searchParams.get("status");
  const filtroInicial = STATUS_FILTROS.some((f) => f.value === statusDaUrl) ? statusDaUrl : "TODOS";

  const [cobrancas, setCobrancas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState(filtroInicial);
  const [modalOpen, setModalOpen] = useState(false);
  const [baixaOpen, setBaixaOpen] = useState(false);
  const [cobrancaSelecionada, setCobrancaSelecionada] = useState(null);
  const [cobrancaEditando, setCobrancaEditando] = useState(null);
  const [cobrancaParaExcluir, setCobrancaParaExcluir] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchCobrancas = async () => {
    try {
      const data = await FinanceiroService.listarCobrancas();
      setCobrancas(data);
    } catch (error) {
      console.error("Erro ao carregar cobranças:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCobrancas();
  }, []);

  const cobrancasFiltradas =
    filtroStatus === "TODOS"
      ? cobrancas
      : cobrancas.filter((c) => statusExibicao(c) === filtroStatus);

  const handleSave = async (dados) => {
    try {
      if (cobrancaEditando) {
        await FinanceiroService.atualizarCobranca(cobrancaEditando.id, dados);
        setAlert({ type: "success", message: "Cobrança atualizada com sucesso!" });
      } else {
        await FinanceiroService.cadastrarCobranca(dados);
        setAlert({ type: "success", message: "Cobrança cadastrada com sucesso!" });
      }
      fetchCobrancas();
      setModalOpen(false);
      setCobrancaEditando(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erro ao salvar cobrança.";
      setAlert({ type: "error", message: errorMessage });
    }
  };

  const handleExcluirClick = (cobranca) => {
    setCobrancaParaExcluir(cobranca);
  };

  const handleConfirmarExclusao = async () => {
    if (!cobrancaParaExcluir) return;
    try {
      await FinanceiroService.excluirCobranca(cobrancaParaExcluir.id);
      setAlert({ type: "success", message: "Cobrança excluída com sucesso!" });
      fetchCobrancas();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erro ao excluir cobrança.";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setCobrancaParaExcluir(null);
    }
  };

  const handleConfirmarBaixa = async (dadosPagamento) => {
    if (!cobrancaSelecionada) return;
    try {
      await FinanceiroService.darBaixa(cobrancaSelecionada.id, dadosPagamento);
      setAlert({ type: "success", message: "Pagamento registrado com sucesso!" });
      handleVerRecibo(cobrancaSelecionada.id);
      fetchCobrancas();
      setBaixaOpen(false);
      setCobrancaSelecionada(null);
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao registrar pagamento." });
    }
  };

  const handleVerRecibo = async (id) => {
    try {
      const blob = await FinanceiroService.gerarRecibo(id);
      const url = window.URL.createObjectURL(blob);
      // Abrir uma URL blob: numa aba nova (window.open ou <a target="_blank">)
      // não é confiável — a aba nova pode virar um contexto de navegação
      // separado que não enxerga o blob do documento que o criou, ficando
      // travada em about:blank. Forçar o download evita isso: o navegador
      // consome o blob diretamente, sem precisar renderizá-lo em outro contexto.
      const link = document.createElement("a");
      link.href = url;
      link.download = `recibo-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao gerar recibo." });
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Carregando cobranças...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {alert && (
        <div className="flex justify-center mb-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} duration={4000} />
        </div>
      )}

      <div className="text-sm text-gray-500 mb-4">
        Página Inicial <span className="mx-1">{">"}</span> Financeiro
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Cobranças</h2>
        <button
          className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition"
          onClick={() => {
            setCobrancaEditando(null);
            setModalOpen(true);
          }}
        >
          + Nova Cobrança
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {STATUS_FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltroStatus(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              filtroStatus === f.value
                ? "bg-primary text-white border-primary"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600">
              <th className="py-2 px-4 text-primary">Paciente</th>
              <th className="py-2 px-4 text-primary">Responsável</th>
              <th className="py-2 px-4 text-primary">Valor</th>
              <th className="py-2 px-4 text-primary">Vencimento</th>
              <th className="py-2 px-4 text-primary">Status</th>
              <th className="py-2 px-4 text-center text-primary">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cobrancasFiltradas.length > 0 ? (
              cobrancasFiltradas.map((cobranca) => {
                const status = statusExibicao(cobranca);
                return (
                  <tr key={cobranca.id} className="border-t hover:bg-gray-50 transition">
                    <td className="py-2 px-4">{cobranca.patientName}</td>
                    <td className="py-2 px-4">{cobranca.guardianName || "-"}</td>
                    <td className="py-2 px-4">
                      {cobranca.desconto ? (
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs text-gray-400 line-through decoration-gray-400">
                            R$ {Number(cobranca.valor).toFixed(2)}
                          </span>
                          <span>
                            R$ {(Number(cobranca.valor) - Number(cobranca.desconto)).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span>R$ {Number(cobranca.valor).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {new Date(cobranca.vencimento).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[status]}`}
                        title={status === "ATRASADO" ? `Atrasada há ${cobranca.diasAtraso} dias` : undefined}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-center">
                      {cobranca.status === "PENDENTE" && (
                        <div className="flex items-center justify-center gap-3">
                          <button
                            className="text-primary hover:text-blue-800"
                            onClick={() => {
                              setCobrancaSelecionada(cobranca);
                              setBaixaOpen(true);
                            }}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            className="text-primary"
                            onClick={() => {
                              setCobrancaEditando(cobranca);
                              setModalOpen(true);
                            }}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="text-primary hover:text-blue-800"
                            onClick={() => handleExcluirClick(cobranca)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                      {cobranca.status === "PAGO" && (
                        <button
                          className="text-primary hover:underline text-sm"
                          onClick={() => handleVerRecibo(cobranca.id)}
                        >
                          Ver recibo
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  Nenhuma cobrança encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CadastroCobrancaModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCobrancaEditando(null);
        }}
        onSave={handleSave}
        initialData={cobrancaEditando}
      />

      <DarBaixaModal
        isOpen={baixaOpen}
        onClose={() => {
          setBaixaOpen(false);
          setCobrancaSelecionada(null);
        }}
        onConfirm={handleConfirmarBaixa}
        cobranca={cobrancaSelecionada}
      />

      <ConfirmDialog
        isOpen={Boolean(cobrancaParaExcluir)}
        title="Excluir Cobrança"
        message={
          cobrancaParaExcluir
            ? `Você está prestes a excluir a cobrança de ${cobrancaParaExcluir.patientName}.\n\n⚠️ Esta ação é permanente e não pode ser desfeita.\n\nDeseja realmente continuar?`
            : ""
        }
        onConfirm={handleConfirmarExclusao}
        onCancel={() => setCobrancaParaExcluir(null)}
      />
    </div>
  );
}

export default CobrancaList;
