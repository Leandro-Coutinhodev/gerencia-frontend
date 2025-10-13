import { useEffect, useState } from "react";
import GuardiansService from "../../services/GuardiansService";

function CadastroPacientesModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState({});
  const [originalForm, setOriginalForm] = useState({});
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [guardianSuggestions, setGuardianSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Preenche com dados do paciente/guardian ao editar OU reseta para valores vazios
  useEffect(() => {
    if (initialData) {
      const formatted = {
        id: initialData.id || null,
        name: initialData.name || "",
        cpf: initialData.cpf || "",
        dateBirth: initialData.dateBirth
          ? new Date(initialData.dateBirth).toISOString().split("T")[0]
          : "",
        guardian: {
          id: initialData.guardian?.id || null,
          name: initialData.guardian?.name || "",
          cpf: initialData.guardian?.cpf || "",
          email: initialData.guardian?.email || "",
          phoneNumber: initialData.guardian?.phoneNumber || "",
          addressLine1: initialData.guardian?.addressLine1 || "",
          addressLine2: initialData.guardian?.addressLine2 || "",
          dateBirth: initialData.guardian?.dateBirth
            ? new Date(initialData.guardian.dateBirth).toISOString().split("T")[0]
            : "",
          cep: initialData.guardian?.cep || "",
          state: initialData.guardian?.state || "",
          city: initialData.guardian?.city || "",
          number: initialData.guardian?.number || "",
          neighborhood: initialData.guardian?.neighborhood || "",
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
        guardian: {
          id: null,
          name: "",
          cpf: "",
          email: "",
          phoneNumber: "",
          addressLine1: "",
          addressLine2: "",
          dateBirth: "",
          cep: "",
          state: "",
          city: "",
          number: "",
          neighborhood: "",
        },
      };
      setForm(emptyForm);
      setOriginalForm(emptyForm);
    }
  }, [initialData, isOpen]);

  // Buscar estados ao abrir o modal
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

  // Buscar cidades quando estado mudar
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

  // Buscar responsáveis no backend
  const fetchGuardians = async (query) => {
  if (!query || query.length < 2) {
    setGuardianSuggestions([]);
    return;
  }
  try {
    const data = await GuardiansService.listarPorCpf(query); // /guardian?cpf=...
    setGuardianSuggestions(data);
  } catch (err) {
    console.error("Erro ao buscar responsáveis:", err);
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("guardian.")) {
      const field = name.split(".")[1];

      setForm((prev) => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          [field]: value,
          ...(field === "state" ? { city: "" } : {}),
        },
      }));

      // 🔎 Se for CPF do responsável, dispara busca
      if (field === "cpf") {
        fetchGuardians(value);
        setShowSuggestions(true);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
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
        phoneNumber: guardian.phoneNumber,
        addressLine1: guardian.addressLine1,
        addressLine2: guardian.addressLine2,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  if (!isOpen) return null;

  // Verifica se houve alteração
  const isEditing = Boolean(initialData);
  const isChanged = JSON.stringify(form) !== JSON.stringify(originalForm);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl my-8 p-8">
        <h2 className="text-2xl font-semibold mb-6">
          {isEditing ? "Editar Paciente" : "Cadastrar Paciente"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Paciente */}
          <div>
            <div>
              <h3 className="text-lg font-medium mb-4">Informações do Paciente</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium">Nome Completo*</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">CPF*</label>
                  <input
                    type="text"
                    name="cpf"
                    value={form.cpf}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Data de Nascimento*</label>
                  <input
                    type="date"
                    name="dateBirth"
                    value={form.dateBirth}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                 <div>
            <label className="block text-sm font-medium">Foto</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>
              </div>
            </div>

          </div>

          {/* Responsável */}
          <div>
            <h3 className="text-lg font-medium mb-4">Informações do Responsável</h3>
            <div className="grid grid-cols-2 gap-4">

              {/* CPF com autocomplete */}
              <div className="col-span-2 relative">
                <label className="block text-sm font-medium">CPF*</label>
                <input
                  type="text"
                  name="guardian.cpf"
                  value={form.guardian.cpf}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                {showSuggestions && guardianSuggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border w-full rounded-lg shadow max-h-40 overflow-y-auto">
                    {guardianSuggestions.map((g) => (
                      <li
                        key={g.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectGuardian(g)}
                      >
                        {g.cpf} - {g.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium">Nome Completo*</label>
                <input
                  type="text"
                  name="guardian.name"
                  value={form.guardian.name}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                  readOnly
                />
              </div>
              

              {/* ... demais campos do responsável ... */}

              <div>
                <label className="block text-sm font-medium">Data de Nascimento*</label>
                <input
                  type="date"
                  name="guardian.dateBirth"
                  value={form.guardian.dateBirth}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium">Parentesco*</label>
                <input
                  type="text"
                  name="guardian.name"
                  value={form.guardian.parent}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium">E-mail</label>
                <input
                  type="email"
                  name="guardian.email"
                  value={form.guardian.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Telefone 1 (WhatsApp)*</label>
                <input
                  type="text"
                  name="guardian.phoneNumber"
                  value={form.guardian.phoneNumber}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
               <div>
                <label className="block text-sm font-medium">Telefone 2 (WhatsApp)</label>
                <input
                  type="text"
                  name="guardian.phoneNumber"
                  value={form.guardian.phoneNumber}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">CEP*</label>
                <input
                  type="text"
                  name="guardian.cep"
                  value={form.guardian.cep}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Estado*</label>
                <select
                  name="guardian.state"
                  value={form.guardian.state}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
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
              <div>
                <label className="block text-sm font-medium">Cidade*</label>
                <select
                  name="guardian.city"
                  value={form.guardian.city}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  required
                  disabled={!form.guardian.state}
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
                <label className="block text-sm font-medium">Endereço*</label>
                <input
                  type="text"
                  name="guardian.addressLine1"
                  value={form.guardian.addressLine1}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Número*</label>
                <input
                  type="text"
                  name="guardian.number"
                  value={form.guardian.number}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Bairro*</label>
                <input
                  type="text"
                  name="guardian.neighborhood"
                  value={form.guardian.neighborhood}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium">Complemento</label>
                <input
                  type="text"
                  name="guardian.addressLine2"
                  value={form.guardian.addressLine2}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg text-white transition ${isEditing && !isChanged
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
                }`}
              disabled={isEditing && !isChanged}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastroPacientesModal;
