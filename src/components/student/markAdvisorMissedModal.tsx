import React from 'react';
import { Modal, Button, Input } from 'antd';
import { useMeetingActions } from '../../hooks/useMeetingActions';

interface MarkAdvisorMissedModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  meetingId: number;
}

const MarkAdvisorMissedModal: React.FC<MarkAdvisorMissedModalProps> = ({ 
  open, 
  onCancel, 
  onSuccess, 
  meetingId 
}) => {
  const [note, setNote] = React.useState('');
  const { actionLoading, handleMarkAdvisorMissed } = useMeetingActions({ onActionComplete: onSuccess });

  const handleConfirm = async () => {
    if (!meetingId) return;
    await handleMarkAdvisorMissed(meetingId, note);
    setNote('');
  };

  const handleCancel = () => {
    setNote('');
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title="Mark Advisor as Missed"
      centered
      width={500}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button 
          key="confirm" 
          danger 
          loading={actionLoading} 
          onClick={handleConfirm}
          disabled={actionLoading}
        >
          Mark as Missed
        </Button>
      ]}
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to mark the advisor as missed for this meeting? Please provide a reason.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason (Optional)
          </label>
          <Input.TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter the reason for marking advisor as missed..."
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      </div>
    </Modal>
  );
};

export default MarkAdvisorMissedModal; 