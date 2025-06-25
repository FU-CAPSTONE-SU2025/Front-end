import React from 'react';
import { Divider } from 'antd';
import { motion } from 'framer-motion';
import RoadmapButtons from '../../components/student/roadmapButtons';

const roadmapButtons = [
  'Frontend', 'Backend', 'GPA 8 graduate', 'Graduation eligible', 'Devops',
  'Fullstack', 'Ai Engineer', 'Data Analyst', 'Android', 'iOS',
  'UX Design', 'Game Developer', 'Blockchain', 'QA', 'Software Architect',
];



const SemesterPlanner = () => {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 to-blue-900 py-12">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4 drop-shadow-lg"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Your Path to Becoming a Software Engineer
      </motion.h1>
      <motion.p
        className="text-lg md:text-xl text-white/90 text-center max-w-3xl mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        The roadmap below is generated based on your learning data. Using AI-powered analysis, we've crafted a personalized plan tailored to your journey. Here are our suggestions to guide your future path in software engineering.
      </motion.p>
      <div className="w-full max-w-4xl flex flex-col items-center">
        <motion.div
          className="flex flex-row items-center gap-2 "
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div
            className="px-8 py-2 rounded-full text-lg font-bold text-white shadow-md border border-white/30 bg-white/20 backdrop-blur-sm tracking-wide mb-8 select-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.18)',
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.3)',
              boxShadow: '0 2px 12px 0 rgba(255,186,73,0.10), 0 1.5px 6px rgba(49,130,206,0.08)',
              letterSpacing: 1.2,
            }}
          >
            <span className="drop-shadow-md">Roadmaps</span>
          </div>
        </motion.div>
        <Divider className="bg-white/30" />
        <RoadmapButtons roadmapButtons={roadmapButtons} />
      </div>
    </div>
  );
};

export default SemesterPlanner;
