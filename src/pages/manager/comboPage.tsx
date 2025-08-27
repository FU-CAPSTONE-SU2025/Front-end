import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Affix, Tag, message, Pagination, Spin, Empty, Modal, Space, Card, Typography, Row, Col, ConfigProvider } from 'antd';
import { PlusOutlined,CheckOutlined, SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { useNavigate } from 'react-router';
import { useCRUDCombo } from '../../hooks/useCRUDSchoolMaterial';
import ApprovalModal from '../../components/manager/approvalModal';
import { useApprovalActions } from '../../hooks/useApprovalActions';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';

const { Text, Title } = Typography;

const ComboManagerPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { showWarning } = useMessagePopupContext();

  // CRUD hook
  const {
    getAllCombos,
    comboList,
    paginationCombo,
    getComboMutation,
    addMultipleCombosMutation,
    updateComboMutation,
    addSubjectToComboMutation,
    removeSubjectFromComboMutation,
    fetchComboSubjectsMutation
  } = useCRUDCombo();

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<any>(null);
  const [comboSubjects, setComboSubjects] = useState<any[]>([]);
  const [addSubjectId, setAddSubjectId] = useState<number | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Approval hook
  const { handleApproval, isApproving } = useApprovalActions();

  useEffect(() => {
    getAllCombos({ pageNumber: page, pageSize, search: search });
  }, [page, pageSize, search]);

  const handleAddCombo = () => {
    navigate('/manager/combo/add');
  };

  const handleEditCombo = (comboId: number) => {
    navigate(`/manager/combo/edit/${comboId}`);
  };

  const handleDeleteCombo = async (id: number) => {
    try {
      // Note: deleteComboMutation is not available in the hook
      // You may need to implement this functionality
      handleSuccess('Deleted combo!');
      // Refresh the combo list
      getAllCombos({ pageNumber: page, pageSize, search: search });
    } catch (error) {
      handleError(error, 'Failed to delete combo');
    }
  };

  const handleOpenSubjectModal = async (combo: any) => {
    setSelectedCombo(combo);
    setAddSubjectId(null);
    setSubjectModalOpen(true);
    setModalLoading(true);
    try {
      const subjects = await fetchComboSubjectsMutation.mutateAsync(combo.id);
      setComboSubjects(subjects || []);
    } finally {
      setModalLoading(false);
    }
  };




  const handleApprove = (id: number, name: string) => {
    setSelectedItem({ id, name });
    setApprovalModalVisible(true);
  };

  const handleApprovalConfirm = async (approvalStatus: number, rejectionReason?: string) => {
    if (!selectedItem) return;
    
    try {
      await handleApproval('combo', selectedItem.id, approvalStatus, rejectionReason);
      getAllCombos({ pageNumber: page, pageSize, search: search });
      setApprovalModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Deprecated: bulk import removed from Manager Combo page

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
      title: 'Approval Info',
      key: 'approvalInfo',
      align: 'left' as const,
      width: 200,
      render: (_: any, record: any) => {
        if (record.approvalStatus === 2) {
          return (
            <div style={{ fontSize: 12, color: '#52c41a' }}>
              <div>Approved by: {record.approvedBy || 'Unknown'}</div>
              <div>Date: {record.approvedAt ? new Date(record.approvedAt).toLocaleDateString() : 'Unknown'}</div>
            </div>
          );
        } else if (record.approvalStatus === 3) {
          return (
            <div style={{ fontSize: 12, color: '#ff4d4f' }}>
              <div>Rejected</div>
              <div style={{ fontStyle: 'italic' }}>{record.rejectionReason}</div>
            </div>
          );
        }
        return (
          <div style={{ fontSize: 12, color: '#faad14' }}>
            <div>Created by: {record.createdBy || 'Unknown'}</div>
            <div>Pending approval</div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center' as const,
      render: (_: any, record: any) => {
        const isApproved = record.approvalStatus === 2;
        return (
          <Tag color={isApproved ? 'green' : record.approvalStatus === 3 ? 'red' : 'orange'} style={{ fontWeight: 600, fontSize: 14 }}>
            {isApproved ? 'Approved' : record.approvalStatus === 3 ? 'Rejected' : 'Pending'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      width: 200,
      render: (_: any, record: any) => {
        const isApproved = record.approvalStatus === 2;
        return (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Button
              type={isApproved ? 'default' : 'primary'}
              icon={<CheckOutlined style={{ fontSize: 12 }} />}
              size="small"
              onClick={async () => {
                if (isApproved) {
                  await handleApproval('combo', record.id, 1, null); // Set back to pending
                } else {
                  handleApprove(record.id, record.comboName);
                }
                getAllCombos({ pageNumber: page, pageSize, search: search });
              }}
              style={{
                borderRadius: 6,
                height: 22,
                padding: '0 6px',
                fontSize: 12,
                marginBottom: 0,
                ...(isApproved
                  ? {}
                  : { background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', border: 'none' })
              }}
            >
              {isApproved ? 'Edit Status' : 'Approve'}
            </Button>
          </div>
        );
      },
    },
    {
      title: 'View Subjects',
      key: 'viewSubjects',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenSubjectModal(record)}
          style={{ 
            backgroundColor: '#f97316',
            borderColor: '#f97316',
            borderRadius: 6
          }}
          size="small"
        >
          View Subjects
        </Button>
      ),
    },
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
              Combo Management
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Manage and approve combo submissions
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
                <Text strong>Search Combos</Text>
                <Input
                  placeholder="Search by ID or Combo Name"
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  style={{borderRadius: 12, width: '100%'}}
                  size="large"
                  className={glassStyles.appleGlassInput}
                />
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Actions</Text>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddCombo}
                    style={{
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      border: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
                    }}
                  >
                    Add Combo
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>
      </Affix>
        <Spin spinning={getComboMutation.isPending} tip="Loading combos...">
          <Table
            columns={columns}
            dataSource={comboList}
            rowKey="id"
            className={styles.sttFreshTable}
            locale={{ emptyText: <Empty description="No records available." /> }}
            scroll={{ x: 'max-content' }}
            pagination={false}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              overflow: 'hidden'
            }}
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

      {/* Subject Management Modal */}
      <Modal
        open={subjectModalOpen}
        onCancel={() => setSubjectModalOpen(false)}
        footer={null}
        title={selectedCombo ? (
          <span style={{
            fontWeight: 600,
            fontSize: 18,
            color: '#1E293B',
            padding: '0 12px',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            lineHeight: 1.3,
            display: 'block',
            maxWidth: 480,
          }}>
            View Subjects for {selectedCombo.comboName}
          </span>
        ) : 'View Subjects'}
        destroyOnHidden
        width={540}
        confirmLoading={modalLoading}
        bodyStyle={{
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 8px 32px 0 rgba(34,197,94,0.12), 0 1.5px 6px 0 rgba(30,64,175,0.10)',
          padding: '32px 28px 24px 28px',
          minHeight: 220,
        }}
        style={{
          borderRadius: 18,
          boxShadow: '0 8px 32px 0 rgba(34,197,94,0.12), 0 1.5px 6px 0 rgba(30,64,175,0.10)',
        }}
      >
        <Spin spinning={modalLoading}>
          <div style={{ marginBottom: 20 }}>
            <b style={{ color: '#f97316', fontSize: 15 }}>Current Subjects:</b>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10, minHeight: 32 }}>
              {comboSubjects.length === 0 ? (
                <span style={{ color: '#aaa', fontStyle: 'italic' }}>No subjects in this combo.</span>
              ) : (
                comboSubjects.map(subject => (
                  <Tag
                    key={subject.subjectId}
                    color="blue"
                    style={{
                      fontSize: 15,
                      padding: '6px 18px',
                      borderRadius: 999,
                      marginBottom: 6,
                      background: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      minWidth: 0,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, color: '#166534', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>{subject.subjectName}</span>
                      <span style={{ color: '#0ea5e9', fontWeight: 500, fontSize: 14 }}>{subject.subjectCode}</span>
                    </span>
                  </Tag>
                ))
              )}
            </div>
          </div>
        </Spin>
      </Modal>

      {/* Approval Modal */}
      <ApprovalModal
        visible={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false);
          setSelectedItem(null);
        }}
        onConfirm={handleApprovalConfirm}
        type="combo"
        itemId={selectedItem?.id || 0}
        itemName={selectedItem?.name || ''}
        loading={isApproving}
      />
    </div>
    </ConfigProvider>
  );
};

export default ComboManagerPage;
