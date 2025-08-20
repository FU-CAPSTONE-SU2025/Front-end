import { useMutation, useQuery } from '@tanstack/react-query';
import {
  DeleteMeetingById,
  GetAllMeetingRecordPaged,
} from '../api/admin/auditlogAPI';
import { AdminViewBooking } from '../interfaces/IBookingAvailability';
import { PagedData } from '../interfaces/ISchoolProgram';

/**
 * Admin-related API hooks
 * Wraps admin APIs behind React Query so UI components don't call APIs directly.
 */
export const useAdminApi = () => {
  const useAllMeetingRecordPaged = (page: number, pageSize: number) => useQuery<PagedData<AdminViewBooking>>({
    queryKey: ['allMeetingRecordPaged', page, pageSize],
    queryFn: () => GetAllMeetingRecordPaged(page, pageSize),
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: DeleteMeetingById,
  });

  return {
    useAllMeetingRecordPaged,
    deleteMeeting: deleteMeetingMutation.mutateAsync,
  };
};
