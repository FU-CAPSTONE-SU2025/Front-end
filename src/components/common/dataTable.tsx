import { Table } from 'antd'
import styles from '../../css/dataTable.module.css'
import { useState } from 'react'

type DataProps = {
    columns: {
        title: string
        dataIndex: string
        key: string
        width: number
    }[]
    data: any[]
    rowSelection: any
    dataPerPage: number
}

export default function DataTable({columns,data,rowSelection,dataPerPage}: DataProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
    return (
    <>
          <Table
              className={styles.table}
              columns={columns}
              dataSource={data}
              rowSelection={rowSelection}
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