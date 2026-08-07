import api from "./Api";
 
const ContractService = {
  // Opção 1: Gerar via template e enviar para assinatura
  createForSigning: (data) =>
    api.post("/contracts/sign", data).then(r => r.data),
 
  // Opção 2: Anexar PDF já assinado
  createExternal: (data, file) => {
    const form = new FormData();
    form.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    form.append("file", file);
    return api.post("/contracts/external", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
 
  // Tela pública de assinatura
  getSigningView: (token) =>
    api.get(`/contracts/sign/${token}`).then(r => r.data),
 
  // Assinar (participante)
  sign: (token, acceptedTerms, acceptResponses) =>
    api.post(`/contracts/sign/${token}/accept`, { acceptedTerms, acceptResponses })
       .then(r => r.data),
 
  // Listagem e PDF
  getAll:       ()           => api.get("/contracts").then(r => r.data),
  getByPatient: (patientId)  => api.get(`/contracts/bypatient/${patientId}`).then(r => r.data),
  getPdfUrl:    (contractId) => `/api-gateway/gerencia/contracts/${contractId}/pdf`,
};
 
export default ContractService;
