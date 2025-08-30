import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Progress, Button, InputNumber, Tag, Tabs, Tooltip } from 'antd';
import { CalculatorOutlined, InfoCircleOutlined, ArrowLeftOutlined, RobotOutlined, CheckSquareOutlined, BarChartOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import GradeCalculator from '../../components/student/gradeCalculator';
import TodoList from '../../components/student/todoList';
import AIGenerateTodoTab from '../../components/student/aiGenerateTodoTab';
import { useJoinedSubjectById, useSubjectCheckpoints, useSubjectMarks, useGitHubRepoData, useUpdateGitHubRepoURL } from '../../hooks/useStudentFeature';
import '../../css/student/subjectDetails.module.css';
import CommitChart from '../../components/student/commitChart';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';

interface Grade {
  name: string;
  score: number | null;
  weight?: number;
  isEditable?: boolean;
  isSuggested?: boolean;
}

// Transform API marks data to Grade format
const transformMarksToGrades = (marks: any[]): Grade[] => {
  if (!marks || marks.length === 0) return [];
  
  return marks.map(mark => ({
    name: mark.category,
    score: mark.score,
    weight: mark.weight,
    isEditable: false, // Marks from API are read-only
    isSuggested: false
  }));
};

const SubjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('todo');
    const [isGitHubConnected, setIsGitHubConnected] = useState(false);
    
    // Message popup context
    const { showSuccess, showError, showWarning, showInfo } = useMessagePopupContext();

    // Parse ID once and memoize it
    const parsedId = useMemo(() => id ? parseInt(id) : null, [id]);

    // Fetch subject data by ID
    const { data: subject, isLoading: subjectLoading, error: subjectError } = useJoinedSubjectById(parsedId);

    // Use joinedSubjectId (which is the subject.id) for fetching checkpoints
    const joinedSubjectId = useMemo(() => subject?.id || null, [subject?.id]);

    // Fetch subject checkpoints/todo list
    const { data: checkpoints, isLoading: checkpointsLoading, error: checkpointsError, refetch: refetchCheckpoints } = useSubjectCheckpoints(joinedSubjectId);

    // Fetch subject marks
    const { data: marks, isLoading: marksLoading, error: marksError, refetch: refetchMarks } = useSubjectMarks(joinedSubjectId);

    // Parse GitHub URL to extract owner and repo name
    const gitHubInfo = useMemo(() => {
        if (!subject?.githubRepositoryURL) return null;
        
        try {
            const match = subject.githubRepositoryURL.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (match) {
                return {
                    owner: match[1],
                    repoName: match[2].replace(/\.git$/, '') // Remove .git if present
                };
            }
        } catch (error) {
            console.error('Error parsing GitHub URL:', error);
        }
        return null;
    }, [subject?.githubRepositoryURL]);

    // Fetch GitHub repository data
    const { 
        data: gitHubRepoData, 
        isLoading: gitHubLoading, 
        error: gitHubError 
    } = useGitHubRepoData(gitHubInfo?.owner || null, gitHubInfo?.repoName || null);

    // Update GitHub repository URL
    const { mutateAsync: updateGitHubRepoURL, isPending: isUpdatingGitHub } = useUpdateGitHubRepoURL();

    // Auto-connect GitHub if we have a valid repository URL
    useEffect(() => {
        if (gitHubInfo && !isGitHubConnected) {
            setIsGitHubConnected(true);
        }
    }, [gitHubInfo, isGitHubConnected]);

    // Handle GitHub URL update
    const handleUpdateGitHubURL = async (joinedSubjectId: number, publicRepoURL: string) => {
        try {
            await updateGitHubRepoURL({ joinedSubjectId, publicRepoURL });
            showSuccess('GitHub repository updated successfully!');
        } catch (error) {
            showError('Failed to update GitHub repository');
            throw error; // Re-throw to let CommitChart handle it
        }
    };

    // Transform marks data to grades format
    const transformedGrades = useMemo(() => 
        marks ? transformMarksToGrades(marks) : [], 
        [marks]
    );

    useEffect(() => {
        setGrades(transformedGrades);
    }, [transformedGrades]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleAISuccess = () => {
        // Refetch checkpoints after AI generates new ones
        refetchCheckpoints();
        // Switch to todo tab to show the new items
        setActiveTab('todo');
    };

    if (subjectLoading || marksLoading) {
        return (
            <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden flex items-center justify-center">
                <div className="text-white text-xl">Loading subject details...</div>
            </div>
        );
    }

    if (subjectError || marksError) {
        return (
            <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden flex items-center justify-center">
                <div className="text-red-400 text-xl">Error loading subject: {subjectError?.message || marksError?.message}</div>
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



    // Calculate progress based on completed grades weight
    const getProgressPercentage = () => {
        if (subject.isCompleted) return 100;
        
        // Calculate progress based on completed grades weight
        const completedGrades = grades.filter(grade => grade.score !== null);
        const totalWeight = grades.reduce((sum, grade) => sum + (grade.weight || 0), 0);
        const completedWeight = completedGrades.reduce((sum, grade) => sum + (grade.weight || 0), 0);
        
        if (totalWeight === 0) return 0;
        
        // Calculate actual progress percentage based on completed weight
        const progressPercentage = (completedWeight / totalWeight) * 100;
        return Math.round(progressPercentage);
    };

    // Tab items configuration
    const tabItems = [
        {
            key: 'todo',
            label: (
                <span className="flex items-center text-lg gap-2">
                    <span className='!text-white'>Todo List</span>
                </span>
            ),
            children: (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <TodoList 
                        checkpoints={checkpoints || []} 
                        isLoading={checkpointsLoading}
                        joinedSubjectId={joinedSubjectId}
                    />
                </motion.div>
            )
        },
        {
            key: 'ai-generate',
            label: (
                <span className="flex items-center text-lg gap-2">
                    <span className='!text-white'>AI Generate Todo</span>
                </span>
            ),
            children: (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {joinedSubjectId ? (
                        <AIGenerateTodoTab 
                            joinedSubjectId={joinedSubjectId}
                            onSuccess={handleAISuccess}
                        />
                    ) : (
                        <div className="text-center py-12 text-gray-300">
                            Loading subject data...
                        </div>
                    )}
                </motion.div>
            )
        },
        {
            key: 'grades',
            label: (
                <span className="flex items-center text-lg gap-2">
                    <span className='!text-white'>Grades & Progress</span>
                </span>
            ),
            children: (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-8 !mb-10"
                >
                  
                    
                                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl !text-white font-semibold">Progress Summary</h2>
                            <Tooltip 
                                title="Calculate Pass Score" 
                                placement="left"
                                color="rgba(0, 0, 0, 0.8)"
                            >
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    icon={<CalculatorOutlined />}
                                    onClick={() => setIsModalVisible(true)}
                                    className="!h-10 !w-10 !p-0 !flex !items-center !justify-center !bg-orange-500 hover:!bg-orange-600 !border-orange-500 !rounded-full !shadow-lg hover:!shadow-xl !transition-all !duration-300 !relative !z-50"
                                />
                            </Tooltip>
                        </div>
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
                            {(() => {
                                const completedGrades = grades.filter(grade => grade.score !== null);
                                const totalWeight = grades.reduce((sum, grade) => sum + (grade.weight || 0), 0);
                                const completedWeight = completedGrades.reduce((sum, grade) => sum + (grade.weight || 0), 0);
                                
                                if (grades.length === 0) {
                                    return 'No grades available for this subject';
                                }
                                
                                const weightStatus = totalWeight === 100 
                                    ? 'Complete grading structure' 
                                    : `Incomplete grading structure (${totalWeight}% of 100%)`;
                                
                                return `${completedGrades.length} of ${grades.length} grades completed (${completedWeight}% of ${totalWeight}% total weight) - ${weightStatus}`;
                            })()}
                        </p>
                        
                        <h3 className="font-semibold mb-4 text-white">Grade Details</h3>
                        <div className="space-y-3">
                            {grades.length > 0 ? (
                                grades.map((grade, index) => (
                                    <div key={index} className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                                                                            <div className="flex items-center gap-2">
                                        <span className="text-gray-200">{grade.name}</span>
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
                                                <span className="font-bold text-white text-lg">{grade.score}</span>
                                            )}
                                            <span className="text-gray-400 text-sm">({grade.weight}%)</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    No grades available for this subject
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )
        }
    ];

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
                    <Tag 
                        color={subject.isCompleted ? "success" : subject.isPassed ? "processing" : "warning"} 
                        className="text-base font-semibold"
                        style={{
                            backgroundColor: subject.isCompleted ? '#52c41a' : subject.isPassed ? '#1890ff' : '#faad14',
                            color: 'white',
                            border: 'none'
                        }}
                    >
                        {subject.isCompleted ? "Completed" : subject.isPassed ? "Passed" : "In Progress"}
                    </Tag>
                    <Tag 
                        color="cyan" 
                        className="text-base font-semibold"
                        style={{
                            backgroundColor: '#13c2c2',
                            color: 'white',
                            border: 'none'
                        }}
                    >
                        {subject.credits} Credits
                    </Tag>
                    <Tag 
                        color="purple" 
                        className="text-base font-semibold"
                        style={{
                            backgroundColor: '#722ed1',
                            color: 'white',
                            border: 'none'
                        }}
                    >
                        Version {subject.subjectVersionCode}
                    </Tag>
                    {subject.semesterName && (
                        <Tag 
                            color="geekblue" 
                            className="text-base font-semibold"
                            style={{
                                backgroundColor: '#2f54eb',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            {subject.semesterName}
                        </Tag>
                    )}
                    {subject.githubRepositoryURL && (
                        <Tag 
                            color="success" 
                            className="text-base font-semibold"
                            style={{
                                backgroundColor: '#52c41a',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            <a href={subject.githubRepositoryURL} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-100">
                                GitHub Repository
                            </a>
                        </Tag>
                    )}
                </div>
            </motion.div>

            {/* GitHub Activity Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8"
            >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl !text-white font-semibold mb-2">GitHub Activity Overview</h2>
                        <p className="text-gray-300 text-sm">Track your coding progress and commit history for this subject</p>
                    </div>
                    <CommitChart 
                        isConnected={isGitHubConnected}
                        onConnect={() => setIsGitHubConnected(true)}
                        repoData={gitHubRepoData}
                        isLoading={gitHubLoading}
                        error={gitHubError}
                        joinedSubjectId={joinedSubjectId}
                        onUpdateGitHubURL={handleUpdateGitHubURL}
                        isUpdating={isUpdatingGitHub}
                    />
                </div>
            </motion.div>

            {/* Main Content with Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    className="subject-details-tabs"
                    tabBarStyle={{
                        marginBottom: '24px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}
                    tabBarGutter={32}
                />
            </motion.div>

            {/* Grade Calculator Modal */}
            <GradeCalculator
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                grades={grades}
               
            />
        </div>
    );
};

export default SubjectDetails;