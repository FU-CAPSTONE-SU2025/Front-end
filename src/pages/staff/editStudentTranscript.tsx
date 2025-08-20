import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Row, Col, Avatar, Typography, Tag, Input, Button, Modal, Progress, List, Spin, Select } from 'antd';
import { ArrowLeftOutlined, BookOutlined, UserOutlined, CalendarOutlined, MailOutlined, PlusOutlined, AccountBookOutlined, SmileOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import styles from '../../css/staff/staffEditTranscript.module.css';
import TranscriptEdit from '../../components/staff/transcriptEdit';
import { SubjectVersionWithCurriculumInfo } from '../../interfaces/ISchoolProgram';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { CreateJoinedSubject, BulkCreateJoinedSubjects, JoinedSubject } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../../components/common/bulkDataImport';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';
import { AccountProps } from '../../interfaces/IAccount';
import { useSchoolApi } from '../../hooks/useSchoolApi';
import { useStudentApi } from '../../hooks/useStudentApi';

const { Title, Text } = Typography;
const { Search } = Input;

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

const EditStudentTranscript: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { showInfo, showWarning } = useMessagePopupContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Student account data for API calls
  const [studentAccount, setStudentAccount] = useState<AccountProps | null>(null);
  
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

  // Block Type states
  const [blockTypes, setBlockTypes] = useState<any[]>([]);
  const [loadingBlockTypes, setLoadingBlockTypes] = useState(false);
  const [blockTypePage, setBlockTypePage] = useState(1);
  const [blockTypeHasMore, setBlockTypeHasMore] = useState(true);
  const [selectedBlockType, setSelectedBlockType] = useState<any>(null);

  // Bulk import states
  const [isBulkImportVisible, setIsBulkImportVisible] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // Joined subjects state
  const [joinedSubjects, setJoinedSubjects] = useState<JoinedSubject[]>([]);
  const [joinedLoading, setJoinedLoading] = useState(false);

  const loadStudentAccount = async () => {
    if (!studentId) return;
    try {
      const accountData = await FetchStudentById(parseInt(studentId));
      console.log("Account Data", accountData);
      if (accountData) {
        setStudentAccount(accountData);
      } else {
        handleError('Failed to load student account data');
      }
    } catch (error) {
      console.error('Error loading student account:', error);
      handleError('Failed to load student account data');
    } finally {
    }
  };

  const loadJoinedSubjects = async () => {
    if (!studentAccount?.studentDataDetailResponse?.id) {
      console.log('No student profile ID available');
      return;
    }
    
    const studentProfileId = studentAccount.studentDataDetailResponse.id;
    console.log('Loading joined subjects for student profile ID:', studentProfileId);
    
    try {
      setJoinedLoading(true);
      const res = await FetchJoinedSubjectList(1, 10, studentProfileId);
      console.log('FetchJoinedSubjectList response:', res);
      console.log('Response type:', typeof res);
      console.log('Response keys:', res ? Object.keys(res) : 'null');
      
      // Handle different possible response structures
      let subjects: JoinedSubject[] = [];
      
      if (res) {
        const response = res as any; // Type as any to handle different structures
        if (response.items && Array.isArray(response.items)) {
          // Expected PagedJoinedSubject structure
          subjects = response.items as JoinedSubject[];
          console.log('Using res.items:', subjects);
        } else if (Array.isArray(response)) {
          // Direct array response
          subjects = response as JoinedSubject[];
          console.log('Using direct array response:', subjects);
        } else if (response.data && Array.isArray(response.data)) {
          // Nested data structure
          subjects = response.data as JoinedSubject[];
          console.log('Using res.data:', subjects);
        } else {
          console.log('Unexpected response structure:', response);
          subjects = [];
        }
      }
      
      console.log('Final subjects to set:', subjects);
      setJoinedSubjects(subjects);
      
    } catch (e) {
      console.error('Failed to load joined subjects:', e);
      handleError('Failed to load joined subjects');
      setJoinedSubjects([]);
    } finally {
      setJoinedLoading(false);
    }
  };

  // Load student account when route param changes
  useEffect(() => {
    loadStudentAccount();
  }, [studentId]);

  // Load joined subjects when student account is loaded
  useEffect(() => {
    if (studentAccount?.studentDataDetailResponse?.id) {
      loadJoinedSubjects();
    }
  }, [studentAccount]);
  // Load semesters with infinite scroll
  const loadSemesters = async (page: number = 1, append: boolean = false) => {
    try {
      setLoadingSemesters(true);
      console.log('Loading semesters, page:', page);
      const result = await FetchPagedSemesterList(page, 10);
      console.log('Semester result:', result);
      if (result) {
        const newSemesters = result.items || [];
        console.log('New semesters:', newSemesters);
        if (append) setSemesters(prev => [...prev, ...newSemesters]);
        else setSemesters(newSemesters);
        setSemesterHasMore(newSemesters.length === 10 && result.totalCount > (page * 10));
        setSemesterPage(page);
      }
    } catch (error) {
      console.error('Error loading semesters:', error);
      handleError('Failed to load semesters');
    } finally {
      setLoadingSemesters(false);
    }
  };

  // Load block types with infinite scroll
  const loadBlockTypes = async (page: number = 1, append: boolean = false) => {
    try {
      setLoadingBlockTypes(true);
      console.log('Loading block types, page:', page);
      const result = await FetchPagedSemesterBlockType(page, 10);
      console.log('Block type result:', result);
      if (result) {
        const newTypes = ((result as any)?.items ?? (result as any)?.data ?? []) as any[];
        console.log('New block types:', newTypes);
        const totalCount = (result as any)?.totalCount ?? newTypes.length;
        if (append) setBlockTypes(prev => [...prev, ...newTypes]);
        else setBlockTypes(newTypes);
        setBlockTypeHasMore(newTypes.length === 10 && totalCount > (page * 10));
        setBlockTypePage(page);
      }
    } catch (error) {
      console.error('Error loading block types:', error);
      handleError('Failed to load block types');
    } finally {
      setLoadingBlockTypes(false);
    }
  };

  // Handle selections & scroll
  const handleSemesterSelect = (semester: any) => setSelectedSemester(semester);
  const handleBlockTypeSelect = (blockType: any) => setSelectedBlockType(blockType);
  const handleSemesterScroll = (e: any) => {
    const { target } = e;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 2 && !loadingSemesters && semesterHasMore) {
      loadSemesters(semesterPage + 1, true);
    }
  };
  const handleBlockTypeScroll = (e: any) => {
    const { target } = e;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 2 && !loadingBlockTypes && blockTypeHasMore) {
      loadBlockTypes(blockTypePage + 1, true);
    }
  };

  // Modal: Add Subject
  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalVisible(true);
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedSubject(null);
  };

  const handleAddSubjectClick = async () => {
    if (!studentAccount?.studentDataDetailResponse?.curriculumCode) {
      handleError('Student curriculum information not available');
      return;
    }

    setIsAddSubjectModalVisible(true);
    setLoadingSubjectVersions(true);
    setLoadingSemesters(true);
    setLoadingBlockTypes(true);
    try {
      // For now, use curriculum ID 1 as fallback since we don't have curriculumCode to ID mapping
      // TODO: Implement curriculumCode to curriculumId mapping
      const curriculumId = studentAccount.studentDataDetailResponse.curriculumCode; // studentAccount.studentDataDetailResponse.curriculumCode;
      console.log('Fetching subject versions for curriculum ID:', curriculumId);
      console.log('Student curriculum code:', studentAccount.studentDataDetailResponse.curriculumCode);
      const subjectVersions = await FetchSubjectVersionsToCurriculumByCode(curriculumId);
      console.log('Subject versions response:', subjectVersions);
      setSubjectVersions(subjectVersions || []);
      await Promise.all([
        loadSemesters(1, false),
        loadBlockTypes(1, false)
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      handleError('Failed to load subject versions, semesters, or block types');
    } finally {
      setLoadingSubjectVersions(false);
      setLoadingSemesters(false);
      setLoadingBlockTypes(false);
    }
  };

  const handleAddSubjectModalClose = () => {
    setIsAddSubjectModalVisible(false);
    setSearchSubjectVersion('');
    setSelectedSubjectVersion(null);
  };
  const handleSubjectVersionSelect = (subjectVersion: SubjectVersionWithCurriculumInfo) => setSelectedSubjectVersion(subjectVersion);

  const handleAddStudentToSubjectVersion = async () => {
    if (!selectedSubjectVersion) return showWarning('Please select a subject version');
    if (!selectedSemester) return showWarning('Please select a semester');
    if (!selectedBlockType) return showWarning('Please select a block type');
    if (!studentAccount) return showWarning('Student account data not loaded');

    showInfo('Adding student to subject version...');
    try {
      const joinedSubjectData: CreateJoinedSubject = {
        studentUserName: studentAccount.username,
        subjectCode: selectedSubjectVersion.subjectCode,
        subjectVersionCode: selectedSubjectVersion.versionCode,
        semesterId: selectedSemester.id,
        semesterStudyBlockType: selectedBlockType.id
      };
      const result = await RegisterStudentToSubject(joinedSubjectData);
      if (result) {
        handleSuccess(`Successfully added ${selectedSubjectVersion.subjectName} to student's transcript`);
        // Refresh server data
        loadJoinedSubjects();
        // Reset
        setIsAddSubjectModalVisible(false);
        setSelectedSubjectVersion(null);
        setSelectedSemester(null);
        setSelectedBlockType(null);
        setSearchSubjectVersion('');
      } else {
        handleError('Failed to add student to subject version');
      }
    } catch (error) {
      console.error('Error adding student to subject version:', error);
      handleError('Failed to add student to subject version');
    }
  };

  // Derive current subjects from joinedSubjects (not completed)
  const currentSubjects: Subject[] = (joinedSubjects || [])
    .filter(js => !js.isCompleted)
    .map((js, idx) => ({
      id: idx,
      title: js.name || js.subjectName,
      code: js.subjectCode,
      credits: (js.credits as number) ?? 0,
      description: `Block: ${js.semesterStudyBlockType}`,
      progress: js.isCompleted ? 100 : 0,
      status: 'Current' as const,
      semester: parseInt(String(js.semesterName || '').replace(/\D/g, '')) || 0,
    }));

  const getProgressColor = (progress: number) => {
    if (progress < 30) return '#ef4444';
    if (progress < 60) return '#f59e0b';
    if (progress < 80) return '#eab308';
    return '#22c55e';
  };

  // Bulk import open/close
  const handleBulkImport = () => {
    setIsBulkImportVisible(true);
  };

  const handleBulkImportClose = () => {
    setIsBulkImportVisible(false);
    setUploadStatus('idle');
    setUploadMessage('');
  };

  // Bulk import data handler (per new interface)
  const handleBulkImportData = async (importedData: { [type: string]: any[] }) => {
    try {
      setUploadStatus('uploading');
      setUploadMessage('Uploading subject assignments...');

      const rows = importedData['BULK_JOINED_SUBJECT'] || [];
      if (!rows.length) {
        setUploadStatus('error');
        setUploadMessage('No valid data found in the uploaded file.');
        return;
      }
      if (!studentAccount?.username) {
        setUploadStatus('error');
        setUploadMessage('Student account not loaded.');
        return;
      }

      const bulkData: BulkCreateJoinedSubjects = {
        studentUserName: studentAccount.username,
        subjectsData: rows.map((row: any) => ({
          subjectCode: row.subjectCode,
          subjectVersionCode: row.subjectVersionCode,
          semesterId: Number(row.semesterId),
          semesterStudyBlockType: Number(row.semesterStudyBlockType),
        })),
      };

      const result = await RegisterOneStudentsToMultipleSubjects(bulkData);
      if (result) {
        setUploadStatus('success');
        setUploadMessage(`Successfully imported ${rows.length} subject assignments!`);
        await loadJoinedSubjects();
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
          {`Student Transcript${studentAccount ? ` - ${studentAccount.firstName} ${studentAccount.lastName}` : 'Student Name'}`}
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
                <Avatar size={120} src={studentAccount?.avatarUrl} icon={<UserOutlined />} />
                <div className={styles.profileInfo}>
                  <Title level={3} className={styles.studentName}>
                    {studentAccount ? `${studentAccount.firstName} ${studentAccount.lastName}` : ''}
                  </Title>
                  <Text className={styles.studentId}>{studentAccount?.id ?? ''}</Text>
                  <Tag color={(studentAccount?.studentDataDetailResponse.doGraduate) ? 'green' : 'orange'} className={styles.statusTag}>
                    {studentAccount?.studentDataDetailResponse.doGraduate? 'Graduated' : 'Enrolled'}
                  </Tag>
                </div>
              </div>

              <div className={styles.profileDetails}>
                <div className={styles.detailItem}>
                  <MailOutlined className={styles.detailIcon} />
                  <Text>{studentAccount?.email ?? 'N/A'}</Text>
                </div>
                <div className={styles.detailItem}>
                  <SmileOutlined className={styles.detailIcon} />
                  <Text>{studentAccount?.username ?? 'N/A'}</Text>
                </div>
                <div className={styles.detailItem}>
                  <CalendarOutlined className={styles.detailIcon} />
                  <Text>Born: {studentAccount?.dateOfBirth ? studentAccount.dateOfBirth : "N/A"}</Text>
                </div>
                <div className={styles.detailItem}>
                  <BookOutlined className={styles.detailIcon} />
                  <Text>Enrolled: {studentAccount?.studentDataDetailResponse.enrolledAt ? studentAccount.studentDataDetailResponse.enrolledAt : "N/A"}</Text>
                </div>
                <div className={styles.detailItem}>
                  <BookOutlined className={styles.detailIcon} />
                  <Text>Curriculum: {studentAccount?.studentDataDetailResponse.curriculumCode || 'N/A'}</Text>
                </div>
                <div className={styles.detailItem}>
                  <BookOutlined className={styles.detailIcon} />
                  <Text>Combo: {studentAccount?.studentDataDetailResponse.registeredComboCode || 'Not Yet Selected A Combo'}</Text>
                </div>
              </div>

              <div className={styles.academicInfo}>
                <Title level={4}>Academic Information</Title>
                <div className={styles.academicGrid}>
                  <div className={styles.academicItem}>
                    <Text strong>Program</Text>
                    <Text>{studentAccount?.studentDataDetailResponse.programId ?? ''}</Text>
                  </div>
                  {/* <div className={styles.academicItem}>
                    <Text strong>GPA</Text>
                    <Text className={styles.gpa}>{studentAccount?.studentDataDetailResponse.gpa !== undefined ? studentAccount?.studentDataDetailResponse.gpa.toFixed(2) : '-'}</Text>
                  </div> */}
                  <div className={styles.academicItem}>
                    <Text strong>Curriculum Code</Text>
                    <Text>{studentAccount?.studentDataDetailResponse.curriculumCode || '-'}</Text>
                  </div>
                  <div className={styles.academicItem}>
                    <Text strong>Registered Combo</Text>
                    <Text>{studentAccount?.studentDataDetailResponse.registeredComboCode || 'Not Yet Selected A Combo'}</Text>
                  </div>
                  <div className={styles.academicItem}>
                    <Text strong>Career Goal</Text>
                    <Text>{studentAccount?.studentDataDetailResponse.careerGoal || '-'}</Text>
                  </div>
                  <div className={styles.academicItem}>
                    <Text strong>Number of Bans</Text>
                    <Text>{studentAccount?.studentDataDetailResponse.numberOfBan ?? 0}</Text>
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
                {joinedLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <Spin />
                  </div>
                ) : (
                  (joinedSubjects || []).map((js, index) => (
                    <motion.div
                      key={`${js.subjectCode}-${js.subjectVersionCode}-${js.semesterName}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card className={styles.subjectListItem}>
                        <Row align="middle">
                          <Col span={8}>
                            <Text strong>{js.name || js.subjectName}</Text>
                            <br />
                            <Text type="secondary">{js.subjectCode} • v{js.subjectVersionCode}</Text>
                          </Col>
                          <Col span={4}>
                            <Text>Credits: {js.credits ?? '-'}</Text>
                          </Col>
                          <Col span={6}>
                            <Tag color={js.isPassed ? 'green' : 'red'}>{js.isPassed ? 'Passed' : 'Not passed'}</Tag>
                            <Tag color={js.isCompleted ? 'blue' : 'orange'} style={{ marginLeft: 8 }}>
                              {js.isCompleted ? 'Completed' : 'In progress'}
                            </Tag>
                          </Col>
                          <Col span={4} style={{ textAlign: 'right' }}>
                            <Tag>{js.semesterStudyBlockType}</Tag>
                          </Col>
                        </Row>
                      </Card>
                    </motion.div>
                  ))
                )}
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
                  dataSource={subjectVersions.filter(subjectVersion =>
                    subjectVersion.subjectName.toLowerCase().includes(searchSubjectVersion.toLowerCase()) ||
                    subjectVersion.subjectCode.toLowerCase().includes(searchSubjectVersion.toLowerCase()) ||
                    subjectVersion.versionName.toLowerCase().includes(searchSubjectVersion.toLowerCase())
                  )}
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
                  maxHeight: '180px', 
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px',
                  marginBottom: '16px'
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

            {/* Block Type Selection */}
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                Select Block Type
              </Text>
            </div>

            {loadingBlockTypes ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading block types...</div>
              </div>
            ) : (
              <div 
                style={{ 
                  maxHeight: '180px', 
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
                onScroll={handleBlockTypeScroll}
              >
                <List
                  dataSource={blockTypes}
                  renderItem={(bt) => (
                    <List.Item
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedBlockType?.id === bt.id ? '#f0f9ff' : 'transparent',
                        border: selectedBlockType?.id === bt.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        marginBottom: '4px',
                        padding: '12px'
                      }}
                      onClick={() => handleBlockTypeSelect(bt)}
                    >
                      <div style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: '14px' }}>
                          {bt.name || bt.blockTypeName || `Type #${bt.id}`}
                        </Text>
                      </div>
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No block types found.' }}
                />
                {loadingBlockTypes && blockTypeHasMore && (
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
            disabled={!selectedSubjectVersion || !selectedSemester || !selectedBlockType}
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