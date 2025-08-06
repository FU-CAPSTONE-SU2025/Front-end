import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Row, Col, ConfigProvider, message, Card, Space, Typography, Affix, Pagination, Empty } from 'antd';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { GetPagedActiveStudent } from '../../api/Account/UserAPI';
import { StudentBase } from '../../interfaces/IStudent';
import { useCRUDProgram } from '../../hooks/useCRUDSchoolMaterial';

const { Title, Text } = Typography;

const StaffTranscript: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [studentList, setStudentList] = useState<StudentBase[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Program API for filter
  const {
    getAllPrograms,
    programList,
    isLoading: isLoadingProgram
  } = useCRUDProgram();

  // Load programs for filter
  useEffect(() => {
    getAllPrograms({ pageNumber: 1, pageSize: 10, searchQuery: '' });
  }, []);

  // Load data when pagination or filters change
  useEffect(() => {
    loadStudentData();
  }, [currentPage, pageSize, searchQuery, selectedProgram]);

  const loadStudentData = async () => {
    setIsLoading(true);
    try {
      const result = await GetPagedActiveStudent(currentPage, pageSize, searchQuery, selectedProgram || undefined);
      
      if (result) {
        setStudentList(result.items || []);
        setPagination({
          current: result.pageNumber,
          pageSize: result.pageSize,
          total: result.totalCount,
          totalPages: Math.ceil(result.totalCount / result.pageSize)
        });
      } else {
        message.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pagination change
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  // Handle program filter change
  const handleProgramFilterChange = (value: number | null) => {
    setSelectedProgram(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle edit action
  const handleEdit = (studentId: number) => {
    navigate(`/staff/editStudentTranscript/${studentId}`);
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
      title: 'Date of Birth', 
      dataIndex: 'dateOfBirth', 
      key: 'dateOfBirth', 
      align: 'left' as 'left', 
      render: (date: Date) => <span style={{ color: '#1E293B' }}>{date ? new Date(date).toLocaleDateString('en-GB') : '-'}</span> 
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
            colorBgContainer: 'rgba(255,255,255,0.7)',
            colorBorder: '#f97316',
            colorText: '#1E293B',
            colorPrimary: '#f97316',
            colorPrimaryHover: '#1E40AF',
          },
          Select: {
            colorBgContainer: 'rgba(255,255,255,0.7)',
            colorBorder: '#f97316',
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
                Student Transcript Hub
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Manage and view student transcripts
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
              <Col xs={24} sm={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Search Students</Text>
                  <Input
                    placeholder="Search by name, email or ID"
                    prefix={<SearchOutlined />}
                    value={searchQuery}
                    onChange={e => handleSearchChange(e.target.value)}
                    style={{borderRadius: 12, width: '100%'}}
                    size="large"
                    className={glassStyles.appleGlassInput}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Filter by Program</Text>
                  <Select
                    allowClear
                    placeholder="Select Program"
                    value={selectedProgram}
                    onChange={handleProgramFilterChange}
                    loading={isLoadingProgram}
                    style={{borderRadius: 12, width: '100%'}}
                    size="large"
                    className={glassStyles.appleGlassInput}
                  >
                    {programList.map((program: any) => (
                      <Select.Option key={program.id} value={program.id}>
                        {program.programName}
                      </Select.Option>
                    ))}
                  </Select>
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
      </div>
    </ConfigProvider>
  );
};

export default StaffTranscript;