import { Table } from 'antd'
import styles from '../../css/dataTable.module.css'
import { useState } from 'react'

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
    pagination?: PaginationInfo
    onPageChange?: (page: number, pageSize: number) => void
    onRow?: (record: any, rowIndex?: number) => React.HTMLAttributes<HTMLElement>
    loading?: boolean
}

export default function DataTable({columns, data, rowSelection, pagination, onPageChange, onRow, loading}: DataProps) {
  const [currentPage, setCurrentPage] = useState<number>(pagination?.current || 1);
  
  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page, pageSize);
    }
  };

  return (
    <>
          <Table
              className={styles.table}
              columns={columns}
              dataSource={data}
              rowSelection={rowSelection}
              onRow={onRow}
              loading={loading}
              pagination={pagination ? {
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: handlePageChange,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              } : false}
              rowKey="Id"
              bordered
              size="middle"
              scroll={{ x: 'max-content' }}
            />
    </>
  )
}