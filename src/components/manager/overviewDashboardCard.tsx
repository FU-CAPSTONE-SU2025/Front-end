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
          <Text style={{ color: '#0F172A' }}>Loading overview data...</Text>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={styles.chartCard}>
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#0F172A' }}>No overview data available</Text>
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
            <Text strong style={{ color: '#0F172A' }}>Overview Dashboard</Text>
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
                  background: 'rgba(255, 255, 255, 0.35)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)'
                }}>
                  <Statistic
                    title={<span style={{ color: '#0F172A', fontWeight: 600 }}>Total Subjects in Database</span>}
                    value={data.summary?.totalSubjects || 0}
                    prefix={<CheckCircleOutlined style={{ color: '#059669' }} />}
                    valueStyle={{ color: '#059669', fontWeight: 700, fontSize: '24px' }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className={glassStyles.appleGlassCard} style={{ 
                  padding: '16px', 
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.35)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)'
                }}>
                  <Statistic
                    title={<span style={{ color: '#0F172A', fontWeight: 600 }}>Total Curricula</span>}
                    value={data.approvalDistribution?.curricula.total || 0}
                    prefix={<CheckCircleOutlined style={{ color: '#1E40AF' }} />}
                    valueStyle={{ color: '#1E40AF', fontWeight: 700, fontSize: '24px' }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className={glassStyles.appleGlassCard} style={{ 
                  padding: '16px', 
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.35)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)'
                }}>
                  <Statistic
                    title={<span style={{ color: '#0F172A', fontWeight: 600 }}>Active Subject Versions</span>}
                    value={data.summary?.activeSubjectVersions || 0}
                    prefix={<CheckCircleOutlined style={{ color: '#0891b2' }} />}
                    valueStyle={{ color: '#0891b2', fontWeight: 700, fontSize: '24px' }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className={glassStyles.appleGlassCard} style={{ 
                  padding: '16px', 
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.35)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)'
                }}>
                  <Statistic
                    title={<span style={{ color: '#0F172A', fontWeight: 600 }}>Total Syllabi</span>}
                    value={data.approvalDistribution.syllabi.total || 0}
                    prefix={<CheckCircleOutlined style={{ color: '#7c3aed' }} />}
                    valueStyle={{ color: '#7c3aed', fontWeight: 700, fontSize: '24px' }}
                  />
                </div>
              </Col>
            </Row>

            {/* Approval Status by Category */}
            <div className={glassStyles.appleGlassCard} style={{ 
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(30px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)'
            }}>
              <Text strong style={{ fontSize: '16px', marginBottom: '16px', display: 'block', color: '#0F172A' }}>Approval Status by Category</Text>
              
              {/* Subjects Approval */}
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#1E40AF', fontSize: '14px' }}>📚 Subjects</Text>
                <Row gutter={[4, 8]} style={{ marginTop: '8px' }}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{data.approvalDistribution?.subjects?.approved || 0}</div>
                      <div style={{ fontSize: '14px', color: '#059669', fontWeight: 600 }}>Approved</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{data.approvalDistribution?.subjects?.pending || 0}</div>
                      <div style={{ fontSize: '14px', color: '#d97706', fontWeight: 600 }}>Pending</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{data.approvalDistribution?.subjects?.rejected || 0}</div>
                      <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: 600 }}>Rejected</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Curricula Approval */}
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#7c3aed', fontSize: '14px' }}>🎓 Curricula</Text>
                <Row gutter={[4, 8]} style={{ marginTop: '8px' }}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{data.approvalDistribution?.curricula?.approved || 0}</div>
                      <div style={{ fontSize: '14px', color: '#059669', fontWeight: 600 }}>Approved</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{data.approvalDistribution?.curricula?.pending || 0}</div>
                      <div style={{ fontSize: '14px', color: '#d97706', fontWeight: 600 }}>Pending</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{data.approvalDistribution?.curricula?.rejected || 0}</div>
                      <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: 600 }}>Rejected</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Syllabi Approval */}
              <div>
                <Text strong style={{ color: '#0891b2', fontSize: '14px' }}>📖 Syllabi</Text>
                <Row gutter={[4, 8]} style={{ marginTop: '8px' }}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{data.approvalDistribution?.syllabi?.approved || 0}</div>
                      <div style={{ fontSize: '14px', color: '#059669', fontWeight: 600 }}>Approved</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{data.approvalDistribution?.syllabi?.pending || 0}</div>
                      <div style={{ fontSize: '14px', color: '#d97706', fontWeight: 600 }}>Pending</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{data.approvalDistribution?.syllabi?.rejected || 0}</div>
                      <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: 600 }}>Rejected</div>
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
              background: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(30px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <Text strong style={{ color: '#0F172A' }}>Approval Distribution Overview</Text>
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
                  <PolarGrid stroke="rgba(0, 0, 0, 0.15)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#0F172A', fontSize: 14, fontWeight: 600 }} />
                  <PolarRadiusAxis tick={{ fill: '#1E293B', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Radar
                    name="Pending"
                    dataKey="pending"
                    stroke="#d97706"
                    strokeWidth={2.5}
                    fill="#d97706"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Approved"
                    dataKey="approved"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fill="#059669"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Rejected"
                    dataKey="rejected"
                    stroke="#dc2626"
                    strokeWidth={2.5}
                    fill="#dc2626"
                    fillOpacity={0.5}
                  />
                  <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }} labelStyle={{ color: '#0F172A', fontWeight: 600 }} itemStyle={{ color: '#0F172A' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#0F172A' }} />
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
