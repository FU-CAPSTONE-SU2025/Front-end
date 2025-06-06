
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

import { Home } from "../pages/student/home";
import { createBrowserRouter } from "react-router";
import StudentLayout from "../components/student/layout";

export const routes = createBrowserRouter([
  {
    path: "/admin",
    Component: AdminNavBar,
    loader: protectedLoader(['admin']),
    children: [
      {
        index: true,
        Component: AccountPage,
      },
      {
        path: "students",
        Component: StudentsPage,
      },
      {
        path: "staff",
        Component: StaffPage,
      },
      {
        path: "advisors",
        Component: AdvisorsPage,
      },
      {
        path: "managers",
        Component: ManagersPage,
      },
      {
        path: "logs",
        Component: LogsPage,
      },
      {
        path: "import",
        Component: ImportPage,
      },
    ],
  },
  {
    path: "/student",
    Component: StudentLayout, 
    loader: protectedLoader(['student']),
    children: [
      {
        index: true,
        Component: Home,
      },
    ],
  },
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/404",
    Component: NotFound,
  },
]);