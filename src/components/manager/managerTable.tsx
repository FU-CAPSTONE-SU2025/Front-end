import React from 'react';
import { Button, Pagination } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface Column {
  title: string;
  dataIndex: string;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
}

interface ManagerTableProps {
  columns: Column[];
  data: any[];
  pageSize: number;
  currentPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
}

const ManagerTable: React.FC<ManagerTableProps> = ({
  columns,
  data,
  pageSize,
  currentPage,
  total,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="w-full">
      <AnimatePresence>
        <motion.table
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
        >
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.dataIndex || idx}
                  className={`px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.title}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200 text-center" style={{ width: 120 }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-8 text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.dataIndex || colIdx}
                      className={`px-4 py-2 border-b border-gray-100 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {col.render ? col.render(row[col.dataIndex], row, rowIdx) : row[col.dataIndex]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-2 border-b border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => onEdit(row)}
                          />
                        )}
                        {onDelete && (
                          <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => onDelete(row)}
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </motion.table>
      </AnimatePresence>
      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={onPageChange}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default ManagerTable; 