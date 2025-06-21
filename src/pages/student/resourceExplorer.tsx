import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '../../components/student/searchBar';
import ResourceTable from '../../components/student/resourceTable';
import SubjectDetailModal from '../../components/student/subjectDetailModal';

// Mock data for current semester subjects
const currentSemesterSubjects = [
  {
    code: 'PRN212',
    name: 'Basic Cross-Platform Application Programming With .NET',
    progress: 85,
  },
  {
    code: 'PRN221',
    name: 'Advanced Cross-Platform Application Programming With .NET',
    progress: 65,
  },
  {
    code: 'PRN231',
    name: 'Web Application Development With ASP.NET Core',
    progress: 45,
  },
  {
    code: 'PRN241',
    name: 'Mobile Application Development With Xamarin',
    progress: 90,
  },
  {
    code: 'PRN251',
    name: 'Cloud Application Development With Azure',
    progress: 75,
  },
];

const ResourceExplorer: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const handleOpenModal = (subject: any) => {
    setSelectedSubject(subject);
  };

  const handleCloseModal = () => {
    setSelectedSubject(null);
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
          <div className="space-y-2">
            {currentSemesterSubjects.map((subject, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-yellow-300 font-bold text-sm whitespace-nowrap">
                    {subject.code}
                  </span>
                  <h3 className="text-white font-medium text-sm truncate">
                    {subject.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-white font-bold text-sm">
                    {subject.progress}%
                  </span>
                  <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-6 w-full max-w-7xl mx-auto">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by subject code or name..."
          className="mb-0"
        />
      </div>

      {/* Table - Only shows when search is performed */}
      <ResourceTable searchTerm={search} onSubjectSelect={handleOpenModal} />

      <SubjectDetailModal
        visible={!!selectedSubject}
        onClose={handleCloseModal}
        subject={selectedSubject}
      />
    </div>
  );
};

export default ResourceExplorer;