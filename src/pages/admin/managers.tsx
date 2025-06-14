import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from 'antd';
import styles from '../../css/admin/students.module.css';
import { managers } from '../../../data/mockManager';
import DataImport from '../../components/admin/dataImport';
import AccountCounter from '../../components/admin/accountCounter';

const ManagerList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const managersPerPage = 10;

  // Filtering logic
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

  // Pagination logic
  const indexOfLastManager = currentPage * managersPerPage;
  const indexOfFirstManager = indexOfLastManager - managersPerPage;
  const currentManagers = filteredManagers.slice(indexOfFirstManager, indexOfLastManager);
  const totalPages = Math.ceil(filteredManagers.length / managersPerPage);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const actionPanelVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.2 } },
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleImport = () => {
    setIsImportOpen(true);
  };

  const handleDataImported = (data: { [key: string]: string }) => {
    const newManager = {
      Id: `${['SE', 'SS', 'CE'][Math.floor(Math.random() * 3)]}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      Email: data.email || '',
      Name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      PhoneNumber: data.phone || '',
      Address: data.address || '',
      Campus: ['HCMC Campus', 'Ha Noi Campus', 'Da Nang Campus'][Math.floor(Math.random() * 3)],
      AddDated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/'),
    };
    managers.push(newManager);
    setCurrentPage(1);
    setIsImportOpen(false);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setFilterType(type);
    setFilterValue('');
  };

  const handleFilterValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterValue(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteModeToggle = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedManagers([]);
  };

  const handleManagerSelection = (managerId: string) => {
    if (selectedManagers.includes(managerId)) {
      setSelectedManagers(selectedManagers.filter(id => id !== managerId));
    } else {
      setSelectedManagers([...selectedManagers, managerId]);
    }
  };

  const handleConfirmDelete = () => {
    Modal.confirm({
      title: `Confirm Deletion`,
      content: `Are you sure you want to delete ${selectedManagers.length} manager account(s)?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        console.log('Deleting managers:', selectedManagers); // Debug log
        selectedManagers.forEach(id => {
          const index = managers.findIndex(manager => manager.Id === id);
          if (index !== -1) managers.splice(index, 1);
        });
        setSelectedManagers([]);
        setIsDeleteMode(false);
        setCurrentPage(1);
      },
      onCancel: () => {
        console.log('Modal cancelled'); // Debug log
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

  return (
    <div className={styles.container}>
      <AccountCounter 
        label={"Manager"}
        manager={managers}
      />
      <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
        <div className={styles.userInfo}>
          <h2>{isDeleteMode ? 'Delete Manager Account' : 'Manager List'}</h2>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search Name or Id..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
            <select value={filterType} onChange={handleFilterChange}>
              <option value="">Filter</option>
              <option value="major">By Major</option>
              <option value="campus">By Campus</option>
              <option value="date">By Date</option>
            </select>
            {filterType === 'major' && (
              <select value={filterValue} onChange={handleFilterValueChange}>
                <option value="">Select Major</option>
                <option value="SE">SE</option>
                <option value="SS">SS</option>
                <option value="CE">CE</option>
              </select>
            )}
            {filterType === 'campus' && (
              <select value={filterValue} onChange={handleFilterValueChange}>
                <option value="">Select Campus</option>
                <option value="HCMC Campus">HCMC Campus</option>
                <option value="Ha Noi Campus">Ha Noi Campus</option>
                <option value="Da Nang Campus">Da Nang Campus</option>
              </select>
            )}
            {filterType === 'date' && (
              <select value={filterValue} onChange={handleFilterValueChange}>
                <option value="">Select Date</option>
                {[...new Set(managers.map(m => m.AddDated))].sort().map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            )}
          </div>
          <table className={styles.studentTable}>
            <thead>
              <tr>
                <th className={isDeleteMode ? '' : styles.hidden}>
                  <input 
                    type="checkbox" 
                    checked={selectedManagers.length === currentManagers.length && currentManagers.length > 0}
                    onChange={() => {
                      if (selectedManagers.length === currentManagers.length) {
                        setSelectedManagers([]);
                      } else {
                        setSelectedManagers(currentManagers.map(manager => manager.Id));
                      }
                    }}
                  />
                </th>
                <th>Id</th>
                <th>Email</th>
                <th>Name</th>
                <th>PhoneNumber</th>
                <th>Address</th>
                <th>Campus</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {currentManagers.map((manager) => (
                <tr key={manager.Id}>
                  <td className={isDeleteMode ? '' : styles.hidden}>
                    <input 
                      type="checkbox" 
                      checked={selectedManagers.includes(manager.Id)}
                      onChange={() => handleManagerSelection(manager.Id)}
                    />
                  </td>
                  <td>{manager.Id}</td>
                  <td>{manager.Email}</td>
                  <td>{manager.Name}</td>
                  <td>{manager.PhoneNumber}</td>
                  <td>{manager.Address}</td>
                  <td>{manager.Campus}</td>
                  <td>{manager.AddDated}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.pagination}>
            <span>
              Showing {indexOfFirstManager + 1} to {Math.min(indexOfLastManager, filteredManagers.length)} of {filteredManagers.length} entries
            </span>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
      <motion.div className={styles.actionPanel} variants={actionPanelVariants} initial="hidden" animate="visible">
        <div className={styles.actionTitle}>Action:</div>
        <div className={styles.actions}>
          {['Add New Account', 'Delete Account', 'Import Data From xlsx'].map((action, index) => (
            <motion.div
              key={index}
              className={`${styles.actionButton} ${action === 'Delete Account' ? styles.deleteButton : ''}`}
              variants={actionPanelVariants}
              whileHover={{ scale: isDeleteMode ? 1 : 1.05 }}
              onClick={
                isDeleteMode ? undefined :
                action === 'Import Data From xlsx' ? handleImport :
                action === 'Delete Account' ? handleDeleteModeToggle : undefined
              }
            >
              <div className={`${styles.buttonContent} ${isDeleteMode ? styles.disabledButton : ''}`}>
                {action}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
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
            onClick={() => {
              console.log('Delete button clicked'); // Debug log
              handleConfirmDelete();
            }}
            disabled={selectedManagers.length === 0}
          >
            Delete
          </motion.button>
        </motion.div>
      )}
      {isImportOpen && (
        <div className={styles.modalOverlay}>
          <DataImport onClose={() => setIsImportOpen(false)} onDataImported={handleDataImported} />
        </div>
      )}
    </div>
  );
};

export default ManagerList;