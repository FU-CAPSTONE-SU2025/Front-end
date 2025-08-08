import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Row, Col, Avatar, Typography, Tag, Input, Button, Modal, Progress, List, Spin, Select } from 'antd';
import { ArrowLeftOutlined, BookOutlined, UserOutlined, CalendarOutlined, MailOutlined, PhoneOutlined, PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import styles from '../../css/staff/staffEditTranscript.module.css';
import TranscriptEdit from '../../components/staff/transcriptEdit';
import { FetchSubjectVersionsToCurriculum } from '../../api/SchoolAPI/curriculumAPI';
import { SubjectVersionWithCurriculumInfo } from '../../interfaces/ISchoolProgram';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { RegisterOneStudentsToMultipleSubjects, RegisterStudentToSubject, FetchPagedSemesterList } from '../../api/SchoolAPI/joinedSubjectAPI';
import { CreateJoinedSubject, BulkCreateJoinedSubjects, PagedSemester } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../../components/common/bulkDataImport';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';
import { FetchStudentById } from '../../api/student/StudentAPI';
import { AccountProps } from '../../interfaces/IAccount';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

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
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { showError, showSuccess, showInfo, showWarning } = useMessagePopupContext();
  const [student, setStudent] = useState<StudentProfile>(mockStudent);
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Student account data for API calls
  const [studentAccount, setStudentAccount] = useState<AccountProps | null>(null);
  const [loadingStudentAccount, setLoadingStudentAccount] = useState(false);
  
  // Add Subject Modal states
  const [isAddSubjectModalVisible, setIsAddSubjectModalVisible] = useState(false);
  const [subjectVersions, setSubjectVersions] = useState<SubjectVersionWithCurriculumInfo[]>([]);
  const [loadingSubjectVersions, setLoadingSubjectVersions] = useState(false);
  const [searchSubjectVersion, setSearchSubjectVersion] = useState('');
  const [selectedSubjectVersion, setSelectedSubjectVersion] = useState<SubjectVersionWithCurriculumInfo | null>(null);

  // Semester states
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [semesterPage, setSemesterPage] = useState(1);
  const [semesterHasMore, setSemesterHasMore] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);

  // Bulk import states
  const [isBulkImportVisible, setIsBulkImportVisible] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject =>
    subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current subjects (in progress)
  const currentSubjects = subjects.filter(subject => subject.status === 'Current');

  // Load student account data
  const loadStudentAccount = async () => {
    if (!studentId) return;
    
    try {
      setLoadingStudentAccount(true);
      const accountData = await FetchStudentById(parseInt(studentId));
      if (accountData) {
        setStudentAccount(accountData);
      } else {
        handleError('Failed to load student account data');
      }
    } catch (error) {
      console.error('Error loading student account:', error);
      handleError('Failed to load student account data');
    } finally {
      setLoadingStudentAccount(false);
    }
  };

  // Load student account data on component mount
  useEffect(() => {
    loadStudentAccount();
  }, [studentId]);

  // Load semesters with infinite scroll
  const loadSemesters = async (page: number = 1, append: boolean = false) => {
    try {
      setLoadingSemesters(true);
      const result = await FetchPagedSemesterList(page, 20);
      
      if (result) {
        const newSemesters = result.items || [];
        if (append) {
          setSemesters(prev => [...prev, ...newSemesters]);
        } else {
          setSemesters(newSemesters);
        }
        
        setSemesterHasMore(newSemesters.length === 20 && result.totalCount > (page * 20));
        setSemesterPage(page);
      }
    } catch (error) {
      console.error('Error loading semesters:', error);
      handleError('Failed to load semesters');
    } finally {
      setLoadingSemesters(false);
    }
  };

  // Handle semester selection
  const handleSemesterSelect = (semester: any) => {
    setSelectedSemester(semester);
  };

  // Handle semester scroll for infinite loading
  const handleSemesterScroll = (e: any) => {
    const { target } = e;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight && !loadingSemesters && semesterHasMore) {
      loadSemesters(semesterPage + 1, true);
    }
  };

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

  // Handle add subject click
  const handleAddSubjectClick = async () => {
    setIsAddSubjectModalVisible(true);
    setLoadingSubjectVersions(true);
    setLoadingSemesters(true);
    try {
      // Fetch subject versions for the student's curriculum
      const subjectVersions = await FetchSubjectVersionsToCurriculum(1); // Assuming curriculum ID 1 for now
      setSubjectVersions(subjectVersions || []);
      
      // Load initial semesters
      await loadSemesters(1, false);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingSubjectVersions(false);
      setLoadingSemesters(false);
    }
  };

  // Handle Add Subject modal close
  const handleAddSubjectModalClose = () => {
    setIsAddSubjectModalVisible(false);
    setSearchSubjectVersion('');
    setSelectedSubjectVersion(null);
  };

  // Handle subject version selection
  const handleSubjectVersionSelect = (subjectVersion: SubjectVersionWithCurriculumInfo) => {
    setSelectedSubjectVersion(subjectVersion);
  };

  // Handle adding student to subject version
  const handleAddStudentToSubjectVersion = async () => {
    if (!selectedSubjectVersion) {
      showWarning('Please select a subject version');
      return;
    }

    if (!selectedSemester) {
      showWarning('Please select a semester');
      return;
    }

    if (!studentAccount) {
      showWarning('Student account data not loaded');
      return;
    }

    // Show loading state
    showInfo('Adding student to subject version...');

    try {
      // Create the joined subject data
      const joinedSubjectData: CreateJoinedSubject = {
        studentUserName: studentAccount.username, // Use account username
        subjectCode: selectedSubjectVersion.subjectCode,
        subjectVersionCode: selectedSubjectVersion.versionCode,
        semesterName: selectedSemester.semesterName // Use selected semester name
      };

      // Call the API
      const result = await RegisterStudentToSubject(joinedSubjectData);
      
      if (result) {
        // Add the subject to the student's transcript
        const newSubject: Subject = {
          id: selectedSubjectVersion.subjectVersionId,
          title: selectedSubjectVersion.subjectName,
          code: selectedSubjectVersion.subjectCode,
          credits: selectedSubjectVersion.credits,
          description: `Version: ${selectedSubjectVersion.versionName}`,
          progress: 0,
          status: 'Current',
          semester: selectedSubjectVersion.semesterNumber,
        };
        
        setSubjects(prev => [...prev, newSubject]);
        handleSuccess(`Successfully added ${selectedSubjectVersion.subjectName} to student's transcript`);
        
        // Close modal and reset state
        setIsAddSubjectModalVisible(false);
        setSelectedSubjectVersion(null);
        setSelectedSemester(null);
        setSearchSubjectVersion('');
      } else {
        handleError('Failed to add student to subject version');
      }
    } catch (error) {
      console.error('Error adding student to subject version:', error);
      handleError('Failed to add student to subject version');
    }
  };

  // Handle bulk import
  const handleBulkImport = () => {
    setIsBulkImportVisible(true);
  };

  const handleBulkImportClose = () => {
    setIsBulkImportVisible(false);
    setUploadStatus('idle');
    setUploadMessage('');
  };

  const handleBulkImportData = async (importedData: { [type: string]: any[] }) => {
    try {
      setUploadStatus('uploading');
      setUploadMessage('Uploading subject assignments...');

      const joinedSubjectData = importedData['BULK_JOINED_SUBJECT'] || [];
      
      if (joinedSubjectData.length === 0) {
        setUploadStatus('error');
        setUploadMessage('No valid data found in the uploaded file.');
        return;
      }

      // TODO: Revisit this implementation when BA is done with the task
      // This is a temporary fix - the data transformation logic may need to be updated
      // based on the final API requirements and data structure specifications
      // For individual student page, we use RegisterOneStudentsToMultipleSubjects
      // Transform the data to match the expected API structure
      const bulkData: BulkCreateJoinedSubjects = {
        studentUserNames: studentAccount?.username || '', // Use account username
        subjectsData: joinedSubjectData.map((item: CreateJoinedSubject) => ({
          subjectCodes: item.subjectCode,
          subjectVersionCodes: item.subjectVersionCode,
          semesterName: item.semesterName
        }))
      };

      const result = await RegisterOneStudentsToMultipleSubjects(bulkData);
      
      if (result) {
        setUploadStatus('success');
        setUploadMessage('Successfully imported subject assignments!');
        // Refresh the subjects list
        // Note: You might need to implement a function to refresh subjects
        // loadSubjects();
      } else {
        setUploadStatus('error');
        setUploadMessage('Failed to import subject assignments.');
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      setUploadStatus('error');
      setUploadMessage('An error occurred during import. Please check your file format.');
    }
  };

  // Filter subject versions based on search
  const filteredSubjectVersions = subjectVersions.filter(subjectVersion =>
    subjectVersion.subjectName.toLowerCase().includes(searchSubjectVersion.toLowerCase()) ||
    subjectVersion.subjectCode.toLowerCase().includes(searchSubjectVersion.toLowerCase()) ||
    subjectVersion.versionName.toLowerCase().includes(searchSubjectVersion.toLowerCase())
  );

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
              <div className={styles.sectionHeader}>
                <Title level={4} className={styles.sectionTitle}>
                  Current Studying Subjects
                </Title>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <ExcelImportButton onClick={handleBulkImport} size="middle">
                    Bulk Import Subjects
                  </ExcelImportButton>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddSubjectClick}
                    className={styles.addSubjectButton}
                  >
                    Add Subject
                  </Button>
                </div>
              </div>
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

      {/* Add Subject Modal */}
      <Modal
        open={isAddSubjectModalVisible}
        onCancel={handleAddSubjectModalClose}
        title="Add Subject to Student"
        width="90%"
        style={{ top: 20 }}
        footer={null}
      >
        <Row gutter={[24, 24]}>
          {/* Left Side - Subject Versions */}
          <Col span={14}>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                Select Subject Version
              </Text>
              <Search
                placeholder="Search subject versions..."
                value={searchSubjectVersion}
                onChange={(e) => setSearchSubjectVersion(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {loadingSubjectVersions ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading subject versions...</div>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <List
                  dataSource={filteredSubjectVersions}
                  renderItem={(subjectVersion) => (
                    <List.Item
                      className={styles.subjectVersionItem}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedSubjectVersion?.subjectVersionId === subjectVersion.subjectVersionId ? '#f0f9ff' : 'transparent',
                        border: selectedSubjectVersion?.subjectVersionId === subjectVersion.subjectVersionId ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        padding: '16px'
                      }}
                      onClick={() => handleSubjectVersionSelect(subjectVersion)}
                    >
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <Text strong style={{ fontSize: '16px' }}>
                              {subjectVersion.subjectName} ({subjectVersion.subjectCode})
                            </Text>
                            <br />
                            <Text type="secondary">
                              Version: {subjectVersion.versionName} ({subjectVersion.versionCode})
                            </Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Tag color="blue">{subjectVersion.credits} credits</Tag>
                            <Tag color="green">Semester {subjectVersion.semesterNumber}</Tag>
                            <Tag color={subjectVersion.isMandatory ? 'red' : 'orange'}>
                              {subjectVersion.isMandatory ? 'Mandatory' : 'Optional'}
                            </Tag>
                          </div>
                        </div>
                        {subjectVersion.description && (
                          <Text type="secondary" style={{ fontSize: '14px' }}>
                            {subjectVersion.description}
                          </Text>
                        )}
                      </div>
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No subject versions found in this curriculum.' }}
                />
              </div>
            )}
          </Col>

          {/* Right Side - Semester Selection */}
          <Col span={10}>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                Select Semester
              </Text>
            </div>

            {loadingSemesters ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading semesters...</div>
              </div>
            ) : (
              <div 
                style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
                onScroll={handleSemesterScroll}
              >
                <List
                  dataSource={semesters}
                  renderItem={(semester) => (
                    <List.Item
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedSemester?.id === semester.id ? '#f0f9ff' : 'transparent',
                        border: selectedSemester?.id === semester.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        marginBottom: '4px',
                        padding: '12px'
                      }}
                      onClick={() => handleSemesterSelect(semester)}
                    >
                      <div style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: '14px' }}>
                          {semester.semesterName}
                        </Text>
                      </div>
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No semesters found.' }}
                />
                {loadingSemesters && semesterHasMore && (
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <Spin size="small" />
                    <div style={{ marginTop: 8, fontSize: '12px' }}>Loading more...</div>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>

        {/* Footer with buttons on left and right */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Button onClick={handleAddSubjectModalClose}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleAddStudentToSubjectVersion}
            disabled={!selectedSubjectVersion || !selectedSemester}
          >
            Add Subject
          </Button>
        </div>
      </Modal>
      
      {/* Bulk Import Modal */}
      {isBulkImportVisible && (
        <BulkDataImport
          onClose={handleBulkImportClose}
          onDataImported={handleBulkImportData}
          supportedTypes={['BULK_JOINED_SUBJECT']}
          uploadStatus={uploadStatus}
          uploadMessage={uploadMessage}
        />
      )}
    </div>
  );
};

export default EditStudentTranscript;