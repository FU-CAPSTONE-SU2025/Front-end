import React, { useState } from 'react';
import { Calendar, List, Button, Typography } from 'antd';
import { ClockCircleOutlined, VideoCameraOutlined } from '@ant-design/icons';
import BookingLayout from '../../components/student/BookingLayout';

const { Title } = Typography;

const timeSlots = [
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
];

const BookingPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <BookingLayout>
      {/* Left Panel */}
      <div className="w-full max-w-xs p-10 border-r border-gray-100 flex flex-col gap-8 bg-white/80 backdrop-blur-md">
        <div>
          <Title level={4} className="!mb-0 !text-gray-900">Thiên An</Title>
          <Title level={2} className="!mb-2 !text-gray-900">30 Minute Meeting</Title>
          <div className="flex items-center gap-2 text-gray-500 text-base mb-2">
            <ClockCircleOutlined />
            <span>30 min</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-base">
            <VideoCameraOutlined />
            <span>Web conferencing details provided upon confirmation.</span>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex justify-between text-xs text-gray-400">
          <a href="#" className="hover:underline">Cookie settings</a>
          <a href="#" className="hover:underline">Report abuse</a>
        </div>
        <Button className="mt-4 w-full border-gray-300" type="default">Troubleshoot</Button>
      </div>
      {/* Right Panel */}
      <div className="flex-1 p-10 flex flex-col gap-8 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="!mb-0 !text-gray-900">Select a Date & Time</Title>
        </div>
        <div className="flex gap-12 items-start">
          <div>
            <Calendar
              fullscreen={false}
              onSelect={date => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
              className="rounded-xl border border-gray-200 shadow-sm bg-white/80 backdrop-blur-md"
            />
          </div>
          <div className="flex-1">
            <div className="text-gray-500 mb-4 min-h-[28px] text-lg font-medium">
              {selectedDate ? selectedDate.format('dddd, MMMM D') : 'Select a date'}
            </div>
            <List
              dataSource={selectedDate ? timeSlots : []}
              renderItem={item => (
                <List.Item className="mb-4 p-0">
                  <Button
                    block
                    disabled={!selectedDate}
                    className={`border border-blue-400 text-blue-500 font-semibold rounded-lg py-3 text-lg transition-all duration-150 ${selectedTime === item ? 'bg-blue-50 border-blue-600' : 'bg-white'}`}
                    onClick={() => setSelectedTime(item)}
                  >
                    {item}
                  </Button>
                </List.Item>
              )}
              locale={{ emptyText: selectedDate ? 'No time slots' : 'Please select a date first' }}
            />
          </div>
        </div>
      </div>
    </BookingLayout>
  );
};

export default BookingPage; 