import { UserOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Dayjs } from 'dayjs';
import { useState } from 'react';
import { Input, Button, Form } from 'antd';
import { dayOptions } from '../../interfaces/IDayOptions';
import { AdvisorData } from '../../interfaces/IStudent';

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
            style={{ minHeight: 420 }}
          >
            {/* Left: Info */}
            <div className="md:w-1/2 w-full bg-gradient-to-br from-blue-100 via-purple-100 to-white flex flex-col items-center justify-center p-8 md:p-12 gap-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <CalendarOutlined className="text-white text-4xl" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-1 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Book an Advisor Meeting</h2>
              <p className="mb-2 text-gray-600 text-base text-center font-medium">Please provide details about your issue below</p>
              <div className="space-y-4 w-full max-w-xs mx-auto">
                <div className="flex items-center gap-4 p-4 bg-white/80 rounded-2xl shadow border border-blue-100">
                  <UserOutlined className="text-blue-500 text-2xl" />
                  <div>
                    <div className="text-gray-500 text-xs font-medium">Advisor</div>
                    <div className="font-semibold text-lg">
                      {selectedAdvisor.firstName} {selectedAdvisor.lastName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/80 rounded-2xl shadow border border-purple-100">
                  <CalendarOutlined className="text-purple-500 text-2xl" />
                  <div>
                    <div className="text-gray-500 text-xs font-medium">Date</div>
                    <div className="font-semibold text-lg">
                      {dayOptions.find(day => day.value === selectedSlot.dayInWeek)?.label} ({selectedDate.format('MMM DD, YYYY')})
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/80 rounded-2xl shadow border border-green-100">
                  <ClockCircleOutlined className="text-green-500 text-2xl" />
                  <div>
                    <div className="text-gray-500 text-xs font-medium">Time</div>
                    <div className="font-semibold text-lg">
                      {selectedSlot.startTime.slice(0,5)} - {selectedSlot.endTime.slice(0,5)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Form */}
            <div className="md:w-1/2 w-full flex flex-col justify-center p-8 md:p-12 bg-white">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className="w-full max-w-md mx-auto"
              >
                <Form.Item
                  name="titleStudentIssue"
                  label={<span className="font-semibold text-base">Issue Title</span>}
                  rules={[{ required: true, message: 'Please enter the issue title!' }]}
                >
                  <Input 
                    placeholder="Enter the issue title..." 
                    size="large" 
                    className="rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:shadow-md transition" 
                  />
                </Form.Item>
                <Form.Item
                  name="contentIssue"
                  label={<span className="font-semibold text-base">Issue Description</span>}
                  rules={[{ required: true, message: 'Please enter the issue description!' }]}
                >
                  <Input.TextArea 
                    placeholder="Describe your issue in detail..." 
                    rows={5} 
                    size="large" 
                    className="rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:shadow-md transition"
                  />
                </Form.Item>
                <div className="flex justify-between gap-4 mt-8">
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
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-none rounded-xl px-8 py-3 text-base font-bold shadow-lg text-white"
                  >
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