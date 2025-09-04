import SubjectCard from '../../components/student/subjectCard';
import UserInfoCard from '../../components/student/userInfoCard';
import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { Tabs, Tooltip, Button } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import SemesterSelect from '../../components/student/selectSemester';
import { useJoinedSubjects, useCheckpointCompletionPercentage, useJoinedSubjectStatusMapping } from '../../hooks/useStudentFeature';
import { SemesterSubjects, StudentBase } from '../../interfaces/IStudent';
import { groupSubjectsBySemester, getSemesterOptions, getSubjectsStats } from '../../utils/subjectUtils';
import { GetCurrentStudentUser } from '../../api/Account/UserAPI';
import { getAuthState } from '../../hooks/useAuthState';
import { jwtDecode } from 'jwt-decode';
import { getPersonalCurriculumSubjects, getPersonalComboSubjects } from '../../api/student/StudentAPI';
import AcademicCharts from '../../components/student/academicCharts';
import { usePersonalAcademicTranscript } from '../../hooks/useSubjectMarkReport';
import TranscriptTable from '../../components/student/transcriptTable';
import { useStudentSemesterPerformance, useStudentCategoryPerformance, useStudentCheckpointTimeline } from '../../hooks/useStudentDashboard';
import * as XLSX from 'xlsx';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { IPersonalAcademicTranscript } from '../../interfaces/ISubjectMarkReport';
import { AccountProps } from '../../interfaces/IAccount';
// Note: UserInfoCard will receive userInfor from API; no mock user passed

// Student info (fetched)
type JwtPayload = { UserId?: number };

// Removed mock semestersAcademicData

