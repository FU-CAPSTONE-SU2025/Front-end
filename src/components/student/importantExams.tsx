import React from 'react';
import { motion } from 'framer-motion';

interface Exam {
  date: string;
  type: string;
  course: string;
  name: string;
}

interface ImportantExamsProps {
  exams: Exam[];
}

const ImportantExams: React.FC<ImportantExamsProps> = ({ exams }) => {
  const getExamTypeColor = (type: string) => {
    if (type.toLowerCase().includes('final')) return 'bg-red-500/80';
    if (type.toLowerCase().includes('practical')) return 'bg-blue-500/80';
    if (type.toLowerCase().includes('midterm')) return 'bg-yellow-500/80';
    return 'bg-purple-500/80';
  };

  const getExamTypeIcon = (type: string) => {
    if (type.toLowerCase().includes('final')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (type.toLowerCase().includes('practical')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="bg-white/18 backdrop-blur-16 border border-white/30 rounded-2xl p-6 shadow-lg w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/10 backdrop-blur-8 rounded-xl p-5 border border-white/20 hover:border-white/40 transition-all duration-300 group"
          >
            {/* Header with type badge and date */}
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-semibold ${getExamTypeColor(exam.type)}`}>
                {getExamTypeIcon(exam.type)}
                {exam.type}
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 font-medium">Date</div>
                <div className="text-sm text-white font-semibold">{exam.date}</div>
              </div>
            </div>

            {/* Course code */}
            <div className="mb-3">
              <div className="text-xs text-gray-400 font-medium mb-1">Course Code</div>
              <div className="text-lg font-bold text-white">{exam.course}</div>
            </div>

            {/* Course name */}
            <div className="mb-4">
              <div className="text-xs text-gray-400 font-medium mb-1">Course Name</div>
              <div className="text-sm text-gray-300 leading-relaxed line-clamp-2">
                {exam.name}
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Upcoming</span>
              </div>
              <motion.div
                className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
              >
                View Details →
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: exams.length * 0.1 }}
        className="mt-8 p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-semibold mb-1">Exam Summary</h4>
            <p className="text-sm text-gray-300">
              {exams.length} upcoming exams in the next semester
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{exams.length}</div>
            <div className="text-xs text-gray-400">Total Exams</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImportantExams; 