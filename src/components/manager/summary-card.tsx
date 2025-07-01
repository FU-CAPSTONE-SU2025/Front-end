import React from 'react';
import { Card } from 'antd';
import { motion } from 'framer-motion';

interface SummaryCardProps {
  icon: string;
  count: number;
  label: string;
  color: string;
  delay: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  count,
  label,
  color,
  delay
}) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay }}
    >
      <Card 
        className="text-center border-2 hover:shadow-lg transition-all"
        style={{ 
          borderColor: `${color}80`, 
          backgroundColor: `${color}10` 
        }}
      >
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-2xl font-bold mb-1" style={{ color }}>
          {count}
        </div>
        <div className="text-gray-600 font-medium">{label}</div>
      </Card>
    </motion.div>
  );
};

export default SummaryCard; 