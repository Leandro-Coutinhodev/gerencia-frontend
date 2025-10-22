import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import LoginService from "../../services/LoginService";

function Login() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    
    const token = await LoginService.login(cpf, password);
    console.log("Autenticado com token:", token);
    navigate("/home");
  } catch (error) {
    alert("Login falhou. Verifique suas credenciais.");
  }
};


  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Login</h2>

        <input
          className={styles.input}
          type="text"
          placeholder="Cpf"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          required
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className={styles.button}>
          Entrar
        </button>

        <p className={styles.link}>
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
