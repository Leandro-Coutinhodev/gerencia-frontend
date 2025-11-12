import { useEffect, useState } from "react";
import { FileText, Send, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnamnesisService from "../../../services/AnamnesisService";
import Alert from "../../../components/alert/Alert";
import ConfirmarEncaminhamentoModal from "../../../modal/confirmarencaminhamentomodal/ConfirmarEncaminhamentoModal";

export default function AnamnesisList2() {
  const navigate = useNavigate();

  const [anamneses, setAnamneses] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedAnamnesis, setSelectedAnamnesis] = useState(null);
  const [encaminharModalOpen, setEncaminharModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("anamneses"); // 'anamneses' ou 'referrals'

  // Busca anamneses
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

  // Busca encaminhamentos
  const fetchReferrals = async () => {
    try {
      const data = await AnamnesisService.listarReferral();
      setReferrals(data);
    } catch (error) {
      console.error("Erro ao carregar encaminhamentos:", error);
    }
  };

  useEffect(() => {
    fetchAnamneses();
    fetchReferrals();
  }, []);

  useEffect(() => {
    const list = activeTab === "anamneses" ? anamneses : referrals;
    if (!search) setFiltered(list);
    else {
      const lower = search.toLowerCase();
      setFiltered(
        list.filter((item) => {
          if (activeTab === "anamneses")
            return item.patientName?.toLowerCase().includes(lower);
          return String(item.anamnesisId)?.includes(lower);
        })
      );
    }
  }, [search, anamneses, referrals, activeTab]);

  const handleSelectFields = (anamnese) => {
    navigate(`/paciente/selecionar/${anamnese.id}`);
  };

  const handleSendData = (anamnese) => {
    setSelectedAnamnesis(anamnese);
    setEncaminharModalOpen(true);
  };

  const handleEncaminharConfirm = async () => {
    setAlert({ type: "success", message: "Assistente vinculado com sucesso!" });
    setEncaminharModalOpen(false);
    await fetchAnamneses();
  };

  if (loading) return <p>Carregando dados...</p>;

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

      <h2 className="text-[20px] font-semibold text-gray-800 mb-5">
        {activeTab === "anamneses"
          ? "Lista de Anamnese"
          : "Histórico de Encaminhamento"}
      </h2>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white p-1 rounded-lg shadow-sm flex">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "anamneses"
                ? "bg-blue-50 text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("anamneses")}
          >
            Anamneses cadastradas
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "referrals"
                ? "bg-blue-50 text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("referrals")}
          >
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
            placeholder={
              activeTab === "anamneses"
                ? "Buscar paciente"
                : "Buscar encaminhamento"
            }
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
            <tr className="border-b bg-gray-50 text-gray-600 text-primary">
              {activeTab === "anamneses" ? (
                <>
                  <th className="py-3 px-4 text-left font-medium">Nome</th>
                  <th className="py-3 px-4 text-left font-medium">
                    Data da entrevista
                  </th>
                  <th className="py-3 px-4 text-left font-medium">Responsável</th>
                  <th className="py-3 px-4 text-left font-medium">Telefone</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-center font-medium">Ações</th>
                </>
              ) : (
                <>
                  <th className="py-3 px-4 text-left font-medium">Nome</th>
                  <th className="py-3 px-4 text-left font-medium">
                    Data do Encaminhamento
                  </th>
                  <th className="py-3 px-4 text-left font-medium">
                    Responsável
                  </th>
                  <th className="py-3 px-4 text-left font-medium">Assistente</th>
                  <th className="py-3 px-4 text-center font-medium">Ações</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) =>
              activeTab === "anamneses" ? (
                <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">{item.patientName}</td>
                  <td className="py-3 px-4">
                    {item.interviewDate
                      ? new Date(item.interviewDate).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="py-3 px-4">{item.guardianName || "-"}</td>
                  <td className="py-3 px-4">{item.guardianPhone || "-"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "Encaminhado"
                          ? "bg-blue-100 text-blue-700"
                          : item.status === "Não Respondido"
                          ? "bg-red-100 text-red-700"
                          : item.status === "Em Análise"
                          ? "bg-amber-100 text-amber-700"
                          : item.status === "Pronto"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-3">
                      <button
                        className={`${
                          item.status === "Pronto"
                            ? "text-blue-600 hover:text-blue-800"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        title={
                          item.status === "Pronto"
                            ? "Encaminhar anamnese"
                            : "Disponível apenas quando o status for 'Pronto'"
                        }
                        onClick={() =>
                          item.status === "Pronto" && handleSendData(item)
                        }
                        disabled={item.status !== "Pronto"}
                      >
                        <Send size={18} />
                      </button>

                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="Selecionar campos"
                        onClick={() => handleSelectFields(item)}
                      >
                        <FileText size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">{item.patientName}</td>
                  <td className="py-3 px-4">
                    {new Date(item.sentAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 px-4">{item.guardianName || "-"}</td>
                  <td className="py-3 px-4">{item.assistantName || "-"}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-3">
                          <button
                            className="text-primary hover:text-primary/70 transition"
                            title="Visualizar histórico"
                            onClick={() => navigate(`/paciente/encaminhar/historico/${item.patientId}`)}
                          >
                            <Eye size={18} />
                          </button>

                        </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
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
