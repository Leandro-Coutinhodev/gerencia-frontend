import React, { useEffect, useState } from "react";
import styles from "./Home.module.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import UserList from "../../components/userlist/UserList";
import CadastroUsuarios from "../../components/cadastrousuarios/CadastroUsuarios";
import UsuariosService from "../../services/UsuariosService";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEdicao, setUsuarioEdicao] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        UsuariosService.listar().then(setUsuarios).catch(console.error);
      } catch (err) {
        console.error("Token inválido");
      }
    } else {
      alert("Necessário autenticar!");
      navigate("/", {replace: true});
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
  var result = window.confirm("Deseja encerrar a sessão?");
      if(result){
      localStorage.removeItem("token");
      navigate("/");
  }
};


  return (
    <div className={styles.page}>
      {user ? (
        <>
          <header className={styles.header}>
            <img
              className={styles.avatar}
              src={`http://localhost:8080/api-gateway/gerencia/user/${user.sub}/photo`}
              alt="Foto de perfil"
              onError={(e) => (e.target.style.display = "none")}
            />
            <div>
              <h2 className={styles.username}>{user.name}</h2>
              <p className={styles.role}>Permissão: {user.scope}</p>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
          </header>

          <main className={styles.main}>
            {user.scope.includes("ADMIN") ? (
              <>
                <UserList
                  usuarios={usuarios}
                  setUsuarios={setUsuarios}
                  setUsuarioEdicao={setUsuarioEdicao}
                />

                <CadastroUsuarios
                setUsuarios={setUsuarios}
                usuarioEdicao={usuarioEdicao}
                limparEdicao={() => setUsuarioEdicao(null)}
              />

              </>
            ) : (
              <>
                <h1>Bem-vindo ao GerencIA!</h1>
                <p>Você está logado como <strong>{user.name}</strong>.</p>
              </>
            )}
          </main>
        </>
      ) : (
        <p className={styles.loading}>Carregando...</p>
      )}
    </div>
  );
}

export default Home;
