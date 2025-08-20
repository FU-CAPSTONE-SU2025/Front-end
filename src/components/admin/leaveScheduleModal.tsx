import React, { useState, useEffect } from 'react';
import { Modal, Table, DatePicker, Button, Space, Typography } from 'antd';
import { CalendarOutlined, CloseOutlined } from '@ant-design/icons';
import { LeaveSchedule } from '../../interfaces/ILeaveSchedule';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useStudentApi } from '../../hooks/useStudentApi';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

interface LeaveScheduleModalProps {
  visible: boolean;
  staffProfileId: number | null;
  staffName: string;
  onClose: () => void;
}

const LeaveScheduleModal: React.FC<LeaveScheduleModalProps> = ({
  visible,
  staffProfileId,
  staffName,
  onClose
}) => {
  const [leaveSchedules, setLeaveSchedules] = useState<LeaveSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const { handleError } = useApiErrorHandler();
  const { useLeaveSchedulesOneStaff } = useStudentApi();

  // Use the hook to get leave schedules
  const { data: leaveSchedulesData, isLoading: leaveSchedulesLoading } = useLeaveSchedulesOneStaff(
    staffProfileId?.toString() || ''
  );
  
  // Update state when data is loaded
  useEffect(() => {
    if (leaveSchedulesData) {
      setLeaveSchedules(leaveSchedulesData.items || []);
      setTotal(leaveSchedulesData.totalCount || 0);
      setCurrentPage(leaveSchedulesData.pageNumber || 1);
      setPageSize(leaveSchedulesData.pageSize || 10);
    }
  }, [leaveSchedulesData]);

  // Fetch leave schedules (legacy function for compatibility)
  const fetchLeaveSchedules = async () => {
    // Data is now handled by the hook
  };

  // Handle date range change
  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setDateRange(dates);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Filter leave schedules by date range
  const filteredLeaveSchedules = dateRange 
    ? leaveSchedules.filter(schedule => {
        const scheduleStart = dayjs(schedule.startDateTime);
        const scheduleEnd = dayjs(schedule.endDateTime);
        const [filterStart, filterEnd] = dateRange;
        
        return scheduleStart.isBefore(filterEnd) && scheduleEnd.isAfter(filterStart);
      })
    : leaveSchedules;

  // Load data when modal opens or staff changes
  useEffect(() => {
    if (visible && staffProfileId) {
      fetchLeaveSchedules();
    }
  }, [visible, staffProfileId]);

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Start Date & Time',
      dataIndex: 'startDateTime',
      key: 'startDateTime',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
      sorter: (a: LeaveSchedule, b: LeaveSchedule) => 
        dayjs(a.startDateTime).unix() - dayjs(b.startDateTime).unix(),
    },
    {
      title: 'End Date & Time',
      dataIndex: 'endDateTime',
      key: 'endDateTime',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
      sorter: (a: LeaveSchedule, b: LeaveSchedule) => 
        dayjs(b.endDateTime).unix() - dayjs(a.endDateTime).unix(),
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 120,
      render: (_: any, record: LeaveSchedule) => {
        const start = dayjs(record.startDateTime);
        const end = dayjs(record.endDateTime);
        const duration = end.diff(start, 'day');
        return `${duration} day${duration !== 1 ? 's' : ''}`;
      },
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      width: 200,
      render: (text: string) => text || '-',
      ellipsis: true,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  // Custom modal styles
  const modalStyles = {
    mask: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
    },
    content: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    header: {
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #f0f0f0',
      borderRadius: '12px 12px 0 0',
    },
    body: {
      backgroundColor: '#ffffff',
      padding: '24px',
    },
    footer: {
      backgroundColor: '#ffffff',
      borderTop: '1px solid #f0f0f0',
      borderRadius: '0 0 12px 12px',
    },
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <span style={{ color: '#1f2937', fontWeight: '600' }}>
            Leave Schedule - {staffName}
          </span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button 
          key="close" 
          icon={<CloseOutlined />} 
          onClick={onClose}
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#d9d9d9',
            color: '#1890ff',
            fontWeight: '500',
            borderRadius: '6px',
            height: '32px',
            padding: '4px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
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
        >
          Close
        </Button>
      ]}
      width={1000}
      destroyOnHidden
      styles={modalStyles}
      centered
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <span style={{ color: '#1f2937', fontWeight: '500' }}>Filter by date range:</span>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            placeholder={['Start Date', 'End Date']}
            allowClear
            style={{
              borderRadius: '6px',
            }}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredLeaveSchedules}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: 'No leave schedules found' }}
        style={{
          backgroundColor: '#ffffff',
        }}
      />
    </Modal>
  );
};

export default LeaveScheduleModal; 