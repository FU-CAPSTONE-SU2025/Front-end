import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Affix, Tag, Pagination, Spin, Empty, Card, Typography, Space, Row, Col, ConfigProvider } from 'antd';
import {SearchOutlined, CheckOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { curriculums, combos } from '../../datas/schoolData';
import { useNavigate, useSearchParams } from 'react-router';
import { useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import ApprovalModal from '../../components/manager/approvalModal';
import { useApprovalActions } from '../../hooks/useApprovalActions';

const { Option } = Select;
const { Text, Title } = Typography;

const SubjectManagerPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [curriculumFilter, setCurriculumFilter] = useState<number | undefined>();
  const [comboFilter, setComboFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // CRUD hook
  const {
    getAllSubjects,
    subjectList,
    paginationSubject,
    isLoading,
    addMultipleSubjectsMutation
  } = useCRUDSubject();

  // Approval hook
  const { handleApproval, isApproving } = useApprovalActions();

  useEffect(() => {
    getAllSubjects({ pageNumber: page, pageSize, search: search });
  }, [page, pageSize, search]);

  useEffect(() => {
    const title = searchParams.get('title');
    if (title) setSearch(title);
  }, [searchParams]);

  const handleApprove = (id: number, name: string) => {
    setSelectedItem({ id, name });
    setApprovalModalVisible(true);
  };

  const handleApprovalConfirm = async (approvalStatus: number, rejectionReason?: string) => {
    if (!selectedItem) return;
    
    try {
      await handleApproval('subject', selectedItem.id, approvalStatus, rejectionReason);
      getAllSubjects({ pageNumber: page, pageSize, search: search });
      setApprovalModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleViewVersion = (subjectId: number) => {
    navigate(`/manager/subject/${subjectId}/version`);
  };

  const columns = [
    { title: 'Title', dataIndex: 'subjectName', key: 'subjectName', align: 'left' as 'left', width: 260 },
    { title: 'Subject Code', dataIndex: 'subjectCode', key: 'subjectCode', align: 'left' as 'left', width: 140 },
    {
      title: 'Approval Info',
      key: 'approvalInfo',
      align: 'left' as 'left',
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
      title: 'Actions',
      key: 'actions',
      align: 'center' as 'center',
      width: 280,
      render: (_: any, record: any) => {
        const isApproved = record.approvalStatus === 2;
        return (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            {/* Approved Status Display */}
            <Tag color={isApproved ? 'green' : record.approvalStatus === 3 ? 'red' : 'orange'} style={{ fontWeight: 500, fontSize: 12, padding: '2px 8px', borderRadius: 6, marginBottom: 0 }}>
              {isApproved ? 'Approved' : record.approvalStatus === 3 ? 'Rejected' : 'Pending'}
            </Tag>
            
            {/* Edit Status Button */}
            <Button
              type={isApproved ? 'default' : 'primary'}
              icon={<CheckOutlined style={{ fontSize: 12 }} />}
              size="small"
              onClick={async () => {
                if (isApproved) {
                  await handleApproval('subject', record.id, 1, null); // Set back to pending
                } else {
                  handleApprove(record.id, record.subjectName);
                }
                getAllSubjects({ pageNumber: page, pageSize, search: search });
              }}
              style={{borderRadius: 6, height: 22, padding: '0 6px', fontSize: 12, marginBottom: 0}}
            >
              {isApproved ? 'Edit Status' : 'Approve'}
            </Button>
            
            {/* View Version Button - Styled like Staff Edit Version */}
            <Button
              type="primary"
              icon={<EyeOutlined style={{ fontSize: 12 }} />}
              size="small"
              style={{
                borderRadius: 6,
                height: 22,
                padding: '0 8px',
                fontSize: 12,
                marginBottom: 0,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                border: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
              }}
              onClick={() => handleViewVersion(record.id)}
            >
              View Version
            </Button>
          </div>
        );
      },
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
            <Col xs={24} sm={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Search Subjects</Text>
                <Input
                  placeholder="Search by Subject Name or ID"
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  style={{borderRadius: 12, width: '100%'}}
                  size="large"
                  className={glassStyles.appleGlassInput}
                />
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Filter by Curriculum</Text>
                <Select
                  allowClear
                  placeholder="Select Curriculum"
                  style={{borderRadius: 12, width: '100%'}}
                  size="large"
                  value={curriculumFilter}
                  onChange={setCurriculumFilter}
                  className={glassStyles.appleGlassInput}
                >
                  {curriculums.map(c => (
                    <Option key={c.id} value={c.id}>{c.curriculumName}</Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Filter by Combo</Text>
                <Select
                  allowClear
                  placeholder="Select Combo"
                  style={{borderRadius: 12, width: '100%'}}
                  size="large"
                  value={comboFilter}
                  onChange={setComboFilter}
                  className={glassStyles.appleGlassInput}
                >
                  {combos.map(cb => (
                    <Option key={cb.id} value={cb.id}>{cb.comboName}</Option>
                  ))}
                </Select>
              </Space>
            </Col>
          </Row>
        </Card>
      </Affix>
        <Spin spinning={isLoading} tip="Loading subjects...">
          <Table
            columns={columns}
            dataSource={subjectList}
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
          {paginationSubject && paginationSubject.total > 0 && (
            <div style={{marginTop: 32, display: 'flex', justifyContent: 'center'}}>
              <Pagination
                current={paginationSubject.current}
                pageSize={paginationSubject.pageSize}
                total={paginationSubject.total}
                showSizeChanger
                pageSizeOptions={[5, 10, 20, 50]}
                onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
                style={{borderRadius: 8}}
              />
            </div>
          )}
        </Spin>
      {/* Approval Modal */}
      <ApprovalModal
        visible={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false);
          setSelectedItem(null);
        }}
        onConfirm={handleApprovalConfirm}
        type="subject"
        itemId={selectedItem?.id || 0}
        itemName={selectedItem?.name || ''}
        loading={isApproving}
      />
    </div>
    </ConfigProvider>
  );
};

export default SubjectManagerPage; 