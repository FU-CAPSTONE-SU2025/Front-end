import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, Input, Select, Modal, message, Button, Popconfirm } from 'antd';
import styles from '../../css/admin/students.module.css';
import BulkDataImport from '../../components/common/bulkDataImport';
import AccountCounter from '../../components/admin/accountCounter';
import DataTable from '../../components/common/dataTable';
import { useNavigate } from 'react-router';
import { AccountProps } from '../../interfaces/IAccount';
import useActiveUserData from '../../hooks/useActiveUserData';
import useCRUDStudent from '../../hooks/useCRUDStudent';
import { StudentBase } from '../../interfaces/IStudent';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { BulkRegisterStudent, DisableUser, ResetBanNumberForStudent } from '../../api/Account/UserAPI';
import { parseExcelDate } from '../../utils/dateUtils';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';

const { Option } = Select;

const StudentList: React.FC = () => {
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  // Removed bulk import state - only role-specific import is allowed
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [resetBanStudentId, setResetBanStudentId] = useState<number | null>(null);
  
  const { categorizedData, refetch } = useActiveUserData();
  const { studentList, getAllStudent, pagination, isLoading } = useCRUDStudent();
  const nav = useNavigate();
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { showWarning } = useMessagePopupContext();

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
  const handleRowClick = (data: AccountProps, event: React.MouseEvent) => {
    // Check if the click was on a button or its children
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('.ant-popconfirm')) {
      return; // Don't navigate if clicking on buttons or popconfirm
    }
    
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

  // Removed bulk import - only role-specific import is allowed

  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      setUploadStatus('uploading');
      setUploadMessage('Processing import...');
      
      // Extract student data from the imported data
      const studentData = importedData['STUDENT'] || [];
      
      if (studentData.length === 0) {
        setUploadStatus('error');
        setUploadMessage('No student data found in the imported file');
        showWarning('No student data found in the imported file');
        return;
      }

      // Transform the imported data to match BulkAccountPropsCreate interface
      const transformedData = studentData.map(item => ({
        email: item.email || '',
        username: item.username || item.email?.split('@')[0] || '',
        password: item.password || 'defaultPassword123',
        firstName: item.firstName || '',
        lastName: item.lastName || '',
        dateOfBirth: parseExcelDate(item.dateOfBirth).toISOString(),
        studentProfileData: {
          numberOfBan: item.numberOfBan ? parseInt(item.numberOfBan) : 0,
          enrolledAt: parseExcelDate(item.enrolledAt || item.enrollDate),
          careerGoal: item.careerGoal || 'Not specified'
        },
        staffProfileData: null
      }));

      // Validate the data
      const validData = transformedData.filter(item => 
        item.email.trim() !== '' && 
        item.firstName.trim() !== '' && 
        item.lastName.trim() !== ''
      );

      if (validData.length === 0) {
        setUploadStatus('error');
        setUploadMessage('No valid student data found. Please check your data format and ensure all required fields are filled.');
        handleError('No valid student data found. Please check your data format and ensure all required fields are filled.');
        return;
      }

      if (validData.length !== transformedData.length) {
        showWarning(`${transformedData.length - validData.length} rows were skipped due to missing required fields.`);
      }

      // Call the bulk registration API
      let response;
      try {
        response = await BulkRegisterStudent(validData);
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err);
        setUploadStatus('error');
        setUploadMessage(errorMessage);
        handleError(errorMessage);
        return;
      }
      // Treat null/undefined (204 No Content) as success
      if (response !== null && response !== undefined || response === null) {
        setUploadStatus('success');
        setUploadMessage(`Successfully imported ${validData.length} students`);
        handleSuccess(`Successfully imported ${validData.length} students`);
        // Refresh the student list
        loadStudentData();
      } else {
        setUploadStatus('error');
        setUploadMessage('Failed to import students. Please try again.');
        handleError('Failed to import students. Please try again.');
      }
    } catch (error) {
      console.error('Import error:', error);
      setUploadStatus('error');
      setUploadMessage('An error occurred during import. Please check your data and try again.');
      handleError('An error occurred during import. Please check your data and try again.');
    }
  };

  // Removed bulk import handler - only role-specific import is allowed

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

  const handleConfirmDelete = async () => {
    if (selectedStudents.length === 0) return;
    const studentId = selectedStudents[0];
    Modal.confirm({
      title: `Confirm Deletion`,
      content: `Are you sure you want to delete this student account?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await DisableUser(studentId);
          handleSuccess('Student account deleted successfully');
          loadStudentData();
          setSelectedStudents([]);
          setIsDeleteMode(false);
        } catch (error) {
          handleError('Failed to delete student account');
        }
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

  // Handle reset ban number
  const handleResetBanNumber = async (studentId: number) => {
    try {
      await ResetBanNumberForStudent(studentId);
      handleSuccess('Ban number reset successfully');
      // Refresh the data and refetch active user data
      loadStudentData();
      refetch();
      // Close the popconfirm by clearing the student ID
      setResetBanStudentId(null);
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      handleError(errorMessage);
      console.error('Reset ban number error:', err);
    }
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
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100,
      render: (status: number | boolean) => {
        const isActive = typeof status === 'boolean' ? status : status === 0;
        return (
          <span
            style={{
              backgroundColor: isActive ? '#10B981' : '#EF4444',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'inline-block',
              minWidth: '60px',
              textAlign: 'center'
            }}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      }},
    { title: 'Enrolled At', key: 'enrolledAt', width: 120,
      render: (_: any, record: StudentBase) =>
        record.studentDataListResponse?.enrolledAt
          ? new Date(record.studentDataListResponse.enrolledAt).toLocaleDateString()
          : '' },
    { title: 'Career Goal', key: 'careerGoal', width: 180,
      render: (_: any, record: StudentBase) =>
        record.studentDataListResponse?.careerGoal || '' },
    { title: 'Graduation Status', key: 'doGraduate', width: 120,
      render: (_: any, record: StudentBase) =>
        record.studentDataListResponse?.doGraduate ? 'Graduated' : 'Enrolled' },
    { title: 'Number of Ban', key: 'numberOfBan', width: 120,
      render: (_: any, record: StudentBase) => {
        const banCount = record.studentDataListResponse?.numberOfBan || 0;
        return (
          <span
            style={{
              backgroundColor: banCount > 0 ? '#EF4444' : '#10B981',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'inline-block',
              minWidth: '30px',
              textAlign: 'center'
            }}
          >
            {banCount}
          </span>
        );
      }},
    { title: 'Action', key: 'action', width: 150,
      render: (_: any, record: StudentBase) => {
        // Check if studentDataListResponse exists before rendering
        if (!record.studentDataListResponse) {
          return null; // Don't render the button if data is not loaded
        }
        
        return (
          <Popconfirm
            title="Reset Ban Number"
            description="Are you sure you want to reset the ban number for this student?"
            open={resetBanStudentId === record.studentDataListResponse.id}
            onOpenChange={(visible) => {
              if (visible) {
                setResetBanStudentId(record.studentDataListResponse.id);
              } else {
                setResetBanStudentId(null);
              }
            }}
            onConfirm={() => handleResetBanNumber(record.studentDataListResponse.id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
            overlayStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid #f0f0f0',
            }}
            overlayClassName="reset-ban-popconfirm"
          >
          <Button
            type="default"
            size="small"
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#f97316',
              color: '#f97316',
              fontWeight: '500',
              borderRadius: '6px',
              height: '28px',
              padding: '2px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f97316';
              e.currentTarget.style.borderColor = '#f97316';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#f97316';
              e.currentTarget.style.color = '#f97316';
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Reset Ban
          </Button>
        </Popconfirm>
        );
      },
    },
  ];

  // Row selection for delete mode
  const rowSelection = isDeleteMode
    ? {
        type: 'radio',
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
            headerBg: 'rgba(255, 255, 255, 0.95)',
            headerColor: '#1E293B',
            borderColor: 'rgba(30, 64, 175, 0.2)',
            colorText: '#1E293B',
            colorBgContainer: 'rgba(255, 255, 255, 0.95)',
            colorBgElevated: 'rgba(255, 255, 255, 0.95)',
            rowHoverBg: 'rgba(30, 64, 175, 0.08)',
            colorPrimary: '#1E40AF',
            colorPrimaryHover: '#1d4ed8',
          },
          Input: {
            colorBgContainer: 'rgba(255,255,255,0.95)',
            colorBorder: 'rgba(30, 64, 175, 0.25)',
            colorText: '#1E293B',
            colorPrimary: '#1E40AF',
            colorPrimaryHover: '#1d4ed8',
          },
          Select: {
            colorBgContainer: 'rgba(255,255,255,0.95)',
            colorBorder: 'rgba(30, 64, 175, 0.25)',
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
                onClick: (event: React.MouseEvent) => handleRowClick(record, event),
              })}
              loading={isLoading}
              search={searchQuery}
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
            onClose={() => {
              setIsImportOpen(false);
              setUploadStatus('idle');
              setUploadMessage('');
            }} 
            onDataImported={handleDataImported}
            supportedTypes={['STUDENT']}
            uploadStatus={uploadStatus}
            uploadMessage={uploadMessage}
          />
        )}
        {/* Removed bulk import modal - only role-specific import is allowed */}
      </div>
    </ConfigProvider>
  );
};

export default StudentList;