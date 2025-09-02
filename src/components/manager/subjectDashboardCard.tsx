import React from 'react';
import { Card, Row, Col, Typography, Space, Table, Tag, Statistic } from 'antd';
import { LineChartOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../../css/manager/studentInCoursePage.module.css';
import { ISubjectOverView } from '../../interfaces/IDashboard';

const { Text, Title } = Typography;

interface SubjectDashboardCardProps {
  data: ISubjectOverView | null;
  loading: boolean;
}

const SubjectDashboardCard: React.FC<SubjectDashboardCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card className={styles.chartCard}>
        <div style={{ height: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">Loading subject data...</Text>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={styles.chartCard}>
        <div style={{ height: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">No subject data available</Text>
        </div>
      </Card>
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
        <Tag color={rank <= 3 ? '#f50' : '#108ee9'} style={{ fontWeight: 'bold' }}>
          {rank}
        </Tag>
      ),
    },
    {
      title: 'Subject Code',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: 'Subject Name',
      dataIndex: 'subjectName',
      key: 'subjectName',
      render: (text: string) => <Text strong>{text}</Text>,
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
    >
      <Card
        title={
          <Space>
            <LineChartOutlined className={styles.lineChartIcon} />
            <Text strong>Subject Statistics</Text>
          </Space>
        }
        className={styles.chartCard}
      >
        <Row gutter={[24, 24]}>
          {/* Credit Distribution Chart */}
          <Col xs={24} lg={12}>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Col>

          {/* Syllabus Availability Stats */}
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong>Syllabus Availability</Text>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Statistic
                      title="With Syllabus"
                      value={data.syllabusAvailability?.subjectsWithSyllabus || 0}
                      prefix={<BookOutlined style={{ color: '#52c41a' }} />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Without Syllabus"
                      value={data.syllabusAvailability?.subjectsWithoutSyllabus || 0}
                      prefix={<BookOutlined style={{ color: '#faad14' }} />}
                      valueStyle={{ color: '#faad14' }}
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
                <Text strong>Subjects with Most Versions</Text>
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
      </Card>
    </motion.div>
  );
};

export default SubjectDashboardCard;
