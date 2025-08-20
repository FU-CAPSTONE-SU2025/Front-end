import { useAuths } from './useAuthState';

export const useMeetingPermissions = (meetingStatus: number) => {
  const userRole = useAuths(state => state.userRole);

  // Debug logging
  console.log('useMeetingPermissions - userRole:', userRole, 'meetingStatus:', meetingStatus);

  // Determine user roles
  const isAdvisor = userRole === 'advisor' || userRole === 3 || userRole === 'Advisor';
  const isStudent = userRole === 'student' || userRole === 5 || userRole === 'Student';
  
  console.log('useMeetingPermissions - isAdvisor:', isAdvisor, 'isStudent:', isStudent);

  // Define status constants for better readability
  const STATUS = {
    PENDING: 1,
    CONFIRMED: 2,
    ADVISOR_CANCELED: 3,
    COMPLETED: 4,
    STUDENT_MISSED: 5,
    ADVISOR_MISSED: 6,
    OVERDUE: 8,
    STUDENT_CANCELED: 9,
  };

  // Advisor permissions
  const canConfirmCancel = isAdvisor && meetingStatus === STATUS.PENDING;
  const canComplete = isAdvisor && meetingStatus === STATUS.CONFIRMED;
  const canAddReasonForOverdue = isAdvisor && meetingStatus === STATUS.OVERDUE;

  // Student permissions
  const canSendFeedback = isStudent && (
    meetingStatus === STATUS.COMPLETED ||
    meetingStatus === STATUS.STUDENT_MISSED ||
    meetingStatus === STATUS.ADVISOR_MISSED
  );
  
  const canStudentCancel = isStudent && (
    meetingStatus === STATUS.PENDING ||
    meetingStatus === STATUS.CONFIRMED
  );
  
  const canMarkAdvisorMissed = isStudent && meetingStatus === STATUS.CONFIRMED;
  
  console.log('useMeetingPermissions - canSendFeedback:', canSendFeedback, 'canStudentCancel:', canStudentCancel, 'canMarkAdvisorMissed:', canMarkAdvisorMissed, 'meetingStatus:', meetingStatus);

  // General permissions
  const canViewDetails = true; // Anyone can view meeting details
  const canEdit = isAdvisor && (meetingStatus === STATUS.PENDING || meetingStatus === STATUS.CONFIRMED);

  return {
    // User roles
    isAdvisor,
    isStudent,
    
    // Status constants
    STATUS,
    
    // Permissions
    canConfirmCancel,
    canComplete,
    canAddReasonForOverdue,
    canSendFeedback,
    canStudentCancel,
    canMarkAdvisorMissed,
    canViewDetails,
    canEdit,
    
    // Helper functions
    getStatusText: (status: number) => {
      const statusMap: Record<number, string> = {
        [STATUS.PENDING]: 'Pending',
        [STATUS.CONFIRMED]: 'Confirmed',
        [STATUS.ADVISOR_CANCELED]: 'Advisor Canceled',
        [STATUS.COMPLETED]: 'Completed',
        [STATUS.STUDENT_MISSED]: 'Student Missed',
        [STATUS.ADVISOR_MISSED]: 'Advisor Missed',
        [STATUS.OVERDUE]: 'Overdue',
        [STATUS.STUDENT_CANCELED]: 'Student Canceled',
      };
      return statusMap[status] || 'Unknown';
    },
    
    getStatusColor: (status: number) => {
      const colorMap: Record<number, string> = {
        [STATUS.PENDING]: 'blue',
        [STATUS.CONFIRMED]: 'green',
        [STATUS.ADVISOR_CANCELED]: 'red',
        [STATUS.COMPLETED]: 'orange',
        [STATUS.STUDENT_MISSED]: 'red',
        [STATUS.ADVISOR_MISSED]: 'red',
        [STATUS.OVERDUE]: 'red',
        [STATUS.STUDENT_CANCELED]: 'red',
      };
      return colorMap[status] || 'default';
    },
  };
}; 