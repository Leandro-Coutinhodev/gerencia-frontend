import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PatientInfoStep from "../patientinfostep/PatientInfoStep";
import HistoryStep from "../historystep/HistoryStep";
import ReportStep from "../reportstep/ReportStep";
import AnamnesisService from "../../../services/AnamnesisService";
import Alert from "../../../components/alert/Alert";

function AnamnesisForm() {
  const { token, anamneseid, anamneseId } = useParams();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [alert, setAlert] = useState(null);

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
          setIsReadOnly(true);
          const dados = await AnamnesisService.buscarPorId(anamneseid);

          const diagArray = Array.isArray(dados.diagnoses)
            ? dados.diagnoses
            : (dados.diagnoses ?? "")
              .split(",")
              .map((d) => d.trim())
              .filter(Boolean);

          const cleaned = Array.from(new Set(diagArray.map((s) => s.trim()).filter(Boolean)));

          const knownOptions = new Set([
            "Sem diagnóstico",
            "Autismo",
            "TDAH",
            "Altas Habilidades",
            "Síndrome de Down",
            "Obesidade",
            "Apraxia da Fala",
            "Dispraxia",
            "Outro",
          ]);

          const customCandidates = cleaned.filter((d) => !knownOptions.has(d));
          const otherDiagValue =
            dados.otherDiagnosis ?? (customCandidates.length ? customCandidates.at(-1) : "");

          setFormData({
            id: dados.id ?? "",
            patientId: dados.patientId ?? "",
            patientName: dados.patientName ?? "",
            interviewDate: dados.interviewDate
              ? dados.interviewDate.substring(0, 10)
              : "",
            diagnoses: cleaned,
            otherDiagnosis: otherDiagValue,
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
          const dados = await AnamnesisService.buscarPorToken(token);
          const diagArray = Array.isArray(dados.diagnoses)
            ? dados.diagnoses
            : (dados.diagnoses ?? "")
              .split(",")
              .map((d) => d.trim())
              .filter(Boolean);
          setFormData({
            id: dados.id ?? "",
            patientId: dados.patientId ?? "",
            patientName: dados.patientName ?? "",
            interviewDate: dados.interviewDate
              ? dados.interviewDate.substring(0, 10)
              : "",
            diagnoses: Array.from(new Set(diagArray)),
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
        } else if (anamneseId) {
          const dados = await AnamnesisService.buscarPorId(anamneseId);

          const diagArray = Array.isArray(dados.diagnoses)
            ? dados.diagnoses
            : (dados.diagnoses ?? "")
              .split(",")
              .map((d) => d.trim())
              .filter(Boolean);

          const cleaned = Array.from(new Set(diagArray.map((s) => s.trim()).filter(Boolean)));

          const knownOptions = new Set([
            "Sem diagnóstico",
            "Autismo",
            "TDAH",
            "Altas Habilidades",
            "Síndrome de Down",
            "Obesidade",
            "Apraxia da Fala",
            "Dispraxia",
            "Outro",
          ]);

          const customCandidates = cleaned.filter((d) => !knownOptions.has(d));
          const otherDiagValue =
            dados.otherDiagnosis ?? (customCandidates.length ? customCandidates.at(-1) : "");

          setFormData({
            id: dados.id ?? "",
            patientId: dados.patientId ?? "",
            patientName: dados.patientName ?? "",
            interviewDate: dados.interviewDate
              ? dados.interviewDate.substring(0, 10)
              : "",
            diagnoses: cleaned,
            otherDiagnosis: otherDiagValue,
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
        setAlert({
          type: "error",
          message: "Erro ao carregar dados da anamnese.",
        });
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
      const raw = Array.isArray(formData.diagnoses)
        ? formData.diagnoses
        : (formData.diagnoses ?? "").split(",").map((d) => d.trim());

      const knownOptions = new Set([
        "Sem diagnóstico",
        "Autismo",
        "TDAH",
        "Altas Habilidades",
        "Síndrome de Down",
        "Obesidade",
        "Apraxia da Fala",
        "Dispraxia",
        "Outro",
      ]);

      const keptKnown = raw.filter((d) => knownOptions.has(d) && d !== "Outro");
      const other = (formData.otherDiagnosis ?? "").trim();
      const finalDiagnoses = other ? [...keptKnown, other] : keptKnown;

      const finalUnique = Array.from(new Set(finalDiagnoses.map((s) => s.trim()).filter(Boolean)));

      const dadosParaEnvio = {
        ...formData,
        diagnoses: finalUnique.join(", "),
      };

      const reports = Array.isArray(formData.report)
        ? formData.report
        : formData.report
          ? [formData.report]
          : [];

      delete dadosParaEnvio.report;
      delete dadosParaEnvio.patientName;

      await AnamnesisService.criar(formData.id, dadosParaEnvio, reports);

      setAlert({
        type: "success",
        message: "Anamnese salva com sucesso!",
      });
    } catch (error) {
      console.error(error);
      setAlert({
        type: "error",
        message: "Erro ao salvar anamnese.",
      });
    }
  };

  if (loading) {
    return <div className="text-center p-6">Carregando formulário...</div>;
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

      {(anamneseId) && (
        <h2 className="text-2xl font-semibold mb-4">
          Atualizar Anamnese
        </h2>

      )}
      {(anamneseid) && (
        <h2 className="text-2xl font-semibold mb-4">
          Visualizar Anamnese
        </h2>

      )}
      {(token) && (
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Cadastrar Anamnese
        </h2>

      )}

      <div className="flex border-b">
        {["Informações do paciente", "Histórico", "Laudo"].map((label, index) => (
          <button
            key={label}
            className={`px-4 py-3 text-sm font-medium transition-colors ${step === index
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-primary"
              }`}
            onClick={() => setStep(index)}
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
