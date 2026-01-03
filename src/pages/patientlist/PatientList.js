import { useEffect, useState, useRef } from "react";
import { Eye, Pencil, Trash2, ChevronDown, UserPlus, Link2, Check } from "lucide-react";
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const dropdownRef = useRef(null);

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

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
      console.error("Erro detalhado da API:", error.response);
      console.log(patientData);
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
      setAlert({ type: "error", message: "Erro ao excluir paciente(Este paciente pode ter registros associados)." });
    } finally {
      setConfirmOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleCopyLink = () => {
    const link = "http://localhost:3000/form-cadastro-paciente";
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setShowDropdown(false);
      setAlert({ type: "success", message: "Link copiado para a área de transferência!" });
      
      // Reset do ícone após 2 segundos
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    }).catch((err) => {
      console.error("Erro ao copiar link:", err);
      setAlert({ type: "error", message: "Erro ao copiar link." });
    });
  };

  const handleManualRegister = () => {
    setShowDropdown(false);
    setModalOpen(true);
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
        
        {/* Dropdown Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition flex items-center gap-2"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            + Cadastrar Paciente
            <ChevronDown 
              size={18} 
              className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={handleManualRegister}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center gap-3 text-gray-700"
              >
                <UserPlus size={20} className="text-primary" />
                <div>
                  <div className="font-medium">Cadastro Manual</div>
                  <div className="text-xs text-gray-500">Preencher formulário agora</div>
                </div>
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center gap-3 text-gray-700"
              >
                {linkCopied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Link2 size={20} className="text-primary" />
                )}
                <div>
                  <div className="font-medium">Link Público</div>
                  <div className="text-xs text-gray-500">Copiar link do formulário</div>
                </div>
              </button>
            </div>
          )}
        </div>
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