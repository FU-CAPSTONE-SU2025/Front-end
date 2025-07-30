import { useState } from 'react';
import { message } from 'antd';
import { confirmMeeting, cancelPendingMeeting, completeMeeting } from '../api/advisor/AdvisorAPI';
import { sendMeetingFeedback, cancelConfirmedMeeting, cancelPendingMeeting as cancelPendingMeetingStudent, markAdvisorMissed } from '../api/student/StudentAPI';
import { getUserFriendlyErrorMessage } from '../api/AxiosCRUD';

interface UseMeetingActionsProps {
  onActionComplete?: () => void;
}

export const useMeetingActions = ({ onActionComplete }: UseMeetingActionsProps = {}) => {
  const [actionLoading, setActionLoading] = useState(false);

  const handleConfirmMeeting = async (meetingId: number) => {
    if (!meetingId) return;
    
    setActionLoading(true);
    try {
      await confirmMeeting(meetingId);
      message.success('Meeting confirmed successfully!');
      onActionComplete?.();
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      message.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelMeeting = async (meetingId: number, note?: string) => {
    if (!meetingId) return;
    
    setActionLoading(true);
    try {
      await cancelPendingMeeting(meetingId, note);
      message.success('Meeting cancelled successfully!');
      onActionComplete?.();
    } catch (err) {
      console.error('Error cancelling meeting:', err);
      const errorMessage = getUserFriendlyErrorMessage(err);
      message.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteMeeting = async (meetingId: number, checkInCode: string) => {
    if (!meetingId || !checkInCode.trim()) {
      message.error('Please enter the check-in code.');
      return;
    }
    
    setActionLoading(true);
    try {
      await completeMeeting(meetingId, checkInCode.trim());
      message.success('Meeting completed successfully!');
      onActionComplete?.();
    } catch (err) {
      console.error('Error completing meeting:', err);
      const errorMessage = getUserFriendlyErrorMessage(err);
      message.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendFeedback = async (meetingId: number, feedback: string, suggestionFromAdvisor: string) => {
    if (!meetingId) {
      message.error('Meeting ID is required.');
      return;
    }
    
    setActionLoading(true);
    try {
      await sendMeetingFeedback(meetingId, feedback.trim(), suggestionFromAdvisor.trim());
      message.success('Feedback sent successfully!');
      onActionComplete?.();
    } catch (err) {
      console.error('Error sending feedback:', err);
      const errorMessage = getUserFriendlyErrorMessage(err);
      message.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStudentCancelMeeting = async (meetingId: number, note: string, status: number) => {
    if (!meetingId) return;
    
    setActionLoading(true);
    try {
      if (status === 2) { // Confirmed
        await cancelConfirmedMeeting(meetingId, note);
      } else if (status === 1) { // Pending
        await cancelPendingMeetingStudent(meetingId, note);
      } else {
        throw new Error('Invalid meeting status for student cancellation');
      }
      message.success('Meeting cancelled successfully!');
      onActionComplete?.();
    } catch (err) {
      console.error('Error cancelling meeting:', err);
      const errorMessage = getUserFriendlyErrorMessage(err);
      message.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAdvisorMissed = async (meetingId: number, note: string) => {
    if (!meetingId) return;
    
    setActionLoading(true);
    try {
      await markAdvisorMissed(meetingId, note);
      message.success('Advisor marked as missed successfully!');
      onActionComplete?.();
    } catch (err) {
      console.error('Error marking advisor missed:', err);
      message.error('Failed to mark advisor missed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    actionLoading,
    handleConfirmMeeting,
    handleCancelMeeting,
    handleCompleteMeeting,
    handleSendFeedback,
    handleStudentCancelMeeting,
    handleMarkAdvisorMissed,
  };
}; 