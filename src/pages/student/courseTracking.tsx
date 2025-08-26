import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import SubjectCard from '../../components/student/subjectCard';
import CommitChart from '../../components/student/commitChart';
import ImportantExams from '../../components/student/importantExams';
import SemesterSelect from '../../components/student/selectSemester';
import UpcomingTodosTimeline from '../../components/student/upcomingTodosTimeline';
import { useJoinedSubjects } from '../../hooks/useStudentFeature';
import { JoinedSubject, SemesterSubjects } from '../../interfaces/IStudent';
import { groupSubjectsBySemester, getSemesterOptions } from '../../utils/subjectUtils';

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
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  
  // Fetch joined subjects
  const { data: joinedSubjects, isLoading, error } = useJoinedSubjects();

  // Group subjects by semester
  const semesterSubjects: SemesterSubjects = useMemo(() => {
    if (!joinedSubjects) return {};
    return groupSubjectsBySemester(joinedSubjects);
  }, [joinedSubjects]);

  // Get available semesters for dropdown
  const semesterOptions = useMemo(() => {
    return getSemesterOptions(semesterSubjects);
  }, [semesterSubjects]);

  // Set default selected semester to the most recent one
  useMemo(() => {
    if (semesterOptions.length > 0 && !selectedSemester) {
      setSelectedSemester(Number(semesterOptions[0].value));
    }
  }, [semesterOptions, selectedSemester]);

  // Get current semester subjects
  const currentSemesterSubjects = selectedSemester ? semesterSubjects[selectedSemester] || [] : [];
  
  // Get current semester name
  const currentSemesterName = useMemo(() => {
    if (!selectedSemester || !currentSemesterSubjects.length) return '';
    return currentSemesterSubjects[0]?.semesterName || `Semester ${selectedSemester}`;
  }, [selectedSemester, currentSemesterSubjects]);

  const handleGitHubConnect = () => {
    setIsGitHubConnected(true);
    // Here you would typically redirect to GitHub OAuth or handle the authentication flow
    console.log('Connecting to GitHub...');
  };

  if (isLoading) {
    return (
      <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden flex items-center justify-center">
        <div className="text-white text-xl">Loading subjects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading subjects: {error.message}</div>
      </div>
    );
  }

  // Check if no data is available
  if (!joinedSubjects || joinedSubjects.length === 0) {
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
          </motion.div>

          {/* No Data Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Course Tracking</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-12">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                      No Courses Found
                    </h3>
                    <p className="text-gray-200 opacity-80 text-lg mb-6 max-w-md mx-auto">
                      You haven't enrolled in any courses yet. Please contact your academic advisor to register for subjects.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-white">0</div>
                      <div className="text-gray-200 text-sm">Total Courses</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">0</div>
                      <div className="text-gray-200 text-sm">Completed</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">0</div>
                      <div className="text-gray-200 text-sm">In Progress</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">0</div>
                      <div className="text-gray-200 text-sm">Total Credits</div>
                    </div>
                  </div>
                </div>
              </div>
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
  
        </div>
      </div>
    );
  }

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
            <SemesterSelect
              value={selectedSemester?.toString() || ''}
              options={semesterOptions}
              onChange={(value) => setSelectedSemester(value ? Number(value) : null)}
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
            <h2 className="text-3xl font-bold text-white mb-2">
              {currentSemesterName || 'Select Semester'}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto rounded-full"></div>
          </div>
          
          {currentSemesterSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {currentSemesterSubjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="w-full"
                >
                  <SubjectCard
                    id={subject.id}
                    code={subject.subjectCode}
                    name={subject.name}
                    progress={subject.isCompleted ? 100 : subject.isPassed ? 80 : 30}
                    credits={subject.credits}
                    isPassed={subject.isPassed}
                    isCompleted={subject.isCompleted}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-300 text-lg">No subjects found for this semester</p>
            </div>
          )}
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

        {/* Upcoming Todos Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <div className="max-w-4xl mx-auto">
            <UpcomingTodosTimeline />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default CourseTracking;