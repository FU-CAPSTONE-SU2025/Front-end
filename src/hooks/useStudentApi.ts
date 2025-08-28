import { useQuery } from '@tanstack/react-query';
import {
  getMeetingDetail,
  FetchStudentById,
  GetPagedLeaveSchedulesOneStaff,
  getStudentCheckpoints,
  getJoinedSubjectsOfStudent,
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
    opts?: { isInCompletedOnly?: boolean; isNoneFilterStatus?: boolean; isOrderedByNearToFarDeadline?: boolean },
  ) =>
    useQuery<StudentCheckpointsPaged>({
      queryKey: ['studentCheckpoints', studentProfileId, pageNumber, pageSize, opts?.isInCompletedOnly, opts?.isNoneFilterStatus, opts?.isOrderedByNearToFarDeadline],
      queryFn: () => getStudentCheckpoints(studentProfileId as number, pageNumber, pageSize, opts),
      enabled: !!studentProfileId && enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache for 10 minutes
      placeholderData: (previousData) => previousData, // Show previous data while loading new data
    });

  const useStudentJoinedSubjects = (studentProfileId: number | null, enabled: boolean = true) =>
    useQuery<any[]>({
      queryKey: ['studentJoinedSubjects', studentProfileId],
      queryFn: () => getJoinedSubjectsOfStudent(studentProfileId as number),
      enabled: !!studentProfileId && enabled,
      staleTime: 10 * 60 * 1000, // 10 minutes - subjects don't change often
      gcTime: 15 * 60 * 1000, // 15 minutes cache
    });

  return {
    useMeetingDetail,
    useStudentById,
    useLeaveSchedulesOneStaff,
    useStudentCheckpoints,
    useStudentJoinedSubjects,
  };
};
