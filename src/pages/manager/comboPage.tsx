import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Affix, Tag, message, Pagination, Spin, Empty, Modal, Select, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { useNavigate } from 'react-router';
import { useCRUDCombo } from '../../hooks/useCRUDSchoolMaterial';
import BulkDataImport from '../../components/common/bulkDataImport';
import { useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import { GetSubjectsInCombo } from '../../api/SchoolAPI/comboAPI';

const ComboManagerPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [approvalStatus, setApprovalStatus] = useState<{ [id: number]: 'pending' | 'approved' }>({});
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  // CRUD hook
  const {
    getAllCombos,
    comboList,
    paginationCombo,
    getComboMutation,
    addComboMutation,
    updateComboMutation
  } = useCRUDCombo();

  const { subjectList, getAllSubjects } = useCRUDSubject();
  const { addSubjectToComboMutation, removeSubjectFromComboMutation } = useCRUDCombo();
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<any>(null);
  const [comboSubjects, setComboSubjects] = useState<any[]>([]); // Will hold SubjectInCombo[]
  const [addSubjectId, setAddSubjectId] = useState<number | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  // Open modal and load subjects for combo
  const handleOpenSubjectModal = async (combo: any) => {
    setSelectedCombo(combo);
    setAddSubjectId(null);
    getAllSubjects({ pageNumber: 1, pageSize: 100 });
    setSubjectModalOpen(true);
    setModalLoading(true);
    try {
      const subjects = await GetSubjectsInCombo(combo.id);
      setComboSubjects(subjects || []);
    } finally {
      setModalLoading(false);
    }
  };

  // Add subject to combo (backend)
  const handleAddSubject = async () => {
    if (!selectedCombo || !addSubjectId || comboSubjects.some(s => s.subjectId === addSubjectId)) return;
    setModalLoading(true);
    try {
      await addSubjectToComboMutation.mutateAsync({ comboId: selectedCombo.id, subjectId: addSubjectId });
      const subjects = await GetSubjectsInCombo(selectedCombo.id);
      setComboSubjects(subjects || []);
      setAddSubjectId(null);
      message.success('Subject added to combo!');
    } catch {
      message.error('Failed to add subject.');
    } finally {
      setModalLoading(false);
    }
  };

  // Remove subject from combo (backend)
  const handleRemoveSubject = async (subjectId: number) => {
    if (!selectedCombo) return;
    setModalLoading(true);
    try {
      await removeSubjectFromComboMutation.mutateAsync({ comboId: selectedCombo.id, subjectId });
      const subjects = await GetSubjectsInCombo(selectedCombo.id);
      setComboSubjects(subjects || []);
      message.success('Subject removed from combo!');
    } catch {
      message.error('Failed to remove subject.');
    } finally {
      setModalLoading(false);
    }
  };

  // Approve combo (backend)
  const handleApprove = (id: number) => {
    updateComboMutation.mutate({
      id,
      data: { status: 'approved' }
    }, {
      onSuccess: () => {
        setApprovalStatus(prev => ({ ...prev, [id]: 'approved' }));
        message.success('Combo approved!');
        getAllCombos({ pageNumber: page, pageSize, filterValue: search });
      },
      onError: () => {
        message.error('Failed to approve combo!');
      }
    });
  };

  const handleDataImported = async (data: { [key: string]: string }[]) => {
    try {
      // Process each imported combo
      for (const comboData of data) {
        await addComboMutation.mutateAsync({
          comboName: comboData.comboName,
          comboDescription: comboData.comboDescription || '',
          subjectIds: []
        });
      }
      
      message.success(`Successfully imported ${data.length} combos`);
      // Refresh the combo list
      getAllCombos({ pageNumber: page, pageSize, filterValue: search });
    } catch (error) {
      message.error('Error importing combos. Please check your data format.');
    }
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
        <Tag color={approvalStatus[record.id] === 'approved' ? 'green' : 'orange'} style={{ fontWeight: 600, fontSize: 14 }}>
          {approvalStatus[record.id] === 'approved' ? 'Approved' : 'Waiting for Approval'}
        </Tag>
      ),
    },
    {
      title: 'Subjects',
      key: 'subjects',
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Button size="small" onClick={() => handleOpenSubjectModal(record)}>
          Add Subject
        </Button>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      width: 200,
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
          <Button
            type={approvalStatus[record.id] === 'approved' ? 'default' : 'primary'}
            icon={<CheckOutlined />}
            disabled={approvalStatus[record.id] === 'approved'}
            onClick={() => handleApprove(record.id)}
            style={{borderRadius: 8, height: 28, padding: '0 8px', marginLeft: 8}}
          >
            {approvalStatus[record.id] === 'approved' ? 'Approved' : 'Approve'}
          </Button>
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
          <Button 
            type="default" 
            icon={<UploadOutlined />} 
            size="large" 
            style={{borderRadius: 999, borderColor: '#10B981', color: '#10B981'}} 
            onClick={() => setIsImportOpen(true)}
          >
            Import Combos
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
      
      {/* Data Import Modal */}
      {isImportOpen && (
        <BulkDataImport 
          onClose={() => setIsImportOpen(false)} 
          onDataImported={handleDataImported}
        />
      )}

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
            Manage Subjects for {selectedCombo.comboName}
          </span>
        ) : 'Manage Subjects'}
        destroyOnClose
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
            <b style={{ color: '#22C55E', fontSize: 15 }}>Current Subjects:</b>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10, minHeight: 32 }}>
              {comboSubjects.length === 0 ? (
                <span style={{ color: '#aaa', fontStyle: 'italic' }}>No subjects in this combo.</span>
              ) : (
                comboSubjects.map(subject => (
                  <Tag
                    key={subject.subjectId}
                    color="blue"
                    closable
                    onClose={() => handleRemoveSubject(subject.subjectId)}
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
          <Space>
            <Select
              showSearch
              placeholder="Add subject to combo"
              value={addSubjectId}
              onChange={setAddSubjectId}
              style={{ width: 260 }}
              optionFilterProp="children"
            >
              {subjectList
                .filter(s => !comboSubjects.some(cs => cs.subjectId === s.id))
                .map(subject => (
                  <Select.Option key={subject.id} value={subject.id}>
                    {subject.subjectName} ({subject.subjectCode})
                  </Select.Option>
                ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined style={{ fontSize: 18, marginRight: 4 }} />}
              onClick={handleAddSubject}
              disabled={!addSubjectId}
              style={{
                background: 'linear-gradient(90deg, #ea580c 0%, #fbbf24 100%)',
                border: 'none',
                fontWeight: 700,
                borderRadius: 999,
                boxShadow: '0 2px 12px #fdba7455',
                padding: '0 28px',
                fontSize: 17,
                color: '#fff',
                letterSpacing: 0.5,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.2s, box-shadow 0.2s',
                outline: 'none',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #fbbf24 0%, #ea580c 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #ea580c 0%, #fbbf24 100%)'}
            >
              Add Subject
            </Button>
          </Space>
        </Spin>
      </Modal>
    </div>
  );
};

export default ComboManagerPage;
