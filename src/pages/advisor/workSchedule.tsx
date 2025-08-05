import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Button, message } from 'antd';
import { CalendarOutlined,PlusOutlined } from '@ant-design/icons';
import AddWorkSchedule from '../../components/advisor/addWorkSchedule';
import EditWorkSchedule from '../../components/advisor/editWorkSchedule';
import { 
  useBookingAvailability,
  useDeleteBookingAvailability
} from '../../hooks/useCRUDAdvisor';
import { BookingAvailability } from '../../interfaces/IBookingAvailability';
import styles from '../../css/advisor/workSchedule.module.css';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import AdvisorCalendar from '../../components/advisor/advisorCalendar';
import dayjs, { Dayjs } from 'dayjs';
import ViewWorkScheduleModal from '../../components/advisor/viewWorkScheduleModal';
import { dayOptions } from '../../interfaces/IDayOptions';

const { Title, Text } = Typography;

const WorkSchedule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf('week')); // Always start with current week
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewScheduleId, setViewScheduleId] = useState<number | null>(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{ date: Dayjs; start: Dayjs; end: Dayjs } | null>(null);
  
  const effectivePageSize = 10000; // Lấy hết data

  const {
    allSortedData,
    refetch: refetchBookingAvailability
  } = useBookingAvailability(effectivePageSize);

  useEffect(() => {
    refetchBookingAvailability();
  }, [refetchBookingAvailability]);

  const deleteBookingAvailability = useDeleteBookingAvailability();
  const dataToUse = allSortedData;
  const safeDataToUse = Array.isArray(dataToUse) ? dataToUse : [];

 

  const handleAddSuccess = () => {
    setIsAddModalVisible(false);
    message.success('Work schedule added successfully!');
  };

  const handleEditSchedule = (record: BookingAvailability) => {
    setSelectedScheduleId(record.id);
    setIsEditModalVisible(true);
  };

  const handleDeleteSchedule = async (id: number) => {
    try {
      await deleteBookingAvailability.mutateAsync(id);
      message.success('Schedule deleted successfully!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      const errorMessage = getUserFriendlyErrorMessage(error);
      message.error(errorMessage);
    }
  };

  const getDayName = (dayInWeek: number): string => {
    return dayOptions.find(day => day.value === dayInWeek)?.label || 'Unknown';
  };

  const formatTime = (time: string): string => {
    return time.substring(0, 5); 
  };

  const getDayColor = (dayInWeek: number): string => {
    const colors = {
      1: 'magenta', 
      2: 'blue',    
      3: 'green',   
      4: 'orange',  
      5: 'purple',  
      6: 'red',     
      7: 'cyan'     
    };
    return colors[dayInWeek as keyof typeof colors] || 'default';
  };
  const searchFields = ['id', 'dayInWeek', 'startTime', 'endTime', 'staffProfileId'];
  const customSearchFilter = (data: BookingAvailability[], searchQuery: string) => {
    if (!searchQuery || searchQuery.trim() === '') {
      return data;
    }
    const query = searchQuery.toLowerCase();
    return data.filter(item => {
      const dayName = getDayName(item.dayInWeek).toLowerCase();
      if (dayName.includes(query)) {
        return true;
      }
      return searchFields.some(field => {
        const value = item[field as keyof BookingAvailability];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  };
  const filteredSchedules = safeDataToUse;
  const calendarEvents = filteredSchedules.map(item => {
    const dayOffset = item.dayInWeek === 1 ? 0 : item.dayInWeek - 1; 
    const today = dayjs().startOf('week');
    const day = today.add(dayOffset, 'day');
    const event = {
      id: item.id,
      startDateTime: day.format('YYYY-MM-DD') + 'T' + item.startTime,
      endDateTime: day.format('YYYY-MM-DD') + 'T' + item.endTime,
      type: 'work' as const,
      note: '',
    };
    return event;
  });
  return (
    <div className={styles.workScheduleContainer}>
      <Card className={styles.headerCard}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2} className={styles.pageTitle}>
              <CalendarOutlined /> Work Schedule
            </Title>
            <Text type="secondary">
              Manage and view your work schedule and availability
            </Text>
          </div>
          
          <div className={styles.statsRow}>
            <Card size="small" className={styles.statCard}>
              <Space direction="vertical" align="center">
                <Text strong>{safeDataToUse.length}</Text>
                <Text type="secondary">Total Schedules</Text>
              </Space>
            </Card>
            <Card size="small" className={styles.statCard}>
              <Space direction="vertical" align="center">
                <Text strong>
                  {new Set(safeDataToUse.map(item => item.dayInWeek)).size}
                </Text>
                <Text type="secondary">Working Days</Text>
              </Space>
            </Card>
            <Card size="small" className={styles.statCard}>
              <Space direction="vertical" align="center">
                <Text strong>
                  {safeDataToUse.reduce((total, item) => {
                    const start = new Date(`2000-01-01T${item.startTime}`);
                    const end = new Date(`2000-01-01T${item.endTime}`);
                    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  }, 0).toFixed(1)}h
                </Text>
                <Text type="secondary">Total Hours</Text>
              </Space>
            </Card>
            <Card size="small" className={styles.addButtonCard}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalVisible(true)}
                className={styles.addButton}
              >
                Add Schedule
              </Button>
            </Card>
          </div>
        </Space>
      </Card>
      <AdvisorCalendar
        events={calendarEvents}
        viewMode={'week'}
        selectedDate={selectedDate}
        onViewModeChange={() => {}}
        onDateChange={() => {}} 
        isWorkSchedule={true} 
        onSlotClick={(slot, date) => {
          setSelectedSlotInfo({ date, start: slot.start, end: slot.end });
          setIsAddModalVisible(true);
          setSelectedDate(date);
        }}
        onEdit={event => {
          setSelectedScheduleId(Number(event.id));
          setIsEditModalVisible(true);
        }}
        onDelete={async (event) => {
          try {
            await deleteBookingAvailability.mutateAsync(Number(event.id));
            message.success('Work schedule deleted successfully!');
          } catch (error) {
            message.error('Failed to delete work schedule.');
          }
        }}
      />
      <AddWorkSchedule
        visible={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          setSelectedSlotInfo(null);
        }}
        onSuccess={handleAddSuccess}
        selectedSlotInfo={selectedSlotInfo}
      />
      <EditWorkSchedule
        visible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedScheduleId(null);
        }}
        onSuccess={handleAddSuccess}
        scheduleId={selectedScheduleId}
      />
      <ViewWorkScheduleModal
        visible={isViewModalVisible}
        onCancel={() => { setIsViewModalVisible(false); setViewScheduleId(null); }}
        scheduleId={viewScheduleId}
        onEdit={id => {
          setIsViewModalVisible(false);
          setSelectedScheduleId(id);
          setIsEditModalVisible(true);
        }}
        onDeleted={() => {
          setIsViewModalVisible(false);
          setViewScheduleId(null);
        }}
      />
    </div>
  );
};

export default WorkSchedule;
