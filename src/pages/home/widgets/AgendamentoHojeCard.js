import { useEffect, useState } from "react";
import AgendamentoService from "../../../services/AgendamentoService";
import DonutChart from "../../../components/donutchart/DonutChart";

// Ordem fixa (nunca ciclar por filtro/contagem) — validada via skill dataviz,
// 4 primeiros slots do tema categórico padrão. Ver design.md do dashboard-geral.
const FREQUENCIA_COLORS = {
  AVULSO: "#2a78d6",
  SEMANAL: "#eb6834",
  QUINZENAL: "#1baf7a",
  MENSAL: "#eda100",
};

const FREQUENCIA_LABEL = {
  AVULSO: "Avulso",
  SEMANAL: "Semanal",
  QUINZENAL: "Quinzenal",
  MENSAL: "Mensal",
};

function tallyPorFrequencia(agendamentos) {
  const contagem = { AVULSO: 0, SEMANAL: 0, QUINZENAL: 0, MENSAL: 0 };
  agendamentos.forEach((a) => {
    if (contagem[a.frequencia] !== undefined) contagem[a.frequencia] += 1;
  });
  return Object.entries(contagem).map(([freq, value]) => ({
    label: FREQUENCIA_LABEL[freq],
    value,
    color: FREQUENCIA_COLORS[freq],
  }));
}

function AgendamentoHojeCard() {
  const [agendamentos, setAgendamentos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [indisponivel, setIndisponivel] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const data = await AgendamentoService.getAgendamentosHoje();
        if (ativo) setAgendamentos(data);
      } catch (err) {
        // Esperado contra o backend real (rota só existe no mock-server, protótipo).
        if (ativo) setIndisponivel(true);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Agendamentos de Hoje</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : indisponivel ? (
        <p className="text-sm text-gray-500">Agendamento em breve.</p>
      ) : agendamentos.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum agendamento para hoje.</p>
      ) : (
        <>
          <ul className="space-y-2 mb-4">
            {agendamentos.map((a) => (
              <li key={a.id} className="flex justify-between items-center text-sm border-t pt-2 first:border-t-0 first:pt-0">
                <div>
                  <span className="text-gray-700">{a.horario}</span>{" "}
                  <span className="text-gray-800 font-medium">{a.pacienteNome}</span>
                  <span className="text-gray-400"> · {a.profissionalNome}</span>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${FREQUENCIA_COLORS[a.frequencia]}1a`,
                    color: FREQUENCIA_COLORS[a.frequencia],
                  }}
                >
                  {FREQUENCIA_LABEL[a.frequencia] ?? a.frequencia}
                </span>
              </li>
            ))}
          </ul>
          <DonutChart ariaLabel="Mistura de frequência dos agendamentos de hoje" segments={tallyPorFrequencia(agendamentos)} />
        </>
      )}
    </div>
  );
}

export default AgendamentoHojeCard;
