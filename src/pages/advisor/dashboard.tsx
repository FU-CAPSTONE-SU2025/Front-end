import React from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useCurrentAdvisor } from '../../hooks/useCurrentAdvisor';

const AdvisorDashboard: React.FC = () => {
  const advisor = useCurrentAdvisor();
  const initials = React.useMemo(() => {
    const a = [advisor.firstName, advisor.lastName].filter(Boolean);
    if (a.length === 0 && advisor.username) return advisor.username[0]?.toUpperCase() || 'A';
    return a.map(s => (s as string)[0]?.toUpperCase()).join('') || 'A';
  }, [advisor.firstName, advisor.lastName, advisor.username]);
  const stats = [
    {
      title: 'Total Students',
      value: 45,
      icon: <UserOutlined className="text-blue-500" />,
      color: 'blue'
    },
    {
      title: 'Today Appointments',
      value: 8,
      icon: <CalendarOutlined className="text-green-500" />,
      color: 'green'
    },
    {
      title: 'Pending Reports',
      value: 12,
      icon: <FileTextOutlined className="text-orange-500" />,
      color: 'orange'
    },
    {
      title: 'System Settings',
      value: 3,
      icon: <SettingOutlined className="text-purple-500" />,
      color: 'purple'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      student: 'John Smith',
      action: 'Scheduled consultation appointment',
      time: '2 minutes ago',
      type: 'appointment'
    },
    {
      id: 2,
      student: 'Sarah Johnson',
      action: 'Submitted academic report',
      time: '15 minutes ago',
      type: 'report'
    },
    {
      id: 3,
      student: 'Michael Brown',
      action: 'Updated personal information',
      time: '1 hour ago',
      type: 'update'
    },
    {
      id: 4,
      student: 'Emily Davis',
      action: 'Requested urgent appointment',
      time: '2 hours ago',
      type: 'urgent'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <CalendarOutlined className="text-blue-500" />;
      case 'report':
        return <FileTextOutlined className="text-green-500" />;
      case 'update':
        return <UserOutlined className="text-orange-500" />;
      case 'urgent':
        return <CalendarOutlined className="text-red-500" />;
      default:
        return <UserOutlined className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 mt-12 pt-5 px-6 bg-white">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="w-full rounded-2xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] items-center gap-4">
            {/* Title + subtitle */}
            <div className="min-w-0">
              <h1 className="text-[22px] sm:text-2xl font-semibold text-gray-900 truncate">
                {(() => {
                  const fullName = [advisor.firstName, advisor.lastName].filter(Boolean).join(' ');
                  if (fullName) return `Welcome back, ${fullName}`;
                  if (advisor.username) return `Welcome back, ${advisor.username}`;
                  return 'Welcome back, Advisor';
                })()}
              </h1>
              <p className="text-gray-600 text-sm sm:text-[15px] truncate">
                You have {stats[1].value} appointments and {stats[2].value} reports today.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-[12px]">
                {advisor.email && (
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">{advisor.email}</span>
                )}
                {advisor.userId && (
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">ID {advisor.userId}</span>
                )}
                {advisor.username && (
                  <span className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 border border-gray-200">@{advisor.username}</span>
                )}
              </div>
            </div>
            {/* Roles right-aligned */}
            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
              {(advisor.roles || []).map((r, idx) => (
                <span key={`${r}-${idx}`} className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.icon}
                  valueStyle={{ color: `var(--ant-color-${stat.color}-6)` }}
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card 
          title={
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-800">Quick Actions</span>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
          } 
          className="mb-6 shadow-lg border-0"
          bodyStyle={{ padding: '24px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div 
                  className="w-full h-20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    border: 'none'
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-white gap-1">
                    <UserOutlined className="text-2xl" />
                    <span className="text-sm font-medium">Student Management</span>
                  </div>
                </div>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div 
                  className="w-full h-20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none'
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-white gap-1">
                    <CalendarOutlined className="text-2xl" />
                    <span className="text-sm font-medium">Appointments</span>
                  </div>
                </div>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div 
                  className="w-full h-20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none'
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-white gap-1">
                    <FileTextOutlined className="text-2xl" />
                    <span className="text-sm font-medium">Reports</span>
                  </div>
                </div>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div 
                  className="w-full h-20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    border: 'none'
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-white gap-1">
                    <SettingOutlined className="text-2xl" />
                    <span className="text-sm font-medium">Settings</span>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card title="Recent Activities">
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <div className="text-xl">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{activity.student}</div>
                  <div className="text-sm text-gray-600">{activity.action}</div>
                </div>
                <div className="text-xs text-gray-400">{activity.time}</div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdvisorDashboard; 