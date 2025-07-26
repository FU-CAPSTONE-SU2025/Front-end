import { useState, useEffect } from 'react';
import { Divider, message, Spin, Modal } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// Extend dayjs with isSameOrAfter plugin
dayjs.extend(isSameOrAfter);
import { useAdvisors, useLeaveSchedules, useBookingAvailability, usePrefetchAdvisorData, useAdvisorDataManager } from '../../hooks/useStudentFeature';
import AdvisorList from '../../components/student/advisorList';
import CalendarHeader from '../../components/student/calendarHeader';
import SelectedAdvisorInfo from '../../components/student/selectedAdvisorInfo';
import CalendarView from '../../components/student/calendarView';
import BookingModal from '../../components/student/bookingModal';
import { AdvisorData, BookingAvailabilityData, CreateBookingMeeting, getAdvisorMeetings } from '../../api/student/StudentAPI';
import { CreateBookingMeetingRequest, AdvisorMeetingItem } from '../../interfaces/IStudent';

interface WorkSlot {
  id: number | string;
  startTime: string;
  endTime: string;
  dayInWeek: number;
  staffProfileId: number;
  type?: string;
}

// Convert BookingAvailabilityData to WorkSlot format
const convertBookingAvailabilityToWorkSlots = (bookingData: BookingAvailabilityData[]): WorkSlot[] => {
  return bookingData.map(item => ({
    id: item.id,
    startTime: item.startTime,
    endTime: item.endTime,
    dayInWeek: item.dayInWeek,
    staffProfileId: item.staffProfileId,
    type: 'available' // Default type for available slots
  }));
};

