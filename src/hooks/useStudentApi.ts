import { useQuery } from '@tanstack/react-query';
import {
  getMeetingDetail,
  FetchStudentById,
  GetPagedLeaveSchedulesOneStaff,
} from '../api/student/StudentAPI';
import { AdminViewBooking } from '../interfaces/IBookingAvailability';

/**
 * Student-related API hooks
 * Wraps student APIs behind React Query so UI components don't call APIs directly.
 */
export const useStudentApi = () => {
  const useMeetingDetail = (meetingId: string) => useQuery<AdminViewBooking>({
    queryKey: ['meetingDetail', meetingId],
    queryFn: () => getMeetingDetail(parseInt(meetingId)),
    enabled: !!meetingId,
  });

  const useStudentById = (studentId: string) => useQuery<any>({
    queryKey: ['studentById', studentId],
    queryFn: () => FetchStudentById(parseInt(studentId)),
    enabled: !!studentId,
  });

  const useLeaveSchedulesOneStaff = (staffId: string) => useQuery<any>({
    queryKey: ['leaveSchedulesOneStaff', staffId],
    queryFn: () => GetPagedLeaveSchedulesOneStaff(parseInt(staffId)),
    enabled: !!staffId,
  });

  return {
    useMeetingDetail,
    useStudentById,
    useLeaveSchedulesOneStaff,
  };
};
