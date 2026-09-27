import { useEffect, useState } from "react";
import { X } from "lucide-react";

const FORMAS_PAGAMENTO = [
  { value: "PIX", label: "Pix" },
  { value: "CARTAO", label: "Cartão" },
  { value: "BOLETO", label: "Boleto" },
  { value: "DINHEIRO", label: "Dinheiro" },
];

function DarBaixaModal({ isOpen, onClose, onConfirm, cobranca }) {
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!isOpen) {
      setFormaPagamento("PIX");
      setDataPagamento(new Date().toISOString().slice(0, 10));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ formaPagamento, dataPagamento });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Dar Baixa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-4">
            {cobranca && (
              <p className="text-sm text-gray-600">
                Confirmar pagamento de <strong>{cobranca.patientName}</strong> — R${" "}
                {(Number(cobranca.valor) - Number(cobranca.desconto || 0)).toFixed(2)}
                {cobranca.desconto ? (
                  <span className="text-gray-400">
                    {" "}
                    (R$ {Number(cobranca.valor).toFixed(2)} com R${" "}
                    {Number(cobranca.desconto).toFixed(2)} de desconto)
                  </span>
                ) : null}
              </p>
            )}

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Data do pagamento</label>
              <input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
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
              Confirmar pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DarBaixaModal;
