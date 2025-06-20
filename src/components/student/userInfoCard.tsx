import { motion } from 'framer-motion';
import { Avatar, Tooltip, Button } from 'antd';
import { UserOutlined, RiseOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, LabelList } from 'recharts';
import React, { useState, useRef } from 'react';
import GpaHistoryModal from './gpaFull';



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
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recentGpa = user.gpaHistory.slice(-3);
  const totalGpa = getTotalGpa(user.gpaHistory);

  const handleEditAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      className="w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 lg:p-10 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover="hover"
    >
      <div className="flex flex-col items-center text-center z-10 relative">
        <div className="relative mb-6">
          <motion.div whileHover={{ scale: 1.05, rotate: 2 }} transition={{ duration: 0.3 }}>
            <Avatar
              src={avatarUrl}
              size={{ xs: 100, sm: 120, md: 140, lg: 160, xl: 180, xxl: 180 }}
              icon={<UserOutlined />}
              className="border-4 border-white/30 shadow-2xl"
            />
          </motion.div>
          <button
            type="button"
            className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center bg-transparent hover:bg-orange-500 text-white border border-white rounded-full shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            style={{ zIndex: 2 }}
            onClick={handleEditAvatar}
            aria-label="Edit avatar"
          >
            <EditOutlined style={{ fontSize: 15, margin: 0, padding: 0, color: '#fff' }} />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>
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
              <RiseOutlined className="text-orange-400 text-xl" />
              Grade Point Average
            </div>
            <Tooltip title="View Full History">
              <Button
                type="text"
                shape="circle"
                icon={<EyeOutlined style={{ color: '#fff', fontSize: 20 }} />}
                onClick={() => setModalOpen(true)}
                size="large"
                className="border border-white bg-transparent hover:bg-orange-500 focus:bg-orange-500 text-white flex items-center justify-center transition-all duration-200"
                style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Tooltip>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-base font-semibold">Recent 3 semesters</span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500 text-white font-bold text-lg shadow">
              <RiseOutlined /> {totalGpa}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={recentGpa} margin={{ top: 20, right: 0, left: 0, bottom: -10 }}>
              <XAxis dataKey="semester" stroke="#a0a0a0" fontSize={12} tickLine={false} axisLine={false} />
              <ReTooltip
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, fontSize: 16 }}
              />
              <Bar dataKey="gpa" fill="#F97316" radius={[8, 8, 8, 8]} animationDuration={1000}>
                <LabelList dataKey="gpa" position="top" fill="#f0f0f0" fontSize={14} fontWeight={600} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      
        <GpaHistoryModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          gpaHistory={user.gpaHistory}
          totalGpa={totalGpa}
        />
      </div>
    </motion.div>
  );
};

export default UserInfoCard; 