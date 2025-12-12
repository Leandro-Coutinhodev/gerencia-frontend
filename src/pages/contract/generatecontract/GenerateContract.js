import React, { useState, useEffect } from "react";
import GuardiansService from "../../../services/GuardiansService";
import PatientsService from "../../../services/PatientsService";

export default function GenerateContract() {
  const [activeTab, setActiveTab] = useState("contratante");
  const [cpf, setCpf] = useState("");
  const [guardian, setGuardian] = useState(null);
  const [guardianSuggestions, setGuardianSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para busca de paciente
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Estados para testemunhas
  const [witnesses, setWitnesses] = useState([
    { id: 1, name: "", cpf: "", email: "", selected: false },
    { id: 2, name: "", cpf: "", email: "", selected: false }
  ]);

  // Formatar CPF enquanto digita
  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  };

  // Buscar responsáveis conforme digita
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

  // Buscar pacientes do responsável selecionado
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

  // Filtrar pacientes por nome conforme digita
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

  // Handlers para testemunhas
  const handleWitnessChange = (id, field, value) => {
    setWitnesses(prev => prev.map(w => 
      w.id === id ? { ...w, [field]: value } : w
    ));
  };

  const handleRemoveWitness = (id) => {
    setWitnesses(prev => prev.map(w => 
      w.id === id ? { id, name: "", cpf: "", email: "", selected: false } : w
    ));
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
    console.log("Criar contrato com:", { guardian, patient: selectedPatient, witnesses });
  };

  const handleCancel = () => {
    setCpf("");
    setGuardian(null);
    setGuardianSuggestions([]);
    setShowSuggestions(false);
    setPatients([]);
    setPatientSearch("");
    setSelectedPatient(null);
    setFilteredPatients([]);
    setWitnesses([
      { id: 1, name: "", cpf: "", email: "", selected: false },
      { id: 2, name: "", cpf: "", email: "", selected: false }
    ]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header da página */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-800">Criar Contrato</h2>
        <button className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex px-6">
          <button
            onClick={() => setActiveTab("contratante")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "contratante"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Contratante
          </button>
          <button
            onClick={() => setActiveTab("testemunhas")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "testemunhas"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Testemunhas
          </button>
          <button
            onClick={() => setActiveTab("assinatura")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "assinatura"
                ? "border-blue-600 text-blue-600"
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
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">
              Informe os dados do(a) <span className="font-medium">contratante</span>
            </p>
          </div>

          {/* Campo de busca CPF com autocomplete */}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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

          {/* Formulário do Contratante */}
          {guardian && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Selecionado
                </div>
                {guardian.active === false && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Inativo
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={guardian.name || ""}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualificação</label>
                    <input
                      type="text"
                      value={guardian.qualification || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                    <input
                      type="text"
                      value={guardian.addressLine1 || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                    <input
                      type="text"
                      value={formatCPF(guardian.cpf || "")}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  {/* Campo de busca de Paciente */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Paciente*</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={patientSearch}
                        onChange={handlePatientSearchChange}
                        placeholder="Digite o nome do paciente"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                      />
                      {loadingPatients && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
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

                    {showPatientSuggestions && filteredPatients.length === 0 && patientSearch && (
                      <div className="absolute z-10 bg-white border border-gray-300 w-full rounded-lg shadow-lg mt-1 p-3">
                        <p className="text-sm text-gray-600">Nenhum paciente encontrado</p>
                      </div>
                    )}

                    {patients.length === 0 && !loadingPatients && (
                      <p className="text-xs text-gray-500 mt-1">
                        Nenhum paciente vinculado a este responsável
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <input
                      type="email"
                      value={guardian.email || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
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
          <div className="mb-6">
            <p className="text-sm text-gray-700">Selecione as testemunhas</p>
          </div>

          {witnesses.map((witness, index) => (
            <div key={witness.id} className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Testemunha {witness.id}*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Digitar nome ou CPF da Secretária"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {witness.name && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">Testemunha {witness.id}</span>
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Selecionado
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveWitness(witness.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Remover
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        value={witness.name}
                        onChange={(e) => handleWitnessChange(witness.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input
                          type="text"
                          value={witness.cpf}
                          onChange={(e) => handleWitnessChange(witness.id, 'cpf', formatCPF(e.target.value))}
                          placeholder="000-000-000-00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <input
                          type="email"
                          value={witness.email}
                          onChange={(e) => handleWitnessChange(witness.id, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content - Assinatura */}
      {activeTab === "assinatura" && (
        <div className="p-6">
          <p className="text-gray-600">Conteúdo da aba Assinatura</p>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 rounded-b-lg">
        <button
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!guardian || !selectedPatient}
          className={`px-6 py-2 rounded-lg font-medium text-white transition ${
            guardian && selectedPatient
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}