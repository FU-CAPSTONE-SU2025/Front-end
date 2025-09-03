import React from 'react';
import { Card, Row, Col, Typography, Space, Table, Tag, Statistic } from 'antd';
import { LineChartOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../../css/manager/studentInCoursePage.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { ISubjectOverView } from '../../interfaces/IDashboard';

const { Text, Title } = Typography;

interface SubjectDashboardCardProps {
  data: ISubjectOverView | null;
  loading: boolean;
}

const SubjectDashboardCard: React.FC<SubjectDashboardCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className={`${styles.chartCard} ${glassStyles.appleGlassCard} ${glassStyles.appleGlassCardPulse}`}>
        <div style={{ height: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#0F172A' }}>Loading subject data...</Text>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${styles.chartCard} ${glassStyles.appleGlassCard}`}>
        <div style={{ height: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#0F172A' }}>No subject data available</Text>
        </div>
      </div>
    );
  }

  // Table columns for top subjects
  const topSubjectsColumns = [
    {
      title: '#',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <Tag color={rank <= 3 ? '#dc2626' : '#1E40AF'} style={{ fontWeight: 'bold' }}>
          {rank}
        </Tag>
      ),
    },
    {
      title: 'Subject Code',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      render: (text: string) => <Text code style={{ color: '#0F172A' }}>{text}</Text>,
    },
    {
      title: 'Subject Name',
      dataIndex: 'subjectName',
      key: 'subjectName',
      render: (text: string) => <Text strong style={{ color: '#0F172A' }}>{text}</Text>,
    },
    {
      title: 'Versions',
      dataIndex: 'versionCount',
      key: 'versionCount',
      width: 100,
      align: 'center' as const,
      render: (versions: number) => (
        <Tag color="green" style={{ fontWeight: 'bold' }}>
          {versions}
        </Tag>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${glassStyles.appleGlassCard} ${glassStyles.appleGlassCardShimmer}`}
      style={{ padding: '24px' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <LineChartOutlined className={styles.lineChartIcon} style={{ fontSize: '20px' }} />
          <Text strong style={{ fontSize: '18px', color: '#0F172A' }}>Subject Statistics</Text>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Credit Distribution Chart */}
        <Col xs={24} lg={12}>
          <div className={`${glassStyles.appleGlassCard} ${glassStyles.appleGlassCardFloating}`} style={{ padding: '20px', height: '280px' }}>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  {
                    name: '1-2 Credits',
                    count: data.creditDistribution?.oneToTwoCredits || 0,
                  },
                  {
                    name: '3-4 Credits',
                    count: data.creditDistribution?.threeToFourCredits || 0,
                  },
                  {
                    name: '5+ Credits',
                    count: data.creditDistribution?.fivePlusCredits || 0,
                  }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.08)" />
                  <XAxis dataKey="name" tick={{ fill: '#0F172A', fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fill: '#1E293B', fontSize: 11, fontWeight: 500 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255,255,255,0.98)', 
                      border: '1px solid rgba(0,0,0,0.06)', 
                      borderRadius: 8, 
                      boxShadow: '0 6px 20px rgba(0,0,0,0.08)' 
                    }} 
                    labelStyle={{ color: '#0F172A', fontWeight: 600 }} 
                    itemStyle={{ color: '#0F172A' }} 
                  />
                  <Legend wrapperStyle={{ color: '#0F172A' }} />
                  <Bar dataKey="count" fill="#1E40AF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* Syllabus Availability Stats */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ color: '#0F172A' }}>Syllabus Availability</Text>
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: '#0F172A', fontWeight: 600 }}>With Syllabus</span>}
                    value={data.syllabusAvailability?.subjectsWithSyllabus || 0}
                    prefix={<BookOutlined style={{ color: '#059669' }} />}
                    valueStyle={{ color: '#059669', fontWeight: 700, fontSize: '20px' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: '#0F172A', fontWeight: 600 }}>Without Syllabus</span>}
                    value={data.syllabusAvailability?.subjectsWithoutSyllabus || 0}
                    prefix={<BookOutlined style={{ color: '#d97706' }} />}
                    valueStyle={{ color: '#d97706', fontWeight: 700, fontSize: '20px' }}
                  />
                </Col>
              </Row>
            </div>
          </Space>
        </Col>

        {/* Top Subjects Table */}
        <Col span={24}>
          <div style={{ marginTop: 16 }}>
            <Space style={{ marginBottom: 16 }}>
              <Text strong style={{ color: '#0F172A' }}>Subjects with Most Versions</Text>
            </Space>
            <Table
              columns={topSubjectsColumns}
              dataSource={data.topSubjectsWithMostVersions?.map((subject, index) => ({
                ...subject,
                rank: index + 1,
                key: subject.subjectCode || index
              })) || []}
              pagination={false}
              size="small"
              scroll={{ x: 400 }}
            />
          </div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default SubjectDashboardCard;
