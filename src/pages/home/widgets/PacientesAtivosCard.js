import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

function PacientesAtivosCard({ data, loading, error }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 h-[236px] self-start">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Users size={17} className="text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Pacientes</h3>
        </div>
        <button onClick={() => navigate("/pacientes")} className="text-xs font-medium text-primary hover:underline shrink-0">
          Ver todos
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : error ? (
        <p className="text-sm text-red-600">Não foi possível carregar os pacientes agora.</p>
      ) : (
        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl font-bold tracking-tight text-gray-900">
            {data.ativosContagem}
          </span>
          <span className="text-sm text-gray-500">
            paciente{data.ativosContagem !== 1 ? "s" : ""} ativo{data.ativosContagem !== 1 ? "s" : ""}
            {" "}de {data.totalContagem}
          </span>
        </div>
      )}
    </div>
  );
}

export default PacientesAtivosCard;
