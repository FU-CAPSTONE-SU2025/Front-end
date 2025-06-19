import { motion } from 'framer-motion';
import React from 'react';

interface SubjectCardProps {
  code: string;
  name: string;
  progress: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.01, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)', transition: { duration: 0.3 } },
};

function getProgressColor(progress: number) {
  if (progress >= 80) return 'bg-green-500 text-white border-green-500';
  if (progress >= 50) return 'bg-yellow-400 text-black border-yellow-400';
  return 'bg-red-500 text-white border-red-500';
}

const SubjectCard: React.FC<SubjectCardProps> = ({ code, name, progress }) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    className="backdrop-blur-lg bg-white/5 border border-white rounded-2xl p-5 flex flex-col gap-2 min-w-[320px] max-w-xs relative shadow-lg"
    style={{ minHeight: 90 }}
  >
    <div className="flex items-center justify-between">
      <span className="text-white font-bold text-xl tracking-wide">{code}</span>
      <div
        className={`rounded-full px-3 py-0.5 text-xs font-semibold absolute top-4 right-4 border ${getProgressColor(progress)}`}
        style={{backdropFilter: 'blur(2px)'}}
      >
        {progress}%
      </div>
    </div>
    <div className="text-white text-sm font-medium mt-1 mb-3 leading-tight">
      {name}
    </div>
  </motion.div>
);

export default SubjectCard; 