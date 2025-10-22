import React, { useEffect } from "react";
import styles from "./UserList.module.css";
import UsuariosService from "../../services/UsuariosService";

function UserList({ usuarios, setUsuarios, setUsuarioEdicao }) {
  useEffect(() => {
    UsuariosService.listar()
      .then(setUsuarios)
      .catch((err) => console.error("Erro ao listar usuários:", err));
  }, [setUsuarios]);

  const handleExcluir = async (usuario) => {
  const confirmacao = window.confirm(`Deseja realmente excluir ${usuario.name}?`);
  if (!confirmacao) return;

  const tipo = usuario.roles?.[0]?.name?.toLowerCase(); // admin, assistant, etc.

  try {
    await UsuariosService.deletar(tipo, usuario.id);
    const atualizados = await UsuariosService.listar();
    setUsuarios(atualizados);
    alert("Usuário excluído com sucesso.");
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir usuário.");
  }
};

  return (
    <div className={styles.container}>
      <h2>Usuários Cadastrados</h2>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nome</th>
            <th>CPF</th>
            <th>Email</th>
            <th>Permissão</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>
                <img
                  src={`http://localhost:8080/api-gateway/gerencia/user/${u.id}/photo`}
                  alt="Foto"
                  className={styles.foto}
                  onError={(e) => (e.target.style.display = "none")}
                />
              </td>
              <td>{u.name}</td>
              <td>{u.cpf}</td>
              <td>{u.email}</td>
              <td>{u.roles.map((r) => (
                r.name
              ))}</td>
              <td><button onClick={() => setUsuarioEdicao(u)}>Editar</button>
                <button style={{ backgroundColor: "#ff4d4d"}} onClick={() => handleExcluir(u)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
