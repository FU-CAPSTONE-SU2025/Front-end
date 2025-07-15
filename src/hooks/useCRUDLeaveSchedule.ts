import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  FetchLeaveScheduleList,
  CreateLeaveSchedule,
  UpdateLeaveSchedule,
  DeleteLeaveSchedule,
  GetLeaveScheduleById
} from '../api/advisor/AdvisorAPI';
import {
  LeaveSchedule,
  PagedLeaveScheduleData,
  CreateLeaveScheduleRequest,
  UpdateLeaveScheduleRequest
} from '../interfaces/ILeaveSchedule';

interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

export function useLeaveScheduleList(pageNumber: number, pageSize: number) {
  return useQuery<PagedLeaveScheduleData | null, Error>({
    queryKey: ['leaveScheduleList', pageNumber, pageSize],
    queryFn: () => FetchLeaveScheduleList(pageNumber, pageSize),
    placeholderData: undefined,
  });
}

export function useCreateLeaveSchedule() {
  const queryClient = useQueryClient();
  return useMutation<LeaveSchedule | null, Error, CreateLeaveScheduleRequest>({
    mutationFn: CreateLeaveSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveScheduleList'] });
    },
  });
}

export function useUpdateLeaveSchedule() {
  const queryClient = useQueryClient();
  return useMutation<LeaveSchedule | null, Error, { id: number; data: UpdateLeaveScheduleRequest }>({
    mutationFn: ({ id, data }) => UpdateLeaveSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveScheduleList'] });
    },
  });
}

export function useDeleteLeaveSchedule() {
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, number>({
    mutationFn: DeleteLeaveSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveScheduleList'] });
    },
  });
}

export function useLeaveScheduleDetail(id?: number) {
  return useQuery<LeaveSchedule | null, Error>({
    queryKey: ['leaveScheduleDetail', id],
    queryFn: () => (id ? GetLeaveScheduleById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
} 