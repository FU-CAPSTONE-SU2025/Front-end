import React, { useState } from 'react';
import { Spin, Modal, Segmented, Button, Tag } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import HistoryCalendarView from './historyCalendarView';
import { getMeetingDetail } from '../../api/student/StudentAPI';
import { AdvisorMeetingItem } from '../../interfaces/IStudent';
import { CloseCircleOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined, MailOutlined, LeftOutlined, RightOutlined, CheckCircleTwoTone, InfoCircleTwoTone } from '@ant-design/icons';
import MeetingDetailModal from './meetingDetailModal';

interface StudentHistoryCalendarProps {
  meetings: AdvisorMeetingItem[];
  loading: boolean;
}

const StudentHistoryCalendar: React.FC<StudentHistoryCalendarProps> = ({ meetings, loading }) => {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMeeting, setSelectedMeeting] = useState<AdvisorMeetingItem | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status mapping for display
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

  // Chỉ filter slot hiển thị (slot >= today), không filter selectedDate
  const filteredMeetings = meetings.filter(m => dayjs(m.startDateTime).isSameOrAfter(dayjs(), 'day'));

  // Tạo workSlots cho tất cả các khung giờ (8h-18h) của ngày/tuần, slot đã book type 'booked', còn lại 'available'
  const generateAllSlots = (date: Dayjs) => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      const start = dayjs(date).hour(hour).minute(0);
      const end = start.add(1, 'hour');
      const meeting = filteredMeetings.find(m =>
        dayjs(m.startDateTime).isSame(start, 'minute') &&
        dayjs(m.endDateTime).isSame(end, 'minute')
      );
      slots.push({
        id: meeting ? meeting.id : `${date.format('YYYY-MM-DD')}-${hour}`,
        startTime: start.format('HH:mm'),
        endTime: end.format('HH:mm'),
        dayInWeek: date.day() === 0 ? 1 : date.day() + 1, // Map 0=Sunday to 1, 1=Monday to 2, etc.
        staffProfileId: meeting?.staffProfileId ?? 0,
        type: meeting ? 'booked' : 'available',
        meeting: meeting ?? null,
      });
    }
    return slots;
  };

  // Tạo workSlots cho week/day view
  const getWorkSlots = (date: Dayjs) => {
    if (viewMode === 'week') {
      const weekStart = date.startOf('week');
      const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
      return days.flatMap(day => generateAllSlots(day));
    } else {
      return generateAllSlots(date);
    }
  };

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

  // Summary: danh sách booking từ hôm nay trở đi
  const upcomingBookings = filteredMeetings.sort((a, b) => dayjs(a.startDateTime).valueOf() - dayjs(b.startDateTime).valueOf());

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
      <div className="col-span-1 flex flex-col items-start">
        <div className="rounded-2xl shadow bg-gradient-to-r from-blue-50 to-orange-50 p-6 flex flex-col gap-4 border border-blue-100 min-h-[180px] w-[350px] sm:w-[400px]">
          <div className="flex items-center gap-3 mb-1">
            <CalendarOutlined className="text-blue-500 text-2xl" />
            <span className="text-xl font-bold text-blue-900">Bookings</span>
            <span className="bg-blue-100 text-blue-700 font-semibold rounded-full px-3 py-1 text-xs ml-2">{upcomingBookings.length}</span>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="text-gray-400 italic text-sm pl-2">No bookings</div>
          ) : (
            <div className="flex flex-col gap-2 w-full max-h-[400px] overflow-y-auto">
              {upcomingBookings.map(b => {
                const statusInfo = statusMap[b.status] || { color: 'default', text: 'Unknown', icon: <InfoCircleTwoTone /> };
                return (
                  <div key={b.id} className="flex flex-col bg-white/80 rounded-xl px-4 py-3 shadow-sm border border-blue-100 w-full hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleSlotClick({ meeting: b, id: b.id }, dayjs(b.startDateTime))}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-900 text-sm">{dayjs(b.startDateTime).format('ddd, MMM D')}</span>
                        <span className="text-gray-700 text-xs font-medium">{dayjs(b.startDateTime).format('HH:mm')} - {dayjs(b.endDateTime).format('HH:mm')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {statusInfo.icon}
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
        />
      </div>
    </div>
  );
};

export default StudentHistoryCalendar; 