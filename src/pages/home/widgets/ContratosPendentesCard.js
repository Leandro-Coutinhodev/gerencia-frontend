import { useNavigate } from "react-router-dom";
import { FileCheck2 } from "lucide-react";

function ContratosPendentesCard({ data, loading, error }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 h-[236px] self-start overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <FileCheck2 size={17} className="text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Contratos Aguardando Assinatura</h3>
        </div>
        {/* SPEC_DEVIATION: design previa link por contrato individual, mas o projeto
            não tem rota de detalhe de contrato (só a listagem em /contrato, sem
            filtro por query string) — vira um único "Ver todos" pra lista. */}
        <button onClick={() => navigate("/contrato")} className="text-xs font-medium text-primary hover:underline shrink-0">
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
