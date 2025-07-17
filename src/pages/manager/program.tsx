import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Affix, message, Pagination, Spin, Modal, Form, Tag, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { useNavigate } from 'react-router';
import { useCRUDProgram } from '../../hooks/useCRUDSchoolMaterial';
import { CreateProgram, Program } from '../../interfaces/ISchoolProgram';
import { isErrorResponse } from '../../api/AxiosCRUD';

const ManagerProgramPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  // Use the Program CRUD hook (only getAllPrograms and read-related state)
  const {
    getAllPrograms,
    programList,
    paginationProgram,
    isLoading
  } = useCRUDProgram();

  useEffect(() => {
    getAllPrograms({
      pageNumber: page,
      pageSize: pageSize,
      searchQuery: search
    });
  }, [page, pageSize, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  // Table columns (remove actions column)
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Program Code',
      dataIndex: 'programCode',
      key: 'programCode',
      width: 140,
      render: (code: string) => (
        <Tag color="blue" style={{ fontWeight: '600' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Program Name',
      dataIndex: 'programName',
      key: 'programName',
      render: (name: string) => (
        <span style={{ fontWeight: '600', color: '#1E40AF' }}>
          {name}
        </span>
      ),
    }
  ];

  return (
    <div className={styles.sttContainer}>
      {/* Sticky Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <div className={styles.sttToolbar}>
          <Input.Search
            placeholder="Search by Program Name or Code"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={handleSearch}
            style={{maxWidth: 280, borderRadius: 999}}
            size="large"
            allowClear
          />
        </div>
      </Affix>

      {/* Programs Table */}
      <div style={{ background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)', padding: '24px' }}>
        <Table
          columns={columns}
          dataSource={programList}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{
            emptyText: search ? `No programs found matching "${search}"` : 'No programs available'
          }}
        />
        {/* Pagination */}
        {paginationProgram && paginationProgram.total > 0 && (
          <div style={{marginTop: 24, display: 'flex', justifyContent: 'center'}}>
            <Pagination
              current={paginationProgram.current}
              pageSize={paginationProgram.pageSize}
              total={paginationProgram.total}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} programs`
              }
              pageSizeOptions={['10', '20', '50', '100']}
              onChange={handlePageChange}
              style={{borderRadius: 8}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerProgramPage; 