import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, Input, Select, Modal, message, Button } from 'antd';
import { EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import styles from '../../css/admin/students.module.css';
import BulkDataImport from '../../components/common/bulkDataImport';
import AccountCounter from '../../components/admin/accountCounter';
import DataTable from '../../components/common/dataTable';
import useActiveUserData from '../../hooks/useActiveUserData';
import useCRUDAdvisor from '../../hooks/useCRUDAdvisor';
import { AdvisorBase } from '../../interfaces/IAdvisor';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import * as XLSX from 'xlsx';
import { useAdminApi } from '../../hooks/useAdminApi';
import { AdminViewBooking } from '../../interfaces/IBookingAvailability';
import { showForExport, hideLoading } from '../../hooks/useLoading';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import MeetingDetailModal from '../../components/admin/meetingDetailModal';
import LeaveScheduleModal from '../../components/admin/leaveScheduleModal';


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
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  
  // Meeting Records State
  const [meetingPage, setMeetingPage] = useState<number>(1);
  const [meetingPageSize, setMeetingPageSize] = useState<number>(10);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
  
  // Modal state
  const [selectedMeeting, setSelectedMeeting] = useState<AdminViewBooking | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  
  // Leave schedule modal state
  const [leaveScheduleModalVisible, setLeaveScheduleModalVisible] = useState<boolean>(false);
  const [selectedStaffProfileId, setSelectedStaffProfileId] = useState<number | null>(null);
  const [selectedStaffName, setSelectedStaffName] = useState<string>('');

  const { categorizedData, refetch } = useActiveUserData();
  const { getAllAdvisor, advisorList, pagination, isLoading } = useCRUDAdvisor();
  const nav = useNavigate();
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { bulkRegisterAdvisors } = useAdminUsers();
  const { useAllMeetingRecordPaged } = useAdminApi();

  // Load initial data
  useEffect(() => {
    refetch();
    loadAdvisorData();
  }, []);

  // Load data when pagination or filters change (search is now handled separately)
  useEffect(() => {
    loadAdvisorData();
  }, [currentPage, pageSize, filterType, filterValue]);

  // Debounced search effect to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAdvisorData();
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch meeting records using hook
  const { data: meetingRecordsData, isLoading: meetingLoading } = useAllMeetingRecordPaged(meetingPage, meetingPageSize);
  const meetingRecords = meetingRecordsData?.items || [];
  const meetingTotal = meetingRecordsData?.totalCount || 0;



  // Handle view detail click
  const handleViewDetail = async (record: AdminViewBooking) => {
    setDetailLoading(true);
    setModalVisible(true);
    setSelectedMeeting(record); // Set the record directly for now
    setDetailLoading(false);
  };

  // Handle meeting deletion
  const handleMeetingDelete = () => {
    // Refresh the meeting records by triggering a refetch
    // The hook will automatically refetch when dependencies change
  };

  // Handle view leave schedule click
  const handleViewLeaveSchedule = (record: AdvisorBase) => {
    // Get the staff profile ID from the record
    const staffProfileId = record.staffDataDetailResponse ? record.id : null;
    setSelectedStaffProfileId(staffProfileId);
    setSelectedStaffName(`${record.firstName} ${record.lastName}`);
    setLeaveScheduleModalVisible(true);
  };

  const loadAdvisorData = () => {
    getAllAdvisor({
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

  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      setUploadStatus('uploading');
      setUploadMessage('Processing import...');
      // Extract advisor data from the imported data
      const advisorData = importedData['ADVISOR'] || [];
      if (advisorData.length === 0) {
        setUploadStatus('error');
        setUploadMessage('No advisor data found in the imported file');
        return;
      }
      // Transform the imported data to match BulkAccountPropsCreate interface
      const transformedData = advisorData.map(item => ({
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
      // Call the bulk registration API
      let response;
      try {
        response = await bulkRegisterAdvisors(transformedData);
      } catch (err) {
        setUploadStatus('error');
        setUploadMessage(err);
        handleError(err);
        return;
      }
      // Treat null/undefined (204 No Content) as success
      if (response !== null && response !== undefined || response === null) {
        setUploadStatus('success');
        setUploadMessage(`Successfully imported ${advisorData.length} advisors`);
        handleSuccess(`Successfully imported ${advisorData.length} advisors`);
        // Refresh the advisor list
        refetch();
        loadAdvisorData();
      } else {
        setUploadStatus('error');
        setUploadMessage('Failed to import advisors. Please try again.');
        handleError('Failed to import advisors. Please try again.');
      }
    } catch (error) {
      console.error('Import error:', error);
      setUploadStatus('error');
      setUploadMessage('An error occurred during import. Please check your data and try again.');
      handleError('An error occurred during import. Please check your data and try again.');
    }
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

  // Meeting Records Table Columns
  const meetingColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Start', dataIndex: 'startDateTime', key: 'startDateTime', width: 160, render: (val: string) => new Date(val).toLocaleString() },
    { title: 'End', dataIndex: 'endDateTime', key: 'endDateTime', width: 160, render: (val: string) => new Date(val).toLocaleString() },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, render: (val: number) => val === 0 ? 'Scheduled' : val === 1 ? 'Completed' : 'Cancelled' },
    { title: 'Issue', dataIndex: 'titleStudentIssue', key: 'titleStudentIssue', width: 200 },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (val: string) => new Date(val).toLocaleString() },
    { title: 'Advisor', key: 'advisor', width: 180, render: (_: any, rec: AdminViewBooking) => `${rec.staffFirstName} ${rec.staffLastName}` },
    { title: 'Advisor Email', dataIndex: 'staffEmail', key: 'staffEmail', width: 200 },
    { title: 'Student', key: 'student', width: 180, render: (_: any, rec: AdminViewBooking) => `${rec.studentFirstName} ${rec.studentLastName}` },
    { title: 'Student Email', dataIndex: 'studentEmail', key: 'studentEmail', width: 200 },
    {
      title: 'View Detail',
      key: 'viewDetail',
      width: 100,
      render: (_: any, record: AdminViewBooking) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
        >
          View
        </Button>
      ),
    },

  ];

  // Download meeting records as Excel
  const handleDownloadMeetingRecords = async () => {
    setDownloadLoading(true);
    showForExport('Exporting meeting records...');
    try {
      // Use the current meeting records data
      if (!meetingRecords.length) {
        hideLoading();
        return;
      }
      const dataToExport = meetingRecords.map(rec => ({
        ID: rec.id,
        'Start': new Date(rec.startDateTime).toLocaleString(),
        'End': new Date(rec.endDateTime).toLocaleString(),
        'Status': rec.status === 0 ? 'Scheduled' : rec.status === 1 ? 'Completed' : 'Cancelled',
        'Issue': rec.titleStudentIssue,
        'Created At': new Date(rec.createdAt).toLocaleString(),
        'Advisor': `${rec.staffFirstName} ${rec.staffLastName}`,
        'Advisor Email': rec.staffEmail,
        'Student': `${rec.studentFirstName} ${rec.studentLastName}`,
        'Student Email': rec.studentEmail,
      }));
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'MeetingRecords');
      XLSX.writeFile(wb, `MeetingRecords_All_${new Date().toISOString().split('T')[0]}.xlsx`);
      handleSuccess(`Successfully downloaded ${meetingRecords.length} meeting records`);
    } catch (error) {
      handleError('Failed to download meeting records');
      console.error('Download error:', error);
    } finally {
      setDownloadLoading(false);
      hideLoading();
    }
  };

  // Table columns
  const columns = [
    { title: 'Id', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
    { title: 'Name', key: 'name', width: 150, render: (_: any, record: AdvisorBase) => `${record.firstName} ${record.lastName}` },
    { title: 'Campus', key: 'campus', width: 120, render: (_: any, record: AdvisorBase) => record.staffDataDetailResponse?.campus || '' },
    { title: 'Department', key: 'department', width: 150, render: (_: any, record: AdvisorBase) => record.staffDataDetailResponse?.department || '' },
    { title: 'Position', key: 'position', width: 120, render: (_: any, record: AdvisorBase) => record.staffDataDetailResponse?.position || '' },
    { title: 'Added', key: 'added', width: 100, render: (_: any, record: AdvisorBase) => record.staffDataDetailResponse?.startWorkAt ? new Date(record.staffDataDetailResponse.startWorkAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '' },
    { title: 'Status', key: 'status', width: 100, render: (_: any, record: AdvisorBase) => (
      <span style={{
        display: 'inline-block',
        padding: '0 12px',
        borderRadius: '12px',
        color: '#fff',
        background: record.status === "ACTIVE" ? '#22c55e' : '#ef4444',
        fontWeight: 500
      }}>
        {record.status }
      </span>
    ) },
    {
      title: 'View Leave Schedule',
      key: 'viewLeaveSchedule',
      width: 150,
      render: (_: any, record: AdvisorBase) => (
        <Button
          type="default"
          icon={<CalendarOutlined />}
          size="small"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#d9d9d9',
            color: '#1890ff',
            fontWeight: '500',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '6px',
            padding: '4px 12px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1890ff';
            e.currentTarget.style.borderColor = '#1890ff';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#d9d9d9';
            e.currentTarget.style.color = '#1890ff';
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleViewLeaveSchedule(record);
          }}
        >
          View Leave
        </Button>
      ),
    },
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
        <AccountCounter label="Advisor" advisor={categorizedData?.advisor} />
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible"
        >
          <div className={styles.userInfo}>
            <b>{isDeleteMode ? 'Delete Advisor Account' : 'List Of Advisors On the System'}</b>
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
        {/* Meeting Records Section */}
        <motion.div 
          className={styles.profileCard} 
          variants={cardVariants} 
          initial="hidden" 
          animate="visible"
          style={{ 
            marginTop: '2rem',
            maxHeight: 'none',
            height: 'auto'
          }}
        >
          <div className={styles.userInfo}>
            <h2>Meeting Records</h2>
            <div className={styles.controlBar}>
              <div className={styles.searchBar}>
                {/* Search bar placeholder for future enhancement */}
              </div>
              <div className={styles.actions}>
                <motion.div
                  className={styles.actionButton}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleDownloadMeetingRecords}
                  style={{ cursor: downloadLoading ? 'not-allowed' : 'pointer' }}
                >
                  <div className={`${styles.buttonContent} ${downloadLoading ? styles.disabledButton : ''}`}>
                    {downloadLoading ? 'Downloading...' : 'Download All'}
                  </div>
                </motion.div>
              </div>
            </div>
            <DataTable
              columns={meetingColumns}
              data={meetingRecords}
              pagination={{
                current: meetingPage,
                pageSize: meetingPageSize,
                total: meetingTotal,
                totalPages: Math.ceil(meetingTotal / meetingPageSize),
              }}
              onPageChange={(page, size) => {
                setMeetingPage(page);
                setMeetingPageSize(size);
              }}
              loading={meetingLoading}
              rowSelection={undefined}
            />
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
            supportedTypes={['ADVISOR']}
            uploadStatus={uploadStatus}
            uploadMessage={uploadMessage}
          />
        )}
        
        {/* Meeting Detail Modal */}
        <MeetingDetailModal
          visible={modalVisible}
          meeting={selectedMeeting}
          onClose={() => setModalVisible(false)}
          onDelete={handleMeetingDelete}
          loading={detailLoading}
        />
        
        {/* Leave Schedule Modal */}
        <LeaveScheduleModal
          visible={leaveScheduleModalVisible}
          staffProfileId={selectedStaffProfileId}
          staffName={selectedStaffName}
          onClose={() => setLeaveScheduleModalVisible(false)}
        />
      </div>
    </ConfigProvider>
  );
};

export default AdvisorList;