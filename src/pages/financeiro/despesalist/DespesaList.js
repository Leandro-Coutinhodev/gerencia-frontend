import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import FinanceiroService from "../../../services/FinanceiroService";
import CadastroDespesaModal from "../../../modal/cadastrodespesamodal/CadastroDespesaModal";
import Alert from "../../../components/alert/Alert";
import ConfirmDialog from "../../../components/confirm/ConfirmDialog";

function DespesaList() {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [despesaEditando, setDespesaEditando] = useState(null);
  const [despesaParaExcluir, setDespesaParaExcluir] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchDespesas = async () => {
    try {
      const data = await FinanceiroService.listarDespesas();
      setDespesas(data);
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDespesas();
  }, []);

  const handleSave = async (dados) => {
    try {
      if (despesaEditando) {
        await FinanceiroService.atualizarDespesa(despesaEditando.id, dados);
        setAlert({ type: "success", message: "Despesa atualizada com sucesso!" });
      } else {
        await FinanceiroService.cadastrarDespesa(dados);
        setAlert({ type: "success", message: "Despesa lançada com sucesso!" });
      }
      fetchDespesas();
      setModalOpen(false);
      setDespesaEditando(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erro ao salvar despesa.";
      setAlert({ type: "error", message: errorMessage });
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!despesaParaExcluir) return;
    try {
      await FinanceiroService.excluirDespesa(despesaParaExcluir.id);
      setAlert({ type: "success", message: "Despesa excluída com sucesso!" });
      fetchDespesas();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erro ao excluir despesa.";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setDespesaParaExcluir(null);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Carregando despesas...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {alert && (
        <div className="flex justify-center mb-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} duration={4000} />
        </div>
      )}

      <div className="text-sm text-gray-500 mb-4">
        Página Inicial <span className="mx-1">{">"}</span> Financeiro{" "}
        <span className="mx-1">{">"}</span> Despesas
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Despesas</h2>
        <button
          className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition"
          onClick={() => {
            setDespesaEditando(null);
            setModalOpen(true);
          }}
        >
          + Nova Despesa
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600">
              <th className="py-2 px-4 text-primary">Categoria</th>
              <th className="py-2 px-4 text-primary">Valor</th>
              <th className="py-2 px-4 text-primary">Data</th>
              <th className="py-2 px-4 text-center text-primary">Ações</th>
            </tr>
          </thead>
          <tbody>
            {despesas.length > 0 ? (
              despesas.map((despesa) => (
                <tr key={despesa.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-2 px-4">{despesa.categoria}</td>
                  <td className="py-2 px-4">R$ {Number(despesa.valor).toFixed(2)}</td>
                  <td className="py-2 px-4">{new Date(despesa.data).toLocaleDateString("pt-BR")}</td>
                  <td className="py-2 px-4 flex items-center justify-center gap-3">
                    <button
                      className="text-primary"
                      onClick={() => {
                        setDespesaEditando(despesa);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="text-primary hover:text-blue-800"
                      onClick={() => setDespesaParaExcluir(despesa)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  Nenhuma despesa encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CadastroDespesaModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setDespesaEditando(null);
        }}
        onSave={handleSave}
        initialData={despesaEditando}
      />

      <ConfirmDialog
        isOpen={Boolean(despesaParaExcluir)}
        title="Excluir Despesa"
        message={
          despesaParaExcluir
            ? `Você está prestes a excluir a despesa "${despesaParaExcluir.categoria}".\n\n⚠️ Esta ação é permanente e não pode ser desfeita.\n\nDeseja realmente continuar?`
            : ""
        }
        onConfirm={handleConfirmarExclusao}
        onCancel={() => setDespesaParaExcluir(null)}
      />
    </div>
  );
}

export default DespesaList;
