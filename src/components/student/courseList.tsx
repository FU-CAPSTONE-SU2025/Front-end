import React from 'react';
import SubjectCard from './subjectCard';
import { motion } from 'framer-motion';

interface Course {
  code: string;
  name: string;
  progress: number;
}

const CourseList: React.FC<{ courses: Course[] }> = ({ courses }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
    {courses.map((course, index) => (
      <motion.div
        key={course.code + course.name}
        className="transform transition-all duration-300 hover:scale-105"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
      >
        <SubjectCard
          code={course.code}
          name={course.name}
          progress={course.progress}
        />
      </motion.div>
    ))}
  </div>
);

export default CourseList; 