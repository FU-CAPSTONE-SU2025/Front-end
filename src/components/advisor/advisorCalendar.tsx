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
  workingHours?: { start: number; end: number }; // e.g. { start: 8, end: 18 }
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
  workingHours = defaultWorkingHours,
}) => {
  // Generate working hours labels
  const generateWorkingHours = () => {
    const hours = [];
    for (let i = workingHours.start; i < workingHours.end; i++) {
      hours.push(i.toString().padStart(2, '0') + ':00');
    }
    return hours;
  };

  // Generate slots for a day
  const generateAllSlots = (date: Dayjs) => {
    const slots = [];
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      const start = dayjs(date).hour(hour).minute(0);
      const end = start.add(1, 'hour');
      const event = events.find(e =>
        dayjs(e.startDateTime).isSame(start, 'minute') &&
        dayjs(e.endDateTime).isSame(end, 'minute')
      );
      slots.push({
        id: event ? event.id : `${date.format('YYYY-MM-DD')}-${hour}`,
        startTime: start.format('HH:mm'),
        endTime: end.format('HH:mm'),
        event: event ?? null,
        date,
      });
    }
    return slots;
  };

  // Get slots for day or week
  const getSlots = (date: Dayjs) => {
    if (viewMode === 'week') {
      const weekStart = date.startOf('week');
      const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
      return days.map(day => ({ day, slots: generateAllSlots(day) }));
    } else {
      return [{ day: date, slots: generateAllSlots(date) }];
    }
  };

  const hours = generateWorkingHours();
  const slotsData = getSlots(selectedDate);

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Segmented
          options={['day', 'week']}
          value={viewMode}
          onChange={val => onViewModeChange && onViewModeChange(val as 'day' | 'week')}
        />
        <div>
          <Button onClick={() => onDateChange && onDateChange(selectedDate.subtract(1, viewMode))} icon={<LeftOutlined />} />
          <span style={{ margin: '0 8px', fontWeight: 500 }}>{viewMode === 'day' ? selectedDate.format('DD/MM/YYYY') : `${selectedDate.startOf('week').format('DD/MM/YYYY')} - ${selectedDate.endOf('week').format('DD/MM/YYYY')}`}</span>
          <Button onClick={() => onDateChange && onDateChange(selectedDate.add(1, viewMode))} icon={<RightOutlined />} />
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: 80 }}></th>
              {slotsData.map(({ day }) => (
                <th key={day.format('YYYY-MM-DD')} style={{ textAlign: 'center', padding: 8 }}>
                  {day.format('ddd, DD/MM')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, idx) => (
              <tr key={hour}>
                <td style={{ padding: 8, fontWeight: 500 }}>{hour}</td>
                {slotsData.map(({ day, slots }) => {
                  const slot = slots[idx];
                  return (
                    <td
                      key={day.format('YYYY-MM-DD') + '-' + hour}
                      style={{
                        border: '1px solid #f0f0f0',
                        minWidth: 120,
                        height: 48,
                        background: slot.event ? (slot.event.type === 'leave' ? '#ffeaea' : '#e6f7ff') : undefined,
                        cursor: 'pointer',
                        position: 'relative',
                        padding: 0,
                      }}
                      onClick={() => slot.event ? (onEventClick && onEventClick(slot.event)) : (onSlotClick && onSlotClick({ start: dayjs(day).hour(Number(hour.split(':')[0])).minute(0), end: dayjs(day).hour(Number(hour.split(':')[0])).add(1, 'hour') }, day))}
                    >
                      {slot.event && (
                        <div style={{ padding: 4, fontSize: 13, fontWeight: 500, color: slot.event.type === 'leave' ? '#d4380d' : '#096dd9' }}>
                          {slot.event.title || (slot.event.type === 'leave' ? 'Leave' : 'Work')}
                          {slot.event.note && <div style={{ fontSize: 11, color: '#888' }}>{slot.event.note}</div>}
                        </div>
                      )}
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