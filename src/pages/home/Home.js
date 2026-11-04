import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  User, FileText, ClipboardList, DollarSign, CalendarClock, Dumbbell,
} from "lucide-react";
import DashboardService from "../../services/DashboardService";
import FinanceiroResumoCard from "./widgets/FinanceiroResumoCard";
import ContratosPendentesCard from "./widgets/ContratosPendentesCard";
import AniversariantesCard from "./widgets/AniversariantesCard";
import AnamnesesPendentesCard from "./widgets/AnamnesesPendentesCard";
import AgendamentoHojeCard from "./widgets/AgendamentoHojeCard";
import PacientesAtivosCard from "./widgets/PacientesAtivosCard";

function getScope() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return jwtDecode(token).scope;
  } catch {
    return null;
  }
}

function getUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

const ROLE_LABELS = {
  ADMIN: "Gestor",
  SECRETARY: "Secretária",
  PROFESSIONAL: "Profissional",
  ASSISTANT: "Assistente",
};

// Acesso rápido às funcionalidades mais usadas no dia a dia — cada ação só aparece
// para quem já tem acesso à tela de destino (mesmas regras do menu lateral).
const QUICK_ACTIONS = [
  { label: "Cadastrar Paciente", icon: User, route: "/pacientes", roles: ["ADMIN", "SECRETARY"] },
  { label: "Novo Contrato", icon: FileText, route: "/contrato", roles: ["ADMIN", "SECRETARY"] },
  { label: "Encaminhar Anamnese", icon: ClipboardList, route: "/anamnese", roles: ["ADMIN", "SECRETARY"] },
  { label: "Nova Cobrança", icon: DollarSign, route: "/financeiro", roles: ["ADMIN", "SECRETARY"] },
  { label: "Minha Agenda", icon: CalendarClock, route: "/agenda", roles: ["ADMIN", "PROFESSIONAL"] },
  { label: "Banco de Atividades", icon: Dumbbell, route: "/atividades", roles: ["PROFESSIONAL"] },
  { label: "Relatório de Anamnese", icon: FileText, route: "/relatorios", roles: ["ADMIN", "PROFESSIONAL"] },
];

function Home() {
  const scope = getScope();
  const user = getUser();
  const navigate = useNavigate();
  const firstName = (user?.name || "").trim().split(/\s+/)[0] || "";
  const quickActions = QUICK_ACTIONS.filter((a) => a.roles.includes(scope)).slice(0, 4);
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {firstName ? `Olá, ${firstName}!` : "Bem-vindo"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Bem-vindo ao GERENC<span className="text-primary font-semibold">IA</span>
        </p>
      </div>
    );
  }

  // Cada bloco vem null do backend quando falhou (isolado) ou quando a chamada
  // inteira falhou (falhaTotal) — os dois casos viram "error" pro card.
  const blocoErro = (bloco) => !loading && (falhaTotal || bloco == null);

  return (
    <div className="space-y-6 max-w-screen-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {firstName ? `Olá, ${firstName}!` : "Bem-vindo"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {ROLE_LABELS[scope]
            ? `Aqui está o resumo da sua clínica hoje, ${ROLE_LABELS[scope].toLowerCase()}.`
            : "Aqui está o resumo da sua clínica hoje."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(scope === "ADMIN" || scope === "SECRETARY") && (
          <PacientesAtivosCard
            data={dashboard?.pacientes}
            loading={loading}
            error={blocoErro(dashboard?.pacientes)}
          />
        )}

        {/* financeiro é exclusivo do ADMIN — o backend devolve null pros demais */}
        {scope === "ADMIN" && (
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

        {/* /appointments só libera ADMIN e PROFESSIONAL no backend */}
        {(scope === "ADMIN" || scope === "PROFESSIONAL") && (
          <AgendamentoHojeCard />
        )}
      </div>

      {quickActions.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Acesso Rápido</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.route}
                onClick={() => navigate(action.route)}
                className="flex items-center justify-center gap-2.5 h-12 sm:h-14 px-4
                  bg-white border border-gray-200 hover:border-primary/40 hover:bg-primary/5
                  active:bg-primary/10 text-gray-700 hover:text-primary rounded-xl
                  font-medium text-sm shadow-xs hover:shadow transition-all
                  active:scale-[0.98] group"
              >
                <action.icon size={19} strokeWidth={1.75}
                  className="text-gray-400 group-hover:text-primary transition-colors shrink-0" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
