import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Affix, Pagination, Spin, Modal, Form, Tag, Space, Tooltip, Card, Typography, Row, Col, ConfigProvider } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { useNavigate } from 'react-router';
import { useCRUDProgram } from '../../hooks/useCRUDSchoolMaterial';

const { Text, Title } = Typography;

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
              search: search
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
     <ConfigProvider
    theme={{
      components: {
        Table: {
          headerBg: '#1E40AF',
          headerColor: '#fff',
          borderColor: 'rgba(30, 64, 175, 0.08)',
          colorText: '#1E293B',
          colorBgContainer: 'rgba(255,255,255,0.95)',
          colorBgElevated: 'rgba(255,255,255,0.95)',
          rowHoverBg: 'rgba(249, 115, 22, 0.05)',
          colorPrimary: '#f97316',
          colorPrimaryHover: '#1E40AF',
        },
      },
    }}
  >
    <div className={styles.sttContainer}>
      {/* Title Card */}
      <Card 
        className={glassStyles.appleGlassCard}
        style={{ 
          marginBottom: 24,
          padding: '2rem 3rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(30, 64, 175, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1E293B', fontSize: '2.5rem', fontWeight: 800 }}>
              Program Management
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Manage and view program information
            </Text>
          </div>
        </div>
      </Card>

      {/* Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <Card 
          className={glassStyles.appleGlassCard}
          style={{ 
            marginBottom: 24,
             padding: '0rem 2rem',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Search Programs</Text>
                <Input.Search
                  placeholder="Search by Program Name or Code"
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onSearch={handleSearch}
                  style={{borderRadius: 12, width: '100%'}}
                  size="large"
                  allowClear
                  className={glassStyles.appleGlassInput}
                />
              </Space>
            </Col>
          </Row>
        </Card>
      </Affix>
        <Spin spinning={isLoading} tip="Loading programs...">
          <Table
            columns={columns}
            dataSource={programList}
            rowKey="id"
            className={styles.sttFreshTable}
            locale={{
              emptyText: search ? `No programs found matching "${search}"` : 'No programs available'
            }}
            scroll={{ x: 'max-content' }}
            pagination={false}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              overflow: 'hidden'
            }}
          />
          
          {/* Pagination */}
          {paginationProgram && paginationProgram.total > 0 && (
            <div style={{marginTop: 32, display: 'flex', justifyContent: 'center'}}>
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
        </Spin>
    </div>
    </ConfigProvider>
  );
};

export default ManagerProgramPage; 