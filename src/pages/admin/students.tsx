import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, Input, Select, Table, Modal, message } from 'antd';
import styles from '../../css/admin/students.module.css';
import DataImport from '../../components/common/dataImport';
import BulkDataImport from '../../components/common/bulkDataImport';
import AccountCounter from '../../components/admin/accountCounter';
import DataTable from '../../components/common/dataTable';
import { useNavigate } from 'react-router';
import { AccountProps } from '../../interfaces/IAccount';
import useActiveUserData from '../../hooks/useActiveUserData';
import useCRUDStudent from '../../hooks/useCRUDStudent';
import { StudentBase } from '../../interfaces/IStudent';
import ExcelImportButton from '../../components/common/ExcelImportButton';

const { Option } = Select;

const StudentList: React.FC = () => {
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  const { categorizedData, refetch } = useActiveUserData();
  const { studentList, getAllStudent, pagination, isLoading } = useCRUDStudent();
  const nav = useNavigate();

  // Load initial data
  useEffect(() => {
    refetch();
    loadStudentData();
  }, []);

  // Load data when pagination or filters change (search is now client-side)
  useEffect(() => {
    loadStudentData();
  }, [currentPage, pageSize, filterType, filterValue]);

  const loadStudentData = () => {
    getAllStudent({
      pageNumber: currentPage,
      pageSize: pageSize,
      filterType: filterType || undefined,
      filterValue: filterValue || undefined
    });
  };

  // Redirect to edit page when a student row is clicked
  const handleRowClick = (data: AccountProps) => {
    if (!isDeleteMode) {
      nav(`/admin/edit/student/${data.id}`);
    }
  };

  // navigating to create page for adding new student
  const handleAddNewAccount = () => {
    nav('/admin/edit/student');
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const handleImport = () => {
    setIsImportOpen(true);
  };

  const handleBulkImport = () => {
    setIsBulkImportOpen(true);
  };

  const handleDataImported = (importedData: { [type: string]: { [key: string]: string }[] }) => {
    // Extract student data from the imported data
    const studentData = importedData['STUDENT'] || [];
    message.success(`Successfully imported ${studentData.length} students`);
    // TODO: Implement actual student import logic
    // Refresh the student list
    loadStudentData();
  };

  const handleBulkDataImported = (importedData: { [type: string]: { [key: string]: string }[] }) => {
    console.log('Bulk imported data:', importedData);
    setIsBulkImportOpen(false);
    
    // Refresh all data
    refetch();
    loadStudentData();
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setFilterValue('');
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleFilterValueChange = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1); // Reset to first page when filter value changes
  };

  // Handle search change (client-side, no need to reset page or reload data)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page for client-side pagination
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
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
        // Here you would typically call the API to delete the selected students
        // For now, we'll just refresh the data
        loadStudentData();
        setSelectedStudents([]);
        setIsDeleteMode(false);
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
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Username', dataIndex: 'username', key: 'username', width: 150 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName', width: 120 },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName', width: 120 },
    { title: 'Date of Birth', dataIndex: 'dateOfBirth', key: 'dateOfBirth', width: 120,
      render: (date: Date) => date ? new Date(date).toLocaleDateString() : '' },
    { title: 'Role', dataIndex: 'roleName', key: 'roleName', width: 120 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
    { title: 'Enrolled At', dataIndex: 'enrolledAt', key: 'enrolledAt', width: 120,
      render: (_: any, record: StudentBase) =>
        record.studentDataListResponse?.enrolledAt
          ? new Date(record.studentDataListResponse.enrolledAt).toLocaleDateString()
          : '' },
    { title: 'Career Goal', dataIndex: 'careerGoal', key: 'careerGoal', width: 180,
      render: (_: any, record: StudentBase) =>
        record.studentDataListResponse?.careerGoal || '' },
  ];

  // Row selection for delete mode
  const rowSelection = isDeleteMode
    ? {
        selectedRowKeys: selectedStudents,
        onChange: (selectedRowKeys: React.Key[]) => {
          setSelectedStudents(selectedRowKeys as number[]);
        },
        getCheckboxProps: (record: StudentBase) => ({
          name: record.id,
        }),
      }
    : undefined;

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: 'linear-gradient(90deg, #f97316 0%, #1E40AF 100%)',
            headerColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            colorText: '#1E293B',
            colorBgContainer: 'rgba(255,255,255,0.6)',
            colorBgElevated: 'rgba(255,255,255,0.3)',
            rowHoverBg: 'rgba(249, 115, 22, 0.15)',
            colorPrimary: '#1E40AF',
            colorPrimaryHover: '#1d4ed8',
          },
          Input: {
            colorBgContainer: 'rgba(255,255,255,0.8)',
            colorBorder: 'rgba(30, 64, 175, 0.3)',
            colorText: '#1E293B',
            colorPrimary: '#1E40AF',
            colorPrimaryHover: '#1d4ed8',
          },
          Select: {
            colorBgContainer: 'rgba(255,255,255,0.8)',
            colorBorder: 'rgba(30, 64, 175, 0.3)',
            colorText: '#1E293B',
            colorPrimary: '#1E40AF',
            colorPrimaryHover: '#1d4ed8',
          },
          Button: {
            colorPrimary: '#1E40AF',
            colorPrimaryHover: '#1d4ed8',
            colorText: '#fff',
            colorTextLightSolid: '#fff',
            colorTextDisabled: '#bdbdbd',
          },
        },
      }}
    >
      <div className={styles.container}>
        <AccountCounter label="Student" student={categorizedData?.student} />
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.userInfo}>
            <h2>{isDeleteMode ? 'Delete Student Account' : 'List Of Students On the System'}</h2>
            <div className={styles.controlBar}>
              <div className={styles.searchBar}>
                <Input
                  placeholder="Search Name or Id..."
                  value={searchQuery}
                  onChange={handleSearchChange}
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
                    {/* This would need to be populated with actual dates from the backend */}
                    <Option value="2024-01-01">2024-01-01</Option>
                    <Option value="2024-02-01">2024-02-01</Option>
                  </Select>
                )}
              </div>
              <div className={styles.actions}>
                {['Add New Account', 'Delete Account'].map((action, index) => (
                  <motion.div
                    key={index}
                    className={`${styles.actionButton} ${action === 'Delete Account' ? styles.deleteButton : ''}`}
                    whileHover={{ scale: isDeleteMode ? 1 : 1.05 }}
                    onClick={
                      isDeleteMode
                        ? undefined
                        : action === 'Add New Account'
                        ? handleAddNewAccount
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
                {/* Excel Import Buttons without blue wrapper */}
                <ExcelImportButton onClick={handleImport}>
                  Import Data From xlsx
                </ExcelImportButton>
                <ExcelImportButton onClick={handleBulkImport}>
                  Bulk Import
                </ExcelImportButton>
              </div>
            </div>
            {/* External Table display with server-side pagination and client-side search */}
            <DataTable
              columns={columns}
              data={studentList}
              rowSelection={rowSelection}
              pagination={pagination}
              onPageChange={handlePageChange}
              onRow={(record: StudentBase) => ({
                onClick: () => handleRowClick(record),
              })}
              loading={isLoading}
              searchQuery={searchQuery}
              searchFields={['id', 'username', 'firstName', 'lastName', 'email']}
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
        {/* Data Import Modal */}
        {isImportOpen && (
          <BulkDataImport 
            onClose={() => setIsImportOpen(false)} 
            onDataImported={handleDataImported}
            supportedTypes={['STUDENT']}
          />
        )}
        {isBulkImportOpen && (
          <BulkDataImport 
            onClose={() => setIsBulkImportOpen(false)} 
            onDataImported={handleBulkDataImported}
            supportedTypes={['STUDENT', 'STAFF', 'MANAGER', 'ADVISOR']}
          />
        )}
      </div>
    </ConfigProvider>
  );
};

export default StudentList;