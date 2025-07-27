import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Typography, Space, Table, Tag, Input } from 'antd';
import { BarChartOutlined, LineChartOutlined, PieChartOutlined, BookOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import styles from '../../css/manager/managerSyllabus.module.css';
import { 
  ComboComparisonChart, 
  CurriculumDistributionChart, 
  SemesterDistributionChart 
} from '../../components/manager/studentMonitoringCharts';
import { 
  getFilteredComboData, 
  getFilteredCurriculumData, 
  getFilteredSemesterData,
  getFilteredDetailedEnrollmentData,
  DetailedStudentEnrollment,
  ComboComparisonData,
  CurriculumData,
  SemesterData
} from '../../data/mockStudentMonitoring';

const { Text, Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const StudentInCoursePage: React.FC = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('Spring 2025');
  const [selectedCombo, setSelectedCombo] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [comboComparisonData, setComboComparisonData] = useState<ComboComparisonData[]>([]);
  const [curriculumData, setCurriculumData] = useState<CurriculumData[]>([]);
  const [semesterData, setSemesterData] = useState<SemesterData[]>([]);
  const [detailedEnrollmentData, setDetailedEnrollmentData] = useState<DetailedStudentEnrollment[]>([]);
  const [filteredEnrollmentData, setFilteredEnrollmentData] = useState<DetailedStudentEnrollment[]>([]);

  const generateTimeRangeOptions = (): string[] => {
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    const years = ['2023', '2024', '2025'];
    const options: string[] = [];
    
    years.forEach(year => {
      seasons.forEach(season => {
        options.push(`${season} ${year}`);
      });
    });
    
    return options;
  };

  const generateSemesterOptions = (): Array<{ value: string; label: string }> => {
    const options: Array<{ value: string; label: string }> = [
      { value: 'all', label: 'All Semesters' }
    ];
    
    for (let i = 1; i <= 9; i++) {
      options.push({ value: i.toString(), label: `Semester ${i}` });
    }
    
    return options;
  };

  const generateComboOptions = (): Array<{ value: string; label: string }> => {
    const options: Array<{ value: string; label: string }> = [
      { value: 'all', label: 'All Combos' }
    ];
    
    const combos = ['Web Development', 'Mobile Development', 'AI & Machine Learning', 'Cybersecurity', 'Data Science'];
    combos.forEach(combo => {
      options.push({ value: combo, label: combo });
    });
    
    return options;
  };

  const loadChartData = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setComboComparisonData(getFilteredComboData(selectedCurriculum, selectedSemester, selectedTimeRange));
      setCurriculumData(getFilteredCurriculumData(selectedCurriculum, selectedSemester, selectedTimeRange));
      setSemesterData(getFilteredSemesterData(selectedCurriculum, selectedSemester, selectedTimeRange));
      setDetailedEnrollmentData(getFilteredDetailedEnrollmentData(selectedCurriculum, selectedSemester, selectedTimeRange));
      setLoading(false);
    }, 500);
  };

  // Filter enrollment data based on search text and combo filter
  useEffect(() => {
    let filtered = [...detailedEnrollmentData];
    
    // Filter by combo
    if (selectedCombo !== 'all') {
      filtered = filtered.filter(student => student.combo === selectedCombo);
    }
    
    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(student => 
        student.studentName.toLowerCase().includes(searchLower) ||
        student.studentId.toLowerCase().includes(searchLower) ||
        student.curriculum.toLowerCase().includes(searchLower) ||
        student.combo.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredEnrollmentData(filtered);
  }, [detailedEnrollmentData, selectedCombo, searchText]);

  useEffect(() => {
    loadChartData();
  }, [selectedCurriculum, selectedSemester, selectedTimeRange]);

  const handleCurriculumChange = (value: string) => {
    setSelectedCurriculum(value);
  };

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
  };

  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value);
  };

  const handleComboChange = (value: string) => {
    setSelectedCombo(value);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Table columns for detailed enrollment data
  const enrollmentColumns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 140,
      render: (text: string) => <Text code style={{ fontSize: '12px' }}>{text}</Text>,
    },
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 180,
      render: (text: string) => (
        <Space size="small">
          <UserOutlined style={{ color: '#1E40AF', fontSize: '14px' }} />
          <Text strong style={{ fontSize: '13px' }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Curriculum',
      dataIndex: 'curriculum',
      key: 'curriculum',
      width: 140,
      render: (text: string) => (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Combo',
      dataIndex: 'combo',
      key: 'combo',
      width: 160,
      render: (text: string) => (
        <Tag color="orange" style={{ fontWeight: 500 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      width: 100,
      align: 'center' as const,
      render: (semester: number) => (
        <Tag color="green" style={{ fontWeight: 600 }}>
          {semester}
        </Tag>
      ),
    },
    {
      title: 'Enrollment Date',
      dataIndex: 'enrollmentDate',
      key: 'enrollmentDate',
      width: 130,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'GPA',
      dataIndex: 'gpa',
      key: 'gpa',
      width: 80,
      align: 'center' as const,
      render: (gpa: number) => (
        <Text strong style={{ color: gpa >= 3.5 ? '#059669' : gpa >= 3.0 ? '#f97316' : '#dc2626' }}>
          {gpa.toFixed(1)}
        </Text>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {email}
        </Text>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.header}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1E293B' }}>
              Student Monitoring Dashboard
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Comprehensive overview of student enrollment and academic progress
            </Text>
          </div>
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className={styles.filterCard}>
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>By Curriculum</Text>
                <Select
                  value={selectedCurriculum}
                  onChange={handleCurriculumChange}
                  style={{ width: '100%' }}
                  placeholder="Select Curriculum"
                >
                  <Option value="all">All Curriculums</Option>
                  <Option value="Computer Science">Computer Science</Option>
                  <Option value="Information Technology">Information Technology</Option>
                  <Option value="Software Engineering">Software Engineering</Option>
                  <Option value="Data Science">Data Science</Option>
                  <Option value="Cybersecurity">Cybersecurity</Option>
                </Select>
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Semester</Text>
                <Select
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                  style={{ width: '100%' }}
                  placeholder="Select Semester"
                >
                  {generateSemesterOptions().map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Time Range</Text>
                <Select
                  value={selectedTimeRange}
                  onChange={handleTimeRangeChange}
                  style={{ width: '100%' }}
                  placeholder="Select Time Range"
                >
                  {generateTimeRangeOptions().map(option => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Charts Section - Redesigned Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Chart 1: Student Comparison Across Combos - Full Width */}
        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <BarChartOutlined style={{ color: '#1E40AF' }} />
                  <Text strong>Student Comparison Across Combos</Text>
                </Space>
              }
              className={styles.chartCard}
              style={{ height: '500px' }}
            >
              <ComboComparisonChart data={comboComparisonData} loading={loading} />
            </Card>
          </Col>
        </Row>

        {/* Charts 2 & 3: Semester Distribution and Curriculum Distribution */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {/* Chart 2: Student Distribution by Semester - 70% width */}
          <Col xs={24} lg={17}>
            <Card 
              title={
                <Space>
                  <LineChartOutlined style={{ color: '#059669' }} />
                  <Text strong>Student Distribution by Semester</Text>
                </Space>
              }
              className={styles.chartCard}
              style={{ height: '500px' }}
            >
              <SemesterDistributionChart data={semesterData} loading={loading} />
            </Card>
          </Col>

          {/* Chart 3: Students by Curriculum - 30% width */}
          <Col xs={24} lg={7}>
            <Card 
              title={
                <Space>
                  <PieChartOutlined style={{ color: '#f97316' }} />
                  <Text strong>Students by Curriculum</Text>
                </Space>
              }
              className={styles.chartCard}
              style={{ height: '500px' }}
            >
              <CurriculumDistributionChart data={curriculumData} loading={loading} />
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Data Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card 
          title={
            <Space>
              <BookOutlined style={{ color: '#1E40AF' }} />
              <Text strong>Detailed Student Enrollment Data</Text>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                ({filteredEnrollmentData.length} students)
              </Text>
            </Space>
          }
          className={styles.tableCard}
          style={{ marginTop: 24 }}
        >
          {/* Table Filters */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Filter by Combo</Text>
                <Select
                  value={selectedCombo}
                  onChange={handleComboChange}
                  style={{ width: '100%' }}
                  placeholder="Select Combo"
                >
                  {generateComboOptions().map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Search Students</Text>
                <Search
                  placeholder="Search by name, ID, curriculum, combo, or email..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="middle"
                  onSearch={handleSearch}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Space>
            </Col>
          </Row>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Loading detailed data...</Text>
              </div>
            </div>
          ) : (
            <Table
              columns={enrollmentColumns}
              dataSource={filteredEnrollmentData}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} students`,
              }}
              scroll={{ x: 1100 }}
              size="middle"
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentInCoursePage;
