import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Row, Col, Avatar, Typography, Tag, Input, Button, Modal, Progress } from 'antd';
import { ArrowLeftOutlined, BookOutlined, UserOutlined, CalendarOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import styles from '../../css/staff/staffEditTranscript.module.css';
import TranscriptEdit from '../../components/staff/transcriptEdit';

const { Title, Text } = Typography;
const { Search } = Input;

// Mock interfaces for the data
interface StudentProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  enrolledAt: Date;
  avatarUrl: string;
  studentId: string;
  program: string;
  semester: number;
  gpa: number;
  status: 'Active' | 'Inactive' | 'Graduated';
}

interface Subject {
  id: number;
  title: string;
  code: string;
  credits: number;
  description: string;
  progress: number; // 0-100 for current subjects
  status: 'Current' | 'Completed' | 'Failed';
  semester: number;
  grade?: string;
}

// Mock data
const mockStudent: StudentProfile = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@student.edu',
  phone: '+1 234 567 8900',
  dateOfBirth: new Date('2000-05-15'),
  enrolledAt: new Date('2023-09-01'),
  avatarUrl: '/img/avatar-placeholder.png',
  studentId: 'SE171234',
  program: 'Software Engineering',
  semester: 5,
  gpa: 3.75,
  status: 'Active'
};

const mockSubjects: Subject[] = [
  { id: 1, title: 'Advanced Algorithms', code: 'CS301', credits: 3, description: 'Advanced algorithmic concepts and analysis', progress: 75, status: 'Current', semester: 5 },
  { id: 2, title: 'Database Systems', code: 'CS302', credits: 4, description: 'Database design and management systems', progress: 60, status: 'Current', semester: 5 },
  { id: 3, title: 'Software Engineering', code: 'SE301', credits: 3, description: 'Software development methodologies', progress: 85, status: 'Current', semester: 5 },
  { id: 4, title: 'Web Development', code: 'WD301', credits: 3, description: 'Modern web development frameworks', progress: 45, status: 'Current', semester: 5 },
  { id: 5, title: 'Data Structures', code: 'CS201', credits: 3, description: 'Fundamental data structures', progress: 100, status: 'Completed', semester: 3, grade: 'A' },
  { id: 6, title: 'Programming Fundamentals', code: 'CS101', credits: 4, description: 'Basic programming concepts', progress: 100, status: 'Completed', semester: 1, grade: 'A-' },
  { id: 7, title: 'Mathematics', code: 'MATH101', credits: 3, description: 'Calculus and linear algebra', progress: 100, status: 'Completed', semester: 1, grade: 'B+' },
  { id: 8, title: 'Physics', code: 'PHY101', credits: 3, description: 'Basic physics principles', progress: 100, status: 'Completed', semester: 2, grade: 'B' },
];

