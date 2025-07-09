import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, Input, Select, Table, Modal, message } from 'antd';
import { useNavigate } from 'react-router';
import styles from '../../css/admin/students.module.css';
import BulkDataImport from '../../components/common/bulkDataImport';
import AccountCounter from '../../components/admin/accountCounter';
import DataTable from '../../components/common/dataTable';
import useActiveUserData from '../../hooks/useActiveUserData';
import useCRUDStaff from '../../hooks/useCRUDStaff';
import { StaffProfileData } from '../../interfaces/IStaff';
import ExcelImportButton from '../../components/common/ExcelImportButton';

const { Option } = Select;

const StaffList: React.FC = () => {
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedStaffs, setSelectedStaffs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  const { categorizedData, refetch } = useActiveUserData();
  const { getAllStaff, staffList, pagination, isLoading } = useCRUDStaff();
  const nav = useNavigate();

  // Load initial data
  useEffect(() => {
    refetch();
    loadStaffData();
  }, []);

  // Load data when pagination or filters change (search is now client-side)
  useEffect(() => {
    loadStaffData();
  }, [currentPage, pageSize, filterType, filterValue]);

  const loadStaffData = () => {
    getAllStaff({
      pageNumber: currentPage,
      pageSize: pageSize,
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

  // Handle imported staff data
  const handleDataImported = (importedData: { [type: string]: { [key: string]: string }[] }) => {
    // Extract staff data from the imported data
    const staffData = importedData['STAFF'] || [];
    message.success(`Successfully imported ${staffData.length} staff members`);
    // TODO: Implement actual staff import logic
    // Refresh the staff list
    getAllStaff({ pageNumber: currentPage, pageSize, filterValue: searchQuery });
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
  const handleRowClick = (data: StaffProfileData) => {
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
    { title: 'Name', key: 'name', width: 150, render: (_: any, record: StaffProfileData) => `${record.firstName} ${record.lastName}` },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: 'Address', dataIndex: 'address', key: 'address', width: 200 },
    { title: 'Campus', dataIndex: 'campus', key: 'campus', width: 120 },
    { title: 'Added', key: 'added', width: 100, render: (_: any, record: StaffProfileData) => record.startWorkAt ? new Date(record.startWorkAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '' },
  ];

  // Row selection for delete mode
  const rowSelection = isDeleteMode
    ? {
        selectedRowKeys: selectedStaffs.map(Number),
        onChange: (selectedRowKeys: React.Key[]) => {
          setSelectedStaffs(selectedRowKeys.map(String));
        },
        getCheckboxProps: (record: StaffProfileData) => ({
          name: String(record.id),
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
        <AccountCounter label="Academic Staff" staff={categorizedData?.staff} />
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.userInfo}>
            <h2>{isDeleteMode ? 'Delete Staff Account' : 'List Of Staff On the System'}</h2>
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
                {['Add New Account', 'Delete Account', 'Import Data From xlsx'].map((action, index) => (
                  <motion.div
                    key={index}
                    className={`${styles.actionButton} ${action === 'Delete Account' ? styles.deleteButton : ''}`}
                    whileHover={{ scale: isDeleteMode ? 1 : 1.05 }}
                    onClick={
                      isDeleteMode
                        ? undefined
                        : action === 'Add New Account'
                        ? handleAddNewAccount
                        : action === 'Import Data From xlsx'
                        ? handleImport
                        : action === 'Delete Account'
                        ? handleDeleteModeToggle
                        : undefined
                    }
                  >
                    {action === 'Import Data From xlsx' ? (
                      <ExcelImportButton style={{ width: '100%' }}>
                        {action}
                      </ExcelImportButton>
                    ) : (
                      <div className={`${styles.buttonContent} ${isDeleteMode ? styles.disabledButton : ''}`}>
                        {action}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            {/* External Table display with server-side pagination and client-side search */}
            <DataTable
              columns={columns}
              data={staffList}
              rowSelection={rowSelection}
              pagination={pagination}
              onPageChange={handlePageChange}
              onRow={(record: StaffProfileData) => ({
                onClick: () => handleRowClick(record),
              })}
              loading={isLoading}
              searchQuery={searchQuery}
              searchFields={['id', 'firstName', 'lastName', 'email']}
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
            onClose={() => setIsImportOpen(false)} 
            onDataImported={handleDataImported}
            supportedTypes={['STAFF']}
          />
        )}
      </div>
    </ConfigProvider>
  );
};

export default StaffList;