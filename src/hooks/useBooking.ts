import { useMutation } from '@tanstack/react-query';
import { CreateBookingMeeting } from '../api/student/StudentAPI';
import { CreateBookingMeetingRequest, BookingMeetingResponse } from '../interfaces/IStudent';
import { useApiErrorHandler } from './useApiErrorHandler';

/**
 * Booking-related API hooks
 * Wraps meeting booking APIs behind React Query mutations so UI does not call APIs directly.
 */
export const useBookingApi = () => {
  const { handleError } = useApiErrorHandler();

  const createBookingMutation = useMutation<BookingMeetingResponse | null, unknown, CreateBookingMeetingRequest>({
    mutationFn: async (payload: CreateBookingMeetingRequest) => {
      return await CreateBookingMeeting(payload);
    },
    onError: (err) => handleError(err, 'Booking failed'),
  });

  return {
    // Convenience async call
    createBooking: createBookingMutation.mutateAsync,
    // Full mutation object when consumers need loading/error states
    createBookingMutation,
  };
};


