import React, { useState } from 'react';
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

  const { data, isLoading, error } = useLeaveScheduleList(currentPage, pageSize);
  const leaveList = data?.items || [];
  const totalCount = data?.totalCount || 0;
  console.log(data)
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
        <Text>{dayjs(value).format('YYYY-MM-DD HH:mm')}</Text>
      ),
    },
    {
      title: 'End Time',
      dataIndex: 'endDateTime',
      key: 'endDateTime',
      width: 180,
      align: 'center' as const,
      render: (value: string) => (
        <Text>{dayjs(value).format('YYYY-MM-DD HH:mm')}</Text>
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

  // Search logic
  const filteredList = searchQuery
    ? leaveList.filter(item =>
       
        item.id.toString().includes(searchQuery) ||
        item.startDateTime.includes(searchQuery) ||
        item.endDateTime.includes(searchQuery) ||
        (item.note && item.note.includes(searchQuery))
      )
    : leaveList;

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
        events={leaveList.map(l => ({
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
        onSlotClick={(_slot, date) => {
          setIsAddModalVisible(true);
          setSelectedDate(date);
        }}
        onEventClick={event => {
          setSelectedLeaveId(Number(event.id));
          setIsEditModalVisible(true);
        }}
      />
      <AddLeaveScheduleModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSuccess={handleAddSuccess}
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
      />
    </div>
  );
};

export default LeaveSchedulePage; 