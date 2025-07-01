import React from 'react';
import { Table, Card } from 'antd';

interface DataPreviewProps {
  title: string;
  icon: string;
  color: string;
  data: any[];
  columns: any[];
  visible: boolean;
}

const DataPreview: React.FC<DataPreviewProps> = ({
  title,
  icon,
  color,
  data,
  columns,
  visible
}) => {
  if (!visible || data.length === 0) return null;

  return (
    <Card 
      title={
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="text-xl font-semibold" style={{ color }}>
            {title} Data Preview
          </span>
          <span 
            className="px-2 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: `${color}20`, 
              color: color 
            }}
          >
            {data.length} items
          </span>
        </div>
      } 
      className="shadow-md"
    >
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ x: 1200 }}
        size="small"
        className="custom-table"
      />
    </Card>
  );
};

export default DataPreview; 