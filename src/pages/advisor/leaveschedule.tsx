import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, message, Tag, Segmented } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { useLeaveScheduleList, useDeleteLeaveSchedule } from '../../hooks/useCRUDLeaveSchedule';
import { useQueryClient } from '@tanstack/react-query';
import { LeaveSchedule } from '../../interfaces/ILeaveSchedule';
import dayjs, { Dayjs } from 'dayjs';
import styles from '../../css/advisor/workSchedule.module.css';
import AddLeaveScheduleModal from '../../components/advisor/addLeaveScheduleModal';
import EditLeaveScheduleModal from '../../components/advisor/editLeaveScheduleModal';
import ViewLeaveScheduleModal from '../../components/advisor/viewLeaveScheduleModal';
import AdvisorCalendar from '../../components/advisor/advisorCalendar';


const { Title, Text } = Typography;

const LeaveSchedulePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewLeaveId, setViewLeaveId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{ date: Dayjs; start: Dayjs; end: Dayjs } | null>(null);

  const effectivePageSize = viewMode === 'week' ? 100 : 50; // Increased page sizes to handle bulk operations
  
  const queryClient = useQueryClient();
  const { data, refetch } = useLeaveScheduleList(currentPage, effectivePageSize);
  const leaveList = data?.items || [];
  const totalCount = data?.totalCount || 0;

  useEffect(() => {
  }, [viewMode]);

  // Modal handlers
  const handleAddSuccess = async () => {
    setIsAddModalVisible(false);
    // Reset to first page to see newly created items
    setCurrentPage(1);
    // Invalidate all leave schedule queries to ensure fresh data
    await queryClient.invalidateQueries({ queryKey: ['leaveScheduleList'] });
    // Also refetch current query specifically
    await refetch();
    message.success('Leave schedule added successfully!');
  };
  const handleEditSuccess = async () => {
    setIsEditModalVisible(false);
    setSelectedLeaveId(null);
    // Invalidate all leave schedule queries to ensure fresh data
    await queryClient.invalidateQueries({ queryKey: ['leaveScheduleList'] });
    // Also refetch current query specifically
    await refetch();
    message.success('Leave schedule updated successfully!');
  };

  const deleteLeaveSchedule = useDeleteLeaveSchedule();
  const handleDelete = async (id: number) => {
    try {
      await deleteLeaveSchedule.mutateAsync(id);
      message.success('Leave schedule deleted successfully!');
    } catch (err) {
      message.error(err);
    }
  };
  const filteredLeaves = viewMode === 'day'
    ? leaveList.filter(l => {
        const leaveStart = dayjs(l.startDateTime);
        const leaveEnd = dayjs(l.endDateTime);
        const selectedDayStart = selectedDate.startOf('day');
        const selectedDayEnd = selectedDate.endOf('day');
        const overlaps = (leaveStart.isBefore(selectedDayEnd) && leaveEnd.isAfter(selectedDayStart));
        return overlaps;
      })
    : viewMode === 'week'
    ? leaveList.filter(l => {
        const leaveStart = dayjs(l.startDateTime);
        const leaveEnd = dayjs(l.endDateTime);
        const weekStart = selectedDate.startOf('week');
        const weekEnd = selectedDate.endOf('week');
        const overlaps = (leaveStart.isBefore(weekEnd) && leaveEnd.isAfter(weekStart));
        return overlaps;
      })
    : leaveList; 


  return (
    <div className={styles.workScheduleContainer}>
      <Card className={styles.headerCard}>
        <Space direction="vertical" size="large"  style={{ width: '100%' }}>
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
        isWorkSchedule={false} 
        onSlotClick={(slot, date) => {
          setSelectedSlotInfo({ date, start: slot.start, end: slot.end });
          setIsAddModalVisible(true);
          setSelectedDate(date);
        }}
        onEdit={event => {
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
        }}
      />
    </div>
  );
};

export default LeaveSchedulePage; 