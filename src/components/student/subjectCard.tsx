import { motion } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router';

interface SubjectCardProps {
  code: string;
  name: string;
  progress: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.02, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)', transition: { duration: 0.3 } },
};

function getProgressColor(progress: number) {
  if (progress >= 80) return 'bg-green-500 text-white border-green-500';
  if (progress >= 50) return 'bg-yellow-400 text-black border-yellow-400';
  return 'bg-red-500 text-white border-red-500';
}

const SubjectCard: React.FC<SubjectCardProps> = ({ code, name, progress }) => (
  <Link to={`/student/course-tracking/${code}`}>
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-white/18 backdrop-blur-16 border border-white/30 rounded-2xl p-5 lg:p-6 flex flex-col gap-4 relative shadow-lg transition-all duration-300 h-full"
      style={{ minHeight: '160px' }}
    >
      {/* Header with code and progress badge */}
      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-xl lg:text-2xl tracking-wide">
          {code}
        </span>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold border ${getProgressColor(progress)}`}
          style={{backdropFilter: 'blur(2px)'}}
        >
          {progress}%
        </div>
      </div>
      
      {/* Subject name - takes up available space */}
      <div className="text-white/90 text-base lg:text-lg font-medium leading-relaxed flex-1">
        {name}
      </div>
      
      {/* Progress Bar - stays at bottom */}
      <div className="mt-auto">
        <div className="w-full bg-white/10 rounded-full h-2.5">
          <motion.div
            className={`h-2.5 rounded-full ${progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  </Link>
);

export default SubjectCard; 