import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import GuardiansService from "../../services/GuardiansService";
import PatientsService from "../../services/PatientsService";

function CadastroPacientePublico() {
  const [form, setForm] = useState({
    paciente: {
      name: "",
      cpf: "",
      dateBirth: "",
      photo: null,
      kinship: "",
    },
    responsavel: {
      id: null,
      name: "",
      cpf: "",
      email: "",
      phoneNumber1: "",
      phoneNumber2: "",
      addressLine1: "",
      addressLine2: "",
      dateBirth: "",
      cep: "",
      state: "",
      city: "",
      number: "",
      neighborhood: "",
    },
  });

  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [guardianSuggestions, setGuardianSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Função para formatar CPF
  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 11);
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    if (limited.length <= 9)
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(
      6,
      9
    )}-${limited.slice(9)}`;
  };

  // Função para formatar CEP
  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 8);
    if (limited.length <= 5) return limited;
    return `${limited.slice(0, 5)}-${limited.slice(5)}`;
  };

  // Função para formatar telefone
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 11);
    if (limited.length <= 2) return limited;
    if (limited.length <= 6)
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    if (limited.length <= 10)
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(
        6
      )}`;
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  };

  // Carregar estados
  useEffect(() => {
    fetch("https://brasilapi.com.br/api/ibge/uf/v1")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome));
        setEstados(sorted);
      })
      .catch((err) => console.error("Erro ao carregar estados:", err));
  }, []);

  // Carregar cidades quando estado for selecionado
  useEffect(() => {
    if (form.responsavel.state) {
      fetch(
        `https://brasilapi.com.br/api/ibge/municipios/v1/${form.responsavel.state}`
      )
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome));
          setCidades(sorted);
        })
        .catch((err) => console.error("Erro ao carregar cidades:", err));
    } else {
      setCidades([]);
    }
  }, [form.responsavel.state]);

  // Buscar responsáveis pelo CPF (apenas CPF completo e exato)
  const fetchGuardians = async (query) => {
    // Envia o CPF formatado (com pontos e traço)
    const cpfFormatted = query;
    const cpfNumbers = query.replace(/\D/g, "");
    
    // Só busca se o CPF estiver completo (11 dígitos)
    if (cpfNumbers.length !== 11) {
      setGuardianSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      // Envia o CPF formatado para o backend (ex: 123.456.789-10)
      const data = await GuardiansService.listarPorCpf(cpfFormatted);
      
      // Filtrar por CPF exato
      const exactMatches = data.filter(guardian => guardian.cpf === cpfFormatted);
      
      setGuardianSuggestions(exactMatches);
      setShowSuggestions(exactMatches.length > 0);
    } catch (err) {
      console.error("Erro ao buscar responsáveis:", err);
      setGuardianSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Selecionar responsável da lista de sugestões
  const handleSelectGuardian = (guardian) => {
    setForm((prev) => ({
      ...prev,
      responsavel: {
        id: guardian.id,
        name: guardian.name,
        cpf: guardian.cpf,
        email: guardian.email,
        phoneNumber1: guardian.phoneNumber1,
        phoneNumber2: guardian.phoneNumber2 || "",
        addressLine1: guardian.addressLine1,
        addressLine2: guardian.addressLine2 || "",
        dateBirth: guardian.dateBirth
          ? new Date(guardian.dateBirth).toISOString().split("T")[0]
          : "",
        cep: guardian.cep,
        state: guardian.state,
        city: guardian.city,
        number: guardian.number,
        neighborhood: guardian.neighborhood,
      },
    }));
    setShowSuggestions(false);
  };

  const handleChange = (e, section) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setForm((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: file },
      }));
      return;
    }

    let formattedValue = value;

    // Aplicar formatações
    if (name === "cpf") {
      formattedValue = formatCPF(value);
      
      // Se for CPF do responsável, buscar sugestões
      if (section === "responsavel") {
        fetchGuardians(formattedValue);
      }
    } else if (name === "cep") {
      formattedValue = formatCEP(value);
    } else if (name === "phoneNumber1" || name === "phoneNumber2") {
      formattedValue = formatPhone(value);
    }

    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: formattedValue,
        ...(name === "state" ? { city: "" } : {}),
      },
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[`${section}.${name}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${name}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar paciente - CAMPOS OBRIGATÓRIOS
    if (!form.paciente.name.trim())
      newErrors["paciente.name"] = "Nome é obrigatório";
    if (!form.paciente.dateBirth)
      newErrors["paciente.dateBirth"] = "Data de nascimento é obrigatória";
    if (!form.paciente.kinship.trim())
      newErrors["paciente.kinship"] = "Parentesco é obrigatório";

    // Validar responsável - CAMPOS OBRIGATÓRIOS
    if (!form.responsavel.cpf.trim())
      newErrors["responsavel.cpf"] = "CPF é obrigatório";
    if (!form.responsavel.name.trim())
      newErrors["responsavel.name"] = "Nome é obrigatório";
    if (!form.responsavel.dateBirth)
      newErrors["responsavel.dateBirth"] = "Data de nascimento é obrigatória";
    if (!form.responsavel.email.trim())
      newErrors["responsavel.email"] = "E-mail é obrigatório";
    if (!form.responsavel.phoneNumber1.trim())
      newErrors["responsavel.phoneNumber1"] = "Telefone é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll para o primeiro erro
      const firstError = document.querySelector(".border-red-500");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar FormData para enviar multipart/form-data
      const formData = new FormData();

      // Preparar o objeto patient (sem a foto)
      const patientData = {
        name: form.paciente.name,
        cpf: form.paciente.cpf.trim() || null, // ← Converte string vazia para null
        dateBirth: form.paciente.dateBirth,
        kinship: form.paciente.kinship,
        guardian: {
          id: form.responsavel.id || null,
          name: form.responsavel.name,
          cpf: form.responsavel.cpf,
          email: form.responsavel.email,
          phoneNumber1: form.responsavel.phoneNumber1,
          phoneNumber2: form.responsavel.phoneNumber2 || null, // ← Opcional também
          addressLine1: form.responsavel.addressLine1 || null,
          addressLine2: form.responsavel.addressLine2 || null,
          dateBirth: form.responsavel.dateBirth,
          cep: form.responsavel.cep || null,
          state: form.responsavel.state || null,
          city: form.responsavel.city || null,
          number: form.responsavel.number || null,
          neighborhood: form.responsavel.neighborhood || null,
        },
      };

      // Adicionar patient como JSON blob
      formData.append(
        "patient",
        new Blob([JSON.stringify(patientData)], {
          type: "application/json",
        })
      );

      // Adicionar foto se existir
      if (form.paciente.photo instanceof File) {
        formData.append("photo", form.paciente.photo);
      } else {
        formData.append("photo", new Blob([], { type: "application/octet-stream" }));
      }

      // Enviar para a API usando PatientsService
      await PatientsService.cadastrar(formData);

      setSubmitSuccess(true);
    } catch (error) {
      console.error("Erro ao enviar cadastro:", error);
      const errorMessage = error.response?.data?.message || "Erro ao enviar cadastro. Por favor, tente novamente.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="text-green-500" size={80} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Cadastro Realizado!
          </h2>
          <p className="text-gray-600 mb-8">
            Seu cadastro foi enviado com sucesso. Em breve entraremos em contato
            para confirmar as informações.
          </p>
          <button
            onClick={() => {
              setSubmitSuccess(false);
              setForm({
                paciente: {
                  name: "",
                  cpf: "",
                  dateBirth: "",
                  photo: null,
                  kinship: "",
                },
                responsavel: {
                  id: null,
                  name: "",
                  cpf: "",
                  email: "",
                  phoneNumber1: "",
                  phoneNumber2: "",
                  addressLine1: "",
                  addressLine2: "",
                  dateBirth: "",
                  cep: "",
                  state: "",
                  city: "",
                  number: "",
                  neighborhood: "",
                },
              });
            }}
            className="bg-[#3D75C4] hover:bg-[#2d5ea3] text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Realizar Novo Cadastro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg px-6 sm:px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Cadastro de Paciente
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Preencha os dados do paciente e do responsável
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg">
          <div className="px-6 sm:px-8 py-6 space-y-8">
            {/* Informações do Paciente */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#3D75C4]">
                Dados do Paciente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.paciente.name}
                    onChange={(e) => handleChange(e, "paciente")}
                    className={`w-full border ${
                      errors["paciente.name"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="Digite o nome completo do paciente"
                  />
                  {errors["paciente.name"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["paciente.name"]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF (Opcional)
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={form.paciente.cpf}
                    onChange={(e) => handleChange(e, "paciente")}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full border ${
                      errors["paciente.cpf"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["paciente.cpf"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["paciente.cpf"]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateBirth"
                    value={form.paciente.dateBirth}
                    onChange={(e) => handleChange(e, "paciente")}
                    className={`w-full border ${
                      errors["paciente.dateBirth"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["paciente.dateBirth"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["paciente.dateBirth"]}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parentesco com o Responsável{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kinship"
                    value={form.paciente.kinship}
                    onChange={(e) => handleChange(e, "paciente")}
                    placeholder="Ex: Filho(a), Neto(a), Sobrinho(a)..."
                    className={`w-full border ${
                      errors["paciente.kinship"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["paciente.kinship"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["paciente.kinship"]}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto de Perfil (Opcional)
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={(e) => handleChange(e, "paciente")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="px-6 py-8 text-center pointer-events-none">
                      <div className="text-gray-400 text-sm mb-1">
                        {form.paciente.photo instanceof File
                          ? form.paciente.photo.name
                          : "Clique ou arraste uma imagem"}
                      </div>
                      <div className="text-gray-300 text-2xl">📎</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do Responsável */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#3D75C4]">
                Dados do Responsável
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CPF com autocomplete - PRIMEIRO CAMPO */}
                <div className="sm:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF do Responsável <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={form.responsavel.cpf}
                    onChange={(e) => handleChange(e, "responsavel")}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full border ${
                      errors["responsavel.cpf"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["responsavel.cpf"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["responsavel.cpf"]}
                    </p>
                  )}
                  
                  {/* Lista de sugestões de responsáveis */}
                  {showSuggestions && guardianSuggestions.length > 0 && (
                    <ul className="absolute z-20 bg-white border border-gray-300 w-full rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                      {guardianSuggestions.map((g) => (
                        <li
                          key={g.id}
                          className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0"
                          onClick={() => handleSelectGuardian(g)}
                        >
                          <div className="font-medium text-gray-800">{g.name}</div>
                          <div className="text-gray-500 text-xs">{g.cpf}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.responsavel.name}
                    onChange={(e) => handleChange(e, "responsavel")}
                    placeholder="Digite seu nome completo"
                    className={`w-full border ${
                      errors["responsavel.name"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["responsavel.name"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["responsavel.name"]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateBirth"
                    value={form.responsavel.dateBirth}
                    onChange={(e) => handleChange(e, "responsavel")}
                    className={`w-full border ${
                      errors["responsavel.dateBirth"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["responsavel.dateBirth"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["responsavel.dateBirth"]}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.responsavel.email}
                    onChange={(e) => handleChange(e, "responsavel")}
                    placeholder="seu.email@exemplo.com"
                    className={`w-full border ${
                      errors["responsavel.email"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["responsavel.email"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["responsavel.email"]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone Principal (WhatsApp){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phoneNumber1"
                    value={form.responsavel.phoneNumber1}
                    onChange={(e) => handleChange(e, "responsavel")}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className={`w-full border ${
                      errors["responsavel.phoneNumber1"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["responsavel.phoneNumber1"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["responsavel.phoneNumber1"]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone Secundário (WhatsApp Opcional)
                  </label>
                  <input
                    type="text"
                    name="phoneNumber2"
                    value={form.responsavel.phoneNumber2}
                    onChange={(e) => handleChange(e, "responsavel")}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <h4 className="font-medium text-gray-700 mb-3 mt-4">
                    Endereço (Opcional)
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="cep"
                    value={form.responsavel.cep}
                    onChange={(e) => handleChange(e, "responsavel")}
                    placeholder="00000-000"
                    maxLength={9}
                    className={`w-full border ${
                      errors["responsavel.cep"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["responsavel.cep"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["responsavel.cep"]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    name="state"
                    value={form.responsavel.state}
                    onChange={(e) => handleChange(e, "responsavel")}
                    className={`w-full border ${
                      errors["responsavel.state"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors`}
                  >
                    <option value="">Selecione um estado</option>
                    {estados.map((estado) => (
                      <option key={estado.sigla} value={estado.sigla}>
                        {estado.nome}
                      </option>
                    ))}
                  </select>
                  {errors["responsavel.state"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["responsavel.state"]}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <select
                    name="city"
                    value={form.responsavel.city}
                    onChange={(e) => handleChange(e, "responsavel")}
                    className={`w-full border ${
                      errors["responsavel.city"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors`}
                    disabled={!form.responsavel.state}
                  >
                    <option value="">Selecione uma cidade</option>
                    {cidades.map((cidade) => (
                      <option key={cidade.codigo_ibge} value={cidade.nome}>
                        {cidade.nome}
                      </option>
                    ))}
                  </select>
                  {errors["responsavel.city"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["responsavel.city"]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rua/Avenida
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={form.responsavel.addressLine1}
                    onChange={(e) => handleChange(e, "responsavel")}
                    placeholder="Nome da rua ou avenida"
                    className={`w-full border ${
                      errors["responsavel.addressLine1"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["responsavel.addressLine1"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["responsavel.addressLine1"]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={form.responsavel.number}
                    onChange={(e) => handleChange(e, "responsavel")}
                    placeholder="Nº"
                    className={`w-full border ${
                      errors["responsavel.number"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["responsavel.number"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["responsavel.number"]}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={form.responsavel.neighborhood}
                    onChange={(e) => handleChange(e, "responsavel")}
                    placeholder="Nome do bairro"
                    className={`w-full border ${
                      errors["responsavel.neighborhood"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  {errors["responsavel.neighborhood"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["responsavel.neighborhood"]}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complemento (Opcional)
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={form.responsavel.addressLine2}
                    onChange={(e) => handleChange(e, "responsavel")}
                    placeholder="Apartamento, bloco, casa, etc..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer com botão */}
          <div className="px-6 sm:px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg text-white font-medium transition-all shadow-lg ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#3D75C4] hover:bg-[#2d5ea3] hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enviando cadastro...
                </span>
              ) : (
                "Enviar Cadastro"
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              * Campos obrigatórios
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastroPacientePublico;