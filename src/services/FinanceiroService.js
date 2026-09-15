import api from "./Api";

const FinanceiroService = {
  listarCobrancas: async (status) => {
    const response = await api.get("/financeiro/cobranca", {
      params: status ? { status } : {},
    });
    return response.data;
  },

  cadastrarCobranca: async (dados) => {
    const response = await api.post("/financeiro/cobranca", dados);
    return response.data;
  },

  atualizarCobranca: async (id, dados) => {
    const response = await api.put(`/financeiro/cobranca/${id}`, dados);
    return response.data;
  },

  excluirCobranca: async (id) => {
    const response = await api.delete(`/financeiro/cobranca/${id}`);
    return response.data;
  },

  darBaixa: async (id, dados) => {
    const response = await api.put(`/financeiro/cobranca/${id}/baixa`, dados);
    return response.data;
  },

  gerarRecibo: async (id) => {
    const response = await api.get(`/financeiro/cobranca/${id}/recibo`, {
      responseType: "blob",
    });
    return response.data;
  },

  listarDespesas: async () => {
    const response = await api.get("/financeiro/despesa");
    return response.data;
  },

  cadastrarDespesa: async (dados) => {
    const response = await api.post("/financeiro/despesa", dados);
    return response.data;
  },

  atualizarDespesa: async (id, dados) => {
    const response = await api.put(`/financeiro/despesa/${id}`, dados);
    return response.data;
  },

  excluirDespesa: async (id) => {
    const response = await api.delete(`/financeiro/despesa/${id}`);
    return response.data;
  },

  getDashboardFinanceiro: async (periodo) => {
    const response = await api.get("/financeiro/relatorio", { params: { periodo } });
    return response.data;
  },

  getConfiguracao: async () => {
    const response = await api.get("/financeiro/configuracao");
    return response.data;
  },

  salvarConfiguracao: async (dados) => {
    const response = await api.put("/financeiro/configuracao", dados);
    return response.data;
  },
};

export default FinanceiroService;
