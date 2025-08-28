import React from 'react';
import { Card, Typography, Divider, Tag } from 'antd';
import { UserOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface SidebarProps {
  syllabus: any;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const SubjectOverview: React.FC<{ subj: any }> = ({ subj }) => (
  <motion.div variants={itemVariants}>
    <Card
      bordered={false}
      className="shadow-sm border border-gray-100"
      bodyStyle={{ padding: 24 }}
    >
      <Title level={4} className="text-gray-900 mb-4">Subject Overview</Title>
      <div className="space-y-4">
        <div>
          <Text strong className="text-gray-700 block mb-2">Description</Text>
          <Text className="text-gray-600" style={{ whiteSpace: 'pre-line' }}>{subj.description}</Text>
        </div>
        <div>
          <Text strong className="text-gray-700 block mb-2">Prerequisites</Text>
          <Text className="text-gray-600">{subj.prerequisites || 'None'}</Text>
        </div>
        
        <Divider className="my-4" />
        
        <div className="flex flex-wrap gap-2">
          <Tag color={subj.approvalStatus === 1 ? 'green' : 'orange'} className="text-xs">
            {subj.approvalStatus === 1 ? 'Approved' : 'Pending'}
          </Tag>
          {subj.approvedBy && (
            <Tag color="blue" className="text-xs">
              <UserOutlined className="mr-1" />
              {subj.approvedBy}
            </Tag>
          )}
          {subj.approvedAt && (
            <Tag color="cyan" className="text-xs">
              <CalendarOutlined className="mr-1" />
              {dayjs(subj.approvedAt).format('YYYY-MM-DD')}
            </Tag>
          )}
          {subj.rejectionReason && (
            <Tag color="red" className="text-xs">
              Rejected: {subj.rejectionReason}
            </Tag>
          )}
        </div>
      </div>
    </Card>
  </motion.div>
);

const VersionInfo: React.FC<{ version: any }> = ({ version }) => (
  <motion.div variants={itemVariants}>
    <Card
      bordered={false}
      className="shadow-sm border border-gray-100"
      bodyStyle={{ padding: 24 }}
    >
      <Title level={4} className="text-gray-900 mb-4">Version Information</Title>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text strong className="text-gray-700 block mb-1">Version Name</Text>
            <Text className="text-lg text-gray-900 font-medium">{version.versionName}</Text>
            <Text className="text-gray-500 text-sm">({version.versionCode})</Text>
          </div>
          <div>
            <Text strong className="text-gray-700 block mb-1">Status</Text>
            <div className="flex gap-2">
              <Tag color={version.isActive ? 'green' : 'red'} className="text-xs">
                {version.isActive ? 'Active' : 'Inactive'}
              </Tag>
              <Tag color={version.isDefault ? 'blue' : 'gray'} className="text-xs">
                {version.isDefault ? 'Default' : 'Custom'}
              </Tag>
            </div>
          </div>
        </div>
        
        <div>
          <Text strong className="text-gray-700 block mb-1">Description</Text>
          <Text className="text-gray-600" style={{ whiteSpace: 'pre-line' }}>{version.description}</Text>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <Text strong className="text-gray-700 block mb-1">Effective Period</Text>
          <div className="flex items-center gap-2 text-sm">
            <ClockCircleOutlined className="text-gray-500" />
            <Text className="text-gray-600">
              {version.effectiveFrom ? dayjs(version.effectiveFrom).format('YYYY-MM-DD') : '-'}
              {version.effectiveTo && ` → ${dayjs(version.effectiveTo).format('YYYY-MM-DD')}`}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

const Sidebar: React.FC<SidebarProps> = ({ syllabus }) => {
  if (!syllabus) return null;
  const subj = syllabus.subjectVersion?.subject || {};
  const version = syllabus.subjectVersion;
  
  return (
    <div className="space-y-6">
      <SubjectOverview subj={subj} />
      {version && <VersionInfo version={version} />}
    </div>
  );
};

export default Sidebar; 