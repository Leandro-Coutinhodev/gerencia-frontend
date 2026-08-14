
import { useState, useEffect, useRef } from "react";
import { X, Search, User, Check, AlertCircle } from "lucide-react";
import SecretaryService from "../../services/SecretaryService";

export default function BuscarSecretariaModal({
  isOpen,
  onClose,
  onConfirm,
  maxSelect = Infinity,
  alreadySelected = [],
}) {
  const [searchTerm,   setSearchTerm]   = useState("");
  const [results,      setResults]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [selected,     setSelected]     = useState([]); // Secretary[]
  const [allSecretary, setAllSecretary] = useState([]); // cache completo
  const inputRef = useRef(null);

  // ── Inicialização ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelected([]);
      return;
    }
    // Pré-preenche seleção se já havia testemunhas
    setSelected(alreadySelected);
    loadAll();
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen]);

  // Fecha com Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await SecretaryService.getAll();
      const list = Array.isArray(data) ? data : [];
      setAllSecretary(list);
      setResults(list);
    } catch (err) {
      console.error("Erro ao carregar secretárias:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Filtro local em tempo real ────────────────────────────────────────────

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(allSecretary);
      return;
    }
    const q = searchTerm.toLowerCase();
    setResults(allSecretary.filter(s =>
      (s.name  || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.cpf   || "").replace(/\D/g, "").includes(q.replace(/\D/g, ""))
    ));
  }, [searchTerm, allSecretary]);

  // ── Seleção ───────────────────────────────────────────────────────────────

  const isSelected = (id) => selected.some(s => s.id === id);

  const toggle = (secretary) => {
    if (isSelected(secretary.id)) {
      setSelected(prev => prev.filter(s => s.id !== secretary.id));
    } else {
      if (selected.length >= maxSelect) return; // respeita limite
      setSelected(prev => [...prev, secretary]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  if (!isOpen) return null;

  const atLimit = selected.length >= maxSelect;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center
        justify-center z-[70] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col
        max-h-[85vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4
          border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Selecionar Testemunhas
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {maxSelect === Infinity
                ? "Selecione as secretárias que assinarão como testemunhas."
                : `Selecione até ${maxSelect} secretária${maxSelect !== 1 ? "s" : ""} como testemunha${maxSelect !== 1 ? "s" : ""}.`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100
              rounded-lg transition -mr-1 -mt-0.5"
          >
            <X size={17} />
          </button>
        </div>

        {/* Busca */}
        <div className="px-6 pt-4 pb-3">
          <div className="relative">
            <Search size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400
                pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar por nome, e-mail ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5
                text-sm focus:outline-none focus:ring-2 focus:ring-primary/30
                focus:border-primary transition placeholder-gray-400"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary
                  rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Aviso de limite atingido */}
          {atLimit && maxSelect !== Infinity && (
            <div className="flex items-center gap-2 mt-2 text-xs text-amber-600
              bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <AlertCircle size={13} className="flex-shrink-0" />
              Limite de {maxSelect} testemunha{maxSelect !== 1 ? "s" : ""} atingido.
            </div>
          )}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-[100px]">

          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10
              text-gray-400">
              <User size={32} strokeWidth={1.5} className="text-gray-300 mb-2" />
              <p className="text-sm">
                {searchTerm
                  ? "Nenhuma secretária encontrada."
                  : "Nenhuma secretária cadastrada."}
              </p>
            </div>
          )}

          {results.length > 0 && (
            <ul className="space-y-1.5">
              {results.map(secretary => {
                const sel      = isSelected(secretary.id);
                const disabled = !sel && atLimit;

                return (
                  <li
                    key={secretary.id}
                    onClick={() => !disabled && toggle(secretary)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2
                      transition-all
                      ${disabled
                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        : sel
                          ? "border-primary bg-primary/5 cursor-pointer"
                          : "border-transparent bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      }`}
                  >
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center
                      justify-center flex-shrink-0 text-sm font-bold
                      ${sel
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-500"
                      }`}>
                      {secretary.name?.charAt(0).toUpperCase() || "?"}
                    </div>

                    {/* Dados */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {secretary.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {secretary.email}
                        {secretary.cpf && (
                          <> · CPF: {secretary.cpf}</>
                        )}
                      </p>
                    </div>

                    {/* Checkbox visual */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center
                      justify-center flex-shrink-0 transition-colors
                      ${sel
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                      }`}>
                      {sel && <Check size={11} className="text-white" />}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4
          border-t border-gray-100 bg-gray-50/60">

          {/* Contagem */}
          <span className="text-xs text-gray-500">
            {selected.length > 0
              ? `${selected.length} selecionada${selected.length !== 1 ? "s" : ""}`
              : "Nenhuma selecionada"
            }
            {maxSelect !== Infinity && ` / ${maxSelect}`}
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-full text-sm
                font-medium text-gray-600 hover:bg-white transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition
                flex items-center gap-1.5
                ${selected.length > 0
                  ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              <Check size={14} />
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}