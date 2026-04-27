import { useState } from "react";
import axios from "axios";
import config from "../../config/Config";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const host = config.URLS.HOST;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${host}/api-gateway/gerencia/recovery`, {
        email,
      });

      setMessage("Se o email existir, um link de recuperação foi enviado.");
    } catch (err) {
      setMessage("Erro ao solicitar recuperação.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Lado esquerdo */}
      <div className="w-1/2 bg-blue-50 flex items-center justify-center">
        <img src="/assets/logo_login/logo.png" alt="logo" className="w-80" />
      </div>

      {/* Lado direito */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-96">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Recuperar senha
          </h2>

          <form onSubmit={handleSubmit}>
            <label className="text-sm text-gray-600">Email:</label>
            <input
              type="email"
              placeholder="Digite seu email"
              className="w-full p-2 border rounded-lg mt-1 mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="w-full bg-primary text-white py-2 rounded-full  transition">
              Enviar link
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-gray-600">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}