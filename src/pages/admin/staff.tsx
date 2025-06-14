
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../../css/admin/students.module.css';
import { students } from '../../../data/mockStudent';
import DataImport from '../../components/admin/dataImport';
import AccountCounter from '../../components/admin/accountCounter';

const StudentList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
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

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setFilterType(type);
    setFilterValue('');
  };

  const handleFilterValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterValue(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      <AccountCounter 
        label={"Student"}
        student={students}
      />
      <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
        <div className={styles.userInfo}>
          <h2>Student List</h2>
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
                {[...new Set(students.map(s => s.AddDated))].sort().map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            )}
          </div>
          <table className={styles.studentTable}>
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
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
              {currentStudents.map((student) => (
                <tr key={student.Id}>
                  <td><input type="checkbox" /></td>
                  <td>{student.Id}</td>
                  <td>{student.Email}</td>
                  <td>{student.Name}</td>
                  <td>{student.PhoneNumber}</td>
                  <td>{student.Address}</td>
                  <td>{student.Campus}</td>
                  <td>{student.AddDated}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.pagination}>
            <span>{currentStudents.length} of {filteredStudents.length} row(s) selected.</span>
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
        <div className={styles.actionTitle}>Admin functions:</div>
        <div className={styles.actions}>
          {['Add New Account', 'Delete Account', 'Import Data From xlsx'].map((action, index) => (
            <motion.div
              key={index}
              className={styles.actionButton}
              variants={actionPanelVariants}
              whileHover={{ scale: 1.05 }}
              onClick={action === 'Import Data From xlsx' ? handleImport : undefined}
            >
              <div className={styles.buttonContent}>{action}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      {isImportOpen && (
        <div className={styles.modalOverlay}>
          <DataImport onClose={() => setIsImportOpen(false)} onDataImported={handleDataImported} />
        </div>
      )}
    </div>
  );
};

export default StudentList;
