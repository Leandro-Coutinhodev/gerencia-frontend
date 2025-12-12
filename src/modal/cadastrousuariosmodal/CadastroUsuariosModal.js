import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";

function CadastroUsuariosModal({ isOpen, onClose, onSave, initialData }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
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

  const formatCPF = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara: 000.000.000-00
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    if (limited.length <= 9) return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
  };

  const validateEmail = (email) => {
    // Regex para validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (name === "cpf") {
      // Formata o CPF automaticamente
      const formattedCPF = formatCPF(value);
      setFormData((prev) => ({ ...prev, [name]: formattedCPF }));
    } else if (name === "email") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Valida email em tempo real
      if (value && !validateEmail(value)) {
        setEmailError("E-mail inválido");
      } else {
        setEmailError("");
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Valida email
    if (!validateEmail(formData.email)) {
      alert("Por favor, insira um e-mail válido!");
      return;
    }

    // Valida CPF (deve ter 11 dígitos)
    const cpfNumbers = formData.cpf.replace(/\D/g, "");
    if (cpfNumbers.length !== 11) {
      alert("CPF inválido! O CPF deve conter 11 dígitos.");
      return;
    }

    if (!initialData && formData.password !== formData.confirmPassword) {
      alert("As senhas não conferem!");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("cpf", formData.cpf); // Envia com a formatação completa
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Afiliação</label>
              <input
                type="text"
                name="affiliation"
                value={formData.affiliation}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );
      case "PROFESSIONAL":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registro Profissional
            </label>
            <input
              type="text"
              name="professional_license"
              value={formData.professional_license}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? "Editar Usuário" : "Cadastrar Usuário"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
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
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${emailError ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent`}
                required
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Usuário
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
              }}
              required
            >
              <option value="">Selecione</option>
              <option value="ADMIN">Administrador</option>
              <option value="PROFESSIONAL">Profissional</option>
              <option value="SECRETARY">Secretário(a)</option>
              <option value="ASSISTANT">Assistente</option>
            </select>
          </div>

          {renderRoleSpecificFields()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Nascimento
            </label>
            <input
              type="date"
              name="date_birth"
              value={formData.date_birth}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
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
                id="photo-upload"
              />
              <div className="px-6 py-8 text-center pointer-events-none">
                <div className="text-gray-400 text-sm mb-1">
                  {formData.photo ? formData.photo.name : "Envie a imagem"}
                </div>
                <div className="text-gray-300 text-2xl">📎</div>
              </div>
            </div>
          </div>

          {!initialData && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirma Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-lg bg-[#3D75C4] text-white font-medium hover:bg-[#2d5ea3] transition-colors shadow-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CadastroUsuariosModal;