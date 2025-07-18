import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Row, Col, ConfigProvider } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import styles from '../../css/staff/staffTranscript.module.css';

// Interfaces
interface AccountProps {
  id: number;
}

interface StudentDataListResponse {
  enrolledAt: Date;
  doGraduate: boolean;
  careerGoal: string;
}

interface StudentBase extends AccountProps {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  avatarUrl: string;
  roleName: string;
  status: number;
  studentDataListResponse: StudentDataListResponse;
}

interface Program {
  id: number;
  programName: string;
  programCode: string;
}

// Mock data
const mockStudents: StudentBase[] = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('2000-05-15'),
    avatarUrl: '/img/avatar-placeholder.png',
    roleName: 'Student',
    status: 1,
    studentDataListResponse: {
      enrolledAt: new Date('2023-09-01'),
      doGraduate: false,
      careerGoal: 'Software Engineer',
    },
  },
  {
    id: 2,
    username: 'jane_smith',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: new Date('1999-08-22'),
    avatarUrl: '/img/avatar-placeholder.png',
    roleName: 'Student',
    status: 1,
    studentDataListResponse: {
      enrolledAt: new Date('2022-09-01'),
      doGraduate: false,
      careerGoal: 'Data Scientist',
    },
  },
];

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
  const [students, setStudents] = useState<StudentBase[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null);
  const navigate = useNavigate();

  // Simulate fetching students
  useEffect(() => {
 
    setStudents(mockStudents);
    // Replace with API call:
    // fetch('/api/students').then(res => res.json()).then(setStudents);
  }, []);

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toString().includes(searchQuery);
    const matchesCampus = selectedCampus ? student.id % 2 === selectedCampus % 2 : true;
    return matchesSearch && matchesCampus;
  });

  // Handle edit action
  const handleEdit = (studentId: number) => {
    navigate(`/staff/editStudentTranscript/${studentId}`);
  };

  // Table columns
  const columns = [
    { title: 'Email', dataIndex: 'email', key: 'email', align: 'left' as 'left', render: (text: string) => <span style={{ color: '#1E293B', fontWeight: 500 }}>{text}</span> },
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName', align: 'left' as 'left', render: (text: string) => <span style={{ color: '#1E293B' }}>{text}</span> },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName', align: 'left' as 'left', render: (text: string) => <span style={{ color: '#1E293B' }}>{text}</span> },
    { title: 'Date of Birth', dataIndex: 'dateOfBirth', key: 'dateOfBirth', align: 'left' as 'left', render: (date: Date) => <span style={{ color: '#1E293B' }}>{new Date(date).toLocaleDateString('en-GB')}</span> },
    { title: 'Enrolled At', key: 'enrolledAt', align: 'left' as 'left', render: (record: StudentBase) => <span style={{ color: '#1E293B' }}>{new Date(record.studentDataListResponse.enrolledAt).toLocaleDateString('en-GB')}</span> },
    { title: 'Actions', key: 'actions', align: 'center' as 'center', render: (_: any, record: StudentBase) => (
      <Button type="link" icon={<EditOutlined style={{ color: '#f97316' }} />} onClick={() => handleEdit(record.id)} title="Edit Student" className={styles.sttFreshEditButton} style={{ color: '#f97316' }} />
    )},
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
                    placeholder="Search by name or ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.sttFreshInput}
                    size="large"
                  />
                  <Select
                    value={selectedCampus}
                    onChange={(value) => setSelectedCampus(value)}
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
            locale={{ emptyText: 'No records available.' }}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 5 }}
          />
        </motion.div>
      </div>
    </ConfigProvider>
  );
};

export default StaffTranscript;