import { useQuery } from '@tanstack/react-query';
import {
  getMeetingDetail,
  FetchStudentById,
  GetPagedLeaveSchedulesOneStaff,
  getStudentCheckpoints,
} from '../api/student/StudentAPI';
import { AdminViewBooking } from '../interfaces/IBookingAvailability';

/**
 * Student-related API hooks
 * Wraps student APIs behind React Query so UI components don't call APIs directly.
 */
type StudentCheckpointItem = { id: number; title: string; isCompleted: boolean; deadline: string };
type StudentCheckpointsPaged = { items: StudentCheckpointItem[]; totalCount: number; pageNumber: number; pageSize: number };

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

  const useStudentCheckpoints = (
    studentProfileId: number | null,
    pageNumber: number = 1,
    pageSize: number = 10,
    enabled: boolean = true,
    opts?: { isInCompletedOnly?: boolean; isNoneFilterStatus?: boolean; isOrderedByNearToFarDeadlin?: boolean },
  ) =>
    useQuery<StudentCheckpointsPaged>({
      queryKey: ['studentCheckpoints', studentProfileId, pageNumber, pageSize, opts?.isInCompletedOnly, opts?.isNoneFilterStatus, opts?.isOrderedByNearToFarDeadlin],
      queryFn: () => getStudentCheckpoints(studentProfileId as number, pageNumber, pageSize, opts),
      enabled: !!studentProfileId && enabled,
      keepPreviousData: true,
    });

  return {
    useMeetingDetail,
    useStudentById,
    useLeaveSchedulesOneStaff,
    useStudentCheckpoints,
  };
};
