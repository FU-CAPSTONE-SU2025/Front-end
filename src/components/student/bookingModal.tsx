import { Button } from 'antd';
import { UserOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Dayjs } from 'dayjs';
import { AdvisorData } from '../../api/student/StudentAPI';

interface WorkSlot {
  id: number | string;
  startTime: string;
  endTime: string;
  dayInWeek: number;
  staffProfileId: number;
  type?: string;
}

interface BookingModalProps {
  visible: boolean;
  selectedAdvisor: AdvisorData | null;
  selectedSlot: WorkSlot | null;
  selectedDate: Dayjs;
  onConfirm: () => void;
  onCancel: () => void;
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BookingModal = ({
  visible,
  selectedAdvisor,
  selectedSlot,
  selectedDate,
  onConfirm,
  onCancel
}: BookingModalProps) => {
  if (!selectedAdvisor || !selectedSlot) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-gray-200 p-10 w-full max-w-lg text-gray-800 shadow-2xl"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarOutlined className="text-white text-3xl" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Confirm Booking</h2>
              <p className="mb-8 text-gray-600 text-lg">Are you sure you want to book this session?</p>
              
              <div className="space-y-4 mb-8 text-left">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <UserOutlined className="text-blue-500 text-xl" />
                  <div>
                    <div className="text-gray-500 text-sm font-medium">Advisor</div>
                    <div className="font-semibold text-lg">
                      {selectedAdvisor.firstName} {selectedAdvisor.lastName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <CalendarOutlined className="text-purple-500 text-xl" />
                  <div>
                    <div className="text-gray-500 text-sm font-medium">Date</div>
                    <div className="font-semibold text-lg">
                      {dayLabels[selectedSlot.dayInWeek % 7]} ({selectedDate.format('MMM DD, YYYY')})
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <ClockCircleOutlined className="text-green-500 text-xl" />
                  <div>
                    <div className="text-gray-500 text-sm font-medium">Time</div>
                    <div className="font-semibold text-lg">
                      {selectedSlot.startTime.slice(0,5)} - {selectedSlot.endTime.slice(0,5)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-6">
                <Button
                  size="large"
                  className="bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:border-gray-400 rounded-xl px-8 py-3 text-base"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  size="large"
                  type="primary"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-none rounded-xl px-8 py-3 text-base shadow-lg"
                  onClick={onConfirm}
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal; 