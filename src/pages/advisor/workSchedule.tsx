import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Tag, Button, message } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import DataTable from '../../components/common/dataTable';
import SearchBar from '../../components/common/searchBar';
import AddWorkSchedule from '../../components/advisor/addWorkSchedule';
import EditWorkSchedule from '../../components/advisor/editWorkSchedule';
import { 
  useBookingAvailability,
  useUpdateBookingAvailability,
  useDeleteBookingAvailability
} from '../../hooks/useCRUDAdvisor';
import { BookingAvailability } from '../../interfaces/IBookingAvailability';
import styles from '../../css/advisor/workSchedule.module.css';

const { Title, Text } = Typography;

const WorkSchedule: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  
  const {
    getAllBookingAvailability,
    bookingAvailabilityList,
    pagination,
    isLoading,
    error
  } = useBookingAvailability();

  const updateBookingAvailability = useUpdateBookingAvailability();
  const deleteBookingAvailability = useDeleteBookingAvailability();

  useEffect(() => {
    getAllBookingAvailability({
      pageNumber: currentPage,
      pageSize: pageSize
    });
  }, [currentPage, pageSize, getAllBookingAvailability]);

  // Show error message if there's an error
  useEffect(() => {
    if (error) {
      message.error('Failed to load work schedule data. Please try again.');
    }
  }, [error]);

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleAddSuccess = () => {
    // Refresh the data after adding new schedule
    getAllBookingAvailability({
      pageNumber: currentPage,
      pageSize: pageSize
    });
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
      getAllBookingAvailability({
        pageNumber: currentPage,
        pageSize: pageSize
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      message.error('An error occurred while deleting the schedule.');
    }
  };

  const getDayName = (dayInWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayInWeek - 1] || 'Unknown';
  };

  const formatTime = (time: string): string => {
    return time.substring(0, 5); // Remove seconds, keep HH:MM format
  };

  const getDayColor = (dayInWeek: number): string => {
    const colors = {
      1: 'blue',    // Monday
      2: 'green',   // Tuesday
      3: 'orange',  // Wednesday
      4: 'purple',  // Thursday
      5: 'red',     // Friday
      6: 'cyan',    // Saturday
      7: 'magenta'  // Sunday
    };
    return colors[dayInWeek as keyof typeof colors] || 'default';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (value: number) => <Text strong>#{value}</Text>
    },
    {
      title: 'Day of Week',
      dataIndex: 'dayInWeek',
      key: 'dayInWeek',
      width: 120,
      render: (value: number) => (
        <Tag color={getDayColor(value)} icon={<CalendarOutlined />}>
          {getDayName(value)}
        </Tag>
      )
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      render: (value: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{formatTime(value)}</Text>
        </Space>
      )
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
      render: (value: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{formatTime(value)}</Text>
        </Space>
      )
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 120,
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
      }
    },
    {
      title: 'Staff Profile ID',
      dataIndex: 'staffProfileId',
      key: 'staffProfileId',
      width: 120,
      render: (value: number) => (
        <Space>
          <UserOutlined />
          <Text>{value}</Text>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: BookingAvailability) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => message.info(`Viewing details for schedule #${record.id}`)}
          >
            View
          </Button>
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
      )
    }
  ];

  const searchFields = ['id', 'dayInWeek', 'startTime', 'endTime', 'staffProfileId'];

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
                <Text strong>{bookingAvailabilityList.length}</Text>
                <Text type="secondary">Total Schedules</Text>
              </Space>
            </Card>
            <Card size="small" className={styles.statCard}>
              <Space direction="vertical" align="center">
                <Text strong>
                  {new Set(bookingAvailabilityList.map(item => item.dayInWeek)).size}
                </Text>
                <Text type="secondary">Working Days</Text>
              </Space>
            </Card>
            <Card size="small" className={styles.statCard}>
              <Space direction="vertical" align="center">
                <Text strong>
                  {bookingAvailabilityList.reduce((total, item) => {
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

      <Card className={styles.tableCard}>
        <div className={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search schedules by ID, day, time, or staff ID..."
            className={styles.searchBar}
          />
        </div>
        <DataTable
          columns={columns}
          data={bookingAvailabilityList}
          rowSelection={null}
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={isLoading}
          searchQuery={searchQuery}
          searchFields={searchFields}
          onRow={(record) => ({
            onClick: () => message.info(`Clicked on schedule #${record.id}`),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>

      <AddWorkSchedule
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSuccess={handleAddSuccess}
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
    </div>
  );
};

export default WorkSchedule;
