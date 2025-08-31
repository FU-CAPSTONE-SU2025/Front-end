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
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SubjectOverview: React.FC<{ subj: any }> = ({ subj }) => (
  <motion.div variants={itemVariants}>
    <Card
      bordered={false}
      className="!bg-white/10 !backdrop-blur-md !border !border-white/20 !shadow-2xl"
      bodyStyle={{ padding: 24 }}
    >
      <Title level={4} className="!text-white mb-4">Subject Overview</Title>
      <div className="space-y-4">
        <div>
          <Text strong className="!text-white block mb-2">Description</Text>
          <Text className="!text-white" style={{ whiteSpace: 'pre-line' }}>{subj.description}</Text>
        </div>
        <div>
          <Text strong className="!text-white block mb-2">Prerequisites</Text>
          <Text className="!text-white">{subj.prerequisites || 'None'}</Text>
        </div>
        
        <Divider className="my-4 !border-white/20" />
        
        <div className="!flex !flex-wrap !gap-2">
          <Tag 
            color={subj.approvalStatus === 1 ? 'success' : 'warning'} 
            className="!text-sm !font-semibold !uppercase"
            style={{
              backgroundColor: subj.approvalStatus === 1 ? '#52c41a' : '#faad14',
              color: 'white',
              border: 'none',
              padding: '4px 12px'
            }}
          >
            {subj.approvalStatus === 1 ? 'Approved' : 'Pending'}
          </Tag>
          {subj.approvedBy && (
            <Tag 
              color="processing" 
              className="!text-sm !font-semibold !uppercase"
              style={{
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                padding: '4px 12px'
              }}
            >
              {subj.approvedBy}
            </Tag>
          )}
          {subj.approvedAt && (
            <Tag 
              color="cyan" 
              className="!text-sm !font-semibold !uppercase"
              style={{
                backgroundColor: '#13c2c2',
                color: 'white',
                border: 'none',
                padding: '4px 12px'
              }}
            >
              {dayjs(subj.approvedAt).format('YYYY-MM-DD')}
            </Tag>
          )}
          {subj.rejectionReason && (
            <Tag 
              color="error" 
              className="!text-sm !font-semibold !uppercase"
              style={{
                backgroundColor: '#ff4d4f',
                color: 'white',
                border: 'none',
                padding: '4px 12px'
              }}
            >
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
      className="!bg-white/10  !backdrop-blur-md !border !border-white/20 !shadow-2xl"
      bodyStyle={{ padding: 24 }}
    >
      <Title level={4} className="!text-white mb-4">Version Information</Title>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text strong className="!text-white block mb-1">Version Name</Text>
            <Text className="text-lg !text-white font-medium">{version.versionName}</Text>
            <Text className="!text-white text-sm">({version.versionCode})</Text>
          </div>
          <div>
            <Text strong className="!text-white block mb-1">Status</Text>
            <div className="!flex !gap-2">
              <Tag 
                color={version.isActive ? 'success' : 'error'} 
                className="!text-sm !font-semibold !uppercase"
                style={{
                  backgroundColor: version.isActive ? '#52c41a' : '#ff4d4f',
                  color: 'white',
                  border: 'none',
                  padding: '4px 12px'
                }}
              >
                {version.isActive ? 'Active' : 'Inactive'}
              </Tag>
              <Tag 
                color={version.isDefault ? 'processing' : 'default'} 
                className="!text-sm !font-semibold !uppercase"
                style={{
                  backgroundColor: version.isDefault ? '#1890ff' : '#8c8c8c',
                  color: 'white',
                  border: 'none',
                  padding: '4px 12px'
                }}
              >
                {version.isDefault ? 'Default' : 'Custom'}
              </Tag>
            </div>
          </div>
        </div>
        
        <div>
          <Text strong className="!text-white block mb-1">Description</Text>
          <Text className="!text-white" style={{ whiteSpace: 'pre-line' }}>{version.description}</Text>
        </div>
        
        <div className="!bg-white/10 !backdrop-blur-md !border !border-white/20 !shadow-2xl p-3 rounded-lg">
          <Text strong className="!text-white block mb-1">Effective Period</Text>
          <div className="flex items-center gap-2 text-sm ">
            <ClockCircleOutlined className="!text-white" />
            <Text className="!text-white">
              {version.effectiveFrom ? dayjs(version.effectiveFrom).format('YYYY-MM-DD') : '-'}
              {version.effectiveTo && ` → ${dayjs(version.effectiveTo).format('YYYY-MM-DD')}`}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

const   Sidebar: React.FC<SidebarProps> = ({ syllabus }) => {
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