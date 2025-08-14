import React from 'react';
import SubjectCard from './subjectCard';
import { motion } from 'framer-motion';
import { JoinedSubject } from '../../interfaces/IStudent';

interface CourseListProps {
  subjects: JoinedSubject[];
}

const CourseList: React.FC<CourseListProps> = ({ subjects }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
    {subjects.map((subject, index) => (
      <motion.div
        key={subject.id}
        className="transform transition-all duration-300 hover:scale-105"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
      >
        <SubjectCard
          code={subject.subjectCode}
          name={subject.name}
          progress={subject.isCompleted ? 100 : subject.isPassed ? 80 : 30}
          credits={subject.credits}
          isPassed={subject.isPassed}
          isCompleted={subject.isCompleted}
        />
      </motion.div>
    ))}
  </div>
);

export default CourseList; 