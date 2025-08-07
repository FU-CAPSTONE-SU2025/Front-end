import React from 'react';
import { Table, Tag, Progress, Typography, Tooltip } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface AssessmentsProps {
  assessments: any[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Assessments: React.FC<AssessmentsProps> = ({ assessments }) => {
  if (!assessments?.length) {
    return (
      <div className="text-center py-12">
        <FileTextOutlined className="text-4xl text-gray-300 mb-4" />
        <Text className="text-gray-500">No assessments available</Text>
      </div>
    );
  }
  
  const columns = [
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category',
      render: (text: string) => (
        <Tag color="blue" className="text-xs">{text}</Tag>
      )
    },
         { 
       title: 'Weight', 
       dataIndex: 'weight', 
       key: 'weight',
       render: (value: number) => (
         <div className="flex items-center gap-2">
           <div className="flex-1">
             <Tooltip title={`${value}%`} placement="top">
               <Progress 
                 percent={value} 
                 size="small" 
                 showInfo={false} 
                 strokeColor="#3b82f6"
               />
             </Tooltip>
           </div>
         </div>
       )
     },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Duration (min)', dataIndex: 'duration', key: 'duration' },
    { title: 'Type', dataIndex: 'questionType', key: 'questionType' },
    { 
      title: 'Criteria', 
      dataIndex: 'completionCriteria', 
      key: 'completionCriteria',
      render: (text: string) => (
        <Text className="text-gray-600 text-xs">{text}</Text>
      )
    },
  ];
  
  return (
    <motion.div variants={itemVariants}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <Title level={5} className="text-gray-900 mb-0 flex items-center gap-2">
            <FileTextOutlined className="text-gray-600" />
            Assessments
          </Title>
        </div>
        <div className="p-6">
          <Table
            columns={columns}
            dataSource={assessments.map((a: any, idx: number) => ({ ...a, key: idx }))}
            pagination={false}
            bordered={false}
            size="small"
            className="minimal-table"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Assessments; 