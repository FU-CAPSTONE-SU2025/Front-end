import CourseList from '../../components/student/courseList';
import AcademicCharts from '../../components/student/academicCharts';
import UserInfoCard from '../../components/student/userInfoCard';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import SemesterSelect from '../../components/student/selectSemester';
import { useJoinedSubjects } from '../../hooks/useStudentFeature';
import { JoinedSubject, SemesterSubjects } from '../../interfaces/IStudent';
import { groupSubjectsBySemester, getSemesterOptions, getSubjectsStats } from '../../utils/subjectUtils';


const user = {
  name: 'Le Nguyen Thien An',
  quote: 'SE170104',
  avatar: '/avatar.jpg',
  achievements: [
    { icon: '🏆', label: 'Excellent student in SUMMER 2024' },
    { icon: '🎉', label: 'Godd student in SUMMER 2025' },
    { icon: '😺', label: 'Handsome student in SUMMER 2025' },
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

const semestersAcademicData = [
  {
    semester: 'Fall 23',
    attendance: [
      { subject: 'PRO192', attendance: 95 },
      { subject: 'DBI202', attendance: 90 },
      { subject: 'LAB211', attendance: 100 },
      { subject: 'CSD201', attendance: 88 },
      { subject: 'JPD113', attendance: 93 },
    ],
    scores: [
      { category: 'Final Exam', score: 7.5 },
      { category: 'Assignments', score: 8 },
      { category: 'Practical', score: 9 },
      { category: 'Midterm', score: 7 },
      { category: 'Presentation', score: 8.5 },
    ]
  },
  {
    semester: 'Spring 24',
    attendance: [
      { subject: 'PRN221', attendance: 98 },
      { subject: 'SWP391', attendance: 92 },
      { subject: 'SWT301', attendance: 100 },
      { subject: 'SWR302', attendance: 85 },
      { subject: 'JPD123', attendance: 91 },
    ],
    scores: [
      { category: 'Final Exam', score: 8.0 },
      { category: 'Assignments', score: 8.5 },
      { category: 'Practical', score: 7.5 },
      { category: 'Midterm', score: 9.0 },
      { category: 'Presentation', score: 8.0 },
    ]
  },
  {
    semester: 'Summer 24',
    attendance: [
      { subject: 'WED201c', attendance: 94 },
      { subject: 'IOT102', attendance: 96 },
      { subject: 'KMS201', attendance: 89 },
      { subject: 'VNR202', attendance: 99 },
    ],
    scores: [
      { category: 'Final Exam', score: 9.0 },
      { category: 'Assignments', score: 7.0 },
      { category: 'Practical', score: 8.0 },
      { category: 'Midterm', score: 8.5 },
      { category: 'Presentation', score: 9.5 },
    ]
  },
];

const Dashboard = () => {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  
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
  
  // Get statistics for current semester
  const semesterStats = useMemo(() => {
    return getSubjectsStats(currentSemesterSubjects);
  }, [currentSemesterSubjects]);

  if (isLoading) {
    return (
      <div className="pt-20 mt-2 pb-8 flex-1 min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-xl">Loading subjects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 mt-2 pb-8 flex-1 min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading subjects: {error.message}</div>
      </div>
    );
  }

  // Check if no data is available
  if (!joinedSubjects || joinedSubjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="pt-20 mt-2 pb-8 flex-1 min-h-screen bg-transparent"
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
        <div className="w-full sm:px-4 flex flex-col gap-8">
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
              {/* No Data Section */}
              <motion.div
                className="w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-12"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                      No Subjects Found
                    </h2>
                    <p className="text-gray-200 opacity-80 text-lg mb-6 max-w-md mx-auto">
                      You haven't enrolled in any subjects yet. Please contact your academic advisor to register for courses.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-white">0</div>
                      <div className="text-gray-200 text-sm">Total Subjects</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">0</div>
                      <div className="text-gray-200 text-sm">Completed</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">0</div>
                      <div className="text-gray-200 text-sm">Passed</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">0</div>
                      <div className="text-gray-200 text-sm">Total Credits</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Analytics Section */}
              <motion.div
                className="w-full p-4 sm:p-6 lg:p-8"
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
                <AcademicCharts semesters={semestersAcademicData} selectedSemester={selectedSemester?.toString() || 'Summer 24'} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="pt-20 mt-2   pb-8 flex-1  min-h-screen bg-transparent"
    >
      {/* Header Section */}
      <motion.div
        className="px-4 sm:px-6 lg:px-8 mb-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-lg sm:text-xl    text-gray-200 opacity-80 max-w-2xl mx-auto text-center">
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
                   {currentSemesterName || 'Select Semester'}
                 </h2>
                <SemesterSelect
                  value={selectedSemester?.toString() || ''}
                  options={semesterOptions}
                  onChange={(value) => setSelectedSemester(value ? Number(value) : null)}
                />
              </div>
              <p className="text-gray-200 opacity-80 mb-4">
                Track your academic progress across all enrolled subjects
              </p>
              
              {/* Statistics Section */}
              {currentSemesterSubjects.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{semesterStats.total}</div>
                    <div className="text-gray-200 text-sm">Total Subjects</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{semesterStats.completed}</div>
                    <div className="text-gray-200 text-sm">Completed</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{semesterStats.passed}</div>
                    <div className="text-gray-200 text-sm">Passed</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{semesterStats.totalCredits}</div>
                    <div className="text-gray-200 text-sm">Total Credits</div>
                  </div>
                </div>
              )}
              
              {currentSemesterSubjects.length > 0 ? (
                <CourseList subjects={currentSemesterSubjects} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-200 opacity-60">No subjects found for this semester</p>
                </div>
              )}
            </motion.div>

            {/* Analytics Section */}
            <motion.div
              className="w-full p-4 sm:p-6 lg:p-8"
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
              <AcademicCharts semesters={semestersAcademicData} selectedSemester={selectedSemester?.toString() || 'Summer 24'} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;