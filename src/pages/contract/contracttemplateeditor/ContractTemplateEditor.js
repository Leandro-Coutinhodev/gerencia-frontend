// src/pages/contracts/templates/ContractTemplateEditor.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import ContractTemplateService from "../../../services/ContractTemplateService";
import Alert from "../../../components/alert/Alert";

const CONTRACT_TYPES = [
  { value: "PRESTACAO_SERVICO", label: "Prestação de Serviço" },
  { value: "CONSENTIMENTO",     label: "Consentimento" },
  { value: "LGPD",              label: "LGPD" },
  { value: "ANAMNESE",          label: "Anamnese" },
  { value: "OUTRO",             label: "Outro" },
];
const SIGNING_MODES = [
  { value: "SEQUENCIAL", label: "Sequencial (um por vez)" },
  { value: "PARALELO",   label: "Paralelo (todos ao mesmo tempo)" },
];
const WITNESS_CONFIGS = [
  { value: "NAO_UTILIZA", label: "Não utiliza testemunhas" },
  { value: "OPCIONAL",    label: "Opcional (pergunta ao criar)" },
  { value: "OBRIGATORIO", label: "Obrigatório (sempre requer)" },
];
const VARIABLE_TYPES  = ["TEXT","NUMBER","DATE","CURRENCY"];
const ACCEPT_TYPES    = ["CHECKBOX","SIM_NAO","TEXT","DATE","SIGNATURE"];

// Variáveis automáticas (não precisam ser cadastradas manualmente)
const AUTO_VARS = [
  { name: "responsavel_nome",     desc: "Nome do responsável" },
  { name: "responsavel_cpf",      desc: "CPF do responsável" },
  { name: "responsavel_endereco", desc: "Endereço do responsável" },
  { name: "paciente_nome",        desc: "Nome do paciente" },
  { name: "paciente_cpf",         desc: "CPF do paciente" },
  { name: "data_contrato",        desc: "Data de geração do contrato" },
];

