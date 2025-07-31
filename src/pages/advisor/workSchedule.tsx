import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Tag, Button, message } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import AddWorkSchedule from '../../components/advisor/addWorkSchedule';
import EditWorkSchedule from '../../components/advisor/editWorkSchedule';
import { 
  useBookingAvailability,
  useUpdateBookingAvailability,
  useDeleteBookingAvailability
} from '../../hooks/useCRUDAdvisor';
import { BookingAvailability } from '../../interfaces/IBookingAvailability';
import styles from '../../css/advisor/workSchedule.module.css';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import AdvisorCalendar, { AdvisorCalendarEvent } from '../../components/advisor/advisorCalendar';
import dayjs, { Dayjs } from 'dayjs';
import ViewWorkScheduleModal from '../../components/advisor/viewWorkScheduleModal';
import { dayOptions } from '../../interfaces/IDayOptions';

const { Title, Text } = Typography;

const WorkSchedule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf('week')); // Always start with current week
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewScheduleId, setViewScheduleId] = useState<number | null>(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{ date: Dayjs; start: Dayjs; end: Dayjs } | null>(null);
  
  // Tính toán pageSize dựa trên viewMode cho work schedule
  const effectivePageSize = 10000; // Lấy hết data

  const {
    getAllBookingAvailability,
    bookingAvailabilityList,
    allSortedData,
    pagination,
    isLoading,
    handlePageChange,
    refetch: refetchBookingAvailability
  } = useBookingAvailability(effectivePageSize);

  useEffect(() => {
    // Force refetch to get all data
    refetchBookingAvailability();
  }, [refetchBookingAvailability]);

  const updateBookingAvailability = useUpdateBookingAvailability();
  const deleteBookingAvailability = useDeleteBookingAvailability();

  // Use full data for work schedule since we only show week view
  const dataToUse = allSortedData;
  
  // Ensure dataToUse is always an array
  const safeDataToUse = Array.isArray(dataToUse) ? dataToUse : [];

  // Debug logging to check data
  console.log('=== WORK SCHEDULE DEBUG ===');
  console.log('All sorted data:', allSortedData);
  console.log('Booking availability list:', bookingAvailabilityList);
  console.log('Data to use:', safeDataToUse);
  console.log('Data count:', safeDataToUse.length);
  console.log('=== END DEBUG ===');


 

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
      // If no error is thrown, consider it successful
      message.success('Schedule deleted successfully!');
      // Refresh data after deletion
      // getAllBookingAvailability(); // Removed as per edit hint
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
    return time.substring(0, 5); // Remove seconds, keep HH:MM format
  };

  const getDayColor = (dayInWeek: number): string => {
    const colors = {
      1: 'magenta', // Sunday
      2: 'blue',    // Monday
      3: 'green',   // Tuesday
      4: 'orange',  // Wednesday
      5: 'purple',  // Thursday
      6: 'red',     // Friday
      7: 'cyan'     // Saturday
    };
    return colors[dayInWeek as keyof typeof colors] || 'default';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center' as const,
      render: (value: number, record: BookingAvailability, index: number) => (
        <Text strong>{index + 1}</Text>),
      sorter: false
    },
    {
      title: 'Day of Week',
      dataIndex: 'dayInWeek',
      key: 'dayInWeek',
      width: 120,
      align: 'center' as const,
      render: (value: number) => (
        <Tag color={getDayColor(value)} icon={<CalendarOutlined />}>
          {getDayName(value)}
        </Tag>
      ),
      sorter: (a: BookingAvailability, b: BookingAvailability) => {
        // dayInWeek: 1=Sunday, 2=Monday, ..., 7=Saturday
        const dayA = a.dayInWeek === 1 ? 8 : a.dayInWeek; // Convert Sunday from 1 to 8 for proper sorting
        const dayB = b.dayInWeek === 1 ? 8 : b.dayInWeek;
        return dayA - dayB;
      },
      defaultSortOrder: 'ascend' as const
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      align: 'center' as const,
      render: (value: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{formatTime(value)}</Text>
        </Space>
      ),
      sorter: (a: BookingAvailability, b: BookingAvailability) => {
        const timeAValue = parseInt(a.startTime.replace(':', ''));
        const timeBValue = parseInt(b.startTime.replace(':', ''));
        return timeAValue - timeBValue;
      }
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
      align: 'center' as const,
      render: (value: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{formatTime(value)}</Text>
        </Space>
      ),
      sorter: false
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: BookingAvailability) => {
        const start = new Date(`2000-01-01T${record.startTime}`);
        const end = new Date(`2000-01-01T${record.endTime}`);
        const diffMs = end.getTime() - start.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return (
          <Tag color="geekblue">
            {diffHours}h {diffMinutes}m
          </Tag>
        );
      },
      sorter: false
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: BookingAvailability) => (
        <Space>
          <Button 
            size="small"
            onClick={() => handleEditSchedule(record)}
          >
            Edit
          </Button>
          <Button 
            danger
            size="small"
            loading={deleteBookingAvailability.isPending}
            onClick={() => handleDeleteSchedule(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
      sorter: false
    }
  ];

  const searchFields = ['id', 'dayInWeek', 'startTime', 'endTime', 'staffProfileId'];

  // Custom search function to support day name search
  const customSearchFilter = (data: BookingAvailability[], searchQuery: string) => {
    if (!searchQuery || searchQuery.trim() === '') {
      return data;
    }

    const query = searchQuery.toLowerCase();
    return data.filter(item => {
      // Search by day name
      const dayName = getDayName(item.dayInWeek).toLowerCase();
      if (dayName.includes(query)) {
        return true;
      }

      // Search by other fields
      return searchFields.some(field => {
        const value = item[field as keyof BookingAvailability];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  };

  // Apply custom search filter
  const filteredData = customSearchFilter(safeDataToUse, searchQuery);

  // Use all data for calendar, no filtering by viewMode
  const filteredSchedules = safeDataToUse;

  // Debug logs for calendar events
  console.log('=== CALENDAR EVENTS DEBUG ===');
  console.log('All data count:', safeDataToUse.length);
  console.log('Filtered schedules:', filteredSchedules);
  console.log('Filtered schedules count:', filteredSchedules.length);
  
  const calendarEvents = filteredSchedules.map(item => {
    // Map dayInWeek: 1=Sunday, 2=Monday, ..., 7=Saturday
    const dayOffset = item.dayInWeek === 1 ? 0 : item.dayInWeek - 1; // Sunday = 0, Monday = 1, etc.
    const today = dayjs().startOf('week');
    const day = today.add(dayOffset, 'day');
    const event = {
      id: item.id,
      startDateTime: day.format('YYYY-MM-DD') + 'T' + item.startTime,
      endDateTime: day.format('YYYY-MM-DD') + 'T' + item.endTime,
      type: 'work' as const,
      note: '',
    };
    console.log(`Mapping item ${item.id}: dayInWeek=${item.dayInWeek}, dayOffset=${dayOffset}, day=${day.format('YYYY-MM-DD')}, start=${item.startTime}, end=${item.endTime}`);
    return event;
  });
  
  console.log('Calendar events:', calendarEvents);
  console.log('Calendar events count:', calendarEvents.length);
  console.log('=== END CALENDAR EVENTS DEBUG ===');

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
        // Disable view mode change
        onDateChange={() => {}} // Disable date change for work schedule
        isWorkSchedule={true} // Mark as work schedule
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
          // reload lại lịch nếu cần (có thể gọi lại API hoặc refetch)
        }}
      />
    </div>
  );
};

export default WorkSchedule;
