import React, { useState, useRef } from 'react';
import { Button, Modal, Form, Input, message, Affix, Table, Pagination, Tag, Spin, Card, Space, Row, Col, Typography, Empty, Select } from 'antd';
import {SearchOutlined, BookOutlined, EyeOutlined, CheckOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { useCRUDCurriculum, useCRUDSubjectVersion } from '../../hooks/useCRUDSchoolMaterial';
import { SubjectVersionWithCurriculumInfo} from '../../interfaces/ISchoolProgram';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import ApprovalModal from '../../components/manager/approvalModal';
import { useApprovalActions } from '../../hooks/useApprovalActions';
import { useCRUDProgram } from '../../hooks/useCRUDSchoolMaterial';

const { Title, Text } = Typography;


const CurriculumPageManager: React.FC = () => {
  const [subjectsModalOpen, setSubjectsModalOpen] = useState(false);

  const [selectedCurriculum, setSelectedCurriculum] = useState<any>(null);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [programId, setProgramId] = useState<number | null>(null);
  // Program Select state
  const [programSelectSearch, setProgramSelectSearch] = useState('');
  const [programOptions, setProgramOptions] = useState<any[]>([]);
  const [programFetching, setProgramFetching] = useState(false);
  const programPageRef = useRef(1);


  // Approval state
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string } | null>(null);

  // API integration
  const {
    getCurriculumMutation,
    fetchCurriculumSubjectVersionsMutation,
    curriculumList,
    paginationCurriculum,
    isLoading
  } = useCRUDCurriculum();

  const { getSubjectVersionMutation } = useCRUDSubjectVersion();

  // Program API
  const {
    getAllPrograms,
    programList,
    paginationProgram,
    isLoading: isLoadingProgram
  } = useCRUDProgram();

  // Approval hook
  const { handleApproval, isApproving } = useApprovalActions();

  // State for subject versions in the selected curriculum
  const [curriculumSubjectVersions, setCurriculumSubjectVersions] = useState<SubjectVersionWithCurriculumInfo[]>([]);
  const [isLoadingSubjectVersions, setIsLoadingSubjectVersions] = useState(false);
  
  // Pagination state for subject versions
  const [subjectVersionPage, setSubjectVersionPage] = useState(1);
  const [subjectVersionPageSize] = useState(10);

  // Fetch programs for Select (infinite scroll)
  const fetchPrograms = (page = 1, search = '') => {
    setProgramFetching(true);
    getAllPrograms({ pageNumber: page, pageSize: 10, searchQuery: search });
  };

  // Update program options when programList changes
  React.useEffect(() => {
    if (programList && programList.length > 0) {
      setProgramOptions(prev => {
        const ids = new Set(prev.map((p: any) => p.id));
        const newOptions = programList.filter((p: any) => !ids.has(p.id));
        if (programPageRef.current === 1) {
          return programList;
        }
        return [...prev, ...newOptions];
      });
    }
    setProgramFetching(false);
  }, [programList]);

  // Initial fetch for program Select
  React.useEffect(() => {
    programPageRef.current = 1;
    fetchPrograms(1, '');
  }, []);

  // Handler for infinite scroll in program Select
  const handleProgramScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (
      scrollTop + clientHeight >= scrollHeight - 5 &&
      !programFetching &&
      paginationProgram &&
      programOptions.length < paginationProgram.total
    ) {
      programPageRef.current += 1;
      fetchPrograms(programPageRef.current, programSelectSearch);
    }
  };

  // Handler for search in program Select
  const handleProgramSearch = (value: string) => {
    setProgramSelectSearch(value);
    programPageRef.current = 1;
    setProgramOptions([]);
    fetchPrograms(1, value);
  };

  // Fetch curriculums from backend when search/programId/page/pageSize changes
  React.useEffect(() => {
    getCurriculumMutation.mutate({
      pageNumber: currentPage,
      pageSize,
      searchQuery: search,
      programId: programId || undefined
    });
  }, [currentPage, pageSize, search, programId]);

  // Fetch subject versions when subjects modal opens
  React.useEffect(() => {
    if (subjectsModalOpen) {
      getSubjectVersionMutation.mutate({ 
        pageNumber: 1, 
        pageSize: subjectVersionPageSize 
      });
    }
  }, [subjectsModalOpen, subjectVersionPage]);

  // Table columns - simplified structure
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Code',
      dataIndex: 'curriculumCode',
      key: 'curriculumCode',
      width: 160,
      align: 'left' as const,
    },
    {
      title: 'Name',
      dataIndex: 'curriculumName',
      key: 'curriculumName',
      width: 400,
      align: 'left' as const,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#1E40AF' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => (
        <span style={{ 
          color: record.approvalStatus === 1 ? '#52c41a' : '#faad14', 
          fontWeight: 600 
        }}>
          {record.approvalStatus === 1 ? 'Approved' : 'Pending Approval'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => (
        <Button
          type={record.approvalStatus === 1 ? 'default' : 'primary'}
          icon={<CheckOutlined />}
          size="small"
          onClick={async () => {
            if (record.approvalStatus === 1) {
              try {
                await handleApproval('curriculum', record.id, 0, null);
                // Refresh curriculum table data after unapproving
                getCurriculumMutation.mutate({
                  pageNumber: currentPage,
                  pageSize,
                  filterValue: search
                });
              } catch (error) {
                // Error is already handled in the hook
              }
            } else {
              handleApprove(record.id, record.curriculumName);
            }
          }}
          style={{borderRadius: 6}}
        >
          {record.approvalStatus === 1 ? 'Edit status' : 'Approve'}
        </Button>
      ),
    },
    {
      title: 'View Subject Versions',
      key: 'viewVersions',
      align: 'center' as const,
      width: 160,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => onManageSubjects(record)}
          style={{ 
            borderRadius: 6,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            border: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
          }}
        >
          View Subject Versions
        </Button>
      ),
    },
  ];

  // Subject version table columns for the subjects modal
  const subjectVersionColumns = [
    {
      title: 'Subject Code',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      render: (text: string) => (
        <span style={{ fontWeight: '600', color: '#1E40AF' }}>{text}</span>
      ),
    },
    {
      title: 'Subject Name',
      dataIndex: 'subjectName',
      key: 'subjectName',
    },
    {
      title: 'Version',
      dataIndex: 'versionName',
      key: 'versionName',
      render: (text: string, record: SubjectVersionWithCurriculumInfo) => (
        <span style={{ fontWeight: '600', color: '#059669' }}>
          {record.versionName} ({record.versionCode})
        </span>
      ),
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      render: (credits: number) => (
        <Tag color="blue" style={{ fontWeight: '600' }}>
          {credits} credits
        </Tag>
      ),
    },
    {
      title: 'Semester',
      key: 'semester',
      render: (_: any, record: SubjectVersionWithCurriculumInfo) => (
        <Tag color="green" style={{ fontWeight: '600' }}>
          Semester {record.semesterNumber}
        </Tag>
      ),
    },
    {
      title: 'Mandatory',
      key: 'isMandatory',
      render: (_: any, record: SubjectVersionWithCurriculumInfo) => (
        <Tag color={record.isMandatory ? 'red' : 'orange'} style={{ fontWeight: '600' }}>
          {record.isMandatory ? 'Mandatory' : 'Optional'}
        </Tag>
      ),
    },
  ];

  const handleApprove = (id: number, name: string) => {
    setSelectedItem({ id, name });
    setApprovalModalVisible(true);
  };

  const handleApprovalConfirm = async (approvalStatus: number, rejectionReason?: string) => {
    if (!selectedItem) return;
    
    try {
      await handleApproval('curriculum', selectedItem.id, approvalStatus, rejectionReason);
      setApprovalModalVisible(false);
      setSelectedItem(null);
      // Refresh curriculum table data after approval
      getCurriculumMutation.mutate({
        pageNumber: currentPage,
        pageSize,
        filterValue: search
      });
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const onManageSubjects = async (curriculum: any) => {
    setSelectedCurriculum(curriculum);
    setSubjectsModalOpen(true);
    setIsLoadingSubjectVersions(true);
    
    try {
      const versions = await fetchCurriculumSubjectVersionsMutation.mutateAsync(curriculum.id);
      setCurriculumSubjectVersions(versions || []);
    } catch (error) {
      console.error('Failed to fetch curriculum subjects:', error);
      const errorMessage = getUserFriendlyErrorMessage(error);
      message.error(errorMessage);
      setCurriculumSubjectVersions([]);
    } finally {
      setIsLoadingSubjectVersions(false);
    }
  };


  // Remove local filtering, use only backend API
  // Use API-driven data
  const pagedData = curriculumList;

  return (
    <div className={styles.sttContainer}>
      {/* Title Card */}
      <Card 
        className={glassStyles.appleGlassCard}
        style={{ 
          marginBottom: 24,
          padding: '2rem 3rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(30, 64, 175, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1E293B', fontSize: '2.5rem', fontWeight: 800 }}>
              Curriculum Management
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Manage and approve curriculum submissions
            </Text>
          </div>
        </div>
      </Card>

      {/* Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <Card 
          className={glassStyles.appleGlassCard}
          style={{ 
            marginBottom: 24,
            padding: '1.5rem 2rem',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Search Curriculums</Text>
                <Input
                  placeholder="Search by code, name, or description..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  style={{borderRadius: 12, width: '100%'}}
                  size="large"
                  className={glassStyles.appleGlassInput}
                />
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Filter by Program</Text>
                <Select
                  showSearch
                  allowClear
                  placeholder="Select Program"
                  value={programId}
                  onChange={value => { setProgramId(value); setCurrentPage(1); }}
                  onSearch={handleProgramSearch}
                  onPopupScroll={handleProgramScroll}
                  loading={programFetching || isLoadingProgram}
                  style={{borderRadius: 12, width: '100%'}}
                  size="large"
                  filterOption={false}
                  optionLabelProp="label"
                >
                  {programOptions.map((program: any) => (
                    <Select.Option key={program.id} value={program.id} label={program.programName}>
                      {program.programName}
                    </Select.Option>
                  ))}
                </Select>
              </Space>
            </Col>
          </Row>
        </Card>
      </Affix>

      {/* Curriculum Table Container */}
      <Card 
      >
        <Table
          columns={columns}
          dataSource={pagedData}
          rowKey="id"
          loading={isLoading}
          className={styles.sttFreshTable}
          locale={{ emptyText: <Empty description="No curriculums available." /> }}
          scroll={{ x: 'max-content' }}
          pagination={false}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            overflow: 'hidden'
          }}
        />
        
      {/* Pagination */}
      {paginationCurriculum && paginationCurriculum.total > 0 && (
        <div style={{marginTop: 32, display: 'flex', justifyContent: 'center'}}>
          <Pagination
            current={paginationCurriculum.current}
            pageSize={paginationCurriculum.pageSize}
            total={paginationCurriculum.total}
            showSizeChanger
            pageSizeOptions={[5, 10, 20, 50]}
            onChange={(p, ps) => { setCurrentPage(p); setPageSize(ps); }}
            style={{borderRadius: 8}}
          />
        </div>
      )}
      </Card>
      {/* Subjects Management Modal */}
      <Modal
        open={subjectsModalOpen}
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            color: '#1E40AF',
            fontWeight: '600'
          }}>
            <BookOutlined style={{ fontSize: '18px' }} />
            View Subject Versions - {selectedCurriculum?.curriculumName || 'Curriculum'}
          </div>
        }
        onCancel={() => setSubjectsModalOpen(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setSubjectsModalOpen(false)}
            style={{ borderRadius: 6 }}
          >
            Close
          </Button>
        ]}
        width={900}
        destroyOnClose
        centered
        style={{
          borderRadius: 16
        }}
        bodyStyle={{
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 16 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8 
            }}>
              <BookOutlined style={{ color: '#1E40AF', fontSize: '18px' }} />
              <span style={{ fontWeight: '600', color: '#1E40AF' }}>
                Curriculum Subject
              </span>
            </div>
          </div>
          {/* Filtering Information */}
          <div style={{ 
            background: 'rgba(59,130,246,0.05)', 
            border: '1px solid rgba(59,130,246,0.1)', 
            borderRadius: 8, 
            padding: '12px', 
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ 
                background: '#dbeafe', 
                color: '#1e40af', 
                padding: '2px 6px', 
                borderRadius: 4,
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {curriculumSubjectVersions.length}
              </span>
              subjects in curriculum
            </div>
          </div>
          {isLoadingSubjectVersions ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin tip="Loading subjects..." />
            </div>
          ) : curriculumSubjectVersions.length > 0 ? (
            <Table
              dataSource={curriculumSubjectVersions}
              columns={subjectVersionColumns}
              rowKey="id"
              pagination={false}
              size="small"
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(30,64,175,0.1)',
                border: '1px solid rgba(30,64,175,0.1)'
              }}
            />
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#64748b',
              background: 'rgba(30,64,175,0.05)',
              borderRadius: 16,
              border: '1px solid rgba(30,64,175,0.1)'
            }}>
              <BookOutlined style={{ fontSize: '48px', marginBottom: 16, opacity: 0.5, color: '#1E40AF' }} />
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                No subject versions assigned to this curriculum yet.
              </div>
              <div style={{ fontSize: '14px', opacity: 0.7, color: '#64748b' }}>
                No subject versions to display.
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Approval Modal */}
      <ApprovalModal
        visible={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false);
          setSelectedItem(null);
        }}
        onConfirm={handleApprovalConfirm}
        type="curriculum"
        itemId={selectedItem?.id || 0}
        itemName={selectedItem?.name || ''}
        loading={isApproving}
      />
    </div>
  );
};

export default CurriculumPageManager;