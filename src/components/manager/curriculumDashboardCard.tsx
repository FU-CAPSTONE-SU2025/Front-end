import React from 'react';
import { Row, Col, Typography, Space, Table, Tag, Statistic, ConfigProvider } from 'antd';
import { PieChartOutlined, BookOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import styles from '../../css/manager/studentInCoursePage.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { ICurriculumOverview } from '../../interfaces/IDashboard';

const { Text } = Typography;

interface CurriculumDashboardCardProps {
  data: ICurriculumOverview | null;
  loading: boolean;
}

const CurriculumDashboardCard: React.FC<CurriculumDashboardCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className={`${styles.chartCard} ${glassStyles.appleGlassCard} ${glassStyles.appleGlassCardPulse}`}>
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">Loading curriculum data...</Text>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${styles.chartCard} ${glassStyles.appleGlassCard}`}>
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">No curriculum data available</Text>
        </div>
      </div>
    );
  }

  // Table columns for curricula by program
  const curriculaByProgramColumns = [
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
      title: 'Program Code',
      dataIndex: 'programCode',
      key: 'programCode',
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: 'Program Name',
      dataIndex: 'programName',
      key: 'programName',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Curriculum Count',
      dataIndex: 'curriculumCount',
      key: 'curriculumCount',
      width: 120,
      align: 'center' as const,
      render: (count: number) => (
        <Tag color="blue" style={{ fontWeight: 'bold' }}>
          {count}
        </Tag>
      ),
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
      },
    }}
  >
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${glassStyles.appleGlassCard}`}
      style={{ padding: '24px' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <PieChartOutlined className={styles.pieChartIcon} style={{ fontSize: '20px' }} />
          <Text strong style={{ fontSize: '18px' }}>Curriculum Statistics</Text>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Curriculum Distribution Chart */}
        <Col xs={24} lg={12}>
          <div className={`${glassStyles.appleGlassCard}`} style={{ padding: '20px', height: '280px' }}>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.curriculaByProgram?.map(program => ({
                      name: program.programName,
                      value: program.curriculumCount,
                    })) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.curriculaByProgram?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* Curriculum Stats */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong>Curriculum Overview</Text>
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <div className={glassStyles.appleGlassCard} style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <Statistic
                      title="Total Programs"
                      value={data.curriculaByProgram?.length || 0}
                      prefix={<BookOutlined style={{ color: '#52c41a' }} />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className={glassStyles.appleGlassCard} style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <Statistic
                      title="Avg Subjects per Curriculum"
                      value={data.averageSubjects?.average || 0}
                      prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Space>
        </Col>

        {/* Top Curricula Table */}
        <Col span={24}>
          <div style={{ marginTop: 16 }}>
            <Space style={{ marginBottom: 16 }}>
              <Text strong>Curricula by Program</Text>
            </Space>
            <Table
              columns={curriculaByProgramColumns}
              dataSource={data.curriculaByProgram?.map((curriculum, index) => ({
                ...curriculum,
                rank: index + 1,
                key: curriculum.programCode || index
              })) || []}
              pagination={false}
              size="small"
              scroll={{ x: 500 }}
            />
          </div>
        </Col>
      </Row>
    </motion.div>
    </ConfigProvider>
  );
};

export default CurriculumDashboardCard;
