import CourseList from '../../components/student/courseList';
import AcademicCharts from '../../components/student/academicCharts';
import UserInfoCard from '../../components/student/userInfoCard';
import { motion } from 'framer-motion';

import { useState } from 'react';
import SemesterSelect from '../../components/student/selectSemester';



const user = {
  name: 'Le Nguyen Thien An',
  quote: 'SE170104',
  avatar: '/avatar.jpg',
  achievements: [
    { icon: '🏆', label: 'Top 3' },
    { icon: '🎉', label: 'YOLO' },
    { icon: '😺', label: 'Cat King' },
  ],
  gpaHistory: [
    { semester: 'Fall 21', gpa: 3.2 },
    { semester: 'Spring 22', gpa: 3.4 },
    { semester: 'Summer 22', gpa: 3.5 },
    { semester: 'Fall 22', gpa: 3.6 },
    { semester: 'Spring 23', gpa: 3.7 },
    { semester: 'Summer 23', gpa: 3.8 },
    { semester: 'Fall 23', gpa: 3.9 },
    { semester: 'Spring 24', gpa: 3.85 },
    { semester: 'Summer 24', gpa: 3.9 },
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

const semesterOptions = [
  { label: 'SUMMER 2025', value: 'SUMMER 2025' },
  { label: 'SPRING 2025', value: 'SPRING 2025' },
  { label: 'FALL 2024', value: 'FALL 2024' },
];

const Dashboard = () => {
  const [selectedSemester, setSelectedSemester] = useState('SUMMER 2025');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="pt-20 lg:mt-235 md:mt-200 pb-8 flex-1  min-h-screen bg-transparent"
    >
      {/* Header Section */}
      <motion.div
        className="px-4 sm:px-6 lg:px-8 mb-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-lg sm:text-xl text-gray-200 opacity-80 max-w-2xl mx-auto text-center">
          Welcome back! Here's your academic overview and progress tracking.
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <div className="w-full  sm:px-4  flex flex-col gap-8">
        <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* User Profile Section */}
          <motion.div
            className="xl:col-span-1 w-full"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="w-full">
              <UserInfoCard user={user} />
            </div>
          </motion.div>

          {/* Main Content Section */}
          <motion.div
            className="xl:col-span-2 w-full flex flex-col gap-8"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Courses Section */}
            <motion.div
              className="w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-0">
                  {selectedSemester}
                </h2>
                <SemesterSelect
                  value={selectedSemester}
                  options={semesterOptions}
                  onChange={setSelectedSemester}
                />
              </div>
              <p className="text-gray-200 opacity-80 mb-4">
                Track your academic progress across all enrolled subjects
              </p>
              <CourseList courses={courses} />
            </motion.div>

            {/* Analytics Section */}
            <motion.div
              className="w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Academic Analytics
                </h2>
                <p className="text-gray-200 opacity-80">
                  Visualize your performance and track your achievements
                </p>
              </div>
              <AcademicCharts academicData={academicData} pieData={pieData} COLORS={COLORS} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;