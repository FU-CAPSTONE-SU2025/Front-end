import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';
import { BarChartOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import styles from '../../css/manager/studentInCoursePage.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { IOverviewDashboard } from '../../interfaces/IDashboard';

const { Text, Title } = Typography;

interface OverviewDashboardCardProps {
  data: IOverviewDashboard | null;
  loading: boolean;
}

const OverviewDashboardCard: React.FC<OverviewDashboardCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card className={styles.chartCard}>
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">Loading overview data...</Text>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={styles.chartCard}>
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">No overview data available</Text>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        title={
          <Space>
            <BarChartOutlined className={styles.barChartIcon} />
            <Text strong>Overview Dashboard</Text>
          </Space>
        }
        className={styles.chartCard}
        style={{marginTop:"75px"}}
      >
        <Row gutter={[24, 24]}>
          {/* Left Side: Quick Stats + Approval Status by Category */}
          <Col xs={24} md={12}>
            {/* Quick Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <div className={glassStyles.appleGlassCard} style={{ 
                  padding: '16px', 
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)'
                }}>
                  <Statistic
                    title="Total Subjects in Database"
                    value={data.summary?.totalSubjects || 0}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className={glassStyles.appleGlassCard} style={{ 
                  padding: '16px', 
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)'
                }}>
                  <Statistic
                    title="Total Curricula"
                    value={data.approvalDistribution?.curricula.total || 0}
                    prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className={glassStyles.appleGlassCard} style={{ 
                  padding: '16px', 
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)'
                }}>
                  <Statistic
                    title="Active Subject Versions"
                    value={data.summary?.activeSubjectVersions || 0}
                    prefix={<CheckCircleOutlined style={{ color: '#13c2c2' }} />}
                    valueStyle={{ color: '#13c2c2' }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className={glassStyles.appleGlassCard} style={{ 
                  padding: '16px', 
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)'
                }}>
                  <Statistic
                    title="Total Syllabi"
                    value={data.approvalDistribution.syllabi.total || 0}
                    prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </div>
              </Col>
            </Row>

            {/* Approval Status by Category */}
            <div className={glassStyles.appleGlassCard} style={{ 
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(30px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)'
            }}>
              <Text strong style={{ fontSize: '16px', marginBottom: '16px', display: 'block', color: '#1f2937' }}>Approval Status by Category</Text>
              
              {/* Subjects Approval */}
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>📚 Subjects</Text>
                <Row gutter={[4, 8]} style={{ marginTop: '8px' }}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{data.approvalDistribution?.subjects?.approved || 0}</div>
                      <div style={{ fontSize: '14px', color: '#52c41a' }}>Approved</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>{data.approvalDistribution?.subjects?.pending || 0}</div>
                      <div style={{ fontSize: '14px', color: '#faad14' }}>Pending</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>{data.approvalDistribution?.subjects?.rejected || 0}</div>
                      <div style={{ fontSize: '14px', color: '#ff4d4f' }}>Rejected</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Curricula Approval */}
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#722ed1', fontSize: '14px' }}>🎓 Curricula</Text>
                <Row gutter={[4, 8]} style={{ marginTop: '8px' }}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{data.approvalDistribution?.curricula?.approved || 0}</div>
                      <div style={{ fontSize: '14px', color: '#52c41a' }}>Approved</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>{data.approvalDistribution?.curricula?.pending || 0}</div>
                      <div style={{ fontSize: '14px', color: '#faad14' }}>Pending</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>{data.approvalDistribution?.curricula?.rejected || 0}</div>
                      <div style={{ fontSize: '14px', color: '#ff4d4f' }}>Rejected</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Syllabi Approval */}
              <div>
                <Text strong style={{ color: '#13c2c2', fontSize: '14px' }}>📖 Syllabi</Text>
                <Row gutter={[4, 8]} style={{ marginTop: '8px' }}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{data.approvalDistribution?.syllabi?.approved || 0}</div>
                      <div style={{ fontSize: '14px', color: '#52c41a' }}>Approved</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>{data.approvalDistribution?.syllabi?.pending || 0}</div>
                      <div style={{ fontSize: '14px', color: '#faad14' }}>Pending</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>{data.approvalDistribution?.syllabi?.rejected || 0}</div>
                      <div style={{ fontSize: '14px', color: '#ff4d4f' }}>Rejected</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
          
          {/* Right Side: Radar Chart */}
          <Col xs={24} md={12}>
            <div className={glassStyles.appleGlassCard} style={{ 
              padding: '20px', 
              height: '400px',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(30px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <Text strong style={{ color: '#1f2937' }}>Approval Distribution Overview</Text>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  {
                    name: 'Subjects',
                    pending: data.approvalDistribution?.subjects?.pending || 0,
                    approved: data.approvalDistribution?.subjects?.approved || 0,
                    rejected: data.approvalDistribution?.subjects?.rejected || 0,
                  },
                  {
                    name: 'Curricula',
                    pending: data.approvalDistribution?.curricula?.pending || 0,
                    approved: data.approvalDistribution?.curricula?.approved || 0,
                    rejected: data.approvalDistribution?.curricula?.rejected || 0,
                  },
                  {
                    name: 'Syllabi',
                    pending: data.approvalDistribution?.syllabi?.pending || 0,
                    approved: data.approvalDistribution?.syllabi?.approved || 0,
                    rejected: data.approvalDistribution?.syllabi?.rejected || 0,
                  }
                ]}>
                  <PolarGrid stroke="rgba(0, 0, 0, 0.18)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#374151', fontSize: 14 }} />
                  <PolarRadiusAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Radar
                    name="Pending"
                    dataKey="pending"
                    stroke="#d48806"
                    strokeWidth={2.5}
                    fill="#d48806"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Approved"
                    dataKey="approved"
                    stroke="#237804"
                    strokeWidth={2.5}
                    fill="#237804"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Rejected"
                    dataKey="rejected"
                    stroke="#cf1322"
                    strokeWidth={2.5}
                    fill="#cf1322"
                    fillOpacity={0.5}
                  />
                  <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }} labelStyle={{ color: '#111827', fontWeight: 600 }} itemStyle={{ color: '#111827' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#111827' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
};

export default OverviewDashboardCard;
