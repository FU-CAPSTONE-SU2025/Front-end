import { UserOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleTwoTone, EditOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Dayjs } from 'dayjs';
import { AdvisorData } from '../../api/student/StudentAPI';
import { Input, Button, Form } from 'antd';

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
  loading?: boolean;
  onConfirm: (formData: { titleStudentIssue: string; contentIssue: string }) => void;
  onCancel: () => void;
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BookingModal = ({
  visible,
  selectedAdvisor,
  selectedSlot,
  selectedDate,
  loading = false,
  onConfirm,
  onCancel
}: BookingModalProps) => {
  const [form] = Form.useForm();
  if (!selectedAdvisor || !selectedSlot) return null;

  const handleFinish = (values: { titleStudentIssue: string; contentIssue: string }) => {
    onConfirm(values);
    form.resetFields();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 md:p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96 }}
            transition={{ duration: 0.28 }}
            className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl md:shadow-3xl border-0 w-full max-w-4xl text-gray-800 flex flex-col md:flex-row overflow-hidden"
            style={{ minHeight: 480 }}
          >
            {/* Left: Info, gradient chủ đạo, icon lớn, spacing thoáng */}
            <div className="md:w-1/2 w-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 flex flex-col items-center justify-center p-10 md:p-12 gap-7 relative">
              <div className="absolute top-6 right-6 hidden md:block">
                <CheckCircleTwoTone twoToneColor="#52c41a" className="text-4xl opacity-80" />
              </div>
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-2 shadow-lg border-4 border-white/30">
                <CalendarOutlined className="text-white text-5xl" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-1 text-center text-white drop-shadow-lg tracking-tight">Book Advisor Meeting</h2>
              <p className="mb-2 text-white/90 text-lg text-center font-medium">Fill in your issue details to schedule a session</p>
              <div className="space-y-5 w-full max-w-xs mx-auto">
                <div className="flex items-center gap-4 p-4 bg-white/20 rounded-2xl shadow border border-white/30">
                  <UserOutlined className="text-white text-2xl" />
                  <div>
                    <div className="text-white/80 text-xs font-medium">Advisor</div>
                    <div className="font-semibold text-lg text-white drop-shadow">{selectedAdvisor.firstName} {selectedAdvisor.lastName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/20 rounded-2xl shadow border border-white/30">
                  <CalendarOutlined className="text-white text-2xl" />
                  <div>
                    <div className="text-white/80 text-xs font-medium">Date</div>
                    <div className="font-semibold text-lg text-white drop-shadow">{dayLabels[selectedSlot.dayInWeek % 7]} ({selectedDate.format('MMM DD, YYYY')})</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/20 rounded-2xl shadow border border-white/30">
                  <ClockCircleOutlined className="text-white text-2xl" />
                  <div>
                    <div className="text-white/80 text-xs font-medium">Time</div>
                    <div className="font-semibold text-lg text-white drop-shadow">{selectedSlot.startTime.slice(0,5)} - {selectedSlot.endTime.slice(0,5)}</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Form, giảm padding, căn giữa dọc tốt hơn */}
            <div className="md:w-1/2 w-full flex flex-col justify-center p-6 md:p-8 bg-white">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className="w-full max-w-md mx-auto"
              >
                <Form.Item
                  name="titleStudentIssue"
                  label={<span className="font-semibold text-base text-blue-900">Issue Title</span>}
                  rules={[{ required: true, message: 'Please enter the issue title!' }]}
                >
                  <Input 
                    placeholder="Enter the issue title..." 
                    size="large" 
                    className="rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:shadow-md transition bg-blue-50/40" 
                  />
                </Form.Item>
                <Form.Item
                  name="contentIssue"
                  label={<span className="font-semibold text-base text-purple-900">Issue Description</span>}
                  rules={[{ required: true, message: 'Please enter the issue description!' }]}
                >
                  <Input.TextArea 
                    placeholder="Describe your issue in detail..." 
                    rows={5} 
                    size="large" 
                    className="rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:shadow-md transition bg-purple-50/40"
                  />
                </Form.Item>
                <div className="flex justify-end gap-4 mt-8">
                  <Button
                    size="large"
                    className="bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:border-gray-400 rounded-xl px-8 py-3 text-base font-semibold"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="large"
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 hover:from-blue-600 hover:to-purple-600 border-none rounded-xl px-8 py-3 text-base font-bold shadow-lg text-white flex items-center gap-2"
                  >
                    <CheckCircleTwoTone twoToneColor="#fff" className="text-xl" />
                    Confirm Booking
                  </Button>
                </div>
              </Form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal; 