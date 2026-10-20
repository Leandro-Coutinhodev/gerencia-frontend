import { useEffect, useState } from "react";
import AppointmentService from "../../../services/AppointmentService";
import DonutChart from "../../../components/donutchart/DonutChart";

// Status da ocorrência (FrequencyStatus do backend). Cores do donut validadas via
// skill dataviz: PRESENTE/JUSTIFICADO/AUSENTE usam a paleta de status (good/warning/
// critical, mesma da AD-016); AGENDADO e CANCELADO ainda não são julgamento, então
// ficam em cinzas neutros. Ordem fixa — nunca reordenar por contagem.
const STATUS_CONFIG = {
  AGENDADO: { label: "Agendado", color: "#6b7280", chip: "bg-gray-100 text-gray-700" },
  PRESENTE: { label: "Presente", color: "#0ca30c", chip: "bg-green-50 text-green-700" },
  JUSTIFICADO: { label: "Justificado", color: "#fab219", chip: "bg-amber-50 text-amber-700" },
  AUSENTE: { label: "Ausente", color: "#d03b3b", chip: "bg-red-50 text-red-700" },
  CANCELADO: { label: "Cancelado", color: "#a8a8a4", chip: "bg-gray-100 text-gray-400" },
};

// Data local (não UTC): toISOString() viraria o dia seguinte depois das 21h em BRT.
function hojeLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tallyPorStatus(ocorrencias) {
  const contagem = Object.fromEntries(Object.keys(STATUS_CONFIG).map((s) => [s, 0]));
  ocorrencias.forEach((o) => {
    if (contagem[o.status] !== undefined) contagem[o.status] += 1;
  });
  return Object.entries(contagem).map(([status, value]) => ({
    label: STATUS_CONFIG[status].label,
    value,
    color: STATUS_CONFIG[status].color,
  }));
}

function AgendamentoHojeCard() {
  const [ocorrencias, setOcorrencias] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const hoje = hojeLocal();
        const data = await AppointmentService.calendario({ startDate: hoje, endDate: hoje });
        if (ativo) setOcorrencias(Array.isArray(data) ? data : []);
      } catch (err) {
        if (ativo) setErro(true);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Agendamentos de Hoje</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : erro ? (
        <p className="text-sm text-red-600">Não foi possível carregar os agendamentos.</p>
      ) : ocorrencias.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum agendamento para hoje.</p>
      ) : (
        <>
          <ul className="space-y-2 mb-4">
            {ocorrencias.map((o) => {
              const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.AGENDADO;
              const cancelado = o.status === "CANCELADO";
              return (
                <li key={o.id} className="flex justify-between items-center text-sm border-t pt-2 first:border-t-0 first:pt-0">
                  <div className={cancelado ? "line-through text-gray-400" : ""}>
                    <span className={cancelado ? "" : "text-gray-700"}>{o.scheduledTime?.slice(0, 5)}</span>{" "}
                    <span className={cancelado ? "" : "text-gray-800 font-medium"}>{o.patientName}</span>
                    <span className="text-gray-400"> · {o.professionalName}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.chip}`}>{cfg.label}</span>
                </li>
              );
            })}
          </ul>
          <DonutChart ariaLabel="Status dos agendamentos de hoje" segments={tallyPorStatus(ocorrencias)} />
        </>
      )}
    </div>
  );
}

export default AgendamentoHojeCard;
