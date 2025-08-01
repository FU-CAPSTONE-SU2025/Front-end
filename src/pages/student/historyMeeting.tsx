import React, { useCallback } from 'react';
import StudentHistoryCalendar from '../../components/student/studentHistoryCalendar';
import { useStudentHistoryMeetings, useStudentHistoryMeetingsOriginal } from '../../hooks/useStudentHistoryMeetings';
import { useQueryClient } from '@tanstack/react-query';

const HistoryMeeting = () => {
  const queryClient = useQueryClient();
  
  // Hook cho calendar data (cột phải)
  const { data: calendarData, isLoading: calendarLoading, refetch: refetchCalendar } = useStudentHistoryMeetings(1, 50);
  const calendarBookings = calendarData?.items || [];
  
  // Hook cho bookings list (cột trái)
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useStudentHistoryMeetingsOriginal(1, 50);
  const bookingsList = bookingsData?.items || [];
  
  // Callback để refresh data sau khi có CRUD operation
  const handleDataRefresh = useCallback(() => {
    // Invalidate và refetch cả hai queries
    queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetings'] });
    queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetingsOriginal'] });
    
    // Refetch ngay lập tức
    refetchCalendar();
    refetchBookings();
  }, [queryClient, refetchCalendar, refetchBookings]);
  
  console.log('History Meeting Calendar Bookings:', calendarBookings);
  console.log('History Meeting Bookings List:', bookingsList);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-start mt-12 py-10 px-2 sm:px-8">
      <StudentHistoryCalendar 
        meetings={calendarBookings} 
        bookingsList={bookingsList}
        loading={calendarLoading} 
        bookingsLoading={bookingsLoading}
        onDataRefresh={handleDataRefresh}
      />
    </div>
  );
};

export default HistoryMeeting;
