import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import Alert from "../../components/alert/Alert"; // ajuste o caminho conforme seu projeto
import config from "../../config/Config";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null); // { type, message }
    const host = config.URLS.HOST;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);

        if (password.length < 6) {
            setAlert({ type: "error", message: "A senha deve ter no mínimo 6 caracteres." });
            return;
        }

        if (password !== confirmPassword) {
            setAlert({ type: "error", message: "As senhas não conferem." });
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${host}/api-gateway/gerencia/recovery/reset`, {
                token,
                newPassword: password,
            });
            setAlert({ type: "success", message: "Senha redefinida com sucesso! Redirecionando..." });
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            setAlert({ type: "error", message: "Token inválido ou expirado." });
        } finally {
            setLoading(false);
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
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">Nova senha</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Defina uma nova senha para a sua conta.
                    </p>

                    {alert && (
                        <Alert
                            type={alert.type}
                            message={alert.message}
                            onClose={() => setAlert(null)}
                        />
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nova senha */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nova senha:
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full border rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar senha */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar senha:
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Repita a nova senha"
                                    className="w-full border rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-2 rounded-full font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? "Redefinindo..." : "Redefinir senha"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}