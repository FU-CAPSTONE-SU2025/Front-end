import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Spin, Alert, Button, Row, Col } from 'antd';
import type { TabsProps } from 'antd';
import { DownloadOutlined, FileTextOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { GetSyllabusById } from '../../api/syllabus/syllabusAPI';
import Header from '../../components/student/syllabusDetail/header';
import Sidebar from '../../components/student/syllabusDetail/sidebar';
import { Assessments, Materials, Outcomes, Sessions } from '../../components/student/syllabusDetail/tabs';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const SyllabusDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      GetSyllabusById(parseInt(id))
        .then(data => {
          setSyllabus(data);
        })
        .catch(() => {
          setError('Failed to fetch syllabus details.');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);



  const tabItems: TabsProps['items'] = [
    { 
      key: '1', 
      label: (
        <span className="flex items-center gap-2">
          <FileTextOutlined />
          Assessments
        </span>
      ), 
      children: <Assessments assessments={syllabus?.assessments || []} /> 
    },
    { 
      key: '2', 
      label: (
        <span className="flex items-center gap-2">
          <BookOutlined />
          Materials
        </span>
      ), 
      children: <Materials materials={syllabus?.learningMaterials || []} /> 
    },
    { 
      key: '3', 
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Outcomes
        </span>
      ), 
      children: <Outcomes outcomes={syllabus?.learningOutcomes || []} /> 
    },
    { 
      key: '4', 
      label: (
        <span className="flex items-center gap-2">
          <ClockCircleOutlined />
          Sessions
        </span>
      ), 
      children: <Sessions sessions={syllabus?.sessions || []} /> 
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <Spin size="large" />
          <div className="text-gray-600 mt-4 block">Loading syllabus details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Alert type="error" message={error} showIcon className="max-w-md" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-white"
    >
      <div className="container mx-auto px-4 py-8 mt-16">
        <Header syllabus={syllabus} navigate={navigate} />
        
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Sidebar syllabus={syllabus} />
          </Col>
          
          <Col xs={24} lg={16}>
            <motion.div variants={itemVariants}>
              <Card
                bordered={false}
                className="bg-white shadow-sm border border-gray-100"
                bodyStyle={{ padding: 24 }}
              >
                <Tabs
                  defaultActiveKey="1"
                  items={tabItems}
                  className="minimal-tabs"
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        <motion.div variants={itemVariants} className="mt-8 flex justify-center">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            className="bg-blue-600 hover:bg-blue-700 border-none font-medium px-6 py-3 rounded-lg shadow-sm"
          >
            Download All Student Material
          </Button>
        </motion.div>
      </div>
      
      <style>{`
        .minimal-table .ant-table-thead > tr > th {
          background: #f9fafb;
          color: #374151;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          font-size: 12px;
        }
        .minimal-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6;
          font-size: 12px;
        }
        .minimal-table .ant-table-tbody > tr:hover > td {
          background-color: #f9fafb;
        }
        .minimal-tabs .ant-tabs-tab {
          font-weight: 500;
          padding: 8px 16px;
          font-size: 14px;
        }
        .minimal-tabs .ant-tabs-tab-active {
          background: #f3f4f6;
          border-radius: 8px;
        }
        .minimal-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #1f2937 !important;
        }
        .minimal-timeline .ant-timeline-item-content {
          margin-left: 20px;
        }
      `}</style>
    </motion.div>
  );
};

export default SyllabusDetail; 