// src/pages/anamnesis/anamnesisform/AnamnesisForm.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, XCircle, Lock, AlertCircle } from "lucide-react";
import DynamicFormField from "./DynamicFormField";
import AnamnesisService from "../../../services/AnamnesisService";
import Alert from "../../../components/alert/Alert";

/**
 * Três modos de operação:
 *
 *  1. token      → formulário público para o responsável preencher
 *  2. anamneseid → visualização somente leitura (admin)
 *  3. anamneseId → edição autenticada (admin)
 */
function AnamnesisForm() {
  const { token, anamneseid, anamneseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [tokenStatus, setTokenStatus] = useState(null); // 'valid' | 'expired' | 'invalid'
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // ── Dados do formulário ────────────────────────────────────────────────────

  const [anamnesisId, setAnamnesisId] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [templateName, setTemplateName] = useState("");

  // Campos do template: [{ id, label, fieldType, required, placeholder, options }]
  const [fields, setFields] = useState([]);

  // Respostas textuais indexadas por fieldId: { [fieldId]: string }
  const [answers, setAnswers] = useState({});

  // Arquivos locais indexados por fieldId: { [fieldId]: File }
  const [files, setFiles] = useState({});

  // Arquivos já salvos no backend: { [fieldId]: { hasFile, fileName } }
  const [savedFiles, setSavedFiles] = useState({});

  // Erros de validação por fieldId: { [fieldId]: string }
  const [errors, setErrors] = useState({});

  // ── Carregamento ────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        // MODO 1: formulário público (token)
        if (token) {
          const dto = await AnamnesisService.buscarPorToken(token);

          // 'E' = Encaminhada (aguardando resposta); qualquer outro já foi respondido
          if (dto.status !== "E") {
            setTokenStatus("expired");
            return;
          }

          setTokenStatus("valid");
          populateFromFormDTO(dto);
        }

        // MODO 2: visualização (anamneseid)
        else if (anamneseid) {
          setIsReadOnly(true);
          const dto = await AnamnesisService.buscarPorId(anamneseid);
          setTokenStatus("valid");
          populateFromAnamnesisDTO(dto);
        }

        // MODO 3: edição (anamneseId)
        else if (anamneseId) {
          const dto = await AnamnesisService.buscarPorId(anamneseId);
          setTokenStatus("valid");
          populateFromAnamnesisDTO(dto);
        }
      } catch (err) {
        console.error(err);
        setTokenStatus("invalid");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, anamneseid, anamneseId]);

  // ── Populadores ─────────────────────────────────────────────────────────────

  /**
   * Popula a partir de AnamnesisFormDTO (token público).
   * { anamnesisId, status, patientName, template, existingAnswers }
   */
  const populateFromFormDTO = (dto) => {
    setAnamnesisId(dto.anamnesisId);
    setPatientName(dto.patientName ?? "");
    setTemplateName(dto.template?.name ?? "");
    setFields(normalizeFields(dto.template?.fields ?? []));

    const answerMap = {};
    const savedFileMap = {};

    (dto.existingAnswers ?? []).forEach((a) => {
      if (a.fieldType === "FILE") {
        savedFileMap[a.fieldId] = { hasFile: a.hasFile, fileName: a.fileName };
      } else {
        answerMap[a.fieldId] = a.value ?? "";
      }
    });

    setAnswers(answerMap);
    setSavedFiles(savedFileMap);
  };

  /**
   * Popula a partir de AnamnesisDTO (visualização / edição admin).
   * { id, patientName, template, answers }
   */
  const populateFromAnamnesisDTO = (dto) => {
    setAnamnesisId(dto.id);
    setPatientName(dto.patientName ?? "");
    setTemplateName(dto.template?.name ?? "");
    setFields(normalizeFields(dto.template?.fields ?? []));

    const answerMap = {};
    const savedFileMap = {};

    (dto.answers ?? []).forEach((a) => {
      if (a.fieldType === "FILE") {
        savedFileMap[a.fieldId] = { hasFile: a.hasFile, fileName: a.fileName };
      } else {
        answerMap[a.fieldId] = a.value ?? "";
      }
    });

    setAnswers(answerMap);
    setSavedFiles(savedFileMap);
  };

  /** Garante que options seja sempre string[] */
  const normalizeFields = (rawFields) =>
    rawFields.map((f) => ({
      ...f,
      options: Array.isArray(f.options)
        ? f.options
        : typeof f.options === "string"
          ? f.options.split("|").map((o) => o.trim()).filter(Boolean)
          : [],
    }));

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleChange = (fieldId, value) => {
    if (isReadOnly) return;
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => ({ ...prev, [fieldId]: undefined }));
  };

  const handleFileChange = (fieldId, file) => {
    if (isReadOnly) return;
    setFiles((prev) => ({ ...prev, [fieldId]: file }));
    setErrors((prev) => ({ ...prev, [fieldId]: undefined }));
  };

  // ── Validação ─────────────────────────────────────────────────────────────────

  const validate = () => {
    const errs = {};

    fields.forEach((field) => {
      if (!field.required) return;

      if (field.fieldType === "FILE") {
        const hasLocal = !!files[field.id];
        const hasSaved = savedFiles[field.id]?.hasFile;
        if (!hasLocal && !hasSaved) {
          errs[field.id] = "Este campo é obrigatório.";
        }
      } else {
        const val = answers[field.id];
        if (!val || val.trim() === "") {
          errs[field.id] = "Este campo é obrigatório.";
        }
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) {
      setAlert({ type: "error", message: "Preencha todos os campos obrigatórios." });
      return;
    }

    setSubmitting(true);
    try {
      // Monta array de answers (exclui campos FILE)
      const answersArray = fields
        .filter((f) => f.fieldType !== "FILE")
        .map((f) => ({
          fieldId: f.id,
          value: answers[f.id] ?? null,
        }));

      // Monta array de arquivos: { fieldId, file }
      const filesArray = Object.entries(files)
        .filter(([, f]) => f !== null)
        .map(([fieldId, file]) => ({ fieldId: Number(fieldId), file }));

      await AnamnesisService.responderAnamnese(anamnesisId, answersArray, filesArray);

      setSubmitSuccess(true);

      if (!token) {
        setAlert({ type: "success", message: "Anamnese salva com sucesso!" });
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Erro ao salvar anamnese.";
      setAlert({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Telas de estado ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Screen>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Carregando formulário...</p>
      </Screen>
    );
  }

  if (submitSuccess && token) {
    return (
      <Screen>
        <CheckCircle className="text-primary mx-auto mb-4" size={60} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enviado com sucesso!</h2>
        <p className="text-gray-500 text-sm">
          Obrigado por preencher o formulário. As informações foram salvas.
        </p>
      </Screen>
    );
  }

  if (tokenStatus === "expired" && token) {
    return (
      <Screen>
        <Lock className="text-primary mx-auto mb-4" size={60} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Formulário já respondido</h2>
        <p className="text-gray-500 text-sm">
          Este formulário já foi preenchido anteriormente. Se acredita que é um erro,
          entre em contato com a clínica.
        </p>
      </Screen>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <Screen>
        <XCircle className="text-primary mx-auto mb-4" size={60} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Link inválido</h2>
        <p className="text-gray-500 text-sm">
          O link que você acessou é inválido ou expirou. Por favor, solicite um novo
          link à clínica.
        </p>
      </Screen>
    );
  }

  const hasRequiredErrors = Object.values(errors).some(Boolean);

  // ── Formulário ────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen py-6 px-4 ${token ? "bg-gradient-to-br from-blue-50 to-blue-100" : "bg-gray-50"}`}>
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-3xl mx-auto">

        {/* Alert */}
        {alert && (
          <div className="mb-4">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
              duration={5000}
            />
          </div>
        )}

        {/* Cabeçalho */}
        <div className={`mb-6 ${token ? "text-center" : ""}`}>
          {token && (
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Formulário de Anamnese
            </h1>
          )}
          {!token && (
            <h2 className="text-xl font-semibold text-gray-800">
              {isReadOnly ? "Visualizar Anamnese" : "Editar Anamnese"}
            </h2>
          )}

          <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-2 ${token ? "justify-center" : ""}`}>
            <span className="text-sm text-gray-500">
              Paciente: <span className="font-medium text-gray-700">{patientName}</span>
            </span>
            {templateName && (
              <span className="text-sm text-gray-400">
                Modelo: <span className="font-medium text-gray-600">{templateName}</span>
              </span>
            )}
          </div>
        </div>

        {/* Banner de erros de validação */}
        {hasRequiredErrors && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200
            rounded-xl px-4 py-3 mb-6">
            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">
              Preencha todos os campos obrigatórios antes de enviar.
            </p>
          </div>
        )}

        {/* Divisor */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {isReadOnly ? "Respostas" : "Preencha os campos abaixo"}
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Campos dinâmicos */}
        {fields.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            Este formulário não possui campos cadastrados.
          </p>
        ) : (
          <div className="space-y-5">
            {fields.map((field) => (
              <DynamicFormField
                key={field.id}
                field={field}
                value={answers[field.id] ?? null}
                file={files[field.id] ?? null}
                hasFile={savedFiles[field.id]?.hasFile ?? false}
                fileName={savedFiles[field.id]?.fileName ?? null}
                onChange={handleChange}
                onFileChange={handleFileChange}
                isReadOnly={isReadOnly}
                error={errors[field.id] ?? null}
              />
            ))}
          </div>
        )}

        {/* Botão de envio */}
        {!isReadOnly && fields.length > 0 && (
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2.5 rounded-full bg-primary text-white font-medium text-sm
                hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center gap-2"
            >
              {submitting && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white
                  rounded-full animate-spin" />
              )}
              {submitting ? "Enviando..." : token ? "Enviar formulário" : "Salvar alterações"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tela centralizada para estados (loading, sucesso, erro) ───────────────────

function Screen({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100
      flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center w-full">
        {children}
      </div>
    </div>
  );
}

export default AnamnesisForm;