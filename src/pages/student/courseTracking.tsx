import React, { useState } from 'react';
import { Select, Card } from 'antd';
import { motion } from 'framer-motion';
import SubjectCard from '../../components/student/subjectCard';
import CommitChart from '../../components/student/commitChart';
import ImportantExams from '../../components/student/importantExams';

const semesters = [
  { label: 'Summer 2025 Semester', value: 'summer2025' },
  { label: 'Spring 2025 Semester', value: 'spring2025' },
  { label: 'Fall 2024 Semester', value: 'fall2024' },
];

const courses = [
  { code: 'PRN212', name: 'Basic Cross-Platform Application Programming With .NET', progress: 85 },
  { code: 'PRM231', name: 'Project Management', progress: 72 },
  { code: 'PMG201c', name: 'Programming Fundamentals', progress: 95 },
  { code: 'CSD201', name: 'Data Structures and Algorithms', progress: 68 },
  { code: 'WED201c', name: 'Web Development', progress: 88 },
];

const importantExams = [
  {
    date: 'June 9, 2024',
    type: 'Practical Exam',
    course: 'PRN212',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
  {
    date: 'June 9, 2024',
    type: 'Practical Exam',
    course: 'PRM231',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
  {
    date: 'June 9, 2024',
    type: 'Practical Exam',
    course: 'PMG201c',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
  {
    date: 'June 9, 2024',
    type: 'Final Exam',
    course: 'PMG201c',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
  {
    date: 'June 9, 2024',
    type: 'Final Exam',
    course: 'PRM231',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
  {
    date: 'June 9, 2024',
    type: 'Final Exam',
    course: 'PRN212',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
];

const CourseTracking = () => {
  const [semester, setSemester] = useState(semesters[0].value);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);

  const handleGitHubConnect = () => {
    setIsGitHubConnected(true);
    // Here you would typically redirect to GitHub OAuth or handle the authentication flow
    console.log('Connecting to GitHub...');
  };

  return (
    <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden">
      {/* Main Container */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Course Dashboard
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Track your academic progress and stay on top of important deadlines
            </p>
          </div>
          
          <div className="flex justify-center">
            <Select
              value={semester}
              onChange={setSemester}
              options={semesters}
              className="w-full max-w-md"
              size="large"
              popupClassName="bg-gray-800 text-white"
              style={{ color: 'white' }}
            />
          </div>
        </motion.div>

        {/* Course Cards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Your Courses</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto rounded-full"></div>
          </div>
          
          {/* First row - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 max-w-6xl mx-auto">
            {courses.slice(0, 3).map((course) => (
              <motion.div
                key={course.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="w-full"
              >
                <SubjectCard
                  code={course.code}
                  name={course.name}
                  progress={course.progress}
                />
              </motion.div>
            ))}
          </div>
          
          {/* Second row - 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {courses.slice(3, 5).map((course) => (
              <motion.div
                key={course.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="w-full"
              >
                <SubjectCard
                  code={course.code}
                  name={course.name}
                  progress={course.progress}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Activity Overview</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <CommitChart 
              isConnected={isGitHubConnected}
              onConnect={handleGitHubConnect}
            />
          </div>
        </motion.div>

        {/* Important Exams Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Important Exams</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <ImportantExams exams={importantExams} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseTracking;