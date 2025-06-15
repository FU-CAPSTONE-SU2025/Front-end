
import NotFound from "../pages/notfound";
import { protectedLoader } from "../components/protectedRoute";
import Login from "../pages/common/login";
import AccountPage from "../pages/admin/account";
import StudentsPage from "../pages/admin/students";
import StaffPage from "../pages/admin/staff";
import AdvisorsPage from "../pages/admin/advisors";
import ManagersPage from "../pages/admin/managers";
import LogsPage from "../pages/admin/logs";
import ImportPage from "../pages/admin/import";
import Dashboard from "../pages/student/dashboard";
import { createBrowserRouter } from "react-router";
import StudentLayout from "../components/student/layout";
import AdminLayout from "../components/admin/adminLayout";
import BookingPage from "../pages/student/bookingAdvisor";
import ResourceExplorer from "../pages/student/resourceExplorer";

export const routes = createBrowserRouter([
  // Usage: 
  // protectedLoader is used to protect routes based on user roles.
  // The first argument is an array of allowed roles.
  // If the user does not have the required role, they will be redirected to the login page or a 404 page.
  // Example: protectedLoader(['1', '2']) means only users with roles '1' or '2' can access the route.
  {
    path: "/admin",
    Component: AdminLayout,
    loader: protectedLoader(['1','2']),
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
        Component: Dashboard,
      },
      {
        path: "bookingAdvisor",
        Component: BookingPage,
      },
      {
        path: "resourceExplorer",
        Component: ResourceExplorer,
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