import CourseList from '../../components/student/courseList';
import AcademicCharts from '../../components/student/academicCharts';
import UserInfoCard from '../../components/student/userInfoCard';


const user = {
  name: 'Andy',
  quote: 'Time to rise',
  avatar: '/avatar.jpg',
  achievements: [
    { icon: '🏆', label: 'Top 3' },
    { icon: '🎉', label: 'YOLO' },
    { icon: '😺', label: 'Cat King' },
  ],
  contributions: [
    { month: 'Jan', value: 10 },
    { month: 'Feb', value: 30 },
    { month: 'Mar', value: 20 },
    { month: 'Apr', value: 40 },
    { month: 'May', value: 25 },
    { month: 'Jun', value: 35 },
  ],
};

const courses = [
  { name: 'Basic Cross-Platform Application Programming With .NET', code: 'PRN212', progress: 80 },
  { name: 'Basic Cross-Platform Application Programming With .NET', code: 'PRN212', progress: 65 },
  { name: 'Basic Cross-Platform Application Programming With .NET', code: 'PRN212', progress: 90 },
  { name: 'Basic Cross-Platform Application Programming With .NET', code: 'PRN212', progress: 75 },
  { name: 'Basic Cross-Platform Application Programming With .NET', code: 'PRN212', progress: 60 },
];

const academicData = [
  { name: 'Math', score: 8.5 },
  { name: 'Physics', score: 7.2 },
  { name: 'Chemistry', score: 9.1 },
  { name: 'English', score: 8.0 },
  { name: 'Programming', score: 7.8 },
];

const pieData = [
  { name: 'Passed', value: 4 },
  { name: 'Failed', value: 1 },
];

const COLORS = ['#3B82F6', '#F97316'];

const Dashboard = () => (
  <div className="pt-20 flex flex-col lg:flex-row w-full gap-6 overflow-x-hidden">
    <div className="w-full lg:w-1/3 flex flex-col items-center">
      <UserInfoCard user={user} />
    </div>
    <div className="w-full lg:w-2/3 flex flex-col gap-6">
      <CourseList courses={courses} />
      <AcademicCharts academicData={academicData} pieData={pieData} COLORS={COLORS} />
    </div>
  </div>
);

export default Dashboard;