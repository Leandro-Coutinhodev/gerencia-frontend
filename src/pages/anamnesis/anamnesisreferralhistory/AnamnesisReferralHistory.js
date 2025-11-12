import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CalendarDays, ExternalLink } from "lucide-react";
import PatientsService from "../../../services/PatientsService";
import AnamnesisService from "../../../services/AnamnesisService";

export default function AnamnesisReferralHistory() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDisplayDate = (rawDate) => {
    if (!rawDate) return "—";
    const d = new Date(rawDate);
    return d instanceof Date && !isNaN(d.getTime()) ? d.toLocaleDateString("pt-BR") : "—";
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const paciente = await PatientsService.buscarPorId(patientId);
        setPatient(paciente);

        const historico = await AnamnesisService.listarHistorico(patientId);
        setReferrals(historico || []);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [patientId]);

  const groupedByDay = React.useMemo(() => {
    const map = {};
    referrals.forEach((r) => {
      const key = r.sentAt ? new Date(r.sentAt).toISOString().slice(0, 10) : "unknown";
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return Object.entries(map)
      .map(([day, items]) => ({ day, items }))
      .sort((x, y) => (x.day === "unknown" ? 1 : y.day.localeCompare(x.day)));
  }, [referrals]);

  if (loading) {
    return <p className="text-center text-gray-500">Carregando histórico...</p>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Histórico de Encaminhamento do Paciente</h1>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline text-sm">
          ← Voltar
        </button>
      </div>

      {/* Paciente Info */}
      {patient && (
        <div className="bg-white shadow rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-3">Informações do paciente</h2>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7">
              <label className="block text-sm text-gray-500 mb-1">Nome Completo</label>
              <input
                type="text"
                value={patient.name || ""}
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
                value={formatDisplayDate(patient.dateBirth)}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Histórico */}
      <div>
        <h2 className="font-semibold mb-3">Encaminhamentos Realizados</h2>

        {groupedByDay.length === 0 ? (
          <p className="text-gray-500">Nenhum encaminhamento encontrado.</p>
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
                  {group.items.map((r) => (
                    <div key={r.referralId} className="mb-8 relative">
                      {/* Ícone calendário */}
                      <span className="absolute -left-7 top-3 flex items-center justify-center w-7 h-7 bg-blue-500 rounded text-white shadow">
                        <CalendarDays size={14} />
                      </span>

                      {/* Card */}
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <h3 className="font-semibold text-gray-800 mb-3">Encaminhamento do paciente</h3>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-semibold">Assistente: </span>
                          {r.assistantName || "Não vinculado"}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Responsável: </span>
                          {r.professionalName || "Desconhecido"}
                        </p>

                        {/* Botão Visualizar */}
                        <div className="mt-4">
                          <button
                            onClick={() =>
                              navigate(`/encaminhamento/${r.referralId}`)
                            }
                            className="inline-flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all text-sm font-medium"
                          >
                            <ExternalLink size={16} />
                            Visualizar Encaminhamento
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
