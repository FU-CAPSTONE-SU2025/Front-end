import React from 'react';
import { Button, Divider } from 'antd';
import { motion } from 'framer-motion';

const roadmapButtons = [
  ['Frontend', 'Backend', 'GPA 8 graduate', 'Graduation eligible', 'Devops'],
  ['Fullstack', 'Ai Engineer', 'Data Analyst', 'Android', 'iOS'],
  ['UX Design', 'Game Developer', 'Blockchain', 'QA', 'Software Architect'],
];

const buttonVariants = {
  hover: { scale: 1.07, boxShadow: '0 4px 16px rgba(249,115,22,0.15)', backgroundColor: 'rgba(255,255,255,0.08)' },
  tap: { scale: 0.97 },
};

const SemesterPlanner = () => {
  return (
    <div className="flex mt-10 flex-col min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 to-blue-900 py-12">
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
          className="flex flex-row items-center gap-2 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Button type="default" className="rounded-full px-8 py-2 text-lg font-semibold border-white/40 text-white bg-white/10 hover:bg-white/20 transition-all shadow-md" style={{ borderColor: '#fff', color: '#fff' }}>
            Roadmaps
          </Button>
        </motion.div>
        <Divider className="bg-white/30" />
        <div className="flex flex-col gap-6 w-full">
          {roadmapButtons.map((row, i) => (
            <div key={i} className="flex flex-row flex-wrap justify-center gap-6">
              {row.map((label) => (
                <motion.button
                  key={label}
                  className="rounded-xl border border-white/40 text-white text-lg px-8 py-3 font-medium bg-white/10 hover:bg-white/20 transition-all duration-200 shadow-md min-w-[160px]"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {label}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SemesterPlanner;
