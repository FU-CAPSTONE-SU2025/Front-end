import { message } from 'antd';
import { useApiErrorHandler } from './useApiErrorHandler';
import { useCancelPendingMeeting, useCancelConfirmedMeeting, useSendMeetingFeedback, useMarkAdvisorMissed, useConfirmMeeting, useCancelPendingMeetingAdvisor, useCompleteMeeting, useAddReasonForOverdue } from './useStudentHistoryMeetings';

interface UseMeetingActionsProps {
  onActionComplete?: () => void;
}

export const useMeetingActions = ({ onActionComplete }: UseMeetingActionsProps = {}) => {
  const { handleError, handleSuccess } = useApiErrorHandler();
  // React Query mutations
  const cancelPendingMutation = useCancelPendingMeeting();
  const cancelConfirmedMutation = useCancelConfirmedMeeting();
  const sendFeedbackMutation = useSendMeetingFeedback();
  const markMissedMutation = useMarkAdvisorMissed();
  const confirmMeetingMutation = useConfirmMeeting();
  const cancelPendingAdvisorMutation = useCancelPendingMeetingAdvisor();
  const completeMeetingMutation = useCompleteMeeting();
  const addReasonForOverdueMutation = useAddReasonForOverdue();

  const handleConfirmMeeting = async (meetingId: number) => {
    if (!meetingId) return;
    
    try {
      await confirmMeetingMutation.mutateAsync(meetingId);
      message.success('Meeting confirmed successfully!');
      onActionComplete?.();
    } catch (err) {
      handleError(err, 'Confirm meeting failed');
    }
  };

  const handleCancelMeeting = async (meetingId: number, note?: string) => {
    if (!meetingId) return;
    
    try {
      await cancelPendingAdvisorMutation.mutateAsync({ meetingId, note: note || '' });
      message.success('Meeting cancelled successfully!');
      onActionComplete?.();
    } catch (err) {
      handleError(err, 'Cancel meeting failed');
    }
  };

  const handleCompleteMeeting = async (meetingId: number, checkInCode: string) => {
    if (!meetingId || !checkInCode.trim()) {
      message.error('Please enter the check-in code.');
      return;
    }
    
    try {
      await completeMeetingMutation.mutateAsync({ meetingId, checkInCode: checkInCode.trim() });
      message.success('Meeting completed successfully!');
      onActionComplete?.();
    } catch (err) {
      handleError(err, 'Complete meeting failed');
    }
  };

  const handleSendFeedback = async (meetingId: number, feedback: string, suggestionFromAdvisor: string) => {
    if (!meetingId) {
      message.error('Meeting ID is required.');
      return;
    }
    
    try {
      await sendFeedbackMutation.mutateAsync({ 
        meetingId, 
        feedback: feedback.trim(), 
        suggestionFromAdvisor: suggestionFromAdvisor.trim() 
      });
      message.success('Feedback sent successfully!');
      onActionComplete?.();
    } catch (err) {
      handleError(err, 'Send feedback failed');
    }
  };

  const handleStudentCancelMeeting = async (meetingId: number, note: string, status: number) => {
    if (!meetingId) return;
    
    try {
      if (status === 2) { // Confirmed
        await cancelConfirmedMutation.mutateAsync({ meetingId, note });
      } else if (status === 1) { // Pending
        await cancelPendingMutation.mutateAsync({ meetingId, note });
      } else {
        throw new Error('Invalid meeting status for student cancellation');
      }
      message.success('Meeting cancelled successfully!');
      onActionComplete?.();
    } catch (err) {
      handleError(err, 'Student cancel meeting failed');
    }
  };

  const handleMarkAdvisorMissed = async (meetingId: number, note: string) => {
    if (!meetingId) return;
    
    try {
      await markMissedMutation.mutateAsync({ meetingId, note });
      message.success('Advisor marked as missed successfully!');
      onActionComplete?.();
    } catch (err) {
      handleError(err, 'Mark advisor missed failed');
    }
  };

  const handleAddReasonForOverdue = async (meetingId: number, note: string) => {
    if (!meetingId) return;
    
    try {
      await addReasonForOverdueMutation.mutateAsync({ meetingId, note });
      message.success('Reason for overdue added successfully!');
      onActionComplete?.();
    } catch (err) {
      handleError(err, 'Add reason for overdue failed');
    }
  };

  return {
    actionLoading: cancelPendingMutation.isPending || cancelConfirmedMutation.isPending || sendFeedbackMutation.isPending || markMissedMutation.isPending || confirmMeetingMutation.isPending || cancelPendingAdvisorMutation.isPending || completeMeetingMutation.isPending || addReasonForOverdueMutation.isPending,
    handleConfirmMeeting,
    handleCancelMeeting,
    handleCompleteMeeting,
    handleSendFeedback,
    handleStudentCancelMeeting,
    handleMarkAdvisorMissed,
    handleAddReasonForOverdue,
  };
}; 