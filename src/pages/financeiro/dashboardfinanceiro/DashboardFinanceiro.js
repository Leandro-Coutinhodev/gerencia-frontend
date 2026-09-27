import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FinanceiroService from "../../../services/FinanceiroService";
import DonutChart, { DONUT_COLORS } from "../../../components/donutchart/DonutChart";

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

function statusExibicao(cobranca) {
  if (cobranca.atrasado) return "ATRASADO";
  return cobranca.status;
}

function mesAtual() {
  return new Date().toISOString().slice(0, 7);
}

function formatarReais(valor) {
  return `R$ ${Number(valor || 0).toFixed(2)}`;
}

function DashboardFinanceiro() {
  const navigate = useNavigate();
  const [periodoMes, setPeriodoMes] = useState(mesAtual());
  const [modoTudo, setModoTudo] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const periodoEfetivo = modoTudo ? "TUDO" : periodoMes;

  const fetchDashboard = async (periodo) => {
    setLoading(true);
    try {
      const data = await FinanceiroService.getDashboardFinanceiro(periodo);
      setDashboard(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard financeiro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(periodoEfetivo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodoEfetivo]);

  const variacao = Number(dashboard?.variacaoPercentual || 0);
  const variacaoPositiva = variacao >= 0;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="text-sm text-gray-500 mb-4">
        Página Inicial <span className="mx-1">{">"}</span> Financeiro{" "}
        <span className="mx-1">{">"}</span> Dashboard
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Dashboard Financeiro</h2>
          <p className="text-sm text-gray-500">Acompanhe faturamento, mensalidades e inadimplência.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={periodoMes}
            disabled={modoTudo}
            onChange={(e) => setPeriodoMes(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
          />
          <button
            onClick={() => setModoTudo((v) => !v)}
            className={`px-4 py-2 rounded-lg text-sm border transition ${
              modoTudo
                ? "bg-primary text-white border-primary"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Tudo
          </button>
        </div>
      </div>

      {loading || !dashboard ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary text-white rounded-xl p-5">
              <p className="text-xs font-medium opacity-80 mb-1">SALDO DISPONÍVEL</p>
              <p className="text-2xl font-bold">{formatarReais(dashboard.saldoAcumulado)}</p>
              <p className={`text-sm mt-2 ${variacaoPositiva ? "text-green-200" : "text-red-200"}`}>
                {variacaoPositiva ? "▲" : "▼"} {Math.abs(variacao).toFixed(1)}% este mês
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-500 mb-1">A RECEBER</p>
              <p className="text-2xl font-bold text-gray-800">{formatarReais(dashboard.aReceberValor)}</p>
              <p className="text-sm text-gray-500 mt-2">{dashboard.aReceberContagem} pendentes</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-500 mb-3">RESUMO DE STATUS</p>
              <DonutChart
                segments={[
                  { label: "Recebido", value: dashboard.statusPagoContagem, color: DONUT_COLORS.PAGO },
                  { label: "Pendente", value: dashboard.statusPendenteContagem, color: DONUT_COLORS.PENDENTE },
                  { label: "Atrasado", value: dashboard.statusAtrasadoContagem, color: DONUT_COLORS.ATRASADO },
                ]}
              />
            </div>
          </div>

          <div className="flex gap-4 mb-6 text-sm">
            <span className="text-gray-500">
              Entradas: <span className="font-medium text-green-700">{formatarReais(dashboard.entradas)}</span>
            </span>
            <span className="text-gray-500">
              Saídas: <span className="font-medium text-red-700">{formatarReais(dashboard.saidas)}</span>
            </span>
            <button
              onClick={() => navigate("/financeiro?status=PAGO")}
              className="ml-auto text-primary hover:underline"
            >
              Recibos Pagos
            </button>
          </div>

          <div className="overflow-x-auto">
            <p className="text-sm font-medium text-gray-700 mb-2">Mensalidades Recentes</p>
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600">
                  <th className="py-2 px-4 text-primary">Paciente</th>
                  <th className="py-2 px-4 text-primary">Vencimento</th>
                  <th className="py-2 px-4 text-primary">Valor</th>
                  <th className="py-2 px-4 text-primary">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.mensalidadesRecentes.length > 0 ? (
                  dashboard.mensalidadesRecentes.map((cobranca) => {
                    const status = statusExibicao(cobranca);
                    return (
                      <tr key={cobranca.id} className="border-t hover:bg-gray-50 transition">
                        <td className="py-2 px-4">{cobranca.patientName}</td>
                        <td className="py-2 px-4">
                          {new Date(cobranca.vencimento).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-2 px-4">R$ {Number(cobranca.valor).toFixed(2)}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[status]}`}
                          >
                            {STATUS_LABEL[status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      Nenhuma cobrança no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardFinanceiro;
