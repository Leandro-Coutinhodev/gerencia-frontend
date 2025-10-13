import { useState, useEffect } from "react";
import { X } from "lucide-react";

function CadastroUsuariosModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    date_birth: "",
    role: "",
    position: "",
    affiliation: "",
    professional_license: "",
    photo: null,
  });
useEffect(() => {
  if (initialData) {
    setFormData({
      name: initialData.name || "",
      cpf: initialData.cpf || "",
      email: initialData.email || "",
      password: "",
      confirmPassword: "",
      phone_number: initialData.phoneNumber || initialData.phone_number || "",
      date_birth: initialData.dateBirth
        ? new Date(initialData.dateBirth).toISOString().split("T")[0]
        : initialData.date_birth || "",
      role:
        initialData.roles && initialData.roles.length > 0
          ? typeof initialData.roles[0] === "object"
            ? initialData.roles[0].name
            : initialData.roles[0]
          : "",
      position: initialData.position || "",
      affiliation: initialData.affiliation || "",
      professional_license:
        initialData.professional_license || initialData.professionalLicense || "",
      photo: null,
    });
  } else {
    // 🔹 Resetar formulário quando abrir para cadastrar novo
    setFormData({
      name: "",
      cpf: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone_number: "",
      date_birth: "",
      role: "",
      position: "",
      affiliation: "",
      professional_license: "",
      photo: null,
    });
  }
}, [initialData, isOpen]);


  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!initialData && formData.password !== formData.confirmPassword) {
      alert("As senhas não conferem!");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("cpf", formData.cpf);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phoneNumber", formData.phone_number);
    if (formData.password) formDataToSend.append("password", formData.password);
    if (formData.date_birth)
      formDataToSend.append("dateBirth", formData.date_birth);
    if (formData.photo) formDataToSend.append("photo", formData.photo);
    if (formData.role === "ASSISTANT") {
      formDataToSend.append("position", formData.position);
      formDataToSend.append("affiliation", formData.affiliation);
    }
    if (formData.role === "PROFESSIONAL") {
      formDataToSend.append("professionalLicense", formData.professional_license);
    }
    formDataToSend.append("role", formData.role);

    onSave(formDataToSend);
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case "ASSISTANT":
        return (
          <>
            <div>
              <label className="block text-sm font-medium">Cargo*</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#3D75C4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Afiliação*</label>
              <input
                type="text"
                name="affiliation"
                value={formData.affiliation}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#3D75C4]"
              />
            </div>
          </>
        );
      case "PROFESSIONAL":
        return (
          <div>
            <label className="block text-sm font-medium">
              Registro Profissional*
            </label>
            <input
              type="text"
              name="professional_license"
              value={formData.professional_license}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#3D75C4]"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            {initialData ? "Editar Usuário" : "Cadastrar Usuário"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          className="px-6 py-4 space-y-4"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div>
            <label className="block text-sm font-medium">Nome Completo*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#3D75C4]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Cpf*</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#3D75C4]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Telefone*</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#3D75C4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">E-mail*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#3D75C4]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Tipo de Usuário*</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#3D75C4]"
              required
            >
              <option value="">Selecione</option>
              <option value="ADMIN">Administrador</option>
              <option value="PROFESSIONAL">Profissional</option>
              <option value="SECRETARY">Secretário</option>
              <option value="ASSISTANT">Assistente</option>
            </select>
          </div>

          {renderRoleSpecificFields()}

          <div>
            <label className="block text-sm font-medium">Data de Nascimento</label>
            <input
              type="date"
              name="date_birth"
              value={formData.date_birth}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#3D75C4]"
            />
          </div>

          {!initialData && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Senha*</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#3D75C4]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pelo menos 8 caracteres
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Confirmar Senha*
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#3D75C4]"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Foto de Perfil</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#3D75C4] text-white hover:bg-[#335fa1]"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastroUsuariosModal;
