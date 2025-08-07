import React from 'react';
import { Table, Tag, Button, Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface MaterialsProps {
  materials: any[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Materials: React.FC<MaterialsProps> = ({ materials }) => {
  if (!materials?.length) {
    return (
      <div className="text-center py-12">
        <BookOutlined className="text-4xl text-gray-300 mb-4" />
        <Text className="text-gray-500">No learning materials available</Text>
      </div>
    );
  }
  
  return (
    <motion.div variants={itemVariants}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <Title level={5} className="text-gray-900 mb-0 flex items-center gap-2">
            <BookOutlined className="text-gray-600" />
            Learning Materials
          </Title>
        </div>
        <div className="p-6">
          <Table
            columns={[
              { 
                title: 'Material Name', 
                dataIndex: 'materialName', 
                key: 'materialName',
                render: (text: string) => (
                  <Text strong className="text-gray-900">{text}</Text>
                )
              },
              { 
                title: 'Author', 
                dataIndex: 'authorName', 
                key: 'authorName',
                render: (text: string) => (
                  <Tag color="green" className="text-xs">{text}</Tag>
                )
              },
              { 
                title: 'Published', 
                dataIndex: 'publishedDate', 
                key: 'publishedDate', 
                render: (text: string) => dayjs(text).format('YYYY-MM-DD')
              },
              { 
                title: 'Description', 
                dataIndex: 'description', 
                key: 'description',
                render: (text: string) => (
                  <Text className="text-gray-600 text-xs">{text}</Text>
                )
              },
              { 
                title: 'File/URL', 
                dataIndex: 'filepathOrUrl', 
                key: 'filepathOrUrl', 
                render: (url: string) => url ? (
                  <Button 
                    type="link" 
                    href={url} 
                    target="_blank" 
                    className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                    size="small"
                  >
                    Open
                  </Button>
                ) : '-'
              },
            ]}
            dataSource={materials.map((m: any, idx: number) => ({ ...m, key: idx }))}
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

export default Materials; 