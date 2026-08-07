// src/pages/contracts/CreateContractModal.jsx
import { useState, useEffect, useRef } from "react";
import {
  X, Upload, FileText, Check, Eye, ChevronRight,
  User, Building2, AlertCircle, Sparkles
} from "lucide-react";
import ContractService from "../../services/ContractService";
import ContractTemplateService from "../../services/ContractTemplateService";
import BuscarPacienteModal from "../../modal/buscarpacientemodal/BuscarPacienteModal";
import Alert from "../../components/alert/Alert";

// ── Labels dos steps ──────────────────────────────────────────────────────────

const STEPS_SIGNING  = ["Modelo", "Responsável", "Paciente", "Variáveis",
                         "Participantes", "Prévia", "Confirmar"];
const STEPS_EXTERNAL = ["Responsável", "Paciente", "Arquivo", "Confirmar"];

// ── Componente principal ──────────────────────────────────────────────────────

export default function CreateContractModal({ isOpen, onClose, onSuccess }) {

  const [mode,      setMode]      = useState(null); // 'signing' | 'external'
  const [step,      setStep]      = useState(0);
  const [alert,     setAlert]     = useState(null);
  const [submitting,setSubmitting]= useState(false);

  // Dados compartilhados
  const [patient,  setPatient]  = useState(null);
  const [guardian, setGuardian] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Modo signing
  const [templates,         setTemplates]         = useState([]);
  const [loadingTemplates,  setLoadingTemplates]  = useState(false);
  const [selectedTemplate,  setSelectedTemplate]  = useState(null);
  const [variableValues,    setVariableValues]    = useState({});
  const [hasWitnesses,      setHasWitnesses]      = useState(false);
  const [previewHtml,       setPreviewHtml]       = useState("");

  // Modo external
  const [pdfFile,   setPdfFile]  = useState(null);
  const fileRef = useRef(null);

  // ── Reset ───────────────────────────────────────────────────────────────────

  const reset = () => {
    setMode(null); setStep(0); setAlert(null); setSubmitting(false);
    setPatient(null); setGuardian(null);
    setSelectedTemplate(null); setVariableValues({});
    setHasWitnesses(false); setPreviewHtml("");
    setPdfFile(null); setTemplates([]);
  };

  const handleClose = () => { reset(); onClose(); };

  // Fecha com Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) handleClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen]);

  // ── Selecionar modo ─────────────────────────────────────────────────────────

  const selectMode = async (m) => {
    setMode(m);
    if (m === "signing") {
      setLoadingTemplates(true);
      try {
        const data = await ContractTemplateService.getAll();
        setTemplates(Array.isArray(data) ? data : []);
      } catch {
        setAlert({ type: "error", message: "Erro ao carregar modelos." });
      } finally {
        setLoadingTemplates(false);
      }
    }
    setStep(1);
  };

  // ── Paciente selecionado ────────────────────────────────────────────────────

  const handlePatientSelect = (p) => {
    setPatient(p);
    setGuardian(p.guardian || null);
    setSearchOpen(false);
  };

  // ── Prévia ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (mode === "signing" && step === 6 && selectedTemplate) {
      const vars = {
        responsavel_nome:     guardian?.name    || "[Nome do Responsável]",
        responsavel_cpf:      guardian?.cpf     || "[CPF]",
        responsavel_endereco: guardian?.address || "[Endereço]",
        paciente_nome:        patient?.name     || "[Nome do Paciente]",
        paciente_cpf:         patient?.cpf      || "[CPF do Paciente]",
        data_contrato:        new Date().toLocaleDateString("pt-BR"),
        ...variableValues,
      };

      let html = "";
      (selectedTemplate.clauses || []).forEach(c => {
        let content = (c.content || "").replace(/\n/g, "<br/>");
        Object.entries(vars).forEach(([k, v]) => {
          content = content.replaceAll(`{{${k}}}`,
            `<strong class="text-gray-900">${v}</strong>`);
        });
        content = content.replace(/\{\{[^}]+\}\}/g,
          m => `<span class="bg-red-50 text-red-500 px-1 rounded text-xs">${m}</span>`);
        html += `<div class="mb-5">
          <p class="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1">
            ${c.clauseOrder}. ${c.title}
          </p>
          <p class="text-sm text-gray-700 leading-relaxed">${content}</p>
        </div>`;
      });
      setPreviewHtml(html);
    }
  }, [step]);

  // ── Validação ────────────────────────────────────────────────────────────────

  const canProceed = () => {
    if (mode === "signing") {
      if (step === 1) return !!selectedTemplate;
      if (step === 2) return !!guardian;
      if (step === 3) return !!patient;
      if (step === 4) {
        const manual = (selectedTemplate?.variables || []).filter(v => !v.autoFilled);
        return manual.every(v => !v.required || !!variableValues[v.variableName]?.trim());
      }
    }
    if (mode === "external") {
      if (step === 1) return !!guardian;
      if (step === 2) return !!patient;
      if (step === 3) return !!pdfFile;
    }
    return true;
  };

  const nextStep = () => {
    if (!canProceed()) {
      setAlert({ type: "error", message: "Preencha todos os campos obrigatórios." });
      return;
    }
    setAlert(null);
    setStep(s => s + 1);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (mode === "signing") {
        await ContractService.createForSigning({
          templateId:     selectedTemplate.id,
          patientId:      patient.id,
          guardianId:     guardian.id,
          variableValues,
          hasWitnesses:   hasWitnesses || selectedTemplate.witnessConfig === "OBRIGATORIO",
          witnessUserIds: undefined,
        });
      } else {
        await ContractService.createExternal(
          { patientId: patient.id, guardianId: guardian.id },
          pdfFile
        );
      }
      onSuccess();
      reset();
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data || "Erro ao criar contrato." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalSteps  = mode === "signing" ? 7 : 4;
  const stepLabels  = mode === "signing" ? STEPS_SIGNING : STEPS_EXTERNAL;
  const isLastStep  = step === totalSteps;
  const manualVars  = (selectedTemplate?.variables || []).filter(v => !v.autoFilled);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center
          justify-center z-50 p-4"
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col
          max-h-[92vh] overflow-hidden">

          {/* ── Header ────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4
            border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center
                justify-center">
                <FileText size={15} className="text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Novo Contrato</h2>
                {mode && step > 0 && (
                  <p className="text-xs text-gray-400">
                    Etapa {step} de {totalSteps} — {stepLabels[step - 1]}
                  </p>
                )}
              </div>
            </div>
            <button onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100
                rounded-lg transition">
              <X size={17} />
            </button>
          </div>

          {/* ── Progress bar ──────────────────────────────────────────────── */}
          {mode && step > 0 && (
            <div className="px-6 pt-4 pb-1">
              {/* Barra de progresso */}
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
              {/* Steps */}
              <div className="flex items-center justify-between">
                {stepLabels.map((label, i) => {
                  const num     = i + 1;
                  const done    = num < step;
                  const current = num === step;
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                      <div className={`w-5 h-5 rounded-full flex items-center
                        justify-center text-xs font-bold transition-all
                        ${done    ? "bg-primary text-white"
                        : current ? "bg-primary/15 text-primary ring-2 ring-primary/30"
                        :           "bg-gray-100 text-gray-400"}`}>
                        {done ? <Check size={10} /> : num}
                      </div>
                      <span className={`text-[10px] leading-tight text-center hidden sm:block
                        ${current ? "text-primary font-medium" : "text-gray-400"}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Conteúdo ──────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {alert && (
              <div className="mb-4">
                <Alert type={alert.type} message={alert.message}
                  onClose={() => setAlert(null)} duration={4000} />
              </div>
            )}

            {/* Step 0: Escolher modo */}
            {step === 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Selecione como deseja registrar este contrato:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <ModeCard
                    icon={<Sparkles size={20} className="text-primary" />}
                    title="Gerar e Encaminhar para Assinatura"
                    description="Cria o contrato a partir de um modelo cadastrado e envia o link de assinatura eletrônica para o responsável."
                    onClick={() => selectMode("signing")}
                    badge="Recomendado"
                  />
                  <ModeCard
                    icon={<Upload size={20} className="text-gray-500" />}
                    title="Anexar Contrato Já Assinado"
                    description="Faz upload de um PDF que já foi assinado fisicamente ou por outro meio. Ficará registrado como concluído."
                    onClick={() => selectMode("external")}
                  />
                </div>
              </div>
            )}

            {/* ════ MODO SIGNING ════════════════════════════════════════════ */}

            {/* Step 1: Modelo */}
            {mode === "signing" && step === 1 && (
              <div>
                <SectionTitle
                  title="Selecione o modelo de contrato"
                  subtitle="O modelo define as cláusulas, variáveis e campos de aceite."
                />
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary
                      rounded-full animate-spin" />
                  </div>
                ) : templates.length === 0 ? (
                  <EmptyState
                    icon={<FileText size={28} className="text-gray-300" />}
                    message="Nenhum modelo ativo."
                    action={{ label: "Criar modelo", href: "/contratos/modelos/novo" }}
                  />
                ) : (
                  <div className="space-y-2">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={`w-full flex items-start gap-3 p-4 rounded-xl border-2
                          text-left transition-all
                          ${selectedTemplate?.id === t.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-100 bg-gray-50 hover:border-gray-200"
                          }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                          flex-shrink-0 mt-0.5
                          ${selectedTemplate?.id === t.id
                            ? "bg-primary text-white"
                            : "bg-white text-gray-400 border border-gray-200"
                          }`}>
                          <FileText size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {t.name}
                          </p>
                          {t.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {t.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Chip>{t.type?.replace(/_/g, " ")}</Chip>
                            <Chip color="blue">
                              {t.signingMode === "SEQUENCIAL" ? "Sequencial" : "Paralelo"}
                            </Chip>
                            {(t.clauses || []).length > 0 && (
                              <Chip color="green">
                                {t.clauses.length} cláusula{t.clauses.length !== 1 ? "s" : ""}
                              </Chip>
                            )}
                          </div>
                        </div>
                        {selectedTemplate?.id === t.id && (
                          <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0
                            flex items-center justify-center mt-1">
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Responsável */}
            {mode === "signing" && step === 2 && (
              <PersonStep
                title="Responsável pelo paciente"
                subtitle="O responsável será o signatário principal do contrato."
                person={guardian}
                personLabel="Responsável"
                onSearch={() => setSearchOpen(true)}
                searchLabel="Buscar paciente para obter o responsável"
                renderDetail={g => (
                  <>
                    <DetailRow label="Nome" value={g.name} />
                    <DetailRow label="CPF"  value={g.cpf} />
                    <DetailRow label="E-mail" value={g.email} />
                  </>
                )}
              />
            )}

            {/* Step 3: Paciente */}
            {mode === "signing" && step === 3 && (
              <PersonStep
                title="Paciente"
                subtitle="Aluno que será atendido pelos serviços contratados."
                person={patient}
                personLabel="Paciente"
                onSearch={() => setSearchOpen(true)}
                searchLabel="Buscar paciente"
                renderDetail={p => (
                  <>
                    <DetailRow label="Nome"  value={p.name} />
                    <DetailRow label="CPF"   value={p.cpf} />
                    {p.dateBirth && (
                      <DetailRow label="Nasc."
                        value={new Date(p.dateBirth).toLocaleDateString("pt-BR")} />
                    )}
                  </>
                )}
              />
            )}

            {/* Step 4: Variáveis manuais */}
            {mode === "signing" && step === 4 && (
              <div>
                <SectionTitle
                  title="Variáveis do contrato"
                  subtitle="Preencha os campos que serão inseridos nas cláusulas."
                />
                {manualVars.length === 0 ? (
                  <div className="flex items-center gap-3 bg-green-50 border
                    border-green-100 rounded-xl px-4 py-3">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-700">
                      Este modelo não possui variáveis manuais. Tudo é preenchido
                      automaticamente.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {manualVars.map(v => (
                      <div key={v.variableName}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {v.description || v.variableName}
                          {v.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <code className="block text-[11px] text-gray-400 mb-1.5 font-mono">
                          {`{{${v.variableName}}}`}
                        </code>
                        <input
                          type={v.type === "DATE" ? "date"
                            : v.type === "NUMBER" || v.type === "CURRENCY" ? "text"
                            : "text"}
                          placeholder={
                            v.type === "CURRENCY" ? "Ex: R$ 650,00"
                            : v.type === "DATE"   ? ""
                            : `Preencha ${v.description || v.variableName}...`
                          }
                          value={variableValues[v.variableName] || ""}
                          onChange={e => setVariableValues(prev => ({
                            ...prev, [v.variableName]: e.target.value
                          }))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5
                            text-sm focus:outline-none focus:ring-2 focus:ring-primary/30
                            focus:border-primary transition"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Participantes */}
            {mode === "signing" && step === 5 && (
              <div>
                <SectionTitle
                  title="Participantes e ordem de assinatura"
                  subtitle={selectedTemplate?.signingMode === "PARALELO"
                    ? "Todos receberão o link ao mesmo tempo."
                    : "Os links serão enviados em sequência, um após o outro."}
                />
                <div className="space-y-2">
                  <ParticipantCard
                    order={1}
                    role="Contratante"
                    name={guardian?.name}
                    email={guardian?.email}
                    color="blue"
                    status="Receberá o link por e-mail"
                  />
                  <ParticipantCard
                    order={2}
                    role="Contratada"
                    name="LP Kids"
                    email="contato@lpkids.com.br"
                    color="green"
                    status="Assinatura automática ao criar"
                  />
                </div>

                {selectedTemplate?.witnessConfig !== "NAO_UTILIZA" && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {selectedTemplate?.witnessConfig === "OPCIONAL" && (
                      <label className="flex items-center gap-2.5 cursor-pointer
                        text-sm font-medium text-gray-700 mb-3">
                        <div
                          onClick={() => setHasWitnesses(v => !v)}
                          className={`w-5 h-5 rounded border-2 flex items-center
                            justify-center flex-shrink-0 transition-colors cursor-pointer
                            ${hasWitnesses
                              ? "bg-primary border-primary"
                              : "bg-white border-gray-300"
                            }`}
                        >
                          {hasWitnesses && (
                            <Check size={11} className="text-white" />
                          )}
                        </div>
                        Adicionar testemunhas a este contrato
                      </label>
                    )}
                    {(hasWitnesses || selectedTemplate?.witnessConfig === "OBRIGATORIO") && (
                      <div className="flex items-start gap-2.5 bg-amber-50 border
                        border-amber-100 rounded-xl px-4 py-3">
                        <AlertCircle size={15}
                          className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                          Este modelo requer {selectedTemplate?.witnessCount || 1}{" "}
                          testemunha(s). A seleção de secretárias específicas será
                          adicionada em breve.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Pré-visualização */}
            {mode === "signing" && step === 6 && (
              <div>
                <SectionTitle
                  title="Pré-visualização do contrato"
                  subtitle="Revise o conteúdo antes de enviar. Campos em vermelho ainda não foram preenchidos."
                />
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200
                    flex items-center gap-2">
                    <Eye size={13} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">
                      {selectedTemplate?.name}
                    </span>
                  </div>
                  <div
                    className="p-5 max-h-72 overflow-y-auto text-sm"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              </div>
            )}

            {/* Step 7: Confirmar */}
            {mode === "signing" && step === 7 && (
              <ConfirmPanel
                title="Pronto para enviar!"
                description="Ao confirmar, o contrato será gerado e o link de assinatura
                  será enviado para o responsável por e-mail."
                items={[
                  { icon: <FileText size={14} />, label: "Modelo",      value: selectedTemplate?.name },
                  { icon: <User size={14} />,     label: "Responsável", value: guardian?.name },
                  { icon: <User size={14} />,     label: "Paciente",    value: patient?.name },
                  { icon: <Building2 size={14} />,label: "Contratada",  value: "LP Kids" },
                ]}
              />
            )}

            {/* ════ MODO EXTERNAL ══════════════════════════════════════════ */}

            {mode === "external" && step === 1 && (
              <PersonStep
                title="Responsável pelo paciente"
                subtitle="Informe o responsável vinculado a este contrato."
                person={guardian}
                personLabel="Responsável"
                onSearch={() => setSearchOpen(true)}
                searchLabel="Buscar paciente para obter o responsável"
                renderDetail={g => (
                  <>
                    <DetailRow label="Nome"   value={g.name} />
                    <DetailRow label="CPF"    value={g.cpf} />
                    <DetailRow label="E-mail" value={g.email} />
                  </>
                )}
              />
            )}

            {mode === "external" && step === 2 && (
              <PersonStep
                title="Paciente"
                subtitle="Aluno ao qual este contrato está relacionado."
                person={patient}
                personLabel="Paciente"
                onSearch={() => setSearchOpen(true)}
                searchLabel="Buscar paciente"
                renderDetail={p => (
                  <>
                    <DetailRow label="Nome" value={p.name} />
                    <DetailRow label="CPF"  value={p.cpf} />
                  </>
                )}
              />
            )}

            {mode === "external" && step === 3 && (
              <div>
                <SectionTitle
                  title="Arquivo do contrato"
                  subtitle="Selecione o PDF já assinado para armazenar no sistema."
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => setPdfFile(e.target.files?.[0] || null)}
                />
                {pdfFile ? (
                  <div className="flex items-center gap-3 bg-primary/5 border-2
                    border-primary/20 rounded-xl px-4 py-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center
                      justify-center flex-shrink-0">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {(pdfFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Mudar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-10 border-2 border-dashed border-gray-200
                      rounded-xl hover:border-primary hover:bg-primary/5 transition
                      flex flex-col items-center gap-2 text-gray-400"
                  >
                    <Upload size={24} strokeWidth={1.5} />
                    <span className="text-sm font-medium">
                      Clique para selecionar o PDF
                    </span>
                    <span className="text-xs">Apenas arquivos .pdf</span>
                  </button>
                )}
              </div>
            )}

            {mode === "external" && step === 4 && (
              <ConfirmPanel
                title="Salvar contrato anexado"
                description="O documento será registrado como contrato assinado externamente."
                items={[
                  { icon: <User size={14} />,     label: "Responsável", value: guardian?.name },
                  { icon: <User size={14} />,     label: "Paciente",    value: patient?.name },
                  { icon: <FileText size={14} />, label: "Arquivo",     value: pdfFile?.name },
                ]}
              />
            )}

          </div>

          {/* ── Footer ────────────────────────────────────────────────────── */}
          <div className="flex justify-between items-center px-6 py-4
            border-t border-gray-100 bg-gray-50/60">

            <button
              onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}
              className="px-4 py-2 border border-gray-200 rounded-full text-sm
                font-medium text-gray-600 hover:bg-white transition"
            >
              {step === 0 ? "Cancelar" : "Voltar"}
            </button>

            {/* Botão direito */}
            {step === 0 ? (
              // No step 0 os cards já chamam selectMode
              <span />
            ) : isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-primary text-white rounded-full text-sm
                  font-semibold hover:bg-primary/90 transition disabled:opacity-50
                  flex items-center gap-2"
              >
                {submitting && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white
                    rounded-full animate-spin" />
                )}
                {submitting ? "Enviando..." :
                  mode === "signing" ? "Confirmar e Enviar" : "Salvar Contrato"}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-primary text-white rounded-full text-sm
                  font-semibold hover:bg-primary/90 transition flex items-center gap-1.5"
              >
                Continuar <ChevronRight size={15} />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Modal de busca de paciente */}
      <BuscarPacienteModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectPaciente={handlePatientSelect}
        title="Buscar Paciente"
        confirmLabel="Selecionar Paciente"
        description="Selecione o paciente para obter o responsável vinculado."
      />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Sub-componentes
// ════════════════════════════════════════════════════════════════════════════

function ModeCard({ icon, title, description, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-4 p-5 border-2 border-gray-100
        bg-gray-50 rounded-xl hover:border-primary hover:bg-primary/5
        transition-all text-left group"
    >
      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200
        flex items-center justify-center flex-shrink-0 group-hover:border-primary/30
        group-hover:bg-primary/10 transition-all">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-gray-900">{title}</p>
          {badge && (
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary
              rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <ChevronRight size={16}
        className="text-gray-300 group-hover:text-primary transition-colors
          flex-shrink-0 mt-1" />
    </button>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <p className="font-semibold text-sm text-gray-900">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function PersonStep({ title, subtitle, person, personLabel, onSearch,
                      searchLabel, renderDetail }) {
  return (
    <div>
      <SectionTitle title={title} subtitle={subtitle} />
      {person ? (
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white text-sm
                font-bold flex items-center justify-center">
                {person.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-primary uppercase
                tracking-wide">
                {personLabel} selecionado
              </span>
            </div>
            <button
              onClick={onSearch}
              className="text-xs text-gray-500 hover:text-primary transition
                font-medium underline underline-offset-2"
            >
              Mudar
            </button>
          </div>
          <div className="space-y-1.5 pl-10">
            {renderDetail(person)}
          </div>
        </div>
      ) : (
        <button
          onClick={onSearch}
          className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl
            hover:border-primary hover:bg-primary/5 transition flex flex-col
            items-center gap-2 text-gray-400 group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center
            justify-center group-hover:bg-primary/10 transition">
            <Search size={18} className="group-hover:text-primary transition" />
          </div>
          <span className="text-sm font-medium text-gray-600
            group-hover:text-primary transition">
            {searchLabel}
          </span>
          <span className="text-xs text-gray-400">
            Clique para abrir a busca
          </span>
        </button>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-gray-400 w-14 flex-shrink-0">{label}:</span>
      <span className="font-medium text-gray-700 truncate">{value}</span>
    </div>
  );
}

function ParticipantCard({ order, role, name, email, color, status }) {
  const colors = {
    blue:  { ring: "border-blue-200 bg-blue-50",  badge: "bg-blue-500",
              text: "text-blue-700" },
    green: { ring: "border-green-200 bg-green-50", badge: "bg-green-500",
              text: "text-green-700" },
    amber: { ring: "border-amber-200 bg-amber-50", badge: "bg-amber-500",
              text: "text-amber-700" },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`flex items-center gap-3 p-3.5 border rounded-xl ${c.ring}`}>
      <div className={`w-7 h-7 rounded-full ${c.badge} text-white text-xs
        font-bold flex items-center justify-center flex-shrink-0`}>
        {order}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-800">{name}</p>
          <span className={`text-[11px] font-medium ${c.text}`}>{role}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{email}</p>
      </div>
      <span className={`text-[11px] ${c.text} font-medium flex-shrink-0`}>
        {status}
      </span>
    </div>
  );
}

function ConfirmPanel({ title, description, items }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center
          justify-center flex-shrink-0">
          <Check size={20} className="text-green-500" />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-xl divide-y
        divide-gray-100">
        {items.filter(i => i.value).map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <span className="text-gray-400 flex-shrink-0">{item.icon}</span>
            <span className="text-xs text-gray-500 w-24 flex-shrink-0">
              {item.label}
            </span>
            <span className="text-sm font-medium text-gray-800 truncate">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ icon, message, action }) {
  return (
    <div className="text-center py-10">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-sm text-gray-500">{message}</p>
      {action && (
        <a href={action.href}
          className="text-sm text-primary hover:underline font-medium mt-2
            inline-block">
          {action.label}
        </a>
      )}
    </div>
  );
}

function Chip({ children, color = "gray" }) {
  const colors = {
    gray:  "bg-gray-100 text-gray-600",
    blue:  "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium
      ${colors[color]}`}>
      {children}
    </span>
  );
}

// Ícone Search para o PersonStep
function Search({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}