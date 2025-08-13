import React, { useState, useRef, useCallback } from 'react';
import { Spin, Modal, Segmented, Button, Tag, Progress } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import HistoryCalendarView from './historyCalendarView';
import { getMeetingDetail } from '../../api/student/StudentAPI';
import { AdvisorMeetingItem } from '../../interfaces/IStudent';
import { CloseCircleOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined, MailOutlined, LeftOutlined, RightOutlined, CheckCircleTwoTone, InfoCircleTwoTone, WarningOutlined } from '@ant-design/icons';
import MeetingDetailModal from './meetingDetailModal';
import { useMaxNumberOfBan, useCurrentNumberOfBan } from '../../hooks/useStudentFeature';

interface StudentHistoryCalendarProps {
  meetings: any[];
  bookingsList: any[];
  loading: boolean;
  bookingsLoading: boolean;
  onDataRefresh?: () => void;
}

const StudentHistoryCalendar: React.FC<StudentHistoryCalendarProps> = ({ 
  meetings, 
  bookingsList, 
  loading, 
  bookingsLoading,
  onDataRefresh 
}) => {
  // Hooks for ban data
  const { data: maxBanData, isLoading: maxBanLoading } = useMaxNumberOfBan();
  const { data: currentBanData, isLoading: currentBanLoading } = useCurrentNumberOfBan();
  
  // State for lazy loading bookings
  const [displayedBookings, setDisplayedBookings] = useState(3);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const bookingsContainerRef = useRef<HTMLDivElement>(null);
  
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMeeting, setSelectedMeeting] = useState<AdvisorMeetingItem | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const statusMap: Record<number, { color: string; text: string; icon: React.ReactNode }> = {
    1: { color: 'blue', text: 'Pending', icon: <InfoCircleTwoTone twoToneColor="#1890ff" /> },
    2: { color: 'green', text: 'Confirmed', icon: <CheckCircleTwoTone twoToneColor="#52c41a" /> },
    3: { color: 'red', text: 'Advisor Canceled', icon: <CloseCircleOutlined className="text-red-500" /> },
    4: { color: 'orange', text: 'Completed', icon: <CheckCircleTwoTone twoToneColor="#52c41a" /> },
    5: { color: 'red', text: 'Student Missed', icon: <CloseCircleOutlined className="text-red-500" /> },
    6: { color: 'red', text: 'Advisor Missed', icon: <CloseCircleOutlined className="text-red-500" /> },
    8: { color: 'red', text: 'Overdue', icon: <CloseCircleOutlined className="text-red-500" /> },
    9: { color: 'red', text: 'Student Canceled', icon: <CloseCircleOutlined className="text-red-500" /> },
  };

  // Handle scroll for lazy loading
  const handleBookingsScroll = useCallback(() => {
    const container = bookingsContainerRef.current;
    if (!container || isLoadingMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when scrolled to 80% of the container
    if (scrollPercentage >= 0.8 && displayedBookings < bookingsList.length) {
      setIsLoadingMore(true);
      
      // Simulate loading delay
      setTimeout(() => {
        setDisplayedBookings(prev => Math.min(prev + 3, bookingsList.length));
        setIsLoadingMore(false);
      }, 300);
    }
  }, [displayedBookings, bookingsList.length, isLoadingMore]);

  // Reset displayed bookings when bookingsList changes
  React.useEffect(() => {
    setDisplayedBookings(3);
  }, [bookingsList]);

  // Khi click slot, chỉ cho click slot đã book
  const handleSlotClick = async (slot: any, date: Dayjs) => {
    if (!slot.meeting) return;
    setDetailLoading(true);
    setSelectedMeeting(slot.meeting);
    const res = await getMeetingDetail(slot.id);
    setDetail(res);
    setDetailLoading(false);
  };

  // Week navigation
  const today = dayjs().startOf('day');
  const canGoPrevWeek = selectedDate.startOf('week').isAfter(today.startOf('week')) || selectedDate.startOf('week').isSame(today.startOf('week'));
  const goToPrevWeek = () => {
    const prev = selectedDate.startOf('week').subtract(1, 'week');
    if (prev.isBefore(today.startOf('week'))) return;
    setSelectedDate(prev);
  };
  const goToNextWeek = () => setSelectedDate(selectedDate.startOf('week').add(1, 'week'));
  const weekRange = `${selectedDate.startOf('week').format('DD MMM YYYY')} - ${selectedDate.endOf('week').format('DD MMM YYYY')}`;

  // Sort all bookings by date (newest first)
  const sortedBookings = bookingsList.sort((a, b) => dayjs(b.startDateTime).valueOf() - dayjs(a.startDateTime).valueOf());
  console.log("asdsad",sortedBookings)
  // Get displayed bookings
  const displayedSortedBookings = sortedBookings.slice(0, displayedBookings);
  const hasMoreBookings = displayedBookings < sortedBookings.length;

  // Custom calendarView chỉ render slot đã book
  const CustomCalendarView = () => (
    <HistoryCalendarView
      viewMode={viewMode}
      selectedDate={selectedDate}
      meetings={meetings}
      onDateChange={setSelectedDate}
      onSlotClick={handleSlotClick}
      onViewModeChange={mode => { if (mode === 'day' || mode === 'week') setViewMode(mode); }}
    />
  );

  return (
    <div className="mt-12 w-full px-4 sm:px-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Cột trái:  ở trên cùng */}
      <div className="col-span-1 flex flex-col items-start gap-6">
        {/* Ban Information Card */}
        <div className="rounded-2xl shadow bg-gradient-to-r from-red-50 to-orange-50 p-6 flex flex-col gap-4 border border-red-100 min-h-[120px] w-[350px] sm:w-[400px]">
          <div className="flex items-center gap-3 mb-2">
            <WarningOutlined className="text-red-500 text-2xl" />
            <span className="text-xl font-bold text-red-900">Cancel Limit</span>
          </div>
          {maxBanLoading || currentBanLoading ? (
            <div className="flex justify-center items-center h-16">
              <Spin size="small" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-sm font-medium">Current Cancels:</span>
                <span className="text-red-600 font-bold text-lg">{currentBanData?.curNoOfBan || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-sm font-medium">Max Allowed:</span>
                <span className="text-blue-600 font-bold text-lg">{maxBanData?.maxNoOfBan || 0}</span>
              </div>
              <div className="mt-2">
                <Progress 
                  percent={maxBanData?.maxNoOfBan ? Math.round((currentBanData?.curNoOfBan || 0) / maxBanData.maxNoOfBan * 100) : 0}
                  strokeColor={{
                    '0%': '#52c41a',
                    '50%': '#faad14',
                    '100%': '#ff4d4f',
                  }}
                  showInfo={false}
                  size="small"
                />
                <div className="text-xs text-gray-500 mt-1 text-center">
                  {currentBanData?.curNoOfBan || 0} / {maxBanData?.maxNoOfBan || 0} cancels used
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bookings Card */}
        <div className="rounded-2xl shadow bg-gradient-to-r from-blue-50 to-orange-50 p-6 flex flex-col gap-4 border border-blue-100 min-h-[180px] w-[350px] sm:w-[400px]">
          <div className="flex items-center gap-3 mb-1">
            <CalendarOutlined className="text-blue-500 text-2xl" />
            <span className="text-xl font-bold text-blue-900">Bookings</span>
            <span className="bg-blue-100 text-blue-700 font-semibold rounded-full px-3 py-1 text-xs ml-2">{bookingsList.length}</span>
          </div>
          {bookingsLoading ? (
            <div className="flex justify-center items-center h-32">
              <Spin size="small" />
            </div>
          ) : sortedBookings.length === 0 ? (
            <div className="text-gray-400 italic text-sm pl-2">No bookings</div>
          ) : (
            <div 
              ref={bookingsContainerRef}
              onScroll={handleBookingsScroll}
              className="flex flex-col gap-2 w-full max-h-[300px] overflow-y-auto pr-2"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e0 #f1f5f9' }}
            >
              {displayedSortedBookings.map(b => {
                const statusInfo = statusMap[b.status] || { color: 'default', text: 'Unknown' };
                return (
                  <div key={b.id} className="flex flex-col bg-white/80 rounded-xl px-4 py-3 shadow-sm border border-blue-100 w-full hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleSlotClick({ meeting: b, id: b.id }, dayjs(b.startDateTime))}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-900 text-sm">{dayjs(b.startDateTime).format('ddd, MMM D')}</span>
                        <span className="text-gray-700 text-xs font-medium">{dayjs(b.startDateTime).format('HH:mm')} - {dayjs(b.endDateTime).format('HH:mm')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                 
                        <Tag color={statusInfo.color} className="font-semibold text-xs px-2 py-0.5 rounded-full">
                          {statusInfo.text}
                        </Tag>
                      </div>
                    </div>
                    <div className="text-gray-800 text-sm font-semibold truncate">{b.titleStudentIssue}</div>
                    <div className="text-gray-600 text-xs mt-1">
                      {b.staffFirstName} {b.staffLastName}
                    </div>
                  </div>
                );
              })}
              
              {/* Loading indicator for more bookings */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-2">
                  <Spin size="small" />
                </div>
              )}
              
              {/* Show more indicator */}
              {hasMoreBookings && !isLoadingMore && (
                <div className="text-center py-2 text-xs text-gray-500">
                  Scroll to load more...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Cột phải: Calendar box full width */}
      <div className="col-span-1 xl:col-span-2 rounded-3xl shadow-2xl bg-white p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight">History Meeting</h1>
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <CustomCalendarView />
        )}
        {/* Modal detail meeting */}
        <MeetingDetailModal
          open={!!selectedMeeting}
          onClose={() => { setSelectedMeeting(null); setDetail(null); }}
          detail={detail}
          loading={detailLoading || !detail}
          onActionComplete={onDataRefresh}
        />
      </div>
    </div>
  );
};

export default StudentHistoryCalendar; 