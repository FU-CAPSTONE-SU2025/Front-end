import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import SubjectCard from '../../components/student/subjectCard';
import SemesterSelect from '../../components/student/selectSemester';
import UpcomingTodosTimeline from '../../components/student/upcomingTodosTimeline';
import { useJoinedSubjects, useCheckpointCompletionPercentage, useJoinedSubjectStatusMapping } from '../../hooks/useStudentFeature';
import { JoinedSubject, SemesterSubjects } from '../../interfaces/IStudent';
import { groupSubjectsBySemester, getSemesterOptions } from '../../utils/subjectUtils';
import { GetCurrentStudentUser } from '../../api/Account/UserAPI';
import { getAuthState } from '../../hooks/useAuthState';
import { jwtDecode } from 'jwt-decode';

const CourseTracking = () => {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [studentProfileId, setStudentProfileId] = useState<number | null>(null);
  const [studentDetail, setStudentDetail] = useState<any | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState<boolean>(false);
  
  // Fetch joined subjects
  const { data: joinedSubjects, isLoading, error } = useJoinedSubjects();

  // Fetch checkpoint completion percentage and status mapping using actual studentProfileId
  const { data: completionData, isLoading: completionLoading } = useCheckpointCompletionPercentage(studentProfileId);
  const { data: statusData, isLoading: statusLoading } = useJoinedSubjectStatusMapping(studentProfileId);

  // Get studentProfileId from studentDataDetailResponse.id
  useEffect(() => {
    const fetchStudentDetail = async () => {
      try {
        const { accessToken } = getAuthState();
        if (accessToken) {
          const payload: any = jwtDecode(accessToken);
          const userId = payload?.UserId ?? null;
          
          if (userId) {
            setIsLoadingStudent(true);
            const res = await GetCurrentStudentUser(userId);
            setStudentDetail(res);
            // Set studentProfileId from studentDataDetailResponse.id
            const profileId = res?.studentDataDetailResponse?.id;
            setStudentProfileId(profileId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch student detail:', error);
        setStudentProfileId(null);
      } finally {
        setIsLoadingStudent(false);
      }
    };

    fetchStudentDetail();
  }, []);

  // Helper functions to get data from API
  const getCompletionPercentage = (subjectId: number): number => {
    if (!completionData) return 0;
    const subject = completionData.find((item: any) => item.joinedSubjectId === subjectId);
    return subject?.completedPercentage || 0;
  };

  const getSubjectStatus = (subjectId: number): string => {
    if (!statusData) return 'In Progress';
    const subject = statusData.find((item: any) => item.joinedSubjectId === subjectId);
    return subject?.status || 'In Progress';
  };

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

  // Note: We avoid hiding the whole page. We'll show localized messages in the subject section instead.
  
  return (
    <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden">
      {/* Main Container */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-center ">
            <h1 className="text-4xl !mt-5 md:text-5xl font-bold text-white ">
              Course Tracking
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
          {
            // Localized loading/error/empty handling for subjects
          }
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300 text-lg">Loading subjects...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-400 text-lg mb-2">Cannot load subjects right now.</p>
              <p className="text-gray-400 text-sm">Please try refreshing the page or contact support if the problem persists.</p>
            </div>
          ) : currentSemesterSubjects.length > 0 ? (
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
                    completedPercentage={getCompletionPercentage(subject.id)}
                    credits={subject.credits}
                    isPassed={subject.isPassed}
                    isCompleted={subject.isCompleted}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Subjects Found</h3>
              <p className="text-gray-300 text-lg mb-6 max-w-md mx-auto">
                {selectedSemester ? 
                  `No subjects found for ${currentSemesterName}. Please check with your academic advisor.` :
                  'No subjects found for this semester. Please select a different semester or contact your advisor.'
                }
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-md mx-auto">
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
          )}
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