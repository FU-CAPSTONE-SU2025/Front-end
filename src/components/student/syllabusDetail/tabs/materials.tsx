import React from 'react';
import { Table, Tag, Button, Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface MaterialsProps {
  materials: any[];
}

const Materials: React.FC<MaterialsProps> = ({ materials }) => {
  if (!materials?.length) {
    return (
      <div className="!bg-white/10 !backdrop-blur-md !rounded-lg !border !border-white/20 !overflow-hidden !shadow-lg">
        <div className="!bg-white/5 !px-6 !py-4 !border-b !border-white/20">
          <Title level={5} className="!text-white !mb-0 !flex !items-center !gap-2">
            <BookOutlined className="!text-white/60" />
            Learning Materials
          </Title>
        </div>
        <div className="!p-12 text-center">
          <BookOutlined className="text-4xl !text-white/40 mb-4" />
          <Text className="!text-white/60">No learning materials available</Text>
        </div>
      </div>
    );
  }
  
  return (
    <div className="!bg-white/10 !backdrop-blur-md !rounded-lg !border !border-white/20 !overflow-hidden !shadow-lg">
      <div className="!bg-white/5 !px-6 !py-4 !border-b !border-white/20">
        <Title level={5} className="!text-white !mb-0 !flex !items-center !gap-2">
          <BookOutlined className="!text-white/60" />
          Learning Materials
        </Title>
      </div>
      <div className="!p-6">
        <Table
          columns={[
            { 
              title: 'Material Name', 
              dataIndex: 'materialName', 
              key: 'materialName',
              render: (text: string) => (
                <Text strong className="!text-white">{text}</Text>
              )
            },
            { 
              title: 'Author', 
              dataIndex: 'authorName', 
              key: 'authorName',
              render: (text: string) => (
                <Tag color="green" className="!text-xs !bg-green-500/20 !border-green-500/30 !text-green-300">{text}</Tag>
              )
            },
            { 
              title: 'Published', 
              dataIndex: 'publishedDate', 
              key: 'publishedDate', 
              render: (text: string) => (
                <span className="!text-white !text-sm">{dayjs(text).format('YYYY-MM-DD')}</span>
              )
            },
            { 
              title: 'Description', 
              dataIndex: 'description', 
              key: 'description',
              render: (text: string) => (
                <Text className="!text-white/70 !text-xs" style={{ whiteSpace: 'pre-line' }}>{text}</Text>
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
                  className="!text-blue-300 hover:!text-blue-200 !p-0 !h-auto"
                  size="small"
                >
                  Open
                </Button>
              ) : (
                <span className="!text-white/40 !text-xs">-</span>
              )
            },
          ]}
          dataSource={materials.map((m: any, idx: number) => ({ ...m, key: idx }))}
          pagination={false}
          bordered={false}
          size="small"
          className="!minimal-table"
          rowClassName="!text-white hover:!bg-white/10"
        />
      </div>
    </div>
  );
};

export default Materials; 