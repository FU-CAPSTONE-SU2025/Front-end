import React from 'react';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'pending' | 'active' | 'in-active';
}

const statusStyle: Record<string, string> = {
  pending: 'bg-yellow-500',
  active: 'bg-green-500',
  'in-active': 'bg-gray-400',
};

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  active: 'Active',
  'in-active': 'Inactive',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-xs capitalize shadow-sm ${statusStyle[status]}`}
    >
      {statusLabel[status]}
    </motion.span>
  );
};

export default StatusBadge; 