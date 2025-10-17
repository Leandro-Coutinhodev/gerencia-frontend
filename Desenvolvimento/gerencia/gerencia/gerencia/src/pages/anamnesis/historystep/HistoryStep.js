import { useState, useEffect } from "react";

function HistoryStep({ data, onChange, onPrev, onNext, isReadOnly = false }) {
  const fields = [
    ["developmentHistory", "Gestação - Diagnóstico - Processo de Desenvolvimento - Dias Atuais"],
    ["preferences", "Preferências do aluno (a)"],
    ["interferingBehaviors", "O que gera comportamentos interferentes? Qual o Plano de Conduta?"],
    ["qualityOfLife", "Tem algo que comprometa a qualidade de vida do aluno? E da família?"],
    ["feeding", "Como é a Alimentação? (Seletividade - Compulsividade - Acompanhamento Nutricional)"],
    ["sleep", "Como é a rotina do Sono? Agitação - Contínuo"],
    ["therapists", "Equipe de Terapeutas:"],
  ];

  // Estado local para contar caracteres de cada textarea
  const [counts, setCounts] = useState({});

  useEffect(() => {
    // Inicializa contagens com base nos dados atuais
    const initialCounts = {};
    fields.forEach(([field]) => {
      initialCounts[field] = (data?.[field] ?? "").length;
    });
    setCounts(initialCounts);
  }, [data]);

  const handleTextareaChange = (field, value) => {
    if (!isReadOnly) {
      onChange(field, value);
      setCounts((prev) => ({ ...prev, [field]: (value ?? "").length }));
    }
  };

  return (
    <div>
      {fields.map(([field, label]) => (
        <div key={field} className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
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
        <div className="flex justify-between mt-6">
          <button
            onClick={onPrev}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Voltar
          </button>
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

export default HistoryStep;
