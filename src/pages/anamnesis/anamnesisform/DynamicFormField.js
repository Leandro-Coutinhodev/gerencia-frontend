// src/pages/anamnesis/anamnesisform/DynamicFormField.jsx
import { useRef } from "react";
import { FileText, X, Upload } from "lucide-react";

/**
 * Renderiza um campo dinamicamente baseado no fieldType.
 *
 * Props:
 *  field        { id, label, fieldType, required, placeholder, options: string[] }
 *  value        string | null   — TEXT, TEXTAREA, DATE, CHECKBOX
 *  files        File[]          — FILE (selecionados localmente; pode ser mais de um,
 *                                  serão mesclados em um único PDF ao salvar)
 *  hasFile      bool            — FILE já salvo no backend
 *  fileName     string | null   — nome do arquivo salvo
 *  onChange     (fieldId, value) => void
 *  onFileChange (fieldId, File[]) => void
 *  onViewFile   (fieldId) => void   — abre o arquivo já salvo (opcional)
 *  isReadOnly   bool
 *  error        string | null
 */
function DynamicFormField({
  field,
  value,
  files,
  hasFile,
  fileName,
  onChange,
  onFileChange,
  onViewFile,
  isReadOnly = false,
  error,
}) {
  const fileInputRef = useRef(null);
  const selectedFiles = files ?? [];

  const baseInput = `w-full p-3 border rounded-lg text-sm transition
    ${isReadOnly
      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
      : error
        ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 focus:outline-none"
        : "border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
    }`;

  // ── TEXT ──────────────────────────────────────────────────────────────────
  if (field.fieldType === "TEXT") {
    return (
      <Wrapper field={field} error={error}>
        <input
          type="text"
          value={value ?? ""}
          placeholder={isReadOnly ? "-" : (field.placeholder || "Digite aqui...")}
          readOnly={isReadOnly}
          disabled={isReadOnly}
          onChange={(e) => !isReadOnly && onChange(field.id, e.target.value)}
          className={baseInput}
        />
      </Wrapper>
    );
  }

  // ── TEXTAREA ──────────────────────────────────────────────────────────────
  if (field.fieldType === "TEXTAREA") {
    return (
      <Wrapper field={field} error={error}>
        <textarea
          value={value ?? ""}
          placeholder={isReadOnly ? "-" : (field.placeholder || "Digite aqui...")}
          readOnly={isReadOnly}
          disabled={isReadOnly}
          onChange={(e) => !isReadOnly && onChange(field.id, e.target.value)}
          rows={4}
          maxLength={2000}
          className={`${baseInput} resize-none`}
        />
        {!isReadOnly && (
          <p className="text-right text-xs text-gray-400 mt-1">
            {(value ?? "").length}/2000
          </p>
        )}
      </Wrapper>
    );
  }

  // ── DATE ──────────────────────────────────────────────────────────────────
  if (field.fieldType === "DATE") {
    return (
      <Wrapper field={field} error={error}>
        <input
          type="date"
          value={value ?? ""}
          readOnly={isReadOnly}
          disabled={isReadOnly}
          onChange={(e) => !isReadOnly && onChange(field.id, e.target.value)}
          className={baseInput}
        />
      </Wrapper>
    );
  }

  // ── CHECKBOX ──────────────────────────────────────────────────────────────
  if (field.fieldType === "CHECKBOX") {
    const selected = value ? value.split("|").map((v) => v.trim()).filter(Boolean) : [];
    const options = Array.isArray(field.options) ? field.options : [];

    const toggle = (opt) => {
      if (isReadOnly) return;
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt];
      onChange(field.id, next.join("|"));
    };

    return (
      <Wrapper field={field} error={error} hideErrorLine>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <label
                key={opt}
                className={`flex items-center gap-2 text-sm select-none
                  ${isReadOnly ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              >
                <div
                  onClick={() => toggle(opt)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center
                    flex-shrink-0 transition-colors
                    ${checked ? "bg-primary border-primary" : "bg-white border-gray-300"}
                    ${isReadOnly ? "pointer-events-none" : "hover:border-primary cursor-pointer"}`}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">{opt}</span>
              </label>
            );
          })}
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </Wrapper>
    );
  }

  // ── FILE ──────────────────────────────────────────────────────────────────
  if (field.fieldType === "FILE") {
    return (
      <Wrapper field={field} error={error}>
        {/* Arquivo salvo no backend (sem novos arquivos selecionados) */}
        {hasFile && selectedFiles.length === 0 && (
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200
            rounded-xl px-4 py-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-5 rounded bg-gray-800
                text-white text-xs font-bold">
                PDF
              </span>
              <span className="text-sm text-gray-700">{fileName || "arquivo.pdf"}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {onViewFile && (
                <button type="button" onClick={() => onViewFile(field.id)}
                  className="text-xs font-medium text-primary hover:underline">
                  Visualizar
                </button>
              )}
              <span className="text-xs font-medium text-green-600">Salvo</span>
            </div>
          </div>
        )}

        {/* Arquivos selecionados localmente — mais de um será mesclado em um único PDF */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2 mb-2">
            {selectedFiles.map((f, idx) => (
              <div key={`${f.name}-${idx}`}
                className="flex items-center justify-between bg-primary/5 border border-primary/20
                  rounded-xl px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={16} className="text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                    <p className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                {!isReadOnly && (
                  <button type="button"
                    onClick={() => onFileChange(field.id, selectedFiles.filter((_, i) => i !== idx))}
                    className="text-gray-400 hover:text-red-500 transition flex-shrink-0">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            {selectedFiles.length > 1 && (
              <p className="text-xs text-gray-400">
                Estes {selectedFiles.length} arquivos serão mesclados em um único PDF ao salvar.
              </p>
            )}
          </div>
        )}

        {/* Botão de seleção — permite escolher mais de um PDF de uma vez */}
        {!isReadOnly && (
          <>
            <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files || []);
                if (picked.length > 0) onFileChange(field.id, [...selectedFiles, ...picked]);
                e.target.value = "";
              }}
            />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3
                rounded-xl border-2 border-dashed text-sm transition
                ${error
                  ? "border-red-300 text-red-400 hover:bg-red-50"
                  : "border-gray-200 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5"
                }`}
            >
              <Upload size={15} />
              {selectedFiles.length > 0
                ? "Adicionar mais PDFs"
                : hasFile ? "Substituir arquivo(s) PDF" : "Selecionar arquivo(s) PDF"}
            </button>
          </>
        )}

        {/* Leitura sem arquivo */}
        {isReadOnly && !hasFile && selectedFiles.length === 0 && (
          <p className="text-sm text-gray-400 italic">Nenhum arquivo anexado.</p>
        )}
      </Wrapper>
    );
  }

  return null;
}

// ── Wrapper: label + asterisco + conteúdo + erro ──────────────────────────────

function Wrapper({ field, error, hideErrorLine = false, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {!hideErrorLine && error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

export default DynamicFormField;