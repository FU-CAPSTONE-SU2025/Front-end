import { motion } from 'framer-motion';
import dayjs, { Dayjs } from 'dayjs';
import { AdvisorMeetingItem } from '../../interfaces/IStudent';

interface WorkSlot {
  id: number | string;
  startTime: string;
  endTime: string;
  dayInWeek: number;
  type?: string;
  meeting?: AdvisorMeetingItem | null;
}

interface HistoryCalendarViewProps {
  viewMode: 'day' | 'week';
  selectedDate: Dayjs;
  meetings: AdvisorMeetingItem[];
  onDateChange: (date: Dayjs) => void;
  onSlotClick: (slot: WorkSlot, date: Dayjs) => void;
  onViewModeChange?: (mode: 'day' | 'week') => void;
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HistoryCalendarView = ({
  viewMode,
  selectedDate,
  meetings,
  onDateChange,
  onSlotClick,
  onViewModeChange
}: HistoryCalendarViewProps) => {
  // Generate working hours (8 AM to 6 PM)
  const generateWorkingHours = () => {
    const hours = [];
    for (let i = 8; i < 18; i++) {
      hours.push(i.toString().padStart(2, '0') + ':00');
    }
    return hours;
  };

  // Generate all slots for a day
  const generateAllSlots = (date: Dayjs) => {
    const slots: WorkSlot[] = [];
    for (let hour = 8; hour < 18; hour++) {
      const start = dayjs(date).hour(hour).minute(0);
      const end = start.add(1, 'hour');
      const meeting = meetings.find(m =>
        dayjs(m.startDateTime).isSame(start, 'minute') &&
        dayjs(m.endDateTime).isSame(end, 'minute')
      );
      slots.push({
        id: meeting ? meeting.id : `${date.format('YYYY-MM-DD')}-${hour}`,
        startTime: start.format('HH:mm'),
        endTime: end.format('HH:mm'),
        dayInWeek: date.day(),
        type: meeting ? 'booked' : 'available',
        meeting: meeting ?? null,
      });
    }
    return slots;
  };

  // Get slots for day or week
  const getWorkSlots = (date: Dayjs) => {
    if (viewMode === 'week') {
      const weekStart = date.startOf('week');
      const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
      return days.flatMap(day => generateAllSlots(day));
    } else {
      return generateAllSlots(date);
    }
  };

  // Helpers for slot position
  const getSlotHeight = (slot: WorkSlot) => 60;
  const getSlotTopPosition = (slot: WorkSlot) => (parseInt(slot.startTime.split(':')[0]) - 8) * 60;

  // Helpers for block position
  const getBlockTop = (start: Dayjs) => (start.hour() + start.minute() / 60 - 8) * 60;
  const getBlockHeight = (start: Dayjs, end: Dayjs) => Math.max(30, (end.diff(start, 'minute') / 60) * 60);

  // Render Day View (meeting block động)
  const renderDayView = () => {
    const hours = generateWorkingHours();
    // Lấy tất cả meeting trong ngày này
    const dayMeetings = meetings.filter(m => dayjs(m.startDateTime).isSame(selectedDate, 'day'));
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100">
          <h3 className="text-xl font-bold text-gray-800">{selectedDate.format('dddd, MMMM Do, YYYY')}</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <div className="relative">
            <div className="absolute left-0 top-0 w-24 bg-gray-50 border-r border-gray-200 z-10">
              {hours.map(hour => (
                <div key={hour} className="h-15 px-4 py-2 text-sm font-semibold text-gray-700 flex items-center">{hour}</div>
              ))}
            </div>
            <div className="ml-24 relative" style={{ height: `${hours.length * 60}px` }}>
              {dayMeetings.map(meeting => {
                const start = dayjs(meeting.startDateTime);
                const end = dayjs(meeting.endDateTime);
                const top = getBlockTop(start);
                const height = getBlockHeight(start, end);
                return (
                  <motion.div
                    key={meeting.id}
                    className="absolute left-4 right-4 bg-gradient-to-r from-orange-400 to-blue-500 rounded-xl shadow-lg border-2 border-blue-400 flex items-center justify-center cursor-pointer"
                    style={{ top: `${top}px`, height: `${height}px`, minHeight: '30px', zIndex: 2 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => onSlotClick({
                      id: meeting.id,
                      startTime: start.format('HH:mm'),
                      endTime: end.format('HH:mm'),
                      dayInWeek: start.day(),
                      type: 'booked',
                      meeting
                    }, selectedDate)}
                  >
                    <div className="flex flex-col items-center justify-center w-full h-full text-white font-bold">
                      <span className="text-base">{meeting.titleStudentIssue || 'Booked'}</span>
                      <span className="text-xs font-normal mt-1">{start.format('HH:mm')} - {end.format('HH:mm')}</span>
                    </div>
                  </motion.div>
                );
              })}
              {hours.map((hour, index) => (
                <div key={hour} className="absolute left-0 right-0 border-b border-gray-100" style={{ top: `${index * 60}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Week View (meeting block động)
  const renderWeekView = () => {
    const hours = generateWorkingHours();
    const weekStart = selectedDate.startOf('week');
    const weekDays: Dayjs[] = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(weekStart.add(i, 'day'));
    }
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">Week of {weekStart.format('MMM Do, YYYY')}</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-24 border-r border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">Time</div>
            {weekDays.map((day, index) => (
              <div key={index} className="flex-1 px-3 py-3 text-center border-r border-gray-200 last:border-r-0">
                <div className="text-sm font-semibold text-gray-800">{dayLabels[day.day()]}</div>
                <div className="text-xs text-gray-500">{day.format('MMM Do')}</div>
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="absolute left-0 top-0 w-24 bg-gray-50 border-r border-gray-200 z-10">
              {hours.map(hour => (
                <div key={hour} className="h-15 px-4 py-2 text-sm font-semibold text-gray-700 flex items-center">{hour}</div>
              ))}
            </div>
            <div className="ml-24 relative" style={{ height: `${hours.length * 60}px` }}>
              {weekDays.map((day, dayIndex) => {
                // Lấy meeting của từng ngày
                const dayMeetings = meetings.filter(m => dayjs(m.startDateTime).isSame(day, 'day'));
                return (
                  <div key={dayIndex} className="absolute top-0 bottom-0 border-r border-gray-100 last:border-r-0" style={{ left: `${(dayIndex * 100) / 7}%`, width: `${100 / 7}%` }}>
                    {dayMeetings.map(meeting => {
                      const start = dayjs(meeting.startDateTime);
                      const end = dayjs(meeting.endDateTime);
                      const top = getBlockTop(start);
                      const height = getBlockHeight(start, end);
                      return (
                        <motion.div
                          key={meeting.id}
                          className="absolute left-1 right-1 bg-gradient-to-r from-orange-400 to-blue-500 rounded-lg shadow-md border-2 border-blue-400 flex items-center justify-center cursor-pointer"
                          style={{ top: `${top}px`, height: `${height}px`, minHeight: '30px', zIndex: 2 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => onSlotClick({
                            id: meeting.id,
                            startTime: start.format('HH:mm'),
                            endTime: end.format('HH:mm'),
                            dayInWeek: start.day(),
                            type: 'booked',
                            meeting
                          }, day)}
                        >
                          <div className="flex flex-col items-center justify-center w-full h-full text-white font-bold">
                            <span className="text-xs">{meeting.titleStudentIssue || 'Booked'}</span>
                            <span className="text-[10px] font-normal mt-0.5">{start.format('HH:mm')} - {end.format('HH:mm')}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
              {hours.map((hour, index) => (
                <div key={hour} className="absolute left-0 right-0 border-b border-gray-100" style={{ top: `${index * 60}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
      {viewMode === 'day' ? renderDayView() : renderWeekView()}
    </div>
  );
};

export default HistoryCalendarView; 