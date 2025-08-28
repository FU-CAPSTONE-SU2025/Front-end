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
import SyllabusDetail from '../pages/student/syllabusDetail';
import StaffProfile from "../pages/staff/profile";
import StaffLayout from "../components/staff/staffLayout";
import ManagerLayout from "../components/manager/managerLayout";
import ManagerProfile from "../pages/manager/profile";
import CurriculumPageManager from '../pages/manager/curriculum';
import ComboPage from "../pages/manager/comboPage";
import ManagerProgramPage from "../pages/manager/program";
import StaffTranscript from "../pages/staff/transcript";
import CurriculumPage from "../pages/staff/curriculum";
import ProgramPage from "../pages/staff/program";
import EditData from "../pages/staff/editData";
import CurriculumDetail from '../pages/manager/curriculumDetail';
import ComboDetail from '../pages/manager/comboDetail';
import ManagerSubjectPage from '../pages/manager/subject';
import ManagerSubjectDetail from '../pages/manager/subjectDetail';
import EditStudentTranscript from "../pages/staff/editStudentTranscript";
import SubjectPage from "../pages/staff/subject";
import SubjectSyllabus from "../pages/staff/subjectSyllabus";
import ManagerSubjectSyllabus from "../pages/manager/subjectSyllabus";
import ChatAI from "../pages/student/chatAI";
import AdvisorLayout from "../components/advisor/layout";
import AdvisorDashboard from "../pages/advisor/dashboard";
import WorkSchedule from "../pages/advisor/workSchedule";
import LeaveSchedulePage from "../pages/advisor/leaveschedule";
import SubjectVersionPage from "../pages/staff/subjectVersion";
import ManagerSubjectVersionPage from "../pages/manager/viewSubjectVersion";
import StudentInCoursePage from "../pages/manager/studentInCoursePage";
import HistoryMeeting from "../pages/student/historyMeeting";
import MeetingPage from "../pages/advisor/meetingPage";
import BackgroundWrapper from "../components/common/backgroundWrapper";
import StudentOverview from "../pages/advisor/studentOverview";
import StudentDetail from "../pages/advisor/studentDetail";


export const routes = createBrowserRouter([
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
        path: "myMeetings",
        Component: HistoryMeeting,
      },
      {
        path: "courseTracking",
        Component: CourseTracking,
      },
      {
        path: 'subject-details/:id',
        Component: SubjectDetails,
      },
      {
        path: "syllabus/:id",
        Component: SyllabusDetail,
      },
      {
        path: "semesterPlanner",
        Component: SemesterPlanner,
      },
      {
        path: "semesterPlanner/:roadmap",
        Component: SemesterPlannerDetail,
      },
      {
        path: "chat-ai",
        Component: ChatAI,
      },
   
    ],
  },
  {
    path: "/staff",
    Component: StaffLayout, 
    loader: protectedLoader(['2']),
    children:[
      {
        index: true,
        Component: StaffProfile, 
      },
      {
        path: "transcript",
        Component: StaffTranscript,
      },
      {
        path: "editStudentTranscript/:studentId",
        Component: EditStudentTranscript,
      },
      {
        path: "syllabus",
        Component: Dummy, 
      },
      {
        path: "subjects",
        Component: SubjectPage, 
      },
      {
         path: "programs",
        Component: ProgramPage, 
      },
      {
         path: "curriculums",
        Component: CurriculumPage, 
      },
      {
        path: "editData/:type/:id?",
        Component: EditData, 
      },
      {
        path: "subject/:subjectId/syllabus/:syllabusId?",
        Component: SubjectSyllabus,
      },
      {
        path: "subject/:subjectId/version",
        Component: SubjectVersionPage,
      },
      
    ]

  },
   {
    path: "/advisor",
    Component: AdvisorLayout,
    loader: protectedLoader(['3']),
    children:[
      {
        index: true,
        Component: AdvisorDashboard,
      },
      {
        path: "workSchedule",
        Component: WorkSchedule,
      },
      {
        path: "leaveSchedule",
        Component: LeaveSchedulePage,
      },
      {
        path: "meeting",
        Component: MeetingPage,
      },
      {
        path: "studentOverview",
        Component: StudentOverview,
      },
      {
        path: "studentDetail/:id",
        Component: StudentDetail,
      },
    ]
  },
   {
    path: "/manager",
    Component: ManagerLayout,
    loader: protectedLoader(['4']),
    children:[
      {
        path: "studentInCourse",
        Component: StudentInCoursePage,
      },
      {
        path: "curriculum",
        Component: CurriculumPageManager,
      },
      {
        index: true,
        Component: ManagerProfile,
      },
      {
        path: "program",
        Component: ManagerProgramPage,
      },
      {
        path: "combo",
        Component: ComboPage,
      },
      {
        path: "curriculum/:id",
        Component: CurriculumDetail,
      },
      {
        path: "combo/:id",
        Component: ComboDetail,
      },
      {
        path: "subject",
        Component: ManagerSubjectPage,
      },
      {
        path: "subject/:id",
        Component: ManagerSubjectDetail,
      },
      {
        path: "subject/:subjectId/version",
        Component: ManagerSubjectVersionPage,
      },
      {
        path: "subject/:subjectId/syllabus/:syllabusId?",
        Component: ManagerSubjectSyllabus,
      },
      {
        path: "student-monitoring",
        Component: StudentInCoursePage,
      },

    ]
  },
  {
    path: "/",
    Component: BackgroundWrapper,
    children:[
      {
        index:true,
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
      {
        path: "*",
        Component: NotFound,
      }
    ]
  },
 
]); 