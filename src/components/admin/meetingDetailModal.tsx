import React, { useState } from 'react';
import { Modal, Button, Descriptions, message, Popconfirm } from 'antd';
import { DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { AdminViewBooking } from '../../interfaces/IBookingAvailability';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useAdminApi } from '../../hooks/useAdminApi';

interface MeetingDetailModalProps {
  visible: boolean;
  meeting: AdminViewBooking | null;
  onClose: () => void;
  onDelete: () => void;
  loading?: boolean;
}

const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  visible,
  meeting,
  onClose,
  onDelete,
  loading = false
}) => {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { deleteMeeting } = useAdminApi();

  const handleDelete = async () => {
    if (!meeting) return;
    
    setDeleteLoading(true);
    try {
      await deleteMeeting(meeting.id);
      handleSuccess('Meeting deleted successfully');
      onDelete();
      onClose();
    } catch (err) {
      handleError(err, 'Failed to delete meeting');
      console.error('Delete meeting error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Scheduled';
      case 1: return 'Completed';
      case 2: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'blue';
      case 1: return 'green';
      case 2: return 'red';
      default: return 'default';
    }
  };

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

  // Button styles
  const closeButtonStyle = {
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
  };

  const deleteButtonStyle = {
    backgroundColor: '#ffffff',
    borderColor: '#ff4d4f',
    color: '#ff4d4f',
    fontWeight: '500',
    borderRadius: '6px',
    height: '32px',
    padding: '4px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
  };

  return (
    <Modal
      title={
        <span style={{ color: '#1f2937', fontWeight: '600' }}>
          Meeting Details
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={[
     <div className='flex justify-between'>
         <Button 
          key="close" 
          icon={<CloseOutlined />} 
          onClick={onClose}
          style={closeButtonStyle}
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
        </Button>,
        <Popconfirm
          key="delete"
          title="Delete Meeting"
          description="Are you sure you want to delete this meeting? This action cannot be undone."
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
          okType="danger"
        >
          <Button 
            icon={<DeleteOutlined />} 
            loading={deleteLoading}
            disabled={loading}
            style={deleteButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ff4d4f';
              e.currentTarget.style.borderColor = '#ff4d4f';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#ff4d4f';
              e.currentTarget.style.color = '#ff4d4f';
            }}
          >
            Delete
          </Button>
        </Popconfirm>
     </div>
      ]}
      width={800}
      destroyOnHidden
      styles={modalStyles}
      centered
    >
      {meeting && (
        <Descriptions 
          bordered 
          column={2}
          style={{
            backgroundColor: '#ffffff',
          }}
        >
          <Descriptions.Item label="Meeting ID" span={2}>
            {meeting.id}
          </Descriptions.Item>
          
          <Descriptions.Item label="Start Date & Time">
            {new Date(meeting.startDateTime).toLocaleString()}
          </Descriptions.Item>
          
          <Descriptions.Item label="End Date & Time">
            {new Date(meeting.endDateTime).toLocaleString()}
          </Descriptions.Item>
          
          <Descriptions.Item label="Status" span={2}>
            <span style={{ color: getStatusColor(meeting.status) }}>
              {getStatusText(meeting.status)}
            </span>
          </Descriptions.Item>
          
          <Descriptions.Item label="Student Issue" span={2}>
            {meeting.titleStudentIssue || 'No issue specified'}
          </Descriptions.Item>
          
          <Descriptions.Item label="Created At" span={2}>
            {new Date(meeting.createdAt).toLocaleString()}
          </Descriptions.Item>
          
          <Descriptions.Item label="Advisor Name">
            {meeting.staffFirstName} {meeting.staffLastName}
          </Descriptions.Item>
          
          <Descriptions.Item label="Advisor Email">
            {meeting.staffEmail}
          </Descriptions.Item>
          
          <Descriptions.Item label="Student Name">
            {meeting.studentFirstName} {meeting.studentLastName}
          </Descriptions.Item>
          
          <Descriptions.Item label="Student Email">
            {meeting.studentEmail}
          </Descriptions.Item>
          
          <Descriptions.Item label="Advisor ID">
            {meeting.staffProfileId}
          </Descriptions.Item>
          
          <Descriptions.Item label="Student ID">
            {meeting.studentProfileId}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default MeetingDetailModal; 