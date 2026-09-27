import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import DashboardService from "../../services/DashboardService";
import FinanceiroResumoCard from "./widgets/FinanceiroResumoCard";
import ContratosPendentesCard from "./widgets/ContratosPendentesCard";
import AniversariantesCard from "./widgets/AniversariantesCard";
import AnamnesesPendentesCard from "./widgets/AnamnesesPendentesCard";
import AgendamentoHojeCard from "./widgets/AgendamentoHojeCard";

function getScope() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return jwtDecode(token).scope;
  } catch {
    return null;
  }
}

function Home() {
  const scope = getScope();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(scope !== "ASSISTANT");
  const [falhaTotal, setFalhaTotal] = useState(false);

  useEffect(() => {
    if (scope === "ASSISTANT") return;
    let ativo = true;
    (async () => {
      try {
        const data = await DashboardService.getDashboardGeral();
        if (ativo) setDashboard(data);
      } catch (err) {
        console.error("Erro ao carregar dashboard geral:", err);
        if (ativo) setFalhaTotal(true);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (scope === "ASSISTANT") {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Bem-vindo ao GERENC<span className="text-primary">IA</span>
        </h2>
      </div>
    );
  }

  // Cada bloco vem null do backend quando falhou (isolado) ou quando a chamada
  // inteira falhou (falhaTotal) — os dois casos viram "error" pro card.
  const blocoErro = (bloco) => !loading && (falhaTotal || bloco == null);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Bem-vindo ao GERENC<span className="text-primary">IA</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(scope === "ADMIN" || scope === "SECRETARY") && (
          <FinanceiroResumoCard
            data={dashboard?.financeiro}
            loading={loading}
            error={blocoErro(dashboard?.financeiro)}
          />
        )}

        {(scope === "ADMIN" || scope === "SECRETARY") && (
          <ContratosPendentesCard
            data={dashboard?.contratos}
            loading={loading}
            error={blocoErro(dashboard?.contratos)}
          />
        )}

        {(scope === "ADMIN" || scope === "SECRETARY") && (
          <AniversariantesCard
            data={dashboard?.aniversariantes}
            loading={loading}
            error={blocoErro(dashboard?.aniversariantes)}
          />
        )}

        {(scope === "ADMIN" || scope === "PROFESSIONAL") && (
          <AnamnesesPendentesCard
            data={dashboard?.anamnese}
            loading={loading}
            error={blocoErro(dashboard?.anamnese)}
          />
        )}

        {(scope === "ADMIN" || scope === "SECRETARY" || scope === "PROFESSIONAL") && (
          <AgendamentoHojeCard />
        )}
      </div>
    </div>
  );
}

export default Home;
