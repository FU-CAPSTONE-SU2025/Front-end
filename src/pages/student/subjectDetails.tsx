import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Progress, Button, InputNumber, Tag } from 'antd';
import { CalculatorOutlined, InfoCircleOutlined } from '@ant-design/icons';
import CourseTimeline from '../../components/student/courseTimeline';
import GradeCalculator from '../../components/student/gradeCalculator';

interface Grade {
  name: string;
  score: number | null;
  weight?: number;
  isEditable?: boolean;
  isSuggested?: boolean;
}

// Mock data - In a real app, you'd fetch this based on subjectCode
const subjectData = {
  PRN212: {
    code: 'PRN212',
    name: 'Basic Cross-Platform Application Programming With .NET',
    timeline: [
        { date: 'June 9, 2024', type: 'Assignment 1', description: 'Create a Winform login and logout' },
        { date: 'June 9, 2024', type: 'Assignment 2', description: 'Work with database and LINQ' },
        { date: 'June 9, 2024', type: 'Lab 1', description: 'Build a simple calculator' },
        { date: 'June 9, 2024', type: 'Lab 2', description: 'Implement data validation' },
        { date: 'June 9, 2024', type: 'Assignment 3', description: 'Develop a small management app' },
        { date: 'June 9, 2024', type: 'Practical Exam', description: 'Practical examination of all concepts' },
        { date: 'June 9, 2024', type: 'Final Exam', description: 'Final written and practical exam' },
      ],
      grades: [
        { name: 'Assignment 1', score: 10, weight: 10 },
        { name: 'Assignment 2', score: 9, weight: 10 },
        { name: 'Assignment 3', score: null, weight: 10, isEditable: true },
        { name: 'Assignment 4', score: null, weight: 10, isEditable: true },
        { name: 'Lab 1', score: 10, weight: 5 },
        { name: 'Lab 2', score: 9, weight: 5 },
        { name: 'Lab 3', score: null, weight: 5, isEditable: true },
        { name: 'Practical Exam', score: null, weight: 20, isEditable: true },
        { name: 'Final Exam', score: null, weight: 30, isEditable: true },
      ],
      progress: {
        completed: 20,
        total: 24,
        absentPercentage: 10,
        absentCount: 2,
        totalSessions: 20,
      }
  },
  // Add other subjects here
};

const SubjectDetails = () => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // const { subjectCode } = useParams<{ subjectCode: string }>();
    // const details = subjectData[subjectCode as keyof typeof subjectData];

    // Using mock data directly for now
    const details = subjectData.PRN212;

    useEffect(() => {
        if (details) {
            setGrades(details.grades);
        }
    }, [details]);

    if (!details) {
        return <div className="text-white text-center pt-40">Subject not found.</div>;
    }

    const calculateCurrentScore = (gradeList: Grade[]) => {
        const completedGrades = gradeList.filter(grade => grade.score !== null);
        if (completedGrades.length === 0) return 0;
        
        const totalWeight = gradeList.reduce((sum, grade) => sum + (grade.weight || 0), 0);
        const weightedSum = completedGrades.reduce((sum, grade) => 
            sum + ((grade.score || 0) * (grade.weight || 0)), 0);
        
        return weightedSum / totalWeight;
    };

    const handleGradeChange = (index: number, value: number | null) => {
        const updatedGrades = [...grades];
        updatedGrades[index] = { ...updatedGrades[index], score: value };
        setGrades(updatedGrades);
    };

    const handleGradesUpdate = (updatedGrades: Grade[]) => {
        setGrades(updatedGrades);
    };

    const currentScore = calculateCurrentScore(grades);
    const attendancePercentage = (details.progress.completed / details.progress.total) * 100;

    return (
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="text-4xl md:text-5xl font-bold">{details.code}</h1>
                <p className="text-lg text-gray-300">{details.name}</p>
            </motion.div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Timeline */}
                <motion.div 
                    className="lg:col-span-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <CourseTimeline initialTimeline={details.timeline} />
                </motion.div>

                {/* Right Column: Grades & Progress */}
                <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold">Current Score</h2>
                            <Tag color={currentScore >= 5 ? "green" : "red"} className="text-lg font-bold">
                                {currentScore.toFixed(2)}/10
                            </Tag>
                        </div>
                        
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<CalculatorOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            className="w-full !h-12 !text-base !font-bold !bg-orange-500 hover:!bg-orange-600 !border-orange-500 mb-4"
                        >
                            Pass Score Calculator
                        </Button>

                        <div className="text-center text-gray-300 text-sm">
                            <InfoCircleOutlined className="mr-1" />
                            Click to calculate required scores for passing
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-center">Progress Summary</h2>
                        <div className="flex justify-center items-center gap-6 mb-6">
                            <Progress 
                                type="dashboard" 
                                percent={attendancePercentage} 
                                format={() => <span className="text-white text-3xl font-bold">{`${details.progress.completed}/${details.progress.total}`}</span>}
                                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                                trailColor="rgba(255,255,255,0.1)"
                                width={140}
                            />
                        </div>
                        <p className="text-center text-gray-300 mb-6">
                            {details.progress.absentPercentage}% absent so far ({details.progress.absentCount} absent on {details.progress.totalSessions} total)
                        </p>
                        
                        <h3 className="font-semibold mb-4">Grade Details</h3>
                        <div className="space-y-3">
                            {grades.map((grade, index) => (
                                <div key={index} className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-200">{grade.name}</span>
                                        {grade.isEditable && grade.score === null && (
                                            <Tag color="orange">Pending</Tag>
                                        )}
                                        {grade.isSuggested && (
                                            <Tag color="blue">Suggested</Tag>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {grade.isEditable ? (
                                            <InputNumber
                                                min={0}
                                                max={10}
                                                step={0.1}
                                                value={grade.score}
                                                onChange={(value) => handleGradeChange(index, value)}
                                                className="!w-20 !bg-white/10 !border-white/20 !text-white"
                                                placeholder="Score"
                                            />
                                        ) : (
                                            <span className="font-bold text-lg">{grade.score}</span>
                                        )}
                                        <span className="text-gray-400 text-sm">({grade.weight}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Grade Calculator Modal */}
            <GradeCalculator
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                grades={grades}
                onGradesUpdate={handleGradesUpdate}
            />
        </div>
    );
};

export default SubjectDetails;
