// src/pages/records/recordtemplateeditor/RecordTemplateEditor.js
// Criação/edição de um modelo de ficha: combina atividades do banco pessoal do profissional
// (cada uma com seus próprios campos de execução) e campos gerais da sessão.
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Settings2,
  Dumbbell, X, Search
} from "lucide-react";
import RecordTemplateService from "../../../services/RecordTemplateService";
import ActivityService from "../../../services/ActivityService";
import Alert from "../../../components/alert/Alert";

const FIELD_TYPES = [
  { value: "TEXT",     label: "Texto curto" },
  { value: "TEXTAREA", label: "Texto longo" },
  { value: "DATE",     label: "Data" },
  { value: "NUMBER",   label: "Número" },
  { value: "SCALE",    label: "Escala (0–10)" },
  { value: "CHECKBOX", label: "Múltipla escolha" },
];

const TYPE_COLORS = {
  TEXT:     "bg-blue-50 text-blue-700 border-blue-100",
  TEXTAREA: "bg-purple-50 text-purple-700 border-purple-100",
  DATE:     "bg-yellow-50 text-yellow-700 border-yellow-100",
  NUMBER:   "bg-orange-50 text-orange-700 border-orange-100",
  SCALE:    "bg-green-50 text-green-700 border-green-100",
  CHECKBOX: "bg-teal-50 text-teal-700 border-teal-100",
};

let keySeq = 0;
const newKey = () => `k${Date.now()}_${keySeq++}`;

const blankField = () => ({
  _key: newKey(), id: null, label: "", fieldType: "TEXT",
  unit: "", required: false, position: 0, options: "",
});

// Extrai só os atributos que o backend espera, descartando campos auxiliares do cliente (_key)
const toFieldPayload = (f, position) => ({
  id: f.id ?? null,
  label: f.label,
  fieldType: f.fieldType,
  unit: f.unit ? f.unit.trim() : null,
  required: !!f.required,
  position,
  options: f.options || null,
});

