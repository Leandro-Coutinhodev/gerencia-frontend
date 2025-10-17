import { useState, useEffect, useMemo } from "react";

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

  // otherDiagnosis contém apenas o texto custom (sem ser "Outro")
  const [otherDiagnosis, setOtherDiagnosis] = useState(data?.otherDiagnosis ?? "");

  // Normaliza o campo diagnoses (string "A, B" ou array) -> array limpa, sem duplicatas
  const getDiagnoses = () => {
    const raw = data?.diagnoses ?? [];
    let arr = [];
    if (Array.isArray(raw)) arr = raw;
    else if (typeof raw === "string")
      arr = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    // normaliza: trim, remove vazios e duplicates
    return Array.from(
      new Set(arr.map((s) => (typeof s === "string" ? s.trim() : s)).filter(Boolean))
    );
  };

  // Se backend trouxe um custom em otherDiagnosis, usa ele; senão tenta extrair de diagnoses
  useEffect(() => {
    // extrair quaisquer valores custom presentes em diagnoses
    const diag = getDiagnoses();
    const custom = diag.find((d) => !knownSet.has(d) && d.trim() !== "");
    if (data?.otherDiagnosis) {
      setOtherDiagnosis(data.otherDiagnosis);
    } else if (custom) {
      setOtherDiagnosis(custom);
      // garante que o formData contenha esse valor como diagnosis (se já não tiver)
      const filtered = diag.filter((d) => d !== "Outro" && d !== custom);
      onChange("diagnoses", [...filtered, custom]);
      onChange("otherDiagnosis", custom);
    } else {
      // se somente 'Outro' estiver presente, mantemos otherDiagnosis vazio (visualiza como Outro)
      setOtherDiagnosis("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // só na montagem

  useEffect(() => {
    setCounts({
      medicationAndAllergies: (data?.medicationAndAllergies ?? "").length,
      indications: (data?.indications ?? "").length,
      objectives: (data?.objectives ?? "").length,
    });
  }, [data?.medicationAndAllergies, data?.indications, data?.objectives]);

  useEffect(() => {
    if (data?.interviewDate) {
      onChange("interviewDate", data.interviewDate.substring(0, 10));
    }
  }, [data?.interviewDate, onChange]);

  const handleTextareaChange = (field, value) => {
    if (!isReadOnly) {
      onChange(field, value);
      setCounts((prev) => ({ ...prev, [field]: (value ?? "").length }));
    }
  };

  const setDiagnosesSanitized = (arr) => {
    // trim, remove vazios, dedupe, manter ordem
    const cleaned = Array.from(
      new Set(arr.map((s) => (typeof s === "string" ? s.trim() : s)).filter(Boolean))
    );
    onChange("diagnoses", cleaned);
  };

  const handleDiagnosisChange = (opt, checked) => {
    if (isReadOnly) return;
    const current = getDiagnoses();

    // start from a clean base: keep only known options (except custom ones)
    const baseKnown = current.filter((d) => knownSet.has(d) && d !== "Outro");

    if (checked) {
      // adicionar opção conhecida
      baseKnown.push(opt);
      // se marcar outro e já existia otherDiagnosis preenchido, adiciona o texto em vez de 'Outro'
      if (opt === "Outro") {
        if (otherDiagnosis && otherDiagnosis.trim() !== "") {
          baseKnown.push(otherDiagnosis.trim());
        } else {
          baseKnown.push("Outro");
        }
      }
      setDiagnosesSanitized(baseKnown);
    } else {
      // desmarcar: remove opt e qualquer custom associado
      let updated = baseKnown.filter((d) => d !== opt);
      if (opt === "Outro") {
        // remove qualquer valor custom (qualquer string que não seja knownSet)
        updated = updated.filter((d) => knownSet.has(d));
        setOtherDiagnosis("");
        onChange("otherDiagnosis", "");
      }
      setDiagnosesSanitized(updated);
    }
  };

  const handleOtherInputChange = (value) => {
    if (isReadOnly) return;

    // pega diagnósticos atuais e remove qualquer valor custom pré-existente (tudo que não for knownSet)
    const current = getDiagnoses();
    const keptKnown = current.filter((d) => knownSet.has(d) && d !== "Outro");
    const hasOutroCheckbox = current.includes("Outro");

    const trimmed = (value ?? "").trim();

    if (trimmed.length > 0) {
      // adiciona o valor atual (custom)
      const updated = [...keptKnown, trimmed];
      setOtherDiagnosis(trimmed);
      onChange("otherDiagnosis", trimmed);
      setDiagnosesSanitized(updated);
    } else {
      // se o campo foi limpo, re-insere 'Outro' se a checkbox estiver marcada, caso contrário remove custom
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

        {/* mostramos o campo se houver 'Outro' ou se já existir otherDiagnosis */}
        { (getDiagnoses().includes("Outro") || (otherDiagnosis && otherDiagnosis.trim() !== "")) && (
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
