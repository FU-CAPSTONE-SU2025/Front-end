import { createBrowserRouter } from "react-router";

import Dummy from "../pages/dummy";
import NotFound from "../pages/notfound";
import { protectedLoader } from "../components/protectedRoute";
import Login from "../pages/common/login";
import AdminNavBar from "../components/admin/adminNavBar";
import AccountPage from "../pages/admin/account";
import StudentsPage from "../pages/admin/students";
import StaffPage from "../pages/admin/staff";
import AdvisorsPage from "../pages/admin/advisors";
import ManagersPage from "../pages/admin/managers";
import LogsPage from "../pages/admin/logs";
import ImportPage from "../pages/admin/import";
import Header from "../components/student/header";
import { Home} from "../pages/student/home";

// Import new admin pages

export const routes = createBrowserRouter([
    {
        path:"/admin",
        Component: AdminNavBar,
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
                path:"account",
                Component: AccountPage
            },
            {
                path:"students",
                Component: StudentsPage
            },
            {
                path:"staff",
                Component: StaffPage
            },
            {
                path:"advisors",
                Component: AdvisorsPage
            },
            {
                path:"managers",
                Component: ManagersPage
            },
            {
                path:"logs",
                Component: LogsPage
            },
            {
                path:"import",
                Component: ImportPage
            }
        ]
    },
    {
        path:"/student",
        Component: Header,
        loader: protectedLoader(['student']), 
           children:[
            {
                index:true,
                Component: Home,
            },
          
        ]
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

