import { Table } from 'antd'
import styles from '../../css/dataTable.module.css'
import { useState } from 'react'

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
    dataPerPage: number
    onRow?: (record: any, rowIndex?: number) => React.HTMLAttributes<HTMLElement>
}

export default function DataTable({columns,data,rowSelection,dataPerPage,onRow}: DataProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
    return (
    <>
          <Table
              className={styles.table}
              columns={columns}
              dataSource={data}
              rowSelection={rowSelection}
              onRow={onRow}
              pagination={{
                current: currentPage,
                pageSize: dataPerPage,
                total: data.length,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
              }}
              rowKey="Id"
              bordered
              size="middle"
              scroll={{ x: 'max-content' }}
            />
    </>
  )
}