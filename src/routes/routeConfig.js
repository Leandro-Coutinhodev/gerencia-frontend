import { Route } from "react-router-dom";
import Login from "../pages/login/Login";
import Home from "../pages/home/Home";


    const routeConfig = [
        {
            path: '/',
            element: <Login/>
        },
        {
            path: '/home',
            element: <Home/>
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