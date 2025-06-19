import { motion } from 'framer-motion';
import { Avatar, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';
import React from 'react';

interface Achievement {
  icon: string;
  label: string;
}
interface Contribution {
  month: string;
  value: number;
}
interface UserInfo {
  name: string;
  quote: string;
  avatar: string;
  achievements: Achievement[];
  contributions: Contribution[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.01, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)', transition: { duration: 0.3 } },
};

const UserInfoCard: React.FC<{ user: UserInfo }> = ({ user }) => (
  <motion.div
    className="w-full flex flex-col items-center glassmorphism rounded-2xl p-8 box-border"
    initial="hidden"
    animate="visible"
    variants={cardVariants}
    whileHover="hover"
  >
    <motion.div whileHover={{ scale: 1.03, rotate: 2 }} transition={{ duration: 0.3 }}>
      <Avatar
        src={user.avatar}
        size={180}
        icon={<UserOutlined />}
        className="border-4 border-white shadow-2xl mb-6"
      />
    </motion.div>
    <div className="text-3xl font-bold text-white mb-2">{user.name}</div>
    <div className="text-gray-300 text-lg italic mb-6">{user.quote}</div>
    <div className="flex gap-4 mb-8">
      {user.achievements.map((ach, idx) => (
        <Tooltip title={ach.label} key={idx}>
          <motion.span
            className="text-4xl cursor-pointer"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ duration: 0.2 }}
          >
            {ach.icon}
          </motion.span>
        </Tooltip>
      ))}
    </div>
    <div className="w-full">
      <div className="text-white font-semibold text-lg mb-4">Contributions</div>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={user.contributions}>
          <XAxis dataKey="month" stroke="#fff" fontSize={12} />
          <YAxis hide />
          <Bar dataKey="value" fill="#F97316" radius={[10, 10, 0, 0]} animationDuration={1000} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default UserInfoCard; 