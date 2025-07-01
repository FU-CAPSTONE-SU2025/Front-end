import React from 'react';
import { Card, Table } from 'antd';
import { motion } from 'framer-motion';

interface ReviewSectionProps {
  title: string;
  icon: string;
  color: string;
  data: any[];
  columns: any[];
  visible: boolean;
  delay: number;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  title,
  icon,
  color,
  data,
  columns,
  visible,
  delay
}) => {
  if (!visible || data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <Card 
        title={
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <span className="text-xl font-semibold" style={{ color }}>
              {title}
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
        className="shadow-lg"
        style={{ borderLeft: `4px solid ${color}` }}
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
    </motion.div>
  );
};

export default ReviewSection; 