import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, Input, Select, Table, Modal } from 'antd';
import { useNavigate } from 'react-router';
import styles from '../../css/admin/students.module.css';
import DataImport from '../../components/common/dataImport';
import AccountCounter from '../../components/admin/accountCounter';
import DataTable from '../../components/common/dataTable';
import useActiveUserData from '../../hooks/useActiveUserData';
import useCRUDManager from '../../hooks/useCRUDManager';
import { ManagerBase } from '../../interfaces/IManager';

const { Option } = Select;

const ManagerList: React.FC = () => {
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  const { categorizedData, refetch } = useActiveUserData();
  const { getAllManager, managerList, pagination, isLoading } = useCRUDManager();
  const nav = useNavigate();

  // Load initial data
  useEffect(() => {
    refetch();
    loadManagerData();
  }, []);

  // Load data when pagination or filters change (search is now client-side)
  useEffect(() => {
    loadManagerData();
  }, [currentPage, pageSize, filterType, filterValue]);

  const loadManagerData = () => {
    getAllManager({
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

  const handleDataImported = (data: { [key: string]: string }[]) => {
    console.log('Imported manager data:', data);
    setIsImportOpen(false);
    
    // Refresh the manager list
    refetch();
    loadManagerData();
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
    setSelectedManagers([]);
  };

  const handleConfirmDelete = () => {
    Modal.confirm({
      title: `Confirm Deletion`,
      content: `Are you sure you want to delete ${selectedManagers.length} manager account(s)?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // Here you would typically call the API to delete the selected managers
        // For now, we'll just refresh the data
        loadManagerData();
        setSelectedManagers([]);
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
    setSelectedManagers([]);
  };

  // Redirect to edit page when a manager row is clicked
  const handleRowClick = (data: ManagerBase) => {
    if (!isDeleteMode) {
      nav(`/admin/edit/manager/${data.id}`);
    }
  };

  // navigating to create page for adding new manager
  const handleAddNewAccount = () => {
    nav('/admin/edit/manager');
  };

  // Table columns
  const columns = [
    { title: 'Id', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
    { title: 'Name', key: 'name', width: 150, render: (_: any, record: ManagerBase) => `${record.firstName} ${record.lastName}` },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: 'Address', dataIndex: 'address', key: 'address', width: 200 },
    { title: 'Department', dataIndex: 'department', key: 'department', width: 150 },
    { title: 'Position', dataIndex: 'position', key: 'position', width: 120 },
    { title: 'Start Date', key: 'startDate', width: 120, render: (_: any, record: ManagerBase) => record.startWorkAt ? new Date(record.startWorkAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '' },
  ];

  // Row selection for delete mode
  const rowSelection = isDeleteMode
    ? {
        selectedRowKeys: selectedManagers.map(Number),
        onChange: (selectedRowKeys: React.Key[]) => {
          setSelectedManagers(selectedRowKeys.map(String));
        },
        getCheckboxProps: (record: ManagerBase) => ({
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
        <AccountCounter label="Manager" manager={categorizedData?.manager} />
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.userInfo}>
            <h2>{isDeleteMode ? 'Delete Manager Account' : 'List Of Managers On the System'}</h2>
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
                    {[...new Set(managerList.map(m => m.startWorkAt))].sort().map(date => (
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
                        : action === 'Add New Account'
                        ? handleAddNewAccount
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
            {/* External Table display with server-side pagination and client-side search */}
            <DataTable
              columns={columns}
              data={managerList}
              rowSelection={rowSelection}
              pagination={pagination}
              onPageChange={handlePageChange}
              onRow={(record: ManagerBase) => ({
                onClick: () => handleRowClick(record),
              })}
              loading={isLoading}
              searchQuery={searchQuery}
              searchFields={['id', 'firstName', 'lastName', 'email', 'department', 'position']}
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
                  disabled={selectedManagers.length === 0}
                >
                  Delete
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
        {isImportOpen && (
          <div className={styles.modalOverlay}>
            <DataImport 
              onClose={() => setIsImportOpen(false)} 
              onDataImported={handleDataImported}
              headerConfig="STAFF"
              allowMultipleRows={true}
              dataType="manager"
            />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default ManagerList;
