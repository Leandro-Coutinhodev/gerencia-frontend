import { useEffect, useState } from "react";
import { Cake, Search, PartyPopper } from "lucide-react";
import PatientsService from "../../services/PatientsService";
import { parseDateParts, calcularIdadeQueFara, diasParaAniversario } from "../../utils/birthdayUtils";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function AniversariantesDoMes() {
  const [pacientes, setPacientes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const mesAtual = new Date().getMonth() + 1;

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const data = await PatientsService.getBirthdayThisMonth();
      // já vem ordenado por dia no backend, mas garante no front também
      const ordenado = [...data].sort((a, b) => {
        const da = parseDateParts(a.dateBirth)?.day ?? 0;
        const db = parseDateParts(b.dateBirth)?.day ?? 0;
        return da - db;
      });
      setPacientes(ordenado);
      setFiltered(ordenado);
    } catch (error) {
      console.error("Erro ao carregar aniversariantes:", error);
      setPacientes([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(pacientes);
      return;
    }
    const lower = search.toLowerCase();
    setFiltered(pacientes.filter((p) => p.name?.toLowerCase().includes(lower)));
  }, [search, pacientes]);

  const renderBadge = (dateBirth) => {
    const dias = diasParaAniversario(dateBirth);
    if (dias === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <PartyPopper size={12} /> Hoje!
        </span>
      );
    }
    if (dias !== null && dias <= 7) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          Em {dias} dia{dias !== 1 ? "s" : ""}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Em {dias} dias
      </span>
    );
  };

  if (loading) return <p className="p-4 sm:p-8">Carregando aniversariantes...</p>;

  return (
    <div className="p-4 sm:p-8 bg-[#f9fafc] min-h-screen">
      <div className="flex items-center gap-2 mb-1">
        <Cake className="text-[#3D75C4]" size={22} />
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Aniversariantes de {MESES[mesAtual - 1]}
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} fazem aniversário este mês
      </p>

      <div className="relative w-full sm:w-80 mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar paciente"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600">
                <th className="py-3 px-4 text-left font-medium">Nome</th>
                <th className="py-3 px-4 text-left font-medium">Data de Nascimento</th>
                <th className="py-3 px-4 text-left font-medium">Fará</th>
                <th className="py-3 px-4 text-left font-medium">Responsável</th>
                <th className="py-3 px-4 text-left font-medium">Aniversário</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const parts = parseDateParts(p.dateBirth);
                  return (
                    <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                      <td className="py-3 px-4">
                        {parts ? `${String(parts.day).padStart(2, "0")}/${String(parts.month).padStart(2, "0")}` : "-"}
                      </td>
                      <td className="py-3 px-4">{calcularIdadeQueFara(p.dateBirth)} anos</td>
                      <td className="py-3 px-4">{p.guardian?.name || "-"}</td>
                      <td className="py-3 px-4">{renderBadge(p.dateBirth)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Nenhum aniversariante encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}