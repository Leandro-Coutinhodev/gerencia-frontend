import { useEffect, useState } from "react";
import { X } from "lucide-react";
import GuardiansService from "../../services/GuardiansService";

function CadastroPacientesModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState({});
  const [originalForm, setOriginalForm] = useState({});
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [guardianSuggestions, setGuardianSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Função para formatar CPF
  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 11);
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    if (limited.length <= 9) return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
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
    if (limited.length <= 6) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    if (limited.length <= 10) return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  };

  useEffect(() => {
    if (initialData) {
      const formatted = {
        id: initialData.id || null,
        name: initialData.name || "",
        cpf: initialData.cpf || "",
        dateBirth: initialData.dateBirth
          ? new Date(initialData.dateBirth).toISOString().split("T")[0]
          : "",
        photo: initialData.photo || "",
        kinship: initialData.kinship || "",
        guardian: {
          id: initialData.guardian?.id || null,
          name: initialData.guardian?.name || "",
          cpf: initialData.guardian?.cpf || "",
          email: initialData.guardian?.email || "",
          phoneNumber1: initialData.guardian?.phoneNumber1 || "",
          phoneNumber2: initialData.guardian?.phoneNumber2 || "",
          addressLine1: initialData.guardian?.addressLine1 || "",
          addressLine2: initialData.guardian?.addressLine2 || "",
          dateBirth: initialData.guardian?.dateBirth
            ? new Date(initialData.guardian.dateBirth).toISOString().split("T")[0]
            : "",
          cep: initialData.guardian?.cep || "",
          state: initialData.guardian?.state || "",
          city: initialData.guardian?.city || "",
          number: initialData.guardian?.number || "",
          neighborhood: initialData.guardian?.neighborhood || ""
        },
      };
      setForm(formatted);
      setOriginalForm(formatted);
    } else {
      const emptyForm = {
        id: null,
        name: "",
        cpf: "",
        dateBirth: "",
        photo: "",
        kinship: "",
        guardian: {
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
          neighborhood: ""
        },
      };
      setForm(emptyForm);
      setOriginalForm(emptyForm);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetch("https://brasilapi.com.br/api/ibge/uf/v1")
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome));
          setEstados(sorted);
        })
        .catch((err) => console.error("Erro ao carregar estados:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (form.guardian?.state) {
      fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${form.guardian.state}`)
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome));
          setCidades(sorted);
        })
        .catch((err) => console.error("Erro ao carregar cidades:", err));
    } else {
      setCidades([]);
    }
  }, [form.guardian?.state]);

  const fetchGuardians = async (query) => {
    const cpfNumbers = query.replace(/\D/g, "");
    if (!cpfNumbers || cpfNumbers.length < 3) {
      setGuardianSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const data = await GuardiansService.listarPorCpf(cpfNumbers);
      setGuardianSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error("Erro ao buscar responsáveis:", err);
      setGuardianSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setForm((prev) => ({ ...prev, photo: file }));
      return;
    }

    if (name.startsWith("guardian.")) {
      const field = name.split(".")[1];
      let formattedValue = value;

      // Aplicar formatações
      if (field === "cpf") {
        formattedValue = formatCPF(value);
        fetchGuardians(formattedValue);
        setShowSuggestions(true);
      } else if (field === "cep") {
        formattedValue = formatCEP(value);
      } else if (field === "phoneNumber1" || field === "phoneNumber2") {
        formattedValue = formatPhone(value);
      }

      setForm((prev) => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          [field]: formattedValue,
          ...(field === "state" ? { city: "" } : {}),
        },
      }));
    } else {
      let formattedValue = value;
      
      // Formatar CPF do paciente
      if (name === "cpf") {
        formattedValue = formatCPF(value);
      }

      setForm((prev) => ({ ...prev, [name]: formattedValue }));
    }
  };

  const handleSelectGuardian = (guardian) => {
    setForm((prev) => ({
      ...prev,
      guardian: {
        id: guardian.id,
        name: guardian.name,
        cpf: guardian.cpf,
        email: guardian.email,
        phoneNumber1: guardian.phoneNumber1,
        phoneNumber2: guardian.phoneNumber2,
        addressLine1: guardian.addressLine1,
        addressLine2: guardian.addressLine2,
        dateBirth: guardian.dateBirth
          ? new Date(guardian.dateBirth).toISOString().split("T")[0]
          : "",
        cep: guardian.cep,
        state: guardian.state,
        city: guardian.city,
        number: guardian.number,
        neighborhood: guardian.neighborhood
      },
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Criar FormData para enviar multipart/form-data
    const formData = new FormData();
    
    // Preparar o objeto patient (sem a foto)
    const patientData = {
      name: form.name,
      cpf: form.cpf,
      dateBirth: form.dateBirth,
      kinship: form.kinship,
      guardian: {
        id: form.guardian?.id || null,
        name: form.guardian?.name,
        cpf: form.guardian?.cpf,
        email: form.guardian?.email,
        phoneNumber1: form.guardian?.phoneNumber1,
        phoneNumber2: form.guardian?.phoneNumber2,
        addressLine1: form.guardian?.addressLine1,
        addressLine2: form.guardian?.addressLine2,
        dateBirth: form.guardian?.dateBirth,
        cep: form.guardian?.cep,
        state: form.guardian?.state,
        city: form.guardian?.city,
        number: form.guardian?.number,
        neighborhood: form.guardian?.neighborhood
      }
    };
    
    // Se estiver editando, adiciona o ID
    if (form.id) {
      patientData.id = form.id;
    }
    
    // Adicionar patient como JSON blob
    formData.append('patient', new Blob([JSON.stringify(patientData)], {
      type: 'application/json'
    }));
    
    // Adicionar foto se existir
    if (form.photo instanceof File) {
      formData.append('photo', form.photo);
    } else {
      // Enviar um arquivo vazio se não houver foto
      formData.append('photo', new Blob([], { type: 'application/octet-stream' }));
    }
    
    // Log para debug
    console.log('FormData sendo enviado:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    
    onSave(formData);
  };

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);
  const isChanged = JSON.stringify(form) !== JSON.stringify(originalForm);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? "Editar Paciente" : "Cadastrar Paciente"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 space-y-8 max-h-[75vh] overflow-y-auto">
          {/* Informações do Paciente */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Informações do Paciente
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={form.cpf || ""}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="dateBirth"
                  value={form.dateBirth || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
                 <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parentesco
                </label>
                <input
                  type="text"
                  name="kinship"
                  value={form?.kinship || ""}
                  onChange={handleChange}
                  placeholder="Ex: Filho(a), Neto(a), Sobrinho(a)..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto de perfil
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="px-6 py-8 text-center pointer-events-none">
                    <div className="text-gray-400 text-sm mb-1">
                      {form.photo instanceof File ? form.photo.name : "Envie a imagem"}
                    </div>
                    <div className="text-gray-300 text-2xl">📎</div>
                  </div>
                </div>
             
              </div>
            </div>
          </div>

          {/* Informações do Responsável */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Informações do Responsável
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* CPF com autocomplete */}
              <div className="col-span-2 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF do Responsável
                </label>
                <input
                  type="text"
                  name="guardian.cpf"
                  value={form.guardian?.cpf || ""}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
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

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="guardian.name"
                  value={form.guardian?.name || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="guardian.dateBirth"
                  value={form.guardian?.dateBirth || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <input
                  type="email"
                  name="guardian.email"
                  value={form.guardian?.email || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone 1 (WhatsApp)
                </label>
                <input
                  type="text"
                  name="guardian.phoneNumber1"
                  value={form.guardian?.phoneNumber1 || ""}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone 2
                </label>
                <input
                  type="text"
                  name="guardian.phoneNumber2"
                  value={form.guardian?.phoneNumber2 || ""}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                <input
                  type="text"
                  name="guardian.cep"
                  value={form.guardian?.cep || ""}
                  onChange={handleChange}
                  placeholder="00000-000"
                  maxLength={9}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  name="guardian.state"
                  value={form.guardian?.state || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Selecione um estado</option>
                  {estados.map((estado) => (
                    <option key={estado.sigla} value={estado.sigla}>
                      {estado.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                <select
                  name="guardian.city"
                  value={form.guardian?.city || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={!form.guardian?.state}
                >
                  <option value="">Selecione uma cidade</option>
                  {cidades.map((cidade) => (
                    <option key={cidade.codigo_ibge} value={cidade.nome}>
                      {cidade.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço (Rua/Avenida)
                </label>
                <input
                  type="text"
                  name="guardian.addressLine1"
                  value={form.guardian?.addressLine1 || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                <input
                  type="text"
                  name="guardian.number"
                  value={form.guardian?.number || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                <input
                  type="text"
                  name="guardian.neighborhood"
                  value={form.guardian?.neighborhood || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  name="guardian.addressLine2"
                  value={form.guardian?.addressLine2 || ""}
                  onChange={handleChange}
                  placeholder="Apartamento, bloco, etc..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer com botões */}
        <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors shadow-sm ${
              isEditing && !isChanged
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#3D75C4] hover:bg-[#2d5ea3]"
            }`}
            disabled={isEditing && !isChanged}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CadastroPacientesModal;