import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import UsuariosService from "../../services/UsuariosService";
import CadastroUsuariosModal from "../../modal/cadastrousuariosmodal/CadastroUsuariosModal";
import Alert from "../../components/alert/Alert";
import ConfirmDialog from "../../components/confirm/ConfirmDialog";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // <--- faltava isso

  const fetchUsers = async () => {
    try {
      const data = await UsuariosService.listar();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (formData) => {
    try {
      const role = formData.get("role");

      if (editUser) {
        let userType;

        if (editUser.roles && editUser.roles.length > 0) {
          if (typeof editUser.roles[0] === "object") {
            userType = editUser.roles[0].name.toLowerCase();
          } else {
            userType = editUser.roles[0].toLowerCase();
          }
        } else {
          userType = role.toLowerCase();
        }

        await UsuariosService.atualizar(userType, editUser.id, formData);
        setAlert({ type: "success", message: "Usuário atualizado com sucesso!" });
      } else {
        await UsuariosService.cadastrar(role.toLowerCase(), formData);
        setAlert({ type: "success", message: "Usuário salvo com sucesso!" });
      }

      fetchUsers();
      setModalOpen(false);
      setEditUser(null);
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao salvar usuário." });
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      let userType;

      if (userToDelete.roles && userToDelete.roles.length > 0) {
        if (typeof userToDelete.roles[0] === "object") {
          userType = userToDelete.roles[0].name.toLowerCase();
        } else {
          userType = userToDelete.roles[0].toLowerCase();
        }
      } else {
        userType = "user";
      }

      await UsuariosService.deletar(userType, userToDelete.id);
      fetchUsers();
      setAlert({ type: "success", message: "Usuário excluído com sucesso!" });
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao excluir usuário." });
    } finally {
      setConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Carregando usuários...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {alert && (
        <div className="flex justify-center mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            duration={4000}
          />
        </div>
      )}

      <div className="text-sm text-gray-500 mb-4">
        Página Inicial <span className="mx-1">{">"}</span> Gerenciar Usuários
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Usuários Cadastrados</h2>
        <button
          className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition"
          onClick={() => setModalOpen(true)}
        >
          + Cadastrar Usuário
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600">
              <th className="py-2 px-4 text-primary">Nome</th>
              <th className="py-2 px-4 text-primary">CPF</th>
              <th className="py-2 px-4 text-primary">E-mail</th>
              <th className="py-2 px-4 text-primary">Permissão</th>
              <th className="py-2 px-4 text-center text-primary">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.cpf}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">
                    {user.roles &&
                      user.roles
                        .map((r) => (typeof r === "object" ? r.name : r))
                        .join(", ")}
                  </td>
                  <td className="py-2 px-4 flex justify-center gap-3">
                    <button className="text-primary hover:text-blue-800">
                      <Eye size={18} />
                    </button>
                    <button
                      className="text-primary"
                      onClick={() => {
                        setEditUser(user);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="text-primary hover:text-blue-800"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CadastroUsuariosModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditUser(null);
        }}
        onSave={handleSave}
        initialData={editUser}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Excluir Usuário"
        message={
          userToDelete
            ? `Tem certeza que deseja excluir o usuário ${userToDelete.name}?`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default UserList;
