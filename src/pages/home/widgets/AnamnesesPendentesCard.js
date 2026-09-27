import { useNavigate } from "react-router-dom";

function AnamnesesPendentesCard({ data, loading, error }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Anamneses Pendentes</h3>
        <button onClick={() => navigate("/relatorios")} className="text-xs text-primary hover:underline">
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
