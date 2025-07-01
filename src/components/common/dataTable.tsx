import { Table } from 'antd'
import styles from '../../css/dataTable.module.css'
import { useState, useMemo } from 'react'

interface PaginationInfo {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

type DataProps = {
    columns: {
        title: string
        dataIndex?: string
        key: string
        width: number
        render?: (value: any, record: any, index: number) => React.ReactNode
    }[]
    data: any[]
    rowSelection: any
    pagination?: PaginationInfo | null
    onPageChange?: (page: number, pageSize: number) => void
    onRow?: (record: any, rowIndex?: number) => React.HTMLAttributes<HTMLElement>
    loading?: boolean
    searchQuery?: string
    searchFields?: string[] // Fields to search in (e.g., ['firstName', 'lastName', 'id'])
}

export default function DataTable({columns, data, rowSelection, pagination, onPageChange, onRow, loading, searchQuery, searchFields}: DataProps) {
  const [currentPage, setCurrentPage] = useState<number>(pagination?.current || 1);
  
  // Client-side search filtering
  const filteredData = useMemo(() => {
    if (!searchQuery || !searchFields || searchFields.length === 0) {
      return data;
    }
    
    const query = searchQuery.toLowerCase();
    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchFields]);
  
  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page, pageSize);
    }
  };

  // If we have search active, use client-side pagination
  const isClientSidePagination = searchQuery && searchQuery.trim() !== '';
  
  const paginationConfig = isClientSidePagination 
    ? {
        current: currentPage,
        pageSize: pagination?.pageSize || 10,
        total: filteredData.length,
        onChange: handlePageChange,
        showSizeChanger: false,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} items (filtered)`,
      }
    : pagination 
    ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: handlePageChange,
        showSizeChanger: false,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} items`,
      }
    : false;

  return (
    <>
          <Table
              className={styles.table}
              columns={columns}
              dataSource={isClientSidePagination ? filteredData : data}
              rowSelection={rowSelection}
              onRow={onRow}
              loading={loading}
              pagination={paginationConfig}
              rowKey="Id"
              bordered
              size="middle"
              scroll={{ x: 'max-content' }}
            />
    </>
  )
}