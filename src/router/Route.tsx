import  { lazy, Suspense } from "react";
import NotFound from "../pages/notfound";
import { protectedLoader } from "../components/protectedRoute";
import Login from "../pages/common/login";
import { createBrowserRouter } from "react-router";
import StudentLayout from "../components/student/layout";
import AdminLayout from "../components/admin/adminLayout";
import StaffLayout from "../components/staff/staffLayout";
import ManagerLayout from "../components/manager/managerLayout";
import AdvisorLayout from "../components/advisor/layout";
import BackgroundWrapper from "../components/common/backgroundWrapper";
import LoadingScreen from "../components/LoadingScreen";

// Lazy load all page components for code splitting
const AccountPage = lazy(() => import("../pages/admin/account"));
const StudentsPage = lazy(() => import("../pages/admin/students"));
const StaffPage = lazy(() => import("../pages/admin/staff"));
const AdvisorsPage = lazy(() => import("../pages/admin/advisors"));
const ManagersPage = lazy(() => import("../pages/admin/managers"));
const LogsPage = lazy(() => import("../pages/admin/logs"));
const Dashboard = lazy(() => import("../pages/student/dashboard"));
const BookingPage = lazy(() => import("../pages/student/bookingAdvisor"));
const ResourceExplorer = lazy(() => import("../pages/student/resourceExplorer"));
const CourseTracking = lazy(() => import("../pages/student/courseTracking"));
const EditAccount = lazy(() => import("../pages/admin/editAccount"));
const SemesterPlanner = lazy(() => import("../pages/student/semesterPlanner"));
const SemesterPlannerDetail = lazy(() => import("../pages/student/semesterPlannerDetail"));
const ForgetPassword = lazy(() => import("../pages/common/forgetPassword"));
const Dummy = lazy(() => import("../pages/dummy"));
const SubjectDetails = lazy(() => import('../pages/student/subjectDetails'));
const SyllabusDetail = lazy(() => import('../pages/student/syllabusDetail'));
const StaffProfile = lazy(() => import("../pages/staff/profile"));
const ManagerProfile = lazy(() => import("../pages/manager/profile"));
const CurriculumPageManager = lazy(() => import('../pages/manager/curriculum'));
const ComboPage = lazy(() => import("../pages/manager/comboPage"));
const ManagerProgramPage = lazy(() => import("../pages/manager/program"));
const StaffTranscript = lazy(() => import("../pages/staff/transcript"));
const CurriculumPage = lazy(() => import("../pages/staff/curriculum"));
const ProgramPage = lazy(() => import("../pages/staff/program"));
const EditData = lazy(() => import("../pages/staff/editData"));
const ComboDetail = lazy(() => import('../pages/manager/comboDetail'));
const ManagerSubjectPage = lazy(() => import('../pages/manager/subject'));
const ManagerSubjectDetail = lazy(() => import('../pages/manager/subjectDetail'));
const EditStudentTranscript = lazy(() => import("../pages/staff/editStudentTranscript"));
const SubjectPage = lazy(() => import("../pages/staff/subject"));
const ChatAI = lazy(() => import("../pages/student/chatAI"));
const JoinedSubjectsByCodePage = lazy(() => import("../pages/student/joinedSubjectsByCode"));
const AdvisorDashboard = lazy(() => import("../pages/advisor/dashboard"));
const WorkSchedule = lazy(() => import("../pages/advisor/workSchedule"));
const LeaveSchedulePage = lazy(() => import("../pages/advisor/leaveschedule"));
const SubjectVersionPage = lazy(() => import("../pages/staff/subjectVersion"));
const ManagerSubjectVersionPage = lazy(() => import("../pages/manager/viewSubjectVersion"));
const StudentInCoursePage = lazy(() => import("../pages/manager/studentInCoursePage"));
const HistoryMeeting = lazy(() => import("../pages/student/historyMeeting"));
const MeetingPage = lazy(() => import("../pages/advisor/meetingPage"));
const StudentOverview = lazy(() => import("../pages/advisor/studentOverview"));
const StudentDetail = lazy(() => import("../pages/advisor/studentDetail"));

// Loading component for Suspense fallback
const PageLoader = () => <LoadingScreen isLoading={true} message="Loading page..." />;

