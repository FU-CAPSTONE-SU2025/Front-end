import { createBrowserRouter } from "react-router";

import Dummy from "../pages/dummy";
import NotFound from "../pages/notfound";

export const routes = createBrowserRouter([
    {
        // path:"/admin",
        // Component: AdminDashboard,
        // children:[
        //     {
        //         index:true,
        //         Component: HomePage,
        //     },
        //     {
        //         path:"job",
        //         Component:Stu
        //     },
        //     {
        //         path:"job/:id",
        //         Component:Staff
        //     },
        //     {
        //         path:"profile/:id",
        //         Component:Manager
        //     }
        // ]
    },
    { 
       
    },
    {
        // index:true,
        // Component: LandingPage,
    },
    {
        path:"/",
        Component: Dummy,
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