const BookingPage = () => {
  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<WorkSlot | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [meetings, setMeetings] = useState<AdvisorMeetingItem[]>([]);

  // Fetch advisors using hook
  const { data: advisorsData, isLoading, error } = useAdvisors({ page: 1, pageSize: 20 });

  // Get staffProfileId from selected advisor
  const staffProfileId = selectedAdvisor?.staffDataDetailResponse?.id || null;

  // Fetch leave schedules and booking availability for selected advisor
  const { data: leaveSchedulesData } = useLeaveSchedules(staffProfileId);
  const { data: bookingAvailabilityData } = useBookingAvailability(staffProfileId);

  // Prefetch hook for better performance
  const { prefetchAdvisorData } = usePrefetchAdvisorData();
  
  // Cache management hook
  const { invalidateAdvisorData } = useAdvisorDataManager();

  // Convert booking availability to work slots
  const workSlots = Array.isArray(bookingAvailabilityData)
    ? convertBookingAvailabilityToWorkSlots(bookingAvailabilityData)
    : [];

  useEffect(() => {
    if (advisorsData?.items && advisorsData.items.length > 0 && !selectedAdvisor) {
      setSelectedAdvisor(advisorsData.items[0]);
    }
  }, [advisorsData, selectedAdvisor]);

  // Prefetch data when advisor is selected
  useEffect(() => {
    if (selectedAdvisor?.staffDataDetailResponse?.id) {
      prefetchAdvisorData(selectedAdvisor.staffDataDetailResponse.id);
    }
  }, [selectedAdvisor, prefetchAdvisorData]);

  // Fetch meetings when advisor changes
  useEffect(() => {
    const fetchMeetings = async () => {
      if (staffProfileId) {
        const res = await getAdvisorMeetings(staffProfileId);
        setMeetings(res?.items || []);
      } else {
        setMeetings([]);
      }
    };
    fetchMeetings();
  }, [staffProfileId]);

  // Navigation functions
  const goToPrevious = () => {
    const today = dayjs().startOf('day');
    let newDate: Dayjs;

    if (viewMode === 'month') {
      newDate = selectedDate.subtract(1, 'month');
    } else if (viewMode === 'week') {
      newDate = selectedDate.subtract(1, 'week');
    } else {
      newDate = selectedDate.subtract(1, 'day');
    }

    // Only allow navigation if the new date is not in the past
    if (newDate.isSameOrAfter(today, 'day')) {
      setSelectedDate(newDate);
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setSelectedDate(selectedDate.add(1, 'month'));
    } else if (viewMode === 'week') {
      setSelectedDate(selectedDate.add(1, 'week'));
    } else {
      setSelectedDate(selectedDate.add(1, 'day'));
    }
  };

  // Mock visit count
  const getVisitCount = () => {
    return Math.floor(Math.random() * 50) + 10;
  };

  // Handle slot click
  const handleSlotClick = (slot: WorkSlot, date: Dayjs) => {
    setSelectedSlot(slot);
    setSelectedDate(date);
    setModalVisible(true);
  };

  // Handle date change
  const handleDateChange = (date: Dayjs) => {
    setSelectedDate(date);
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle confirm booking
  const handleConfirm = async (formData: { titleStudentIssue: string; contentIssue: string }) => {
    if (!selectedAdvisor || !selectedSlot || !selectedDate) return;
    setBookingLoading(true);
    try {
      const startDateTime = selectedDate.format('YYYY-MM-DD') + 'T' + selectedSlot.startTime.slice(0,5);
      const endDateTime = selectedDate.format('YYYY-MM-DD') + 'T' + selectedSlot.endTime.slice(0,5);
      const payload: CreateBookingMeetingRequest = {
        staffProfileId: selectedSlot.staffProfileId,
        startDateTime,
        endDateTime,
        titleStudentIssue: formData.titleStudentIssue,
        contentIssue: formData.contentIssue,
      };
      console.log("Booking payload:", payload);
      const result = await CreateBookingMeeting(payload);
      if (result) {
        setModalVisible(false);
        message.success('Booking successful!');
        setSelectedSlot(null);
        if (selectedAdvisor?.staffDataDetailResponse?.id) {
          invalidateAdvisorData(selectedAdvisor.staffDataDetailResponse.id);
        }
      } else {
        // Show only error messages from backend (no key, just content)
        if (result === null && (window as any).lastBookingError) {
          const err = (window as any).lastBookingError;
          console.error('Booking API error:', err); // Debug log
          let errorMsg = '';
          if (err.errors) {
            const errorLines: string[] = [];
            for (const key in err.errors) {
              if (Array.isArray(err.errors[key])) {
                errorLines.push(...err.errors[key]);
              } else {
                errorLines.push(err.errors[key]);
              }
            }
            errorMsg = errorLines.join('\n');
          }
          if (!errorMsg && err.message) {
            errorMsg = err.message;
          }
          if (!errorMsg) {
            errorMsg = 'Booking failed. Please try again!';
          }
          Modal.error({
            title: 'Booking Failed',
            content: <pre style={{whiteSpace:'pre-wrap',fontFamily:'inherit'}}>{errorMsg}</pre>,
            centered: true,
          });
        } else {
          message.error('Booking failed. Please try again!');
        }
      }
    } catch (err: any) {
      if (err && err.response && err.response.data) {
        const data = err.response.data;
        console.error('Booking API error:', data); // Debug log
        let errorMsg = '';
        if (data.errors) {
          const errorLines: string[] = [];
          for (const key in data.errors) {
            if (Array.isArray(data.errors[key])) {
              errorLines.push(...data.errors[key]);
            } else {
              errorLines.push(data.errors[key]);
            }
          }
          errorMsg = errorLines.join('\n');
        }
        if (!errorMsg && data.message) {
          errorMsg = data.message;
        }
        if (!errorMsg) {
          errorMsg = 'Booking failed. Please try again!';
        }
        Modal.error({
          title: 'Booking Failed',
          content: <pre style={{whiteSpace:'pre-wrap',fontFamily:'inherit'}}>{errorMsg}</pre>,
          centered: true,
        });
      } else {
        message.error('An error occurred while booking!');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col w-full min-h-screen overflow-x-hidden font-inter bg-gradient-to-br from-orange-500 to-blue-900"
    >
      <div className="w-full max-w-8xl mx-auto mt-10 p-12">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 flex overflow-hidden">
          {/* Left: Advisor List */}
          <motion.div
            className="w-96 bg-gray-50 border-r border-gray-200 py-10 px-6 flex flex-col"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-gray-800 font-bold text-2xl mb-3">Book Advisors</h2>
              <p className="text-gray-600 text-base">Select an advisor to view their schedule</p>
            </div>
            <Divider/>
            <div className="flex-1">
              <AdvisorList
                advisors={advisorsData?.items || []}
                selectedAdvisor={selectedAdvisor}
                onAdvisorSelect={setSelectedAdvisor}
                isLoading={isLoading}
                error={error}
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                onSearch={handleSearch}
              />
            </div>
          </motion.div>

          {/* Right: Calendar */}
          <motion.div 
            className="flex-1 p-10 min-h-[800px] bg-white"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Calendar Header */}
            <CalendarHeader
              selectedDate={selectedDate}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onPrevious={goToPrevious}
              onNext={goToNext}
              getVisitCount={getVisitCount}
            />

            {/* Selected Advisor Info */}
            <SelectedAdvisorInfo selectedAdvisor={selectedAdvisor} />

            {/* Calendar View */}
            <CalendarView
              viewMode={viewMode}
              selectedDate={selectedDate}
              selectedAdvisor={selectedAdvisor}
              mockWorkSlots={workSlots}
              leaveSchedules={leaveSchedulesData?.items || []}
              meetings={meetings}
              onDateChange={handleDateChange}
              onSlotClick={handleSlotClick}
              onViewModeChange={setViewMode}
            />
          </motion.div>
        </div>

        {/* Booking Modal */}
        <BookingModal
          visible={modalVisible}
          selectedAdvisor={selectedAdvisor}
          selectedSlot={selectedSlot}
          selectedDate={selectedDate}
          loading={bookingLoading}
          onConfirm={handleConfirm}
          onCancel={() => setModalVisible(false)}
        />
      </div>

      <style>{`
        .advisor-calendar-enhanced .ant-picker-calendar {
          background: transparent !important;
        }
        .advisor-calendar-enhanced .ant-picker-calendar-header {
          display: none !important;
        }
        .advisor-calendar-enhanced .ant-picker-calendar-date {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 16px !important;
          margin: 4px !important;
          transition: all 0.3s ease !important;
          height: 140px !important;
          min-height: 140px !important;
          max-height: 140px !important;
          padding: 8px !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .advisor-calendar-enhanced .ant-picker-calendar-date:hover {
          background: #f8fafc !important;
          border-color: #3b82f6 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
        .advisor-calendar-enhanced .ant-picker-calendar-date-value {
          color: #374151 !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          margin-bottom: 8px !important;
        }
        .advisor-calendar-enhanced .ant-picker-calendar-date-today .ant-picker-calendar-date-value {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
          color: white !important;
          border-radius: 50% !important;
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 14px !important;
        }
        .advisor-calendar-enhanced .ant-picker-calendar-column-header {
          color: #6b7280 !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          padding: 16px 0 !important;
        }
        .advisor-calendar-enhanced .ant-picker-calendar-date-content {
          height: auto !important;
          min-height: 80px !important;
          max-height: 100px !important;
          overflow: hidden !important;
        }
        .advisor-calendar-enhanced .ant-picker-calendar-date-today {
          border-color: #3b82f6 !important;
          background: #f0f9ff !important;
        }
        .advisor-calendar-enhanced .ant-picker-calendar-date-past {
          opacity: 0.5 !important;
          pointer-events: none !important;
        }
        .advisor-calendar-enhanced .ant-picker-calendar-date-past .ant-picker-calendar-date-value {
          color: #9ca3af !important;
        }
      `}</style>
    </motion.div>
  );
};

export default BookingPage;