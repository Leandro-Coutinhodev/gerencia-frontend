import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import PatientsService from "../../services/PatientsService";
import CadastroPacientesModal from "../../modal/cadastropacientesmodal/CadastroPacientesModal";
import Alert from "../../components/alert/Alert";
import ConfirmDialog from "../../components/confirm/ConfirmDialog";

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [alert, setAlert] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const fetchPatients = async () => {
    try {
      const data = await PatientsService.listar();
      setPatients(data);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

 const handleSave = async (patientData) => {
  try {
    if (editPatient) {
      await PatientsService.atualizar(editPatient.id, patientData);
      setAlert({ type: "success", message: "Paciente atualizado com sucesso!" });
    } else {
      await PatientsService.cadastrar(patientData);
      setAlert({ type: "success", message: "Paciente salvo com sucesso!" });
    }

    fetchPatients();
    setModalOpen(false);
    setEditPatient(null);
  } catch (error) {
    console.error("Erro detalhado da API:", error.response); // <<< ADICIONE ESTA LINHA
      console.log(patientData);
    // Extrai uma mensagem mais útil, se disponível
    const errorMessage = error.response?.data?.message || "Erro ao salvar paciente.";
    setAlert({ type: "error", message: errorMessage });
  }
};

  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!patientToDelete) return;

    try {
      await PatientsService.deletar(patientToDelete.id);
      fetchPatients();
      setAlert({ type: "success", message: "Paciente excluído com sucesso!" });
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao excluir paciente." });
    } finally {
      setConfirmOpen(false);
      setPatientToDelete(null);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Carregando pacientes...</p>;
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
        Página Inicial <span className="mx-1">{">"}</span> Pacientes
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Pacientes Cadastrados</h2>
        <button
          className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition"
          onClick={() => setModalOpen(true)}
        >
          + Cadastrar Paciente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600">
              <th className="py-2 px-4 text-primary">Nome</th>
              <th className="py-2 px-4 text-primary">CPF</th>
              <th className="py-2 px-4 text-primary">Data de Nascimento</th>
              <th className="py-2 px-4 text-primary">Responsável</th>
              <th className="py-2 px-4 text-primary">Telefone</th>
              <th className="py-2 px-4 text-center text-primary">Ações</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4">{patient.name}</td>
                  <td className="py-2 px-4">{patient.cpf}</td>
                  <td className="py-2 px-4">
                    {new Date(patient.dateBirth).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-2 px-4">{patient.guardian?.name || "-"}</td>
                  <td className="py-2 px-4">{patient.guardian?.phoneNumber1 || "-"}</td>
                  <td className="py-2 px-4 flex justify-center gap-3">
                    <button className="text-primary hover:text-blue-800">
                      <Eye size={18} />
                    </button>
                    <button
                      className="text-primary"
                      onClick={() => {
                        setEditPatient(patient);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="text-primary hover:text-blue-800"
                      onClick={() => handleDeleteClick(patient)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  Nenhum paciente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CadastroPacientesModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditPatient(null);
        }}
        onSave={handleSave}
        initialData={editPatient}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Excluir Paciente"
        message={
          patientToDelete
            ? `Tem certeza que deseja excluir o paciente ${patientToDelete.name}?`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default PatientList;
