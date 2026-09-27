import { useEffect, useState } from "react";
import { X } from "lucide-react";
import BuscarPacienteModal from "../buscarpacientemodal/BuscarPacienteModal";

const FORMAS_PAGAMENTO = [
  { value: "PIX", label: "Pix" },
  { value: "CARTAO", label: "Cartão" },
  { value: "BOLETO", label: "Boleto" },
  { value: "DINHEIRO", label: "Dinheiro" },
];

function CadastroCobrancaModal({ isOpen, onClose, onSave, initialData }) {
  const isEditing = Boolean(initialData);
  const [paciente, setPaciente] = useState(null);
  const [buscarPacienteOpen, setBuscarPacienteOpen] = useState(false);
  const [valor, setValor] = useState("");
  const [desconto, setDesconto] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [vencimento, setVencimento] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setPaciente(null);
      setValor("");
      setDesconto("");
      setFormaPagamento("PIX");
      setVencimento("");
      setError("");
      return;
    }
    if (initialData) {
      setPaciente({ id: initialData.patientId, name: initialData.patientName });
      setValor(String(initialData.valor ?? ""));
      setDesconto(initialData.desconto != null ? String(initialData.desconto) : "");
      setFormaPagamento(initialData.formaPagamento || "PIX");
      setVencimento(
        initialData.vencimento ? new Date(initialData.vencimento).toISOString().split("T")[0] : ""
      );
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paciente) {
      setError("Selecione um paciente.");
      return;
    }
    if (!(Number(valor) > 0)) {
      setError("Informe um valor maior que zero.");
      return;
    }
    setError("");
    onSave({
      patientId: paciente.id,
      valor: Number(valor),
      desconto: desconto ? Number(desconto) : null,
      formaPagamento,
      vencimento,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? "Editar Cobrança" : "Nova Cobrança"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente <span className="text-red-500">*</span>
              </label>
              {paciente ? (
                <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
                  <span>{paciente.name}</span>
                  <button
                    type="button"
                    onClick={() => setBuscarPacienteOpen(true)}
                    className="text-primary hover:underline"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setBuscarPacienteOpen(true)}
                  className="w-full border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50"
                >
                  Selecionar paciente
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Desconto (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={desconto}
                  onChange={(e) => setDesconto(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forma de pagamento</label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {FORMAS_PAGAMENTO.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vencimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-white font-medium transition-colors shadow-sm bg-[#3D75C4] hover:bg-[#2d5ea3]"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>

      <BuscarPacienteModal
        isOpen={buscarPacienteOpen}
        onClose={() => setBuscarPacienteOpen(false)}
        onSelectPaciente={(p) => {
          setPaciente(p);
          setBuscarPacienteOpen(false);
        }}
      />
    </div>
  );
}

export default CadastroCobrancaModal;
