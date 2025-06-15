import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, Input, Select, Table, Modal } from 'antd';
import styles from '../../css/admin/students.module.css';
import { students } from '../../../data/mockStudent';
import DataImport from '../../components/admin/dataImport';
import AccountCounter from '../../components/admin/accountCounter';

const { Option } = Select;

interface Student {
  Id: string;
  Email: string;
  Name: string;
  PhoneNumber: string;
  Address: string;
  Campus: string;
  AddDated: string;
}

const StudentList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const studentsPerPage = 10;

  // Filtering logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.Id.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;

    if (filterType === 'major') {
      matchesFilter = student.Id.startsWith(filterValue);
    } else if (filterType === 'campus') {
      matchesFilter = student.Campus === filterValue;
    } else if (filterType === 'date') {
      matchesFilter = student.AddDated === filterValue;
    }

    return matchesSearch && matchesFilter;
  });

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const handleImport = () => {
    setIsImportOpen(true);
  };

  const handleDataImported = (data: { [key: string]: string }) => {
    const newStudent = {
      Id: `${['SE', 'SS', 'CE'][Math.floor(Math.random() * 3)]}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      Email: data.email || '',
      Name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      PhoneNumber: data.phone || '',
      Address: data.address || '',
      Campus: ['HCMC Campus', 'Ha Noi Campus', 'Da Nang Campus'][Math.floor(Math.random() * 3)],
      AddDated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/'),
    };
    students.push(newStudent);
    setCurrentPage(1);
    setIsImportOpen(false);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setFilterValue('');
  };

  const handleFilterValueChange = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  const handleDeleteModeToggle = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedStudents([]);
  };

  const handleConfirmDelete = () => {
    Modal.confirm({
      title: `Confirm Deletion`,
      content: `Are you sure you want to delete ${selectedStudents.length} student account(s)?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        selectedStudents.forEach(id => {
          const index = students.findIndex(student => student.Id === id);
          if (index !== -1) students.splice(index, 1);
        });
        setSelectedStudents([]);
        setIsDeleteMode(false);
        setCurrentPage(1);
      },
      maskStyle: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
      centered: true,
      zIndex: 10000,
      className: styles.customModal,
    });
  };

  const handleCancelDelete = () => {
    setIsDeleteMode(false);
    setSelectedStudents([]);
  };

  // Table columns
  const columns = [
    { title: 'Id', dataIndex: 'Id', key: 'Id', width: 100 },
    { title: 'Email', dataIndex: 'Email', key: 'Email', width: 200 },
    { title: 'Name', dataIndex: 'Name', key: 'Name', width: 150 },
    { title: 'Phone Number', dataIndex: 'PhoneNumber', key: 'PhoneNumber', width: 120 },
    { title: 'Address', dataIndex: 'Address', key: 'Address', width: 200 },
    { title: 'Campus', dataIndex: 'Campus', key: 'Campus', width: 120 },
    { title: 'Added', dataIndex: 'AddDated', key: 'AddDated', width: 100 },
  ];

  // Row selection for delete mode
  const rowSelection = isDeleteMode
    ? {
        selectedRowKeys: selectedStudents,
        onChange: (selectedRowKeys: React.Key[]) => {
          setSelectedStudents(selectedRowKeys as string[]);
        },
        getCheckboxProps: (record: Student) => ({
          name: record.Id,
        }),
      }
    : undefined;

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: 'rgba(255, 255, 255, 0.1)',
            headerColor: '#ffffff',
            rowHoverBg: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
      }}
    >
      <div className={styles.container}>
        <AccountCounter label="Student" student={students} />
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.userInfo}>
            <h2>{isDeleteMode ? 'Delete Student Account' : 'List Of Students On the System'}</h2>
            <div className={styles.controlBar}>
              <div className={styles.searchBar}>
                <Input
                  placeholder="Search Name or Id..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: 200 }}
                />
                <Select
                  value={filterType}
                  onChange={handleFilterChange}
                  style={{ width: 120 }}
                  placeholder="Filter"
                >
                  <Option value="">Filter</Option>
                  <Option value="major">By Major</Option>
                  <Option value="campus">By Campus</Option>
                  <Option value="date">By Date</Option>
                </Select>
                {filterType === 'major' && (
                  <Select
                    value={filterValue}
                    onChange={handleFilterValueChange}
                    style={{ width: 120 }}
                    placeholder="Select Major"
                  >
                    <Option value="">Select Major</Option>
                    <Option value="SE">SE</Option>
                    <Option value="SS">SS</Option>
                    <Option value="CE">CE</Option>
                  </Select>
                )}
                {filterType === 'campus' && (
                  <Select
                    value={filterValue}
                    onChange={handleFilterValueChange}
                    style={{ width: 120 }}
                    placeholder="Select Campus"
                  >
                    <Option value="">Select Campus</Option>
                    <Option value="HCMC Campus">HCMC Campus</Option>
                    <Option value="Ha Noi Campus">Ha Noi Campus</Option>
                    <Option value="Da Nang Campus">Da Nang Campus</Option>
                  </Select>
                )}
                {filterType === 'date' && (
                  <Select
                    value={filterValue}
                    onChange={handleFilterValueChange}
                    style={{ width: 120 }}
                    placeholder="Select Date"
                  >
                    <Option value="">Select Date</Option>
                    {[...new Set(students.map(s => s.AddDated))].sort().map(date => (
                      <Option key={date} value={date}>{date}</Option>
                    ))}
                  </Select>
                )}
              </div>
              <div className={styles.actions}>
                {['Add New Account', 'Delete Account', 'Import Data From xlsx'].map((action, index) => (
                  <motion.div
                    key={index}
                    className={`${styles.actionButton} ${action === 'Delete Account' ? styles.deleteButton : ''}`}
                    whileHover={{ scale: isDeleteMode ? 1 : 1.05 }}
                    onClick={
                      isDeleteMode
                        ? undefined
                        : action === 'Import Data From xlsx'
                        ? handleImport
                        : action === 'Delete Account'
                        ? handleDeleteModeToggle
                        : undefined
                    }
                  >
                    <div className={`${styles.buttonContent} ${isDeleteMode ? styles.disabledButton : ''}`}>
                      {action}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <Table
              className={styles.studentTable}
              columns={columns}
              dataSource={filteredStudents}
              rowSelection={rowSelection}
              pagination={{
                current: currentPage,
                pageSize: studentsPerPage,
                total: filteredStudents.length,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
              }}
              rowKey="Id"
              bordered
              size="middle"
              scroll={{ x: 'max-content' }}
            />
            {isDeleteMode && (
              <motion.div
                className={styles.deleteActions}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  className={`${styles.cancelButton} ${styles.deleteActionButton}`}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleCancelDelete}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className={`${styles.deleteActionButton} ${styles.deleteConfirmButton}`}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleConfirmDelete}
                  disabled={selectedStudents.length === 0}
                >
                  Delete
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
        {isImportOpen && (
          <div className={styles.modalOverlay}>
            <DataImport onClose={() => setIsImportOpen(false)} onDataImported={handleDataImported} />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default StudentList;