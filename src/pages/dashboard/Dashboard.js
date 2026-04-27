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
    const [sidebarOpen, setSidebarOpen] = useState(true);
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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

    const navLinkClass = (menu) =>
        `flex items-center p-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${
            activeMenu === menu ? "bg-blue-50 text-blue-600" : ""
        }`;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`${
                    sidebarOpen ? "w-64" : "w-16"
                } bg-white shadow-md flex flex-col transition-all duration-300 overflow-hidden`}
            >
                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-4 h-16 min-w-0">
                    <div className="flex items-center space-x-2 overflow-hidden">
                        <img
                            src="/assets/icone_menu/icone.png"
                            alt="icone"
                            className="w-8 h-8 object-contain shrink-0"
                        />
                        {sidebarOpen && (
                            <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">
                                <span className="text-gray-800">GERENC</span>
                                <span className="text-primary">IA</span>
                            </h1>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1.5 rounded-full hover:bg-blue-50 text-primary shrink-0"
                    >
                        <ChevronLeft
                            size={20}
                            className={`transform transition-transform duration-300 ${
                                !sidebarOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                </div>

                {/* Navegação */}
                <nav className="flex-1 p-2 space-y-1">
                    <Link
                        to="/"
                        className={navLinkClass("home")}
                        onClick={() => setActiveMenu("home")}
                        title="Página Inicial"
                    >
                        <Home size={20} className={`shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                        {sidebarOpen && <span>Página Inicial</span>}
                    </Link>

                    {user?.scope === "ADMIN" && (
                        <Link
                            to="/usuarios"
                            className={navLinkClass("users")}
                            onClick={() => setActiveMenu("users")}
                            title="Gerenciar Usuários"
                        >
                            <Users size={20} className={`shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                            {sidebarOpen && <span>Gerenciar Usuários</span>}
                        </Link>
                    )}

                    {/* {user?.scope === "ADMIN" && (
                        <Link
                            to="/aniversariantes"
                            className={navLinkClass("birthdays")}
                            onClick={() => setActiveMenu("birthdays")}
                            title="Aniversariantes"
                        >
                            <Calendar size={20} className={`shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                            {sidebarOpen && <span>Aniversariantes</span>}
                        </Link>
                    )} */}

                    {/* MENU GERENCIAR PACIENTES */}
                    {(user?.scope === "SECRETARY" || user?.scope === "ADMIN") && (
                        <div>
                            <button
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                                    activeMenu === "patients" ? "bg-blue-50 text-blue-600" : ""
                                }`}
                                onClick={() => setOpenSubMenu(!openSubMenu)}
                                title="Gerenciar Pacientes"
                            >
                                <div className="flex items-center">
                                    <User size={20} className={`shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                                    {sidebarOpen && <span>Gerenciar Pacientes</span>}
                                </div>
                                {sidebarOpen && (
                                    <ChevronDown
                                        size={18}
                                        className={`transform transition-transform ${
                                            openSubMenu ? "rotate-180" : ""
                                        }`}
                                    />
                                )}
                            </button>

                            {openSubMenu && sidebarOpen && (
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

                            {/* <Link
                                to="/contrato"
                                className={navLinkClass("contrato")}
                                onClick={() => setActiveMenu("contrato")}
                                title="Contrato"
                            >
                                <FileText size={20} className={`shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                                {sidebarOpen && <span>Contrato</span>}
                            </Link> */}
                        </div>
                    )}

                    {(user?.scope === "PROFESSIONAL" || user?.scope === "ADMIN") && (
                        <Link
                            to="/paciente/encaminhar"
                            className={navLinkClass("encaminhar")}
                            onClick={() => setActiveMenu("encaminhar")}
                            title="Encaminhar paciente"
                        >
                            <Send size={20} className={`shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                            {sidebarOpen && <span>Encaminhar paciente</span>}
                        </Link>
                    )}

                    {(user?.scope === "ASSISTANT" || user?.scope === "ADMIN") && (
                        <Link
                            to="/relatorios"
                            className={navLinkClass("relatorios")}
                            onClick={() => setActiveMenu("relatorios")}
                            title="Relatório de Anamnese"
                        >
                            <FileText size={20} className={`shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                            {sidebarOpen && <span>Relatório de Anamnese</span>}
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Conteúdo principal */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
                    <div className="relative" ref={userDropdownRef}>
                        <button
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            <UserCircle2 size={28} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                                Olá, {user?.name}
                            </span>
                            <ChevronDown
                                size={16}
                                className={`text-gray-500 transition-transform ${
                                    showUserDropdown ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {showUserDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {user?.scope === "ADMIN" && "Gestor"}
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