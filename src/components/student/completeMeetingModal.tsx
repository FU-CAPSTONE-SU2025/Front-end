import React from 'react';
import { Modal, Button, Input } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useMeetingActions } from '../../hooks/useMeetingActions';

interface CompleteMeetingModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  meetingId: number;
}

const CompleteMeetingModal: React.FC<CompleteMeetingModalProps> = ({ 
  open, 
  onCancel, 
  onSuccess, 
  meetingId 
}) => {
  const [checkInCode, setCheckInCode] = React.useState('');
  const { actionLoading, handleCompleteMeeting } = useMeetingActions({ onActionComplete: onSuccess });

  const handleCompleteConfirm = async () => {
    if (!meetingId || !checkInCode.trim()) {
      return; // Error handling is done in the hook
    }
    
    await handleCompleteMeeting(meetingId, checkInCode.trim());
    setCheckInCode('');
  };

  const handleCancel = () => {
    setCheckInCode('');
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={
        <div className="flex items-center gap-2">
          <CheckCircleOutlined className="text-green-500" />
          <span>Complete Meeting</span>
        </div>
      }
      centered
      width={500}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button 
          key="confirm" 
          type="primary"
          loading={actionLoading} 
          onClick={handleCompleteConfirm}
          disabled={actionLoading || !checkInCode.trim()}
        >
          Complete Meeting
        </Button>
      ]}
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Please enter the check-in code provided by the student to complete this meeting.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Code <span className="text-red-500">*</span>
          </label>
          <Input
            value={checkInCode}
            onChange={(e) => setCheckInCode(e.target.value)}
            placeholder="Enter the check-in code..."
            size="large"
            maxLength={50}
            showCount
            onPressEnter={handleCompleteConfirm}
          />
        </div>
        <div className="text-xs text-gray-500">
          The check-in code is provided by the student when they arrive for the meeting.
        </div>
      </div>
    </Modal>
  );
};

export default CompleteMeetingModal; 