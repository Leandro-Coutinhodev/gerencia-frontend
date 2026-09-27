import { useNavigate } from "react-router-dom";
import DonutChart, { DONUT_COLORS } from "../../../components/donutchart/DonutChart";

function formatarReais(valor) {
  return `R$ ${Number(valor || 0).toFixed(2)}`;
}

function FinanceiroResumoCard({ data, loading, error }) {
  const navigate = useNavigate();
  const semDado =
    !error && data &&
    data.statusPagoContagem === 0 &&
    data.statusPendenteContagem === 0 &&
    data.statusAtrasadoContagem === 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Financeiro</h3>
        <button onClick={() => navigate("/financeiro/relatorio")} className="text-xs text-primary hover:underline">
          Ver dashboard
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : error ? (
        <p className="text-sm text-red-600">Não foi possível carregar o financeiro agora.</p>
      ) : semDado ? (
        <p className="text-sm text-gray-500">Nenhuma cobrança registrada ainda.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-xs text-gray-500">Saldo do mês</p>
              <p className="text-lg font-bold text-gray-800">{formatarReais(data.saldoAcumulado)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">A receber</p>
              <p className="text-lg font-bold text-gray-800">{formatarReais(data.aReceberValor)}</p>
            </div>
          </div>
          <DonutChart
            ariaLabel="Resumo de status financeiro"
            segments={[
              { label: "Pago", value: data.statusPagoContagem, color: DONUT_COLORS.PAGO },
              { label: "Pendente", value: data.statusPendenteContagem, color: DONUT_COLORS.PENDENTE },
              { label: "Atrasado", value: data.statusAtrasadoContagem, color: DONUT_COLORS.ATRASADO },
            ]}
          />
        </>
      )}
    </div>
  );
}

export default FinanceiroResumoCard;
