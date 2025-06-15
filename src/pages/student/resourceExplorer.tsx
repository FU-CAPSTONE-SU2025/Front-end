import React, { useState } from 'react';
import { Card, Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchOutlined } from '@ant-design/icons';

// Mock data for cards
const subjectCards = Array(5).fill({
  code: 'PRN212',
  name: 'Basic Cross-Platform Application Programming With .NET',
});

// Mock data for table
const tableData = Array.from({ length: 14 }, (_, i) => ({
  key: i + 1,
  syllabusId: i + 1,
  subjectCode: 'PRN212',
  subjectName: 'Basic Cross-Platform Application Programming With .NET',
  syllabusName: 'Basis Cross-Platform Application Programming With .NET_Lập trình ứng dụng đa nền tảng cơ bản với .NET',
  syllabusLink: '#',
}));

const columns: ColumnsType<any> = [
  {
    title: 'Syllabus ID',
    dataIndex: 'syllabusId',
    key: 'syllabusId',
    align: 'center',
    width: 100,
  },
  {
    title: 'Subject Code',
    dataIndex: 'subjectCode',
    key: 'subjectCode',
    align: 'center',
    width: 120,
  },
  {
    title: 'Subject Name',
    dataIndex: 'subjectName',
    key: 'subjectName',
    align: 'left',
    width: 300,
  },
  {
    title: 'Syllabus Name',
    dataIndex: 'syllabusName',
    key: 'syllabusName',
    align: 'left',
    render: (text: string, record) => (
      <a
        href={record.syllabusLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 transition-colors"
      >
        {text}
      </a>
    ),
  },
];

const ResourceExplorer: React.FC = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen mt-120  p-6 md:p-10">
      {/* Card list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10"
      >
        {subjectCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Card
              className="bg-white/10 backdrop-blur-lg border-none shadow-xl hover:shadow-2xl transition-shadow rounded-2xl"
              bodyStyle={{ padding: '20px' }}
            >
              <div className="text-white font-bold text-xl">{card.code}</div>
              <div className="text-gray-200 text-sm mt-2">{card.name}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center mb-10"
      >
        <Input
          placeholder="Search by subject code..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg bg-white/10 border-none text-white placeholder-gray-400 rounded-full py-3 px-6 focus:ring-2 focus:ring-blue-400"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
      >
        <AnimatePresence>
          <Table
            columns={columns}
            dataSource={tableData.filter((row) => row.subjectCode.toLowerCase().includes(search.toLowerCase()))}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            bordered={false}
            className="custom-table"
            rowClassName="bg-transparent hover:bg-white/5 transition-colors"
          />
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ResourceExplorer;