// ── Editor de lista de campos (reutilizado para campos gerais e para cada item de atividade) ──
function FieldListEditor({ fields, onChange, addLabel }) {
  const [expandedKey, setExpandedKey] = useState(null);

  const addField = () => {
    const field = blankField();
    onChange([...fields, field]);
    setExpandedKey(field._key);
  };

  const removeField = (key) => {
    onChange(fields.filter(f => f._key !== key));
    if (expandedKey === key) setExpandedKey(null);
  };

  const updateField = (key, patch) => {
    onChange(fields.map(f => f._key === key ? { ...f, ...patch } : f));
  };

  const moveField = (idx, dir) => {
    const next = [...fields];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  };

  return (
    <div>
      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white
        divide-y divide-gray-50">
        {fields.length === 0 && (
          <p className="text-xs text-gray-400 italic px-4 py-4">
            Nenhum campo adicionado ainda.
          </p>
        )}
        {fields.map((field, idx) => {
          const isExpanded = expandedKey === field._key;
          return (
            <div key={field._key} className={isExpanded ? "bg-gray-50/80" : "bg-white"}>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button type="button" onClick={() => moveField(idx, -1)} disabled={idx === 0}
                    className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition">
                    <ChevronUp size={12} />
                  </button>
                  <button type="button" onClick={() => moveField(idx, 1)}
                    disabled={idx === fields.length - 1}
                    className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition">
                    <ChevronDown size={12} />
                  </button>
                </div>

                <input
                  value={field.label}
                  onChange={e => updateField(field._key, { label: e.target.value })}
                  placeholder="Nome do campo..."
                  className="flex-1 text-sm font-medium text-gray-800 bg-transparent
                    focus:outline-none placeholder-gray-400 min-w-0"
                />

                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium
                  border flex-shrink-0 hidden sm:block
                  ${TYPE_COLORS[field.fieldType] || ""}`}>
                  {FIELD_TYPES.find(t => t.value === field.fieldType)?.label || field.fieldType}
                </span>

                <label className="flex items-center gap-1 text-xs text-gray-500
                  cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={field.required}
                    onChange={e => updateField(field._key, { required: e.target.checked })}
                    className="w-3.5 h-3.5 rounded" />
                  <span className="hidden sm:block">Obrig.</span>
                </label>

                <button type="button"
                  onClick={() => setExpandedKey(isExpanded ? null : field._key)}
                  className={`p-1.5 rounded-lg transition flex-shrink-0
                    ${isExpanded
                      ? "bg-primary/10 text-primary"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    }`}>
                  <Settings2 size={13} />
                </button>

                <button type="button" onClick={() => removeField(field._key)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50
                    rounded-lg transition flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 pt-0.5 space-y-3 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tipo de campo
                      </label>
                      <select
                        value={field.fieldType}
                        onChange={e => updateField(field._key, { fieldType: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2
                          text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        {FIELD_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {field.fieldType === "NUMBER" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Unidade
                        </label>
                        <input
                          value={field.unit || ""}
                          onChange={e => updateField(field._key, { unit: e.target.value })}
                          placeholder="Ex: kg, min, repetições"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2
                            text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    )}
                  </div>

                  {field.fieldType === "CHECKBOX" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Opções
                        <span className="text-gray-400 font-normal ml-1">
                          (separadas por |)
                        </span>
                      </label>
                      <input
                        value={field.options || ""}
                        onChange={e => updateField(field._key, { options: e.target.value })}
                        placeholder="Opção A | Opção B | Opção C"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2
                          text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button type="button" onClick={addField}
        className="w-full mt-2 flex items-center justify-center gap-2 py-2.5
          border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400
          hover:border-primary hover:text-primary hover:bg-primary/5 transition
          font-medium">
        <Plus size={15} /> {addLabel}
      </button>
    </div>
  );
}

// ── Modal simples de seleção de atividade do banco pessoal ─────────────────────
function ActivityPickerModal({ isOpen, onClose, onSelect, activities, loading }) {
  const [search, setSearch] = useState("");

  useEffect(() => { if (!isOpen) setSearch(""); }, [isOpen]);

  if (!isOpen) return null;

  const filtered = activities.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center
      justify-center z-[60] p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col
        max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Adicionar atividade</h2>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100
              rounded-lg transition">
            <X size={17} />
          </button>
        </div>
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar atividade..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl
                text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-5 pt-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary
                rounded-full animate-spin" />
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-8">
              <Dumbbell size={30} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                {activities.length === 0
                  ? "Você ainda não tem atividades cadastradas."
                  : "Nenhuma atividade encontrada."}
              </p>
              {activities.length === 0 && (
                <a href="/atividades"
                  className="text-sm text-primary hover:underline font-medium mt-2 inline-block">
                  Cadastrar atividade
                </a>
              )}
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map(a => (
                <button key={a.id} onClick={() => onSelect(a)}
                  className="w-full flex items-center gap-3 p-3 border-2 border-gray-100
                    bg-gray-50 rounded-xl hover:border-primary hover:bg-primary/5
                    transition-all text-left">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center
                    justify-center flex-shrink-0">
                    <Dumbbell size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{a.name}</p>
                    {a.category && (
                      <p className="text-xs text-gray-400 truncate">{a.category}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────────────────
export default function RecordTemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [alert,   setAlert]   = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [generalFields, setGeneralFields] = useState([]);
  const [activityItems, setActivityItems] = useState([]);

  const [activities,        setActivities]        = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [pickerOpen,        setPickerOpen]        = useState(false);

  useEffect(() => {
    ActivityService.listar()
      .then(data => setActivities((Array.isArray(data) ? data : []).filter(a => a.active)))
      .catch(() => {})
      .finally(() => setLoadingActivities(false));
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    RecordTemplateService.buscarPorId(id).then(tmpl => {
      setName(tmpl.name || "");
      setDescription(tmpl.description || "");
      setGeneralFields((tmpl.generalFields || []).map(f => ({
        _key: newKey(), id: f.id, label: f.label, fieldType: f.fieldType,
        unit: f.unit || "", required: f.required, position: f.position,
        options: (f.options || []).join("|"),
      })));
      setActivityItems((tmpl.activityItems || []).map(item => ({
        _key: newKey(), id: item.id, activityId: item.activityId,
        activityName: item.activityName, label: item.label,
        fields: (item.fields || []).map(f => ({
          _key: newKey(), id: f.id, label: f.label, fieldType: f.fieldType,
          unit: f.unit || "", required: f.required, position: f.position,
          options: (f.options || []).join("|"),
        })),
      })));
    })
      .catch(() => setAlert({ type: "error", message: "Erro ao carregar modelo." }))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const availableActivities = activities.filter(
    a => !activityItems.some(it => it.activityId === a.id)
  );

  const addActivityItem = (activity) => {
    setActivityItems(prev => [...prev, {
      _key: newKey(), id: null, activityId: activity.id,
      activityName: activity.name, label: activity.name, fields: [],
    }]);
    setPickerOpen(false);
  };

  const removeActivityItem = (key) => {
    setActivityItems(prev => prev.filter(it => it._key !== key));
  };

  const updateActivityItem = (key, patch) => {
    setActivityItems(prev => prev.map(it => it._key === key ? { ...it, ...patch } : it));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setAlert({ type: "error", message: "Nome do modelo é obrigatório." });
      return;
    }
    if ([...generalFields, ...activityItems.flatMap(i => i.fields)].some(f => !f.label.trim())) {
      setAlert({ type: "error", message: "Todos os campos precisam de um nome." });
      return;
    }

    const payload = {
      name: name.trim(),
      description: description || null,
      generalFields: generalFields.map((f, i) => toFieldPayload(f, i + 1)),
      activityItems: activityItems.map((item, i) => ({
        id: item.id ?? null,
        activityId: item.activityId,
        label: item.label,
        position: i + 1,
        fields: item.fields.map((f, j) => toFieldPayload(f, j + 1)),
      })),
    };

    setSaving(true);
    try {
      if (isEditing) {
        await RecordTemplateService.atualizar(id, payload);
      } else {
        await RecordTemplateService.criar(payload);
      }
      navigate("/fichas/modelo");
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data || "Erro ao salvar modelo." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-gray-400 text-sm">Carregando...</div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500
            hover:text-gray-900 transition mb-6 font-medium">
          <ArrowLeft size={18} /> Voltar
        </button>

        {alert && (
          <div className="mb-4">
            <Alert type={alert.type} message={alert.message}
              onClose={() => setAlert(null)} duration={5000} />
          </div>
        )}

        {/* Informações gerais */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">
            {isEditing ? "Editar Modelo" : "Novo Modelo de Ficha"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do modelo *
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Sessão de Educação Física"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-primary/30
                  focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Breve descrição do modelo..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-primary/30
                  focus:border-primary transition"
              />
            </div>
          </div>
        </div>

        {/* Atividades */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm
          overflow-hidden mb-4">
          <div className="flex items-center justify-between px-6 py-4
            border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">
                Atividades ({activityItems.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Selecionadas do seu banco pessoal de atividades.
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {activityItems.length === 0 && (
              <p className="text-xs text-gray-400 italic px-6 py-4">
                Nenhuma atividade adicionada ainda.
              </p>
            )}
            {activityItems.map(item => (
              <div key={item._key} className="px-6 py-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center
                    justify-center flex-shrink-0">
                    <Dumbbell size={14} className="text-primary" />
                  </div>
                  <input
                    value={item.label}
                    onChange={e => updateActivityItem(item._key, { label: e.target.value })}
                    placeholder={item.activityName}
                    className="flex-1 text-sm font-semibold text-gray-800 bg-transparent
                      focus:outline-none min-w-0"
                  />
                  <button type="button" onClick={() => removeActivityItem(item._key)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50
                      rounded-lg transition flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
                <FieldListEditor
                  fields={item.fields}
                  onChange={fields => updateActivityItem(item._key, { fields })}
                  addLabel="Adicionar campo desta atividade"
                />
              </div>
            ))}
          </div>

          <div className="px-6 py-3 border-t border-gray-100">
            <button type="button" onClick={() => setPickerOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5
                border-2 border-dashed border-gray-200 rounded-xl text-sm
                text-gray-400 hover:border-primary hover:text-primary
                hover:bg-primary/5 transition font-medium">
              <Plus size={15} /> Adicionar atividade do banco
            </button>
          </div>
        </div>

        {/* Campos gerais */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">
            Campos gerais ({generalFields.length})
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Campos da sessão que não pertencem a uma atividade específica
            (ex: observações gerais, humor do paciente).
          </p>
          <FieldListEditor
            fields={generalFields}
            onChange={setGeneralFields}
            addLabel="Adicionar campo geral"
          />
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <button onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-200 rounded-full text-sm
              font-medium text-gray-600 hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-7 py-2.5 bg-primary text-white rounded-full text-sm
              font-semibold hover:bg-primary/90 transition disabled:opacity-50
              flex items-center gap-2">
            {saving && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white
                rounded-full animate-spin" />
            )}
            {saving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Modelo"}
          </button>
        </div>
      </div>

      <ActivityPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addActivityItem}
        activities={availableActivities}
        loading={loadingActivities}
      />
    </div>
  );
}
