import React from 'react';
import { Button, Tag, Typography, Row, Col, Card, Statistic } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const { Title } = Typography;

interface HeaderProps {
  syllabus: any;
  navigate: (path: number) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Header: React.FC<HeaderProps> = ({ syllabus, navigate }) => {
  if (!syllabus) return null;
  const subj = syllabus.subjectVersion?.subject || {};
  
  return (
    <motion.div variants={itemVariants} className="mb-8">
      <div className="flex items-start gap-4 mb-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="!text-white !border-white/30 !bg-white/10 hover:!bg-white/20 !h-10 !px-4 !flex !items-center !gap-2 !backdrop-blur-md"
          size="large"
        />
        <div className="flex-1">
          <div className="flex items-baseline gap-3 mb-2">
            <Title level={1} className="!text-white mb-0 !text-4xl font-bold">
              {subj.subjectCode}
            </Title>
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
              {subj.credits} Credits
            </Tag>
          </div>
          <Title level={3} className="!text-white mb-0 !text-xl font-normal">
            {subj.subjectName}
          </Title>
          <div className="flex items-center gap-4 mt-3 text-sm !text-white">
            <span>Version: {syllabus.subjectVersion?.versionName || 'N/A'}</span>
            <span>•</span>
            <span>Status: {subj.approvalStatus }</span>
            <span>•</span>
            <span>Last Updated: {syllabus.updatedAt ? dayjs(syllabus.updatedAt).format('MMM DD, YYYY') : 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={12} sm={6}>
          <Card bordered={false} className="text-center !text-white !border-white/30 !bg-white/10  h-full">
            <Statistic
              title={<span className="!text-white text-xs font-medium">Assessments</span>}
              value={syllabus?.assessments?.length || 0}
              valueStyle={{ color: '#FFFF  ', fontSize: '1.25rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="text-center !text-white !border-white/30 !bg-white/10  h-full">
            <Statistic
              title={<span className="!text-white text-xs font-medium">Sessions</span>}
              value={syllabus?.sessions?.length || 0}
              valueStyle={{ color: '#FFF', fontSize: '1.25rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="text-center !text-white !border-white/30 !bg-white/10  h-full">
            <Statistic
              title={<span className="!text-white text-xs font-medium">Materials</span>}
              value={syllabus?.learningMaterials?.length || 0}
              valueStyle={{ color: '#ffff', fontSize: '1.25rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="text-center !text-white !border-white/30 !bg-white/10  h-full">
            <Statistic
              title={<span className="!text-white text-xs font-medium">Outcomes</span>}
              value={syllabus?.learningOutcomes?.length || 0}
              valueStyle={{ color: '#ffff', fontSize: '1.25rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default Header; 