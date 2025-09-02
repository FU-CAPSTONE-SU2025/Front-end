import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Row, Col, Avatar, Typography, Tag, Input, Button, Modal, Progress, List, Spin } from 'antd';
import { ArrowLeftOutlined, BookOutlined, UserOutlined, CalendarOutlined, MailOutlined, PlusOutlined, SmileOutlined, EditOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import styles from '../../css/staff/staffEditTranscript.module.css';
import TranscriptEdit from '../../components/staff/transcriptEdit';
import { Combo, SubjectVersionWithCurriculumInfo } from '../../interfaces/ISchoolProgram';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { CreateJoinedSubject, BulkCreateJoinedSubjects, JoinedSubject } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../../components/common/bulkDataImport';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';
import { AccountProps } from '../../interfaces/IAccount';
import { useJoinedSubjectMapStatus, useSchoolApi } from '../../hooks/useSchoolApi';
import { useStudentApi } from '../../hooks/useStudentApi';
import useCRUDStudent from '../../hooks/useCRUDStudent';
import { useJoinedSubjectActions } from '../../hooks/useJoinedSubjectActions';

const { Title, Text } = Typography;
const { Search } = Input;


const EditStudentTranscript: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { showInfo, showWarning } = useMessagePopupContext();
  const { useFetchStudentById } = useStudentApi();
  const { 
    useSubjectVersionsToCurriculumByCode,
    useJoinedSubjectList, 
    usePagedSemesterList, 
    usePagedSemesterBlockType,
    registerStudentToSubject,
    registerOneStudentToMultipleSubjects,
    useInfiniteComboList,
    usePagedCurriculumList
  } = useSchoolApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<JoinedSubject | null>(null);
  const [modalKey, setModalKey] = useState(0); // Force modal recreation
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Student account data for API calls
  const [studentAccount, setStudentAccount] = useState<AccountProps | null>(null);
  
  // Add Subject Modal states
  const [isAddSubjectModalVisible, setIsAddSubjectModalVisible] = useState(false);
  const [subjectVersions, setSubjectVersions] = useState<SubjectVersionWithCurriculumInfo[]>([]);
  const [searchSubjectVersion, setSearchSubjectVersion] = useState('');
  const [selectedSubjectVersion, setSelectedSubjectVersion] = useState<SubjectVersionWithCurriculumInfo | null>(null);

  // Delete action hook
  const { deleteJoinedSubject, deleting } = useJoinedSubjectActions();

  // Semester states
  const [semesters, setSemesters] = useState<any[]>([]);
  const [semesterPage, setSemesterPage] = useState(1);
  const [semesterHasMore, setSemesterHasMore] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);

  // Block Type states
  const [blockTypes, setBlockTypes] = useState<any[]>([]);
  const [blockTypePage, setBlockTypePage] = useState(1);
  const [blockTypeHasMore, setBlockTypeHasMore] = useState(true);
  const [selectedBlockType, setSelectedBlockType] = useState<any>(null);

  // Bulk import states
  const [isBulkImportVisible, setIsBulkImportVisible] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // Combo editing states
  const [isComboEditModalVisible, setIsComboEditModalVisible] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<any>(null);
  const [comboSearch, setComboSearch] = useState('');
  const [comboPage, setComboPage] = useState(1);
  const [comboItems, setComboItems] = useState<any[]>([]);
  const [comboTotal, setComboTotal] = useState<number>(0);

  // Curriculum editing states
  const [isCurriculumEditModalVisible, setIsCurriculumEditModalVisible] = useState(false);
  const [curriculumSearch, setCurriculumSearch] = useState('');
  const [curriculumPage, setCurriculumPage] = useState(1);
  const [selectedCurriculum, setSelectedCurriculum] = useState<any>(null);
  const [curriculumItems, setCurriculumItems] = useState<any[]>([]);
  const [curriculumTotal, setCurriculumTotal] = useState<number>(0);

  // Joined subjects state
  const [joinedSubjects, setJoinedSubjects] = useState<JoinedSubject[]>([]);
  // Use the hook to get student data
  const { data: accountData, refetch: refetchStudent } = useFetchStudentById(studentId || '');
  
  const { updateStudentMajorMutation } = useCRUDStudent();
  
  // Update student account when data is loaded
  useEffect(() => {
    if (accountData) {
      setStudentAccount(accountData);
    }
  }, [accountData]);

  // Use the hook to get joined subjects
  const { data: joinedSubjectsData, isLoading: joinedLoading, refetch: refetchJoinedSubjects } = useJoinedSubjectList(
    studentAccount?.studentDataDetailResponse?.id || 0
  );
  
  // Use the hook to get joined subject status
  const { data: joinedSubjectStatusData, refetch: refetchJoinedSubjectStatus } = useJoinedSubjectMapStatus(
    studentAccount?.studentDataDetailResponse?.id || 0
  );

  // Update joined subjects when data is loaded
  useEffect(() => {
    refetchJoinedSubjectStatus(); // refresh all the data status too, to sort the lastest subject into it status. GG
    console.log('Joined subjects data:', joinedSubjectsData);
    console.log('Student account ID:', studentAccount?.studentDataDetailResponse?.id);
    if (joinedSubjectsData && Array.isArray(joinedSubjectsData)) {
      // API returns data as direct array
      console.log('Setting joined subjects from direct array:', joinedSubjectsData);
      setJoinedSubjects(joinedSubjectsData);
    } else if (joinedSubjectsData?.data) {
      // API returns data in 'data' property, not 'items'
      console.log('Setting joined subjects from data property:', joinedSubjectsData.data);
      setJoinedSubjects(joinedSubjectsData.data);
    } else if (joinedSubjectsData?.items) {
      // Fallback for standard paged structure
      console.log('Setting joined subjects from items property:', joinedSubjectsData.items);
      setJoinedSubjects(joinedSubjectsData.items);
    } else {
      console.log('No joined subjects data or unexpected structure');
      setJoinedSubjects([]);
    }
  }, [joinedSubjectsData]);

  // Delete handler for in-progress card
  const handleDeleteInProgress = async (subject: JoinedSubject, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: 'Remove this subject from student transcript?',
      content: `${subject.name || subject.subjectName} (${subject.subjectCode} • v${subject.subjectVersionCode})`,
      okText: 'Remove',
      okButtonProps: { danger: true, loading: deleting },
      cancelText: 'Cancel',
      onOk: async () => {
        const response = await deleteJoinedSubject(subject.id);
        if (response) {
          showInfo('Removing subject from transcript...');
          await refetchJoinedSubjects();
        } else {
          handleError('Failed to remove subject');
        }
      }
    });
  };

  // Use the hook to get semesters
  const { data: semestersData, isLoading: loadingSemesters } = usePagedSemesterList(semesterPage);
  
  // Update semesters when data is loaded
  useEffect(() => {
    if (semestersData?.items) {
      setSemesters(semestersData.items);
      setSemesterHasMore(semestersData.items.length === 10 && semestersData.totalCount > (semesterPage * 10));
    }
  }, [semestersData, semesterPage]);

  // Use the hook to get block types
  const { data: blockTypesData, isLoading: loadingBlockTypes } = usePagedSemesterBlockType(blockTypePage);
  
  // Update block types when data is loaded
  useEffect(() => {
    if (blockTypesData?.data) {
      // API returns data in 'data' property, not 'items'
      setBlockTypes(blockTypesData.data);
      setBlockTypeHasMore(blockTypesData.data.length === 10 && blockTypesData.totalCount > (blockTypePage * 10));
    } else if (blockTypesData?.items) {
      // Fallback for standard paged structure
      setBlockTypes(blockTypesData.items);
      setBlockTypeHasMore(blockTypesData.items.length === 10 && blockTypesData.totalCount > (blockTypePage * 10));
    } else {
      setBlockTypes([]);
    }
  }, [blockTypesData, blockTypePage]);

  // Use the hook to get subject versions (moved to top level)
  const { data: subjectVersionsData, isLoading: loadingSubjectVersions } = useSubjectVersionsToCurriculumByCode(
    studentAccount?.studentDataDetailResponse?.curriculumCode || ''
  );
  
  // Use the hook to get combo list for editing
  const { data: comboData, isLoading: loadingCombos } = useInfiniteComboList(comboPage, 20, comboSearch);

  // Paged curriculums for editing (filtered by student's programId)
  const studentProgramId = studentAccount?.studentDataDetailResponse?.programId || undefined;
  const { data: pagedCurriculums, isLoading: loadingCurriculums } = usePagedCurriculumList(
    curriculumPage,
    20,
    curriculumSearch,
    studentProgramId
  );

  // Accumulate combo items across pages
  useEffect(() => {
    const items = comboData?.items || [];
    const total = comboData?.totalCount || items.length;
    setComboTotal(total);
    if (comboPage === 1) {
      setComboItems(items);
    } else if (items.length) {
      setComboItems(prev => {
        const existing = new Set(prev.map((i: any) => i.id ?? `${i.comboName}`));
        const uniqueNew = items.filter((i: any) => {
          const key = i.id ?? `${i.comboName}`;
          return !existing.has(key);
        });
        return [...prev, ...uniqueNew];
      });
    }
  }, [comboData, comboPage]);

  // Reset combo pagination on search or modal open
  useEffect(() => {
    setComboPage(1);
  }, [comboSearch]);

  // Accumulate curriculum items across pages
  useEffect(() => {
    const items = pagedCurriculums?.items || [];
    const total = pagedCurriculums?.totalCount || items.length;
    setCurriculumTotal(total);
    if (curriculumPage === 1) {
      setCurriculumItems(items);
    } else if (items.length) {
      setCurriculumItems(prev => {
        const existing = new Set(prev.map((i: any) => i.id ?? `${i.curriculumCode}`));
        const uniqueNew = items.filter((i: any) => {
          const key = i.id ?? `${i.curriculumCode}`;
          return !existing.has(key);
        });
        return [...prev, ...uniqueNew];
      });
    }
  }, [pagedCurriculums, curriculumPage]);

  // Reset curriculum pagination on search or modal open
  useEffect(() => {
    setCurriculumPage(1);
  }, [curriculumSearch, studentProgramId]);
  
  // Update subject versions when data is loaded
  useEffect(() => {
    if (subjectVersionsData) {
      setSubjectVersions(subjectVersionsData);
    }
  }, [subjectVersionsData]);

  // Handle selections & scroll
  const handleSemesterSelect = (semester: any) => setSelectedSemester(semester);
  const handleBlockTypeSelect = (blockType: any) => setSelectedBlockType(blockType);
  const handleSemesterScroll = (e: any) => {
    const { target } = e;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 2 && !loadingSemesters && semesterHasMore) {
      setSemesterPage(semesterPage + 1);
    }
  };
  const handleBlockTypeScroll = (e: any) => {
    const { target } = e;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 2 && !loadingBlockTypes && blockTypeHasMore) {
      setBlockTypePage(blockTypePage + 1);
    }
  };

  // Modal: Add Subject
  const handleSubjectClick = (subject: JoinedSubject) => {
    setSelectedSubject(subject);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
      setSelectedSubject(null);
      // Force modal recreation on next open by a trigger
    setModalKey(prev => prev + 1);
    // Refresh joined subjects data to get updated transcript information
    refetchJoinedSubjects();
  };

  const handleAddSubjectClick = async () => {
    if (!studentAccount?.studentDataDetailResponse?.curriculumCode) {
      handleError('Student curriculum information not available');
      return;
    }
    setIsAddSubjectModalVisible(true);
  };

  const handleAddSubjectModalClose =() => {
    setIsAddSubjectModalVisible(false);
    setSearchSubjectVersion('');
    setSelectedSubjectVersion(null);
    refetchJoinedSubjects();
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
      const response = await registerStudentToSubject(joinedSubjectData);
      if (response) {
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

  // Derive completed subjects from joinedSubjects using new status system
  const completedSubjects: JoinedSubject[] = (joinedSubjects || [])
    .filter(js => {
      // Find matching status from JoinedSubjectMapStatus
      const statusData = joinedSubjectStatusData?.find(status => status.joinedSubjectId === js.id);
      return statusData?.status === "PASSED";
    });
  
  // Derive other subjects (IN-PROGRESS or NOT PASSED)
  const otherSubjects: JoinedSubject[] = (joinedSubjects || [])
    .filter(js => {
      // Find matching status from JoinedSubjectMapStatus
      const statusData = joinedSubjectStatusData?.find(status => status.joinedSubjectId === js.id);
      return statusData?.status === "IN-PROGRESS" || statusData?.status === "NOT PASSED";
    });
  
  // Derive NOT PASSED subjects
  const notPassedSubjects: JoinedSubject[] = (joinedSubjects || [])
    .filter(js => {
      // Find matching status from JoinedSubjectMapStatus
      const statusData = joinedSubjectStatusData?.find(status => status.joinedSubjectId === js.id);
      return statusData?.status === "NOT PASSED";
    });
  
  // Derive IN-PROGRESS subjects
  const inProgressSubjects: JoinedSubject[] = (joinedSubjects || [])
    .filter(js => {
      // Find matching status from JoinedSubjectMapStatus
      const statusData = joinedSubjectStatusData?.find(status => status.joinedSubjectId === js.id);
      return statusData?.status === "IN-PROGRESS";
    });
  
  // All subjects (completed + other)
  const allEditableSubjects: JoinedSubject[] = [...completedSubjects, ...otherSubjects];
  
  // Helper function to get status for a specific joined subject
  const getSubjectStatus = (joinedSubjectId: number): string | undefined => {
    const statusData = joinedSubjectStatusData?.find(status => status.joinedSubjectId === joinedSubjectId);
    return statusData?.status;
  };
  
  // Refs for scrolling to card sections
  const inProgressRef = useRef<HTMLDivElement>(null);
  const passedRef = useRef<HTMLDivElement>(null);
  const failedRef = useRef<HTMLDivElement>(null);

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

      const result = await registerOneStudentToMultipleSubjects(bulkData);
      if (result) {
        setUploadStatus('success');
        setUploadMessage(`Successfully imported ${rows.length} subject assignments!`);
        // Refresh joined subjects data
        await refetchJoinedSubjects();
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

  // Handle infinite scroll search changes
  const handleComboSearchChange = (value: string) => {
    setComboSearch(value);
    setComboPage(1);
  };

  // Combo editing handlers
  const handleComboEditClick = () => {
    // Reset paging and ensure fresh data on open
    setIsComboEditModalVisible(true);
    setComboSearch('');
    setComboPage(1);
  };

  const handleComboEditModalClose = () => {
    setIsComboEditModalVisible(false);
    setSelectedCombo(null);
    setComboSearch('');
    setComboPage(1);
  };
    // Curriculum editing handlers
  const handleCurriculumEditClick = () => {
    setIsCurriculumEditModalVisible(true);
    setCurriculumSearch('');
    setCurriculumPage(1);
  };

  const handleCurriculumEditModalClose = () => {
    setIsCurriculumEditModalVisible(false);
    setSelectedCurriculum(null);
    setCurriculumSearch('');
    setCurriculumPage(1);
  };

  const handleComboSelect = (combo: any) => {
    setSelectedCombo(combo);
  };

  const handleComboUpdate = async () => {
    if (!selectedCombo || !studentAccount) {
      showWarning('Please select a combo and ensure student data is loaded');
      return;
    }

    try {
      const result = await updateStudentMajorMutation.mutateAsync({
        studentProfileId: studentAccount.studentDataDetailResponse?.id || 0,
        registeredComboCode: selectedCombo.comboName,
        curriculumCode: studentAccount.studentDataDetailResponse?.curriculumCode || ''
      });

      if (result) {
        handleSuccess(`Successfully updated student's combo to ${selectedCombo.comboName}`);
        await refetchStudent();
        handleComboEditModalClose();
      } else {
        handleError('Failed to update student combo');
      }
    } catch (error) {
      console.error('Error updating student combo:', error);
      handleError('Failed to update student combo');
    }
  };

  return (
    <div className={styles.container}>
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
                  <Tag color={(studentAccount?.studentDataDetailResponse.doGraduate) ? 'green' : 'orange'} className={styles.statusTag}>
                    {studentAccount?.studentDataDetailResponse.doGraduate? 'Graduated' : 'Enrolled'}
                  </Tag>
                  <div>
                  <Text className={styles.studentId}>Student Profile Id: {studentAccount?.studentDataDetailResponse.id ?? ''}</Text>
                  </div>
                </div>
              </div>

              <div className={styles.profileDetails}>
                <div className={styles.detailItem}>
                  <MailOutlined className={styles.detailIcon} />
                  <Text>{studentAccount?.email ?? 'N/A'}</Text>
                </div>
                <div className={styles.detailItem}>
                  <SmileOutlined className={styles.detailIcon} />
                  <Text>Username: {studentAccount?.username ?? 'N/A'}</Text>
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
                  <Button 
                    type="link" 
                    icon={<EditOutlined />} 
                    onClick={handleCurriculumEditClick}
                    size="small"
                    style={{ marginLeft: 8, padding: 0, height: 'auto' }}
                  />
                </div>
                <div className={styles.detailItem}>
                  <BookOutlined className={styles.detailIcon} />
                  <Text>Combo: {studentAccount?.studentDataDetailResponse.registeredComboCode || 'Not Yet Selected A Combo'}</Text>
                  <Button 
                    type="link" 
                    icon={<EditOutlined />} 
                    onClick={handleComboEditClick}
                    size="small"
                    style={{ marginLeft: 8, padding: 0, height: 'auto' }}
                  />
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
                    <Text strong>Career Goal</Text>
                    <Text>{studentAccount?.studentDataDetailResponse.careerGoal || '-'}</Text>
                  </div>
                  <div className={styles.academicItem}>
                    <Text strong>Number of Bans</Text>
                    <Text
                      style={{
                        color: 
                        studentAccount?.studentDataDetailResponse.numberOfBan>0?"orange":
                        studentAccount?.studentDataDetailResponse.numberOfBan>1?"red":
                       studentAccount?.studentDataDetailResponse.numberOfBan>2?"darkgrey":"green"
                      }}
                    >{studentAccount?.studentDataDetailResponse.numberOfBan ?? 0}</Text>
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
            {/* Transcript Summary Card */}
            <Card className={styles.subjectsCard} style={{ marginBottom: 24 }}>
              <div className={styles.sectionHeader}>
                <Title level={4} className={styles.sectionTitle}>
                  Transcript Summary
                </Title>
                {joinedLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Spin size="small" />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Loading...
                    </Text>
                  </div>
                )}
              </div>
              <Row gutter={[16, 16]}>
              <Col span={6}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <Title level={2} style={{ color: '#3b82f6', margin: 0 }}>
                      {allEditableSubjects.length}
                    </Title>
                    <Text type="secondary">Total Subjects</Text>
                  </div>
                </Col>
                                <Col span={6}>
                  <div 
                    style={{ 
                      textAlign: 'center', 
                      padding: '16px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderRadius: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onClick={() => inProgressRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Title level={2} style={{ color: '#f59e0b', margin: 0 }}>
                      {inProgressSubjects.length}
                    </Title>
                    <Text type="secondary">In Progress</Text>
                  </div>
                </Col>
                                <Col span={6}>
                  <div 
                    style={{ 
                      textAlign: 'center', 
                      padding: '16px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderRadius: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onClick={() => passedRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Title level={2} style={{ color: '#22c55e', margin: 0 }}>
                      {completedSubjects.length}
                    </Title>
                    <Text type="secondary">Passed</Text>
                  </div>
                </Col>
                                <Col span={6}>
                  <div 
                    style={{ 
                      textAlign: 'center', 
                      padding: '16px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderRadius: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onClick={() => failedRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Title level={2} style={{ color: '#ef4444', margin: 0 }}>
                      {notPassedSubjects.length}
                    </Title>
                    <Text type="secondary">Not Passed</Text>
                  </div>
                </Col>
              </Row>
            </Card>
            
            {/* IN-PROGRESS Subjects Card */}
            <Card className={styles.subjectsCard} style={{ marginBottom: 24 }} ref={inProgressRef}>
              <div className={styles.sectionHeader}>
                <Title level={4} className={styles.sectionTitle}>
                  In Progress Subjects
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
              <Text type="secondary" style={{ fontSize: '14px' }}>
                  Click on any subject to edit assessment scores
                </Text>
              <Row gutter={[16, 16]}>
                {inProgressSubjects.map((subject:JoinedSubject, index:number) => (
                  <Col span={12} key={subject.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card 
                        className={`${styles.subjectCard} ${styles.cardInProgress}`}
                        hoverable
                        onClick={() => handleSubjectClick(subject)}
                      >
                        <div className={styles.subjectHeader}>
                          <Text strong className={styles.subjectTitle}>{subject.name || subject.subjectName}</Text>
                          <Text className={styles.subjectCode}>{subject.subjectCode} • v{subject.subjectVersionCode}</Text>
                        </div>
                        <Text className={styles.subjectDescription} style={{ whiteSpace: 'pre-line' }}>
                          Block: {subject.semesterStudyBlockType} • Semester: {subject.semesterName || 'N/A'}
                        </Text>
                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            danger 
                            size="small"
                            style={{
                              border: '1px solid #ff4d4f',
                              borderRadius: '6px',
                              fontWeight: '500',
                              boxShadow: '0 2px 4px rgba(255, 77, 79, 0.2)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 77, 79, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 77, 79, 0.2)';
                            }}
                            onClick={(e) => handleDeleteInProgress(subject, e)}
                          >
                            Remove
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
                {inProgressSubjects.length === 0 && (
                  <Col span={24}>
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      <Text type="secondary">No in-progress subjects</Text>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Completed Subjects Card */}
            <Card className={styles.subjectsCard} style={{ marginBottom: 24 }} ref={passedRef}>
              <div className={styles.sectionHeader}>
                <Title level={4} className={styles.sectionTitle}>
                  Passed Subjects
                </Title>
              </div>
              <Row gutter={[16, 16]}>
                {completedSubjects.map((subject, index) => (
                  <Col span={12} key={subject.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card 
                        className={`${styles.subjectCard} ${getSubjectStatus(subject.id) === "PASSED" ? styles.cardPassed : styles.subjectCard}`}
                        hoverable
                        onClick={() => handleSubjectClick(subject)}
                      >
                        <div className={styles.subjectHeader}>
                          <Text strong className={styles.subjectTitle}>{subject.name || subject.subjectName}</Text>
                          <Text className={styles.subjectCode}>{subject.subjectCode} • v{subject.subjectVersionCode}</Text>
                        </div>
                        <Text className={styles.subjectDescription} style={{ whiteSpace: 'pre-line' }}>
                          Credits: {subject.credits ?? '-'} • Block: {subject.semesterStudyBlockType}
                        </Text>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
                {completedSubjects.length === 0 && (
                  <Col span={24}>
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      <Text type="secondary">No completed subjects</Text>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>

            {/* NOT PASSED Subjects Card */}
            <Card className={styles.subjectsCard} style={{ marginBottom: 24 }} ref={failedRef}>
              <div className={styles.sectionHeader}>
                <Title level={4} className={styles.sectionTitle}>
                  Failed Subjects (Not Passed)
                </Title>
              </div>
              <Row gutter={[16, 16]}>
                {notPassedSubjects.map((subject, index) => (
                  <Col span={12} key={subject.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card 
                        className={`${styles.subjectCard} ${styles.cardFailed}`}
                        hoverable
                        onClick={() => handleSubjectClick(subject)}
                      >
                        <div className={styles.subjectHeader}>
                          <Text strong className={styles.subjectTitle}>{subject.name || subject.subjectName}</Text>
                          <Text className={styles.subjectCode}>{subject.subjectCode} • v{subject.subjectVersionCode}</Text>
                        </div>
                        <Text className={styles.subjectDescription} style={{ whiteSpace: 'pre-line' }}>
                          Block: {subject.semesterStudyBlockType} • Semester: {subject.semesterName || 'N/A'}
                        </Text>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
                {notPassedSubjects.length === 0 && (
                  <Col span={24}>
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      <Text type="secondary">No failed subjects</Text>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* All Subjects Card - Full Width Row */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
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
                  (joinedSubjects || [])
                    .filter(js => 
                      searchQuery === '' || 
                      (js.name || js.subjectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (js.subjectCode || '').toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((js, index) => (
                    <motion.div
                      key={`${js.subjectCode}-${js.subjectVersionCode}-${js.semesterName}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card 
                        className={`${styles.subjectListItem} ${getSubjectStatus(js.id) === "PASSED" ? styles.cardPassed : getSubjectStatus(js.id) === "IN-PROGRESS" ? styles.cardInProgress : styles.cardFailed}`}
                        hoverable
                        onClick={() => handleSubjectClick(js)}
                      >
                        <div className={styles.subjectHeader}>
                          <Text strong className={styles.subjectTitle}>{js.name || js.subjectName}</Text>
                          <Text className={styles.subjectCode}>{js.subjectCode} • v{js.subjectVersionCode}</Text>
                        </div>
                        <Text className={styles.subjectDescription} style={{ whiteSpace: 'pre-line' }}>
                          Credits: {js.credits ?? '-'} • Block: {js.semesterStudyBlockType}
                        </Text>
                        <div className={styles.progressSection}>
                          <Tag color={
                            getSubjectStatus(js.id) === "PASSED" ? 'green' : getSubjectStatus(js.id) === "IN-PROGRESS" ? 'orange' : 'red'
                          } style={{ marginTop: '8px' }}>
                            {getSubjectStatus(js.id)}
                          </Tag>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
                {joinedSubjects && joinedSubjects.length > 0 && 
                 joinedSubjects.filter(js => 
                   searchQuery === '' || 
                   (js.name || js.subjectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                   (js.subjectCode || '').toLowerCase().includes(searchQuery.toLowerCase())
                 ).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                    <Text type="secondary">No subjects match your search criteria</Text>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Transcript Edit Modal */}
      <Modal
        key={modalKey} // Force recreation when key changes
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        className={styles.transcriptModal}
        styles={{ mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' } }}
      >
        {selectedSubject && (
          <TranscriptEdit
            subjectStatus={getSubjectStatus(selectedSubject.id) || "IN-PROGRESS"}
            key={`${modalKey}-${selectedSubject.id}`}
            joinedSubjectId={selectedSubject.id}
            onClose={handleModalClose}
            onDataUpdate={() => {
              // Force modal recreation and data refresh when data is updated
              console.log('Data updated, forcing modal refresh...');
              setModalKey(prev => prev + 1);
              refetchJoinedSubjects();
            }}
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
                          <Text type="secondary" style={{ fontSize: '14px', whiteSpace: 'pre-line' }}>
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

        {/* Add subject modal with buttons on left and right */}
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

      {/* Combo Edit Modal */}
      <Modal
        open={isComboEditModalVisible}
        onCancel={handleComboEditModalClose}
        title="Edit Student Combo"
        width="80%"
        style={{ top: 20 }}
        footer={null}
      >
        <Row gutter={[24, 24]}>
          {/* Left Side - Combo List */}
          <Col span={16}>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                Select New Combo
              </Text>
              <Search
                placeholder="Search combos..."
                value={comboSearch}
                onChange={(e) => handleComboSearchChange(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {loadingCombos ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading combos...</div>
              </div>
            ) : (
              <div 
                style={{ maxHeight: '400px', overflowY: 'auto' }}
                onScroll={(e) => {
                  const target = e.target as HTMLElement;
                  const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 2;
                  if (nearBottom && !loadingCombos && comboItems.length < comboTotal) {
                    setComboPage(prev => prev + 1);
                  }
                }}
              >
                <List
                  dataSource={comboItems}
                  renderItem={(combo:Combo) => (
                    <List.Item
                      className={styles.subjectVersionItem}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedCombo?.id === combo.id ? '#f0f9ff' : 'transparent',
                        border: selectedCombo?.id === combo.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        padding: '16px'
                      }}
                      onClick={() => handleComboSelect(combo)}
                    >
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <Text strong style={{ fontSize: '16px' }}>
                              {combo.comboName}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ whiteSpace: 'pre-line' }}>
                              {combo.comboDescription}
                            </Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Tag color="blue">{combo.subjectCount} subjects</Tag>
                            <Tag color={combo.approvalStatus === "APPROVED" ? 'green' : 'orange'}>
                              {combo.approvalStatus === "APPROVED" ? 'Approved' : 'Pending'}
                            </Tag>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No combos found.' }}
                />
                {loadingCombos && (
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <Spin size="small" />
                    <div style={{ marginTop: 8, fontSize: '12px' }}>Loading more...</div>
                  </div>
                )}
              </div>
            )}
          </Col>

          {/* Right Side - Combo Selection Info */}
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                Current Selection
              </Text>
            </div>

            {selectedCombo ? (
              <Card style={{ backgroundColor: '#f0f9ff', border: '2px solid #3b82f6' }}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong style={{ fontSize: '18px', color: '#1e40af' }}>
                    {selectedCombo.comboName}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '14px', whiteSpace: 'pre-line' }}>
                    {selectedCombo.comboDescription}
                  </Text>
                  <br />
                  <Tag color="blue" style={{ marginTop: 8 }}>
                    {selectedCombo.subjectCount} subjects
                  </Tag>
                </div>
              </Card>
            ) : (
              <Card style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">No combo selected</Text>
                </div>
              </Card>
            )}

            <div style={{ marginTop: 24 }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Click on a combo from the list to select it. The selected combo will be assigned to the student.
              </Text>
            </div>
          </Col>
        </Row>

        {/* update combo button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Button onClick={handleComboEditModalClose}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleComboUpdate}
            disabled={!selectedCombo}
          >
            Update Combo
          </Button>
        </div>
      </Modal>

      {/* Curriculum Edit Modal */}
      <Modal
        open={isCurriculumEditModalVisible}
        onCancel={handleCurriculumEditModalClose}
        title="Edit Student Curriculum"
        width="80%"
        style={{ top: 20 }}
        footer={null}
      >
        <Row gutter={[24, 24]}>
          {/* Left Side - Curriculum List */}
          <Col span={16}>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                Select New Curriculum
              </Text>
              <Search
                placeholder="Search curriculums..."
                value={curriculumSearch}
                onChange={(e) => {
                  setCurriculumSearch(e.target.value);
                  setCurriculumPage(1);
                }}
                style={{ width: '100%' }}
              />
            </div>

            {loadingCurriculums ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading curriculums...</div>
              </div>
            ) : (
              <div 
                style={{ maxHeight: '400px', overflowY: 'auto' }}
                onScroll={(e) => {
                  const target = e.target as HTMLElement;
                  const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 2;
                  if (nearBottom && !loadingCurriculums && curriculumItems.length < curriculumTotal) {
                    setCurriculumPage(prev => prev + 1);
                  }
                }}
              >
                <List
                  dataSource={curriculumItems}
                  renderItem={(curr) => (
                    <List.Item
                      className={styles.subjectVersionItem}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedCurriculum?.id === curr.id ? '#f0f9ff' : 'transparent',
                        border: selectedCurriculum?.id === curr.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        padding: '16px'
                      }}
                      onClick={() => setSelectedCurriculum(curr)}
                    >
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <Text strong style={{ fontSize: '16px' }}>
                              {curr.curriculumName} ({curr.curriculumCode})
                            </Text>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No curriculums found.' }}
                />
                {loadingCurriculums && (
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <Spin size="small" />
                    <div style={{ marginTop: 8, fontSize: '12px' }}>Loading more...</div>
                  </div>
                )}
              </div>
            )}
          </Col>

          {/* Right Side - Current Selection Info */}
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                Current Selection
              </Text>
            </div>

            {selectedCurriculum ? (
              <Card style={{ backgroundColor: '#f0f9ff', border: '2px solid #3b82f6' }}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong style={{ fontSize: '18px', color: '#1e40af' }}>
                    {selectedCurriculum.curriculumName}
                  </Text>
                  <br />
                  <Tag color="blue" style={{ marginTop: 8 }}>
                    {selectedCurriculum.curriculumCode}
                  </Tag>
                </div>
              </Card>
            ) : (
              <Card style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">No curriculum selected</Text>
                </div>
              </Card>
            )}
          </Col>
        </Row>

        {/* Footer with buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Button onClick={handleCurriculumEditModalClose}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={async () => {
              if (!selectedCurriculum || !studentAccount) {
                showWarning('Please select a curriculum and ensure student data is loaded');
                return;
              }
              try {
                const result = await updateStudentMajorMutation.mutateAsync({
                  studentProfileId: studentAccount.studentDataDetailResponse?.id || 0,
                  curriculumCode: selectedCurriculum.curriculumCode
                });
                if (result) {
                  handleSuccess(`Successfully updated student's curriculum to ${selectedCurriculum.curriculumCode}`);
                  await refetchStudent();
                  setIsCurriculumEditModalVisible(false);
                } else {
                  handleError('Failed to update student curriculum');
                }
              } catch (err) {
                console.error('Error updating student curriculum:', err);
                handleError('Failed to update student curriculum');
              }
            }}
            disabled={!selectedCurriculum}
          >
            Update Curriculum
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EditStudentTranscript;