import React from 'react';
import { Modal, Button, Input } from 'antd';
import { MessageOutlined, BulbOutlined } from '@ant-design/icons';
import { useMeetingActions } from '../../hooks/useMeetingActions';

interface FeedbackModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  meetingId: number;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  open, 
  onCancel, 
  onSuccess, 
  meetingId 
}) => {
  const [feedback, setFeedback] = React.useState('');
  const [suggestionFromAdvisor, setSuggestionFromAdvisor] = React.useState('');
  const { actionLoading, handleSendFeedback } = useMeetingActions({ onActionComplete: onSuccess });

  const handleSubmitFeedback = async () => {
    if (!meetingId) {
      return; // Error handling is done in the hook
    }
    
    await handleSendFeedback(meetingId, feedback.trim(), suggestionFromAdvisor.trim());
    setFeedback('');
    setSuggestionFromAdvisor('');
  };

  const handleCancel = () => {
    setFeedback('');
    setSuggestionFromAdvisor('');
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={
        <div className="flex items-center gap-2">
          <MessageOutlined className="text-blue-500" />
          <span>Send Feedback</span>
        </div>
      }
      centered
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary"
          loading={actionLoading} 
          onClick={handleSubmitFeedback}
          disabled={actionLoading}
        >
          Send Feedback
        </Button>
      ]}
    >
      <div className="space-y-6">
        <p className="text-gray-700">
          Please share your feedback about this meeting. Your input helps us improve our advisory services.
        </p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageOutlined className="mr-1" />
            Your Feedback
          </label>
          <Input.TextArea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience, thoughts, or any comments about the meeting..."
            rows={4}
            maxLength={1000}
            showCount
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BulbOutlined className="mr-1" />
            Suggestions for Advisor (Optional)
          </label>
          <Input.TextArea
            value={suggestionFromAdvisor}
            onChange={(e) => setSuggestionFromAdvisor(e.target.value)}
            placeholder="Any suggestions or recommendations for the advisor..."
            rows={3}
            maxLength={500}
            showCount
          />
        </div>

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <strong>Note:</strong> Your feedback will be shared with the advisor to help improve future meetings. 
          Both fields are optional, but we appreciate your input.
        </div>
      </div>
    </Modal>
  );
};

export default FeedbackModal; 