import api from "./Api";

// Protótipo do dashboard-geral: só existe no mock-server (ver .specs/features/
// dashboard-geral/). Contra o backend real ainda não tem essa rota — quem chama
// precisa tratar o erro (ver AgendamentoHojeCard.js).
const AgendamentoService = {
  getAgendamentosHoje: async () => {
    const response = await api.get("/agendamento/hoje");
    return response.data;
  },
};

export default AgendamentoService;
