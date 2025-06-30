import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, Input, Select, Table, Modal } from 'antd';
import { useNavigate } from 'react-router';
import styles from '../../css/admin/students.module.css';
import { managers } from '../../../data/mockManager';
import DataImport from '../../components/common/dataImport';
import AccountCounter from '../../components/admin/accountCounter';
import DataTable from '../../components/common/dataTable';
import useActiveUserData from '../../hooks/useActiveUserData';

const { Option } = Select;

interface Manager {
  Id: string;
  Email: string;
  Name: string;
  PhoneNumber: string;
  Address: string;
  Campus: string;
  AddDated: string;
}

const ManagerList: React.FC = () => {
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
    const { categorizedData, refetch } = useActiveUserData();
  const managersPerPage = 10;
  const nav = useNavigate();
  useEffect(()=>{
    refetch()
  },[])
  // Filtering logic - only applied to the displayed managers
  const filteredManagers = managers.filter(manager => {
    const matchesSearch = manager.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          manager.Id.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;

    if (filterType === 'major') {
      matchesFilter = manager.Id.startsWith(filterValue);
    } else if (filterType === 'campus') {
      matchesFilter = manager.Campus === filterValue;
    } else if (filterType === 'date') {
      matchesFilter = manager.AddDated === filterValue;
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

  const handleDataImported = (data: { [key: string]: string }[]) => {
    console.log('Imported manager data:', data);
    // Here you would typically send the data to your API
    setIsImportOpen(false);
    // Optionally refresh the data
    refetch();
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setFilterValue('');
  };

  const handleFilterValueChange = (value: string) => {
    setFilterValue(value);
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
        selectedManagers.forEach(id => {
          const index = managers.findIndex(manager => manager.Id === id);
          if (index !== -1) managers.splice(index, 1);
        });
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
  const handleRowClick = (data: Manager) => {
    if (!isDeleteMode) {
      nav(`/admin/edit/manager/${data.Id}`);
    }
  };

  // navigating to create page for adding new manager
  const handleAddNewAccount = () => {
    nav('/admin/edit/manager');
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
        selectedRowKeys: selectedManagers,
        onChange: (selectedRowKeys: React.Key[]) => {
          setSelectedManagers(selectedRowKeys as string[]);
        },
        getCheckboxProps: (record: Manager) => ({
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
        <AccountCounter label="Manager" manager={categorizedData?.manager} />
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.userInfo}>
            <h2>{isDeleteMode ? 'Delete Manager Account' : 'List Of Managers On the System'}</h2>
            <div className={styles.controlBar}>
              <div className={styles.searchBar}>
                <Input
                  placeholder="Search Name or Id..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
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
                    {[...new Set(managers.map(m => m.AddDated))].sort().map(date => (
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
            {/* External Table display, pre-styling and ease-to-custom */}
            <DataTable
              columns={columns}
              data={filteredManagers}
              rowSelection={rowSelection}
              dataPerPage={managersPerPage}
              onRow={(record: Manager) => ({
                onClick: () => handleRowClick(record),
              })}
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
