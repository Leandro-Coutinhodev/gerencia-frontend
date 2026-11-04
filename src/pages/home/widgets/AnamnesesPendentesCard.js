import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";

function AnamnesesPendentesCard({ data, loading, error }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 h-[236px] self-start overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <ClipboardList size={17} className="text-purple-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Anamneses Pendentes</h3>
        </div>
        <button onClick={() => navigate("/relatorios")} className="text-xs font-medium text-primary hover:underline shrink-0">
          Ver todos
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : error ? (
        <p className="text-sm text-red-600">Não foi possível carregar as anamneses agora.</p>
      ) : data.pendentesContagem === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma anamnese pendente de resposta.</p>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-800 mb-3">{data.pendentesContagem}</p>
          <ul className="space-y-2">
            {data.recentes.map((r) => (
              <li key={r.id} className="flex justify-between text-sm border-t pt-2 first:border-t-0 first:pt-0">
                <span className="text-gray-700">{r.patientName}</span>
                <span className="text-gray-400">
                  {r.sentAt ? new Date(r.sentAt).toLocaleDateString("pt-BR") : "-"}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default AnamnesesPendentesCard;
