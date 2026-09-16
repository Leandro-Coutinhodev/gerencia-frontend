import { useNavigate } from "react-router-dom";

function ContratosPendentesCard({ data, loading, error }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Contratos Aguardando Assinatura</h3>
        {/* SPEC_DEVIATION: design previa link por contrato individual, mas o projeto
            não tem rota de detalhe de contrato (só a listagem em /contrato, sem
            filtro por query string) — vira um único "Ver todos" pra lista. */}
        <button onClick={() => navigate("/contrato")} className="text-xs text-primary hover:underline">
          Ver todos
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : error ? (
        <p className="text-sm text-red-600">Não foi possível carregar os contratos agora.</p>
      ) : data.aguardandoAssinaturaContagem === 0 ? (
        <p className="text-sm text-gray-500">Nenhum contrato aguardando assinatura.</p>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-800 mb-3">{data.aguardandoAssinaturaContagem}</p>
          <ul className="space-y-2">
            {data.recentes.map((c) => (
              <li key={c.id} className="flex justify-between text-sm border-t pt-2 first:border-t-0 first:pt-0">
                <span className="text-gray-700">{c.patientName}</span>
                <span className="text-gray-400">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString("pt-BR") : "-"}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default ContratosPendentesCard;
