import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, Input, Select, Table, Modal } from 'antd';
import { useNavigate } from 'react-router';
import styles from '../../css/admin/students.module.css';
import DataImport from '../../components/common/dataImport';
import AccountCounter from '../../components/admin/accountCounter';
import DataTable from '../../components/common/dataTable';
import useActiveUserData from '../../hooks/useActiveUserData';
import useCRUDAdvisor from '../../hooks/useCRUDAdvisor';
import { AdvisorBase } from '../../interfaces/IAdvisor';

const { Option } = Select;

const AdvisorList: React.FC = () => {
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  const { categorizedData, refetch } = useActiveUserData();
  const { getAllAdvisor, advisorList, pagination, isLoading } = useCRUDAdvisor();
  const nav = useNavigate();

  // Load initial data
  useEffect(() => {
    refetch();
    loadAdvisorData();
  }, []);

  // Load data when pagination or filters change (search is now client-side)
  useEffect(() => {
    loadAdvisorData();
  }, [currentPage, pageSize, filterType, filterValue]);

  const loadAdvisorData = () => {
    getAllAdvisor({
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
    console.log('Imported advisor data:', data);
    setIsImportOpen(false);
    
    // Refresh the advisor list
    refetch();
    loadAdvisorData();
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
    setSelectedAdvisors([]);
  };

  const handleConfirmDelete = () => {
    Modal.confirm({
      title: `Confirm Deletion`,
      content: `Are you sure you want to delete ${selectedAdvisors.length} advisor account(s)?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // Here you would typically call the API to delete the selected advisors
        // For now, we'll just refresh the data
        loadAdvisorData();
        setSelectedAdvisors([]);
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
    setSelectedAdvisors([]);
  };

  // Redirect to edit page when an advisor row is clicked
  const handleRowClick = (data: AdvisorBase) => {
    if (!isDeleteMode) {
      nav(`/admin/edit/advisor/${data.id}`);
    }
  };

  // navigating to create page for adding new advisor
  const handleAddNewAccount = () => {
    nav('/admin/edit/advisor');
  };

  // Table columns
  const columns = [
    { title: 'Id', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
    { title: 'Name', key: 'name', width: 150, render: (_: any, record: AdvisorBase) => `${record.firstName} ${record.lastName}` },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: 'Address', dataIndex: 'address', key: 'address', width: 200 },
    { title: 'Specialization', dataIndex: 'specialization', key: 'specialization', width: 150 },
    { title: 'Experience', dataIndex: 'yearsOfExperience', key: 'yearsOfExperience', width: 100 },
  ];

  // Row selection for delete mode
  const rowSelection = isDeleteMode
    ? {
        selectedRowKeys: selectedAdvisors.map(Number),
        onChange: (selectedRowKeys: React.Key[]) => {
          setSelectedAdvisors(selectedRowKeys.map(String));
        },
        getCheckboxProps: (record: AdvisorBase) => ({
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
        <AccountCounter label="Advisor" advisor={categorizedData?.advisor} />
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.userInfo}>
            <h2>{isDeleteMode ? 'Delete Advisor Account' : 'List Of Advisors On the System'}</h2>
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
                  <Option value="specialization">By Specialization</Option>
                  <Option value="experience">By Experience</Option>
                </Select>
                {filterType === 'specialization' && (
                  <Select
                    value={filterValue}
                    onChange={handleFilterValueChange}
                    style={{ width: 120 }}
                    placeholder="Select Specialization"
                  >
                    <Option value="">Select Specialization</Option>
                    <Option value="Computer Science">Computer Science</Option>
                    <Option value="Software Engineering">Software Engineering</Option>
                    <Option value="Information Technology">Information Technology</Option>
                  </Select>
                )}
                {filterType === 'experience' && (
                  <Select
                    value={filterValue}
                    onChange={handleFilterValueChange}
                    style={{ width: 120 }}
                    placeholder="Select Experience"
                  >
                    <Option value="">Select Experience</Option>
                    <Option value="1-3">1-3 years</Option>
                    <Option value="4-7">4-7 years</Option>
                    <Option value="8+">8+ years</Option>
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
            {/* External Table display with server-side pagination */}
            <DataTable
              columns={columns}
              data={advisorList}
              rowSelection={rowSelection}
              pagination={pagination}
              onPageChange={handlePageChange}
              onRow={(record: AdvisorBase) => ({
                onClick: () => handleRowClick(record),
              })}
              loading={isLoading}
              searchQuery={searchQuery}
              searchFields={['id', 'firstName', 'lastName', 'email', 'specialization']}
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
                  disabled={selectedAdvisors.length === 0}
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
              headerConfig="ADVISOR"
              allowMultipleRows={true}
              dataType="advisor"
            />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default AdvisorList;