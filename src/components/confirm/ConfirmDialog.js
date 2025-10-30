import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Sim, excluir",
  cancelText = "Cancelar",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center flex flex-col items-center"
          >
            {/* Ícone de Alerta */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>

            {/* Mensagem */}
            <p className="text-gray-500 mb-8">{message}</p>

            {/* Botões de Ação */}
            <div className="flex w-full justify-center gap-4">
              <button
                onClick={onCancel}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors w-full"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                // -> Mudanças de cor aqui
                className="px-6 py-2.5 rounded-lg bg-[#3367B1] text-white font-medium shadow hover:bg-[#2b5999] transition-colors w-full"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;