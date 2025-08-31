import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useJoinedSubjects, useSyllabusByJoinedSubject, useCheckpointCompletionPercentage, useJoinedSubjectStatusMapping } from '../../hooks/useStudentFeature';
import { groupSubjectsBySemester, getSemesterOptions } from '../../utils/subjectUtils';
import { GetCurrentStudentUser } from '../../api/Account/UserAPI';
import { getAuthState } from '../../hooks/useAuthState';
import { jwtDecode } from 'jwt-decode';

import SearchBar from '../../components/student/searchBar';
import ResourceTable from '../../components/student/resourceTable';
import { useStudentFeature } from '../../hooks/useStudentFeature';


const ResourceExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedJoinedSubjectId, setSelectedJoinedSubjectId] = useState<number | null>(null);
  const [studentProfileId, setStudentProfileId] = useState<number | null>(null);
  const [studentDetail, setStudentDetail] = useState<any | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState<boolean>(false);


  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [hasSearched, setHasSearched] = useState<boolean>(false);


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



  const { data: joinedSubjects, isLoading: subjectsLoading } = useJoinedSubjects();

  // Fetch syllabus by joined subject ID to get syllabusId
  const { data: syllabusIdData, isLoading: syllabusIdLoading } = useSyllabusByJoinedSubject(selectedJoinedSubjectId);

  // Fetch checkpoint completion percentage and status mapping using actual studentProfileId from studentDataDetailResponse.id
  const { data: completionData, isLoading: completionLoading } = useCheckpointCompletionPercentage(studentProfileId);
  const { data: statusData, isLoading: statusLoading } = useJoinedSubjectStatusMapping(studentProfileId);


  // Only fetch syllabus data when hasSearched is true
  const { data: syllabusData, isLoading: syllabusLoading } = useStudentFeature({
    search: hasSearched ? searchTerm : '', // Only search when hasSearched is true
    page,
    pageSize,
  });
  console.log(syllabusData);

  // Group subjects by semester
  const semesterSubjects = React.useMemo(() => {
    if (!joinedSubjects) return {};
    return groupSubjectsBySemester(joinedSubjects);
  }, [joinedSubjects]);

  // Get available semesters for dropdown
  const semesterOptions = React.useMemo(() => {
    return getSemesterOptions(semesterSubjects);
  }, [semesterSubjects]);

  // Set default selected semester to the most recent one
  React.useEffect(() => {
    if (semesterOptions.length > 0 && !selectedSemester) {
      setSelectedSemester(Number(semesterOptions[0].value));
    }
  }, [semesterOptions, selectedSemester]);

  // When syllabusId is received, navigate to syllabus detail
  React.useEffect(() => {
    if (syllabusIdData && syllabusIdData.syllabusId && selectedJoinedSubjectId) {
      navigate(`/student/syllabus/${syllabusIdData.syllabusId}`);
      setSelectedJoinedSubjectId(null);
    }
  }, [syllabusIdData, selectedJoinedSubjectId, navigate]);

  // Get current semester subjects
  const currentSemesterSubjects = selectedSemester ? semesterSubjects[selectedSemester] || [] : [];

  // Helper function to get completion percentage for a subject
  const getCompletionPercentage = (joinedSubjectId: number) => {
    if (!completionData) return 0;
    const subject = completionData.find((item: any) => item.joinedSubjectId === joinedSubjectId);
    return subject ? subject.completedPercentage : 0;
  };

  // Helper function to get status for a subject
  const getSubjectStatus = (joinedSubjectId: number) => {
    if (!statusData) return 'IN-PROGRESS';
    const subject = statusData.find((item: any) => item.joinedSubjectId === joinedSubjectId);
    return subject ? subject.status : 'IN-PROGRESS';
  };


  // Helper function to get status color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PASSED':
        return { color: 'bg-green-500', text: 'Passed' };
      case 'NOT PASSED':
        return { color: 'bg-red-500', text: 'Not Passed' };
      case 'IN-PROGRESS':
      default:
        return { color: 'bg-blue-500', text: 'In Progress' };
    }
  };

  const handleSubjectSelect = (subject: any) => {
    setSelectedJoinedSubjectId(subject.id);
  };

  const handleSearch = () => {
    setHasSearched(true);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  const handleSyllabusSelect = (syllabus: any) => {
    // Navigate to syllabus detail page
    navigate(`/student/syllabus/${syllabus.id}`);

  };

  return (
    <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden px-4 mt-8 lg:px-6">
      {/* Current Semester Subjects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 w-full max-w-7xl mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20">
          <h2 className="text-lg font-bold text-white mb-3">
            Current Semester Subjects
          </h2>
          {subjectsLoading || completionLoading || statusLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-200 opacity-80">Loading subjects...</p>
            </div>
          ) : currentSemesterSubjects.length > 0 ? (
            <div className="space-y-2">
              {currentSemesterSubjects.map((subject, idx) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  onClick={() => handleSubjectSelect(subject)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-yellow-300 font-bold text-sm whitespace-nowrap">
                      {subject.subjectCode}
                    </span>
                    <h3 className="text-white font-medium text-sm truncate">
                      {subject.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    {/* Status Badge */}
                    {(() => {
                      const status = getSubjectStatus(subject.id);
                      const statusInfo = getStatusInfo(status);
                      return (
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${statusInfo.color}`}>
                          {statusInfo.text}
                        </div>
                      );
                    })()}
                    
                    {/* Progress Section */}
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">
                        {getCompletionPercentage(subject.id)}%
                      </span>
                      <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${getCompletionPercentage(subject.id)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-200 opacity-60">No subjects found for this semester</p>
            </div>
          )}
        </div>
      </motion.div>


      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6 w-full max-w-7xl mx-auto"
      >
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onEnter={handleSearch}
          placeholder="Search by Subject Code (e.g., CS101, MATH201)..."
          className="mb-4"
        />
      </motion.div>

      {/* Syllabus Table Section - Always show when hasSearched, but data is always fetched */}
      {hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-7xl mx-auto"
        >
          <ResourceTable
            data={syllabusData?.items || []}
            isLoading={syllabusLoading}
            page={page}
            pageSize={pageSize}
            total={syllabusData?.totalCount || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            searchTerm={searchTerm}
            hasSearched={hasSearched}
            onSubjectSelect={handleSyllabusSelect}
          />
        </motion.div>
      )}

    </div>
  );
};

export default ResourceExplorer;