import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Card, Segmented, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

export interface AdvisorCalendarEvent {
  id: number | string;
  startDateTime: string;
  endDateTime: string;
  type?: 'work' | 'leave';
  title?: string;
  note?: string;
  [key: string]: any;
}

interface AdvisorCalendarProps {
  events: AdvisorCalendarEvent[];
  viewMode: 'day' | 'week';
  selectedDate: Dayjs;
  onSlotClick?: (slot: { start: Dayjs; end: Dayjs }, date: Dayjs) => void;
  onEventClick?: (event: AdvisorCalendarEvent) => void;
  onDateChange?: (date: Dayjs) => void;
  onViewModeChange?: (mode: 'day' | 'week') => void;
  onEdit?: (event: AdvisorCalendarEvent) => void;
  onDelete?: (event: AdvisorCalendarEvent) => void;
  workingHours?: { start: number; end: number }; // e.g. { start: 8, end: 18 }
  isWorkSchedule?: boolean; // New prop to distinguish work vs leave calendar
  showNavigation?: boolean; // New prop to control navigation buttons visibility
}

const defaultWorkingHours = { start: 8, end: 18 };

const AdvisorCalendar: React.FC<AdvisorCalendarProps> = ({
  events,
  viewMode,
  selectedDate,
  onSlotClick,
  onEventClick,
  onDateChange,
  onViewModeChange,
  onEdit,
  onDelete,
  workingHours = defaultWorkingHours,
  isWorkSchedule = false, // Default to leave schedule behavior
  showNavigation = true, // Default to show navigation
}) => {
  // Generate working hours labels
  const generateWorkingHours = () => {
    const hours = [];
    for (let i = workingHours.start; i < workingHours.end; i++) {
      hours.push(i.toString().padStart(2, '0') + ':00');
    }
    return hours;
  };

  // Generate time slots for a day
  const generateTimeSlots = (date: Dayjs) => {
    const slots = [];
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      const start = dayjs(date).hour(hour).minute(0);
      const end = start.add(1, 'hour');
      
      // Find work events that overlap with this time slot
      const workEvents = events.filter(e => {
        if (e.type !== 'work') return false;
        const eventStart = dayjs(e.startDateTime);
        const eventEnd = dayjs(e.endDateTime);
        return eventStart.isBefore(end) && eventEnd.isAfter(start);
      });
      
      // Use the first work event (or null if none)
      const workEvent = workEvents.length > 0 ? workEvents[0] : null;
      
      slots.push({
        id: workEvent ? workEvent.id : `${date.format('YYYY-MM-DD')}-${hour}`,
        startTime: start.format('HH:mm'),
        endTime: end.format('HH:mm'),
        event: workEvent,
        date,
        type: 'work',
      });
    }
    return slots;
  };

  // Generate leave events for a day
  const generateLeaveEvents = (date: Dayjs) => {
    return events.filter(e => {
      if (e.type !== 'leave') return false;
      const eventStart = dayjs(e.startDateTime);
      const eventEnd = dayjs(e.endDateTime);
      return eventStart.isSame(date, 'day') || eventEnd.isSame(date, 'day') || 
             (eventStart.isBefore(date.endOf('day')) && eventEnd.isAfter(date.startOf('day')));
    }).map(event => ({
      id: event.id,
      event: event,
      date,
      type: 'leave',
      startTime: dayjs(event.startDateTime).format('HH:mm'),
      endTime: dayjs(event.endDateTime).format('HH:mm'),
      startHour: dayjs(event.startDateTime).hour(),
      endHour: dayjs(event.endDateTime).hour(),
    }));
  };

  // Get data for day or week
  const getDayData = (date: Dayjs) => {
    return {
      day: date,
      timeSlots: generateTimeSlots(date),
      leaveEvents: generateLeaveEvents(date),
    };
  };

  const getWeekData = (date: Dayjs) => {
      const weekStart = date.startOf('week');
      const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
    return days.map(day => getDayData(day));
  };

  const hours = generateWorkingHours();
  const data = viewMode === 'week' ? getWeekData(selectedDate) : [getDayData(selectedDate)];

  const handlePrevious = () => {
    const newDate = viewMode === 'day' 
      ? selectedDate.subtract(1, 'day')
      : selectedDate.subtract(1, 'week');
    onDateChange && onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = viewMode === 'day' 
      ? selectedDate.add(1, 'day')
      : selectedDate.add(1, 'week');
    onDateChange && onDateChange(newDate);
  };

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {onViewModeChange && (
          <Segmented
            options={['day', 'week']}
            value={viewMode}
            onChange={val => onViewModeChange(val as 'day' | 'week')}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showNavigation && (
            <Button 
              icon={<LeftOutlined />} 
              onClick={handlePrevious}
              size="small"
            />
          )}
          <span style={{ 
            margin: '0 8px', 
            fontWeight: 500, 
            minWidth: showNavigation ? '200px' : 'auto', 
            textAlign: 'center' 
          }}>
            {viewMode === 'day' 
              ? selectedDate.format('DD/MM/YYYY') 
              : isWorkSchedule 
                ? 'Week' // Show "Week" for work schedule
                : `${selectedDate.startOf('week').format('DD/MM/YYYY')} - ${selectedDate.endOf('week').format('DD/MM/YYYY')}` // Show date range for leave schedule
            }
          </span>
          {showNavigation && (
            <Button 
              icon={<RightOutlined />} 
              onClick={handleNext}
              size="small"
            />
          )}
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: 80, background: '#fafafa', border: '1px solid #d9d9d9', padding: '12px 8px' }}></th>
              {data.map(({ day }) => (
                <th key={day.format('YYYY-MM-DD')} style={{ 
                  textAlign: 'center', 
                  padding: '12px 8px', 
                  background: '#fafafa', 
                  border: '1px solid #d9d9d9',
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  <div>{day.format('dddd')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, idx) => (
              <tr key={hour}>
                <td style={{ 
                  padding: '8px', 
                  fontWeight: 500, 
                  background: '#fafafa',
                  border: '1px solid #d9d9d9',
                  textAlign: 'center',
                  fontSize: '13px'
                }}>
                  {hour}
                </td>
                {data.map(({ day, timeSlots, leaveEvents }) => {
                  const timeSlot = timeSlots[idx];
                  const currentHour = Number(hour.split(':')[0]);
                  const leaveEvent = leaveEvents.find(e => currentHour === e.startHour);
                  const coveringLeave = leaveEvents.find(e => currentHour > e.startHour && currentHour < e.endHour);
                  if (leaveEvent) {
                    const duration = leaveEvent.endHour - leaveEvent.startHour;
                    return (
                      <td
                        key={day.format('YYYY-MM-DD') + '-' + hour}
                        rowSpan={duration}
                        style={{
                          border: '1px solid #d9d9d9',
                          minWidth: 140,
                          background: '#fff2f0',
                          padding: 0,
                          verticalAlign: 'middle',
                          position: 'relative',
                        }}
                        onClick={() => onEventClick && onEventClick(leaveEvent.event)}
                      >
                        <div style={{
                           height: 60 * duration,
                           display: 'flex',
                           flexDirection: 'column',
                           alignItems: 'center',
                           justifyContent: 'center',
                           background: '#fff2f0',
                           borderRadius: '4px',
                           padding: '4px',
                           minHeight: '40px',
                         }}>
                           {60 * duration >= 80 ? (
                             <>
                               <div style={{ 
                                 fontSize: Math.min(14, 60 * duration / 8), 
                                 fontWeight: 600, 
                                 color: '#d4380d', 
                                 marginBottom: Math.min(4, 60 * duration / 20),
                                 textAlign: 'center',
                                 lineHeight: 1.2,
                               }}>
                                 Leave
                               </div>
                               <div style={{ 
                                 fontSize: Math.min(12, 60 * duration / 10), 
                                 color: '#666', 
                                 marginBottom: Math.min(4, 60 * duration / 20),
                                 textAlign: 'center',
                                 lineHeight: 1.1,
                               }}>
                                 {leaveEvent.startTime} - {leaveEvent.endTime}
                               </div>
                               {leaveEvent.event.note && (
                                 <div style={{ 
                                   fontSize: Math.min(11, 60 * duration / 12), 
                                   color: '#888', 
                                   fontStyle: 'italic',
                                   textAlign: 'center',
                                   lineHeight: 1.1,
                                   maxWidth: '100%',
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis',
                                 }}>
                                   {leaveEvent.event.note}
                                 </div>
                               )}
                             </>
                           ) : (
                             <div style={{ 
                               fontSize: Math.min(12, 60 * duration / 8), 
                               fontWeight: 600, 
                               color: '#d4380d', 
                               marginBottom: Math.min(2, 60 * duration / 30),
                               textAlign: 'center',
                               lineHeight: 1.2,
                             }}>
                               Leave
                             </div>
                           )}
                           <div style={{ 
                             display: 'flex', 
                             gap: Math.min(4, 60 * duration / 15), 
                             justifyContent: 'center', 
                             marginTop: Math.min(4, 60 * duration / 20),
                             flexWrap: 'wrap',
                           }}>
                             <Button 
                               size="small" 
                               type="primary" 
                               style={{ 
                                 fontSize: 60 * duration >= 80 ? Math.min(10, 60 * duration / 12) : Math.min(12, 60 * duration / 10), 
                                 height: 60 * duration >= 80 ? Math.min(24, 60 * duration / 3) : Math.min(28, 60 * duration / 2.5), 
                                 padding: 60 * duration >= 80 ? `0 ${Math.min(6, 60 * duration / 20)}px` : `0 ${Math.min(8, 60 * duration / 15)}px`,
                                 minWidth: 60 * duration >= 80 ? 'auto' : Math.min(50, 60 * duration / 3),
                               }} 
                               onClick={e => { 
                                 e.stopPropagation(); 
                                 onEdit && onEdit({ ...leaveEvent.event, id: leaveEvent.id }); 
                               }}
                             >
                               Edit
                             </Button>
                             <Button 
                               size="small" 
                               danger 
                               style={{ 
                                 fontSize: 60 * duration >= 80 ? Math.min(10, 60 * duration / 12) : Math.min(12, 60 * duration / 10), 
                                 height: 60 * duration >= 80 ? Math.min(24, 60 * duration / 3) : Math.min(28, 60 * duration / 2.5), 
                                 padding: 60 * duration >= 80 ? `0 ${Math.min(6, 60 * duration / 20)}px` : `0 ${Math.min(8, 60 * duration / 15)}px`,
                                 minWidth: 60 * duration >= 80 ? 'auto' : Math.min(50, 60 * duration / 3),
                               }} 
                               onClick={e => { 
                                 e.stopPropagation(); 
                                 onDelete && onDelete({ ...leaveEvent.event, id: leaveEvent.id }); 
                               }}
                             >
                               Delete
                             </Button>
                           </div>
                         </div>
                      </td>
                    );
                  }
                  if (coveringLeave) {
                    return null;
                  }
                  if (timeSlot.event) {
                    return (
                      <td
                        key={day.format('YYYY-MM-DD') + '-' + hour}
                        style={{
                          border: '1px solid #d9d9d9',
                          minWidth: 140,
                          background: '#f0f9ff',
                          padding: 0,
                          verticalAlign: 'top',
                        }}
                        onClick={() => onEventClick && onEventClick(timeSlot.event)}
                      >
                        <div style={{ 
                          padding: Math.min(8, 60 / 8), 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between',
                          minHeight: '40px',
                        }}>
                          {60 >= 80 ? (
                            <>
                              <div>
                                <div style={{ 
                                  fontSize: Math.min(14, 60 / 5), 
                                  fontWeight: 600, 
                                  color: '#096dd9', 
                                  marginBottom: Math.min(4, 60 / 15),
                                  lineHeight: 1.2,
                                }}>
                                  {timeSlot.event.title || 'Work'}
                                </div>
                                <div style={{ 
                                  fontSize: Math.min(12, 60 / 6), 
                                  color: '#666', 
                                  marginBottom: Math.min(4, 60 / 15),
                                  lineHeight: 1.1,
                                }}>
                                  {dayjs(timeSlot.event.startDateTime).format('HH:mm')} - {dayjs(timeSlot.event.endDateTime).format('HH:mm')}
                                </div>
                                {timeSlot.event.note && (
                                  <div style={{ 
                                    fontSize: Math.min(11, 60 / 7), 
                                    color: '#888', 
                                    fontStyle: 'italic',
                                    lineHeight: 1.1,
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}>
                                    {timeSlot.event.note}
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <div style={{ 
                              fontSize: Math.min(12, 60 / 5), 
                              fontWeight: 600, 
                              color: '#096dd9', 
                              marginBottom: Math.min(2, 60 / 30),
                              lineHeight: 1.2,
                            }}>
                              {timeSlot.event.title || 'Work'}
                            </div>
                          )}
                          <div style={{ 
                            display: 'flex', 
                            gap: Math.min(4, 60 / 15), 
                            justifyContent: 'center', 
                            marginTop: Math.min(4, 60 / 15),
                            flexWrap: 'wrap',
                          }}>
                            <Button
                              size="small"
                              type="primary"
                              style={{ 
                                fontSize: 60 >= 80 ? Math.min(10, 60 / 7) : Math.min(12, 60 / 6), 
                                height: 60 >= 80 ? Math.min(24, 60 / 3) : Math.min(28, 60 / 2.5), 
                                padding: 60 >= 80 ? `0 ${Math.min(6, 60 / 20)}px` : `0 ${Math.min(8, 60 / 15)}px`,
                                minWidth: 60 >= 80 ? 'auto' : Math.min(50, 60 / 3),
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit && onEdit(timeSlot.event);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              danger
                              style={{ 
                                fontSize: 60 >= 80 ? Math.min(10, 60 / 7) : Math.min(12, 60 / 6), 
                                height: 60 >= 80 ? Math.min(24, 60 / 3) : Math.min(28, 60 / 2.5), 
                                padding: 60 >= 80 ? `0 ${Math.min(6, 60 / 20)}px` : `0 ${Math.min(8, 60 / 15)}px`,
                                minWidth: 60 >= 80 ? 'auto' : Math.min(50, 60 / 3),
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete && onDelete(timeSlot.event);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </td>
                    );
                  }
                  // Empty slot
                  return (
                    <td
                      key={day.format('YYYY-MM-DD') + '-' + hour}
                      style={{
                        border: '1px solid #d9d9d9',
                        minWidth: 140,
                        background: '#ffffff',
                        padding: 0,
                        verticalAlign: 'top',
                      }}
                      onClick={() => onSlotClick && onSlotClick({ start: dayjs(day).hour(Number(hour.split(':')[0])).minute(0), end: dayjs(day).hour(Number(hour.split(':')[0])).add(1, 'hour') }, day)}
                    >
                      <div style={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#ccc', 
                        fontSize: Math.min(12, 60 / 6),
                        lineHeight: 1.1,
                        padding: Math.min(4, 60 / 15),
                        textAlign: 'center',
                      }}>
                        Click to add
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AdvisorCalendar;