import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Spin, Alert, Row, Col } from 'antd';
import type { TabsProps } from 'antd';
import { FileTextOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined, BulbOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSyllabusApi } from '../../hooks/useSyllabusApi';
import Header from '../../components/student/syllabusDetail/header';
import Sidebar from '../../components/student/syllabusDetail/sidebar';
import { Assessments, Materials, Outcomes, Sessions } from '../../components/student/syllabusDetail/tabs';
import { FetchSubjectTips } from '../../api/SchoolAPI/subjectAPI';
import MarkdownRenderer from '../../components/common/markdownRenderer';

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
  const { useSyllabusById } = useSyllabusApi();
  const { data: syllabus, isLoading: loading, error: syllabusError } = useSyllabusById(id || '');
  const error = syllabusError ? 'Failed to fetch syllabus details.' : null;

  // Tips inline section state
  const [isTipsLoading, setIsTipsLoading] = useState(false);
  const [tipsContent, setTipsContent] = useState<any>(null);

  const handleGenerateTips = async () => {
    if (!id) return;
    setIsTipsLoading(true);
    setTipsContent(null);
    try {
      const data = await FetchSubjectTips(Number(id));
      setTipsContent(data);
    } catch (e) {
      setTipsContent({ message: 'Unable to generate tips right now. Please try again later.' });
    } finally {
      setIsTipsLoading(false);
    }
  };

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
            <motion.div variants={itemVariants as any}>
              <Card
                bordered={false}
                className="bg-white shadow-sm border border-gray-100"
                variant='borderless'
                style={{padding: 24}}
              >
                <Tabs
                  defaultActiveKey="1"
                  items={tabItems}
                  className="minimal-tabs"
                />
              </Card>
            </motion.div>

            {/* Inline Tips Section */}
            <motion.div variants={itemVariants as any} className="mt-6">
              <Card
                bordered={false}
                className="bg-white shadow-sm border border-gray-100"
                variant='borderless'
                title={(
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><BulbOutlined /> Study Tips</span>
                    <button
                      onClick={handleGenerateTips}
                      disabled={isTipsLoading}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 bg-white shadow-sm"
                    >
                      <BulbOutlined />
                      <span>{isTipsLoading ? 'Generating...' : 'Generate Tips'}</span>
                    </button>
                  </div>
                )}
              >
                {isTipsLoading ? (
                  <div className="flex items-center justify-center py-10"><Spin /></div>
                ) : tipsContent ? (
                  <div className="prose max-w-none">
                    {typeof tipsContent === 'string' ? (
                      <MarkdownRenderer content={tipsContent} />
                    ) : (
                      <MarkdownRenderer content={JSON.stringify(tipsContent, null, 2)} />
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">Click Generate Tips to get AI-powered study advice.</div>
                )}
              </Card>
            </motion.div>
          </Col>
        </Row>
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