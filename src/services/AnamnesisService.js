import api from "./Api";

const AnamnesisService = {

  
  cadastrar: async ({ patientId, templateId }) => {
    const response = await api.post("/anamnesis", { patientId, templateId }, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  // ─── Resposta do paciente ────────────────────────────────────────────────────

  // Responde uma anamnese com answers (texto/data/checkbox) + arquivos PDF opcionais.
  // answers: [{ fieldId, value }]
  // files:   [{ fieldId, file }] → cada File é adicionado ao multipart como "file_{fieldId}"
  responderAnamnese: async (anamnesisId, answers, files = []) => {
    const formData = new FormData();

    formData.append(
      "answers",
      new Blob([JSON.stringify({ answers })], { type: "application/json" })
    );

    files.forEach(({ fieldId, file }) => {
      // Convenção esperada pelo backend: nome do part = "file_{fieldId}"
      formData.append(`file_${fieldId}`, file, file.name);
    });

    const response = await api.put(`/anamnesis/${anamnesisId}/response`, formData);
    return response.data;
  },

  // ─── Leitura ─────────────────────────────────────────────────────────────────

  listar: async () => {
    const response = await api.get("/anamnesis");
    console.log(response.data);
    return response.data;
  },

  listarPorPaciente: async (patientId) => {
    const response = await api.get(`/anamnesis/bypatient/${patientId}`);
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/anamnesis/${id}`);
    return response.data;
  },

  // Retorna AnamnesisFormDTO: { anamnesisId, status, patientName, template, existingAnswers, formLink }
  buscarPorToken: async (token) => {
    const response = await api.get(`/anamnesis/form/${token}`);
    return response.data;
  },

  // Busca o arquivo PDF de um campo específico da anamnese
  buscarArquivoCampo: async (anamnesisId, fieldId) => {
    const response = await api.get(`/anamnesis/${anamnesisId}/field/${fieldId}/file`, {
      responseType: "blob",
    });
    return response.data;
  },

  // ─── Remoção ──────────────────────────────────────────────────────────────────

  deletar: async (id) => {
    const response = await api.delete(`/anamnesis/${id}`);
    return response.data;
  },

  // ─── Geração de link ──────────────────────────────────────────────────────────

  // Gera e retorna o link público da anamnese (string com URL completa)
  gerarLink: async ({ patientId, templateId }) => {
    const response = await api.post("/anamnesis/link", { patientId, templateId }, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data; // string: "https://host/formulario?token=xxx"
  },

  // ─── Referral (inalterado) ────────────────────────────────────────────────────

  sendReferral: async (data) => {
    return api.post("/anamnesis/referral", data);
  },

  assignAssistantToReferral: async (referralId, assistantId) => {
    return api.put(`/anamnesis/referral/${referralId}/assign-assistant`, { assistantId });
  },

  getReferralByAnamnesis: async (anamnesisId) => {
    const response = await api.get(`/anamnesis/${anamnesisId}/referral`);
    return response.data;
  },

  assignAssistant: async (referralId, assistantId) => {
    return api.put(`/anamnesis/referral/${referralId}/assign-assistant`, { assistantId });
  },

  assignAssistantEmail: async (referralId, assistantId) => {
    return api.put(`/anamnesis/referral/${referralId}/assign-assistant/mail`, { assistantId });
  },

  listarReferral: async (assistantId) => {
    const response = await api.get(`/anamnesis/referral/findByAssistant/${assistantId}`);
    return response.data;
  },

  listarHistorico: async (patientId) => {
    const response = await api.get(`/anamnesis/referral/${patientId}`);
    return response.data;
  },

  relReferral: async (referralId) => {
    const response = await api.get(`/anamnesis/referral/findById/${referralId}`);
    return response.data;
  },

  listAllReferral: async () => {
    const response = await api.get("/anamnesis/referral/findall");
    return response.data;
  },
};

export default AnamnesisService;