import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Select, Spin, Empty, Typography, Space, Table, Tag, Input } from 'antd';
import { BarChartOutlined, LineChartOutlined, PieChartOutlined, BookOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import styles from '../../css/manager/studentInCoursePage.module.css';
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
} from '../../datas/mockStudentMonitoring';

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
  const [isSticky, setIsSticky] = useState(false);
  const filterCardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

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

  // Scroll detection for sticky toolbar
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current && filterCardRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        const navbarHeight = 80; // Adjust based on your navbar height
        
        // Check if header has scrolled past the top of the viewport
        if (headerBottom <= navbarHeight) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Helper function to get GPA color class
  const getGpaColorClass = (gpa: number): string => {
    if (gpa >= 3.5) return styles.gpaExcellent;
    if (gpa >= 3.0) return styles.gpaGood;
    return styles.gpaPoor;
  };

  // Table columns for detailed enrollment data
  const enrollmentColumns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 140,
      render: (text: string) => <Text code className={styles.studentIdText}>{text}</Text>,
    },
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 180,
      render: (text: string) => (
        <Space size="small">
          <UserOutlined className={styles.studentNameIcon} />
          <Text strong className={styles.studentNameText}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Curriculum',
      dataIndex: 'curriculum',
      key: 'curriculum',
      width: 140,
      render: (text: string) => (
        <Tag color="blue" className={styles.curriculumTag}>
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
        <Tag color="orange" className={styles.comboTag}>
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
        <Tag color="green" className={styles.semesterTag}>
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
        <Text strong className={getGpaColorClass(gpa)}>
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
        <Text type="secondary" className={styles.emailText}>
          {email}
        </Text>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.header}
      >
        <div className={styles.headerContent}>
          <div>
            <Title level={2} className={styles.headerTitle}>
              Student Monitoring Dashboard
            </Title>
            <Text type="secondary" className={styles.headerSubtitle}>
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
        <div ref={filterCardRef}>
          <Card className={`${styles.filterCard} ${isSticky ? styles.stickyActive : ''}`}>
            <Row gutter={[24, 16]} align="middle">
              <Col xs={24} sm={8}>
                <Space direction="vertical" className={styles.filterSpace}>
                  <Text strong>By Curriculum</Text>
                  <Select
                    value={selectedCurriculum}
                    onChange={handleCurriculumChange}
                    className={styles.filterSelect}
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
                <Space direction="vertical" className={styles.filterSpace}>
                  <Text strong>Semester</Text>
                  <Select
                    value={selectedSemester}
                    onChange={handleSemesterChange}
                    className={styles.filterSelect}
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
                <Space direction="vertical" className={styles.filterSpace}>
                  <Text strong>Time Range</Text>
                  <Select
                    value={selectedTimeRange}
                    onChange={handleTimeRangeChange}
                    className={styles.filterSelect}
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
        </div>
      </motion.div>

      {/* Charts Section - Redesigned Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={styles.motionContainer}
      >
        {/* Chart 1: Student Comparison Across Combos - Full Width */}
        <Row className={styles.chartRow}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <BarChartOutlined className={styles.barChartIcon} />
                  <Text strong>Student Comparison Across Combos</Text>
                </Space>
              }
              className={styles.chartCard}
          
            >
              <ComboComparisonChart data={comboComparisonData} loading={loading} />
            </Card>
          </Col>
        </Row>

        {/* Charts 2 & 3: Semester Distribution and Curriculum Distribution */}
        <Row gutter={[24, 24]} className={styles.chartRowGutter}>
          {/* Chart 2: Student Distribution by Semester - 70% width */}
          <Col xs={24} lg={17}>
            <Card
              title={
                <Space>
                  <LineChartOutlined className={styles.lineChartIcon} />
                  <Text strong>Student Distribution by Semester</Text>
                </Space>
              }
              className={styles.chartCard}
            >
              <SemesterDistributionChart data={semesterData} loading={loading} />
            </Card>
          </Col>

          {/* Chart 3: Students by Curriculum - 30% width */}
          <Col xs={24} lg={7}>
            <Card 
              title={
                <Space>
                  <PieChartOutlined className={styles.pieChartIcon} />
                  <Text strong>Students by Curriculum</Text>
                </Space>
              }
              className={styles.chartCard}
            
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
        className={styles.motionContainer}
      >
        <Card 
          title={
            <Space>
              <BookOutlined className={styles.bookIcon} />
              <Text strong>Detailed Student Enrollment Data</Text>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                ({filteredEnrollmentData.length} students)
              </Text>
            </Space>
          }
          className={styles.tableCard}
        >
          {/* Table Filters */}
          <Row gutter={[16, 16]} className={styles.tableFiltersRow}>
            <Col xs={24} sm={12}>
              <Space direction="vertical" className={styles.tableFiltersSpace}>
                <Text strong>Filter by Combo</Text>
                <Select
                  value={selectedCombo}
                  onChange={handleComboChange}
                  className={styles.tableFiltersSelect}
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
              <Space direction="vertical" className={styles.tableFiltersSpace}>
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
            <div className={styles.loadingContainer}>
              <Spin size="large" />
              <div className={styles.loadingText}>
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
              className={styles.tableContainer}
            />
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentInCoursePage;
