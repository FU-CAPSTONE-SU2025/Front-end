import { Calendar, Tooltip } from 'antd';
import { ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { AdvisorData, LeaveScheduleData } from '../../api/student/StudentAPI';

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

interface WorkSlot {
  id: number | string;
  startTime: string;
  endTime: string;
  dayInWeek: number;
  staffProfileId: number;
  type?: string;
}

interface CalendarViewProps {
  viewMode: 'day' | 'week' | 'month';
  selectedDate: Dayjs;
  selectedAdvisor: AdvisorData | null;
  mockWorkSlots: WorkSlot[];
  leaveSchedules?: LeaveScheduleData[];
  onDateChange: (date: Dayjs) => void;
  onSlotClick: (slot: WorkSlot, date: Dayjs) => void;
  onViewModeChange?: (mode: 'day' | 'week' | 'month') => void; // Thêm prop này
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView = ({
  viewMode,
  selectedDate,
  selectedAdvisor,
  mockWorkSlots,
  leaveSchedules = [],
  onDateChange,
  onSlotClick,
  onViewModeChange
}: CalendarViewProps) => {
  // Generate working hours (8 AM to 6 PM)
  const generateWorkingHours = () => {
    const hours = [];
    for (let i = 8; i <= 18; i++) {
      hours.push(i.toString().padStart(2, '0') + ':00');
    }
    return hours;
  };

  // Get work slots for a specific date
  const getWorkSlotsForDate = (date: Dayjs) => {
    if (!selectedAdvisor) return [];
    const day = date.day(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const baseSlots = mockWorkSlots.filter((slot: WorkSlot) => {
      // Convert slot.dayInWeek (1=Monday, 7=Sunday) to JavaScript day (0=Sunday, 1=Monday, ..., 6=Saturday)
      const slotDay = slot.dayInWeek === 7 ? 0 : slot.dayInWeek;
      return slotDay === day && slot.staffProfileId === selectedAdvisor.staffDataDetailResponse?.id;
    });

    // Split slots by leave schedule if needed
    const processedSlots: WorkSlot[] = [];
    baseSlots.forEach(slot => {
      if (isSlotOverlappingWithLeave(slot, date)) {
        const splitSlots = splitSlotByLeave(slot, date);
        processedSlots.push(...splitSlots);
      } else {
        processedSlots.push(slot);
      }
    });

    return processedSlots;
  };

  // Check if a date has leave schedule
  const hasLeaveSchedule = (date: Dayjs) => {
    if (!selectedAdvisor || !leaveSchedules) return false;
    const staffProfileId = selectedAdvisor.staffDataDetailResponse?.id;
    if (!staffProfileId) return false;

    return leaveSchedules.some(leave => {
      const leaveStart = dayjs(leave.startDateTime);
      const leaveEnd = dayjs(leave.endDateTime);
      return leave.staffProfileId === staffProfileId && 
             date.isSame(leaveStart, 'day') || 
             date.isBetween(leaveStart, leaveEnd, 'day', '[]');
    });
  };

  // Check if a date is in the past
  const isDateInPast = (date: Dayjs) => {
    const today = dayjs().startOf('day');
    return date.isBefore(today);
  };

  // Check if a date is today
  const isDateToday = (date: Dayjs) => {
    return date.isSame(dayjs(), 'day');
  };

  // Check if a specific hour is within leave schedule
  const isHourInLeaveSchedule = (date: Dayjs, hour: string) => {
    if (!selectedAdvisor || !leaveSchedules) return false;
    const staffProfileId = selectedAdvisor.staffDataDetailResponse?.id;
    if (!staffProfileId) return false;

    const currentHour = parseInt(hour.split(':')[0]);
    const currentDate = date.hour(currentHour);

    return leaveSchedules.some(leave => {
      const leaveStart = dayjs(leave.startDateTime);
      const leaveEnd = dayjs(leave.endDateTime);
      return leave.staffProfileId === staffProfileId && 
             currentDate.isBetween(leaveStart, leaveEnd, 'hour', '[]');
    });
  };

  // Get leave schedule for a specific date
  const getLeaveScheduleForDate = (date: Dayjs) => {
    if (!selectedAdvisor || !leaveSchedules) return null;
    const staffProfileId = selectedAdvisor.staffDataDetailResponse?.id;
    if (!staffProfileId) return null;

    // Sửa lại: trả về leave nếu ngày nằm trong khoảng nghỉ
    return leaveSchedules.find(leave => {
      const leaveStart = dayjs(leave.startDateTime);
      const leaveEnd = dayjs(leave.endDateTime);
      return leave.staffProfileId === staffProfileId && 
             date.isBetween(leaveStart, leaveEnd, 'day', '[]');
    });
  };

  // Check if a slot overlaps with leave schedule
  const isSlotOverlappingWithLeave = (slot: WorkSlot, date: Dayjs) => {
    const leaveSchedule = getLeaveScheduleForDate(date);
    if (!leaveSchedule) return false;

    const slotStart = dayjs(date).hour(parseInt(slot.startTime.split(':')[0]));
    const slotEnd = dayjs(date).hour(parseInt(slot.endTime.split(':')[0]));
    const leaveStart = dayjs(leaveSchedule.startDateTime);
    const leaveEnd = dayjs(leaveSchedule.endDateTime);

    return slotStart.isBefore(leaveEnd) && slotEnd.isAfter(leaveStart);
  };

  // Split slot by leave schedule
  const splitSlotByLeave = (slot: WorkSlot, date: Dayjs) => {
    const leaveSchedule = getLeaveScheduleForDate(date);
    if (!leaveSchedule) return [slot];

    const slotStart = dayjs(date).hour(parseInt(slot.startTime.split(':')[0]));
    const slotEnd = dayjs(date).hour(parseInt(slot.endTime.split(':')[0]));
    const leaveStart = dayjs(leaveSchedule.startDateTime);
    const leaveEnd = dayjs(leaveSchedule.endDateTime);

    const slots = [];

    // Before leave
    if (slotStart.isBefore(leaveStart)) {
      const beforeLeaveEnd = leaveStart.isBefore(slotEnd) ? leaveStart : slotEnd;
      slots.push({
        ...slot,
        id: `${slot.id}-before`,
        startTime: slot.startTime,
        endTime: beforeLeaveEnd.format('HH:mm'),
        type: 'available'
      });
    }

    // After leave
    if (slotEnd.isAfter(leaveEnd)) {
      const afterLeaveStart = leaveEnd.isAfter(slotStart) ? leaveEnd : slotStart;
      slots.push({
        ...slot,
        id: `${slot.id}-after`,
        startTime: afterLeaveStart.format('HH:mm'),
        endTime: slot.endTime,
        type: 'available'
      });
    }

    return slots;
  };

  // Check if a slot is active at a specific hour
  const isSlotActiveAtHour = (slot: WorkSlot, hour: string) => {
    const slotStartHour = parseInt(slot.startTime.split(':')[0]);
    const slotEndHour = parseInt(slot.endTime.split(':')[0]);
    const currentHour = parseInt(hour.split(':')[0]);
    return slotStartHour <= currentHour && currentHour < slotEndHour;
  };

  // Get slot start and end hours
  const getSlotHours = (slot: WorkSlot) => {
    const startHour = parseInt(slot.startTime.split(':')[0]);
    const endHour = parseInt(slot.endTime.split(':')[0]);
    return { startHour, endHour };
  };

  // Calculate slot height based on duration
  const getSlotHeight = (slot: WorkSlot) => {
    const { startHour, endHour } = getSlotHours(slot);
    const duration = endHour - startHour;
    return duration * 60; // 60px per hour
  };

  // Calculate slot top position
  const getSlotTopPosition = (slot: WorkSlot) => {
    const { startHour } = getSlotHours(slot);
    const baseHour = 8; // Start from 8 AM
    return (startHour - baseHour) * 60; // 60px per hour
  };

  // Get slot type color
  const getSlotTypeColor = (type?: string) => {
    switch (type) {
      case 'consultation':
        return 'from-orange-500 to-blue-600';
      case 'meeting':
        return 'from-orange-400 to-blue-500';
      case 'review':
        return 'from-orange-600 to-blue-700';
      default:
        return 'from-orange-500 to-blue-600';
    }
  };

  // Khi click slot ở month view, chuyển sang week view
  const handleSlotClick = (slot: WorkSlot, date: Dayjs) => {
    if (viewMode === 'month' && onViewModeChange) {
      onViewModeChange('week');
      onDateChange(date);
    } else {
      onSlotClick(slot, date);
    }
  };

  // Calendar tháng: click vào ngày cũng chuyển sang week view
  const handlePanelDateSelect = (date: Dayjs) => {
    if (viewMode === 'month' && onViewModeChange) {
      onViewModeChange('week');
      onDateChange(date);
    } else {
      onDateChange(date);
    }
  };

  // Render work slots on calendar
  const dateCellRender = (date: Dayjs) => {
    if (!selectedAdvisor) return null;
    
    // Check if date is in the past
    const isPast = isDateInPast(date);
    
    // Get leave schedule and slots
    const leaveSchedule = getLeaveScheduleForDate(date);
    const slots = getWorkSlotsForDate(date);
    const hasLeave = !!leaveSchedule;
    
    // Limit the number of slots to display to keep consistent height
    const maxSlotsToShow = 2;
    const displaySlots = slots.slice(0, maxSlotsToShow);
    const hasMoreSlots = slots.length > maxSlotsToShow;
    
    return (
      <div className="flex flex-col gap-0.5 mt-1">
        {/* Leave schedule indicator - compact version */}
        {hasLeave && (
          <Tooltip title={`Leave: ${dayjs(leaveSchedule!.startDateTime).format('HH:mm')} - ${dayjs(leaveSchedule!.endDateTime).format('HH:mm')}`} placement="top">
            <motion.div
              className="bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded px-1.5 py-1 text-xs flex items-center justify-center shadow-sm border border-white/20 cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
            >
              <CloseCircleOutlined className="text-xs mr-1" />
              <span className="font-medium truncate text-xs">Leave</span>
            </motion.div>
          </Tooltip>
        )}
        
        {/* Available slots - compact version */}
        {displaySlots.map(slot => (
          <motion.div
            key={slot.id}
            className={`bg-gradient-to-r ${getSlotTypeColor(slot.type)} text-white rounded px-1.5 py-1 text-xs flex items-center justify-center shadow-sm transition-all duration-200 border border-white/20 ${
              isPast ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
            }`}
            whileHover={isPast ? {} : { scale: 1.02 }}
            whileTap={isPast ? {} : { scale: 0.98 }}
            onClick={isPast ? undefined : () => handleSlotClick(slot, date)}
          >
            <ClockCircleOutlined className="text-xs mr-1" />
            <span className="font-medium truncate text-xs">{slot.startTime.slice(0,5)}-{slot.endTime.slice(0,5)}</span>
          </motion.div>
        ))}
        
        {/* Show more indicator */}
        {hasMoreSlots && (
          <Tooltip title={`${slots.length - maxSlotsToShow} more slots available`} placement="top">
            <div className="text-xs text-blue-600 font-medium text-center py-0.5 cursor-pointer hover:text-blue-700">
              +{slots.length - maxSlotsToShow} more
            </div>
          </Tooltip>
        )}
      </div>
    );
  };

  // Custom Day View
  const renderDayView = () => {
    const hours = generateWorkingHours();
    const slots = getWorkSlotsForDate(selectedDate);
    const leaveSchedule = getLeaveScheduleForDate(selectedDate);
    const hasLeave = !!leaveSchedule;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Day header */}
        <div className={`border-b border-gray-200 px-6 py-4 ${
          hasLeave 
            ? 'bg-gradient-to-r from-gray-50 to-gray-100' 
            : 'bg-gradient-to-r from-slate-50 to-slate-100'
        }`}>
          <h3 className="text-xl font-bold text-gray-800">
            {selectedDate.format('dddd, MMMM Do, YYYY')}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {hasLeave 
              ? `Available slots with leave from ${dayjs(leaveSchedule?.startDateTime).format('HH:mm')} to ${dayjs(leaveSchedule?.endDateTime).format('HH:mm')}`
              : `${slots.length} available time slots`
            }
          </p>
        </div>
        
        {/* Timeline */}
        <div className="max-h-96 overflow-y-auto">
          <div className="relative">
            {/* Time labels */}
            <div className="absolute left-0 top-0 w-24 bg-gray-50 border-r border-gray-200 z-10">
              {hours.map((hour) => (
                <div key={hour} className="h-15 px-4 py-2 text-sm font-semibold text-gray-700 flex items-center">
                  {hour}
                </div>
              ))}
            </div>
            
            {/* Content area with positioned slots */}
            <div className="ml-24 relative" style={{ height: `${hours.length * 60}px` }}>
              {/* Leave schedule overlay */}
              {hasLeave && (
                <motion.div
                  className="absolute left-4 right-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl shadow-lg opacity-80"
                  style={{
                    top: `${getSlotTopPosition({ id: 'leave', startTime: dayjs(leaveSchedule!.startDateTime).format('HH:mm'), endTime: '00:00', dayInWeek: 0, staffProfileId: 0 })}px`,
                    height: `${getSlotHeight({ id: 'leave', startTime: dayjs(leaveSchedule!.startDateTime).format('HH:mm'), endTime: dayjs(leaveSchedule!.endDateTime).format('HH:mm'), dayInWeek: 0, staffProfileId: 0 })}px`,
                    minHeight: '60px'
                  }}
                >
                  <div className="flex items-center justify-center h-full text-white font-medium">
                    <CloseCircleOutlined className="mr-2" />
                    Leave: {dayjs(leaveSchedule!.startDateTime).format('HH:mm')} - {dayjs(leaveSchedule!.endDateTime).format('HH:mm')}
                  </div>
                </motion.div>
              )}
              
              {/* Available slots */}
              {slots.map(slot => {
                const topPosition = getSlotTopPosition(slot);
                const height = getSlotHeight(slot);
                
                return (
                  <motion.div
                    key={slot.id}
                    className={`absolute left-4 right-4 bg-gradient-to-r ${getSlotTypeColor(slot.type)} rounded-xl shadow-lg transition-all duration-200 ${
                      isDateInPast(selectedDate) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'
                    }`}
                    style={{
                      top: `${topPosition}px`,
                      height: `${height}px`,
                      minHeight: '60px'
                    }}
                    whileHover={isDateInPast(selectedDate) ? {} : { scale: 1.02, y: -2 }}
                    onClick={isDateInPast(selectedDate) ? undefined : () => onSlotClick(slot, selectedDate)}
                  >
                    <div className="flex items-center justify-center h-full text-white font-medium">
                      <ClockCircleOutlined className="mr-2" />
                      {slot.startTime.slice(0,5)} - {slot.endTime.slice(0,5)}
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Hour grid lines */}
              {hours.map((hour, index) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-b border-gray-100"
                  style={{ top: `${index * 60}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Custom Week View
  const renderWeekView = () => {
    const hours = generateWorkingHours();
    const weekStart = selectedDate.startOf('week');
    const weekDays: Dayjs[] = [];
    
    for (let i = 0; i < 7; i++) {
      weekDays.push(weekStart.add(i, 'day'));
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Week header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">
            Week of {weekStart.format('MMM Do, YYYY')}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {weekDays.reduce((total, day) => total + getWorkSlotsForDate(day).length, 0)} total slots this week
          </p>
        </div>
        
        {/* Week grid */}
        <div className="max-h-96 overflow-y-auto">
          {/* Day headers */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-24 border-r border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">
              Time
            </div>
            {weekDays.map((day, index) => (
              <div key={index} className="flex-1 px-3 py-3 text-center border-r border-gray-200 last:border-r-0">
                <div className="text-sm font-semibold text-gray-800">{dayLabels[day.day()]}</div>
                <div className="text-xs text-gray-500">{day.format('MMM Do')}</div>
              </div>
            ))}
          </div>
          
          {/* Week timeline with positioned slots */}
          <div className="relative">
            {/* Time labels */}
            <div className="absolute left-0 top-0 w-24 bg-gray-50 border-r border-gray-200 z-10">
              {hours.map((hour) => (
                <div key={hour} className="h-15 px-4 py-2 text-sm font-semibold text-gray-700 flex items-center">
                  {hour}
                </div>
              ))}
            </div>
            
            {/* Content area */}
            <div className="ml-24 relative" style={{ height: `${hours.length * 60}px` }}>
              {/* Day columns */}
              {weekDays.map((day, dayIndex) => {
                const daySlots = getWorkSlotsForDate(day);
                const leaveSchedule = getLeaveScheduleForDate(day);
                const hasLeave = !!leaveSchedule;
                
                return (
                  <div 
                    key={dayIndex} 
                    className="absolute top-0 bottom-0 border-r border-gray-100 last:border-r-0"
                    style={{ 
                      left: `${(dayIndex * 100) / 7}%`,
                      width: `${100 / 7}%`
                    }}
                  >
                    {/* Leave schedule overlay */}
                    {hasLeave && (
                      <motion.div
                        className="absolute left-1 right-1 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg shadow-md opacity-80"
                        style={{
                          top: `${getSlotTopPosition({ id: 'leave', startTime: dayjs(leaveSchedule!.startDateTime).format('HH:mm'), endTime: '00:00', dayInWeek: 0, staffProfileId: 0 })}px`,
                          height: `${getSlotHeight({ id: 'leave', startTime: dayjs(leaveSchedule!.startDateTime).format('HH:mm'), endTime: dayjs(leaveSchedule!.endDateTime).format('HH:mm'), dayInWeek: 0, staffProfileId: 0 })}px`,
                          minHeight: '30px'
                        }}
                      >
                        <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                          <CloseCircleOutlined className="mr-1" />
                          Leave
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Available slots */}
                    {daySlots.map(slot => {
                      const topPosition = getSlotTopPosition(slot);
                      const height = getSlotHeight(slot);
                      
                      return (
                        <motion.div
                          key={slot.id}
                          className={`absolute left-1 right-1 bg-gradient-to-r ${getSlotTypeColor(slot.type)} rounded-lg shadow-md transition-all duration-200 ${
                            isDateInPast(day) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'
                          }`}
                          style={{
                            top: `${topPosition}px`,
                            height: `${height}px`,
                            minHeight: '30px'
                          }}
                          whileHover={isDateInPast(day) ? {} : { scale: 1.02 }}
                          onClick={isDateInPast(day) ? undefined : () => onSlotClick(slot, day)}
                        />
                      );
                    })}
                  </div>
                );
              })}
              
              {/* Hour grid lines */}
              {hours.map((hour, index) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-b border-gray-100"
                  style={{ top: `${index * 60}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render calendar tháng nếu viewMode === 'month'
  if (viewMode === 'month') {
    return (
      <Calendar
        value={selectedDate}
        dateCellRender={dateCellRender}
        onSelect={handlePanelDateSelect}
        fullscreen={true}
        className="advisor-calendar-enhanced"
      />
    );
  }

  return (
    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
      {viewMode === 'day' ? (
        renderDayView()
      ) : viewMode === 'week' ? (
        renderWeekView()
      ) : (
        <Calendar
          value={selectedDate}
          onPanelChange={(date, mode) => { onDateChange(date); }}
          onSelect={date => onDateChange(date)}
          mode="month"
          dateCellRender={dateCellRender}
          className="advisor-calendar-enhanced"
          headerRender={undefined}
        />
      )}
    </div>
  );
};

export default CalendarView; 