import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, XCircle, Lock } from "lucide-react";
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
  const [tokenStatus, setTokenStatus] = useState(null); // 'valid', 'expired', 'invalid'
  const [submitSuccess, setSubmitSuccess] = useState(false);
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
        // MODO 1: Visualização (anamneseid) - READ ONLY
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
          setTokenStatus('valid'); // Para não mostrar telas de erro
        } 
        // MODO 2: Formulário Público (token)
        else if (token) {
          const dados = await AnamnesisService.buscarPorToken(token);

          // Verifica se já foi respondida
          if (dados.status !== 'Encaminhada') {
            setTokenStatus('expired');
            setLoading(false);
            return;
          }

          setTokenStatus('valid');
          
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
              : new Date().toISOString().split("T")[0],
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
        } 
        // MODO 3: Edição (anamneseId)
        else if (anamneseId) {
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
          setTokenStatus('valid');
        }
      } catch (error) {
        console.error(error);
        setTokenStatus('invalid');
        setAlert({
          type: "error",
          message: "Erro ao carregar dados da anamnese.",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [token, anamneseid, anamneseId]);

  const handleChange = (field, value) => {
    if (!isReadOnly) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

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
        diagnoses: finalUnique.join(", "),
        medicationAndAllergies: formData.medicationAndAllergies,
        indications: formData.indications,
        objectives: formData.objectives,
        developmentHistory: formData.developmentHistory,
        preferences: formData.preferences,
        interferingBehaviors: formData.interferingBehaviors,
        qualityOfLife: formData.qualityOfLife,
        feeding: formData.feeding,
        sleep: formData.sleep,
        therapists: formData.therapists,
      };

      const reports = Array.isArray(formData.report)
        ? formData.report
        : formData.report
          ? [formData.report]
          : [];

      // Se for formulário público (token), usa responderAnamnese
      if (token) {
        const formDataToSend = new FormData();
        
        formDataToSend.append('anamnesis', new Blob([JSON.stringify(dadosParaEnvio)], {
          type: 'application/json'
        }));

        if (reports.length > 0) {
          reports.forEach((file) => {
            formDataToSend.append('reports', file);
          });
        }

        await AnamnesisService.responderAnamnese(formData.id, formDataToSend);

        setSubmitSuccess(true);
        setAlert({
          type: "success",
          message: "Anamnese enviada com sucesso! Obrigado pela colaboração.",
        });

        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        // Se for edição autenticada, usa criar
        await AnamnesisService.criar(formData.id, dadosParaEnvio, reports);

        setAlert({
          type: "success",
          message: "Anamnese salva com sucesso!",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        type: "error",
        message: "Erro ao salvar anamnese.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Tela de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D75C4] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  // Tela de sucesso (apenas para formulário público)
  if (submitSuccess && token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <CheckCircle className="text-[#3D75C4] mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enviado com sucesso!</h2>
          <p className="text-gray-600 mb-4">
            Obrigado por preencher o formulário. As informações foram salvas com sucesso.
          </p>
          <p className="text-sm text-gray-500">
            Você será redirecionado em instantes...
          </p>
        </div>
      </div>
    );
  }

  // Tela de token expirado (apenas para formulário público)
  if (tokenStatus === 'expired' && token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <Lock className="text-[#3D75C4] mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Formulário já respondido</h2>
          <p className="text-gray-600 mb-4">
            Este formulário já foi preenchido e enviado anteriormente.
          </p>
          <p className="text-sm text-gray-500">
            Se você acredita que isso é um erro, entre em contato com a clínica.
          </p>
        </div>
      </div>
    );
  }

  // Tela de token inválido (apenas se for token e falhou)
  if (tokenStatus === 'invalid' && token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <XCircle className="text-[#3D75C4] mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Link inválido</h2>
          <p className="text-gray-600 mb-4">
            O link que você acessou é inválido ou expirou.
          </p>
          <p className="text-sm text-gray-500">
            Por favor, solicite um novo link à clínica.
          </p>
        </div>
      </div>
    );
  }

  // Formulário (visualização ou edição)
  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-8 sm:px-4">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 w-full max-w-4xl mx-auto">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            duration={4000}
          />
        )}

        {anamneseId && (
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Atualizar Anamnese</h2>
        )}
        {anamneseid && (
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Visualizar Anamnese</h2>
        )}
        {token && (
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Formulário de Anamnese
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Paciente: <span className="font-semibold">{formData.patientName}</span>
            </p>
          </div>
        )}

        <div className="flex overflow-x-auto border-b -mx-4 px-4 sm:mx-0 sm:px-0">
          {["Informações do paciente", "Histórico", "Laudo"].map((label, index) => (
            <button
              key={label}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                step === index
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-primary"
              }`}
              onClick={() => setStep(index)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 sm:mt-6">
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
    </div>
  );
}

export default AnamnesisForm;