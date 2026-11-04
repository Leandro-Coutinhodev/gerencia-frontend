import { useNavigate } from "react-router-dom";
import { Cake } from "lucide-react";
import { calcularIdadeQueFara, diasParaAniversario } from "../../../utils/birthdayUtils";

function AniversariantesCard({ data, loading, error }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 h-[236px] self-start overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Cake size={17} className="text-amber-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Aniversariantes do Mês</h3>
        </div>
        <button onClick={() => navigate("/aniversariantes")} className="text-xs font-medium text-primary hover:underline shrink-0">
          Ver todos
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : error ? (
        <p className="text-sm text-red-600">Não foi possível carregar os aniversariantes agora.</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum aniversariante este mês.</p>
      ) : (
        <ul className="space-y-2">
          {data.slice(0, 5).map((p) => (
            <li key={p.id} className="flex justify-between text-sm border-t pt-2 first:border-t-0 first:pt-0">
              <span className="text-gray-700">{p.name}</span>
              <span className="text-gray-400">
                {calcularIdadeQueFara(p.dateBirth)} anos · {diasParaAniversario(p.dateBirth)} dias
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AniversariantesCard;
