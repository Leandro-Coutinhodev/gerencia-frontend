import { Outlet, Link, useNavigate } from "react-router-dom";
import { User, Users, Calendar, Home, ChevronLeft, UserCircle2, ChevronDown, Send, FileText, LogOut } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import ConfirmDialog from "../../components/confirm/ConfirmDialog";

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeMenu, setActiveMenu] = useState("");
    const [openSubMenu, setOpenSubMenu] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const userDropdownRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (err) {
                console.error("Token inválido");
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogoutClick = () => {
        setShowUserDropdown(false);
        setShowLogoutConfirm(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setShowLogoutConfirm(false);
        navigate("/login");
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-4 h-16">
                    <div className="flex items-center space-x-2">
                        <img
                            src="/assets/icone_menu/icone.png"
                            alt="icone"
                            className="w-8 h-8 object-contain"
                        />
                        <h1 className="text-xl font-bold tracking-tight">
                            <span className="text-gray-800">GERENC</span>
                            <span className="text-primary">IA</span>
                        </h1>
                    </div>
                    <button className="p-1.5 rounded-full hover:bg-blue-50 text-primary">
                        <ChevronLeft size={20} />
                    </button>
                </div>

                {/* Navegação */}
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/"
                        className={`flex items-center p-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${activeMenu === 'home' ? 'bg-blue-50 text-blue-600' : ''}`}
                        onClick={() => setActiveMenu('home')}
                    >
                        <Home size={20} className="mr-3" />
                        Página Inicial
                    </Link>

                    {/* MENU GERENCIAR PACIENTES */}
                    {user?.scope === "SECRETARY" && (
                        <div>
                            <button
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${activeMenu === 'patients' ? 'bg-blue-50 text-blue-600' : ''}`}
                                onClick={() => setOpenSubMenu(!openSubMenu)}
                            >
                                <div className="flex items-center">
                                    <User size={20} className="mr-3" />
                                    Gerenciar Pacientes
                                </div>
                                <ChevronDown
                                    size={18}
                                    className={`transform transition-transform ${openSubMenu ? "rotate-180" : ""}`}
                                />
                            </button>

                            {openSubMenu && (
                                <div className="ml-8 mt-1 space-y-1">
                                    <Link
                                        to="/pacientes"
                                        className="block p-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        Cadastrar paciente
                                    </Link>
                                    <Link
                                        to="/anamnese"
                                        className="block p-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        Encaminhar anamnese
                                    </Link>
                                </div>
                            )}
                            <Link
                            to="/contrato"
                            className={`flex items-center p-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${activeMenu === 'users' ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => setActiveMenu('users')}
                        >
                            <FileText size={20} className="mr-3" />
                            Contrato
                        </Link>
                        </div>
                    )}

                    {user?.scope === "ADMIN" && (
                        <Link
                            to="/usuarios"
                            className={`flex items-center p-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${activeMenu === 'users' ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => setActiveMenu('users')}
                        >
                            <Users size={20} className="mr-3" />
                            Gerenciar Usuários
                        </Link>
                    )}

                    {user?.scope === "ADMIN" && (
                        <Link
                            to="/aniversariantes"
                            className={`flex items-center p-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${activeMenu === 'birthdays' ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => setActiveMenu('birthdays')}
                        >
                            <Calendar size={20} className="mr-3" />
                            Aniversariantes
                        </Link>
                    )}

                    {user?.scope === "PROFESSIONAL" && (
                        <Link
                            to="/paciente/encaminhar"
                            className={`flex items-center p-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${activeMenu === 'birthdays' ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => setActiveMenu('birthdays')}
                        >
                           <Send className="mr-3" size={18} /> Encaminhar paciente
                        </Link>
                    )}
                    {user?.scope === "ASSISTANT" && (
                        <Link
                            to="/relatorios"
                            className={`flex items-center p-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${activeMenu === 'birthdays' ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => setActiveMenu('birthdays')}
                        >
                        {/* <Send className="mr-3" size={18}/>Relatórios */}
                        Relatório de Anamnese
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Conteúdo principal */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
                    {/* Menu do Usuário com Dropdown */}
                    <div className="relative" ref={userDropdownRef}>
                        <button
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            <UserCircle2 size={28} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Olá, {user?.name}</span>
                            <ChevronDown 
                                size={16} 
                                className={`text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {user?.scope === "ADMIN" && "Administrador"}
                                        {user?.scope === "SECRETARY" && "Secretária"}
                                        {user?.scope === "PROFESSIONAL" && "Profissional"}
                                        {user?.scope === "ASSISTANT" && "Assistente"}
                                    </p>
                                </div>

                                <button
                                    onClick={handleLogoutClick}
                                    className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition flex items-center gap-3 text-red-600 font-medium"
                                >
                                    <LogOut size={18} />
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Diálogo de Confirmação de Logout */}
            <ConfirmDialog
                isOpen={showLogoutConfirm}
                title="Sair do Sistema"
                message="Tem certeza que deseja sair? Você precisará fazer login novamente."
                confirmText="Sim, sair"
                cancelText="Cancelar"
                onConfirm={handleLogout}
                onCancel={handleCancelLogout}
            />
        </div>
    );
}

export default Dashboard;