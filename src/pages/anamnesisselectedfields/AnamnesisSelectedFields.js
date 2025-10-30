import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AnamnesisService from "../../services/AnamnesisService";
import Alert from "../../components/alert/Alert";
function AnamnesisSelectFields() {
  const { anamneseid, token } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedFields, setSelectedFields] = useState([]);

  const infoFields = [
    { key: "diagnoses", label: "Diagnóstico do paciente" },
    { key: "medicationAndAllergies", label: "Medicação e Alergias" },
    { key: "indications", label: "Indicações" },
    { key: "objectives", label: "Por qual motivo nos procurou? (Objetivos)" },
  ];

  const historyFields = [
    { key: "developmentHistory", label: "Gestação - Diagnóstico - Processo de Desenvolvimento - Dias Atuais" },
    { key: "preferences", label: "Preferências do aluno (a)" },
    { key: "interferingBehaviors", label: "Comportamentos interferentes e plano de conduta" },
    { key: "qualityOfLife", label: "Comprometimento da qualidade de vida (aluno e família)" },
    { key: "feeding", label: "Alimentação (Seletividade - Compulsividade - Acompanhamento Nutricional)" },
    { key: "sleep", label: "Rotina do sono (agitação, continuidade)" },
    { key: "therapists", label: "Equipe de terapeutas" },
  ];

  // Carrega dados da anamnese
  useEffect(() => {
    const carregarDados = async () => {
      try {
        let dados;
        if (anamneseid) {
          dados = await AnamnesisService.buscarPorId(anamneseid);
        } else if (token) {
          dados = await AnamnesisService.buscarPorToken(token);
        }

        setFormData(dados ?? {});
      } catch (error) {
        console.error(error);
        setAlert({
          type: "error",
          message: "Erro ao carregar dados da anamnese.",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [anamneseid, token]);

  const toggleField = (key) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const allFields = step === 0 ? infoFields : historyFields;

  const handleSelectAll = (checked) => {
    if (checked) {
      const allKeys = allFields.map((f) => f.key);
      setSelectedFields((prev) => Array.from(new Set([...prev, ...allKeys])));
    } else {
      setSelectedFields((prev) =>
        prev.filter((key) => !allFields.some((f) => f.key === key))
      );
    }
  };

  const allSelected =
    allFields.length > 0 &&
    allFields.every((f) => selectedFields.includes(f.key));

  const handleSaveSelection = async () => {
    const payload = {
      anamnesisId: formData.id,
      selectedFields,
    };

    try {
      await AnamnesisService.sendReferral(payload);
      setAlert({
        type: "success",
        message: "Campos selecionados salvos com sucesso!",
      });
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      console.error(error);
      setAlert({
        type: "error",
        message: "Erro ao salvar os campos selecionados.",
      });
    }
  };

  if (loading) {
    return <div className="text-center p-6">Carregando dados da anamnese...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full max-w-4xl mx-auto">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={4000}
        />
      )}

      <h2 className="text-2xl font-semibold mb-6">Selecionar campos da Anamnese</h2>

      {/* Cabeçalho do paciente */}
      <div className="flex items-center gap-4 border-b pb-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
          👤
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {formData.patientName ?? "Paciente não identificado"}
          </p>
          {formData.interviewDate && (
            <p className="text-sm text-gray-500">
              Entrevista realizada em{" "}
              {new Date(formData.interviewDate).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b mb-4">
        {["Informações do Paciente", "Histórico de Desenvolvimento"].map(
          (label, index) => (
            <button
              key={label}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                step === index
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-primary"
              }`}
              onClick={() => setStep(index)}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* Selecionar todas */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="h-4 w-4 text-primary border-gray-300 rounded"
        />
        <label className="ml-2 text-sm font-medium text-gray-700">
          Selecionar todas as respostas
        </label>
      </div>

      {/* Campos */}
      <div className="space-y-4">
        {allFields.map(({ key, label }) => (
          <div
            key={key}
            className="border border-gray-200 rounded-xl p-4 bg-gray-50"
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={selectedFields.includes(key)}
                onChange={() => toggleField(key)}
                className="h-4 w-4 text-primary mt-1 border-gray-300 rounded"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-800">{label}</p>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                  {formData[key] ?? "Sem resposta registrada."}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => navigate(-1)}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>

        <button
          disabled={selectedFields.length === 0}
          onClick={handleSaveSelection}
          className={`px-6 py-2 rounded-lg text-white transition ${
            selectedFields.length === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          Salvar seleção
        </button>
      </div>
    </div>
  );
}

export default AnamnesisSelectFields;
