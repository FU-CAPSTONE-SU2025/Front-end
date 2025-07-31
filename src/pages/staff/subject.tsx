import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Affix, Collapse, Pagination, Spin, Empty, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, UploadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { curriculums, combos, comboSubjects } from '../../data/schoolData';
import { useNavigate, useSearchParams } from 'react-router';
import { useCRUDSubject, useCRUDCombo } from '../../hooks/useCRUDSchoolMaterial';
import { CreateSubject } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../../components/common/bulkDataImport';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { isErrorResponse, getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import { Subject } from '../../interfaces/ISchoolProgram';

const { Option } = Select;
const { Panel } = Collapse;

const SubjectPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [curriculumFilter, setCurriculumFilter] = useState<number | undefined>();
  const [comboFilter, setComboFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
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

  // CRUD hook for combos
  const {
    comboList,
    paginationCombo,
    getAllCombos,
    comboPage,
    setComboPage,
    comboPageSize,
    setComboPageSize,
    comboSearch,
    setComboSearch,
    isComboLoading,
    fetchComboSubjectsMutation
  } = useCRUDCombo();

  // State to store subjects for each combo
  const [expandedCombo, setExpandedCombo] = useState<number | null>(null);
  const [comboSubjectsMap, setComboSubjectsMap] = useState<{ [comboId: number]: Subject[] }>({});
  const [loadingComboSubjects, setLoadingComboSubjects] = useState(false);

  // Handler for expanding a combo panel
  const handleComboPanelChange = async (key: string | string[]) => {
    if (Array.isArray(key) && key.length > 0) {
      const comboId = parseInt(key[0]);
      setExpandedCombo(comboId);
      if (!comboSubjectsMap[comboId]) {
        setLoadingComboSubjects(true);
        try {
          const subjects = await fetchComboSubjectsMutation.mutateAsync(comboId);
          if (subjects) {
            setComboSubjectsMap(prev => ({ ...prev, [comboId]: subjects }));
          }
        } catch (error) {
          const errorMessage = getUserFriendlyErrorMessage(error);
          message.error(errorMessage);
        } finally {
          setLoadingComboSubjects(false);
        }
      }
    } else {
      setExpandedCombo(null);
    }
  };

  useEffect(() => {
    // Backend search: pass search as filterValue
    getAllSubjects({ pageNumber: page, pageSize, filterType: undefined, filterValue: search });
  }, [page, pageSize, search]);

  useEffect(() => {
    const title = searchParams.get('title');
    if (title) setSearch(title);
  }, [searchParams]);

  // Remove the automatic success handling effect to prevent false positives
  // Success handling is now only done in the mutation's onSuccess callback

  const handleAddSubject = () => {
    navigate('/staff/editData/subject');
  };

  const handleAddCombo = () => {
    navigate('/staff/editData/combo');
  };

  const handleEditSubject = (subjectId: number) => {
    navigate(`/staff/editData/subject/${subjectId}`);
  };

  const handleEditCombo = (comboId: number) => {
    navigate(`/staff/editData/combo/${comboId}`);
  };

  const handleCreateSyllabus = (subjectId: number) => {
    navigate(`/staff/subject/${subjectId}/syllabus`);
  };

  const handleViewVersion = (subjectId: number) => {
    navigate(`/staff/subject/${subjectId}/version`);
  };

  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      // Extract subject data from the imported data
      const subjectData = importedData['SUBJECT'] || [];
      
      if (subjectData.length === 0) {
        message.warning('No subject data found in the imported file');
        return;
      }

      // Transform the imported data to match CreateSubject interface
      const transformedData: CreateSubject[] = subjectData.map(item => ({
        subjectCode: item.subjectCode || '',
        subjectName: item.subjectName || '',
        credits: parseInt(item.credits) || 0,
        description: item.description || ''
      }));

      // Validate the data
      const validData = transformedData.filter(item => 
        item.subjectCode.trim() !== '' && 
        item.subjectName.trim() !== '' && 
        item.credits > 0
      );

      if (validData.length === 0) {
        message.error('No valid subject data found. Please check your data format and ensure all required fields are filled.');
        return;
      }

      if (validData.length !== transformedData.length) {
        message.warning(`${transformedData.length - validData.length} rows were skipped due to missing required fields.`);
      }

      // Call the bulk import mutation
      addMultipleSubjectsMutation.mutate(validData, {
        onSuccess: () => {
          message.success(`Successfully imported ${validData.length} subjects`);
          setIsImportOpen(false);
          // Refresh the subject list
          getAllSubjects({ pageNumber: page, pageSize, filterType: undefined, filterValue: search });
        },
        onError: (error: any) => {
          console.error('Import error:', error);
          const errorMessage = getUserFriendlyErrorMessage(error);
          message.error(errorMessage);
        }
      });

    } catch (error) {
      console.error('Import error:', error);
      message.error('Error processing imported data. Please check your data format.');
    }
  };

  // Helper function to render approval status
  const renderApprovalStatus = (record: any) => {
    const approvalStatus = record.approvalStatus;
    const isApproved = approvalStatus === 1;
    const isRejected = approvalStatus === 0;
    const isPending = approvalStatus === null || approvalStatus === undefined;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isApproved && (
          <Tag color="green" icon={<CheckOutlined />}>
            Approved
          </Tag>
        )}
        {isRejected && (
          <Tag color="red" icon={<CloseOutlined />}>
            Rejected
          </Tag>
        )}
        {isPending && (
          <Tag color="orange">
            Pending
          </Tag>
        )}
      </div>
    );
  };

  // Helper function to render approval details
  const renderApprovalDetails = (record: any) => {
    const approvalStatus = record.approvalStatus;
    const isApproved = approvalStatus === 1;
    const isRejected = approvalStatus === 0;
    const isPending = approvalStatus === null || approvalStatus === undefined;

    if (isPending) {
      return (
        <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
          Awaiting approval
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {record.approvedBy && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            By: {record.approvedBy}
          </div>
        )}
        {record.approvedAt && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            {new Date(record.approvedAt).toLocaleDateString()}
          </div>
        )}
        {record.rejectionReason && (
          <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: 2 }}>
            Reason: {record.rejectionReason}
          </div>
        )}
      </div>
    );
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'left' as 'left', render: (text: any) => <div style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>{text}</div> },
    { title: 'Subject Name', dataIndex: 'subjectName', key: 'subjectName', align: 'left' as 'left', render: (text: any) => <div style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>{text}</div> },
    { 
      title: 'Subject Code', 
      dataIndex: 'subjectCode', 
      key: 'subjectCode', 
      align: 'center' as 'center', 
      render: (text: any) => <div style={{whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center'}}>{text}</div> 
    },
    { title: 'Credits', dataIndex: 'credits', key: 'credits', align: 'center' as 'center', render: (text: any) => <div style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>{text}</div> },
    {
      title: <span style={{ display: 'block', textAlign: 'center' }}>APPROVAL STATUS</span>,
      key: 'approvalStatus',
      align: 'center' as 'center',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{renderApprovalStatus(record)}</div>
      ),
    },
    {
      title: <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5, color: '#1E40AF', display: 'block', textAlign: 'center' }}>APPROVAL DETAILS</span>,
      key: 'approvalDetails',
      align: 'center' as 'center',
      render: (_: any, record: any) => renderApprovalDetails(record),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as 'center',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button
            type="link"
            icon={<EditOutlined style={{ color: '#f97316' }} />}
            onClick={() => handleEditSubject(record.id)}
            className={styles.sttFreshEditButton}
            style={{ color: '#f97316' }}
            title="Edit Subject"
          />
          <Button
            type="link"
            icon={<PlusOutlined style={{ color: '#1E40AF' }} />}
            onClick={() => handleViewVersion(record.id)}
            style={{ color: '#1E40AF' }}
            title="View Version"
          >
            View Version
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    getAllCombos({ pageNumber: comboPage, pageSize: comboPageSize, filterValue: comboSearch });
  }, [comboPage, comboPageSize, comboSearch]);

  const filteredCombos = comboList;

  const comboColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'left' as 'left', render: (text: any) => <div style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>{text}</div> },
    { title: 'Combo Name', dataIndex: 'comboName', key: 'comboName', align: 'left' as 'left', render: (text: any) => <div style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>{text}</div> },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as 'center',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button
            type="link"
            icon={<EditOutlined style={{ color: '#f97316' }} />}
            onClick={(e) => { e.stopPropagation(); handleEditCombo(record.id); }}
            className={styles.sttFreshEditButton}
            style={{ color: '#f97316' }}
            title="Edit Combo"
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.sttContainer}>
      {/* Sticky Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <div style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 4px 18px rgba(30,64,175,0.13)', padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'}}>
          <Input
            placeholder="Search by Subject Name or ID"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{maxWidth: 240, borderRadius: 999}}
            size="large"
          />
          <Select
            allowClear
            placeholder="Filter by Curriculum"
            style={{minWidth: 180, borderRadius: 999}}
            size="large"
            value={curriculumFilter}
            onChange={setCurriculumFilter}
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
          >
            {combos.map(cb => (
              <Option key={cb.id} value={cb.id}>{cb.comboName}</Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large" 
            style={{borderRadius: 999}}
            onClick={handleAddSubject}
          >
            Add Subject
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large" 
            style={{borderRadius: 999, background: '#1E40AF', borderColor: '#1E40AF'}} 
            onClick={handleAddCombo}
          >
            Add Combo
          </Button>
          <ExcelImportButton
            style={{ borderRadius: 999 }}
            onClick={() => setIsImportOpen(true)}
          >
            Import Subjects
          </ExcelImportButton>
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
      {/* Combo List Below Table */}
      <div style={{ marginTop: 48 }}>
        <Collapse accordion bordered={false} className={styles.sttFreshTable} style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)'}} onChange={handleComboPanelChange}>
          {comboList.map(combo => (
            <Panel
              header={<span style={{fontWeight: 700, fontSize: '1.1rem', color: '#1E40AF'}}>Combo: {combo.comboName}</span>}
              key={combo.id}
              style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 16, marginBottom: 12, color: '#1E40AF'}}
              extra={<Button icon={<EditOutlined />} size="small" style={{borderRadius: 999, background: '#f97316', color: '#fff', border: 'none'}} onClick={(e) => { e.stopPropagation(); handleEditCombo(combo.id); }}>{'Edit'}</Button>}
            >
              {loadingComboSubjects && expandedCombo === combo.id ? (
                <div style={{ textAlign: 'center', padding: 24 }}><Spin /> Loading subjects...</div>
              ) : (
                <ul style={{margin: 0, paddingLeft: 20}}>
                  {comboSubjectsMap[combo.id] && comboSubjectsMap[combo.id].length > 0 ? (
                    comboSubjectsMap[combo.id].map(subject => (
                      <li key={subject.id} style={{color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6}}>
                        <span style={{fontWeight: 700, color: '#64748b', minWidth: 40, fontSize: 13}} title="Subject ID">#{subject.id}</span>
                        <span style={{fontWeight: 500, fontSize: 15, flex: 1}}>{subject.subjectName}</span>
                        <span style={{fontFamily: 'monospace', color: '#2563eb', fontWeight: 600, fontSize: 13, background: '#e0e7ff', borderRadius: 6, padding: '2px 8px'}}>{subject.subjectCode}</span>
                      </li>
                    ))
                  ) : (
                    <li style={{color: '#aaa'}}>No subjects</li>
                  )}
                </ul>
              )}
            </Panel>
          ))}
        </Collapse>
      </div>
      
      {/* Data Import Modal */}
      {isImportOpen && (
        <BulkDataImport 
          onClose={() => setIsImportOpen(false)} 
          onDataImported={handleDataImported}
          supportedTypes={['SUBJECT']}
        />
      )}
   
    </div>
  );
};

export default SubjectPage; 