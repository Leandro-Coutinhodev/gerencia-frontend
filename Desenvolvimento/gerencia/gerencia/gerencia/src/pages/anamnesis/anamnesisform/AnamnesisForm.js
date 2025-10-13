import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PatientInfoStep from "../patientinfostep/PatientInfoStep";
import HistoryStep from "../historystep/HistoryStep";
import ReportStep from "../reportstep/ReportStep";
import AnamnesisService from "../../../services/AnamnesisService";

function AnamnesisForm() {
  const { token, anamneseid } = useParams(); // 👈 agora suporta /anamnese/:anamneseid

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false); // 👈 modo visualização
  const [formData, setFormData] = useState({
    id: "",
    patientId: "",
    patientName: "",
    interviewDate: "",
    diagnoses: [],
    otherDiagnosis: "",
    medicationAndAllergies: "",
    indications: "",
    objectives: "",
    developmentHistory: "",
    preferences: "",
    interferingBehaviors: "",
    qualityOfLife: "",
    feeding: "",
    sleep: "",
    therapists: "",
    report: null,
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        if (anamneseid) {
          // 👇 modo visualização
          setIsReadOnly(true);
          const dados = await AnamnesisService.buscarPorId(anamneseid);

          setFormData({
            id: dados.id ?? "",
            patientId: dados.patientId ?? "",
            patientName: dados.patientName ?? "",
            interviewDate: dados.interviewDate
              ? dados.interviewDate.substring(0, 10)
              : "",
            diagnoses: Array.isArray(dados.diagnoses)
              ? dados.diagnoses
              : (dados.diagnoses ?? "").split(",").map((d) => d.trim()),
            otherDiagnosis: dados.otherDiagnosis ?? "",
            medicationAndAllergies: dados.medicationAndAllergies ?? "",
            indications: dados.indications ?? "",
            objectives: dados.objectives ?? "",
            developmentHistory: dados.developmentHistory ?? "",
            preferences: dados.preferences ?? "",
            interferingBehaviors: dados.interferingBehaviors ?? "",
            qualityOfLife: dados.qualityOfLife ?? "",
            feeding: dados.feeding ?? "",
            sleep: dados.sleep ?? "",
            therapists: dados.therapists ?? "",
            report: null,
          });
        } else if (token) {
          // 👇 modo criação
          const dados = await AnamnesisService.buscarPorToken(token);
          setFormData({
            id: dados.id ?? "",
            patientId: dados.patientId ?? "",
            patientName: dados.patientName ?? "",
            interviewDate: dados.interviewDate
              ? dados.interviewDate.substring(0, 10)
              : "",
            diagnoses: Array.isArray(dados.diagnoses)
              ? dados.diagnoses
              : (dados.diagnoses ?? "").split(",").map((d) => d.trim()),
            medicationAndAllergies: dados.medicationAndAllergies ?? "",
            indications: dados.indications ?? "",
            objectives: dados.objectives ?? "",
            developmentHistory: dados.developmentHistory ?? "",
            preferences: dados.preferences ?? "",
            interferingBehaviors: dados.interferingBehaviors ?? "",
            qualityOfLife: dados.qualityOfLife ?? "",
            feeding: dados.feeding ?? "",
            sleep: dados.sleep ?? "",
            therapists: dados.therapists ?? "",
            report: null,
          });
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar dados da anamnese.");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [token, anamneseid]);

  const handleChange = (field, value) => {
    if (!isReadOnly) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const dadosParaEnvio = {
        ...formData,
        diagnoses: Array.isArray(formData.diagnoses)
          ? formData.diagnoses.join(", ")
          : (formData.diagnoses ?? ""),
      };

      const report = dadosParaEnvio.report ?? null;
      delete dadosParaEnvio.report;
      delete dadosParaEnvio.patientName;

      await AnamnesisService.criar(formData.id, dadosParaEnvio, report);
      alert("Anamnese salva com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar anamnese");
    }
  };

  if (loading) {
    return <div className="text-center p-6">Carregando formulário...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full max-w-4xl mx-auto">
      <div className="flex border-b">
        {["Informações do paciente", "Histórico", "Laudo"].map((label, index) => (
          <button
            key={label}
            disabled={isReadOnly}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              step === index
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-primary"
            } ${isReadOnly ? "cursor-default opacity-60" : ""}`}
            onClick={() => !isReadOnly && setStep(index)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {step === 0 && (
          <PatientInfoStep
            data={formData}
            onChange={handleChange}
            onNext={() => setStep(1)}
            isReadOnly={isReadOnly}
          />
        )}
        {step === 1 && (
          <HistoryStep
            data={formData}
            onChange={handleChange}
            onPrev={() => setStep(0)}
            onNext={() => setStep(2)}
            isReadOnly={isReadOnly}
          />
        )}
        {step === 2 && (
          <ReportStep
            data={formData}
            onChange={handleChange}
            onPrev={() => setStep(1)}
            onSubmit={handleSubmit}
            isReadOnly={isReadOnly}
          />
        )}
      </div>
    </div>
  );
}

export default AnamnesisForm;
