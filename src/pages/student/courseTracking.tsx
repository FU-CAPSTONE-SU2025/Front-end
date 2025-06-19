import React, { useState } from 'react';
import { Select, Card, Timeline } from 'antd';
import { motion } from 'framer-motion';

const semesters = [
  { label: 'Summer 2025 Semester', value: 'summer2025' },
  { label: 'Spring 2025 Semester', value: 'spring2025' },
  { label: 'Fall 2024 Semester', value: 'fall2024' },
];

const courses = [
  { code: 'PRN212', name: 'Basic Cross-Platform Application Programming With .NET' },
  { code: 'PRN212', name: 'Basic Cross-Platform Application Programming With .NET' },
  { code: 'PRN212', name: 'Basic Cross-Platform Application Programming With .NET' },
  { code: 'PRN212', name: 'Basic Cross-Platform Application Programming With .NET' },
  { code: 'PRN212', name: 'Basic Cross-Platform Application Programming With .NET' },
];

const importantExams = [
  {
    date: 'June 9, 2024',
    type: 'Practical Exam',
    course: 'PRN212',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
  {
    date: 'June 9, 2024',
    type: 'Practical Exam',
    course: 'PRM231',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
  {
    date: 'June 9, 2024',
    type: 'Practical Exam',
    course: 'PMG201c',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
  {
    date: 'June 9, 2024',
    type: 'Final Exam',
    course: 'PMG201c',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
  {
    date: 'June 9, 2024',
    type: 'Final Exam',
    course: 'PRM231',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
  {
    date: 'June 9, 2024',
    type: 'Final Exam',
    course: 'PRN212',
    name: 'Basic Cross-Platform Application Programming With .NET',
  },
];

// Fake GitHub-style commit chart data
const days = Array.from({ length: 52 * 7 }, (_, i) => i);
const getRandom = () => Math.floor(Math.random() * 5);
const commitData = days.map(() => getRandom());

const CommitChart = () => (
  <div className="overflow-x-auto p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg">
    <div className="grid grid-cols-52 grid-rows-7 gap-1.5">
      {commitData.map((level, idx) => (
        <motion.div
          key={idx}
          className={`w-4 h-4 rounded-sm transition-colors duration-300 ${
            level === 0
              ? 'bg-gray-700'
              : level === 1
              ? 'bg-teal-300'
              : level === 2
              ? 'bg-teal-400'
              : level === 3
              ? 'bg-teal-500'
              : 'bg-teal-600'
          }`}
          whileHover={{ scale: 1.2, zIndex: 10 }}
          title={`Commits: ${level}`}
        />
      ))}
    </div>
    <div className="flex justify-between text-xs mt-4 text-gray-300 font-medium">
      <span>Jan</span>
      <span>Feb</span>
      <span>Mar</span>
      <span>Apr</span>
      <span>May</span>
      <span>Jun</span>
      <span>Jul</span>
      <span>Aug</span>
      <span>Sep</span>
      <span>Oct</span>
      <span>Nov</span>
      <span>Dec</span>
    </div>
  </div>
);

const CourseTracking = () => {
  const [semester, setSemester] = useState(semesters[0].value);

  return (
    <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 w-full"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Course Dashboard</h1>
        <Select
          value={semester}
          onChange={setSemester}
          options={semesters}
          className="w-full max-w-xs"
          size="large"
          popupClassName="bg-gray-800 text-white"
          style={{ color: 'white' }}
        />
      </motion.div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 w-full">
        {courses.map((course, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)' }}
            className="w-full"
          >
            <Card
              className="h-40 bg-gradient-to-br from-teal-500 to-teal-700 border-none rounded-xl shadow-lg overflow-hidden w-full"
              hoverable
            >
              <div className="flex flex-col justify-between h-full p-4">
                <div className="font-bold text-xl text-white">{course.code}</div>
                <div className="text-sm text-gray-100 opacity-90 line-clamp-2">{course.name}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Commit Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-12 w-full"
      >
        <h2 className="text-2xl font-semibold text-white mb-4">Activity Overview</h2>
        <CommitChart />
      </motion.div>

      {/* Important Exams */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full"
      >
        <h2 className="text-2xl font-semibold text-white mb-4">Important Exams</h2>
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg w-full">
          <Timeline mode="alternate" className="mt-4">
            {importantExams.map((exam, idx) => (
              <Timeline.Item
                key={idx}
                label={
                  <span className="text-gray-300 font-medium text-sm">{exam.date}</span>
                }
                color="teal"
                dot={
                  <motion.div
                    className="w-3 h-3 bg-teal-500 rounded-full"
                    whileHover={{ scale: 1.5 }}
                  />
                }
              >
                <motion.div
                  className="text-white"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="font-semibold text-lg">{exam.type}</div>
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3 mt-2">
                    <div className="font-bold text-teal-300">{exam.course}</div>
                    <div className="text-sm text-gray-300 opacity-90">{exam.name}</div>
                  </div>
                </motion.div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseTracking;