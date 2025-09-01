import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Row, Col, ConfigProvider, Card, Space, Typography, Affix, Pagination, Empty } from 'antd';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { StudentBase } from '../../interfaces/IStudent';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useActiveStudentApi } from '../../hooks/useActiveStudentApi';
import { useSchoolApi } from '../../hooks/useSchoolApi';
import BulkDataImport from '../../components/common/bulkDataImport';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { transformMultiStudentBulkImportData } from '../../utils/bulkImportTransformers';
import { Combo, Curriculum, Program } from '../../interfaces/ISchoolProgram';

const { Text } = Typography;

const StaffTranscript: React.FC = () => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useApiErrorHandler();
  
  // Filter states - these are exclusive
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);
  
  // Infinite scroll states for filter dropdowns
  const [comboPage, setComboPage] = useState(1);
  const [programPage, setProgramPage] = useState(1);
  const [curriculumPage, setCurriculumPage] = useState(1);
  const [comboSearch, setComboSearch] = useState('');
  const [programSearch, setProgramSearch] = useState('');
  const [curriculumSearch, setCurriculumSearch] = useState('');
  
  // Bulk import states
  const [isBulkImportVisible, setIsBulkImportVisible] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

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
  
  const { registerMultipleStudents } = useSchoolApi();

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

  // Handle edit action
  const handleEdit = (studentId: number) => {
    navigate(`/staff/editStudentTranscript/${studentId}`);
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
      setUploadMessage('Uploading student-subject assignments...');

      // Check for multi-student bulk import first
      const multiStudentData = importedData['BULK_JOINED_SUBJECT_MULTI_STUDENT'] || [];
      if (multiStudentData.length > 0) {
        // Handle multi-student bulk import
        const bulkData = transformMultiStudentBulkImportData(multiStudentData);
        const result = await registerMultipleStudents(bulkData);
        
        if (result) {
          setUploadStatus('success');
          setUploadMessage(`Successfully imported subject assignments for ${bulkData.userNameToSubjectsMap.length} students!`);
          handleSuccess('Multi-student bulk import completed successfully');
        } else {
          setUploadStatus('error');
          setUploadMessage('Failed to import multi-student subject assignments.');
        }
        return;
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      setUploadStatus('error');
      setUploadMessage('An error occurred during import. Please check your file format.');
      handleError('Bulk import failed');
    }
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
    { 
      title: 'Actions', 
      key: 'actions', 
      align: 'center' as 'center', 
      render: (_: any, record: StudentBase) => (
        <Button 
          type="link" 
          icon={<EditOutlined style={{ color: '#f97316' }} />} 
          onClick={() => handleEdit(record.id)} 
          title="Edit Student" 
          className={styles.sttFreshEditButton} 
          style={{ color: '#f97316' }} 
        />
      )
    },
  ];

  return (
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
          Input: {
            colorBgBase:"rgba(255,255,255,0.8)",
            colorText: '#1E293B',
            colorPrimary: '#f97316',
            colorPrimaryHover: '#1E40AF',
            colorBorder:"black"
          },
          Select: {
            colorBgContainer: 'rgba(255,255,255,0.8)',
            colorBorder: 'none',
            colorText: '#1E293B',
            colorPrimary: '#f97316',
            colorPrimaryHover: '#1E40AF',
          },
          Button: {
            colorPrimary: '#f97316',
            colorPrimaryHover: '#1E40AF',
            colorText: '#fff',
            colorTextLightSolid: '#fff',
            colorTextDisabled: '#bdbdbd',
          },
        },
      }}
    >
      <div className={styles.sttContainer}
      style={{height:"auto"}}
      >
        {/* Toolbar */}
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
            {/* First Row: Search and Import */}
            <Row gutter={[10, 10]} align="middle" style={{ marginBottom: 10 }}>
              <Col xs={24} sm={18}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text style={{color:"black"}} strong>Search Students</Text>
                  <Input
                    placeholder="Search by name, email or ID"
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                    style={{borderRadius: 12, width: '90%',backgroundColor:"rgba(255,255,255,0.8)"}}
                    size="large"
                    className={glassStyles.appleGlassInput}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={6} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', minHeight: 66 }}>
                <ExcelImportButton
                  style={{borderRadius: 10}}
                  onClick={handleBulkImport} size="middle">
                  Import many students to many subjects
                </ExcelImportButton>
              </Col>
            </Row>
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
                          size="large"
                          className={glassStyles.appleGlassInput}
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
                          size="large"
                          className={glassStyles.appleGlassInput}
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
                          size="large"
                          className={glassStyles.appleGlassInput}
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

        {/* Student Table Container */}
          <Table
            columns={columns}
            dataSource={studentList}
            rowKey="id"
            className={styles.sttFreshTable}
            locale={{ emptyText: <Empty description="No students found." /> }}
            scroll={{ x: 'max-content' }}
            loading={isLoading}
            pagination={false}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              overflow: 'hidden'
            }}
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
          
          {/* Bulk Import Modal */}
          {isBulkImportVisible && (
            <BulkDataImport
              onClose={handleBulkImportClose}
              onDataImported={handleBulkImportData}
              supportedTypes={['BULK_JOINED_SUBJECT', 'BULK_JOINED_SUBJECT_MULTI_STUDENT']}
              uploadStatus={uploadStatus}
              uploadMessage={uploadMessage}
            />
          )}
        </div>
      </ConfigProvider>
  );
};

export default StaffTranscript;