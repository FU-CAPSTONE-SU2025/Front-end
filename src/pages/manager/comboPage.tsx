import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Affix, Tag, message, Pagination, Spin, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, SearchOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { useNavigate } from 'react-router';
import { useCRUDCombo } from '../../hooks/useCRUDSchoolMaterial';

const ComboManagerPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [approvalStatus, setApprovalStatus] = useState<{ [id: number]: 'pending' | 'approved' }>({});
  const navigate = useNavigate();

  // CRUD hook
  const {
    getAllCombos,
    comboList,
    paginationCombo,
    getComboMutation
  } = useCRUDCombo();

  useEffect(() => {
    // Backend search: pass search as filterValue
    getAllCombos({ pageNumber: page, pageSize, filterValue: search });
  }, [page, pageSize, search]);

  const handleAddCombo = () => {
    navigate('/manager/combo/add');
  };

  const handleEditCombo = (comboId: number) => {
    navigate(`/manager/combo/edit/${comboId}`);
  };

  const handleDeleteCombo = (id: number) => {
    // TODO: Wire up to API if needed
    message.success('Deleted combo!');
  };

  const handleApprove = (id: number) => {
    setApprovalStatus(prev => ({ ...prev, [id]: 'approved' }));
    message.success('Combo approved!');
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Combo Name',
      dataIndex: 'comboName',
      key: 'comboName',
      width: 500,
      align: 'left' as const,
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center' as const,
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <Tag color={approvalStatus[record.id] === 'approved' ? 'green' : 'orange'} style={{ fontWeight: 600, fontSize: 14 }}>
            {approvalStatus[record.id] === 'approved' ? 'Approved' : 'Waiting for Approval'}
          </Tag>
          <Button
            type={approvalStatus[record.id] === 'approved' ? 'default' : 'primary'}
            icon={<CheckOutlined />}
            disabled={approvalStatus[record.id] === 'approved'}
            onClick={() => handleApprove(record.id)}
            style={{borderRadius: 8, height: 28, padding: '0 8px'}}
          >
            {approvalStatus[record.id] === 'approved' ? 'Approved' : 'Approve'}
          </Button>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      width: 140,
      render: (_: any, record: any) => (
        <div className={styles.sttActionButtons}>
          <Button
            type="link"
            icon={<EditOutlined style={{ color: '#f97316' }} />}
            onClick={() => handleEditCombo(record.id)}
            style={{ color: '#f97316' }}
            title="Edit Combo"
          />
          <Button
            type="link"
            icon={<DeleteOutlined style={{ color: '#e53e3e' }} />}
            onClick={() => handleDeleteCombo(record.id)}
            style={{ color: '#e53e3e' }}
            title="Delete Combo"
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.sttContainer}>
      {/* Sticky Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <div className={styles.sttToolbar}>
          <Input
            placeholder="Search by ID or Combo Name"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{maxWidth: 240, borderRadius: 999}}
            size="large"
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large" 
            style={{borderRadius: 999}}
            onClick={handleAddCombo}
          >
            Add Combo
          </Button>
        </div>
      </Affix>
      {/* Combo Table */}
      <Spin spinning={getComboMutation.isPending} tip="Loading combos...">
        <Table
          columns={columns}
          dataSource={comboList}
          rowKey="id"
          className={styles.sttFreshTable}
          locale={{ emptyText: <Empty description="No records available." /> }}
          scroll={{ x: 'max-content' }}
          pagination={false}
          style={{marginBottom: 48}}
        />
        {/* Pagination */}
        {paginationCombo && paginationCombo.total > 0 && (
          <div style={{marginTop: 32, display: 'flex', justifyContent: 'center'}}>
            <Pagination
              current={paginationCombo.current}
              pageSize={paginationCombo.pageSize}
              total={paginationCombo.total}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50]}
              onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
              style={{borderRadius: 8}}
            />
          </div>
        )}
      </Spin>
    </div>
  );
};

export default ComboManagerPage;
