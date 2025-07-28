import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Affix, Tag, message, Pagination, Spin, Empty, Modal, Select, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { useNavigate } from 'react-router';
import { useCRUDCombo } from '../../hooks/useCRUDSchoolMaterial';
import { CreateCombo } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../../components/common/bulkDataImport';
import { useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import { GetSubjectsInCombo } from '../../api/SchoolAPI/comboAPI';
import { isErrorResponse } from '../../api/AxiosCRUD';
import SubjectSelect from '../../components/common/SubjectSelect';

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
    addMultipleCombosMutation,
    updateComboMutation,
    addSubjectToComboMutation,
    removeSubjectFromComboMutation,
    fetchComboSubjectsMutation
  } = useCRUDCombo();

  const { subjectList, getAllSubjects } = useCRUDSubject();
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<any>(null);
  const [comboSubjects, setComboSubjects] = useState<any[]>([]); // Will hold SubjectInCombo[]
  const [addSubjectId, setAddSubjectId] = useState<number | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    // Backend search: pass search as filterValue
    getAllCombos({ pageNumber: page, pageSize, filterValue: search });
  }, [page, pageSize, search]);

  // Remove the automatic success handling effect to prevent false positives
  // Success handling is now only done in the mutation's onSuccess callback

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
    setSubjectModalOpen(true);
    setModalLoading(true);
    try {
      const subjects = await fetchComboSubjectsMutation.mutateAsync(combo.id);
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
      const subjects = await fetchComboSubjectsMutation.mutateAsync(selectedCombo.id);
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
      const subjects = await fetchComboSubjectsMutation.mutateAsync(selectedCombo.id);
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
    // For now, just update the local state since UpdateCombo doesn't support status
    setApprovalStatus(prev => ({ ...prev, [id]: 'approved' }));
    message.success('Combo approved!');
    // TODO: If backend supports status updates, implement API call here
  };

  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      // Extract combo data from the imported data
      const comboData = importedData['COMBO'] || [];
      
      if (comboData.length === 0) {
        message.warning('No combo data found in the imported file');
        return;
      }

      // Transform the imported data to match CreateCombo interface
      const transformedData: CreateCombo[] = comboData.map(item => ({
        comboName: item.comboName || '',
        comboDescription: item.comboDescription || '',
        subjectIds: [] // Start with empty subject IDs array
      }));

      // Validate the data
      const validData = transformedData.filter(item => 
        item.comboName.trim() !== ''
      );

      if (validData.length === 0) {
        message.error('No valid combo data found. Please check your data format and ensure combo names are provided.');
        return;
      }

      if (validData.length !== transformedData.length) {
        message.warning(`${transformedData.length - validData.length} rows were skipped due to missing required fields.`);
      }

      // Call the bulk import mutation
      addMultipleCombosMutation.mutate(validData, {
        onSuccess: () => {
          message.success(`Successfully imported ${validData.length} combos`);
          setIsImportOpen(false);
          // Refresh the combo list
          getAllCombos({ pageNumber: page, pageSize, filterValue: search });
        },
        onError: (error: any) => {
          console.error('Import error:', error);
          
          // Extract ErrorResponse details if available
          let errorMessage = 'Unknown error occurred';
          let errorStatus = '';
          
          // Check if the error has an attached ErrorResponse
          if (error.errorResponse && isErrorResponse(error.errorResponse)) {
            errorMessage = error.errorResponse.message;
            errorStatus = ` (Status: ${error.errorResponse.status})`;
          } 
          // Check if the error itself is an ErrorResponse
          else if (isErrorResponse(error)) {
            errorMessage = error.message;
            errorStatus = ` (Status: ${error.status})`;
          }
          // Fallback to error message
          else if (error?.message) {
            errorMessage = error.message;
          }
          
          message.error(`Error importing combos: ${errorMessage}${errorStatus}`);
        }
      });

    } catch (error) {
      console.error('Import error:', error);
      message.error('Error processing imported data. Please check your data format.');
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
      title: 'View Subjects',
      key: 'viewSubjects',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<PlusOutlined />} // You may want to use a book icon for consistency
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
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      width: 200,
      render: (_: any, record: any) => (
        <Button
          type={approvalStatus[record.id] === 'approved' ? 'default' : 'primary'}
          icon={<CheckOutlined />}
          disabled={approvalStatus[record.id] === 'approved'}
          onClick={() => handleApprove(record.id)}
          style={{borderRadius: 8, height: 28, padding: '0 8px', marginLeft: 8}}
        >
          {approvalStatus[record.id] === 'approved' ? 'Approved' : 'Approve'}
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.sttContainer}>
      {/* Sticky Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <div className={`${styles.sttToolbar} ${glassStyles.appleGlassCard}`}>
          <Input
            placeholder="Search by ID or Combo Name"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{maxWidth: 240, borderRadius: 999}}
            size="large"
            className={glassStyles.appleGlassInput}
          />
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
          supportedTypes={['COMBO']}
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
            View Subjects for {selectedCombo.comboName}
          </span>
        ) : 'View Subjects'}
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
    </div>
  );
};

export default ComboManagerPage;
