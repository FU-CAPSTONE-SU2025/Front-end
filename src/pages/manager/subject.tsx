import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Affix, Tag, Pagination, Spin, Empty } from 'antd';
import {SearchOutlined, CheckOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { curriculums, combos } from '../../data/schoolData';
import { useNavigate, useSearchParams } from 'react-router';
import { useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import ApprovalModal from '../../components/manager/approvalModal';
import { useApprovalActions } from '../../hooks/useApprovalActions';

const { Option } = Select;

const SubjectManagerPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [curriculumFilter, setCurriculumFilter] = useState<number | undefined>();
  const [comboFilter, setComboFilter] = useState<number | undefined>();
  // Remove local approval status state since we'll use backend data
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
    getAllSubjects({ pageNumber: page, pageSize, filterType: undefined, filterValue: search });
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
      // Refresh the subject list to get updated approval status
      getAllSubjects({ pageNumber: page, pageSize, filterType: undefined, filterValue: search });
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
        if (record.approvalStatus === 1) {
          return (
            <div style={{ fontSize: 12, color: '#52c41a' }}>
              <div>Approved by: {record.approvedBy || 'Unknown'}</div>
              <div>Date: {record.approvedAt ? new Date(record.approvedAt).toLocaleDateString() : 'Unknown'}</div>
            </div>
          );
        } else if (record.rejectionReason) {
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
      align: 'center' as 'center',
      width: 180,
      render: (_: any, record: any) => {
        const isApproved = record.approvalStatus === 1;
        return (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Tag color={isApproved ? 'green' : 'orange'} style={{ fontWeight: 500, fontSize: 12, padding: '2px 8px', borderRadius: 6, marginBottom: 0 }}>
              {isApproved ? 'Approved' : 'Waiting'}
            </Tag>
                    <Button
          type={isApproved ? 'default' : 'primary'}
          icon={<CheckOutlined style={{ fontSize: 12 }} />}
          size="small"
          onClick={async () => {
            if (isApproved) {
              // Unapprove
              await handleApproval('subject', record.id, 0, null);
            } else {
              // Approve
              handleApprove(record.id, record.subjectName);
            }
            getAllSubjects({ pageNumber: page, pageSize, filterType: undefined, filterValue: search });
          }}
          style={{borderRadius: 6, height: 22, padding: '0 6px', fontSize: 12, marginBottom: 0}}
        >
          {isApproved ? 'Approved' : 'Approve'}
        </Button>
            <Button
              type="default"
              size="small"
              style={{ borderRadius: 6, height: 22, padding: '0 10px', fontSize: 12, marginBottom: 0 }}
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
    <div>
      <div className={styles.sttContainer} style={{ paddingTop: 12 }}>
        {/* Sticky Toolbar */}
        <Affix offsetTop={80} style={{zIndex: 10}}>
          <div className={`${styles.sttToolbar} ${glassStyles.appleGlassCard}`}>
            <Input
              placeholder="Search by Subject Name or ID"
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{maxWidth: 240, borderRadius: 999}}
              size="large"
              className={glassStyles.appleGlassInput}
            />
            <Select
              allowClear
              placeholder="Filter by Curriculum"
              style={{minWidth: 180, borderRadius: 999}}
              size="large"
              value={curriculumFilter}
              onChange={setCurriculumFilter}
              className={glassStyles.appleGlassInput}
            >
              {curriculums.map(c => (
                <Option key={c.id} value={c.id}>{c.curriculumName}</Option>
              ))}
            </Select>
            <Select
              allowClear
              placeholder="Filter by Combo"
              style={{minWidth: 180, borderRadius: 999}}
              size="large"
              value={comboFilter}
              onChange={setComboFilter}
              className={glassStyles.appleGlassInput}
            >
              {combos.map(cb => (
                <Option key={cb.id} value={cb.id}>{cb.comboName}</Option>
              ))}
            </Select>
            {/* Remove the Add Subject button and bulk import logic from the toolbar and page. */}
          </div>
        </Affix>
        {/* Subject Table */}
        <Spin spinning={isLoading} tip="Loading subjects...">
          <Table
            columns={columns}
            dataSource={subjectList}
            rowKey="id"
            className={styles.sttFreshTable}
            locale={{ emptyText: <Empty description="No records available." /> }}
            scroll={{ x: 'max-content' }}
            pagination={false}
            style={{marginBottom: 48}}
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
    </div>
  );
};

export default SubjectManagerPage; 