import React, { useState } from 'react';
import { useAdvisorSelfMeetings } from '../../hooks/useAdvisorSelfMeetings';
import HistoryCalendarView from '../../components/student/historyCalendarView';
import MeetingDetailModal from '../../components/student/meetingDetailModal';
import dayjs, { Dayjs } from 'dayjs';
import { Segmented, Button, List, Tag } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getMeetingDetail } from '../../api/student/StudentAPI';

export default function MeetingPage() {
  const { data, isLoading, refetch } = useAdvisorSelfMeetings(1, 50);
  const meetings = data?.items || [];
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAllMeetings, setShowAllMeetings] = useState(false);
  
  // Limit meetings display
  const displayedMeetings = showAllMeetings ? meetings : meetings.slice(0, 10);
  const hasMoreMeetings = meetings.length > 10;
console.log(meetings)
  // Khi click meeting block
  const handleSlotClick = async (slot: any, date: Dayjs) => {
    if (!slot.meeting) return;
    setDetailLoading(true);
    setSelectedMeeting(slot.meeting);
    setDetail(slot.meeting);
    setDetailLoading(false);
  };

  // Khi click meeting từ list
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

  // Copy statusMap from modal for badge rendering
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
    <div className="min-h-screen flex flex-col items-center justify-start py-10 px-2 sm:px-8 mt-12">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight mb-8">Advisor Meeting Calendar</h1>
        {/* Simple Meeting List UI */}
        <div className="mb-8">
          <List
            bordered
            dataSource={displayedMeetings}
            header={<div className="font-semibold text-blue-700">All Meetings ({meetings.length})</div>}
            renderItem={(item: any) => {
              const statusInfo = statusMap[item.status] || { color: 'default', text: 'Unknown' };
              return (
                <List.Item 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-blue-50 cursor-pointer transition-colors"
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
          {hasMoreMeetings && (
            <div className="mt-4 text-center">
              <Button 
                type="link" 
                onClick={() => setShowAllMeetings(!showAllMeetings)}
                className="text-blue-600 hover:text-blue-800"
              >
                {showAllMeetings ? 'Show Less' : `Show More (${meetings.length - 10} more)`}
              </Button>
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
          meetings={meetings}
          onDateChange={setSelectedDate}
          onSlotClick={handleSlotClick}
          onViewModeChange={mode => { if (mode === 'day' || mode === 'week') setViewMode(mode); }}
        />
        <MeetingDetailModal
          open={!!selectedMeeting}
          onClose={() => { setSelectedMeeting(null); setDetail(null); }}
          detail={detail}
          loading={detailLoading || !detail}
          onActionComplete={() => refetch()}
        />
      </div>
    </div>
  );
}