export const routes = createBrowserRouter([
  {
    path: "/admin",
    Component: AdminLayout,
    loader: protectedLoader(['1']),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <AccountPage />
          </Suspense>
        ),
      },
      {
        path: "students",
        element: (
          <Suspense fallback={<PageLoader />}>
            <StudentsPage />
          </Suspense>
        ),
      },
      {
        path: "staffs",
        element: (
          <Suspense fallback={<PageLoader />}>
            <StaffPage />
          </Suspense>
        ),
      },
      {
        path: "managers",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ManagersPage />
          </Suspense>
        ),
      },
      {
        path: "advisors",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdvisorsPage />
          </Suspense>
        ),
      },
      {
        path:"edit/:role/:id?",
        element: (
          <Suspense fallback={<PageLoader />}>
            <EditAccount />
          </Suspense>
        ),
      },
      {
        path: "logs",
        element: (
          <Suspense fallback={<PageLoader />}>
            <LogsPage />
          </Suspense>
        ),
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
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "bookingAdvisor",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BookingPage />
          </Suspense>
        ),
      },
      {
        path: "resourceExplorer",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ResourceExplorer />
          </Suspense>
        ),
      },
      {
        path: "myMeetings",
        element: (
          <Suspense fallback={<PageLoader />}>
            <HistoryMeeting />
          </Suspense>
        ),
      },
      {
        path: "courseTracking",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CourseTracking />
          </Suspense>
        ),
      },
      {
        path: 'subject-details/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SubjectDetails />
          </Suspense>
        ),
      },
      {
        path: "syllabus/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <SyllabusDetail />
          </Suspense>
        ),
      },
      {
        path: "semesterPlanner",
        element: (
          <Suspense fallback={<PageLoader />}>
            <SemesterPlanner />
          </Suspense>
        ),
      },
      {
        path: "semesterPlanner/:roadmapId",
        element: (
          <Suspense fallback={<PageLoader />}>
            <SemesterPlannerDetail />
          </Suspense>
        ),
      },
      {
        path: "chat-ai",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChatAI />
          </Suspense>
        ),
      },
      {
        path: "joined-subjects-by-code",
        element: (
          <Suspense fallback={<PageLoader />}>
            <JoinedSubjectsByCodePage />
          </Suspense>
        ),
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
        element: (
          <Suspense fallback={<PageLoader />}>
            <StaffProfile />
          </Suspense>
        ),
      },
      {
        path: "transcript",
        element: (
          <Suspense fallback={<PageLoader />}>
            <StaffTranscript />
          </Suspense>
        ),
      },
      {
        path: "editStudentTranscript/:studentId",
        element: (
          <Suspense fallback={<PageLoader />}>
            <EditStudentTranscript />
          </Suspense>
        ),
      },
      {
        path: "syllabus",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dummy />
          </Suspense>
        ),
      },
      {
        path: "subjects",
        element: (
          <Suspense fallback={<PageLoader />}>
            <SubjectPage />
          </Suspense>
        ),
      },
      {
         path: "programs",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProgramPage />
          </Suspense>
        ),
      },
      {
         path: "curriculums",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CurriculumPage />
          </Suspense>
        ),
      },
      {
        path: "editData/:type/:id?",
        element: (
          <Suspense fallback={<PageLoader />}>
            <EditData />
          </Suspense>
        ),
      },
      {
        path: "subject/:subjectId/version",
        element: (
          <Suspense fallback={<PageLoader />}>
            <SubjectVersionPage />
          </Suspense>
        ),
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
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdvisorDashboard />
          </Suspense>
        ),
      },
      {
        path: "workSchedule",
        element: (
          <Suspense fallback={<PageLoader />}>
            <WorkSchedule />
          </Suspense>
        ),
      },
      {
        path: "leaveSchedule",
        element: (
          <Suspense fallback={<PageLoader />}>
            <LeaveSchedulePage />
          </Suspense>
        ),
      },
      {
        path: "meeting",
        element: (
          <Suspense fallback={<PageLoader />}>
            <MeetingPage />
          </Suspense>
        ),
      },
      {
        path: "studentOverview",
        element: (
          <Suspense fallback={<PageLoader />}>
            <StudentOverview />
          </Suspense>
        ),
      },
      {
        path: "studentDetail/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <StudentDetail />
          </Suspense>
        ),
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
        element: (
          <Suspense fallback={<PageLoader />}>
            <StudentInCoursePage />
          </Suspense>
        ),
      },
      {
        path: "curriculum",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CurriculumPageManager />
          </Suspense>
        ),
      },
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ManagerProfile />
          </Suspense>
        ),
      },
      {
        path: "program",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ManagerProgramPage />
          </Suspense>
        ),
      },
      {
        path: "combo",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ComboPage />
          </Suspense>
        ),
      },
      {
        path: "combo/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ComboDetail />
          </Suspense>
        ),
      },
      {
        path: "subject",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ManagerSubjectPage />
          </Suspense>
        ),
      },
      {
        path: "subject/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ManagerSubjectDetail />
          </Suspense>
        ),
      },
      {
        path: "subject/:subjectId/version",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ManagerSubjectVersionPage />
          </Suspense>
        ),
      },
      {
        path: "student-monitoring",
        element: (
          <Suspense fallback={<PageLoader />}>
            <StudentInCoursePage />
          </Suspense>
        ),
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