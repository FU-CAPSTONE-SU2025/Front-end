import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router';
import { Card, ConfigProvider, Descriptions, Spin, Tag, Typography, List, Pagination, Row, Col, Avatar, Tabs, Divider, Select, Space, Badge, Statistic, Button } from 'antd';
import { UserOutlined, CalendarOutlined, MailOutlined, BookOutlined, TrophyOutlined, ClockCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { GetCurrentStudentUser } from '../../api/Account/UserAPI';
import { useStudentApi } from '../../hooks/useStudentApi';

const { Title, Text } = Typography;
const { Option } = Select;

const StudentDetail: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const profileIdParam = query.get('profileId');
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [todoPage, setTodoPage] = useState(1);
  const [todoPageSize] = useState(5);
  const [activeTab, setActiveTab] = useState<string>('subjects');
  
  // Filter states for todo list
  const [taskFilter, setTaskFilter] = useState<boolean | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [orderFilter, setOrderFilter] = useState<boolean | undefined>(undefined);
  
  const { useStudentCheckpoints, useStudentJoinedSubjects } = useStudentApi();
  const studentProfileId = useMemo(() => {
    return detail?.studentDataDetailResponse?.id || (profileIdParam ? Number(profileIdParam) : null);
  }, [detail?.studentDataDetailResponse?.id, profileIdParam]);

  // Memoize filter options to prevent unnecessary re-renders
  const filterOptions = useMemo(() => {
    const options = {
      ...(taskFilter !== undefined && { isInCompletedOnly: taskFilter }),
      ...(statusFilter !== undefined && { isNoneFilterStatus: statusFilter }),
      ...(orderFilter !== undefined && { isOrderedByNearToFarDeadline: orderFilter }),
    };
    
    return options;
  }, [taskFilter, statusFilter, orderFilter]);

  // React Query will automatically refetch when query key changes (filters/pagination)
  const { data: todoData, isLoading: todoLoading } = useStudentCheckpoints(
    studentProfileId,
    todoPage,
    todoPageSize,
    !!studentProfileId,
    filterOptions
  ) as { data: { items: Array<{ id: number; title: string; isCompleted: boolean; deadline: string }>; totalCount: number; pageNumber: number; pageSize: number } | undefined; isLoading: boolean };

  const { data: joinedSubjects, isLoading: joinedLoading } = useStudentJoinedSubjects(studentProfileId, !!studentProfileId);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await GetCurrentStudentUser(Number(id));
        setDetail(res);
      } catch (e) {
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Reset pagination when filters change - React Query will handle the refetch automatically
  useEffect(() => {
    setTodoPage(1);
  }, [taskFilter, statusFilter, orderFilter]);

  const statusTag = (status?: number) => {
    if (status === 0) return <Badge status="success" text="Active" />;
    if (status === 1) return <Badge status="error" text="Inactive" />;
    return <Badge status="default" text="Unknown" />;
  };

  // Filter change handlers - React Query will automatically refetch with new query key
  const handleTaskFilterChange = (value: boolean | undefined) => {
    setTaskFilter(value);
  };

  const handleStatusFilterChange = (value: boolean | undefined) => {
    setStatusFilter(value);
  };

  const handleOrderFilterChange = (value: boolean | undefined) => {
    setOrderFilter(value);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        background: '#fafafa'
      }}>
        <Card style={{ textAlign: 'center', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>Loading student details...</div>
        </Card>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <div style={{ 
        padding: '24px', 
        background: '#fafafa',
        minHeight: '100vh'
      }}>
        {/* Back Button */}
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBackClick}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              color: '#666',
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #d9d9d9'
            }}
          >
            Back
          </Button>
        </div>

        {/* Header Section */}
        <Card 
          style={{ 
            marginBottom: 24, 
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={6} md={4} style={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar 
                size={80} 
                src={detail?.avatarUrl || 'https://i.pinimg.com/736x/86/af/d1/86afd13a3e5f13435b39c31a407bbaa9.jpg'} 
                icon={<UserOutlined />}
                style={{ border: '2px solid #f0f0f0' }}
              />
            </Col>
            <Col xs={24} sm={18} md={20}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                <Title level={3} style={{ margin: 0, color: '#262626' }}>
                  {detail ? `${detail.firstName ?? ''} ${detail.lastName ?? ''}`.trim() || 'Student' : 'Student'}
                </Title>
                {statusTag(detail?.status)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666' }}>
                  <MailOutlined />
                  <Text style={{ color: '#666' }}>{detail?.email}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666' }}>
                  <CalendarOutlined />
                  <Text style={{ color: '#666' }}>
                    {detail?.dateOfBirth ? new Date(detail.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card 
              style={{ 
                borderRadius: 8, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              <Statistic
                title="User ID"
                value={detail?.id ?? '-'}
                valueStyle={{ color: '#262626' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card 
              style={{ 
                borderRadius: 8, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              <Statistic
                title="Profile ID"
                value={detail?.studentDataDetailResponse?.id ?? '-'}
                valueStyle={{ color: '#262626' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card 
              style={{ 
                borderRadius: 8, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              <Statistic
                title="Bans"
                value={detail?.studentDataDetailResponse?.numberOfBan ?? 0}
                valueStyle={{ color: '#262626' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Academic Information */}
        <Card 
          style={{ 
            marginBottom: 24, 
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOutlined style={{ color: '#1890ff' }} />
              <span>Academic Information</span>
            </div>
          }
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Username" style={{ fontWeight: 500 }}>
                  {detail?.username ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Role" style={{ fontWeight: 500 }}>
                  {detail?.roleName ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Program ID" style={{ fontWeight: 500 }}>
                  {detail?.studentDataDetailResponse?.programId ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Enrolled Date" style={{ fontWeight: 500 }}>
                  {detail?.studentDataDetailResponse?.enrolledAt ? 
                    new Date(detail.studentDataDetailResponse.enrolledAt).toLocaleDateString() : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={12}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Curriculum" style={{ fontWeight: 500 }}>
                  <Tag color="blue">{detail?.studentDataDetailResponse?.curriculumCode || '-'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Career Goal" style={{ fontWeight: 500 }}>
                  <div style={{ 
                    padding: '8px 12px', 
                    background: '#f8f9fa', 
                    borderRadius: 4,
                    border: '1px solid #e9ecef'
                  }}>
                    {detail?.studentDataDetailResponse?.careerGoal || 'Not specified'}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Tabs Section */}
        <Card 
          style={{ 
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: 'subjects',
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOutlined />
                    <span>Subjects ({joinedSubjects?.length || 0})</span>
                  </div>
                ),
                children: (
                  joinedLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
                      <Spin size="large" />
                    </div>
                  ) : (
                    <List
                      dataSource={joinedSubjects || []}
                      locale={{ emptyText: (
                        <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
                          <BookOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                          <div>No subjects found</div>
                        </div>
                      ) }}
                      renderItem={(s: any) => (
                        <List.Item style={{ 
                          padding: '16px', 
                          margin: '8px 0', 
                          borderRadius: 6,
                          border: '1px solid #f0f0f0',
                          background: '#fff'
                        }}>
                          <List.Item.Meta
                            title={
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 600, color: '#262626' }}>
                                  {s.subjectCode} - {s.name}
                                </span>
                              </div>
                            }
                            description={
                              <div style={{ color: '#666', marginTop: 4 }}>
                                <div>Semester: {s.semesterName} • Credits: {s.credits}</div>
                                <div>Version: {s.subjectVersionCode}</div>
                              </div>
                            }
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            {s.isActive ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>}
                            {s.isPassed ? <Tag color="blue">Passed</Tag> : <Tag color="orange">Ongoing</Tag>}
                          </div>
                        </List.Item>
                      )}
                    />
                  )
                )
              },
              {
                key: 'todos',
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ClockCircleOutlined />
                    <span>Todo List ({todoData?.totalCount || 0})</span>
                  </div>
                ),
                children: (
                  <>
                    {/* Filter Controls */}
                    <Card 
                      style={{ 
                        marginBottom: 16, 
                        borderRadius: 6,
                        background: '#fafafa',
                        border: '1px solid #f0f0f0'
                      }}
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div style={{ marginBottom: 8, fontWeight: 600, color: '#262626' }}>
                        Filter Options
                      </div>
                      <Space wrap>
                        <Select
                          placeholder="Task Status"
                          style={{ width: 160 }}
                          allowClear
                          value={taskFilter}
                          onChange={handleTaskFilterChange}
                        >
                          <Option value={true}>Completed Tasks</Option>
                          <Option value={false}>Pending Tasks</Option>
                        </Select>
                        
                        <Select
                          placeholder="Filter Type"
                          style={{ width: 160 }}
                          allowClear
                          value={statusFilter}
                          onChange={handleStatusFilterChange}
                        >
                          <Option value={true}>Show All</Option>
                          <Option value={false}>Filtered View</Option>
                        </Select>
                        
                        <Select
                          placeholder="Sort By Deadline"
                          style={{ width: 160 }}
                          allowClear
                          value={orderFilter}
                          onChange={handleOrderFilterChange}
                        >
                          <Option value={true}>Earliest First</Option>
                          <Option value={false}>Latest First</Option>
                        </Select>
                      </Space>
                    </Card>
                    
                    {todoLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
                        <Spin size="large" />
                      </div>
                    ) : (
                      <>
                        <List
                          dataSource={todoData?.items || []}
                          locale={{ emptyText: (
                            <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
                              <ClockCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                              <div>No todos found</div>
                            </div>
                          ) }}
                          renderItem={(item) => (
                            <List.Item style={{ 
                              padding: '16px', 
                              margin: '8px 0', 
                              borderRadius: 6,
                              border: '1px solid #f0f0f0',
                              background: '#fff'
                            }}>
                              <List.Item.Meta
                                title={
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 600, color: '#262626' }}>{item.title}</span>
                                    {item.isCompleted ? 
                                      <Tag color="green">Completed</Tag> : 
                                      <Tag color="orange">Pending</Tag>
                                    }
                                  </div>
                                }
                                description={
                                  <div style={{ color: '#666', marginTop: 4 }}>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    Deadline: {item.deadline ? new Date(item.deadline).toLocaleString() : 'No deadline'}
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                          <Pagination 
                            current={todoPage} 
                            pageSize={todoPageSize} 
                            total={todoData?.totalCount || 0} 
                            showSizeChanger={false} 
                            onChange={(page) => setTodoPage(page)}
                            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                          />
                        </div>
                      </>
                    )}
                  </>
                )
              }
            ]} 
          />
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default StudentDetail;
