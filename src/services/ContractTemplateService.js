import api from "./Api";
 
const ContractTemplateService = {
  getAll:      ()        => api.get("/contract-templates").then(r => r.data),
  getById:     (id)      => api.get(`/contract-templates/${id}`).then(r => r.data),
  create:      (data)    => api.post("/contract-templates", data).then(r => r.data),
  update:      (id, data)=> api.put(`/contract-templates/${id}`, data).then(r => r.data),
  deactivate:  (id)      => api.delete(`/contract-templates/${id}`).then(r => r.data),
  reactivate:  (id)      => api.patch(`/contract-templates/${id}/reactivate`).then(r => r.data),
};
 
export default ContractTemplateService;