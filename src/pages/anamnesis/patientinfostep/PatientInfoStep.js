import { useState, useEffect, useMemo, useCallback } from "react";

function PatientInfoStep({ data, onChange, onNext, isReadOnly = false }) {
  const diagnosesOptions = [
    "Sem diagnóstico",
    "Autismo",
    "TDAH",
    "Altas Habilidades",
    "Síndrome de Down",
    "Obesidade",
    "Apraxia da Fala",
    "Dispraxia",
    "Outro",
  ];

  const knownSet = useMemo(() => new Set(diagnosesOptions), []);

  const [counts, setCounts] = useState({
    medicationAndAllergies: (data?.medicationAndAllergies ?? "").length,
    indications: (data?.indications ?? "").length,
    objectives: (data?.objectives ?? "").length,
  });

  const [otherDiagnosis, setOtherDiagnosis] = useState(data?.otherDiagnosis ?? "");
  const [initialized, setInitialized] = useState(false);

  // Normaliza o campo diagnoses
  const getDiagnoses = useCallback(() => {
    const raw = data?.diagnoses ?? [];
    let arr = [];
    if (Array.isArray(raw)) arr = raw;
    else if (typeof raw === "string")
      arr = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return Array.from(
      new Set(arr.map((s) => (typeof s === "string" ? s.trim() : s)).filter(Boolean))
    );
  }, [data?.diagnoses]);

  // ✅ CORRIGIDO: Inicialização sem causar loop
  useEffect(() => {
    if (!initialized) {
      const diag = getDiagnoses();
      const custom = diag.find((d) => !knownSet.has(d) && d.trim() !== "");
      
      if (data?.otherDiagnosis) {
        setOtherDiagnosis(data.otherDiagnosis);
      } else if (custom) {
        setOtherDiagnosis(custom);
      }
      
      setInitialized(true);
    }
  }, [initialized, data?.otherDiagnosis, getDiagnoses, knownSet]);

  // Atualiza contadores quando dados mudam
  useEffect(() => {
    setCounts({
      medicationAndAllergies: (data?.medicationAndAllergies ?? "").length,
      indications: (data?.indications ?? "").length,
      objectives: (data?.objectives ?? "").length,
    });
  }, [data?.medicationAndAllergies, data?.indications, data?.objectives]);

  const handleTextareaChange = (field, value) => {
    if (!isReadOnly) {
      onChange(field, value);
      setCounts((prev) => ({ ...prev, [field]: (value ?? "").length }));
    }
  };

  const setDiagnosesSanitized = (arr) => {
    const cleaned = Array.from(
      new Set(arr.map((s) => (typeof s === "string" ? s.trim() : s)).filter(Boolean))
    );
    onChange("diagnoses", cleaned);
  };

  const handleDiagnosisChange = (opt, checked) => {
    if (isReadOnly) return;
    const current = getDiagnoses();
    const baseKnown = current.filter((d) => knownSet.has(d) && d !== "Outro");

    if (checked) {
      baseKnown.push(opt);
      if (opt === "Outro") {
        if (otherDiagnosis && otherDiagnosis.trim() !== "") {
          baseKnown.push(otherDiagnosis.trim());
        } else {
          baseKnown.push("Outro");
        }
      }
      setDiagnosesSanitized(baseKnown);
    } else {
      let updated = baseKnown.filter((d) => d !== opt);
      if (opt === "Outro") {
        updated = updated.filter((d) => knownSet.has(d));
        setOtherDiagnosis("");
        onChange("otherDiagnosis", "");
      }
      setDiagnosesSanitized(updated);
    }
  };

  const handleOtherInputChange = (value) => {
    if (isReadOnly) return;

    const current = getDiagnoses();
    const keptKnown = current.filter((d) => knownSet.has(d) && d !== "Outro");
    const hasOutroCheckbox = current.includes("Outro");
    const trimmed = (value ?? "").trim();

    if (trimmed.length > 0) {
      const updated = [...keptKnown, trimmed];
      setOtherDiagnosis(trimmed);
      onChange("otherDiagnosis", trimmed);
      setDiagnosesSanitized(updated);
    } else {
      setOtherDiagnosis("");
      onChange("otherDiagnosis", "");
      const updated = hasOutroCheckbox ? [...keptKnown, "Outro"] : [...keptKnown];
      setDiagnosesSanitized(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Linha: Paciente e Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Paciente*</label>
          <input
            type="text"
            value={data?.patientName ?? ""}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data da Entrevista*</label>
          <input
            type="date"
            value={data?.interviewDate ?? ""}
            onChange={(e) => !isReadOnly && onChange("interviewDate", e.target.value)}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            className={`w-full p-3 border border-gray-300 rounded-lg ${
              isReadOnly
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "focus:ring-2 focus:ring-primary focus:outline-none"
            }`}
          />
        </div>
      </div>

      {/* Diagnósticos */}
      <div>
        <label className="block text-sm font-medium mb-2">Selecione o diagnóstico do paciente*</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {diagnosesOptions.map((opt) => {
            const diag = getDiagnoses();
            const checked =
              diag.includes(opt) ||
              (opt === "Outro" && (diag.includes("Outro") || (otherDiagnosis && otherDiagnosis.trim() !== "")));
            return (
              <label key={opt} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => handleDiagnosisChange(opt, e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${
                    isReadOnly ? "cursor-not-allowed opacity-60" : ""
                  }`}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>

        {(getDiagnoses().includes("Outro") || (otherDiagnosis && otherDiagnosis.trim() !== "")) && (
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1 text-gray-700">Especifique o diagnóstico</label>
            <input
              type="text"
              value={otherDiagnosis}
              onChange={(e) => handleOtherInputChange(e.target.value)}
              readOnly={isReadOnly}
              disabled={isReadOnly}
              placeholder="Digite o diagnóstico"
              className={`w-full p-3 border border-gray-300 rounded-lg ${
                isReadOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "focus:ring-2 focus:ring-primary focus:outline-none"
              }`}
            />
          </div>
        )}
      </div>

      {/* Textareas */}
      {[
        ["medicationAndAllergies", "Medicação e Alergias"],
        ["indications", "Indicações"],
        ["objectives", "Por qual motivo nos procurou? (Objetivos)"],
      ].map(([field, label]) => (
        <div key={field}>
          <label className="block text-sm font-medium mb-1">{label}</label>
          <textarea
            value={data?.[field] ?? ""}
            onChange={(e) => handleTextareaChange(field, e.target.value)}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            className={`w-full p-3 border border-gray-300 rounded-lg ${
              isReadOnly
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "focus:ring-2 focus:ring-primary focus:outline-none"
            }`}
            rows={3}
            maxLength={1000}
            placeholder="Digite aqui..."
          />
          <div className="text-right text-xs text-gray-400">
            {(counts[field] ?? 0)}/1000
          </div>
        </div>
      ))}

      {!isReadOnly && (
        <div className="flex justify-end">
          <button onClick={onNext} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientInfoStep;