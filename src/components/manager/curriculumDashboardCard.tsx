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
          <Text style={{ color: '#0F172A' }}>Loading curriculum data...</Text>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${styles.chartCard} ${glassStyles.appleGlassCard}`}>
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#0F172A' }}>No curriculum data available</Text>
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
        <Tag color={rank <= 3 ? '#dc2626' : '#1E40AF'} style={{ fontWeight: 'bold' }}>
          {rank}
        </Tag>
      ),
    },
    {
      title: 'Program Code',
      dataIndex: 'programCode',
      key: 'programCode',
      render: (text: string) => <Text code style={{ color: '#0F172A' }}>{text}</Text>,
    },
    {
      title: 'Program Name',
      dataIndex: 'programName',
      key: 'programName',
      render: (text: string) => <Text strong style={{ color: '#0F172A' }}>{text}</Text>,
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
          colorText: '#0F172A',
          colorBgContainer: 'rgba(255,255,255,0.98)',
          colorBgElevated: 'rgba(255,255,255,0.98)',
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
          <Text strong style={{ fontSize: '18px', color: '#0F172A' }}>Curriculum Statistics</Text>
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
                      <Cell key={`cell-${index}`} fill={['#1E40AF', '#059669', '#d97706', '#dc2626', '#7c3aed'][index % 5]} />
                    ))}
                  </Pie>
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* Curriculum Stats */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ color: '#0F172A' }}>Curriculum Overview</Text>
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <div className={glassStyles.appleGlassCard} style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <Statistic
                      title={<span style={{ color: '#0F172A', fontWeight: 600 }}>Total Programs</span>}
                      value={data.curriculaByProgram?.length || 0}
                      prefix={<BookOutlined style={{ color: '#059669' }} />}
                      valueStyle={{ color: '#059669', fontWeight: 700, fontSize: '20px' }}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className={glassStyles.appleGlassCard} style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <Statistic
                      title={<span style={{ color: '#0F172A', fontWeight: 600 }}>Avg Subjects per Curriculum</span>}
                      value={data.averageSubjects?.average || 0}
                      prefix={<BookOutlined style={{ color: '#1E40AF' }} />}
                      valueStyle={{ color: '#1E40AF', fontWeight: 700, fontSize: '20px' }}
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
              <Text strong style={{ color: '#0F172A' }}>Curricula by Program</Text>
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
