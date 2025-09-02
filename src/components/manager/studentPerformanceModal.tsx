import React from 'react';
import { Modal, Typography, Row, Col, Card, Spin, Alert, Statistic, Progress, Divider, Tag, Space } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { TrophyOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined, StarOutlined, BarChartOutlined } from '@ant-design/icons';
import { IStudentSubjectActivityOverview, IStudentPerformanceOverview } from '../../interfaces/IDashboard';

const { Title, Text } = Typography;

interface StudentPerformanceModalProps {
  visible: boolean;
  onClose: () => void;
  studentName: string;
  subjectData: IStudentSubjectActivityOverview[] | null;
  performanceData: IStudentPerformanceOverview[] | null;
  loading: boolean;
  error: string | null;
}

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];
const SUCCESS_COLOR = '#52c41a';
const WARNING_COLOR = '#faad14';
const ERROR_COLOR = '#f5222d';
const PRIMARY_COLOR = '#1890ff';

const StudentPerformanceModal: React.FC<StudentPerformanceModalProps> = ({
  visible,
  onClose,
  studentName,
  subjectData,
  performanceData,
  loading,
  error
}) => {
  if (loading) {
    return (
      <Modal
        open={visible}
        onCancel={onClose}
        title={`📊 Academic Performance Dashboard`}
        width="95%"
        style={{ top: 20 }}
        footer={null}
      >
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 24, fontSize: '16px', color: '#666' }}>
            Loading {studentName}'s academic performance data...
          </div>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        open={visible}
        onCancel={onClose}
        title={`📊 Academic Performance Dashboard`}
        width="95%"
        style={{ top: 20 }}
        footer={null}
      >
        <Alert
          message="Unable to Load Performance Data"
          description={`We encountered an issue while loading ${studentName}'s academic performance: ${error}`}
          type="error"
          showIcon
          style={{ margin: '40px 0' }}
        />
      </Modal>
    );
  }

  // Calculate summary statistics with null safety
  const totalSemesters = subjectData?.length || 0;
  const totalSubjectsAttempted = subjectData?.reduce((sum, item) => sum + (item?.subjectsAttempted || 0), 0) || 0;
  const totalSubjectsPassed = subjectData?.reduce((sum, item) => sum + (item?.subjectsPassed || 0), 0) || 0;
  const totalCreditsAttempted = subjectData?.reduce((sum, item) => sum + (item?.creditsAttempted || 0), 0) || 0;
  const totalCreditsEarned = subjectData?.reduce((sum, item) => sum + (item?.creditsEarned || 0), 0) || 0;
  const overallAverage = subjectData?.reduce((sum, item) => sum + (item?.averageFinalScore || 0), 0) / (totalSemesters || 1) || 0;
  const passRate = totalSubjectsAttempted > 0 ? (totalSubjectsPassed / totalSubjectsAttempted) * 100 : 0;
  const creditEfficiency = totalCreditsAttempted > 0 ? (totalCreditsEarned / totalCreditsAttempted) * 100 : 0;

  // Prepare chart data with null safety
  const semesterProgressData = subjectData?.map(item => ({
    ...item,
    semesterName: item?.semesterName || 'Unknown Semester',
    averageFinalScore: item?.averageFinalScore || 0,
    subjectsAttempted: item?.subjectsAttempted || 0,
    subjectsPassed: item?.subjectsPassed || 0,
    creditsAttempted: item?.creditsAttempted || 0,
    creditsEarned: item?.creditsEarned || 0,
    passRate: (item?.subjectsAttempted || 0) > 0 ? ((item?.subjectsPassed || 0) / (item?.subjectsAttempted || 0)) * 100 : 0,
    creditEfficiency: (item?.creditsAttempted || 0) > 0 ? ((item?.creditsEarned || 0) / (item?.creditsAttempted || 0)) * 100 : 0
  })) || [];

  const performanceByCategory = performanceData?.map(item => ({
    ...item,
    name: item?.category || 'Unknown Category',
    score: item?.averageScore || 0,
    weight: item?.totalWeight || 0
  })) || [];

  // Debug: Log the chart data
  console.log('Semester Progress Data:', semesterProgressData);
  console.log('Performance by Category Data:', performanceByCategory);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '12px',
            color: 'white',
            fontSize: '20px'
          }}>
            📊
          </div>
          <div>
            <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
              Academic Performance Dashboard
            </Title>
            <Text style={{ fontSize: '16px', color: '#6b7280' }}>
              {studentName}
            </Text>
          </div>
        </div>
      }
      width="98%"
      style={{ top: 10 }}
      footer={null}
      className="student-performance-modal"
    >
      <div style={{ padding: '0 8px' }}>
        {/* Key Performance Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card 
            style={{ 
              marginBottom: 24,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              border: '1px solid #e5e7eb'
            }}
          >
            <Title level={4} style={{ marginBottom: 20, color: '#374151' }}>
              <TrophyOutlined style={{ color: '#f59e0b', marginRight: 8 }} />
              Academic Overview
            </Title>
            <Row gutter={[24, 16]}>
              <Col xs={12} sm={8} md={6}>
                <Card size="small" style={{ textAlign: 'center', borderRadius: '12px' }}>
                  <Statistic
                    title="Overall GPA"
                    value={overallAverage}
                    precision={2}
                    valueStyle={{ color: overallAverage >= 7.0 ? SUCCESS_COLOR : overallAverage >= 5.0 ? WARNING_COLOR : ERROR_COLOR, fontSize: '28px', fontWeight: 'bold' }}
                    suffix={<Text style={{ fontSize: '14px', color: '#6b7280' }}>/10.0</Text>}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Card size="small" style={{ textAlign: 'center', borderRadius: '12px' }}>
                  <Statistic
                    title="Pass Rate"
                    value={passRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: passRate >= 80 ? SUCCESS_COLOR : passRate >= 60 ? WARNING_COLOR : ERROR_COLOR, fontSize: '28px', fontWeight: 'bold' }}
                  />
                  <Progress 
                    percent={passRate} 
                    size="small" 
                    strokeColor={passRate >= 80 ? SUCCESS_COLOR : passRate >= 60 ? WARNING_COLOR : ERROR_COLOR}
                    showInfo={false}
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Card size="small" style={{ textAlign: 'center', borderRadius: '12px' }}>
                  <Statistic
                    title="Credits Earned"
                    value={totalCreditsEarned}
                    valueStyle={{ color: PRIMARY_COLOR, fontSize: '28px', fontWeight: 'bold' }}
                    suffix={<Text style={{ fontSize: '14px', color: '#6b7280' }}>/{totalCreditsAttempted}</Text>}
                  />
                  <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                    Efficiency: {creditEfficiency.toFixed(1)}%
                  </Text>
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Card size="small" style={{ textAlign: 'center', borderRadius: '12px' }}>
                  <Statistic
                    title="Total Semesters"
                    value={totalSemesters}
                    valueStyle={{ color: '#6366f1', fontSize: '28px', fontWeight: 'bold' }}
                  />
                  <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                    {totalSubjectsPassed} subjects passed
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <Row gutter={[24, 24]}>
          {/* Semester Progress Chart */}
          {subjectData && subjectData.length > 0 && (
            <Col xs={24} lg={14}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card 
                  title={
                    <Space>
                      <BarChartOutlined style={{ color: PRIMARY_COLOR }} />
                      <Text strong>Semester Performance Trend</Text>
                    </Space>
                  }
                  style={{ height: '400px' }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={semesterProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="semesterName" 
                        stroke="#6b7280" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis 
                        yAxisId="gpa"
                        stroke="#6b7280" 
                        fontSize={12}
                        domain={[0, 10]}
                        label={{ value: 'GPA (0-10)', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="rate"
                        orientation="right"
                        stroke="#6b7280" 
                        fontSize={12}
                        domain={[0, 100]}
                        label={{ value: 'Pass Rate (%)', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [
                          typeof value === 'number' ? value.toFixed(2) : value,
                          name
                        ]}
                      />
                      <Line 
                        yAxisId="gpa"
                        type="monotone" 
                        dataKey="averageFinalScore" 
                        stroke={PRIMARY_COLOR}
                        strokeWidth={3}
                        dot={{ fill: PRIMARY_COLOR, strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: PRIMARY_COLOR, strokeWidth: 2 }}
                        name="GPA"
                      />
                      <Line 
                        yAxisId="rate"
                        type="monotone" 
                        dataKey="passRate" 
                        stroke={SUCCESS_COLOR}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: SUCCESS_COLOR, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: SUCCESS_COLOR, strokeWidth: 2 }}
                        name="Pass Rate (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Col>
          )}

          {/* Performance by Category */}
          {performanceData && performanceData.length > 0 && (
            <Col xs={24} lg={10}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card 
                  title={
                    <Space>
                      <StarOutlined style={{ color: WARNING_COLOR }} />
                      <Text strong>Performance by Category</Text>
                    </Space>
                  }
                  style={{ height: '400px' }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={performanceByCategory} 
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        type="number" 
                        stroke="#6b7280" 
                        fontSize={12}
                        domain={[0, 10]}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#6b7280" 
                        fontSize={11} 
                        width={100}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }}
                        formatter={(value, name, props) => {
                          if (name === 'score') {
                            return [
                              `${value.toFixed(2)}/10.0`,
                              'Average Score'
                            ];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(label) => `${label}`}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div style={{
                                backgroundColor: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}>
                                <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>{label}</p>
                                <p style={{ margin: '4px 0', color: PRIMARY_COLOR }}>
                                  Score: <strong>{data.score.toFixed(2)}/10.0</strong>
                                </p>
                                <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                                  Weight: <strong>{data.weight}%</strong>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="score" 
                        radius={[0, 4, 4, 0]}
                        name="Average Score"
                      >
                        {performanceByCategory.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Col>
          )}
        </Row>

        {/* Performance Category Breakdown */}
        {performanceData && performanceData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Card 
              title={
                <Space>
                  <StarOutlined style={{ color: '#8b5cf6' }} />
                  <Text strong>Category Performance Details</Text>
                </Space>
              }
              style={{ marginTop: 24 }}
            >
              <Row gutter={[16, 16]}>
                {performanceData.map((category, index) => {
                  const safeScore = category?.averageScore || 0;
                  const safeWeight = category?.totalWeight || 0;
                  const safeCategoryName = category?.category || 'Unknown Category';
                  
                  // Calculate weighted contribution to overall grade
                  const weightedScore = (safeScore * safeWeight) / 100;
                  
                  return (
                    <Col xs={24} sm={12} lg={8} key={index}>
                      <Card 
                        size="small" 
                        style={{ 
                          borderRadius: '12px',
                          border: `2px solid ${COLORS[index % COLORS.length]}20`,
                          backgroundColor: `${COLORS[index % COLORS.length]}05`
                        }}
                      >
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                          <Title level={5} style={{ margin: 0, color: COLORS[index % COLORS.length] }}>
                            {safeCategoryName}
                          </Title>
                          <Tag color={safeScore >= 7.0 ? 'success' : safeScore >= 5.0 ? 'warning' : 'error'}>
                            Score: {safeScore.toFixed(2)}/10.0
                          </Tag>
                        </div>
                        
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: '12px', color: '#6b7280' }}>Weight:</Text>
                            <Text strong style={{ fontSize: '12px' }}>
                              {safeWeight}%
                            </Text>
                          </div>
                          
                          <Progress 
                            percent={(safeWeight / 100) * 100} 
                            size="small" 
                            strokeColor={COLORS[index % COLORS.length]}
                            format={() => `${safeWeight}%`}
                          />
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: '12px', color: '#6b7280' }}>Contribution:</Text>
                            <Text strong style={{ fontSize: '12px', color: COLORS[index % COLORS.length] }}>
                              {weightedScore.toFixed(2)} pts
                            </Text>
                          </div>
                          
                          <Progress 
                            percent={(safeScore / 10) * 100} 
                            size="small" 
                            strokeColor={safeScore >= 7.0 ? SUCCESS_COLOR : safeScore >= 5.0 ? WARNING_COLOR : ERROR_COLOR}
                            format={() => `${safeScore.toFixed(1)}/10`}
                          />
                        </Space>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </motion.div>
        )}

        {/* Detailed Semester Breakdown */}
        {subjectData && subjectData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card 
              title={
                <Space>
                  <BookOutlined style={{ color: '#8b5cf6' }} />
                  <Text strong>Detailed Semester Breakdown</Text>
                </Space>
              }
              style={{ marginTop: 24 }}
            >
              <Row gutter={[16, 16]}>
                {subjectData.map((semester, index) => {
                  // Null safety for semester data
                  const safeAvgScore = semester?.averageFinalScore || 0;
                  const safeSubjectsAttempted = semester?.subjectsAttempted || 0;
                  const safeSubjectsPassed = semester?.subjectsPassed || 0;
                  const safeCreditsAttempted = semester?.creditsAttempted || 0;
                  const safeCreditsEarned = semester?.creditsEarned || 0;
                  const safeSemesterName = semester?.semesterName || 'Unknown Semester';
                  const safeSemesterId = semester?.semesterId || index;
                  
                  const semesterPassRate = safeSubjectsAttempted > 0 ? (safeSubjectsPassed / safeSubjectsAttempted) * 100 : 0;
                  const semesterCreditEfficiency = safeCreditsAttempted > 0 ? (safeCreditsEarned / safeCreditsAttempted) * 100 : 0;
                  
                  return (
                    <Col xs={24} sm={12} lg={8} key={safeSemesterId}>
                      <Card 
                        size="small" 
                        style={{ 
                          borderRadius: '12px',
                          border: `2px solid ${COLORS[index % COLORS.length]}20`,
                          backgroundColor: `${COLORS[index % COLORS.length]}05`
                        }}
                      >
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                          <Title level={5} style={{ margin: 0, color: COLORS[index % COLORS.length] }}>
                            {safeSemesterName}
                          </Title>
                          <Tag color={safeAvgScore >= 7.0 ? 'success' : safeAvgScore >= 5.0 ? 'warning' : 'error'}>
                            GPA: {safeAvgScore.toFixed(2)}/10.0
                          </Tag>
                        </div>
                        
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: '12px', color: '#6b7280' }}>Subjects:</Text>
                            <Text strong style={{ fontSize: '12px' }}>
                              {safeSubjectsPassed}/{safeSubjectsAttempted}
                            </Text>
                          </div>
                          
                          <Progress 
                            percent={semesterPassRate} 
                            size="small" 
                            strokeColor={semesterPassRate >= 80 ? SUCCESS_COLOR : semesterPassRate >= 60 ? WARNING_COLOR : ERROR_COLOR}
                            format={() => `${semesterPassRate.toFixed(0)}%`}
                          />
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: '12px', color: '#6b7280' }}>Credits:</Text>
                            <Text strong style={{ fontSize: '12px' }}>
                              {safeCreditsEarned}/{safeCreditsAttempted}
                            </Text>
                          </div>
                          
                          <Progress 
                            percent={semesterCreditEfficiency} 
                            size="small" 
                            strokeColor={PRIMARY_COLOR}
                            format={() => `${semesterCreditEfficiency.toFixed(0)}%`}
                          />
                        </Space>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </motion.div>
        )}

        {/* No Data Message */}
        {(!subjectData || subjectData.length === 0) && (!performanceData || performanceData.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: 16 }}>📚</div>
              <Title level={4} style={{ color: '#6b7280', marginBottom: 8 }}>
                No Academic Data Available
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                {studentName} doesn't have any recorded academic performance data yet.
              </Text>
            </Card>
          </motion.div>
        )}
      </div>
    </Modal>
  );
};

export default StudentPerformanceModal;