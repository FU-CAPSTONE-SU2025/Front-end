import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Row, Col, ConfigProvider, Card, Space, Typography, Affix, Pagination, Empty, Modal, Descriptions, Avatar, Tag, Spin, Tabs, List } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { useActiveStudentApi } from '../../hooks/useActiveStudentApi';
import { useSchoolApi } from '../../hooks/useSchoolApi';
import { GetCurrentStudentUser } from '../../api/Account/UserAPI';
import { useStudentApi } from '../../hooks/useStudentApi';

const { Title, Text } = Typography;

type StudentCheckpointItem = { id: number; title: string; isCompleted: boolean; deadline: string };
type StudentCheckpointsPaged = { items: StudentCheckpointItem[]; totalCount: number; pageNumber: number; pageSize: number };

// Inline, lower-case-first component name as requested
const studentDetailModal: React.FC<{
  open: boolean;
  onClose: () => void;
  studentId: number | null;
  studentProfileId: number | null;
}> = ({ open, onClose, studentId, studentProfileId }) => {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [activeKey, setActiveKey] = useState<string>('academic');
  const [todoPage, setTodoPage] = useState(1);
  const [todoPageSize, setTodoPageSize] = useState(5);
  const [isInCompletedOnly, setIsInCompletedOnly] = useState<boolean>(true);
  const [isNoneFilterStatus, setIsNoneFilterStatus] = useState<boolean>(false);
  const [isOrderedByNearToFarDeadlin, setIsOrderedByNearToFarDeadlin] = useState<boolean>(true);
  const { useStudentCheckpoints } = useStudentApi();
  const { data: todoData, isLoading: todoLoading } = useStudentCheckpoints(
    studentProfileId,
    todoPage,
    todoPageSize,
    open && activeKey === 'todos',
    { isInCompletedOnly, isNoneFilterStatus, isOrderedByNearToFarDeadlin }
  ) as { data: StudentCheckpointsPaged | undefined; isLoading: boolean };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!open || !studentId) return;
      setLoading(true);
      try {
        const res = await GetCurrentStudentUser(studentId);
        setDetail(res);
      } catch (err) {
        console.error('Failed to fetch student detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [open, studentId]);

  const statusTag = (status?: number) => {
    if (status === 0) return <Tag color="green">Active</Tag>;
    if (status === 1) return <Tag color="red">Inactive</Tag>;
    return <Tag>Unknown</Tag>;
  };

  return (
    <Modal
      title={<span style={{ color: '#0f172a', fontWeight: 600 }}>Student Detail</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <Spin />
        </div>
      ) : (
        <div style={{ paddingTop: 8 }}>
          {/* Basic Header Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Avatar size={56} src={detail?.avatarUrl || undefined} icon={<UserOutlined />} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#0f172a' }}>
                {detail?.firstName} {detail?.lastName}
              </div>
              <div style={{ color: '#475569' }}>{detail?.email}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>{statusTag(detail?.status)}</div>
          </div>

          {/* Tabs below basic info */}
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            items={[
              {
                key: 'academic',
                label: 'Academic Profile',
                children: (
                  <>
                    {/* Basic account details */}
                    <Descriptions bordered column={2} size="middle">
                      <Descriptions.Item label="User ID">{detail?.id ?? '-'}</Descriptions.Item>
                      <Descriptions.Item label="Username">{detail?.username ?? '-'}</Descriptions.Item>
                      <Descriptions.Item label="Role">{detail?.roleName ?? '-'}</Descriptions.Item>
                      <Descriptions.Item label="Date of Birth">
                        {detail?.dateOfBirth ? new Date(detail.dateOfBirth).toLocaleDateString() : '-'}
                      </Descriptions.Item>
                    </Descriptions>

                    {/* Academic details */}
                    <div style={{ height: 12 }} />
                    <div style={{ fontWeight: 600, color: '#0f172a', margin: '4px 0 8px' }}>Academic</div>
                    <Descriptions bordered column={2} size="middle">
                      <Descriptions.Item label="Profile ID">
                        {detail?.studentDataDetailResponse?.id ?? '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Enrolled At">
                        {detail?.studentDataDetailResponse?.enrolledAt
                          ? new Date(detail.studentDataDetailResponse.enrolledAt).toLocaleString()
                          : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Career Goal" span={2}>
                        {detail?.studentDataDetailResponse?.careerGoal || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Number Of Ban">
                        {detail?.studentDataDetailResponse?.numberOfBan ?? 0}
                      </Descriptions.Item>
                      <Descriptions.Item label="Program ID">
                        {detail?.studentDataDetailResponse?.programId ?? '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Registered Combo" span={2}>
                        {detail?.studentDataDetailResponse?.registeredComboCode || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Curriculum Code" span={2}>
                        {detail?.studentDataDetailResponse?.curriculumCode || '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  </>
                ),
              },
              {
                key: 'todos',
                label: 'Todo List',
                children: (
                  <div>
                    {/* Filter/Sort Controls */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'nowrap', overflowX: 'auto' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>Tasks</span>
                        <Select
                          value={isInCompletedOnly ? 'incomplete' : 'all'}
                          onChange={(v) => { setTodoPage(1); setIsInCompletedOnly(v === 'incomplete'); }}
                          style={{ width: 190 }}
                          options={[
                            { label: 'Incomplete', value: 'incomplete' },
                            { label: 'All', value: 'all' },
                          ]}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>Status</span>
                        <Select
                          value={isNoneFilterStatus ? 'ignore' : 'respect'}
                          onChange={(v) => { setTodoPage(1); setIsNoneFilterStatus(v === 'ignore'); }}
                          style={{ width: 200 }}
                          options={[
                            { label: 'Respect', value: 'respect' },
                            { label: 'Ignore', value: 'ignore' },
                          ]}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>Order</span>
                        <Select
                          value={isOrderedByNearToFarDeadlin ? 'deadline' : 'default'}
                          onChange={(v) => { setTodoPage(1); setIsOrderedByNearToFarDeadlin(v === 'deadline'); }}
                          style={{ width: 210 }}
                          options={[
                            { label: 'Deadline', value: 'deadline' },
                            { label: 'Default', value: 'default' },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Todo List with scroll and 5/page */}
                    {todoLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                        <Spin />
                      </div>
                    ) : (
                      <>
                        <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
                          <List
                            dataSource={todoData?.items || []}
                            locale={{ emptyText: 'No todos found.' }}
                            renderItem={(item) => (
                              <List.Item>
                                <List.Item.Meta
                                  title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{item.title}</span>
                                      {item.isCompleted ? <Tag color="blue">Completed</Tag> : <Tag color="gold">Pending</Tag>}
                                    </div>
                                  }
                                  description={
                                    <div style={{ color: '#475569' }}>
                                      Deadline: {item.deadline ? new Date(item.deadline).toLocaleString() : '-'}
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                          <Pagination
                            current={todoPage}
                            pageSize={todoPageSize}
                            total={todoData?.totalCount || 0}
                            showSizeChanger={false}
                            onChange={(page) => {
                              setTodoPage(page);
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </Modal>
  );
};

const StudentOverview: React.FC = () => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter states - exclusive
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState<number | null>(null);

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

  // Determine active filter
  const getActiveFilter = () => {
    if (selectedCombo) return 'combo' as const;
    if (selectedProgram) return 'program' as const;
    if (selectedCurriculum) return 'curriculum' as const;
    return 'none' as const;
  };

  const activeFilter = getActiveFilter();

  // Data hooks based on filter
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

  const studentsData = getStudentsData();
  const isLoading = getIsLoading();
  const studentList = studentsData?.items || [];
  const pagination = studentsData ? {
    current: studentsData.pageNumber,
    pageSize: studentsData.pageSize,
    total: studentsData.totalCount,
    totalPages: Math.ceil(studentsData.totalCount / studentsData.pageSize)
  } : null;

  // Infinite filter data
  const { data: comboData, isLoading: isLoadingCombos } = useInfiniteComboList(comboPage, 20, comboSearch);
  const { data: programData, isLoading: isLoadingPrograms } = useInfiniteProgramList(programPage, 20, programSearch);
  const { data: curriculumData, isLoading: isLoadingCurriculums } = useInfiniteCurriculumList(curriculumPage, 20, curriculumSearch);

  // Handlers
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

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

  // Table columns (view-only)
  const columns = [
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email', 
      align: 'left' as const,
      render: (text: string) => <span style={{ color: '#0f172a', fontWeight: 500 }}>{text}</span> 
    },
    { 
      title: 'First Name', 
      dataIndex: 'firstName', 
      key: 'firstName', 
      align: 'left' as const,
      render: (text: string) => <span style={{ color: '#0f172a' }}>{text}</span> 
    },
    { 
      title: 'Last Name', 
      dataIndex: 'lastName', 
      key: 'lastName', 
      align: 'left' as const,
      render: (text: string) => <span style={{ color: '#0f172a' }}>{text}</span> 
    },
    { 
      title: 'Account Name', 
      dataIndex: 'username', 
      key: 'username', 
      align: 'left' as const,
      render: (username: string) => <span style={{ color: '#0f172a' }}>{username ? username : 'N/A'}</span> 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      align: 'center' as const,
      render: (status: number) => (
        <span style={{ 
          color: status === 0 ? '#10b981' : '#ef4444',
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '8px',
          backgroundColor: status === 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1.5px solid ${status === 0 ? '#10b981' : '#ef4444'}`,
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
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: '#1D4ED8',
            headerColor: '#ffffff',
            borderColor: '#e5e7eb',
            colorText: '#0f172a',
            colorBgContainer: '#ffffff',
            colorBgElevated: '#ffffff',
            rowHoverBg: 'rgba(37, 99, 235, 0.06)',
            colorPrimary: '#3b82f6',
            colorPrimaryHover: '#2563eb',
          },
          Input: {
            colorBgBase:'#ffffff',
            colorText: '#0f172a',
            colorPrimary: '#3b82f6',
            colorPrimaryHover: '#2563eb',
            colorBorder:'#cbd5e1'
          },
          Select: {
            colorBgContainer: '#ffffff',
            colorBorder: '#cbd5e1',
            colorText: '#0f172a',
            colorPrimary: '#3b82f6',
            colorPrimaryHover: '#2563eb',
          },
          Pagination: {
            colorPrimary: '#3b82f6',
          },
          Card: {
            colorBgContainer: '#ffffff'
          }
        },
      }}
    >
      <div style={{ background: '#ffffff', minHeight: '100vh', padding: '24px' }}>
        {/* Toolbar */}
        <Affix offsetTop={80} style={{zIndex: 10}}>
          <Card 
            style={{ 
              marginBottom: 24,
              padding: '1.5rem 2rem',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            {/* First Row: Search */}
            <Row gutter={[10, 10]} align="middle" style={{ marginBottom: 12 }}>
              <Col xs={24} sm={18}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text style={{color:'#0f172a'}} strong>Search Students</Text>
                  <Input
                    placeholder="Search by name, email or ID"
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                    style={{borderRadius: 12, width: '90%'}}
                    size="large"
                  />
                </Space>
              </Col>
            </Row>

            {/* Filters */}
            <Row gutter={[10, 10]} align="middle" style={{ marginBottom: 0 }}>
              <Col xs={24} sm={24}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Row gutter={[10, 10]}>
                    <Col xs={24} sm={8}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text style={{color:'#0f172a'}} strong>Filter by Combo</Text>
                        <Select
                          allowClear
                          placeholder="Select Combo"
                          value={selectedCombo}
                          onChange={handleComboFilterChange}
                          loading={isLoadingCombos}
                          style={{borderRadius: 12, width: '100%'}}
                          size="large"
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
                          {comboData?.items?.map((combo: any) => (
                            <Select.Option key={combo.id} value={combo.comboName}>
                              {combo.comboName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Space>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text style={{color:'#0f172a'}} strong>Filter by Program</Text>
                        <Select
                          allowClear
                          placeholder="Select Program"
                          value={selectedProgram}
                          onChange={handleProgramFilterChange}
                          loading={isLoadingPrograms}
                          style={{borderRadius: 12, width: '100%'}}
                          size="large"
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
                          {programData?.items?.map((program: any) => (
                            <Select.Option key={program.id} value={program.id}>
                              {program.programName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Space>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text style={{color:'#0f172a'}} strong>Filter by Curriculum</Text>
                        <Select
                          allowClear
                          placeholder="Select Curriculum"
                          value={selectedCurriculum}
                          onChange={handleCurriculumFilterChange}
                          loading={isLoadingCurriculums}
                          style={{borderRadius: 12, width: '100%'}}
                          size="large"
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
                          {curriculumData?.items?.map((curriculum: any) => (
                            <Select.Option key={curriculum.id} value={curriculum.curriculumCode}>
                              {curriculum.curriculumCode} - {curriculum.curriculumName}
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

        {/* Students Table */}
        <Table
          columns={columns}
          dataSource={studentList}
          rowKey="id"
          className={styles.sttFreshTable}
          locale={{ emptyText: <Empty description="No students found." /> }}
          scroll={{ x: 'max-content' }}
          loading={isLoading}
          pagination={false}
          onRow={(record) => ({
            onClick: () => {
              setSelectedStudentId(record.id);
              const profileId = record?.studentDataListResponse?.id ?? record?.studentDataDetailResponse?.id ?? null;
              setSelectedStudentProfileId(profileId);
              setIsModalOpen(true);
            },
          })}
          style={{
            background: '#ffffff',
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

        {/* Detail Modal */}
        {React.createElement(studentDetailModal, {
          open: isModalOpen,
          onClose: () => setIsModalOpen(false),
          studentId: selectedStudentId,
          studentProfileId: selectedStudentProfileId,
        })}
      </div>
    </ConfigProvider>
  );
};

export default StudentOverview;
