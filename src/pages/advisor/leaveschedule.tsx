import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, message, Tag, Segmented } from 'antd';
import { CalendarOutlined, PlusOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import SearchBar from '../../components/common/searchBar';
import DataTable from '../../components/common/dataTable';
import { useLeaveScheduleList, useCreateLeaveSchedule, useUpdateLeaveSchedule, useDeleteLeaveSchedule } from '../../hooks/useCRUDLeaveSchedule';
import { LeaveSchedule } from '../../interfaces/ILeaveSchedule';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import dayjs, { Dayjs } from 'dayjs';

import styles from '../../css/advisor/workSchedule.module.css';
import AddLeaveScheduleModal from '../../components/advisor/addLeaveScheduleModal';
import EditLeaveScheduleModal from '../../components/advisor/editLeaveScheduleModal';
import ViewLeaveScheduleModal from '../../components/advisor/viewLeaveScheduleModal';
import HistoryCalendarView from '../../components/student/historyCalendarView';
import AdvisorCalendar, { AdvisorCalendarEvent } from '../../components/advisor/advisorCalendar';


const { Title, Text } = Typography;

const LeaveSchedulePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isBulkAddModalVisible, setIsBulkAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewLeaveId, setViewLeaveId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{ date: Dayjs; start: Dayjs; end: Dayjs } | null>(null);

  // Tính toán pageSize dựa trên viewMode
  const effectivePageSize = viewMode === 'week' ? 50 : 10; // Week view = hết data, Day view = 10

  const { data, isLoading, error } = useLeaveScheduleList(currentPage, effectivePageSize);
  const leaveList = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Refetch when viewMode changes
  useEffect(() => {
    // React Query will automatically refetch when queryKey changes (pageSize changes)
  }, [viewMode]);

  // Modal handlers
  const handleAddSuccess = () => {
    setIsAddModalVisible(false);
    message.success('Leave schedule added successfully!');
  };
  const handleBulkAddSuccess = () => {
    setIsBulkAddModalVisible(false);
    message.success('Bulk leave schedules added successfully!');
  };
  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setSelectedLeaveId(null);
    message.success('Leave schedule updated successfully!');
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center' as const,
      render: (_: number, __: LeaveSchedule, index: number) => <Text strong>{index + 1 + (currentPage - 1) * pageSize}</Text>,
    },
    {
      title: 'Start Time',
      dataIndex: 'startDateTime',
      key: 'startDateTime',
      width: 180,
      align: 'center' as const,
      render: (value: string) => (
        <Text>{dayjs.utc(value).format('YYYY-MM-DD HH:mm')}</Text>
      ),
    },
    {
      title: 'End Time',
      dataIndex: 'endDateTime',
      key: 'endDateTime',
      width: 180,
      align: 'center' as const,
      render: (value: string) => (
        <Text>{dayjs.utc(value).format('YYYY-MM-DD HH:mm')}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      align: 'center' as const,
      render: (_: any, record: LeaveSchedule) => (
        <Space>
          <Button size="small" onClick={() => { setViewLeaveId(record.id); setIsViewModalVisible(true); }}>View</Button>
          <Button size="small" onClick={() => { setSelectedLeaveId(record.id); setIsEditModalVisible(true); }}>Edit</Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  // Delete logic
  const deleteLeaveSchedule = useDeleteLeaveSchedule();
  const handleDelete = async (id: number) => {
    try {
      await deleteLeaveSchedule.mutateAsync(id);
      message.success('Leave schedule deleted successfully!');
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      message.error(errorMessage);
    }
  };

  // Search logic - Fix filtering for day and week views
  const filteredLeaves = viewMode === 'day'
    ? leaveList.filter(l => {
        const leaveStart = dayjs(l.startDateTime);
        const leaveEnd = dayjs(l.endDateTime);
        const selectedDayStart = selectedDate.startOf('day');
        const selectedDayEnd = selectedDate.endOf('day');
        
        // Check if leave overlaps with the selected day
        const overlaps = (leaveStart.isBefore(selectedDayEnd) && leaveEnd.isAfter(selectedDayStart));
        console.log(`Day view filter - Leave: ${leaveStart.format('YYYY-MM-DD HH:mm')} to ${leaveEnd.format('YYYY-MM-DD HH:mm')}, Selected: ${selectedDayStart.format('YYYY-MM-DD')}, Overlaps: ${overlaps}`);
        return overlaps;
      })
    : viewMode === 'week'
    ? leaveList.filter(l => {
        const leaveStart = dayjs(l.startDateTime);
        const leaveEnd = dayjs(l.endDateTime);
        const weekStart = selectedDate.startOf('week');
        const weekEnd = selectedDate.endOf('week');
        
        // Check if leave overlaps with the selected week
        const overlaps = (leaveStart.isBefore(weekEnd) && leaveEnd.isAfter(weekStart));
        console.log(`Week view filter - Leave: ${leaveStart.format('YYYY-MM-DD HH:mm')} to ${leaveEnd.format('YYYY-MM-DD HH:mm')}, Week: ${weekStart.format('YYYY-MM-DD')} to ${weekEnd.format('YYYY-MM-DD')}, Overlaps: ${overlaps}`);
        return overlaps;
      })
    : leaveList; // Show all for other views

  // Debug logging
  console.log('=== LEAVE SCHEDULE DEBUG ===');
  console.log('Total leave data:', leaveList.length);
  console.log('View mode:', viewMode);
  console.log('Selected date:', selectedDate.format('YYYY-MM-DD'));
  console.log('Filtered leaves count:', filteredLeaves.length);
  console.log('=== END DEBUG ===');

  return (
    <div className={styles.workScheduleContainer}>
      <Card className={styles.headerCard}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2} className={styles.pageTitle}>
              <CalendarOutlined /> Leave Schedule
            </Title>
            <Text type="secondary">Manage your leave periods</Text>
          </div>
          <div className={styles.statsRow}>
            <Card size="small" className={styles.statCard}>
              <Space direction="vertical" align="center">
                <Text strong>{totalCount}</Text>
                <Text type="secondary">Total Leaves</Text>
              </Space>
            </Card>
            <Card size="small" className={styles.addButtonCard}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalVisible(true)}
                  className={styles.addButton}
                >
                  Add Leave
                </Button>
          
              </Space>
            </Card>
          </div>
        </Space>
      </Card>
      <AdvisorCalendar
        events={filteredLeaves.map(l => ({
          id: l.id,
          startDateTime: l.startDateTime,
          endDateTime: l.endDateTime,
          type: 'leave',
          note: l.note || '',
        }))}
        viewMode={viewMode}
        selectedDate={selectedDate}
        onViewModeChange={setViewMode}
        onDateChange={setSelectedDate}
        isWorkSchedule={false} // Mark as leave schedule (default behavior)
        onSlotClick={(slot, date) => {
          setSelectedSlotInfo({ date, start: slot.start, end: slot.end });
          setIsAddModalVisible(true);
          setSelectedDate(date);
        }}
        onEdit={event => {
          console.log('=== CALENDAR EDIT DEBUG ===');
          console.log('Event clicked for edit:', event);
          console.log('Event ID:', event.id);
          console.log('Event startDateTime:', event.startDateTime);
          console.log('Event endDateTime:', event.endDateTime);
          console.log('Event type:', event.type);
          console.log('=== END CALENDAR DEBUG ===');
          
          const leaveId = typeof event.id === 'string' ? parseInt(event.id) : event.id;
          setSelectedLeaveId(leaveId);
          setIsEditModalVisible(true);
        }}
        onDelete={async (event) => {
          try {
            await deleteLeaveSchedule.mutateAsync(Number(event.id));
            message.success('Leave deleted successfully!');
          } catch (error) {
            message.error('Failed to delete leave.');
          }
        }}
      />
      <AddLeaveScheduleModal
        visible={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          setSelectedSlotInfo(null);
        }}
        onSuccess={handleAddSuccess}
        selectedSlotInfo={selectedSlotInfo}
      />
  
      <EditLeaveScheduleModal
        visible={isEditModalVisible}
        onCancel={() => { setIsEditModalVisible(false); setSelectedLeaveId(null); }}
        onSuccess={handleEditSuccess}
        leaveId={selectedLeaveId}
      />
      <ViewLeaveScheduleModal
        visible={isViewModalVisible}
        onCancel={() => { setIsViewModalVisible(false); setViewLeaveId(null); }}
        leaveId={viewLeaveId}
        onEdit={id => {
          setIsViewModalVisible(false);
          setSelectedLeaveId(id);
          setIsEditModalVisible(true);
        }}
        onDeleted={() => {
          setIsViewModalVisible(false);
          setViewLeaveId(null);
          // reload lại lịch nếu cần (có thể gọi lại API hoặc refetch)
        }}
      />
    </div>
  );
};

export default LeaveSchedulePage; 