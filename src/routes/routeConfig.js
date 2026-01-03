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
import GenerateContract from "../pages/contract/generatecontract/GenerateContract";
import ContractsList from "../pages/contract/contractslist/ContractsList";
import CadastroPacientePublico from "../pages/cadastropacientepublico/CadastroPacientePublico";


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
      element: <ContractsList />
    },
    {
      path: '/contrato/criar',
      element: <GenerateContract />
    }]
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
    element: <CadastroPacientePublico/>
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