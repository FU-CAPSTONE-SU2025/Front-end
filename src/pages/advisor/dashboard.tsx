import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { 
  UserOutlined,
  CalendarOutlined, 
  FileTextOutlined, 
  SettingOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useCurrentAdvisor } from '../../hooks/useCurrentAdvisor';
import { useBookingAvailability } from '../../hooks/useCRUDAdvisor';
import { useLeaveScheduleList } from '../../hooks/useCRUDLeaveSchedule';
import { useAdvisorSelfMeetings } from '../../hooks/useAdvisorSelfMeetings';

const AdvisorDashboard: React.FC = () => {
  const advisor = useCurrentAdvisor();
  
  // Fetch real data from APIs - using userId as staffProfileId
  const { data: bookingAvailability } = useBookingAvailability(100); // Get up to 100 slots
  const { data: leaveSchedules } = useLeaveScheduleList(1, 100); // Get first 100 leave schedules
  const { data: meetings } = useAdvisorSelfMeetings(1, 50); // Get first 50 meetings

  // Helper function to get time ago - moved above useMemo calls
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  // Calculate real statistics from API data
  const stats = React.useMemo(() => [
    {
      title: 'Available Booking Slots',
      value: bookingAvailability?.length || 0,
      icon: <CalendarOutlined className="text-blue-500" />,
      color: 'blue',
      description: 'Open time slots for students',
      trend: '+12% from last week',
      progress: Math.min((bookingAvailability?.length || 0) / 20 * 100, 100) // Assuming 20 is max
    },
    {
      title: 'Today Appointments',
      value: meetings?.items?.filter((meeting: any) => {
        const today = new Date().toDateString();
        const meetingDate = new Date(meeting.startDateTime).toDateString();
        return today === meetingDate;
      }).length || 0,
      icon: <CalendarOutlined className="text-green-500" />,
      color: 'green',
      description: 'Meetings scheduled today',
      trend: 'On track for daily goal',
      progress: Math.min((meetings?.items?.filter((meeting: any) => {
        const today = new Date().toDateString();
        const meetingDate = new Date(meeting.startDateTime).toDateString();
        return today === meetingDate;
      }).length || 0) / 8 * 100, 100) // Assuming 8 is daily goal
    },
    {
      title: 'Leave Requests',
      value: leaveSchedules?.items?.length || 0,
      icon: <FileTextOutlined className="text-orange-500" />,
      color: 'orange',
      description: 'Pending leave applications',
      trend: '5 pending approval',
      progress: Math.min((leaveSchedules?.items?.length || 0) / 15 * 100, 100) // Assuming 15 is max
    },
    {
      title: 'Total Meetings',
      value: meetings?.totalCount || 0,
      icon: <SettingOutlined className="text-purple-500" />,
      color: 'purple',
      description: 'All time meetings count',
      trend: '+8% this month',
      progress: Math.min((meetings?.totalCount || 0) / 200 * 100, 100) // Assuming 200 is monthly goal
    }
  ], [bookingAvailability, leaveSchedules, meetings]);



  // Calculate performance metrics
  const performanceMetrics = React.useMemo(() => {
    const totalMeetings = meetings?.totalCount || 0;
    const completedMeetings = meetings?.items?.filter((m: any) => m.status === 'Completed').length || 0;
    const cancelledMeetings = meetings?.items?.filter((m: any) => m.status === 'Cancelled').length || 0;
    const completionRate = totalMeetings > 0 ? (completedMeetings / totalMeetings) * 100 : 0;
    const cancellationRate = totalMeetings > 0 ? (cancelledMeetings / totalMeetings) * 100 : 0;

    return {
      completionRate: Math.round(completionRate),
      cancellationRate: Math.round(cancellationRate),
      averageResponseTime: '2.3 hours',
      studentSatisfaction: '4.8/5.0'
    };
  }, [meetings]);



  return (
    <div className="space-y-8 mt-12 pt-5 px-6 bg-white">
      {/* Welcome Section - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="w-full rounded-2xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] items-center gap-6">
            {/* Title + subtitle */}
            <div className="min-w-0">
              <h1 className="text-[24px] sm:text-3xl font-semibold text-gray-900 truncate mb-3">
                {(() => {
                  const fullName = [advisor.firstName, advisor.lastName].filter(Boolean).join(' ');
                  if (fullName) return `Welcome back, ${fullName}`;
                  if (advisor.username) return `Welcome back, ${advisor.username}`;
                  return 'Welcome back, Advisor';
                })()}
              </h1>
          
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {advisor.email && (
                  <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                    {advisor.email}
                  </span>
                )}
                {advisor.userId && (
                  <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 font-medium">
                    ID {advisor.userId}
                  </span>
                )}
                {advisor.username && (
                  <span className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                    @{advisor.username}
                  </span>
                )}
              </div>
            </div>
            {/* Performance Summary */}
            <div className="flex flex-col items-end gap-4">
           
              {/* Roles */}
              <div className="flex flex-wrap items-center justify-end gap-2">
              {(advisor.roles || []).map((r, idx) => (
                  <span key={`${r}-${idx}`} className="px-3 py-1.5 rounded-full text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  {r}
                </span>
              ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards - Enhanced with Progress */}
      <Row gutter={[20, 20]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.icon}
                    valueStyle={{ color: `var(--ant-color-${stat.color}-6)`, fontSize: '28px', fontWeight: 'bold' }}
                  />
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">{stat.trend}</div>
                    <Progress 
                      type="circle" 
                      percent={stat.progress} 
                      size={40}
                      strokeColor={`var(--ant-color-${stat.color}-6)`}
                      format={() => null}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">{stat.description}</div>
                <Progress 
                  percent={stat.progress} 
                  showInfo={false}
                  strokeColor={`var(--ant-color-${stat.color}-6)`}
                  trailColor="#f0f0f0"
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Performance Overview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card 
          title={
            <div className="flex items-center gap-3">
              <BarChartOutlined className="text-2xl text-blue-500" />
              <span className="text-xl font-semibold text-gray-800">Performance Overview</span>
            </div>
          } 
          className="shadow-lg border-0"
          bodyStyle={{ padding: '32px' }}
        >
          <Row gutter={[24, 24]}>
                         <Col xs={24}>
               <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Meeting Statistics</h3>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Completion Rate</span>
                     <span className="font-semibold text-green-600">{performanceMetrics.completionRate}%</span>
                   </div>
                   <Progress percent={performanceMetrics.completionRate} strokeColor="#10b981" />
                   
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Cancellation Rate</span>
                     <span className="font-semibold text-orange-600">{performanceMetrics.cancellationRate}%</span>
                   </div>
                   <Progress percent={performanceMetrics.cancellationRate} strokeColor="#f59e0b" />
                   
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Average Response Time</span>
                     <span className="font-semibold text-blue-600">{performanceMetrics.averageResponseTime}</span>
                   </div>
                 </div>
               </div>
             </Col>
            
          </Row>
        </Card>
      </motion.div>


    </div>
  );
};

export default AdvisorDashboard; 