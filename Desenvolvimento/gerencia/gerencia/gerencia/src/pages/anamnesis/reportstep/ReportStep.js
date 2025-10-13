import { useState } from "react";
import { FileText, X } from "lucide-react";

function ReportStep({ data, onChange, onPrev, onSubmit, isReadOnly = false }) {
  const [file, setFile] = useState(data?.report || null);

  const handleFileChange = (e) => {
    if (isReadOnly) return;
    
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      onChange("report", uploadedFile);
    }
  };

  const handleRemoveFile = () => {
    if (isReadOnly) return;
    
    setFile(null);
    onChange("report", null);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-3">
        {isReadOnly ? "Laudo do paciente" : "Adicione o laudo do paciente"}
      </label>

      <div className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center mb-6 min-h-[250px] transition ${
        isReadOnly 
          ? "border-gray-300 bg-gray-50 opacity-60" 
          : "border-primary/30 bg-primary/5"
      }`}>
        {!file ? (
          <>
            <p className="text-gray-600 mb-2">
              {isReadOnly
                ? "Nenhum laudo anexado"
                : "Arraste e solte o arquivo do seu computador"}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Aceitamos arquivos em formato PDF
            </p>
            {!isReadOnly && (
              <label className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg cursor-pointer transition">
                Adicionar laudo
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl shadow-sm w-full max-w-md mb-4 border border-gray-100">
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
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {!isReadOnly && (
              <label className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg cursor-pointer transition">
                Alterar laudo
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </>
        )}
      </div>

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