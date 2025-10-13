import { BrowserRouter as Router, Routes } from 'react-router-dom';
import routeConfig, {generateRoutes} from './routes/routeConfig';
import GlobalAlert from './components/globalalert/GlobalAlert';


function App() {
  return (
    <>
     <Router>
      <Routes>{generateRoutes(routeConfig)}</Routes>
    </Router>
    <GlobalAlert/>
  </>
  );
}

export default App;
