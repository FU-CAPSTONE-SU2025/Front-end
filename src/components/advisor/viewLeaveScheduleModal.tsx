import React from 'react';
import { Modal, Descriptions, Spin, Button, Space, Popconfirm, message } from 'antd';
import { useLeaveScheduleDetail, useDeleteLeaveSchedule } from '../../hooks/useCRUDLeaveSchedule';

interface ViewLeaveScheduleModalProps {
  visible: boolean;
  onCancel: () => void;
  leaveId: number | null;
  onEdit: (id: number) => void;
  onDeleted: () => void;
}

const ViewLeaveScheduleModal: React.FC<ViewLeaveScheduleModalProps> = ({ visible, onCancel, leaveId, onEdit, onDeleted }) => {
  const { data, isLoading } = useLeaveScheduleDetail(leaveId || undefined);
  const deleteLeave = useDeleteLeaveSchedule();

  const handleDelete = async () => {
    if (!leaveId) return;
    try {
      await deleteLeave.mutateAsync(leaveId);
      message.success('Leave deleted successfully!');
      onDeleted();
    } catch (err) {
      message.error('Failed to delete leave.');
    }
  };

  return (
    <Modal
      title="Leave Schedule Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      {isLoading ? <Spin /> : data ? (
        <>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
            <Descriptions.Item label="Start Time">{new Date(data.startDateTime).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="End Time">{new Date(data.endDateTime).toLocaleString()}</Descriptions.Item>
            {data.note && (
              <Descriptions.Item label="Note">{data.note}</Descriptions.Item>
            )}
            {data.createdAt && (
              <Descriptions.Item label="Created At">{new Date(data.createdAt).toLocaleString()}</Descriptions.Item>
            )}
          </Descriptions>
          <Space style={{ marginTop: 24, float: 'right' }}>
            <Button type="primary" onClick={() => onEdit(data.id)}>Edit</Button>
            <Popconfirm title="Are you sure to delete this leave?" onConfirm={handleDelete} okText="Yes" cancelText="No">
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

export default ViewLeaveScheduleModal; 