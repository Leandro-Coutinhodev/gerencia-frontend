import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GuardiansService from "../../../services/GuardiansService";
import PatientsService from "../../../services/PatientsService";
import SecretaryService from "../../../services/SecretaryService";

export default function CreateContract() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("contratante");
  const [cpf, setCpf] = useState("");
  const [guardian, setGuardian] = useState(null);
  const [guardianSuggestions, setGuardianSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Estados para secretárias
  const [secretaries, setSecretaries] = useState([]);
  const [secretarySearch, setSecretarySearch] = useState({ 1: "", 2: "" });
  const [filteredSecretaries, setFilteredSecretaries] = useState({ 1: [], 2: [] });
  const [showSecretarySuggestions, setShowSecretarySuggestions] = useState({ 1: false, 2: false });
  const [loadingSecretaries, setLoadingSecretaries] = useState(false);

  const [witnesses, setWitnesses] = useState([
    { id: 1, secretaryId: null, name: "", cpf: "", email: "", selected: false },
    { id: 2, secretaryId: null, name: "", cpf: "", email: "", selected: false }
  ]);

  // Estados para o PDF
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  };

  // Carregar o PDF quando o componente for montado
  useEffect(() => {
    const loadPdf = async () => {
      try {
        // Substitua com o caminho correto do seu PDF
        const response = await fetch('/path/to/Contrato_prestac_a_o_servicos_LP_-_2024.pdf');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error("Erro ao carregar PDF:", error);
      }
    };

    loadPdf();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []);

  // Buscar secretárias ao montar o componente
  useEffect(() => {
    const fetchSecretaries = async () => {
      setLoadingSecretaries(true);
      try {
        const data = await SecretaryService.listar();
        setSecretaries(data || []);
      } catch (err) {
        console.error("Erro ao buscar secretárias:", err);
        setSecretaries([]);
      } finally {
        setLoadingSecretaries(false);
      }
    };

    fetchSecretaries();
  }, []);

  // Filtrar secretárias conforme busca
  useEffect(() => {
    [1, 2].forEach(witnessId => {
      const search = secretarySearch[witnessId];
      if (!search || search.trim() === "") {
        setFilteredSecretaries(prev => ({ ...prev, [witnessId]: [] }));
        setShowSecretarySuggestions(prev => ({ ...prev, [witnessId]: false }));
      } else {
        const filtered = secretaries.filter(sec => {
          const searchLower = search.toLowerCase();
          return (
            sec.name?.toLowerCase().includes(searchLower) ||
            sec.cpf?.replace(/\D/g, "").includes(search.replace(/\D/g, ""))
          );
        });
        setFilteredSecretaries(prev => ({ ...prev, [witnessId]: filtered }));
        setShowSecretarySuggestions(prev => ({ ...prev, [witnessId]: true }));
      }
    });
  }, [secretarySearch, secretaries]);

  const fetchGuardians = async (query) => {
    if (!query || query.length < 3) {
      setGuardianSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const data = await GuardiansService.listarPorCpf(query);
      setGuardianSuggestions(data || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Erro ao buscar responsáveis:", err);
      setGuardianSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async (guardianId) => {
    setLoadingPatients(true);
    try {
      const data = await PatientsService.buscarPorResponsavel(guardianId);
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (err) {
      console.error("Erro ao buscar pacientes:", err);
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (patientSearch.trim() === "" || selectedPatient) {
      setFilteredPatients(patients);
      setShowPatientSuggestions(false);
    } else {
      const filtered = patients.filter((patient) =>
        patient.name.toLowerCase().includes(patientSearch.toLowerCase())
      );
      setFilteredPatients(filtered);
      setShowPatientSuggestions(true);
    }
  }, [patientSearch, patients, selectedPatient]);

  const handleCpfChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
    setGuardian(null);
    setSelectedPatient(null);
    setPatients([]);
    setPatientSearch("");

    const cleanCpf = formatted.replace(/\D/g, "");
    fetchGuardians(cleanCpf);
  };

  const handleSelectGuardian = async (selectedGuardian) => {
    setGuardian(selectedGuardian);
    setCpf(formatCPF(selectedGuardian.cpf));
    setShowSuggestions(false);
    setGuardianSuggestions([]);
    setSelectedPatient(null);
    setPatientSearch("");

    await fetchPatients(selectedGuardian.id);
  };

  const handlePatientSearchChange = (e) => {
    setPatientSearch(e.target.value);
    setSelectedPatient(null);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.name);
    setShowPatientSuggestions(false);
  };

  const handleSecretarySearchChange = (witnessId, value) => {
    setSecretarySearch(prev => ({ ...prev, [witnessId]: value }));
  };

  const handleSelectSecretary = (witnessId, secretary) => {
    setWitnesses(prev => prev.map(w => 
      w.id === witnessId 
        ? { 
            id: w.id, 
            secretaryId: secretary.id,
            name: secretary.name, 
            cpf: secretary.cpf, 
            email: secretary.email, 
            selected: true 
          } 
        : w
    ));
    setSecretarySearch(prev => ({ ...prev, [witnessId]: secretary.name }));
    setShowSecretarySuggestions(prev => ({ ...prev, [witnessId]: false }));
  };

  const handleWitnessChange = (id, field, value) => {
    setWitnesses(prev => prev.map(w => 
      w.id === id ? { ...w, [field]: value, selected: true } : w
    ));
  };

  const handleRemoveWitness = (id) => {
    setWitnesses(prev => prev.map(w => 
      w.id === id ? { id, secretaryId: null, name: "", cpf: "", email: "", selected: false } : w
    ));
    setSecretarySearch(prev => ({ ...prev, [id]: "" }));
  };

  const handleSubmit = () => {
    if (!guardian) {
      alert("Selecione um responsável antes de continuar!");
      return;
    }
    if (!selectedPatient) {
      alert("Selecione um paciente antes de continuar!");
      return;
    }
    
    // Aqui você faria a chamada à API para criar o contrato
    console.log("Criar contrato com:", { guardian, patient: selectedPatient, witnesses });
    
    // Redirecionar para lista com modal de sucesso
    navigate("/contratos");
  };

  const handleCancel = () => {
    navigate("/contratos");
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(2.0, prev + 0.1));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.1));
  };

  return (
    <div className="p-4 sm:p-8 bg-[#f9fafc] min-h-screen">
      <div className="text-sm text-gray-500 mb-4">
        Página Inicial <span className="mx-1">{">"}</span> Contrato <span className="mx-1">{">"}</span> Criar Contrato
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Criar Contrato</h2>
          <button 
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-[#3D75C4] transition font-medium"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b overflow-x-auto">
          <div className="flex px-6 min-w-max">
            <button
              onClick={() => setActiveTab("contratante")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "contratante"
                  ? "border-[#3D75C4] text-[#3D75C4]"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Contratante
            </button>
            <button
              onClick={() => setActiveTab("testemunhas")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "testemunhas"
                  ? "border-[#3D75C4] text-[#3D75C4]"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Testemunhas
            </button>
            <button
              onClick={() => setActiveTab("assinatura")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "assinatura"
                  ? "border-[#3D75C4] text-[#3D75C4]"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Assinatura
            </button>
          </div>
        </div>

        {/* Content - Contratante */}
        {activeTab === "contratante" && (
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-6">
              Informe os dados do(a) <span className="font-medium">contratante</span>
            </p>

            {/* Campo de busca CPF */}
            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adicione contratante*
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="Digite número do CPF do responsável"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D75C4] focus:border-transparent outline-none"
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-[#3D75C4] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Sugestões de Responsáveis */}
              {showSuggestions && guardianSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 w-full rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                  {guardianSuggestions.map((g) => (
                    <li
                      key={g.id}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-b-0"
                      onClick={() => handleSelectGuardian(g)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{g.name}</span>
                        <span className="text-sm text-gray-600">CPF: {formatCPF(g.cpf)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {showSuggestions && guardianSuggestions.length === 0 && !loading && cpf.length >= 11 && (
                <div className="absolute z-10 bg-white border border-gray-300 w-full rounded-lg shadow-lg mt-1 p-3">
                  <p className="text-sm text-gray-600">Nenhum responsável encontrado com este CPF</p>
                </div>
              )}
            </div>

            {/* Dados do Contratante */}
            {guardian && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Selecionado
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                      <input
                        type="text"
                        value={guardian.name || ""}
                        readOnly
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                      <input
                        type="text"
                        value={formatCPF(guardian.cpf || "")}
                        readOnly
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                      <input
                        type="email"
                        value={guardian.email || ""}
                        readOnly
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    {/* Busca de Paciente */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Paciente*</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={patientSearch}
                          onChange={handlePatientSearchChange}
                          placeholder="Digite o nome do paciente"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D75C4] focus:border-transparent outline-none"
                        />
                        {loadingPatients && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-[#3D75C4] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>

                      {showPatientSuggestions && filteredPatients.length > 0 && (
                        <ul className="absolute z-10 bg-white border border-gray-300 w-full rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                          {filteredPatients.map((patient) => (
                            <li
                              key={patient.id}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-b-0"
                              onClick={() => handleSelectPatient(patient)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-800">{patient.name}</span>
                                <span className="text-sm text-gray-600">CPF: {formatCPF(patient.cpf)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {patients.length === 0 && !loadingPatients && (
                        <p className="text-xs text-gray-500 mt-1">
                          Nenhum paciente vinculado a este responsável
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content - Testemunhas */}
        {activeTab === "testemunhas" && (
          <div className="p-6">
            <p className="text-sm text-gray-700 mb-6">Selecione as testemunhas</p>

            {witnesses.map((witness) => (
              <div key={witness.id} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Testemunha {witness.id}*
                </label>
                
                {!witness.selected ? (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Digitar nome ou CPF da Secretária"
                      value={secretarySearch[witness.id]}
                      onChange={(e) => handleSecretarySearchChange(witness.id, e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D75C4] focus:border-transparent outline-none"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    
                    {/* Sugestões de Secretárias */}
                    {showSecretarySuggestions[witness.id] && filteredSecretaries[witness.id]?.length > 0 && (
                      <ul className="absolute z-10 bg-white border border-gray-300 w-full rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                        {filteredSecretaries[witness.id].map((sec) => (
                          <li
                            key={sec.id}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-b-0"
                            onClick={() => handleSelectSecretary(witness.id, sec)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">{sec.name}</span>
                              <span className="text-sm text-gray-600">CPF: {formatCPF(sec.cpf)}</span>
                              {sec.email && (
                                <span className="text-xs text-gray-500">{sec.email}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {showSecretarySuggestions[witness.id] && 
                     filteredSecretaries[witness.id]?.length === 0 && 
                     secretarySearch[witness.id] && (
                      <div className="absolute z-10 bg-white border border-gray-300 w-full rounded-lg shadow-lg mt-1 p-3">
                        <p className="text-sm text-gray-600">Nenhuma secretária encontrada</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">Testemunha {witness.id}</span>
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Selecionado
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRemoveWitness(witness.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Remover
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input
                          type="text"
                          value={witness.name}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                          <input
                            type="text"
                            value={formatCPF(witness.cpf)}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                          <input
                            type="email"
                            value={witness.email}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loadingSecretaries && (
              <div className="text-center py-4">
                <div className="inline-block w-6 h-6 border-2 border-[#3D75C4] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600 mt-2">Carregando secretárias...</p>
              </div>
            )}
          </div>
        )}

        {/* Content - Assinatura */}
        {activeTab === "assinatura" && (
          <div className="p-6">
            <p className="text-sm text-gray-700 mb-6">Encaminhe o contrato para assinatura</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PDF do Contrato */}
              <div>
                <h3 className="text-base font-semibold text-[#3D75C4] mb-4">PDF do Contrato</h3>
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                  {/* Controles do PDF */}
                  <div className="flex items-center justify-center gap-4 px-4 py-2 bg-gray-100 border-b">
                    <button 
                      onClick={goToPrevPage} 
                      disabled={pageNumber <= 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium">
                      {pageNumber} / {numPages || '-'}
                    </span>
                    <button 
                      onClick={goToNextPage}
                      disabled={pageNumber >= numPages}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <span className="mx-2">|</span>
                    <button onClick={zoomOut} className="p-1 hover:bg-gray-200 rounded">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                      </svg>
                    </button>
                    <span className="text-sm">{Math.round(scale * 100)}%</span>
                    <button onClick={zoomIn} className="p-1 hover:bg-gray-200 rounded">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                  </div>

                  {/* Visualização do PDF */}
                  <div className="aspect-[8.5/11] bg-gray-100 overflow-auto flex items-center justify-center">
                    {pdfUrl ? (
                      <iframe
                        src={`${pdfUrl}#page=${pageNumber}&zoom=${scale * 100}`}
                        className="w-full h-full border-0"
                        title="Visualização do Contrato"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <div className="w-12 h-12 border-4 border-[#3D75C4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando contrato...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações dos participantes */}
              <div>
                <h3 className="text-base font-semibold text-[#3D75C4] mb-4">
                  Informações dos participantes do contrato
                </h3>

                <div className="space-y-3">
                  {/* Contratante */}
                  {guardian && (
                    <details className="border border-gray-200 rounded-lg overflow-hidden" open>
                      <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-800 hover:bg-gray-100 transition flex items-center justify-between">
                        <span>{guardian.name} (Contratante)</span>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="p-4 bg-white space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">CPF</p>
                          <p className="text-sm text-gray-800">{formatCPF(guardian.cpf)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Qualificação</p>
                          <p className="text-sm text-gray-800">{guardian.qualification || "Pessoa Física"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Endereço</p>
                          <p className="text-sm text-gray-800">{guardian.addressLine1 || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">E-mail</p>
                          <p className="text-sm text-gray-800">{guardian.email || "-"}</p>
                        </div>
                        {selectedPatient && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Nome do Paciente</p>
                            <p className="text-sm text-gray-800">{selectedPatient.name}</p>
                          </div>
                        )}
                      </div>
                    </details>
                  )}

                  {/* LP Kids (Contratada) - Empresa */}
                  <details className="border border-gray-200 rounded-lg overflow-hidden">
                    <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-800 hover:bg-gray-100 transition flex items-center justify-between">
                      <span>LP Kids (Contratada)</span>
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="p-4 bg-white space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Razão Social</p>
                        <p className="text-sm text-gray-800">LUANA PEREIRA DOS SANTOS LIMA</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Nome Fantasia</p>
                        <p className="text-sm text-gray-800">LP Kids</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">CNPJ</p>
                        <p className="text-sm text-gray-800">46.210.211/0001-60</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Endereço</p>
                        <p className="text-sm text-gray-800">Rua Dr. Francisco das Chagas Ribeiro, 38</p>
                        <p className="text-sm text-gray-600">Bairro Mineiro Segundo - Cametá/PA</p>
                        <p className="text-sm text-gray-600">CEP: 68.400-000</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Descrição</p>
                        <p className="text-sm text-gray-800">
                          Centro de Educação Inclusiva e Reabilitação Cognitiva e Psicomotora
                        </p>
                      </div>
                    </div>
                  </details>

                  {/* Testemunha 1 */}
                  {witnesses[0].selected && (
                    <details className="border border-gray-200 rounded-lg overflow-hidden">
                      <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-800 hover:bg-gray-100 transition flex items-center justify-between">
                        <span>{witnesses[0].name} (Testemunha 1)</span>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="p-4 bg-white space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">CPF</p>
                          <p className="text-sm text-gray-800">{formatCPF(witnesses[0].cpf)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">E-mail</p>
                          <p className="text-sm text-gray-800">{witnesses[0].email || "-"}</p>
                        </div>
                      </div>
                    </details>
                  )}

                  {/* Testemunha 2 */}
                  {witnesses[1].selected && (
                    <details className="border border-gray-200 rounded-lg overflow-hidden">
                      <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-800 hover:bg-gray-100 transition flex items-center justify-between">
                        <span>{witnesses[1].name} (Testemunha 2)</span>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="p-4 bg-white space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">CPF</p>
                          <p className="text-sm text-gray-800">{formatCPF(witnesses[1].cpf)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">E-mail</p>
                          <p className="text-sm text-gray-800">{witnesses[1].email || "-"}</p>
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !guardian || 
              !selectedPatient || 
              (activeTab === "assinatura" && (!witnesses[0].selected || !witnesses[1].selected))
            }
            className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
              guardian && selectedPatient && (activeTab !== "assinatura" || (witnesses[0].selected && witnesses[1].selected))
                ? "bg-[#3D75C4] hover:bg-[#2d5ea3] shadow-sm"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {activeTab === "assinatura" ? "Encaminhar para assinatura" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}