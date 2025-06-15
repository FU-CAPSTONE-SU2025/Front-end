import { useState } from 'react';
import { Calendar, Button, Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs, { Dayjs } from 'dayjs';

interface Advisor {
  id: number;
  name: string;
  role: string;
  avatar: string;
  major: string;
}

const advisors: Advisor[] = [
  { id: 1, name: 'Marley Lubin', role: 'UI Designer', avatar: '', major: 'Design' },
  { id: 2, name: 'Thiên An', role: 'Frontend Mentor', avatar: '', major: 'Web' },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
];

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const disabledDate = (current: Dayjs) => current && current < dayjs().startOf('day');

  const handleDateSelect = (date: Dayjs) => setSelectedDate(date);
  const handleTimeSelect = (time: string) => setSelectedTime(time);
  const handleAdvisorSelect = (advisor: Advisor) => setSelectedAdvisor(advisor);
  const handleBook = () => {
    if (!selectedDate || !selectedTime || !selectedAdvisor) {
      message.error('Please select date, time, and advisor');
      return;
    }
    setModalVisible(true);
  };
  const handleConfirm = () => {
    setModalVisible(false);
    message.success('Booking successful!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="min-h-screen flex items-center justify-center p-4 font-inter pt-16"
    >
      <motion.div
        className="w-full max-w-6xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h2 className="text-center mb-6 text-white font-bold text-4xl tracking-tight drop-shadow-md">
          Advisor Booking
        </h2>
        <p className="text-center mb-8 text-lg text-gray-200 opacity-80">
          Select a date, time, and advisor to book your session
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="col-span-1"
          >
            <h3 className="mb-4 text-white font-semibold text-xl">Select Date</h3>
            <motion.div
              className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Calendar
                fullscreen={false}
                onSelect={handleDateSelect}
                disabledDate={disabledDate}
                className="rounded-xl border-none bg-transparent text-white"
              />
            </motion.div>
          </motion.div>
          {/* Time Slots and Advisors Section */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Time Slots */}
            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="mb-4 text-white font-semibold text-xl">Select Time</h3>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {timeSlots.map((slot, index) => (
                      <motion.div
                        key={slot}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          type={selectedTime === slot ? 'primary' : 'default'}
                          className={`w-full text-lg font-medium ${
                            selectedTime === slot
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          } border-none h-12`}
                          onClick={() => handleTimeSelect(slot)}
                        >
                          {slot}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Advisors */}
            <AnimatePresence>
              {selectedTime && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="mb-4 text-white font-semibold text-xl">Select Advisor</h3>
                  <div className="flex flex-col gap-6">
                    {advisors.map((advisor, index) => (
                      <motion.div
                        key={advisor.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div
                          className={`w-full cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br ${
                            selectedAdvisor?.id === advisor.id
                              ? 'from-blue-600/50 to-indigo-600/50 shadow-glow'
                              : 'from-gray-800/50 to-gray-900/50'
                          } backdrop-blur-md transition-all duration-300 relative p-5 flex items-center gap-4`}
                          onClick={() => handleAdvisorSelect(advisor)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="relative">
                              <div
                                className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 blur-md ${
                                  selectedAdvisor?.id === advisor.id ? 'opacity-100' : 'opacity-0'
                                } transition-opacity duration-300`}
                              ></div>
                              <Avatar
                                size={72}
                                src={advisor.avatar}
                                icon={<UserOutlined />}
                                className="relative border-2 border-white/30 shadow-md bg-gradient-to-r from-blue-400 to-indigo-400"
                              />
                            </div>
                          </motion.div>
                          <div className="flex-1">
                            <div className="font-bold text-xl text-white tracking-wide">
                              {advisor.name}
                            </div>
                            <div className="text-gray-200 font-medium opacity-80">
                              {advisor.role}
                            </div>
                            <div className="text-blue-300 text-sm font-semibold uppercase tracking-wider">
                              {advisor.major}
                            </div>
                          </div>
                          <motion.div
                            className="text-white font-semibold px-4 py-1 rounded-full bg-white/10"
                            animate={{
                              scale: selectedAdvisor?.id === advisor.id ? 1.1 : 1,
                            }}
                          >
                            {selectedAdvisor?.id === advisor.id ? 'Selected' : 'Select'}
                          </motion.div>
                          {selectedAdvisor?.id === advisor.id && (
                            <motion.div
                              className="absolute inset-0 border-2 border-blue-400 rounded-2xl pointer-events-none"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Booking Summary and Button */}
        <AnimatePresence>
          {selectedDate && selectedTime && selectedAdvisor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-10 text-center"
            >
              <h3 className="mb-4 text-white font-semibold text-xl">Booking Summary</h3>
              <motion.div
                className="mb-6 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-gray-200">
                  Date:{' '}
                  <span className="font-semibold text-white">
                    {selectedDate?.format('dddd, MMMM D, YYYY')}
                  </span>
                </div>
                <div className="text-gray-200">
                  Time: <span className="font-semibold text-white">{selectedTime}</span>
                </div>
                <div className="text-gray-200">
                  Advisor:{' '}
                  <span className="font-semibold text-white">{selectedAdvisor?.name}</span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Button
                  type="primary"
                  className="w-full max-w-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg h-14 border-none"
                  onClick={handleBook}
                >
                  Book Now
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Confirmation Modal */}
        <div
          className={`fixed inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
            modalVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: modalVisible ? 1 : 0, y: modalVisible ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-full max-w-md text-white"
          >
            <div className="text-center">
              <div className="text-2xl font-bold mb-4">Confirm Your Booking</div>
              <div className="mb-4 text-gray-200">Are you sure you want to book this session?</div>
              <div className="mb-2">
                Date:{' '}
                <span className="font-semibold">
                  {selectedDate?.format('dddd, MMMM D, YYYY')}
                </span>
              </div>
              <div className="mb-2">
                Time: <span className="font-semibold">{selectedTime}</span>
              </div>
              <div>
                Advisor:{' '}
                <span className="font-semibold">{selectedAdvisor?.name}</span>
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  className="bg-white/10 text-white border-none hover:bg-white/20"
                  onClick={() => setModalVisible(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none"
                  onClick={handleConfirm}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingPage;