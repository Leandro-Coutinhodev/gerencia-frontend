import React, { useEffect, useState } from "react";
import styles from "./CadastroUsuarios.module.css";
import UsuariosService from "../../services/UsuariosService";

function CadastroUsuarios({ setUsuarios, usuarioEdicao = null, limparEdicao }) {
  const [tipo, setTipo] = useState("admin");
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    phoneNumber: "",
    password: "",
    dateBirth: "",
    photo: null,
    position: "",
    professionalLicense: "",
  });

  const nomeTipos = {
    admin: "Administrador",
    secretary: "Secretário(a)",
    professional: "Profissional",
    assistant: "Auxiliar",
  };

  useEffect(() => {
  if (usuarioEdicao) {
    const roleName = usuarioEdicao.roles?.[0]?.name?.toLowerCase() || "admin";
    setTipo(roleName);

    setFormData({
      name: usuarioEdicao.name || "",
      cpf: usuarioEdicao.cpf || "",
      email: usuarioEdicao.email || "",
      phoneNumber: usuarioEdicao.phoneNumber || "",
      password: "",
      dateBirth: usuarioEdicao.dateBirth
        ? new Date(usuarioEdicao.dateBirth).toISOString().split("T")[0]
        : "",
      photo: null,
      position: usuarioEdicao.position || "",
      professionalLicense: usuarioEdicao.professionalLicense || "",
    });
  }
}, [usuarioEdicao]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });

    try {
      let response;
      if (usuarioEdicao) {
        response = await UsuariosService.atualizar(tipo, usuarioEdicao.id, form);
        alert("Usuário atualizado com sucesso!");
        limparEdicao();
      } else {
        response = await UsuariosService.cadastrar(tipo, form);
        alert("Usuário cadastrado com sucesso!");
      }

      e.target.reset();
      const listaAtualizada = await UsuariosService.listar();
      setUsuarios(listaAtualizada);
      setFormData({
        name: "",
        cpf: "",
        email: "",
        phoneNumber: "",
        password: "",
        dateBirth: "",
        photo: null,
        position: "",
        professionalLicense: "",
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar usuário.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>{usuarioEdicao ? "Editar" : "Cadastrar"} {nomeTipos[tipo]}</h2>

      <label>Tipo de usuário:</label>
      <select onChange={(e) => setTipo(e.target.value)} value={tipo}>
        <option value="admin">Administrador</option>
        <option value="professional">Profissional</option>
        <option value="secretary">Secretário(a)</option>
        <option value="assistant">Auxiliar</option>
      </select>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <input name="name" placeholder="Nome completo" value={formData.name} onChange={handleChange} required />
        <input name="cpf" placeholder="CPF" value={formData.cpf} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="phoneNumber" placeholder="Telefone" value={formData.phoneNumber} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Senha" value={formData.password} onChange={handleChange} required={!usuarioEdicao} />
        <input name="dateBirth" type="date" value={formData.dateBirth} onChange={handleChange} required />
        <input name="photo" type="file" accept="image/*" onChange={handleChange} />

        {tipo === "assistant" && (
          <input name="position" placeholder="Função" value={formData.position} onChange={handleChange} required />
        )}
        {tipo === "professional" && (
          <input name="professionalLicense" placeholder="Registro profissional" value={formData.professionalLicense} onChange={handleChange} required />
        )}

        <button type="submit">{usuarioEdicao ? "Atualizar" : "Cadastrar"}</button>
        {usuarioEdicao && <button type="button" onClick={limparEdicao}>Cancelar</button>}
      </form>
    </div>
  );
}

export default CadastroUsuarios;
