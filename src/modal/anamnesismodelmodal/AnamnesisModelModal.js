import { useEffect, useState, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  Type,
  AlignLeft,
  Calendar,
  CheckSquare,
  Paperclip,
  AlertCircle,
} from "lucide-react";

// ─── Configuração dos tipos de campo ────────────────────────────────────────

const FIELD_TYPES = [
  {
    value: "TEXT",
    label: "Texto curto",
    icon: Type,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    barColor: "bg-blue-400",
  },
  {
    value: "TEXTAREA",
    label: "Texto longo",
    icon: AlignLeft,
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    barColor: "bg-purple-400",
  },
  {
    value: "DATE",
    label: "Data",
    icon: Calendar,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    barColor: "bg-yellow-400",
  },
  {
    value: "CHECKBOX",
    label: "Checkbox",
    icon: CheckSquare,
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
    barColor: "bg-green-400",
  },
  {
    value: "FILE",
    label: "Arquivo PDF",
    icon: Paperclip,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    barColor: "bg-red-400",
  },
];

const getFieldType = (value) =>
  FIELD_TYPES.find((t) => t.value === value) || FIELD_TYPES[0];

// ─── Gerador de ID local ─────────────────────────────────────────────────────

let _localId = 0;
const newLocalId = () => `local_${++_localId}`;

// ─── Campo vazio padrão ──────────────────────────────────────────────────────

const emptyField = () => ({
  _localId: newLocalId(),
  id: null,
  label: "",
  fieldType: "TEXT",
  required: false,
  placeholder: "",
  options: "",
  position: 0,
});

// ─── Subcomponente: Seletor de tipo ─────────────────────────────────────────

function FieldTypeSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = getFieldType(value);
  const Icon = current.icon;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium
          transition ${current.bg} ${current.border} ${current.color} hover:opacity-80`}
      >
        <Icon size={14} />
        {current.label}
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {FIELD_TYPES.map((type) => {
            const TIcon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  onChange(type.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm
                  hover:bg-gray-50 transition
                  ${value === type.value ? "font-semibold" : "text-gray-700"}`}
              >
                <span className={type.color}>
                  <TIcon size={15} />
                </span>
                {type.label}
                {value === type.value && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Subcomponente: Toggle switch ────────────────────────────────────────────

function Toggle({ value, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200
          ${value ? "bg-primary" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
            transition-transform duration-200
            ${value ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </label>
  );
}

// ─── Subcomponente: Card de campo ────────────────────────────────────────────

function FieldCard({
  field,
  index,
  total,
  onChange,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  isDraggingOver,
  hasLabelError,
  hasOptionsError,
}) {
  const type = getFieldType(field.fieldType);

  const checkboxOptions = field.options ? field.options.split("|") : [""];

  const handleOptionChange = (optIndex, val) => {
    const opts = field.options ? field.options.split("|") : [""];
    opts[optIndex] = val;
    onChange({ ...field, options: opts.join("|") });
  };

  const addOption = () => {
    const opts = field.options ? field.options.split("|") : [];
    onChange({ ...field, options: [...opts, ""].join("|") });
  };

  const removeOption = (optIndex) => {
    const opts = field.options ? field.options.split("|") : [];
    opts.splice(optIndex, 1);
    onChange({ ...field, options: opts.join("|") });
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDrop={() => onDrop(index)}
      className={`group relative bg-white border rounded-xl transition-all duration-150
        ${isDraggingOver
          ? "border-primary shadow-md scale-[1.01]"
          : hasLabelError || hasOptionsError
            ? "border-red-300"
            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
        }`}
    >
      {/* Barra lateral colorida por tipo */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${type.barColor}`}
      />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start gap-3">

          {/* Handle de drag */}
          <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-300
            group-hover:text-gray-400 transition-colors flex-shrink-0">
            <GripVertical size={18} />
          </div>

          {/* Número */}
          <span className="mt-1 text-xs font-bold text-gray-300 w-4 flex-shrink-0">
            {index + 1}
          </span>

          <div className="flex-1 space-y-3 min-w-0">

            {/* Label + Tipo */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Título do campo *"
                  value={field.label}
                  onChange={(e) => onChange({ ...field, label: e.target.value })}
                  className={`w-full text-sm font-medium bg-transparent border-b outline-none
                    py-1 placeholder-gray-300 text-gray-700 transition-colors
                    ${hasLabelError
                      ? "border-red-400 placeholder-red-300"
                      : "border-gray-200 focus:border-primary"
                    }`}
                />
                {hasLabelError && (
                  <p className="text-xs text-red-500 mt-0.5">Informe o título do campo.</p>
                )}
              </div>
              <FieldTypeSelector
                value={field.fieldType}
                onChange={(val) =>
                  onChange({ ...field, fieldType: val, options: "", placeholder: "" })
                }
              />
            </div>

            {/* Placeholder */}
            {["TEXT", "TEXTAREA", "DATE"].includes(field.fieldType) && (
              <input
                type="text"
                placeholder="Texto de exemplo (opcional)"
                value={field.placeholder}
                onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
                className="w-full text-sm bg-gray-50 border border-gray-100 rounded-lg
                  px-3 py-2 outline-none focus:border-primary focus:bg-white
                  transition placeholder-gray-300 text-gray-500"
              />
            )}

            {/* Preview visual por tipo */}
            {field.fieldType === "TEXT" && (
              <div className="h-8 bg-gray-50 border border-dashed border-gray-200 rounded-lg
                flex items-center px-3 text-xs text-gray-300 select-none">
                Resposta de texto curto
              </div>
            )}

            {field.fieldType === "TEXTAREA" && (
              <div className="h-16 bg-gray-50 border border-dashed border-gray-200 rounded-lg
                flex items-start px-3 py-2 text-xs text-gray-300 select-none">
                Resposta de texto longo...
              </div>
            )}

            {field.fieldType === "DATE" && (
              <div className="h-8 bg-gray-50 border border-dashed border-gray-200 rounded-lg
                flex items-center px-3 gap-2 text-xs text-gray-300 select-none">
                <Calendar size={12} />
                dd / mm / aaaa
              </div>
            )}

            {field.fieldType === "FILE" && (
              <div className="h-10 bg-red-50 border border-dashed border-red-200 rounded-lg
                flex items-center px-3 gap-2 text-xs text-red-300 select-none">
                <Paperclip size={12} />
                Upload de laudo em PDF
              </div>
            )}

            {/* Opções do Checkbox */}
            {field.fieldType === "CHECKBOX" && (
              <div className="space-y-2">
                {checkboxOptions.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-gray-300 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder={`Opção ${optIndex + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                      className="flex-1 text-sm bg-transparent border-b border-gray-200
                        focus:border-primary outline-none py-1 placeholder-gray-300
                        text-gray-700 transition-colors"
                    />
                    {checkboxOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(optIndex)}
                        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {hasOptionsError && (
                  <p className="text-xs text-red-500">Adicione ao menos uma opção.</p>
                )}

                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1 text-xs text-primary
                    hover:text-primary/80 transition-colors mt-1 font-medium"
                >
                  <Plus size={13} />
                  Adicionar opção
                </button>
              </div>
            )}

            {/* Rodapé: obrigatório + remover */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <Toggle
                value={field.required}
                onChange={(val) => onChange({ ...field, required: val })}
                label="Obrigatório"
              />

              <button
                type="button"
                onClick={onRemove}
                disabled={total === 1}
                className="flex items-center gap-1 text-xs text-gray-300
                  hover:text-red-400 transition-colors
                  disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} />
                Remover
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal principal ─────────────────────────────────────────────────────────

function AnamnesisModelModal({ isOpen, onClose, onSave, initialData }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([emptyField()]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [dragFromIndex, setDragFromIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // ── Inicialização ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setFields(
        initialData.fields?.length
          ? initialData.fields.map((f) => ({
              ...f,
              _localId: newLocalId(),
              options: Array.isArray(f.options)
                ? f.options.join("|")
                : f.options || "",
            }))
          : [emptyField()]
      );
    } else {
      setName("");
      setDescription("");
      setFields([emptyField()]);
    }

    setErrors({});
    setSaving(false);
  }, [isOpen, initialData]);

  // ── Validação ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    if (!name.trim()) errs.name = "O nome do modelo é obrigatório.";

    fields.forEach((f, i) => {
      if (!f.label.trim()) errs[`field_${i}_label`] = true;

      if (f.fieldType === "CHECKBOX") {
        const opts = f.options
          ? f.options.split("|").map((o) => o.trim()).filter(Boolean)
          : [];
        if (!opts.length) errs[`field_${i}_options`] = true;
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        fields: fields.map((f, index) => ({
          id: f.id || null,
          label: f.label.trim(),
          fieldType: f.fieldType,
          required: f.required,
          placeholder: f.placeholder?.trim() || null,
          options: f.fieldType === "CHECKBOX" ? f.options : null,
          position: index,
        })),
      };

      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  // ── Campos ────────────────────────────────────────────────────────────────
  const addField = () => {
    setFields((prev) => [...prev, emptyField()]);
  };

  const updateField = (index, updated) => {
    setFields((prev) => prev.map((f, i) => (i === index ? updated : f)));
    // Limpa erros do campo ao editar
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`field_${index}_label`];
      delete next[`field_${index}_options`];
      return next;
    });
  };

  const removeField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Drag and drop ─────────────────────────────────────────────────────────
  const handleDragStart = (index) => setDragFromIndex(index);
  const handleDragOver = (index) => setDragOverIndex(index);
  const handleDrop = (toIndex) => {
    if (dragFromIndex === null || dragFromIndex === toIndex) {
      setDragFromIndex(null);
      setDragOverIndex(null);
      return;
    }
    setFields((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragFromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDragFromIndex(null);
    setDragOverIndex(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">

        {/* ── Cabeçalho ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {initialData ? "Editar Modelo" : "Novo Modelo de Anamnese"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Defina os campos que o responsável deverá preencher
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition rounded-full p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Corpo scrollável ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Banner de erro */}
          {hasErrors && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">
                Corrija os campos destacados antes de salvar.
              </p>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do modelo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Anamnese Inicial TEA"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: undefined }));
              }}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition
                focus:border-primary
                ${errors.name
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gray-50 focus:bg-white"}`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              placeholder="Descreva o propósito deste formulário"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl
                px-4 py-2.5 text-sm outline-none focus:border-primary transition resize-none"
            />
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Campos do formulário
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Cards de campo */}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <FieldCard
                key={field._localId}
                field={field}
                index={index}
                total={fields.length}
                onChange={(updated) => updateField(index, updated)}
                onRemove={() => removeField(index)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDraggingOver={dragOverIndex === index && dragFromIndex !== index}
                hasLabelError={!!errors[`field_${index}_label`]}
                hasOptionsError={!!errors[`field_${index}_options`]}
              />
            ))}
          </div>

          {/* Botão adicionar campo */}
          <button
            type="button"
            onClick={addField}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed
              border-gray-200 rounded-xl text-sm text-gray-400 font-medium
              hover:border-primary hover:text-primary hover:bg-primary/5
              transition-all duration-150"
          >
            <Plus size={16} />
            Adicionar campo
          </button>
        </div>

        {/* ── Rodapé ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <span className="text-xs text-gray-400">
            {fields.length} campo{fields.length !== 1 ? "s" : ""} · arraste para reordenar
          </span>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-gray-200 text-sm text-gray-500
                hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 rounded-full bg-primary text-white text-sm font-medium
                hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white
                    rounded-full animate-spin" />
                  Salvando...
                </>
              ) : initialData ? (
                "Salvar alterações"
              ) : (
                "Criar modelo"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AnamnesisModelModal;