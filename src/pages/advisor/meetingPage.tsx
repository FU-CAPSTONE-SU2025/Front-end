import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAdvisorSelfMeetings, useAdvisorActiveMeetings } from '../../hooks/useAdvisorSelfMeetings';
import HistoryCalendarView from '../../components/student/historyCalendarView';
import MeetingDetailModal from '../../components/student/meetingDetailModal';
import dayjs, { Dayjs } from 'dayjs';
import { Segmented, Button, List, Tag, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getMeetingDetail } from '../../api/student/StudentAPI';
import { useQueryClient } from '@tanstack/react-query';

export default function MeetingPage() {
  const queryClient = useQueryClient();

  const { data: calendarData, isLoading: calendarLoading, refetch: refetchCalendar } = useAdvisorActiveMeetings(1, 50);
  const calendarMeetings = calendarData?.items || [];
  
  const { data: meetingsData, isLoading: meetingsLoading, refetch: refetchMeetings } = useAdvisorSelfMeetings(1, 50);
  const meetings = meetingsData?.items || [];
  
  const handleDataRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['advisorActiveMeetings'] });
    queryClient.invalidateQueries({ queryKey: ['advisorSelfMeetings'] });
    refetchCalendar();
    refetchMeetings();
  }, [queryClient, refetchCalendar, refetchMeetings]);
  
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [displayedMeetingsCount, setDisplayedMeetingsCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const displayedMeetings = meetings.slice(0, displayedMeetingsCount);
  const hasMoreMeetings = meetings.length > displayedMeetingsCount;

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoadingMore || !hasMoreMeetings) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold for better detection

    if (isNearBottom) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setDisplayedMeetingsCount(prev => Math.min(prev + 5, meetings.length));
        setIsLoadingMore(false);
      }, 500); // Slightly longer delay for better UX
    }
  }, [isLoadingMore, hasMoreMeetings, meetings.length]);

  // Add scroll event listener
  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Reset displayed count when meetings change
  useEffect(() => {
    setDisplayedMeetingsCount(5);
  }, [meetings.length]);

  // Auto-load more if initial count is less than 5
  useEffect(() => {
    if (meetings.length > 5 && displayedMeetingsCount === 5) {
      const timer = setTimeout(() => {
        setDisplayedMeetingsCount(prev => Math.min(prev + 5, meetings.length));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [meetings.length, displayedMeetingsCount]);
  
  const handleSlotClick = async (slot: any, date: Dayjs) => {
    if (!slot.meeting) return;
    setDetailLoading(true);
    setSelectedMeeting(slot.meeting);
    setDetail(slot.meeting);
    setDetailLoading(false);
  };

  const handleMeetingClick = async (meeting: any) => {
    setDetailLoading(true);
    setSelectedMeeting(meeting);
    const res = await getMeetingDetail(meeting.id);
    setDetail(res);
    setDetailLoading(false);
  };

  // Week navigation logic
  const today = dayjs().startOf('day');
  const canGoPrevWeek = selectedDate.startOf('week').isAfter(today.startOf('week')) || selectedDate.startOf('week').isSame(today.startOf('week'));
  const goToPrevWeek = () => {
    const prev = selectedDate.startOf('week').subtract(1, 'week');
    if (prev.isBefore(today.startOf('week'))) return;
    setSelectedDate(prev);
  };
  const goToNextWeek = () => setSelectedDate(selectedDate.startOf('week').add(1, 'week'));
  const weekRange = `${selectedDate.startOf('week').format('DD MMM YYYY')} - ${selectedDate.endOf('week').format('DD MMM YYYY')}`;


  const statusMap: Record<number, { color: string; text: string }> = {
    1: { color: 'blue', text: 'Pending' },
    2: { color: 'green', text: 'Confirmed' },
    3: { color: 'red', text: 'Advisor Canceled' },
    4: { color: 'orange', text: 'Completed' },
    5: { color: 'red', text: 'Student Missed' },
    6: { color: 'red', text: 'Advisor Missed' },
    8: { color: 'red', text: 'Overdue' },
    9: { color: 'red', text: 'Student Canceled' },
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white justify-start py-10 px-2 sm:px-8 mt-12">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight mb-8">Advisor Meeting Calendar</h1>
        <div className="mb-8">
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg" ref={listRef}>
            <List
              bordered={false}
              dataSource={displayedMeetings}
              header={<div className="font-semibold text-blue-700 sticky top-0 bg-white p-4 border-b">
                All Meetings ({displayedMeetingsCount} of {meetings.length})
              </div>}
              renderItem={(item: any) => {
                const statusInfo = statusMap[item.status] || { color: 'default', text: 'Unknown' };
                return (
                  <List.Item 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100"
                    onClick={() => handleMeetingClick(item)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-medium text-base">{dayjs(item.startDateTime).format('DD/MM/YYYY')}</span>
                      <span className="text-gray-500">{dayjs(item.startDateTime).format('HH:mm')} - {dayjs(item.endDateTime).format('HH:mm')}</span>
                      <span className="text-blue-900 font-semibold">{item.studentFirstName} {item.studentLastName}</span>
                      <span className="text-gray-700">{item.titleStudentIssue}</span>
                    </div>
                    <Tag color={statusInfo.color} className="font-semibold text-xs px-3 py-1 rounded-full">{statusInfo.text}</Tag>
                  </List.Item>
                );
              }}
              locale={{ emptyText: 'No meetings found.' }}
              size="small"
            />
          </div>
          {isLoadingMore && (
            <div className="text-center py-4">
              <Spin size="small" />
              <span className="ml-2 text-gray-500">Loading more meetings...</span>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <Segmented
            options={[{ label: 'Day View', value: 'day' }, { label: 'Week View', value: 'week' }]}
            value={viewMode}
            onChange={val => setViewMode(val as 'day' | 'week')}
            className="bg-gray-100"
          />
        </div>
        {/* Week navigation bar */}
        {viewMode === 'week' && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button icon={<LeftOutlined />} shape="circle" onClick={goToPrevWeek} disabled={!canGoPrevWeek} />
            <span className="font-semibold text-blue-700 text-base">{weekRange}</span>
            <Button icon={<RightOutlined />} shape="circle" onClick={goToNextWeek} />
          </div>
        )}
        <HistoryCalendarView
          viewMode={viewMode}
          selectedDate={selectedDate}
          meetings={calendarMeetings}
          onDateChange={setSelectedDate}
          onSlotClick={handleSlotClick}
          onViewModeChange={mode => { if (mode === 'day' || mode === 'week') setViewMode(mode); }}
        />
        <MeetingDetailModal
          open={!!selectedMeeting}
          onClose={() => { setSelectedMeeting(null); setDetail(null); }}
          detail={detail}
          loading={detailLoading || !detail}
          onActionComplete={handleDataRefresh}
        />
      </div>
    </div>
  );
}