const EditStudentTranscript: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfile>(mockStudent);
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject =>
    subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current subjects (in progress)
  const currentSubjects = subjects.filter(subject => subject.status === 'Current');

  // Handle subject click
  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalVisible(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedSubject(null);
  };

  // Function to get progress bar color based on percentage
  const getProgressColor = (progress: number) => {
    if (progress < 30) return '#ef4444'; // Red
    if (progress < 60) return '#f59e0b'; // Orange
    if (progress < 80) return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/staff/transcript')}
          className={styles.backButton}
        >
          Back to Transcript List
        </Button>
        <Title level={2} className={styles.pageTitle}>
          Student Transcript - {student.firstName} {student.lastName}
        </Title>
      </div>

      <Row gutter={24} className={styles.mainContent}>
        {/* Left Side - Student Profile (30%) */}
        <Col span={7}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <Avatar size={120} src={student.avatarUrl} icon={<UserOutlined />} />
                <div className={styles.profileInfo}>
                  <Title level={3} className={styles.studentName}>
                    {student.firstName} {student.lastName}
                  </Title>
                  <Text className={styles.studentId}>{student.studentId}</Text>
                  <Tag color={student.status === 'Active' ? 'green' : 'orange'} className={styles.statusTag}>
                    {student.status}
                  </Tag>
                </div>
              </div>

              <div className={styles.profileDetails}>
                <div className={styles.detailItem}>
                  <MailOutlined className={styles.detailIcon} />
                  <Text>{student.email}</Text>
                </div>
                <div className={styles.detailItem}>
                  <PhoneOutlined className={styles.detailIcon} />
                  <Text>{student.phone}</Text>
                </div>
                <div className={styles.detailItem}>
                  <CalendarOutlined className={styles.detailIcon} />
                  <Text>Born: {student.dateOfBirth.toLocaleDateString()}</Text>
                </div>
                <div className={styles.detailItem}>
                  <BookOutlined className={styles.detailIcon} />
                  <Text>Enrolled: {student.enrolledAt.toLocaleDateString()}</Text>
                </div>
              </div>

              <div className={styles.academicInfo}>
                <Title level={4}>Academic Information</Title>
                <div className={styles.academicGrid}>
                  <div className={styles.academicItem}>
                    <Text strong>Program</Text>
                    <Text>{student.program}</Text>
                  </div>
                  <div className={styles.academicItem}>
                    <Text strong>Current Semester</Text>
                    <Text>{student.semester}</Text>
                  </div>
                  <div className={styles.academicItem}>
                    <Text strong>GPA</Text>
                    <Text className={styles.gpa}>{student.gpa.toFixed(2)}</Text>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Right Side - Subjects (70%) */}
        <Col span={17}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Current Subjects Card */}
            <Card className={styles.subjectsCard} style={{ marginBottom: 24 }}>
              <Title level={4} className={styles.sectionTitle}>
                Current Studying Subjects
              </Title>
              <Row gutter={[16, 16]}>
                {currentSubjects.map((subject, index) => (
                  <Col span={12} key={subject.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card 
                        className={styles.subjectCard}
                        hoverable
                        onClick={() => handleSubjectClick(subject)}
                      >
                        <div className={styles.subjectHeader}>
                          <Text strong className={styles.subjectTitle}>{subject.title}</Text>
                          <Text className={styles.subjectCode}>{subject.code}</Text>
                        </div>
                        <Text className={styles.subjectDescription}>{subject.description}</Text>
                        <div className={styles.progressSection}>
                          <Text>Progress</Text>
                          <Progress 
                            percent={subject.progress} 
                            size="small" 
                            strokeColor={getProgressColor(subject.progress)}
                            trailColor="#f1f5f9"
                          />
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* All Subjects Card */}
            <Card className={styles.allSubjectsCard}>
              <div className={styles.allSubjectsHeader}>
                <Title level={4} className={styles.sectionTitle}>
                  All Subjects
                </Title>
                <Search
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: 300 }}
                  className={styles.searchBar}
                />
              </div>
              
              <div className={styles.subjectsList}>
                {filteredSubjects.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card 
                      className={styles.subjectListItem}
                      hoverable
                      onClick={() => handleSubjectClick(subject)}
                    >
                      <Row align="middle">
                        <Col span={8}>
                          <Text strong>{subject.title}</Text>
                          <br />
                          <Text type="secondary">{subject.code}</Text>
                        </Col>
                        <Col span={6}>
                          <Text>Credits: {subject.credits}</Text>
                        </Col>
                        <Col span={4}>
                          <Text>Semester {subject.semester}</Text>
                        </Col>
                        <Col span={3}>
                          <Tag color={
                            subject.status === 'Current' ? 'blue' : 
                            subject.status === 'Completed' ? 'green' : 'red'
                          }>
                            {subject.status}
                          </Tag>
                        </Col>
                        <Col span={3}>
                          {subject.grade && (
                            <Text strong className={styles.grade}>{subject.grade}</Text>
                          )}
                        </Col>
                      </Row>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Transcript Edit Modal */}
      <Modal
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        className={styles.transcriptModal}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      >
        {selectedSubject && (
          <TranscriptEdit 
            transcriptId={selectedSubject.id}
            subject={selectedSubject}
            onClose={handleModalClose}
          />
        )}
      </Modal>
    </div>
  );
};

export default EditStudentTranscript;