import { motion } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router';

interface SubjectCardProps {
  id: number;
  code: string;
  name: string;
  progress: number;
  credits: number;
  isPassed: boolean;
  isCompleted: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.02, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)', transition: { duration: 0.3 } },
};

function getProgressColor(isPassed: boolean) {
  if (isPassed) return 'bg-green-500 text-white border-green-500';
  return 'bg-gray-500 text-white border-gray-500';
}

function getStatusText(isPassed: boolean) {
  if (isPassed) return 'Passed';
  return 'In Progress';
}

const SubjectCard: React.FC<SubjectCardProps> = ({ id, code, name, progress, credits, isPassed, isCompleted }) => (
  <Link to={`/student/subject-details/${id}`}>
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-white/18 backdrop-blur-16 border border-white/30 rounded-2xl p-5 lg:p-6 flex flex-col gap-4 relative shadow-lg transition-all duration-300 h-full cursor-pointer"
      style={{ minHeight: '160px' }}
    >
      {/* Header with code and status badge */}
      <div className="flex items-center justify-between">
        <span className="text-orange-300 font-bold text-xl lg:text-2xl tracking-wide">
          {code}
        </span>
        <div className="flex flex-col items-end gap-1">
          {isPassed && (
            <div
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${getProgressColor(isPassed)}`}
              style={{backdropFilter: 'blur(2px)'}}
            >
              {getStatusText(isPassed)}
            </div>
          )}
          <span className="text-white/70 text-xs">
            {credits} credits
          </span>
        </div>
      </div>
      
      {/* Subject name - takes up available space */}
      <div className="text-white/90 text-base lg:text-lg font-medium leading-relaxed flex-1">
        {name}
      </div>
    </motion.div>
  </Link>
);

export default SubjectCard; 