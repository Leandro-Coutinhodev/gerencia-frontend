// src/pages/anamnesis/anamnesishistory/AnamnesisHistory.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClipboardList, Copy as CopyIcon, ExternalLink } from "lucide-react";
import AnamnesisService from "../../../services/AnamnesisService";
import PatientsService from "../../../services/PatientsService";

// --- Helper Component for the right-hand panel ---
// Este componente renderiza a barra lateral de detalhes da anamnese quando um item é selecionado.
function AnamnesisDetailPanel({ patient }) {
  const formatDisplayDate = (rawDate) => {
    if (!rawDate) return "—";
    const d = new Date(rawDate);
    return d instanceof Date && !isNaN(d.getTime()) ? d.toLocaleDateString("pt-BR") : "—";
  };

  const diagnosticOptions = [
    "Sem diagnóstico", "Autismo", "TDAH", "Altas Habilidades",
    "Síndrome de Down", "Obesidade"
  ];

  return (
    <div className="bg-white shadow rounded-xl p-4 sticky top-6">
      <h2 className="text-lg font-semibold mb-4">Visualizar Anamnese</h2>

      {/* Patient Info */}
      <div className="border-b pb-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-3">Informações do paciente</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500">Nome Completo</label>
            <p className="font-medium">{patient?.name || "Não informado"}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Busque o nome do paciente</label>
            <input
              type="text"
              readOnly
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100 text-sm"
              value={patient?.name || ""}
            />
          </div>
        </div>
      </div>

      {/* Diagnoses */}
      <div className="border-b pb-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-3">Selecione o diagnóstico do paciente</h3>
        <div className="space-y-2">
          {diagnosticOptions.map((option) => (
            <div key={option} className="flex items-center">
              <input
                id={option}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor={option} className="ml-2 block text-sm text-gray-900">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Medications and Allergies */}
      <div className="border-b pb-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-2">Medicações e Alergias</h3>
        <textarea
          rows={3}
          placeholder="Digite a resposta"
          className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm"
        />
      </div>

      {/* Indications */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Indicações</h3>
        <textarea
          rows={3}
          placeholder="Digite a resposta"
          className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm"
        />
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function AnamnesisHistory() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [anamneses, setAnamneses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedAnamnesis, setSelectedAnamnesis] = useState(null); // Estado para a anamnese selecionada

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d.getTime());
  }

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const paciente = await PatientsService.buscarPorId(patientId);
        setPatient(paciente);

        const anamnesesPaciente = await AnamnesisService.listarPorPaciente(patientId);
        setAnamneses(anamnesesPaciente || []);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [patientId]);

  const getDateFromAnamnese = (a) => {
    const candidates = [
      a.interviewDate, a.interview_date, a.createdAt, a.created_at,
      a.sentAt, a.sent_at, a.date, a.data_envio,
    ];
    for (const c of candidates) {
      if (!c) continue;
      const d = new Date(c);
      if (isValidDate(d)) return d;
    }
    return null;
  };

  const formatDisplayDate = (rawDate) => {
    if (!rawDate) return "—";
    const d = new Date(rawDate);
    return isValidDate(d) ? d.toLocaleDateString("pt-BR") : "—";
  };

  const groupedByDay = React.useMemo(() => {
    const map = {};
    anamneses.forEach((a) => {
      const d = getDateFromAnamnese(a);
      const key = d ? d.toISOString().slice(0, 10) : "unknown";
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return Object.entries(map)
      .map(([day, items]) => ({ day, items }))
      .sort((x, y) => (x.day === "unknown" ? 1 : y.day.localeCompare(x.day)));
  }, [anamneses]);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      alert("Não foi possível copiar o link.");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Carregando histórico...</p>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Histórico de Anamnese</h1>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline text-sm">
          ← Voltar
        </button>
      </div>

      {patient && (
        <div className="bg-white shadow rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-3">Informações do paciente</h2>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7">
              <label className="block text-sm text-gray-500 mb-1">Nome Completo</label>
              <input
                type="text"
                value={patient.name || patient.nome || ""}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>
            <div className="col-span-6 md:col-span-3">
              <label className="block text-sm text-gray-500 mb-1">CPF</label>
              <input
                type="text"
                value={patient.cpf || ""}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>
            <div className="col-span-6 md:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Data de Nascimento</label>
              <input
                type="text"
                value={formatDisplayDate(patient.dateBirth || patient.date_birth) || ""}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content area with two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold mb-3">Anamneses Realizadas</h2>

          {groupedByDay.length === 0 ? (
            <p className="text-gray-500">Nenhuma anamnese encontrada.</p>
          ) : (
            groupedByDay.map((group) => {
              const dayLabel =
                group.day === "unknown"
                  ? "Sem data"
                  : new Date(group.day).toLocaleDateString("pt-BR");

              return (
                <div key={group.day} className="mb-10">
                  {/* Data */}
                  <div className="mb-4 flex items-center gap-2">
                    <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                      {dayLabel}
                    </span>
                  </div>

                  {/* Linha do tempo */}
                  <div className="relative ml-5 pl-6 border-l-4 border-grey-400">
                    {group.items.map((a) => {
                      const dateForDisplay = getDateFromAnamnese(a);
                      const link =
                        a.link ||
                        a.formUrl ||
                        a.url ||
                        (a.token
                          ? `${window.location.origin}/form-anamnese/${a.token}`
                          : "");

                      return (
                        <div key={a.id} className="mb-8 relative">
                          {/* Bolinha azul da linha do tempo */}
                          <span className="absolute -left-7 top-3 flex items-center justify-center w-7 h-7 bg-blue-500 rounded text-white shadow"> <ClipboardList size={14} /> </span>

                          {/* Card da anamnese */}
                          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-gray-800">Anamnese</h3>
                              <span
                                className={`px-3 py-1 text-xs rounded-full font-medium ${a.status === "Encaminhada"
                                  ? "bg-blue-100 text-blue-700"
                                  : a.status === "Respondido"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                  }`}
                              >
                                {a.status || "—"}
                              </span>
                            </div>

                            <p className="text-sm text-gray-500">
                              {a.status === "Respondido"
                                ? "Data de resposta:"
                                : "Data de envio:"}{" "}
                              <span className="font-medium text-gray-700">
                                {dateForDisplay
                                  ? dateForDisplay.toLocaleDateString("pt-BR")
                                  : "—"}
                              </span>
                            </p>

                            {/* Link */}
                            {/* Link */}
                            <div className="mt-4">
                              <label className="block text-sm text-gray-500 mb-1">
                                Link do formulário de anamnese
                              </label>
                              <div className="flex items-center gap-3">
                                <div className="flex-grow">
                                  <input
                                    type="text"
                                    readOnly
                                    disabled={a.status === "Respondido"}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm ${a.status === "Respondido"
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-50 text-gray-700"
                                      }`}
                                    value={link || ""}
                                  />
                                </div>
                                <button
                                  onClick={() => copyToClipboard(link, a.id)}
                                  disabled={a.status === "Respondido"}
                                  className={`flex items-center gap-1 text-sm ${a.status === "Respondido"
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-primary hover:text-blue-700"
                                    }`}
                                >
                                  <CopyIcon size={16} />
                                  {a.status === "Respondido"
                                    ? "Indisponível"
                                    : copiedId === a.id
                                      ? "Copiado!"
                                      : ""}
                                </button>
                              </div>
                            </div>


                            {/* Botão de visualizar */}
                            <div className="mt-5">
                              <button
                                onClick={() => navigate(`/anamnese/${a.id}`)}
                                className="inline-flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all text-sm font-medium"
                              >
                                <ExternalLink size={16} />
                                Visualizar Anamnese
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>


        {/* Right Column: Details Panel */}
        <div className="lg:col-span-1">
          {selectedAnamnesis && <AnamnesisDetailPanel patient={patient} anamnesis={selectedAnamnesis} />}
        </div>
      </div>
    </div>
  );
}