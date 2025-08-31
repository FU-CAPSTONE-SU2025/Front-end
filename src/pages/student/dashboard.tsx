import SubjectCard from '../../components/student/subjectCard';
import UserInfoCard from '../../components/student/userInfoCard';
import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { Tabs } from 'antd';
import SemesterSelect from '../../components/student/selectSemester';
import { useJoinedSubjects, useCheckpointCompletionPercentage, useJoinedSubjectStatusMapping } from '../../hooks/useStudentFeature';
import { JoinedSubject, SemesterSubjects } from '../../interfaces/IStudent';
import { groupSubjectsBySemester, getSemesterOptions, getSubjectsStats } from '../../utils/subjectUtils';
import { GetCurrentStudentUser } from '../../api/Account/UserAPI';
import { getAuthState } from '../../hooks/useAuthState';
import { jwtDecode } from 'jwt-decode';
import { getPersonalCurriculumSubjects, getPersonalComboSubjects } from '../../api/student/StudentAPI';
import AcademicCharts from '../../components/student/academicCharts';

// Note: UserInfoCard will receive userInfor from API; no mock user passed

// Student info (fetched)
type JwtPayload = { UserId?: number };

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
  const { accessToken } = getAuthState();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentDetail, setStudentDetail] = useState<any | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState<boolean>(false);
  const [curriculumSubjects, setCurriculumSubjects] = useState<Array<{ subjectCode: string; subjectName: string; credits: number; semesterNumber: number }>>([]);
  const [comboSubjects, setComboSubjects] = useState<Array<{ subjectCode: string; subjectName: string; credits: number; semesterNumber: number }>>([]);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState<boolean>(false);
  const [studentProfileId, setStudentProfileId] = useState<number | null>(null);
  
  const combinedPersonalSubjects = useMemo(() => {
    return [...(curriculumSubjects || []), ...(comboSubjects || [])];
  }, [curriculumSubjects, comboSubjects]);
  
  // Fetch joined subjects
  const { data: joinedSubjects, isLoading, error } = useJoinedSubjects();

  // Fetch checkpoint completion percentage and status mapping using actual studentProfileId
  const { data: completionData, isLoading: completionLoading } = useCheckpointCompletionPercentage(studentProfileId);
  const { data: statusData, isLoading: statusLoading } = useJoinedSubjectStatusMapping(studentProfileId);

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

  // Extract student id from JWT
  useEffect(() => {
    try {
      const payload: JwtPayload = jwtDecode(accessToken ?? '');
      const id = payload?.UserId ?? null;
      setStudentId(id);
    } catch {
      setStudentId(null);
    }
  }, [accessToken]);

  // Fetch student detail
  useEffect(() => {
    const fetchDetail = async () => {
      if (!studentId) return;
      setIsLoadingStudent(true);
      try {
        const res = await GetCurrentStudentUser(studentId);
        setStudentDetail(res);
        // Set studentProfileId from studentDataDetailResponse.id
        const profileId = res?.studentDataDetailResponse?.id;
        setStudentProfileId(profileId);
      } catch (e) {
        // keep silent UI fallback
        setStudentDetail(null);
      } finally {
        setIsLoadingStudent(false);
      }
    };
    fetchDetail();
  }, [studentId]);

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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Completed':
        return { color: 'bg-green-500', text: 'Completed' };
      case 'Passed':
        return { color: 'bg-blue-500', text: 'Passed' };
      default:
        return { color: 'bg-orange-500', text: 'In Progress' };
    }
  };

  // Fetch personal curriculum/combo subjects
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setIsLoadingPersonal(true);
      try {
        const [cur, combo] = await Promise.all([
          getPersonalCurriculumSubjects(),
          getPersonalComboSubjects(),
        ]);
        if (mounted) {
          setCurriculumSubjects(cur || []);
          setComboSubjects(combo || []);
        }
      } catch {
        if (mounted) {
          setCurriculumSubjects([]);
          setComboSubjects([]);
        }
      } finally {
        if (mounted) setIsLoadingPersonal(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  const renderSubjectList = (items: Array<{ subjectCode: string; subjectName: string; credits: number; semesterNumber: number }>) => {
    if (isLoadingPersonal) {
      return <div className="text-center py-4 text-gray-200/80">Loading...</div>;
    }
    if (!items || items.length === 0) {
      return <div className="text-center py-4 text-gray-200/70">No subjects available</div>;
    }
    return (
      <div className="w-full">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-12 text-gray-200/90 text-xs sm:text-sm px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="col-span-4 sm:col-span-3">Code</div>
            <div className="col-span-8 sm:col-span-5">Name</div>
            <div className="hidden sm:block sm:col-span-2 text-right">Credits</div>
            <div className="col-span-4 sm:col-span-2 text-right">Semester</div>
          </div>
          <div className="divide-y divide-white/10">
            {items.map((s, idx) => (
              <div key={idx} className="grid grid-cols-12 items-center px-4 py-3 text-white/90">
                <div className="col-span-4 sm:col-span-3 font-medium truncate">{s.subjectCode}</div>
                <div className="col-span-8 sm:col-span-5 pr-2 truncate" title={s.subjectName}>{s.subjectName}</div>
                <div className="hidden sm:block sm:col-span-2 text-right">{s.credits}</div>
                <div className="col-span-4 sm:col-span-2 text-right">{s.semesterNumber}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Compose minimal user props for UserInfoCard from real API data
  const composedUser = useMemo(() => {
    const name = studentDetail ? `${studentDetail.firstName ?? ''} ${studentDetail.lastName ?? ''}`.trim() || 'Student' : 'Student';
    const quote = studentDetail?.studentDataDetailResponse?.careerGoal || 'Welcome back';
    const avatar = studentDetail?.avatarUrl || '/avatar.jpg';
    const achievements: Array<{ icon: string; label: string }> = [];
    return { name, quote, avatar, achievements } as any;
  }, [studentDetail]);
  
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

  // Right content tabs renderer
  const renderRightTabs = () => (
    <Tabs
      defaultActiveKey="academic"
      items={[
        {
          key: 'academic',
          label: <span className="text-white text-lg">Academic</span>,
          children: (
            <div className="mt-2">
              {/* Courses Section inside Academic tab */}
              <div className="!w-full !bg-white/10 !backdrop-blur-xl !rounded-2xl !shadow-2xl !border !border-white/20 p-4 sm:p-6 lg:p-8">
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
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-200 opacity-80">Loading subjects...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-gray-200 opacity-80">No data available right now.</p>
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
                  <div className="text-center py-8">
                    <p className="text-gray-200 opacity-60">No subjects found for this semester</p>
                  </div>
                )}
              </div>

              {/* Academic Charts below courses */}
              <div className="w-full p-4 sm:p-6 lg:p-8 !bg-white/10 !backdrop-blur-xl !rounded-2xl !shadow-2xl !border !border-white/20 mt-5">
                <div className="mb-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Academic Analytics</h2>
                  <p className="text-gray-200 opacity-80">Visualize your performance and track your achievements</p>
                </div>
                <AcademicCharts semesters={semestersAcademicData} selectedSemester={selectedSemester?.toString() || 'Summer 24'} />
              </div>
            </div>
          ),
        },
        {
          key: 'curriculum',
          label: <span className="text-white text-lg">Curriculum</span>,
          children: (
            <div className="mt-2">
              <div className="mb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Personal Subjects</h2>
              </div>
              {renderSubjectList(combinedPersonalSubjects)}
            </div>
          ),
        },
      ]}
    />
  );

  // Check if no data is available
  if (!joinedSubjects || joinedSubjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="pt-20 mt-2 pb-8 flex-1 min-h-screen bg-transparent"
      >
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
                <UserInfoCard userInfor={studentDetail || {}} user={composedUser} />
              </div>
            </motion.div>

            {/* Main Content Section with tabs */}
            <motion.div
              className="xl:col-span-2 w-full flex flex-col gap-8"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {renderRightTabs()}
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
      className="pt-20 mt-8 pb-8 flex-1  min-h-screen bg-transparent"
    >
      {/* Header Section */}

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
              <UserInfoCard userInfor={studentDetail || {}} user={composedUser} />
              
            </div>
          </motion.div>

          {/* Main Content Section with tabs */}
          <motion.div
            className="xl:col-span-2 w-full flex flex-col gap-8"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {renderRightTabs()}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;