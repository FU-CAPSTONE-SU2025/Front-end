import { Button, Badge, Segmented, Dropdown } from 'antd';
import { LeftOutlined, RightOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';

interface CalendarHeaderProps {
  selectedDate: Dayjs;
  viewMode: 'day' | 'week' | 'month';
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
  onPrevious: () => void;
  onNext: () => void;
  getVisitCount: () => number;
}

const CalendarHeader = ({
  selectedDate,
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  getVisitCount
}: CalendarHeaderProps) => {
  // Filter and Calendar dropdown items
  const filterItems = [
    { key: 'all', label: 'All Advisors' },
    { key: 'available', label: 'Available Only' },
    { key: 'busy', label: 'Busy Only' },
  ];

  const calendarItems = [
    { key: 'settings', label: 'Calendar Settings' },
    { key: 'export', label: 'Export Schedule' },
    { key: 'print', label: 'Print View' },
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      {/* Left side - Navigation and Date */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={onPrevious}
            className="w-10 h-10 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center"
          />
          <Button
            type="text"
            icon={<RightOutlined />}
            onClick={onNext}
            className="w-10 h-10 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center"
          />
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">
            {viewMode === 'day' 
              ? selectedDate.format('dddd, MMMM Do')
              : viewMode === 'week'
              ? `Week of ${selectedDate.startOf('week').format('MMM Do, YYYY')}`
              : selectedDate.format('MMMM YYYY')
            }
          </h2>
        
        </div>
      </div>

      {/* Right side - View options and controls */}
      <div className="flex items-center gap-4">
        <Segmented
          value={viewMode}
          onChange={v => onViewModeChange(v as 'day' | 'week' | 'month')}
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          className="bg-gray-100 rounded-lg p-1"
        />
     
      
      </div>
    </div>
  );
};

export default CalendarHeader; 