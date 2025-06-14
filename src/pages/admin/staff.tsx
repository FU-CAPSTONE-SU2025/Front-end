import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from 'antd';
import styles from '../../css/admin/students.module.css';
import { staffs } from '../../../data/mockStaff';
import DataImport from '../../components/admin/dataImport';
import AccountCounter from '../../components/admin/accountCounter';

const StaffList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedStaffs, setSelectedStaffs] = useState<string[]>([]);
  const staffsPerPage = 10;

  // Filtering logic
  const filteredStaffs = staffs.filter(staff => {
    const matchesSearch = staff.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          staff.Id.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;

    if (filterType === 'major') {
      matchesFilter = staff.Id.startsWith(filterValue);
    } else if (filterType === 'campus') {
      matchesFilter = staff.Campus === filterValue;
    } else if (filterType === 'date') {
      matchesFilter = staff.AddDated === filterValue;
    }

    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const indexOfLastStaff = currentPage * staffsPerPage;
  const indexOfFirstStaff = indexOfLastStaff - staffsPerPage;
  const currentStaffs = filteredStaffs.slice(indexOfFirstStaff, indexOfLastStaff);
  const totalPages = Math.ceil(filteredStaffs.length / staffsPerPage);

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
    const newStaff = {
      Id: `${['SE', 'SS', 'CE'][Math.floor(Math.random() * 3)]}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      Email: data.email || '',
      Name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      PhoneNumber: data.phone || '',
      Address: data.address || '',
      Campus: ['HCMC Campus', 'Ha Noi Campus', 'Da Nang Campus'][Math.floor(Math.random() * 3)],
      AddDated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/'),
    };
    staffs.push(newStaff);
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
    setSelectedStaffs([]);
  };

  const handleStaffSelection = (staffId: string) => {
    if (selectedStaffs.includes(staffId)) {
      setSelectedStaffs(selectedStaffs.filter(id => id !== staffId));
    } else {
      setSelectedStaffs([...selectedStaffs, staffId]);
    }
  };

  const handleConfirmDelete = () => {
    Modal.confirm({
      title: `Confirm Deletion`,
      content: `Are you sure you want to delete ${selectedStaffs.length} staff account(s)?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        console.log('Deleting staffs:', selectedStaffs); // Debug log
        selectedStaffs.forEach(id => {
          const index = staffs.findIndex(staff => staff.Id === id);
          if (index !== -1) staffs.splice(index, 1);
        });
        setSelectedStaffs([]);
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
    setSelectedStaffs([]);
  };

  return (
    <div className={styles.container}>
      <AccountCounter 
        label={"Academic Staff"}
        staff={staffs}
      />
      <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
        <div className={styles.userInfo}>
          <h2>{isDeleteMode ? 'Delete Staff Account' : 'Staff List'}</h2>
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
                {[...new Set(staffs.map(s => s.AddDated))].sort().map(date => (
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
                    checked={selectedStaffs.length === currentStaffs.length && currentStaffs.length > 0}
                    onChange={() => {
                      if (selectedStaffs.length === currentStaffs.length) {
                        setSelectedStaffs([]);
                      } else {
                        setSelectedStaffs(currentStaffs.map(staff => staff.Id));
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
              {currentStaffs.map((staff) => (
                <tr key={staff.Id}>
                  <td className={isDeleteMode ? '' : styles.hidden}>
                    <input 
                      type="checkbox" 
                      checked={selectedStaffs.includes(staff.Id)}
                      onChange={() => handleStaffSelection(staff.Id)}
                    />
                  </td>
                  <td>{staff.Id}</td>
                  <td>{staff.Email}</td>
                  <td>{staff.Name}</td>
                  <td>{staff.PhoneNumber}</td>
                  <td>{staff.Address}</td>
                  <td>{staff.Campus}</td>
                  <td>{staff.AddDated}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.pagination}>
            <span>
              Showing {indexOfFirstStaff + 1} to {Math.min(indexOfLastStaff, filteredStaffs.length)} of {filteredStaffs.length} entries
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
            disabled={selectedStaffs.length === 0}
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

export default StaffList;