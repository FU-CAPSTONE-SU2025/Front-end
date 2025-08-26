import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Progress, Button, InputNumber, Tag } from 'antd';
import { CalculatorOutlined, InfoCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import CourseTimeline from '../../components/student/courseTimeline';
import GradeCalculator from '../../components/student/gradeCalculator';
import TodoList from '../../components/student/todoList';
import { useJoinedSubjectById, useSubjectCheckpoints } from '../../hooks/useStudentFeature';
import { JoinedSubject } from '../../interfaces/IStudent';

interface Grade {
  name: string;
  score: number | null;
  weight?: number;
  isEditable?: boolean;
  isSuggested?: boolean;
}

// Mock data for grades - In a real app, you'd fetch this based on subjectId
const getMockGradeData = (subjectCode: string) => ({
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
});

const SubjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Parse ID once and memoize it
    const parsedId = useMemo(() => id ? parseInt(id) : null, [id]);

    // Fetch subject data by ID
    const { data: subject, isLoading: subjectLoading, error: subjectError } = useJoinedSubjectById(parsedId);

    // Use joinedSubjectId (which is the subject.id) for fetching checkpoints
    const joinedSubjectId = useMemo(() => subject?.id || null, [subject?.id]);

    // Fetch subject checkpoints/todo list
    const { data: checkpoints, isLoading: checkpointsLoading, error: checkpointsError } = useSubjectCheckpoints(joinedSubjectId);

    // Memoize mock data to prevent recreation on every render
    const mockData = useMemo(() => 
        subject ? getMockGradeData(subject.subjectCode) : null, 
        [subject?.subjectCode]
    );

    useEffect(() => {
        if (mockData) {
            setGrades(mockData.grades);
        }
    }, [mockData]);

    const handleGoBack = () => {
        navigate(-1);
    };

    if (subjectLoading) {
        return (
            <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden flex items-center justify-center">
                <div className="text-white text-xl">Loading subject details...</div>
            </div>
        );
    }

    if (subjectError) {
        return (
            <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden flex items-center justify-center">
                <div className="text-red-400 text-xl">Error loading subject: {subjectError.message}</div>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden flex items-center justify-center">
                <div className="text-white text-xl">Subject not found.</div>
            </div>
        );
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
    const attendancePercentage = mockData ? (mockData.progress.completed / mockData.progress.total) * 100 : 0;

    // Calculate progress based on subject status
    const getProgressPercentage = () => {
        if (subject.isCompleted) return 100;
        if (subject.isPassed) return 80;
        return 30;
    };

    return (
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
            {/* Header with Back Button */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={handleGoBack}
                        className="!text-white !border-white/30 !bg-white/10 hover:!bg-white/20 !h-10 !px-4 !flex !items-center !gap-2 !backdrop-blur-md"
                        size="large"
                    >
                        Back
                    </Button>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold">{subject.subjectCode}</h1>
                <p className="text-lg text-gray-300">{subject.name}</p>
                
                {/* Subject Status and Info */}
                <div className="mt-4 flex flex-wrap gap-4">
                    <Tag color={subject.isCompleted ? "green" : subject.isPassed ? "blue" : "orange"} className="text-base">
                        {subject.isCompleted ? "Completed" : subject.isPassed ? "Passed" : "In Progress"}
                    </Tag>
                    <Tag color="cyan" className="text-base">{subject.credits} Credits</Tag>
                    <Tag color="purple" className="text-base">Version {subject.subjectVersionCode}</Tag>
                    {subject.semesterName && (
                        <Tag color="geekblue" className="text-base">{subject.semesterName}</Tag>
                    )}
                    {subject.githubRepositoryURL && (
                        <Tag color="green" className="text-base">
                            <a href={subject.githubRepositoryURL} target="_blank" rel="noopener noreferrer" className="text-white">
                                GitHub Repository
                            </a>
                        </Tag>
                    )}
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Todo List */}
                <motion.div 
                    className="lg:col-span-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <TodoList 
                        checkpoints={checkpoints || []} 
                        isLoading={checkpointsLoading}
                        joinedSubjectId={joinedSubjectId}
                    />
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
                                percent={getProgressPercentage()} 
                                format={() => <span className="text-white text-3xl font-bold">{getProgressPercentage()}%</span>}
                                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                                trailColor="rgba(255,255,255,0.1)"
                                width={140}
                            />
                        </div>
                        <p className="text-center text-gray-300 mb-6">
                            {mockData ? `${mockData.progress.absentPercentage}% absent so far (${mockData.progress.absentCount} absent on ${mockData.progress.totalSessions} total)` : 'No attendance data available'}
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