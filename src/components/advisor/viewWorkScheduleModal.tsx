import React from 'react';
import { Modal, Descriptions, Spin, Button, Space, Popconfirm, message } from 'antd';
import { useGetBookingAvailabilityById, useDeleteBookingAvailability } from '../../hooks/useCRUDAdvisor';
import { dayOptions } from '../../interfaces/IDayOptions';

interface ViewWorkScheduleModalProps {
  visible: boolean;
  onCancel: () => void;
  scheduleId: number | null;
  onEdit: (id: number) => void;
  onDeleted: () => void;
}

const ViewWorkScheduleModal: React.FC<ViewWorkScheduleModalProps> = ({ visible, onCancel, scheduleId, onEdit, onDeleted }) => {
  const { data, isLoading } = useGetBookingAvailabilityById(scheduleId);
  const deleteSchedule = useDeleteBookingAvailability();

  const getDayName = (dayInWeek: number): string => {
    return dayOptions.find(day => day.value === dayInWeek)?.label || 'Unknown';
  };

  const handleDelete = async () => {
    if (!scheduleId) return;
    try {
      await deleteSchedule.mutateAsync(scheduleId);
      message.success('Work schedule deleted successfully!');
      onDeleted();
    } catch (err) {
      message.error('Failed to delete work schedule.');
    }
  };

  return (
    <Modal
      title="Work Schedule Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      {isLoading ? <Spin /> : data ? (
        <>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
            <Descriptions.Item label="Day of Week">{getDayName(data.dayInWeek)}</Descriptions.Item>
            <Descriptions.Item label="Start Time">{data.startTime}</Descriptions.Item>
            <Descriptions.Item label="End Time">{data.endTime}</Descriptions.Item>
          </Descriptions>
          <Space style={{ marginTop: 24, float: 'right' }}>
            <Button type="primary" onClick={() => onEdit(data.id)}>Edit</Button>
            <Popconfirm title="Are you sure to delete this work schedule?" onConfirm={handleDelete} okText="Yes" cancelText="No">
              <Button danger>Delete</Button>
            </Popconfirm>
          </Space>
        </>
      ) : (
        <div>No data found.</div>
      )}
    </Modal>
  );
};

export default ViewWorkScheduleModal;