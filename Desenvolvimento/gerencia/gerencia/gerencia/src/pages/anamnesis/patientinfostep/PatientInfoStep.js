import { useState, useEffect } from "react";

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

  const [counts, setCounts] = useState({
    medicationAndAllergies: (data?.medicationAndAllergies ?? "").length,
    indications: (data?.indications ?? "").length,
    objectives: (data?.objectives ?? "").length,
  });

  const [otherDiagnosis, setOtherDiagnosis] = useState(data?.otherDiagnosis ?? "");

  const getDiagnoses = () => {
    const raw = data?.diagnoses ?? [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  useEffect(() => {
    if (data?.interviewDate) {
      onChange("interviewDate", data.interviewDate.substring(0, 10));
    }
  }, [data?.interviewDate, onChange]);

  const handleTextareaChange = (field, value) => {
    onChange(field, value);
    setCounts((prev) => ({ ...prev, [field]: (value ?? "").length }));
  };

  const handleDiagnosisChange = (opt, checked) => {
    const current = getDiagnoses();
    let updated = [...current];

    if (checked) {
      if (!updated.includes(opt)) updated.push(opt);
    } else {
      updated = updated.filter((d) => d !== opt);
      if (opt === "Outro") {
        updated = updated.filter((d) => d !== otherDiagnosis);
        setOtherDiagnosis("");
        onChange("otherDiagnosis", "");
      }
    }
    onChange("diagnoses", updated);
  };

  const handleOtherInputChange = (value) => {
    const current = getDiagnoses();
    const hasOutroCheckbox = current.includes("Outro");
    let updated = [...current].filter((d) => d !== otherDiagnosis && d !== "Outro");

    if (value && value.trim() !== "") {
      updated.push(value.trim());
      setOtherDiagnosis(value);
      onChange("otherDiagnosis", value);
    } else if (hasOutroCheckbox) {
      updated.push("Outro");
    }

    onChange("diagnoses", updated);
  };

  return (
    <div className="space-y-6">
      {/* Linha: Paciente e Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nome do Paciente*
          </label>
          <input
            type="text"
            value={data?.patientName ?? ""}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Data da Entrevista*
          </label>
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
        <label className="block text-sm font-medium mb-2">
          Selecione o diagnóstico do paciente*
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {diagnosesOptions.map((opt) => {
            const diag = getDiagnoses();
            const checked =
              diag.includes(opt) ||
              (opt === "Outro" &&
                diag.includes(otherDiagnosis) &&
                !diag.includes("Outro"));
            return (
              <label key={opt} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    !isReadOnly && handleDiagnosisChange(opt, e.target.checked)
                  }
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

        {(getDiagnoses().includes("Outro") ||
          (otherDiagnosis && otherDiagnosis.trim() !== "")) && (
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Especifique o diagnóstico
            </label>
            <input
              type="text"
              value={otherDiagnosis}
              onChange={(e) => !isReadOnly && handleOtherInputChange(e.target.value)}
              readOnly={isReadOnly}
              disabled={isReadOnly}
              placeholder="Digite o diagnóstico"
              className={`w-full p-3 border border-gray-300 rounded-lg ${
                isReadOnly
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-primary focus:outline-none"
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
            onChange={(e) => !isReadOnly && handleTextareaChange(field, e.target.value)}
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
          <button
            onClick={onNext}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientInfoStep;
