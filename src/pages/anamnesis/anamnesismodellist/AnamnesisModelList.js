import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, ToggleLeft, ToggleRight, ClipboardList} from "lucide-react";
import AnamnesisModelService from "../../../services/AnamnesisModelService";
import AnamnesisModelModal from "../../../modal/anamnesismodelmodal/AnamnesisModelModal";
import Alert from "../../../components/alert/Alert";
import ConfirmDialog from "../../../components/confirm/ConfirmDialog";


function AnamnesisModelList() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [viewTemplate, setViewTemplate] = useState(null);
  const [alert, setAlert] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [templateToDeactivate, setTemplateToDeactivate] = useState(null);

  const fetchTemplates = async () => {
    try {
      const data = await AnamnesisModelService.getAll();
      setTemplates(data);
    } catch (error) {
      console.error("Erro ao carregar modelos:", error);
      setAlert({ type: "error", message: "Erro ao carregar modelos de anamnese." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async (templateData) => {
    try {
      if (editTemplate) {
        await AnamnesisModelService.update(editTemplate.id, templateData);
        setAlert({ type: "success", message: "Modelo atualizado com sucesso!" });
      } else {
        await AnamnesisModelService.create(templateData);
        setAlert({ type: "success", message: "Modelo criado com sucesso!" });
      }

      fetchTemplates();
      setModalOpen(false);
      setEditTemplate(null);
    } catch (error) {
      console.error("Erro ao salvar modelo:", error.response);
      const errorMessage = error.response?.data?.message || "Erro ao salvar modelo.";
      setAlert({ type: "error", message: errorMessage });
    }
  };

  const handleDeactivateClick = (template) => {
    setTemplateToDeactivate(template);
    setConfirmOpen(true);
  };

  const handleDeactivate = async () => {
    if (!templateToDeactivate) return;

    try {
      await AnamnesisModelService.deactivate(templateToDeactivate.id);
      fetchTemplates();
      setAlert({ type: "success", message: "Modelo desativado com sucesso!" });
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao desativar modelo." });
    } finally {
      setConfirmOpen(false);
      setTemplateToDeactivate(null);
    }
  };

  const handleReactivate = async (template) => {
    try {
      await AnamnesisModelService.reactivate(template.id);
      fetchTemplates();
      setAlert({ type: "success", message: "Modelo reativado com sucesso!" });
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao reativar modelo." });
    }
  };

  const handleViewClick = async (template) => {
    try {
      const full = await AnamnesisModelService.getById(template.id);
      setViewTemplate(full);
      setViewModalOpen(true);
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao carregar detalhes do modelo." });
    }
  };

  const fieldTypeLabel = (type) => {
    const labels = {
      TEXT: "Texto curto",
      TEXTAREA: "Texto longo",
      DATE: "Data",
      CHECKBOX: "Checkbox",
      FILE: "Arquivo PDF",
    };
    return labels[type] || type;
  };

  const fieldTypeBadgeColor = (type) => {
    const colors = {
      TEXT: "bg-blue-100 text-blue-700",
      TEXTAREA: "bg-purple-100 text-purple-700",
      DATE: "bg-yellow-100 text-yellow-700",
      CHECKBOX: "bg-green-100 text-green-700",
      FILE: "bg-red-100 text-red-700",
    };
    return colors[type] || "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return <p className="text-center text-gray-500">Carregando modelos...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {alert && (
        <div className="flex justify-center mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            duration={4000}
          />
        </div>
      )}

      <div className="text-sm text-gray-500 mb-4">
        Página Inicial <span className="mx-1">{">"}</span> Modelos de Anamnese
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Modelos de Anamnese</h2>

        <button
          className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition flex items-center gap-2"
          onClick={() => {
            setEditTemplate(null);
            setModalOpen(true);
          }}
        >
          + Novo Modelo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600">
              <th className="py-2 px-4 text-primary">Nome</th>
              <th className="py-2 px-4 text-primary">Descrição</th>
              <th className="py-2 px-4 text-primary">Qtd. Campos</th>
              <th className="py-2 px-4 text-primary">Status</th>
              <th className="py-2 px-4 text-center text-primary">Ações</th>
            </tr>
          </thead>
          <tbody>
            {templates.length > 0 ? (
              templates.map((template) => (
                <tr
                  key={template.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4 font-medium">{template.name}</td>
                  <td className="py-2 px-4 text-gray-500 text-sm max-w-xs truncate">
                    {template.description || "-"}
                  </td>
                  <td className="py-2 px-4">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <ClipboardList size={14} className="text-primary" />
                      {template.fields?.length ?? 0} campos
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {template.active ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Ativo
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 flex justify-center gap-3">
                    <button
                      title="Visualizar campos"
                      className="text-primary hover:text-blue-800"
                      onClick={() => handleViewClick(template)}
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      title="Editar modelo"
                      className="text-primary hover:text-blue-800"
                      onClick={() => {
                        setEditTemplate(template);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil size={18} />
                    </button>

                    {template.active ? (
                      <button
                        title="Desativar modelo"
                        className="text-primary hover:text-red-600"
                        onClick={() => handleDeactivateClick(template)}
                      >
                        <ToggleRight size={18} />
                      </button>
                    ) : (
                      <button
                        title="Reativar modelo"
                        className="text-gray-400 hover:text-green-600"
                        onClick={() => handleReactivate(template)}
                      >
                        <ToggleLeft size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  Nenhum modelo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de criação/edição — AnamnesisModelModal (a ser criado) */}
      <AnamnesisModelModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTemplate(null);
        }}
        onSave={handleSave}
        initialData={editTemplate}
      />

      {/* Modal de visualização de campos */}
      {viewModalOpen && viewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{viewTemplate.name}</h3>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {viewTemplate.description && (
              <p className="text-sm text-gray-500 mb-4">{viewTemplate.description}</p>
            )}

            <div className="space-y-2">
              {viewTemplate.fields?.length > 0 ? (
                viewTemplate.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-5">{index + 1}.</span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </p>
                        {field.placeholder && (
                          <p className="text-xs text-gray-400">{field.placeholder}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${fieldTypeBadgeColor(field.fieldType)}`}
                    >
                      {fieldTypeLabel(field.fieldType)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">
                  Nenhum campo cadastrado neste modelo.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Desativar Modelo"
        message={
          templateToDeactivate
            ? `Você está prestes a desativar o modelo "${templateToDeactivate.name}".\n\nEle não aparecerá mais para seleção em novas anamneses, mas as anamneses já criadas com este modelo não serão afetadas.\n\nDeseja continuar?`
            : ""
        }
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default AnamnesisModelList;