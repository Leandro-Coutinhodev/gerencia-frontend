import { useEffect, useState } from "react";
import FinanceiroService from "../../../services/FinanceiroService";
import Alert from "../../../components/alert/Alert";

function FinanceiroConfiguracao() {
  const [diasParaAtraso, setDiasParaAtraso] = useState("");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchConfiguracao = async () => {
    try {
      const data = await FinanceiroService.getConfiguracao();
      setDiasParaAtraso(String(data.diasParaAtraso));
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguracao();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const valor = Number(diasParaAtraso);
    if (!diasParaAtraso || !(valor > 0)) {
      setAlert({ type: "error", message: "Informe um número de dias válido (maior que zero)." });
      return;
    }
    try {
      const data = await FinanceiroService.salvarConfiguracao({ diasParaAtraso: valor });
      setDiasParaAtraso(String(data.diasParaAtraso));
      setAlert({ type: "success", message: "Configuração salva com sucesso!" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erro ao salvar configuração.";
      setAlert({ type: "error", message: errorMessage });
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Carregando configuração...</p>;
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
        <h2 className="text-xl font-semibold">Configurações</h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-sm">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dias até marcar como atrasado
        </label>
        <input
          type="number"
          min="1"
          value={diasParaAtraso}
          onChange={(e) => setDiasParaAtraso(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}

export default FinanceiroConfiguracao;
