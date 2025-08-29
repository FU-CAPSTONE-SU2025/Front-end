import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearchOutlined, CodeOutlined, BookOutlined } from '@ant-design/icons';
import { Syllabus } from '../../interfaces/ISchoolProgram';

interface ResourceTableProps {
  data: Syllabus[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchTerm: string;
  hasSearched: boolean;
  onSubjectSelect: (subject: Syllabus) => void;
}

const getColumns = (onSubjectSelect: (subject: Syllabus) => void): ColumnsType<Syllabus> => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    align: 'center',
    width: 80,
    render: (text: string, record: any, index: number) => (
      <span className="font-medium text-white whitespace-nowrap">{index + 1}</span>
    ),
  },
  {
    title: 'Subject Code',
    dataIndex: 'subjectCode',
    key: 'subjectCode',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span className="font-bold text-orange-400 whitespace-nowrap">{text}</span>
    ),
  },
  {
    title: 'Subject Name',
    dataIndex: 'subjectName',
    key: 'subjectName',
    align: 'left',
    width: 300,
    render: (text: string) => (
      <span className="text-gray-200">{text}</span>
    ),
  },
  {
    title: 'Syllabus Content',
    dataIndex: 'content',
    key: 'content',
    align: 'left',
    render: (text: string, record) => (
      <span
        onClick={() => onSubjectSelect(record)}
        className="cursor-pointer text-cyan-400 hover:text-cyan-300 hover:underline transition-colors duration-200"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === 'Enter') onSubjectSelect(record); }}
      >
        {text ? text.slice(0, 40) + (text.length > 40 ? '...' : '') : 'View'}
      </span>
    ),
  },
];

const ResourceTable: React.FC<ResourceTableProps> = ({
  data,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  searchTerm,
  hasSearched,
  onSubjectSelect,
}) => {
  const columns = getColumns(onSubjectSelect);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-4 shadow-2xl shadow-black/20 w-full max-w-7xl mx-auto border border-white/20"
    >
      <div className="mb-4 px-2">
        <h3 className="text-xl font-semibold text-white">
          {searchTerm ? 'Search Results' : 'All Subjects'}
        </h3>
        <p className="text-gray-400 text-sm">
          {searchTerm 
            ? `Found ${total} result${total !== 1 ? 's' : ''} for "${searchTerm}"`
            : `Showing ${total} subject${total !== 1 ? 's' : ''}`
          }
        </p>
      </div>
      <AnimatePresence>
        <div className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-black/25 [&_.ant-table-tbody>tr>td]:!bg-transparent [&_.ant-table-thead>tr>th]:border-b-2 [&_.ant-table-thead>tr>th]:border-white/10 [&_.ant-table-thead>tr>th]:!text-white [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-tbody>tr>td]:py-4 [&_.ant-pagination-item]:bg-white/10 [&_.ant-pagination-item]:border-white/20 [&_.ant-pagination-item>a]:text-white [&_.ant-pagination-item:hover]:bg-white/20 [&_.ant-pagination-item-active]:bg-orange-500/50 [&_.ant-pagination-item-active]:border-orange-500/80 [&_.ant-pagination-prev]:bg-white/10 [&_.ant-pagination-prev>button]:text-white [&_.ant-pagination-next]:bg-white/10 [&_.ant-pagination-next>button]:text-white [&_.ant-pagination-disabled>button]:text-white/30 [&_.ant-pagination-prev:hover]:bg-white/20 [&_.ant-pagination-next:hover]:bg-white/20 [&_.ant-empty-description]:text-white/60">
          <Table
            columns={columns}
            dataSource={data}
            loading={isLoading}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              onChange: (p, ps) => {
                if (ps !== pageSize) {
                  onPageSizeChange(ps);
                  onPageChange(1); // reset page về 1 khi đổi pageSize
                } else {
                  onPageChange(p);
                }
              },
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            bordered={false}
            rowClassName="border-b border-white/10 hover:!bg-white/5 transition-colors duration-200"
            locale={{
              emptyText: (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileSearchOutlined style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.25)' }} />
                  <p className="text-white font-semibold text-lg mt-4">
                    {searchTerm 
                      ? `No results found for "${searchTerm}"`
                      : 'No subjects available'
                    }
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchTerm 
                      ? 'Try searching with different keywords or check for typos.'
                      : 'There are currently no subjects in the system.'
                    }
                  </p>
                </div>
              )
            }}
          />
        </div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ResourceTable; 