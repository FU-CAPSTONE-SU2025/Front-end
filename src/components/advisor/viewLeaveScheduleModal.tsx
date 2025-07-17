import React from 'react';
import { Modal, Descriptions, Spin } from 'antd';
import { useLeaveScheduleDetail } from '../../hooks/useCRUDLeaveSchedule';

interface ViewLeaveScheduleModalProps {
  visible: boolean;
  onCancel: () => void;
  leaveId: number | null;
}

const ViewLeaveScheduleModal: React.FC<ViewLeaveScheduleModalProps> = ({ visible, onCancel, leaveId }) => {
  const { data, isLoading } = useLeaveScheduleDetail(leaveId || undefined);

  return (
    <Modal
      title="Leave Schedule Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      {isLoading ? <Spin /> : data ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
          <Descriptions.Item label="Start Time">{new Date(data.startDateTime).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="End Time">{new Date(data.endDateTime).toLocaleString()}</Descriptions.Item>
          
          {data.createdAt && (
            <Descriptions.Item label="Created At">{new Date(data.createdAt).toLocaleString()}</Descriptions.Item>
          )}
        </Descriptions>
      ) : (
        <div>No data found.</div>
      )}
    </Modal>
  );
};

export default ViewLeaveScheduleModal; 