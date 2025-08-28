import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/student/searchBar';
import ResourceTable from '../../components/student/resourceTable';
import { useStudentFeature, useJoinedSubjects } from '../../hooks/useStudentFeature';
import { groupSubjectsBySemester, getSemesterOptions } from '../../utils/subjectUtils';

const ResourceExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  // Fetch joined subjects for current semester display
  const { data: joinedSubjects, isLoading: subjectsLoading } = useJoinedSubjects();

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

  // Get current semester subjects
  const currentSemesterSubjects = selectedSemester ? semesterSubjects[selectedSemester] || [] : [];

  useEffect(() => {
    setPage(1);
  }, [activeSearch]);

  const { data, isLoading, error } = useStudentFeature({ 
    search: activeSearch, 
    page, 
    pageSize,
    searchType: 'code' // Chỉ search theo subject code
  });

  const handleSubjectSelect = (subject: any) => {
    navigate(`/student/syllabus/${subject.id}`);
  };

  const handleSearchEnter = () => {
    const trimmedSearch = searchInput.trim();
    
    setHasSearched(true);
    setActiveSearch(trimmedSearch);
  };

  return (
    <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden px-4 lg:px-6">
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
          {subjectsLoading ? (
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
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  onClick={() => handleSubjectSelect(subject)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-yellow-300 font-bold text-sm whitespace-nowrap">
                      {subject.subjectCode}
                    </span>
                    <h3 className="text-white font-medium text-sm truncate">
                      {subject.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-white font-bold text-sm">
                      {subject.isCompleted ? 100 : subject.isPassed ? 80 : 30}%
                    </span>
                    <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${subject.isCompleted ? 100 : subject.isPassed ? 80 : 30}%` }}
                      />
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

      {/* Search Bar - Always show */}
      <div className="mb-6 w-full max-w-7xl mx-auto">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onEnter={handleSearchEnter}
          placeholder="Search by subject code only... (Press Enter to search)"
          className="mb-0"
        />
      </div>

      {/* Table - Only show after user has searched */}
      {hasSearched && (
        <ResourceTable
          data={data?.items || []}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          total={data?.totalCount || 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          searchTerm={activeSearch}
          hasSearched={hasSearched}
          onSubjectSelect={handleSubjectSelect}
        />
      )}
    </div>
  );
};

export default ResourceExplorer;