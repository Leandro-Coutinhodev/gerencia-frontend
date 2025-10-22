import React from "react";
import styles from "./Navbar.module.css";

function Navbar({ onSelectView }) {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.title}>Painel do Administrador</h1>
      <div>
        <button onClick={() => onSelectView("listar")}>Listar Usuários</button>
        <button onClick={() => onSelectView("cadastrar")}>Cadastrar Usuário</button>
      </div>
    </nav>
  );
}

export default Navbar;