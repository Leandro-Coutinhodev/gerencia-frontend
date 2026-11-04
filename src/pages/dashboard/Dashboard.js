import { Outlet, Link, useNavigate } from "react-router-dom";
import { User, Users, Home, ChevronLeft, ChevronDown, LogOut, CalendarClock, ClipboardList, DollarSign, FileText } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import ConfirmDialog from "../../components/confirm/ConfirmDialog";

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeMenu, setActiveMenu] = useState("");
    // Submenus funcionam como acordeão: abrir um grupo fecha o outro, pra manter o
    // menu lateral limpo mesmo com muitas opções.
    const [openGroup, setOpenGroup] = useState(null);
    const toggleGroup = (id) => setOpenGroup((prev) => (prev === id ? null : id));
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
        `flex items-center p-2.5 rounded-xl font-medium transition-all ${
            activeMenu === menu
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "text-gray-600 hover:bg-primary/5 hover:text-primary"
        }`;

    const groupToggleClass = (id) =>
        `w-full flex items-center justify-between p-2.5 rounded-xl font-medium transition-all ${
            openGroup === id
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "text-gray-600 hover:bg-primary/5 hover:text-primary"
        }`;

    const subLinkClass = "block px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-primary/5 hover:text-primary transition-colors";

    // Grupo de menu recolhível: generaliza o padrão de acordeão que antes só existia
    // para "Gerenciar Pacientes" e "Financeiro", agora reaproveitado por todos os grupos.
    const NavGroup = ({ id, icon: Icon, label, children }) => (
        <div>
            <button className={groupToggleClass(id)} onClick={() => toggleGroup(id)} title={label}>
                <div className="flex items-center min-w-0">
                    <Icon size={20} className={`shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                    {sidebarOpen && <span className="truncate">{label}</span>}
                </div>
                {sidebarOpen && (
                    <ChevronDown
                        size={18}
                        className={`shrink-0 ml-2 transform transition-transform ${openGroup === id ? "rotate-180" : ""}`}
                    />
                )}
            </button>
            {openGroup === id && sidebarOpen && (
                <div className="ml-8 mt-1 space-y-1">{children}</div>
            )}
        </div>
    );

    const initials = (user?.name || "")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join("") || "?";

    const roleLabel =
        user?.scope === "ADMIN" ? "Gestor" :
        user?.scope === "SECRETARY" ? "Secretária" :
        user?.scope === "PROFESSIONAL" ? "Profissional" :
        user?.scope === "ASSISTANT" ? "Assistente" : "";

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`${
                    sidebarOpen ? "w-64" : "w-16"
                } bg-white border-r border-gray-100 flex flex-col transition-all duration-300 overflow-hidden`}
            >
                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-4 h-20 min-w-0 border-b border-gray-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            <img
                                src="/assets/icone_menu/icone.png"
                                alt="icone"
                                className="w-6 h-6 object-contain"
                            />
                        </div>
                        {sidebarOpen && (
                            <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">
                                <span className="text-gray-800">GERENC</span>
                                <span className="text-primary">IA</span>
                            </h1>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1.5 rounded-full hover:bg-primary/5 text-primary shrink-0 transition-colors"
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
                <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
                    <Link
                        to="/"
                        className={navLinkClass("home")}
                        onClick={() => setActiveMenu("home")}
                        title="Página Inicial"
                    >
                        <Home size={20} className={`shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                        {sidebarOpen && <span>Página Inicial</span>}
                    </Link>

                    {(user?.scope === "PROFESSIONAL" || user?.scope === "ADMIN") && (
                        <Link
                            to="/agenda"
                            className={navLinkClass("agenda")}
                            onClick={() => setActiveMenu("agenda")}
                            title={user?.scope === "ADMIN" ? "Agenda Geral" : "Minha Agenda"}
                        >
                            <CalendarClock size={20} className={`shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                            {sidebarOpen && <span>{user?.scope === "ADMIN" ? "Agenda Geral" : "Minha Agenda"}</span>}
                        </Link>
                    )}

                    {user?.scope === "ADMIN" && (
                        <NavGroup id="admin" icon={Users} label="Administração">
                            <Link to="/usuarios" className={subLinkClass} onClick={() => setActiveMenu("users")}>
                                Gerenciar Usuários
                            </Link>
                            <Link to="/aniversariantes" className={subLinkClass} onClick={() => setActiveMenu("birthdays")}>
                                Aniversariantes
                            </Link>
                        </NavGroup>
                    )}

                    {/* MENU PACIENTES */}
                    {(user?.scope === "SECRETARY" || user?.scope === "ADMIN") && (
                        <NavGroup id="patients" icon={User} label="Pacientes">
                            <Link to="/pacientes" className={subLinkClass} onClick={() => setActiveMenu("pacientes")}>
                                Cadastrar paciente
                            </Link>
                            <Link to="/anamnese" className={subLinkClass} onClick={() => setActiveMenu("anamnese")}>
                                Encaminhar anamnese
                            </Link>
                            <Link to="/anamnese/modelo" className={subLinkClass} onClick={() => setActiveMenu("modelos")}>
                                Modelos de Anamnese
                            </Link>
                            <Link to="/contrato" className={subLinkClass} onClick={() => setActiveMenu("contrato")}>
                                Contrato
                            </Link>
                            <Link to="/contrato/modelo" className={subLinkClass} onClick={() => setActiveMenu("contrato-modelo")}>
                                Modelos de Contrato
                            </Link>
                            {user?.scope === "ADMIN" && (
                                <Link to="/paciente/encaminhar" className={subLinkClass} onClick={() => setActiveMenu("encaminhar")}>
                                    Encaminhar paciente
                                </Link>
                            )}
                        </NavGroup>
                    )}

                    {(user?.scope === "PROFESSIONAL" || user?.scope === "ADMIN") && (
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

                    {/* MENU FICHAS DE ATENDIMENTO */}
                    {(user?.scope === "PROFESSIONAL" || user?.scope === "ADMIN") && (
                        <NavGroup id="fichas" icon={ClipboardList} label="Fichas/Atendimento">
                            <Link to="/atividades" className={subLinkClass} onClick={() => setActiveMenu("atividades")}>
                                Banco de Atividades
                            </Link>
                            <Link to="/fichas/modelo" className={subLinkClass} onClick={() => setActiveMenu("fichas-modelo")}>
                                Modelos de Ficha
                            </Link>
                            <Link to="/fichas/historico" className={subLinkClass} onClick={() => setActiveMenu("fichas-historico")}>
                                Fichas por Paciente
                            </Link>
                        </NavGroup>
                    )}

                    {/* MENU FINANCEIRO */}
                    {(user?.scope === "SECRETARY" || user?.scope === "ADMIN") && (
                        <NavGroup id="financeiro" icon={DollarSign} label="Financeiro">
                            <Link to="/financeiro" className={subLinkClass} onClick={() => setActiveMenu("financeiro")}>
                                Cobranças
                            </Link>
                            <Link to="/financeiro/despesas" className={subLinkClass} onClick={() => setActiveMenu("financeiro")}>
                                Despesas
                            </Link>
                            <Link to="/financeiro/relatorio" className={subLinkClass} onClick={() => setActiveMenu("financeiro")}>
                                Dashboard Financeiro
                            </Link>
                            {user?.scope === "ADMIN" && (
                                <Link to="/financeiro/configuracao" className={subLinkClass} onClick={() => setActiveMenu("financeiro")}>
                                    Configurações
                                </Link>
                    {/* MENU FINANCEIRO — exclusivo do ADMIN */}
                    {user?.scope === "ADMIN" && (
                        <div>
                            <button
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                                    activeMenu === "financeiro" ? "bg-blue-50 text-blue-600" : ""
                                }`}
                                onClick={() => setOpenFinanceiroSubMenu(!openFinanceiroSubMenu)}
                                title="Financeiro"
                            >
                                <div className="flex items-center">
                                    <DollarSign size={20} className={`shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                                    {sidebarOpen && <span>Financeiro</span>}
                                </div>
                                {sidebarOpen && (
                                    <ChevronDown
                                        size={18}
                                        className={`transform transition-transform ${
                                            openFinanceiroSubMenu ? "rotate-180" : ""
                                        }`}
                                    />
                                )}
                            </button>

                            {openFinanceiroSubMenu && sidebarOpen && (
                                <div className="ml-8 mt-1 space-y-1">
                                    <Link
                                        to="/financeiro"
                                        className="block p-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                        onClick={() => setActiveMenu("financeiro")}
                                    >
                                        Cobranças
                                    </Link>
                                    <Link
                                        to="/financeiro/despesas"
                                        className="block p-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                        onClick={() => setActiveMenu("financeiro")}
                                    >
                                        Despesas
                                    </Link>
                                    <Link
                                        to="/financeiro/relatorio"
                                        className="block p-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                        onClick={() => setActiveMenu("financeiro")}
                                    >
                                        Dashboard Financeiro
                                    </Link>
                                    {user?.scope === "ADMIN" && (
                                        <Link
                                            to="/financeiro/configuracao"
                                            className="block p-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                            onClick={() => setActiveMenu("financeiro")}
                                        >
                                            Configurações
                                        </Link>
                                    )}
                                </div>
                            )}
                        </NavGroup>
                    )}
                </nav>
            </aside>

            {/* Conteúdo principal */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-end px-6 sm:px-8 sticky top-0 z-30">
                    <div className="relative" ref={userDropdownRef}>
                        <button
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm shadow-primary/20">
                                {initials}
                            </div>
                            <span className="text-left hidden sm:block">
                                <span className="flex items-center gap-1 text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">
                                    {user?.name}
                                    <ChevronDown
                                        size={14}
                                        className={`text-gray-400 transition-transform ${
                                            showUserDropdown ? "rotate-180" : ""
                                        }`}
                                    />
                                </span>
                                <span className="block text-xs text-gray-400">{roleLabel}</span>
                            </span>
                        </button>

                        {showUserDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{roleLabel}</p>
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