const Dashboard = () => {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const { accessToken } = getAuthState();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentDetail, setStudentDetail] = useState<AccountProps | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState<boolean>(false);
  const [curriculumSubjects, setCurriculumSubjects] = useState<Array<{ subjectCode: string; subjectName: string; credits: number; semesterNumber: number }>>([]);
  const [comboSubjects, setComboSubjects] = useState<Array<{ subjectCode: string; subjectName: string; credits: number; semesterNumber: number }>>([]);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState<boolean>(false);
  const [studentProfileId, setStudentProfileId] = useState<number | null>(null);
  const { handleError, handleSuccess } = useApiErrorHandler();
  const [isDownloadHover, setIsDownloadHover] = useState(false);
  
  const combinedPersonalSubjects = useMemo(() => {
    return [...(curriculumSubjects || []), ...(comboSubjects || [])];
  }, [curriculumSubjects, comboSubjects]);
  
  // Fetch joined subjects
  const { data: joinedSubjects, isLoading, error } = useJoinedSubjects();

  // Fetch checkpoint completion percentage and status mapping using actual studentProfileId
  const { data: completionData, isLoading: completionLoading } = useCheckpointCompletionPercentage(studentProfileId);
  const { data: statusData, isLoading: statusLoading } = useJoinedSubjectStatusMapping(studentProfileId);
  console.log(statusData)
  // Fetch transcript data
  const { data: transcriptData, isLoading: transcriptLoading } = usePersonalAcademicTranscript();

  // Fetch dashboard chart datasets (API-driven)
  const { data: semesterPerformance } = useStudentSemesterPerformance(studentProfileId);
  const { data: categoryPerformance } = useStudentCategoryPerformance(studentProfileId);
  const { data: checkpointTimeline } = useStudentCheckpointTimeline(studentProfileId);



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

  const getSubjectStatus = (subjectId: number): string | undefined => {
    if (!statusData) return undefined;
    const subject = statusData.find((item: any) => item.joinedSubjectId === subjectId);
    return subject?.status;
  };

  // Fetch personal curriculum and combo subjects
  useEffect(() => {
    const fetchPersonalSubjects = async () => {
      setIsLoadingPersonal(true);
      try {
        const [curriculumRes, comboRes] = await Promise.all([
          getPersonalCurriculumSubjects(),
          getPersonalComboSubjects()
        ]);
        
        setCurriculumSubjects(curriculumRes || []);
        setComboSubjects(comboRes || []);
      } catch (error) {
        console.error('Failed to fetch personal subjects:', error);
      } finally {
        setIsLoadingPersonal(false);
      }
    };

    fetchPersonalSubjects();
  }, []);



  // Export to XLSX
  const exportToXlsx = () => {
    try {
      const allLogs = transcriptData;
      const worksheet = XLSX.utils.json_to_sheet(allLogs.map((log: IPersonalAcademicTranscript) => ({
        'Subject Code': log.subjectCode,
        'Subject Version Code': log.subjectVersionCode,
        'Name': log.name,
        'Is Passed': log.isPassed,
        'Credits': log.credits,
        'Avg Score': log.avgScore,
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${studentDetail?.username} Transcript`);
      XLSX.writeFile(workbook, `${studentDetail?.username}_Transcript.xlsx`);
      handleSuccess('Transcript exported successfully!');
    } catch (err) {
      handleError(err, 'Failed to export Transcript');
      console.error('Export error:', err);
    }
  };


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

  // Get transcript statistics
  const transcriptStats = useMemo(() => {
    if (!transcriptData) return { total: 0, passed: 0, totalCredits: 0, avgScore: 0 };
    
    const total = transcriptData.length;
    const passed = transcriptData.filter(subject => subject.isPassed).length;
    const totalCredits = transcriptData.reduce((sum, subject) => sum + subject.credits, 0);
    const avgScore = transcriptData
      .filter(subject => subject.avgScore > 0)
      .reduce((sum, subject) => sum + subject.avgScore, 0) / 
      transcriptData.filter(subject => subject.avgScore > 0).length || 0;
    
    return { total, passed, totalCredits, avgScore: Number(avgScore.toFixed(2)) };
  }, [transcriptData]);

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
                          status={getSubjectStatus(subject.id)}
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
                <AcademicCharts
                  semesterPerformance={semesterPerformance || []}
                  categoryPerformance={categoryPerformance || []}
                  checkpointTimeline={checkpointTimeline || []}
                />
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
        {
          key: 'transcript',
          label: <span className="text-white text-lg">Transcript</span>,
          children: (
            <div className="mt-2">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Academic Transcript</h2>
                  <p className="text-gray-200 opacity-80">View your complete academic record and performance</p>
                </div>
              </div>

              <Tooltip title="Download Transcript">
                <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 2000 }}>
                  <Button
                    shape="circle"
                    size="large"
                    icon={<BookOutlined style={{ color: '#fff', fontSize: 20 }} />}
                    onClick={exportToXlsx}
                    style={{
                      width: 56,
                      height: 56,
                      background: '#f97316',
                      borderColor: '#f97316',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isDownloadHover ? '0 14px 28px rgba(249, 115, 22, 0.35)' : '0 10px 20px rgba(0,0,0,0.25)',
                      transform: isDownloadHover ? 'translateY(-3px) scale(1.06)' : 'translateY(0) scale(1)',
                      transition: 'all .25s ease'
                    }}
                    onMouseEnter={() => setIsDownloadHover(true)}
                    onMouseLeave={() => setIsDownloadHover(false)}
                  />
                </div>
              </Tooltip>
              
              {/* Transcript Statistics */}
              {transcriptData && transcriptData.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{transcriptStats.total}</div>
                    <div className="text-gray-200 text-sm">Total Subjects</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{transcriptStats.passed}</div>
                    <div className="text-gray-200 text-sm">Passed</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{transcriptStats.totalCredits}</div>
                    <div className="text-gray-200 text-sm">Total Credits</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{transcriptStats.avgScore}</div>
                    <div className="text-gray-200 text-sm">Avg Score</div>
                  </div>
                </div>
              )}
              
              <TranscriptTable data={transcriptData || []} isLoading={transcriptLoading} />
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

function downloadAuditLogs() {
  throw new Error('Function not implemented.');
}
