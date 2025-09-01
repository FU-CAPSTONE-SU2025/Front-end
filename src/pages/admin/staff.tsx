import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, Input, Select, Modal } from 'antd';
import { useNavigate } from 'react-router';
import styles from '../../css/admin/students.module.css';
import BulkDataImport from '../../components/common/bulkDataImport';
import AccountCounter from '../../components/admin/accountCounter';
import DataTable from '../../components/common/dataTable';
import useActiveUserData from '../../hooks/useActiveUserData';
import useCRUDStaff from '../../hooks/useCRUDStaff';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { AccountProps } from '../../interfaces/IAccount';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';

const { Option } = Select;

const StaffList: React.FC = () => {
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  // Removed bulk import state - only role-specific import is allowed
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedStaffs, setSelectedStaffs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  
  const { categorizedData, refetch } = useActiveUserData();
  const { getAllStaff, staffList, pagination, isLoading } = useCRUDStaff();
  const nav = useNavigate();
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { bulkRegisterStaff } = useAdminUsers();
  const { showWarning } = useMessagePopupContext();

  // Load initial data
  useEffect(() => {
    refetch();
    loadStaffData();
  }, []);

  // Load data when pagination or filters change (search is now handled separately)
  useEffect(() => {
    loadStaffData();
  }, [currentPage, pageSize, filterType, filterValue]);

  // Debounced search effect to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStaffData();
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadStaffData = () => {
    getAllStaff({
      pageNumber: currentPage,
      pageSize: pageSize,
      search: searchQuery || undefined,
      filterType: filterType || undefined,
      filterValue: filterValue || undefined
    });
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

  // Handle imported staff data
  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      setUploadStatus('uploading');
      setUploadMessage('Processing import...');
      
      // Extract staff data from the imported data
      const staffData = importedData['STAFF'] || [];
      
      if (staffData.length === 0) {
        setUploadStatus('error');
        setUploadMessage('No staff data found in the imported file');
        showWarning('No staff data found in the imported file');
        return;
      }

      // Transform the imported data to match BulkAccountPropsCreate interface
      const transformedData = staffData.map(item => ({
        email: item.email || '',
        username: item.username || item.email?.split('@')[0] || '',
        password: item.password || 'defaultPassword123',
        firstName: item.firstName || '',
        lastName: item.lastName || '',
        dateOfBirth: item.dateOfBirth || new Date().toISOString(),
        studentProfileData: null,
        staffProfileData: {
          campus: item.campus || '',
          department: item.department || '',
          position: item.position || '',
          startWorkAt: item.startWorkAt ? new Date(item.startWorkAt) : new Date(),
          endWorkAt: item.endWorkAt ? new Date(item.endWorkAt) : new Date()
        }
      }));

      // Validate the data
      const validData = transformedData.filter(item => 
        item.email.trim() !== '' && 
        item.firstName.trim() !== '' && 
        item.lastName.trim() !== ''
      );

      if (validData.length === 0) {
        setUploadStatus('error');
        setUploadMessage('No valid staff data found. Please check your data format and ensure all required fields are filled.');
        handleError('No valid staff data found. Please check your data format and ensure all required fields are filled.');
        return;
      }

      if (validData.length !== transformedData.length) {
        showWarning(`${transformedData.length - validData.length} rows were skipped due to missing required fields.`);
      }

      // Call the bulk registration API
      let response;
      try {
        response = await bulkRegisterStaff(validData);
      } catch (err) {

        setUploadStatus('error');
        setUploadMessage(err);
        handleError(err);
        return;
      }
      // Treat null/undefined (204 No Content) as success
      if (response !== null && response !== undefined || response === null) {
        setUploadStatus('success');
        setUploadMessage(`Successfully imported ${validData.length} staff members`);
        handleSuccess(`Successfully imported ${validData.length} staff members`);
        // Refresh the staff list
        loadStaffData();
      } else {
        setUploadStatus('error');
        setUploadMessage('Failed to import staff members. Please try again.');
        handleError('Failed to import staff members. Please try again.');
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

  // Handle search change (server-side, triggers API call with debounce)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleDeleteModeToggle = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedStaffs([]);
  };

  const handleConfirmDelete = () => {
    Modal.confirm({
      title: `Confirm Deletion`,
      content: `Are you sure you want to delete ${selectedStaffs.length} staff account(s)?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // Here you would typically call the API to delete the selected staff
        // For now, we'll just refresh the data
        loadStaffData();
        setSelectedStaffs([]);
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
    setSelectedStaffs([]);
  };

  // Redirect to edit page when a staff row is clicked
  const handleRowClick = (data: AccountProps) => {
    if (!isDeleteMode) {
      nav(`/admin/edit/staff/${data.id}`);
    }
  };

  // navigating to create page for adding new staff
  const handleAddNewAccount = () => {
    nav('/admin/edit/staff');
  };

  // Table columns
  const columns = [
    { title: 'Id', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
    { title: 'Name', key: 'name', width: 150, render: (_: any, record: AccountProps) => `${record.firstName} ${record.lastName}` },
    { title: 'Campus', key: 'campus', width: 120, render: (_: any, record: AccountProps) => record.staffDataDetailResponse?.campus || '' },
    { title: 'Department', key: 'department', width: 150, render: (_: any, record: AccountProps) => record.staffDataDetailResponse?.department || '' },
    { title: 'Position', key: 'position', width: 120, render: (_: any, record: AccountProps) => record.staffDataDetailResponse?.position || '' },
    { title: 'Added', key: 'added', width: 100, render: (_: any, record: AccountProps) => record.staffDataDetailResponse?.startWorkAt ? new Date(record.staffDataDetailResponse.startWorkAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '' },
    { title: 'Status', key: 'status', width: 100, render: (_: any, record: AccountProps) => (
      <span style={{
        display: 'inline-block',
        padding: '0 12px',
        borderRadius: '12px',
        color: '#fff',
        background: record.status === 0 ? '#22c55e' : '#ef4444',
        fontWeight: 500
      }}>
        {record.status === 0 ? 'Active' : 'Inactive'}
      </span>
    ) },
  ];

  // Row selection for delete mode
  const rowSelection = isDeleteMode
    ? {
        selectedRowKeys: selectedStaffs.map(Number),
        onChange: (selectedRowKeys: React.Key[]) => {
          setSelectedStaffs(selectedRowKeys.map(String));
        },
        getCheckboxProps: (record: AccountProps) => ({
          name: String(record.id),
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
        <AccountCounter label="Academic Staff" staff={categorizedData?.staff} />
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.userInfo}>
            <b>{isDeleteMode ? 'Delete Staff Account' : 'List Of Staff On the System'}</b>
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
                {/* Excel Import Button without blue wrapper */}
                <ExcelImportButton onClick={handleImport}>
                  Bulk Import
                </ExcelImportButton>
              </div>
            </div>
            {/* External Table display with server-side pagination and server-side search */}
            <DataTable
              columns={columns}
              data={staffList}
              rowSelection={rowSelection}
              pagination={pagination}
              onPageChange={handlePageChange}
              onRow={(record: AccountProps) => ({
                onClick: () => handleRowClick(record),
              })}
              loading={isLoading}
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
                  disabled={selectedStaffs.length === 0}
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
            supportedTypes={['STAFF']}
            uploadStatus={uploadStatus}
            uploadMessage={uploadMessage}
          />
        )}
        {/* Removed bulk import modal - only role-specific import is allowed */}
      </div>
    </ConfigProvider>
  );
};

export default StaffList;