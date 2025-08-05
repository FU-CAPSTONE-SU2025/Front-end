import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Row, Col, ConfigProvider, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import styles from '../../css/staff/staffTranscript.module.css';
import useCRUDStudent from '../../hooks/useCRUDStudent';
import { StudentBase } from '../../interfaces/IStudent';

// Interfaces
interface AccountProps {
  id: number;
}

interface StudentDataListResponse {
  enrolledAt: Date;
  doGraduate: boolean;
  careerGoal: string;
}

interface Program {
  id: number;
  programName: string;
  programCode: string;
}

// Mock programs data (this could be fetched from API later)
const mockPrograms: Program[] = [
  { id: 1, programName: 'Computer Science', programCode: 'CS101' },
  { id: 2, programName: 'Artificial Intelligence', programCode: 'AI201' },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.9, filter: 'blur(4px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: 'easeOut' } },
};

const headerVariants = {
  hidden: { opacity: 0, y: -60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

const filterVariants = {
  hidden: { opacity: 0, y: -40, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: 'easeOut', delay: i * 0.35 },
  }),
};

const tableVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: 'easeOut', delay: 1.0 } },
};

const StaffTranscript: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  // Use the student CRUD hook
  const { studentList, getAllStudent, pagination, isLoading } = useCRUDStudent();

  // Load initial data
  useEffect(() => {
    loadStudentData();
  }, []);

  // Load data when pagination or filters change
  useEffect(() => {
    loadStudentData();
  }, [currentPage, pageSize, selectedProgram]);

  const loadStudentData = () => {
    getAllStudent({
      pageNumber: currentPage,
      pageSize: pageSize,
      filterType: selectedProgram ? 'programId' : undefined,
      filterValue: selectedProgram ? selectedProgram.toString() : undefined
    });
  };

  // Handle search (client-side filtering)
  const filteredStudents = studentList.filter((student) => {
    if (!searchQuery) return true;
    
    return (
      student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id?.toString().includes(searchQuery)
    );
  });

  // Handle pagination change
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  // Handle program filter change
  const handleProgramFilterChange = (value: number | null) => {
    setSelectedProgram(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Search is client-side, so we don't need to reload data
  };

  // Handle edit action
  const handleEdit = (studentId: number) => {
    navigate(`/staff/editStudentTranscript/${studentId}`);
  };

  // Table columns
  const columns = [
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email', 
      align: 'left' as 'left', 
      render: (text: string) => <span style={{ color: '#1E293B', fontWeight: 500 }}>{text}</span> 
    },
    { 
      title: 'First Name', 
      dataIndex: 'firstName', 
      key: 'firstName', 
      align: 'left' as 'left', 
      render: (text: string) => <span style={{ color: '#1E293B' }}>{text}</span> 
    },
    { 
      title: 'Last Name', 
      dataIndex: 'lastName', 
      key: 'lastName', 
      align: 'left' as 'left', 
      render: (text: string) => <span style={{ color: '#1E293B' }}>{text}</span> 
    },
    { 
      title: 'Date of Birth', 
      dataIndex: 'dateOfBirth', 
      key: 'dateOfBirth', 
      align: 'left' as 'left', 
      render: (date: Date) => <span style={{ color: '#1E293B' }}>{date ? new Date(date).toLocaleDateString('en-GB') : '-'}</span> 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      align: 'center' as 'center', 
      render: (status: number) => (
        <span style={{ 
          color: status === 1 ? '#10b981' : '#ef4444',
          fontWeight: 600,
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: status === 1 ? '#dcfce7' : '#fee2e2'
        }}>
          {status === 1 ? 'Active' : 'Inactive'}
        </span>
      ) 
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      align: 'center' as 'center', 
      render: (_: any, record: StudentBase) => (
        <Button 
          type="link" 
          icon={<EditOutlined style={{ color: '#f97316' }} />} 
          onClick={() => handleEdit(record.id)} 
          title="Edit Student" 
          className={styles.sttFreshEditButton} 
          style={{ color: '#f97316' }} 
        />
      )
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: 'linear-gradient(90deg, #f97316 0%, #1E40AF 100%)',
            headerColor: '#fff',
            borderColor: 'rgba(30, 64, 175, 0.08)',
            colorText: '#1E293B',
            colorBgContainer: 'rgba(255,255,255,0.8)',
            colorBgElevated: 'rgba(255,255,255,0.8)',
            rowHoverBg: 'rgba(30, 64, 175, 0.08)',
            colorPrimary: '#f97316',
            colorPrimaryHover: '#1E40AF',
          },
          Input: {
            colorBgContainer: 'rgba(255,255,255,0.7)',
            colorBorder: '#f97316',
            colorText: '#1E293B',
            colorPrimary: '#f97316',
            colorPrimaryHover: '#1E40AF',
          },
          Select: {
            colorBgContainer: 'rgba(255,255,255,0.7)',
            colorBorder: '#f97316',
            colorText: '#1E293B',
            colorPrimary: '#f97316',
            colorPrimaryHover: '#1E40AF',
          },
          Button: {
            colorPrimary: '#f97316',
            colorPrimaryHover: '#1E40AF',
            colorText: '#fff',
            colorTextLightSolid: '#fff',
            colorTextDisabled: '#bdbdbd',
          },
        },
      }}
    >
      <div className={styles.sttContainer}>
        <motion.div className={styles.sttHeader} variants={headerVariants} initial="hidden" animate="visible">
          <Row>
            <Col span={18}>
              <h1 className={styles.sttTitle}>Student Transcript Hub</h1>
            </Col>
            <Col span={6}>
              <div className={styles.sttFilterWrapper}>
                <div className={styles.sttFilterSection}>
                  <Input
                    placeholder="Search by name, email or ID"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className={styles.sttFreshInput}
                    size="large"
                  />
                  <Select
                    value={selectedProgram}
                    onChange={(value) => handleProgramFilterChange(value)}
                    placeholder="Filter by Program"
                    allowClear
                    className={styles.sttFreshSelect}
                    size="large"
                  >
                    {mockPrograms.map((program) => (
                      <Select.Option key={program.id} value={program.id}>
                        {program.programName}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
            </Col>
          </Row>
        </motion.div>

        <motion.div variants={tableVariants} initial="hidden" animate="visible" className={styles.sttTableWrapper}>
          <Table
            columns={columns}
            dataSource={filteredStudents}
            rowKey="id"
            className={styles.sttFreshTable}
            locale={{ emptyText: 'No students found.' }}
            scroll={{ x: 'max-content' }}
            loading={isLoading}
            pagination={{
              current: pagination?.current || 1,
              pageSize: pagination?.pageSize || 10,
              total: pagination?.total || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} students`,
              onChange: handlePageChange,
              onShowSizeChange: handlePageChange,
            }}
          />
        </motion.div>
      </div>
    </ConfigProvider>
  );
};

export default StaffTranscript;