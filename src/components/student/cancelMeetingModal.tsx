import React from 'react';
import { Modal, Button, Input } from 'antd';
import { useMeetingActions } from '../../hooks/useMeetingActions';

interface CancelMeetingModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  meetingId: number;
  userRole?: string;
  meetingStatus?: number;
}

const CancelMeetingModal: React.FC<CancelMeetingModalProps> = ({ 
  open, 
  onCancel, 
  onSuccess, 
  meetingId,
  userRole,
  meetingStatus
}) => {
  const [cancelNote, setCancelNote] = React.useState('');
  const { actionLoading, handleCancelMeeting, handleStudentCancelMeeting } = useMeetingActions({ onActionComplete: onSuccess });

  const handleCancelConfirm = async () => {
    if (!meetingId) return;
    
    // Determine if this is a student or advisor cancellation
    const isStudent = userRole === 'student' || userRole === '5' || userRole === 'Student';
    
    if (isStudent && meetingStatus) {
      await handleStudentCancelMeeting(meetingId, cancelNote, meetingStatus);
    } else {
      await handleCancelMeeting(meetingId, cancelNote);
    }
    
    setCancelNote('');
  };

  const handleCancelCancel = () => {
    setCancelNote('');
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancelCancel}
      title="Cancel Meeting"
      centered
      width={500}
      footer={[
       <div className='flex justify-between'>
         <Button key="cancel" onClick={handleCancelCancel}>
          Cancel
        </Button>,
        <Button 
          key="confirm" 
          danger 
          loading={actionLoading} 
          onClick={handleCancelConfirm}
          disabled={actionLoading}
        >
          Confirm Cancellation
        </Button>
       </div>
      ]}
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to cancel this meeting? Please provide a reason for the cancellation.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cancellation Reason (Optional)
          </label>
          <Input.TextArea
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            placeholder="Enter the reason for cancellation..."
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      </div>
    </Modal>
  );
};

export default CancelMeetingModal; 