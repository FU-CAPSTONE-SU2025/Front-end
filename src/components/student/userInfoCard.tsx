import { motion } from 'framer-motion';
import { Avatar, Tooltip, Modal, Button } from 'antd';
import { UserOutlined, RiseOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, LabelList } from 'recharts';
import React, { useState } from 'react';

interface Achievement {
  icon: string;
  label: string;
}
interface GpaBySemester {
  semester: string;
  gpa: number;
}
interface UserInfo {
  name: string;
  quote: string;
  avatar: string;
  achievements: Achievement[];
  gpaHistory: GpaBySemester[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.01, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)', transition: { duration: 0.3 } },
};

function getTotalGpa(gpaHistory: GpaBySemester[]) {
  if (!gpaHistory.length) return 0;
  const sum = gpaHistory.reduce((acc, cur) => acc + cur.gpa, 0);
  return (sum / gpaHistory.length).toFixed(2);
}

const UserInfoCard: React.FC<{ user: UserInfo }> = ({ user }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const recentGpa = user.gpaHistory.slice(-3);
  const totalGpa = getTotalGpa(user.gpaHistory);

  return (
    <motion.div
      className="w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 lg:p-10 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover="hover"
    >
      <div className="flex flex-col items-center text-center z-10 relative">
        <motion.div whileHover={{ scale: 1.05, rotate: 2 }} transition={{ duration: 0.3 }}>
          <Avatar
            src={user.avatar}
            size={{ xs: 100, sm: 120, md: 140, lg: 160, xl: 180, xxl: 180 }}
            icon={<UserOutlined />}
            className="border-4 border-white/30 shadow-2xl mb-6"
          />
        </motion.div>
        <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {user.name}
        </div>
        <div className="text-gray-300 text-lg italic mb-6">
          {user.quote}
        </div>
        <div className="flex gap-4 mb-8 justify-center">
          {user.achievements.map((ach, idx) => (
            <Tooltip title={ach.label} key={idx}>
              <motion.span
                className="text-3xl sm:text-4xl cursor-pointer"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                {ach.icon}
              </motion.span>
            </Tooltip>
          ))}
        </div>
        {/* GPA Section - simple style */}
        <div className="w-full bg-white/10 rounded-2xl p-4 shadow border border-white/20 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <RiseOutlined className="text-blue-400 text-xl" />
              GPA by Semester
            </div>
            <Button
              type="primary"
              className="ml-2 font-bold px-4"
              onClick={() => setModalOpen(true)}
              size="middle"
              icon={<RiseOutlined />}
            >
              View All
            </Button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-base font-semibold">Recent 3 semesters</span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500 text-white font-bold text-lg shadow">
              <RiseOutlined /> {totalGpa}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={recentGpa} barSize={32}>
              <XAxis dataKey="semester" stroke="#222" fontSize={14} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 4]} fontSize={14} stroke="#222" tickLine={false} axisLine={false} />
              <ReTooltip wrapperStyle={{ zIndex: 1000 }} contentStyle={{ background: '#fff', color: '#222', borderRadius: 12, fontWeight: 600, fontSize: 16 }} />
              <Bar dataKey="gpa" fill="#3B82F6" radius={[10, 10, 0, 0]} animationDuration={1000}>
                <LabelList dataKey="gpa" position="top" fill="#222" fontSize={16} fontWeight={700} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* GPA Modal (keep simple) */}
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          centered
          className="gpa-modal-card"
          bodyStyle={{ background: 'rgba(255,255,255,0.97)', borderRadius: 24, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
        >
          <div className="mb-6 flex flex-col items-center">
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-800 mb-1">
              <RiseOutlined className="text-blue-400 text-2xl" />
              Full GPA History
            </div>
            <div className="text-base text-gray-500 mb-2">From <span className="font-bold text-gray-800">{user.gpaHistory[0]?.semester}</span> to <span className="font-bold text-gray-800">{user.gpaHistory[user.gpaHistory.length-1]?.semester}</span></div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white font-bold text-xl shadow mb-2">
              <RiseOutlined /> Total GPA: {totalGpa}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={user.gpaHistory} barSize={32}>
              <XAxis dataKey="semester" stroke="#222" fontSize={15} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 4]} fontSize={15} stroke="#222" tickLine={false} axisLine={false} />
              <ReTooltip wrapperStyle={{ zIndex: 1000 }} contentStyle={{ background: '#fff', color: '#222', borderRadius: 12, fontWeight: 600, fontSize: 16 }} />
              <Bar dataKey="gpa" fill="#3B82F6" radius={[10, 10, 0, 0]} animationDuration={1000}>
                <LabelList dataKey="gpa" position="top" fill="#222" fontSize={16} fontWeight={700} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Modal>
      </div>
    </motion.div>
  );
};

export default UserInfoCard; 