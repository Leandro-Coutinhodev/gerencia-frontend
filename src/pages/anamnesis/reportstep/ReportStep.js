import { useState, useEffect } from "react";
import { FileText, X } from "lucide-react";

function ReportStep({ data, onChange, onPrev, onSubmit, isReadOnly = false }) {
  const [files, setFiles] = useState([]);

  // Carrega arquivos previamente setados (caso retorne algo do backend no futuro)
  useEffect(() => {
    if (Array.isArray(data?.report)) {
      setFiles(data.report);
    }
  }, [data]);

  const handleFileChange = (e) => {
    if (isReadOnly) return;
    const uploaded = Array.from(e.target.files);
    const updated = [...files, ...uploaded];
    setFiles(updated);
    onChange("report", updated);
  };

  const handleRemoveFile = (index) => {
    if (isReadOnly) return;
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onChange("report", updated);
  };

  const anamnesisId = data?.id || data?.anamneseId;

  const openReport = () => {
    if (!anamnesisId) return;
    const url = `http://72.62.12.212:8080/api-gateway/gerencia/anamnesis/${anamnesisId}/report`;
    window.open(url, "_blank");
  };

  // Função para formatar data
  const formatDate = (raw) => {
    if (!raw) return "00/00/0000";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "00/00/0000";
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-3">
        {isReadOnly ? "Laudos cadastrados" : "Adicione os laudos do paciente"}
      </label>

      {/* --- MODO VISUALIZAÇÃO --- */}
      {isReadOnly ? (
        <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="font-semibold text-gray-800">Laudos cadastrados</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(data?.interviewDate || data?.createdAt)}
            </p>
          </div>

          <button
            onClick={openReport}
            className="flex items-center gap-3 bg-transparent hover:bg-gray-100 px-3 py-2 rounded-lg transition"
          >
            <span className="flex items-center justify-center w-8 h-6 rounded-md bg-gray-800 text-white text-xs font-semibold shadow-sm">
              PDF
            </span>
            <span className="text-sm text-gray-700 font-medium">Visualizar</span>
          </button>

        </div>
      ) : (
        /* --- MODO EDIÇÃO (original) --- */
        <div
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center mb-6 min-h-[250px] transition ${isReadOnly
              ? "border-gray-300 bg-gray-50 opacity-60"
              : "border-primary/30 bg-primary/5"
            }`}
        >
          {files.length === 0 ? (
            <>
              <p className="text-gray-600 mb-2">
                {isReadOnly
                  ? "Nenhum laudo anexado"
                  : "Arraste e solte os arquivos do seu computador"}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Aceitamos arquivos em formato PDF
              </p>
              {!isReadOnly && (
                <label className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg cursor-pointer transition">
                  Adicionar laudos
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </>
          ) : (
            <>
              <div className="w-full max-w-md space-y-3 mb-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="text-primary" size={24} />
                      <div className="text-left">
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-400">
                          {(file.size / 1024).toFixed(0)} kb
                        </p>
                      </div>
                    </div>
                    {!isReadOnly && (
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!isReadOnly && (
                <label className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg cursor-pointer transition">
                  Adicionar mais laudos
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </>
          )}
        </div>
      )}

      {!isReadOnly && (
        <div className="flex justify-between">
          <button
            onClick={onPrev}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Voltar
          </button>
          <button
            onClick={onSubmit}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}

export default ReportStep;
