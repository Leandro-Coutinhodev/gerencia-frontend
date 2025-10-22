import { BrowserRouter as Router, Routes } from 'react-router-dom';
import routeConfig, {generateRoutes} from './routes/routeConfig';


function App() {
  return (
    <>
     <Router>
      <Routes>{generateRoutes(routeConfig)}</Routes>
    </Router>
  </>
  );
}

export default App;
