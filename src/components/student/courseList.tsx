import React from 'react';
import SubjectCard from './subjectCard';

interface Course {
  code: string;
  name: string;
  progress: number;
}

const CourseList: React.FC<{ courses: Course[] }> = ({ courses }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {courses.map((course) => (
      <SubjectCard
        key={course.code + course.name}
        code={course.code}
        name={course.name}
        progress={course.progress}
      />
    ))}
  </div>
);

export default CourseList; 