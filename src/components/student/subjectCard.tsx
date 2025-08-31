import { motion } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router';

interface SubjectCardProps {
  id: number;
  code: string;
  name: string;
  completedPercentage: number;
  credits: number;
  isPassed: boolean;
  isCompleted: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.02, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)', transition: { duration: 0.3 } },
};

function getStatusInfo(isPassed: boolean, isCompleted: boolean) {
  if (isCompleted) {
    return { color: 'bg-green-500', text: 'Completed' };
  } else if (isPassed) {
    return { color: 'bg-blue-500', text: 'Passed' };
  } else {
    return { color: 'bg-orange-500', text: 'In Progress' };
  }
}

const SubjectCard: React.FC<SubjectCardProps> = ({ id, code, name, completedPercentage, credits, isPassed, isCompleted }) => {
  const statusInfo = getStatusInfo(isPassed, isCompleted);
  
  return (
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
          <div className="flex flex-col items-end gap-2">
            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusInfo.color}`}>
              {statusInfo.text}
            </div>
            <span className="text-white/70 text-xs">
              {credits} credits
            </span>
          </div>
        </div>
        
        {/* Subject name - takes up available space */}
        <div className="text-white/90 text-base lg:text-lg font-medium leading-relaxed flex-1">
          {name}
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm font-medium">Progress</span>
            <span className="text-white font-bold text-sm">{completedPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${completedPercentage}%`,
                minWidth: '0%',
                maxWidth: '100%'
              }}
            />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default SubjectCard; 