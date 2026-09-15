import { Route } from "react-router-dom";
import Login from "../pages/login/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import UserList from "../pages/userlist/UserList";
import Home from "../pages/home/Home";
import PatientList from "../pages/patientlist/PatientList";
import AnamneseForm from "../pages/anamnesis/anamnesisform/AnamnesisForm";
import AnamnesesList from "../pages/anamnesis/anamnesislist/AnamnesisList";
import AnamnesisList from "../pages/anamnesis/anamnesislist/AnamnesisList";
import AnamnesisHistory from "../pages/anamnesis/anamnesishistory/AnamnesisHistory";
import AnamnesisForm from "../pages/anamnesis/anamnesisform/AnamnesisForm";
import AnamnesisList2 from "../pages/anamnesis/anamnesislist/AnamnesisList2";
import AnamnesisSelectFields from "../pages/anamnesisselectedfields/AnamnesisSelectedFields";
import AnamnesisReferralHistory from "../pages/anamnesis/anamnesisreferralhistory/AnamnesisReferralHistory";
import RelatorioAnamnese from "../pages/relatorioanamnese/RelatorioAnamnese";
import VisualizarRelatorio from "../pages/anamnesis/visualizarrelatorio/VisualizarRelatorio";
import CadastroPacientePublico from "../pages/cadastropacientepublico/CadastroPacientePublico";
import ContractSigningPage from "../pages/contractsigningpage/ContractSigningPage";
import ForgotPassword from "../pages/forgotpassword/ForgotPassword";
import ResetPassword from "../pages/forgotpassword/ResetPassword";
import AnamnesisModelList from "../pages/anamnesis/anamnesismodellist/AnamnesisModelList";
import ContractTemplateEditor from "../pages/contract/contracttemplateeditor/ContractTemplateEditor";
import CreateContractModal from "../modal/createcontractmodal/CreateContractModal";
import ContractList from "../pages/contract/contractlist/ContractList";
import ContractTemplateList from "../pages/contract/contracttemplatelist/ContractTemplateList";
import { path } from "framer-motion/client";
import AniversariantesDoMes from "../pages/aniversariantesdomes/AniversariantesDoMes";
import CobrancaList from "../pages/financeiro/cobrancalist/CobrancaList";
import DespesaList from "../pages/financeiro/despesalist/DespesaList";
import DashboardFinanceiro from "../pages/financeiro/dashboardfinanceiro/DashboardFinanceiro";
import FinanceiroConfiguracao from "../pages/financeiro/financeiroconfiguracao/FinanceiroConfiguracao";


const routeConfig = [
  {
    path: '',
    element: <Dashboard />,
    children: [{
      path: '/',
      element: <Home />
    },
    {
      path: '/usuarios',
      element: <UserList />
    },
    {
      path: '/pacientes',
      element: <PatientList />
    },
    {
      path: '/anamnese',
      element: <AnamnesisList />
    },
    {
      path: '/anamnese/modelo',
      element: <AnamnesisModelList />

    },
    {
      path: '/anamnese/historico/:patientId',
      element: <AnamnesisHistory />
    },
    {
      path: '/anamnese/:anamneseid',
      element: <AnamnesisForm />
    },
    {
      path: '/anamnese/edit/:anamneseId',
      element: <AnamnesisForm />
    },
    {
      path: '/paciente/encaminhar',
      element: <AnamnesisList2 />
    },
    {
      path: '/paciente/selecionar/:anamneseid',
      element: <AnamnesisSelectFields />
    },
    {
      path: '/paciente/encaminhar/historico/:patientId',
      element: <AnamnesisReferralHistory />
    },
    {
      path: '/relatorios',
      element: <RelatorioAnamnese />
    },
    {
      path: '/relatorios/:referralId',
      element: <VisualizarRelatorio />
    },
    {
      path: '/contrato',
      element: <ContractList />
    },
    {
      path: '/contrato/modelo',
      element: <ContractTemplateList />
    },
    {
      path: '/contrato/modelo/novo',
      element: <ContractTemplateEditor />
    },
    {
      path: '/contrato/modelo/:id/editar',
      element: <ContractTemplateEditor />
    },
    {
      path: '/aniversariantes',
      element: <AniversariantesDoMes/>
    },
    {
      path: '/financeiro',
      element: <CobrancaList />
    },
    {
      path: '/financeiro/despesas',
      element: <DespesaList />
    },
    {
      path: '/financeiro/relatorio',
      element: <DashboardFinanceiro />
    },
    {
      path: '/financeiro/configuracao',
      element: <FinanceiroConfiguracao />
    }

    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/form-anamnese/:token',
    element: <AnamnesisForm />
  },
  {
    path: '/form-cadastro-paciente',
    element: <CadastroPacientePublico />
  },
  {
    path: '/contrato/:token',
    element: <ContractSigningPage />
  },
  {
    path: '/recuperar-senha',
    element: <ForgotPassword />
  },
  {
    path: '/restaurar-senha',
    element: <ResetPassword />
  }

]


export function generateRoutes(routes) {

  return routes.map(({ path, element, children, index }, i) => (
    <Route key={i} path={path} element={element} index={index}>
      {children && generateRoutes(children)}
    </Route>
  ));
}


export default routeConfig