export default function ContractTemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [alert, setAlert]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(isEditing);

  // Dados gerais
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [type, setType]               = useState("PRESTACAO_SERVICO");
  const [signingMode, setSigningMode] = useState("SEQUENCIAL");
  const [witnessConfig, setWitnessConfig] = useState("NAO_UTILIZA");
  const [witnessCount, setWitnessCount]   = useState(0);

  // Cláusulas
  const [clauses, setClauses] = useState([
    { id: Date.now(), clauseOrder: 1, title: "", content: "" },
  ]);

  // Variáveis manuais (as auto são adicionadas pelo sistema)
  const [variables, setVariables] = useState([]);

  // Campos de aceite
  const [acceptFields, setAcceptFields] = useState([]);

  // Aba ativa
  const [tab, setTab] = useState("clausulas");

  // ── Carregamento ao editar ─────────────────────────────────────────

  useEffect(() => {
    if (!isEditing) return;
    ContractTemplateService.getById(id)
      .then(dto => {
        setName(dto.name || "");
        setDescription(dto.description || "");
        setType(dto.type || "PRESTACAO_SERVICO");
        setSigningMode(dto.signingMode || "SEQUENCIAL");
        setWitnessConfig(dto.witnessConfig || "NAO_UTILIZA");
        setWitnessCount(dto.witnessCount || 0);
        setClauses(dto.clauses?.length
          ? dto.clauses.map(c => ({ ...c, id: c.id || Date.now() }))
          : [{ id: Date.now(), clauseOrder: 1, title: "", content: "" }]);
        setVariables(dto.variables?.filter(v => !v.autoFilled) || []);
        setAcceptFields(dto.acceptFields || []);
      })
      .catch(() => setAlert({ type: "error", message: "Erro ao carregar modelo." }))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Cláusulas ──────────────────────────────────────────────────────

  const addClause = () => {
    setClauses(prev => [...prev, {
      id: Date.now(), clauseOrder: prev.length + 1, title: "", content: ""
    }]);
  };

  const removeClause = (idx) =>
    setClauses(prev => prev.filter((_, i) => i !== idx)
      .map((c, i) => ({ ...c, clauseOrder: i + 1 })));

  const updateClause = (idx, field, value) =>
    setClauses(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));

  const moveClause = (idx, dir) => {
    const next = [...clauses];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setClauses(next.map((c, i) => ({ ...c, clauseOrder: i + 1 })));
  };

  // ── Variáveis manuais ──────────────────────────────────────────────

  const addVariable = () =>
    setVariables(prev => [...prev, {
      id: Date.now(), variableName: "", description: "", type: "TEXT", required: true, autoFilled: false
    }]);

  const removeVariable = (idx) => setVariables(prev => prev.filter((_, i) => i !== idx));

  const updateVariable = (idx, field, value) =>
    setVariables(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));

  // ── Campos de aceite ───────────────────────────────────────────────

  const addAcceptField = () =>
    setAcceptFields(prev => [...prev, {
      id: Date.now(), fieldOrder: prev.length + 1, label: "", fieldType: "CHECKBOX", required: true
    }]);

  const removeAcceptField = (idx) =>
    setAcceptFields(prev => prev.filter((_, i) => i !== idx)
      .map((f, i) => ({ ...f, fieldOrder: i + 1 })));

  const updateAcceptField = (idx, field, value) =>
    setAcceptFields(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f));

  // ── Submit ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!name.trim()) {
      setAlert({ type: "error", message: "Nome do modelo é obrigatório." });
      return;
    }
    if (clauses.some(c => !c.title.trim() || !c.content.trim())) {
      setAlert({ type: "error", message: "Todas as cláusulas precisam de título e conteúdo." });
      setTab("clausulas");
      return;
    }

    const payload = {
      name: name.trim(),
      description,
      type,
      signingMode,
      witnessConfig,
      witnessCount: ["OPCIONAL","OBRIGATORIO"].includes(witnessConfig) ? witnessCount : 0,
      clauses: clauses.map(c => ({
        clauseOrder: c.clauseOrder, title: c.title, content: c.content
      })),
      variables: variables.map(v => ({
        variableName: v.variableName,
        description: v.description,
        type: v.type,
        required: v.required,
        autoFilled: false,
      })),
      acceptFields: acceptFields.map(f => ({
        fieldOrder: f.fieldOrder, label: f.label,
        fieldType: f.fieldType, required: f.required
      })),
    };

    setSaving(true);
    try {
      if (isEditing) {
        await ContractTemplateService.update(id, payload);
      } else {
        await ContractTemplateService.create(payload);
      }
      navigate("/contrato/modelo");
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data || "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  if (loading) return (
    <div className="p-8 text-center text-gray-500">Carregando modelo...</div>
  );

  const tabs = [
    { key: "clausulas",   label: `Cláusulas (${clauses.length})` },
    { key: "variaveis",   label: `Variáveis (${variables.length + AUTO_VARS.length})` },
    { key: "aceite",      label: `Campos de Aceite (${acceptFields.length})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-900 transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? "Editar Modelo" : "Novo Modelo de Contrato"}
          </h1>
        </div>

        {alert && (
          <div className="mb-4">
            <Alert type={alert.type} message={alert.message}
              onClose={() => setAlert(null)} duration={5000} />
          </div>
        )}

        {/* Card principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-800 mb-4">Informações Gerais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="sm:col-span-2">
              <label className="label-sm">Nome do modelo *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Ex: Prestação de Serviços 2025"
                className="input-base" />
            </div>

            {/* Descrição */}
            <div className="sm:col-span-2">
              <label className="label-sm">Descrição</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Descrição resumida..."
                className="input-base" />
            </div>

            {/* Tipo */}
            <div>
              <label className="label-sm">Tipo</label>
              <Select value={type} onChange={setType} options={CONTRACT_TYPES} />
            </div>

            {/* Modo assinatura */}
            <div>
              <label className="label-sm">Ordem de Assinatura</label>
              <Select value={signingMode} onChange={setSigningMode} options={SIGNING_MODES} />
            </div>

            {/* Testemunhas */}
            <div>
              <label className="label-sm">Configuração de Testemunhas</label>
              <Select value={witnessConfig} onChange={setWitnessConfig} options={WITNESS_CONFIGS} />
            </div>

            {/* Quantidade testemunhas */}
            {witnessConfig !== "NAO_UTILIZA" && (
              <div>
                <label className="label-sm">Quantidade de Testemunhas</label>
                <input type="number" min={0} max={5}
                  value={witnessCount} onChange={e => setWitnessCount(Number(e.target.value))}
                  className="input-base" />
              </div>
            )}
          </div>
        </div>

        {/* Abas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 flex gap-1 px-4 pt-4">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition
                  ${tab === t.key
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-gray-500 hover:text-gray-800"
                  }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── Aba: Cláusulas ─────────────────────────────────────── */}
            {tab === "clausulas" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-3">
                  Use <code className="bg-gray-100 px-1 rounded">{"{{variavel_nome}}"}</code> para
                  inserir variáveis dinâmicas no conteúdo das cláusulas.
                </p>
                {clauses.map((clause, idx) => (
                  <div key={clause.id}
                    className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2">
                      <span className="text-xs font-bold text-gray-400 w-5">
                        {clause.clauseOrder}
                      </span>
                      <input
                        value={clause.title}
                        onChange={e => updateClause(idx, "title", e.target.value)}
                        placeholder="Título da cláusula..."
                        className="flex-1 bg-transparent text-sm font-semibold text-gray-800
                          focus:outline-none placeholder-gray-400"
                      />
                      <div className="flex gap-1 ml-auto">
                        <button onClick={() => moveClause(idx, -1)} disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                          <ChevronUp size={14} />
                        </button>
                        <button onClick={() => moveClause(idx, 1)} disabled={idx === clauses.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                          <ChevronDown size={14} />
                        </button>
                        <button onClick={() => removeClause(idx)}
                          className="p-1 text-red-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={clause.content}
                      onChange={e => updateClause(idx, "content", e.target.value)}
                      placeholder="Conteúdo da cláusula. Use {{variavel}} para campos dinâmicos."
                      rows={4}
                      className="w-full px-4 py-3 text-sm text-gray-700 focus:outline-none resize-none"
                    />
                  </div>
                ))}
                <button onClick={addClause}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80
                    font-medium px-4 py-2 border-2 border-dashed border-primary/30
                    rounded-xl w-full justify-center hover:bg-primary/5 transition">
                  <Plus size={16} /> Adicionar Cláusula
                </button>
              </div>
            )}

            {/* ── Aba: Variáveis ────────────────────────────────────── */}
            {tab === "variaveis" && (
              <div>
                {/* Automáticas */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Variáveis Automáticas (preenchidas pelo sistema)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                  {AUTO_VARS.map(v => (
                    <div key={v.name}
                      className="flex items-center gap-2 bg-gray-50 border border-gray-100
                        rounded-lg px-3 py-2">
                      <code className="text-xs text-primary font-mono">
                        {`{{${v.name}}}`}
                      </code>
                      <span className="text-xs text-gray-500">{v.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Manuais */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Variáveis Manuais (preenchidas ao criar o contrato)
                </p>
                <div className="space-y-2">
                  {variables.map((v, idx) => (
                    <div key={v.id}
                      className="grid grid-cols-12 gap-2 items-center border border-gray-200
                        rounded-lg p-3">
                      <div className="col-span-4">
                        <label className="label-sm">Nome da variável</label>
                        <input value={v.variableName}
                          onChange={e => updateVariable(idx, "variableName", e.target.value)}
                          placeholder="valor_plano"
                          className="input-base text-xs font-mono" />
                      </div>
                      <div className="col-span-4">
                        <label className="label-sm">Descrição</label>
                        <input value={v.description}
                          onChange={e => updateVariable(idx, "description", e.target.value)}
                          placeholder="Ex: Valor mensal do plano"
                          className="input-base" />
                      </div>
                      <div className="col-span-2">
                        <label className="label-sm">Tipo</label>
                        <select value={v.type}
                          onChange={e => updateVariable(idx, "type", e.target.value)}
                          className="input-base">
                          {VARIABLE_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 flex items-center mt-4">
                        <label className="flex items-center gap-1 text-xs text-gray-600">
                          <input type="checkbox" checked={v.required}
                            onChange={e => updateVariable(idx, "required", e.target.checked)}
                            className="w-3 h-3" />
                          Req.
                        </label>
                      </div>
                      <div className="col-span-1 flex justify-end mt-4">
                        <button onClick={() => removeVariable(idx)}
                          className="text-red-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addVariable}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80
                      font-medium px-4 py-2 border-2 border-dashed border-primary/30
                      rounded-xl w-full justify-center hover:bg-primary/5 transition">
                    <Plus size={16} /> Adicionar Variável Manual
                  </button>
                </div>
              </div>
            )}

            {/* ── Aba: Campos de Aceite ─────────────────────────────── */}
            {tab === "aceite" && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">
                  Campos exibidos na tela de assinatura para cada participante preencher.
                </p>
                {acceptFields.map((f, idx) => (
                  <div key={f.id}
                    className="grid grid-cols-12 gap-2 items-center border border-gray-200
                      rounded-lg p-3">
                    <div className="col-span-5">
                      <label className="label-sm">Pergunta / Label</label>
                      <input value={f.label}
                        onChange={e => updateAcceptField(idx, "label", e.target.value)}
                        placeholder="Ex: Autoriza uso de imagem?"
                        className="input-base" />
                    </div>
                    <div className="col-span-3">
                      <label className="label-sm">Tipo</label>
                      <select value={f.fieldType}
                        onChange={e => updateAcceptField(idx, "fieldType", e.target.value)}
                        className="input-base">
                        {ACCEPT_TYPES.map(t => (
                          <option key={t} value={t}>{t.replace("_"," ")}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center mt-4">
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input type="checkbox" checked={f.required}
                          onChange={e => updateAcceptField(idx, "required", e.target.checked)}
                          className="w-3 h-3" />
                        Obrigatório
                      </label>
                    </div>
                    <div className="col-span-2 flex justify-end items-center mt-4">
                      <span className="text-xs text-gray-400 mr-2">#{f.fieldOrder}</span>
                      <button onClick={() => removeAcceptField(idx)}
                        className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={addAcceptField}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80
                    font-medium px-4 py-2 border-2 border-dashed border-primary/30
                    rounded-xl w-full justify-center hover:bg-primary/5 transition">
                  <Plus size={16} /> Adicionar Campo de Aceite
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium
              text-gray-700 hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-7 py-2.5 bg-primary text-white rounded-full text-sm font-medium
              hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white
              rounded-full animate-spin" />}
            {saving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Modelo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componentes auxiliares ──────────────────────────────────────────────

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
        focus:outline-none focus:ring-2 focus:ring-primary/30">
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}