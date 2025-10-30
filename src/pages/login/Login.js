import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoginService from "../../services/LoginService";
import Alert from "../../components/alert/Alert";

function Login() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token != null) {
      navigate("/");
    }
  }, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await LoginService.login(cpf, password);
      setAlert({ type: "success", message: "Login realizado com sucesso!" });
        navigate("/");
    } catch (err) {
      setError("CPF ou senha inválidos.");
    }
  };

  return (
    <div className="flex h-screen">
     
      {/* Lado esquerdo - Logo */}
      <div className="flex flex-col justify-center items-center w-1/2 bg-blue-50">
        <img
          src="/assets/logo_login/logo.png"
          alt="Logo"
          className="w-[481px] h-[424px] object-contain mx-auto"
        />
      </div>

      {/* Lado direito - Formulário */}
      <div className="flex flex-col justify-center items-center w-1/2 bg-white">
       {/* {alert && (
        <div className="flex justify-center mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            duration={4000}
          />
        </div>
      )} */}
        <h2 className="text-4xl font-semibold mb-8">Acesse sua Conta</h2>

        <form className="w-80 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-start">
            <a href="#" className="text-primary text-sm hover:underline">
              Esqueceu a senha?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white rounded-full py-2 font-medium hover:bg-primary/90 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
