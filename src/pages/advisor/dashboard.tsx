import React from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const AdvisorDashboard: React.FC = () => {
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold  text-gray-800 mb-2">
          Welcome back, Advisor!
        </h1>
        <p className="text-gray-600">
          You have {stats[1].value} appointments and {stats[2].value} reports to process today.
        </p>
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
        <Card title="Quick Actions" className="mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Button 
                type="primary" 
                size="large" 
                block
                icon={<UserOutlined />}
                className="h-16 flex flex-col items-center justify-center"
              >
                <span>Student Management</span>
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button 
                type="default" 
                size="large" 
                block
                icon={<CalendarOutlined />}
                className="h-16 flex flex-col items-center justify-center"
              >
                <span>Appointments</span>
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button 
                type="default" 
                size="large" 
                block
                icon={<FileTextOutlined />}
                className="h-16 flex flex-col items-center justify-center"
              >
                <span>Reports</span>
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button 
                type="default" 
                size="large" 
                block
                icon={<SettingOutlined />}
                className="h-16 flex flex-col items-center justify-center"
              >
                <span>Settings</span>
              </Button>
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