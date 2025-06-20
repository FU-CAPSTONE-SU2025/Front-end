import React from 'react';
import { Modal } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from 'recharts';
import { RiseOutlined } from '@ant-design/icons';

interface GpaBySemester {
  semester: string;
  gpa: number;
}

interface GpaHistoryModalProps {
  open: boolean;
  onClose: () => void;
  gpaHistory: GpaBySemester[];
  totalGpa: string | number;
}

const GpaHistoryModal: React.FC<GpaHistoryModalProps> = ({
  open,
  onClose,
  gpaHistory,
  totalGpa,
}) => {
  const startSemester = gpaHistory[0]?.semester ?? 'N/A';
  const endSemester =
    gpaHistory.length > 0
      ? gpaHistory[gpaHistory.length - 1].semester
      : 'N/A';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      className="gpa-modal-card"
      bodyStyle={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 24,
        padding: 32,
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
      }}
    >
      <div className="mb-6 flex flex-col items-center">
        <div className="flex items-center gap-2 text-2xl font-bold text-gray-800 mb-1">
          <RiseOutlined className="text-orange-400 text-2xl" />
          Grade Point Average History
        </div>
        <div className="text-base text-gray-500 mb-2">
          From{' '}
          <span className="font-bold text-gray-800">{startSemester}</span> to{' '}
          <span className="font-bold text-gray-800">{endSemester}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white font-bold text-xl shadow mb-2">
          <RiseOutlined /> Total GPA: {totalGpa}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={gpaHistory}
          margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
        >
          <XAxis
            dataKey="semester"
            stroke="#a0a0a0"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid #ddd',
              borderRadius: 12,
              color: '#333',
              fontWeight: 600,
              fontSize: 16,
            }}
          />
          <Bar
            dataKey="gpa"
            fill="#F97316"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          >
            <LabelList
              dataKey="gpa"
              position="top"
              fill="#333"
              fontSize={14}
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Modal>
  );
};

export default GpaHistoryModal;
