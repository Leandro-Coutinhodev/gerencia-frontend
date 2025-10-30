import { useEffect, useState } from "react";
import { FileText, Send, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnamnesisService from "../../../services/AnamnesisService";
import Alert from "../../../components/alert/Alert";
import ConfirmarEncaminhamentoModal from "../../../modal/confirmarencaminhamentomodal/ConfirmarEncaminhamentoModal";

export default function AnamnesisList2() {
  const navigate = useNavigate();

  const [anamneses, setAnamneses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedAnamnesis, setSelectedAnamnesis] = useState(null);
  const [encaminharModalOpen, setEncaminharModalOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchAnamneses = async () => {
    try {
      const data = await AnamnesisService.listar();
      setAnamneses(data);
      setFiltered(data);
    } catch (error) {
      console.error("Erro ao carregar anamneses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnamneses();
  }, []);

  useEffect(() => {
    if (!search) setFiltered(anamneses);
    else {
      const lower = search.toLowerCase();
      setFiltered(
        anamneses.filter((a) =>
          a.patientName?.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, anamneses]);

  const handleSelectFields = (anamnese) => {
    navigate(`/anamnese/selecionar/${anamnese.id}`);
  };

  const handleSendData = (anamnese) => {
    setSelectedAnamnesis(anamnese);
    setEncaminharModalOpen(true);
  };

  const handleEncaminharConfirm = async (payload) => {
    setSending(true);
    try {
      await AnamnesisService.encaminhar(payload);
      setAlert({ type: "success", message: "Anamnese encaminhada com sucesso!" });
      await fetchAnamneses();
      setEncaminharModalOpen(false);
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao encaminhar anamnese." });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Carregando anamneses...</p>;

  return (
    <div className="p-8 bg-[#f9fafc] min-h-screen">
      {alert && (
        <div className="flex justify-center mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <h2 className="text-[20px] font-semibold text-gray-800 mb-5">Lista de Anamnese</h2>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white p-1 rounded-lg shadow-sm flex">
          <button className="px-4 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700 shadow-sm">
            Anamneses cadastradas
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Histórico de encaminhamento
          </button>
        </div>

        <div className="relative w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar paciente"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600">
              <th className="py-3 px-4 text-left font-medium">Nome</th>
              <th className="py-3 px-4 text-left font-medium">Data da entrevista</th>
              <th className="py-3 px-4 text-left font-medium">Responsável</th>
              <th className="py-3 px-4 text-left font-medium">Telefone</th>
              <th className="py-3 px-4 text-left font-medium">Status</th>
              <th className="py-3 px-4 text-center font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">{a.patientName}</td>
                <td className="py-3 px-4">
                  {a.interviewDate
                    ? new Date(a.interviewDate).toLocaleDateString("pt-BR")
                    : "-"}
                </td>
                <td className="py-3 px-4">{a.guardianName || "-"}</td>
                <td className="py-3 px-4">{a.guardianPhone || "-"}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      a.status === "Encaminhado"
                        ? "bg-blue-100 text-blue-700"
                        : a.status === "Não Respondido"
                        ? "bg-red-100 text-red-700"
                        : a.status === "Análise"
                        ? "bg-amber-100 text-amber-700"
                        : a.status === "Pronto"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-3">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      title="Encaminhar anamnese"
                      onClick={() => handleSendData(a)}
                    >
                      <Send size={18} />
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      title="Selecionar campos"
                      onClick={() => navigate(`/paciente/encaminhar/${a.id}`)}
                    >
                      <FileText size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer da tabela */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Exibir</span>
            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span>1–10 de 100 itens</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Página</span>
            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm">
              <option>12</option>
            </select>
            <button className="text-gray-500 hover:text-gray-700">‹</button>
            <button className="text-gray-500 hover:text-gray-700">›</button>
          </div>
        </div>
      </div>

      <ConfirmarEncaminhamentoModal
        isOpen={encaminharModalOpen}
        anamnese={selectedAnamnesis}
        onClose={() => setEncaminharModalOpen(false)}
        onConfirm={handleEncaminharConfirm}
        sending={sending}
      />
    </div>
  );
}
