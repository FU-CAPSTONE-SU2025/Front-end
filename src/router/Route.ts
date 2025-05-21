import { createBrowserRouter } from "react-router";

import Dummy from "../pages/dummy";
import NotFound from "../pages/notfound";
import { protectedLoader } from "../components/protectedRoute";
import Login from "../pages/common/login";

export const routes = createBrowserRouter([
    {
        path:"/admin",
        Component: Dummy,
        loader: protectedLoader(['admin']), 
        // Loader make sure the custom Role-checking function is called 
        // and execute before running the Routes, including children routes
        // If authorize is false. No more routing
        children:[
            {
                index:true,
                Component: Dummy,
            },
            {
                path:"job",
                Component:Dummy
            },
            {
                path:"job/:id",
                Component:Dummy
            },
            {
                path:"profile/:id",
                Component:Dummy
            }
        ]
    },
    {
        // index:true,
        // Component: LandingPage,
    },
    {
        path:"/",
        Component: Login,
    },
    {
        // path:"/login",
        // Component: Login,
    },
    {
        // path: "/register",
        // Component: Register,
    },
    {
        path:'/404',
        Component:NotFound
    }

  
]);

