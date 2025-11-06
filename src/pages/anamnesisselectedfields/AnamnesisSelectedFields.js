// src/pages/anamnesis/AnamnesisSelectFields.js
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AnamnesisService from "../../services/AnamnesisService";
import Alert from "../../components/alert/Alert";
import { ArrowLeft, ExternalLink } from "lucide-react";

// Avatar ilustrativo (aumentado)
const UserAvatar = ({ size = "w-20 h-20" }) => (
  <svg
    className={`${size}`}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="32" cy="32" r="32" fill="#E0E0E0" />
    <path
      d="M32 37C36.4183 37 40 33.4183 40 29C40 24.5817 36.4183 21 32 21C27.5817 21 24 24.5817 24 29C24 33.4183 27.5817 37 32 37Z"
      fill="#BDBDBD"
    />
    <path
      d="M44 48C44 41.9249 39.0751 37 33 37C26.9249 37 22 41.9249 22 48H44Z"
      fill="#BDBDBD"
    />
  </svg>
);


export default function AnamnesisSelectFields() {
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
      setTimeout(() => navigate(-1), 2500);
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
    <div className="min-h-screen bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Topo: Voltar */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} /> Voltar
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
          {alert && (
            <div className="mb-4">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
                duration={6000} // 6 segundos
              />
            </div>
          )}


          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Analisar anamnese
          </h1>

          {/* Header Paciente */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <UserAvatar size="w-24 h-24" />
            <div className="flex-1">
              <p className="text-base font-bold text-gray-900">
                {formData.patientName ?? "Paciente não identificado"}
              </p>
              {formData.interviewDate && (
                <>
                  <p className="text-sm text-gray-500 mb-1">
                    Entrevista: realizada em{" "}
                    {new Date(formData.interviewDate).toLocaleDateString(
                      "pt-BR",
                      { timeZone: "UTC" }
                    )}
                  </p>
                  <a
                    href="#"
                    className="text-sm font-medium text-sky-600 hover:underline flex items-center gap-1.5"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`/laudo/${formData.id}`, "_blank");
                    }}
                  >
                    Visualizar laudo <ExternalLink size={16} />
                  </a>
                </>
              )}
            </div>
          </div>

          <h2 className="text-base text-gray-800 font-medium my-6">
            Selecione as respostas da anamnese
          </h2>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-8">
              {["Informações do paciente", "Histórico de Desenvolvimento"].map(
                (label, index) => (
                  <button
                    key={label}
                    onClick={() => setStep(index)}
                    className={`pb-3 text-base font-medium transition-colors duration-200 ${step === index
                      ? "text-sky-600 border-b-2 border-sky-600"
                      : "text-gray-500 hover:text-gray-800 border-b-2 border-transparent"
                      }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Select all */}
          <div className="flex items-center mb-4">
            <input
              id="selectAll"
              type="checkbox"
              checked={allSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
            />
            <label
              htmlFor="selectAll"
              className="ml-3 text-sm font-medium text-gray-700"
            >
              Selecionar todas as respostas
            </label>
          </div>

          {/* Campos */}
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {allFields.map(({ key, label }) => {
              const isSelected = selectedFields.includes(key);
              const value = formData[key];

              return (
                <div
                  key={key}
                  className={`transition-colors duration-200 ${isSelected ? "bg-sky-50" : "bg-white"
                    }`}
                >
                  <div
                    className={`flex items-start gap-4 p-4 border-l-4 ${isSelected ? "border-sky-600" : "border-transparent"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleField(key)}
                      className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 mt-1 cursor-pointer"
                    />
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => toggleField(key)}
                    >
                      <p className="text-base font-semibold text-gray-900 mb-2">
                        {label}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {value && value.trim() !== ""
                          ? value
                          : "Sem resposta registrada."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ações */}
          {/* Ações */}
          <div className="flex justify-end items-center mt-8 gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              disabled={selectedFields.length === 0}
              onClick={handleSaveSelection}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors duration-200 ${selectedFields.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-700"
                }`}
            >
              {step === 0 ? "Continuar" : "Salvar"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
