import NotFound from "../pages/notfound";
import { protectedLoader } from "../components/protectedRoute";
import Login from "../pages/common/login";
import AccountPage from "../pages/admin/account";
import StudentsPage from "../pages/admin/students";
import StaffPage from "../pages/admin/staff";
import AdvisorsPage from "../pages/admin/advisors";
import ManagersPage from "../pages/admin/managers";
import LogsPage from "../pages/admin/logs";
import Dashboard from "../pages/student/dashboard";
import { createBrowserRouter } from "react-router";
import StudentLayout from "../components/student/layout";
import AdminLayout from "../components/admin/adminLayout";
import BookingPage from "../pages/student/bookingAdvisor";
import ResourceExplorer from "../pages/student/resourceExplorer";
import CourseTracking from "../pages/student/courseTracking";
import EditAccount from "../pages/admin/editAccount";
import SemesterPlanner from "../pages/student/semesterPlanner";
import SemesterPlannerDetail from "../pages/student/semesterPlannerDetail";
import ForgetPassword from "../pages/common/forgetPassword";
import Dummy from "../pages/dummy";
import SubjectDetails from '../pages/student/subjectDetails';
import StaffProfile from "../pages/staff/profile";
import StaffLayout from "../components/staff/staffLayout";
import ManagerLayout from "../components/manager/managerLayout";
import HomePage from '../pages/manager/home';

export const routes = createBrowserRouter([
  // Usage: 
  // protectedLoader is used to protect routes based on user roles.
  // The first argument is an array of allowed roles.
  // If the user does not have the required role, they will be redirected to the login page or a 404 page.
  // Example: protectedLoader(['1', '2']) means only users with roles '1' or '2' can access the route.
  {
    path: "/admin",
    Component: AdminLayout,
    loader: protectedLoader(['1']),
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
        path:"edit/:role/:id?",
        Component:EditAccount,
        
      },
      {
        path: "logs",
        Component: LogsPage,
      },
    ],
  },
  {
    path: "/student",
    Component: StudentLayout, 
    loader: protectedLoader(['5']),
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
      {
        path: "courseTracking",
        Component: CourseTracking,
      },
      {
        path: 'course-tracking/:subjectCode',
        Component: SubjectDetails,
      },
      {
        path: "semesterPlanner",
        Component: SemesterPlanner,
      },
      {
        path: "semesterPlanner/:id",
        Component: SemesterPlannerDetail,
      }
    ],
  },
  {
    path: "/staff",
    Component: StaffLayout, 
    loader: protectedLoader(['2']),
    children:[
      {
        index: true,
        Component: StaffProfile, // Replace with actual component for staff dashboard
      },
      {
        path: "transcript",
        Component: StaffProfile,
      },
      {
        path: "syllabus",
        Component: StaffProfile, 
      },
      {
        path: "subjects",
        Component: StaffProfile, 
      },
      {
         path: "programs",
        Component: StaffProfile, 
      },
      {
         path: "curriculums",
        Component: StaffProfile, 
      }
    ]

  },
   {
    path: "/advisor",
    Component: Dummy,
    loader: protectedLoader(['3']),
    children:[
      
    ]
  },
   {
    path: "/manager",
    Component: ManagerLayout,
    loader: protectedLoader(['4']),
    children:[
      {
        index: true,
        Component: Dummy,
      },
      {
        path: "home",
        Component: HomePage,
      }
    ]
  },
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/forgetpassword",
    Component: ForgetPassword,
  },
  {
    path: "/404",
    Component: NotFound,
  },
]); 