import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Typography, Space, Table, Button, Pagination, Empty, Affix, ConfigProvider } from 'antd';
import { BookOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import styles from '../../css/manager/studentInCoursePage.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { useActiveStudentApi } from '../../hooks/useActiveStudentApi';
import { useSchoolApi } from '../../hooks/useSchoolApi';
import { Combo, Curriculum, Program } from '../../interfaces/ISchoolProgram';
import { useStudentDashboard } from '../../hooks/useStudentDashboard';
import StudentPerformanceModal from './studentPerformanceModal';
import { StudentBase } from '../../interfaces/IStudent';

const { Text } = Typography;


const StudentTableSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter states - these are exclusive
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);
  
  // Performance modal states
  const [selectedStudent, setSelectedStudent] = useState<StudentBase | null>(null);
  const [isPerformanceModalVisible, setIsPerformanceModalVisible] = useState(false);
  
  // Infinite scroll states for filter dropdowns
  const [comboPage, setComboPage] = useState(1);
  const [programPage, setProgramPage] = useState(1);
  const [curriculumPage, setCurriculumPage] = useState(1);
  const [comboSearch, setComboSearch] = useState('');
  const [programSearch, setProgramSearch] = useState('');
  const [curriculumSearch, setCurriculumSearch] = useState('');

  // Hooks
  const { 
    usePagedActiveStudents,
    useActiveStudentsByCombo,
    useActiveStudentsByProgram,
    useActiveStudentsByCurriculum
  } = useActiveStudentApi();
  
  const { 
    useInfiniteComboList,
    useInfiniteProgramList,
    useInfiniteCurriculumList
  } = useSchoolApi();

  // Determine which API to use based on active filter
  const getActiveFilter = () => {
    if (selectedCombo) return 'combo';
    if (selectedProgram) return 'program';
    if (selectedCurriculum) return 'curriculum';
    return 'none';
  };

  // Use the appropriate hook based on active filter
  const activeFilter = getActiveFilter();
  
  const { data: studentsDataByCombo, isLoading: isLoadingByCombo } = useActiveStudentsByCombo(
    selectedCombo, currentPage, pageSize
  );
  
  const { data: studentsDataByProgram, isLoading: isLoadingByProgram } = useActiveStudentsByProgram(
    selectedProgram, currentPage, pageSize
  );
  
  const { data: studentsDataByCurriculum, isLoading: isLoadingByCurriculum } = useActiveStudentsByCurriculum(
    selectedCurriculum, currentPage, pageSize
  );
  
  const { data: studentsDataGeneral, isLoading: isLoadingGeneral } = usePagedActiveStudents(
    currentPage, pageSize, search, selectedProgram
  );

  // Get the appropriate data based on active filter
  const getStudentsData = () => {
    switch (activeFilter) {
      case 'combo':
        return studentsDataByCombo;
      case 'program':
        return studentsDataByProgram;
      case 'curriculum':
        return studentsDataByCurriculum;
      default:
        return studentsDataGeneral;
    }
  };

  const getIsLoading = () => {
    switch (activeFilter) {
      case 'combo':
        return isLoadingByCombo;
      case 'program':
        return isLoadingByProgram;
      case 'curriculum':
        return isLoadingByCurriculum;
      default:
        return isLoadingGeneral;
    }
  };
  
  // Extract data from the hook
  const studentsData = getStudentsData();
  const isLoading = getIsLoading();
  const studentList = studentsData?.items || [];
  const pagination = studentsData ? {
    current: studentsData.pageNumber,
    pageSize: studentsData.pageSize,
    total: studentsData.totalCount,
    totalPages: Math.ceil(studentsData.totalCount / studentsData.pageSize)
  } : null;

  // Infinite scroll data for filter dropdowns
  const { data: comboData, isLoading: isLoadingCombos } = useInfiniteComboList(comboPage, 20, comboSearch);
  const { data: programData, isLoading: isLoadingPrograms } = useInfiniteProgramList(programPage, 20, programSearch);
  const { data: curriculumData, isLoading: isLoadingCurriculums } = useInfiniteCurriculumList(curriculumPage, 20, curriculumSearch);

  // Handle pagination change
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  // Handle filter changes - these are exclusive
  const handleComboFilterChange = (value: string | null) => {
    setSelectedCombo(value);
    setSelectedProgram(null);
    setSelectedCurriculum(null);
    setCurrentPage(1);
  };

  const handleProgramFilterChange = (value: number | null) => {
    setSelectedProgram(value);
    setSelectedCombo(null);
    setSelectedCurriculum(null);
    setCurrentPage(1);
  };

  const handleCurriculumFilterChange = (value: string | null) => {
    setSelectedCurriculum(value);
    setSelectedCombo(null);
    setSelectedProgram(null);
    setCurrentPage(1);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Handle infinite scroll search changes
  const handleComboSearchChange = (value: string) => {
    setComboSearch(value);
    setComboPage(1);
  };

  const handleProgramSearchChange = (value: string) => {
    setProgramSearch(value);
    setProgramPage(1);
  };

  const handleCurriculumSearchChange = (value: string) => {
    setCurriculumSearch(value);
    setCurriculumPage(1);
  };

  // Get student profile ID for dashboard hook
  const studentProfileId = selectedStudent?.studentDataDetailResponse?.id || selectedStudent?.studentDataListResponse?.id || null;
  
  // Student dashboard hook
  const { subjectData, performanceData, loading: dashboardLoading, error: dashboardError } = useStudentDashboard(
    studentProfileId
  );

  // Handle row click to open performance modal
  const handleRowClick = (record: StudentBase) => {
    setSelectedStudent(record);
    setIsPerformanceModalVisible(true);
  };
  // Handle modal close
  const handlePerformanceModalClose = () => {
    setIsPerformanceModalVisible(false);
    setSelectedStudent(null);
  };

  // Table columns
  const columns = [
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email', 
      align: 'left' as 'left', 
      render: (text: string) => <span style={{ color: '#1E293B', fontWeight: 500 }}>{text}</span> 
    },
    { 
      title: 'First Name', 
      dataIndex: 'firstName', 
      key: 'firstName', 
      align: 'left' as 'left', 
      render: (text: string) => <span style={{ color: '#1E293B' }}>{text}</span> 
    },
    { 
      title: 'Last Name', 
      dataIndex: 'lastName', 
      key: 'lastName', 
      align: 'left' as 'left', 
      render: (text: string) => <span style={{ color: '#1E293B' }}>{text}</span> 
    },
    { 
      title: 'Account Name', 
      dataIndex: 'username', 
      key: 'username', 
      align: 'left' as 'left', 
      render: (username: string) => <span style={{ color: '#1E293B' }}>{username ? username : 'N/A'}</span> 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      align: 'center' as 'center', 
      render: (status: number) => (
        <span style={{ 
          color: status === 0 ? '#10b981' : '#ef4444',
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '8px',
          backgroundColor: status === 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1.5px solid ${status === 0? '#10b981' : '#ef4444'}`,
          fontSize: '13px',
          minWidth: 70,
          display: 'inline-block',
          textAlign: 'center',
        }}>
          {status === 0 ? 'Active' : 'Inactive'}
        </span>
      ) 
    },
  ];

  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: '#1E40AF',
              headerColor: '#fff',
              borderColor: 'rgba(30, 64, 175, 0.08)',
              colorText: '#1E293B',
              colorBgContainer: 'rgba(255,255,255,0.95)',
              colorBgElevated: 'rgba(255,255,255,0.95)',
              rowHoverBg: 'rgba(249, 115, 22, 0.05)',
              colorPrimary: '#f97316',
              colorPrimaryHover: '#1E40AF',
            },
          },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={styles.motionContainer}
        >
          <Card 
            title={
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <BookOutlined className={styles.bookIcon} />
                  <Text strong>Student Enrollment Data</Text>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    ({studentList.length} students)
                  </Text>
                </Space>
                <Text type="secondary" style={{ fontSize: '12px', marginLeft: 24 }}>
                  💡 Click on any student row to view their academic performance dashboard
                </Text>
              </Space>
            }
            className={styles.tableCard}
          >
            {/* Table Filters */}
            <Affix offsetTop={70} style={{zIndex: 10}}>
              <Card 
                className={glassStyles.appleGlassCard}
                style={{ 
                  marginBottom: 24,
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {/* First Row: Search */}
                <Row gutter={[10, 10]} align="middle" style={{ marginBottom: 10 }}>
                  <Col xs={24} sm={24}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text style={{color:"black"}} strong>Search Students</Text>
                      <input
                        placeholder="Search by name, email or ID"
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        style={{
                          borderRadius: 12, 
                          width: '90%', 
                          backgroundColor:"rgba(255,255,255,0.8)",
                          border: '1px solid #d9d9d9',
                          padding: '8px 12px',
                          fontSize: '14px'
                        }}
                      />
                    </Space>
                  </Col>
                </Row>
                
                {/* Second Row: Filters */}
                <Row gutter={[10, 10]} align="middle" style={{ marginBottom: 0 }}>
                  <Col xs={24} sm={24}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Row gutter={[10, 10]}>
                        <Col xs={24} sm={8}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Text style={{color:"black"}} strong>Filter by Combo</Text>
                            <Select
                              allowClear
                              placeholder="Select Combo"
                              value={selectedCombo}
                              onChange={handleComboFilterChange}
                              loading={isLoadingCombos}
                              style={{borderRadius: 12, width: '100%'}}
                              size="middle"
                              showSearch
                              filterOption={false}
                              onSearch={handleComboSearchChange}
                              onPopupScroll={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
                                  setComboPage(prev => prev + 1);
                                }
                              }}
                            >
                              {comboData?.items?.map((combo: Combo) => (
                                <Select.Option key={combo.id} value={combo.comboName}>
                                  {combo.comboName}
                                </Select.Option>
                              ))}
                            </Select>
                          </Space>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Text style={{color:"black"}} strong>Filter by Program</Text>
                            <Select
                              allowClear
                              placeholder="Select Program"
                              value={selectedProgram}
                              onChange={handleProgramFilterChange}
                              loading={isLoadingPrograms}
                              style={{borderRadius: 12, width: '100%'}}
                              size="middle"
                              showSearch
                              filterOption={false}
                              onSearch={handleProgramSearchChange}
                              onPopupScroll={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
                                  setProgramPage(prev => prev + 1);
                                }
                              }}
                            >
                              {programData?.items?.map((program: Program) => (
                                <Select.Option key={program.id} value={program.id}>
                                  {program.programName}
                                </Select.Option>
                              ))}
                            </Select>
                          </Space>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Text style={{color:"black"}} strong>Filter by Curriculum</Text>
                            <Select
                              allowClear
                              placeholder="Select Curriculum"
                              value={selectedCurriculum}
                              onChange={handleCurriculumFilterChange}
                              loading={isLoadingCurriculums}
                              style={{borderRadius: 12, width: '100%'}}
                              size="middle"
                              showSearch
                              filterOption={false}
                              onSearch={handleCurriculumSearchChange}
                              onPopupScroll={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
                                  setCurriculumPage(prev => prev + 1);
                                }
                              }}
                            >
                              {curriculumData?.items?.map((curriculum: Curriculum) => (
                                <Select.Option key={curriculum.id} value={curriculum.curriculumCode}>
                                  {curriculum.curriculumCode}
                                </Select.Option>
                              ))}
                            </Select>
                          </Space>
                        </Col>
                      </Row>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Affix>

            {/* Student Table */}
            <Table
              columns={columns}
              dataSource={studentList}
              rowKey="id"
              className={styles.tableContainer}
              locale={{ emptyText: <Empty description="No students found." /> }}
              scroll={{ x: 'max-content' }}
              loading={isLoading}
              pagination={false}
              size="middle"
              onRow={(record: StudentBase) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: 'pointer' }
              })}
            />
            
            {/* Pagination */}
            {pagination && pagination.total > 0 && (
              <div style={{marginTop: 32, display: 'flex', justifyContent: 'center'}}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showSizeChanger
                  pageSizeOptions={[5, 10, 20, 50]}
                  onChange={handlePageChange}
                  style={{borderRadius: 8}}
                />
              </div>
            )}
          </Card>
        </motion.div>
      </ConfigProvider>

      {/* Student Performance Modal */}
      <StudentPerformanceModal
        visible={isPerformanceModalVisible}
        onClose={handlePerformanceModalClose}
        studentName={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ''}
        subjectData={subjectData}
        performanceData={performanceData}
        loading={dashboardLoading}
        error={dashboardError}
      />
    </>
  );
};

export default StudentTableSection;
