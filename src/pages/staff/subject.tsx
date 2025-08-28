import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Affix, Collapse, Pagination, Spin, Empty, Tag, ConfigProvider } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
// import { curriculums, combos } from '../../datas/schoolData';
import { useSchoolApi } from '../../hooks/useSchoolApi';
import { useNavigate, useSearchParams } from 'react-router';
import { useCRUDSubject, useCRUDCombo } from '../../hooks/useCRUDSchoolMaterial';
import { CreateSubject } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../../components/common/bulkDataImport';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { Subject } from '../../interfaces/ISchoolProgram';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';

const SubjectPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [curriculumFilter, setCurriculumFilter] = useState<number | undefined>();
  const [comboFilter, setComboFilter] = useState<number | undefined>();
  const [programForCurriculum] = useState<number | undefined>(undefined);
  // API-backed lists for filters
  const { useInfiniteComboList, useInfiniteCurriculumList } = useSchoolApi();
  const [comboListPage, setComboListPage] = useState(1);
  const [comboListSearch, setComboListSearch] = useState('');
  const [comboOptions, setComboOptions] = useState<any[]>([]);
  const { data: comboPaged, isLoading: comboFetching } = useInfiniteComboList(comboListPage, 10, comboListSearch);

  const [curriculumListPage, setCurriculumListPage] = useState(1);
  const [curriculumListSearch, setCurriculumListSearch] = useState('');
  const [curriculumOptions, setCurriculumOptions] = useState<any[]>([]);
  const { data: curriculumPaged, isLoading: curriculumFetching } = useInfiniteCurriculumList(curriculumListPage, 10, curriculumListSearch, programForCurriculum);

  // Accumulate options for infinite scroll
  useEffect(() => {
    const items = comboPaged?.items || [];
    if (comboListPage === 1) setComboOptions(items);
    else if (items.length) setComboOptions(prev => {
      const exist = new Set(prev.map((i: any) => i.id));
      const unique = items.filter((i: any) => !exist.has(i.id));
      return [...prev, ...unique];
    });
  }, [comboPaged, comboListPage]);
  useEffect(() => {
    const items = curriculumPaged?.items || [];
    if (curriculumListPage === 1) setCurriculumOptions(items);
    else if (items.length) setCurriculumOptions(prev => {
      const exist = new Set(prev.map((i: any) => i.id));
      const unique = items.filter((i: any) => !exist.has(i.id));
      return [...prev, ...unique];
    });
  }, [curriculumPaged, curriculumListPage]);

  // Reset pages on search change
  useEffect(() => { setComboListPage(1); }, [comboListSearch]);
  useEffect(() => { setCurriculumListPage(1); }, [curriculumListSearch, programForCurriculum]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleError, handleSuccess } = useApiErrorHandler();

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
    getAllCombos,
    comboPage,
    setComboPage,
    comboPageSize,
    comboSearch,
    setComboSearch,
    fetchComboSubjectsMutation
  } = useCRUDCombo();

  //  combo search, set the search only execute after 500ms, that is like... 3 letters before running, should run better than calling API everytime it is change
  const [debouncedComboSearch, setDebouncedComboSearch] = useState(comboSearch);
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedComboSearch(comboSearch), 500);
    return () => clearTimeout(handle);
  }, [comboSearch]);

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
          handleError(error);
        } finally {
          setLoadingComboSubjects(false);
        }
      }
    } else {
      setExpandedCombo(null);
    }
  };

  useEffect(() => {
    // In future, pass filters to API when supported; for now reuse search
    getAllSubjects({ pageNumber: page, pageSize, search: search });
  }, [page, pageSize, search, comboFilter, curriculumFilter]);

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

  const handleViewVersion = (subjectId: number) => {
    navigate(`/staff/subject/${subjectId}/version`);
  };

  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      // Extract subject data from the imported data
      const subjectData = importedData['SUBJECT'] || [];
      
      if (subjectData.length === 0) {
        handleError('No subject data found in the imported file');
        return;
      }

      // Transform the imported data to match CreateSubject interface
      const transformedData: CreateSubject[] = subjectData.map(item => ({
        subjectName: item.subjectName || item['Subject Name'] || item.SubjectName || '',
        subjectCode: item.subjectCode || item['Subject Code'] || item.SubjectCode || '',
        credits: parseInt(item.credits) || 3,
        description: item.description || item.Description || ''
      }));

      // Validate the data
      const validData = transformedData.filter(item => 
        item.subjectName.trim() !== '' && 
        item.subjectCode.trim() !== '' && 
        item.credits > 0
      );

      if (validData.length === 0) {
        handleError('No valid subject data found. Please check your data format and ensure all required fields are filled.');
        return;
      }

      if (validData.length !== transformedData.length) {
        handleError(`${transformedData.length - validData.length} rows were skipped due to missing required fields.`);
      }

      // Call the bulk import mutation
      await addMultipleSubjectsMutation.mutateAsync(validData);
      handleSuccess(`Successfully imported ${validData.length} subjects`);
      setIsImportOpen(false);
      
      // Refresh the subject list
      getAllSubjects({ pageNumber: page, pageSize, search: search });
    } catch (error) {
      handleError(error);
    }
  };

  // Helper function to render approval status
  const renderApprovalStatus = (record: any) => {
    const approvalStatus = record.approvalStatus;
    const isApproved = approvalStatus === 2;
    const isRejected = approvalStatus === 3;
    const isPending = approvalStatus === 1 || approvalStatus === undefined;

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
      title: <span style={{ display: 'block', textAlign: 'center' }}>Approval Status</span>,
      key: 'approvalStatus',
      align: 'center' as 'center',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{renderApprovalStatus(record)}</div>
      ),
    },
    {
      title: <span style={{letterSpacing: 0.5, color: 'white', display: 'block', textAlign: 'center' }}>Approval Detals</span>,
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
    getAllCombos({ pageNumber: comboPage, pageSize: comboPageSize, search: debouncedComboSearch });
  }, [comboPage, comboPageSize, debouncedComboSearch]);

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
    <div className={styles.sttContainer}
      style={{height:"210vh"}}
      // only for this page to combat the dynamic rendering of the combo list
    >
      {/* Sticky Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <div className={glassStyles.appleGlassCard} style={{ borderRadius: 20, boxShadow: '0 4px 18px rgba(30,64,175,0.13)', padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'}}>
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
            style={{minWidth: 240, borderRadius: 999}}
            size="large"
            value={curriculumFilter}
            showSearch
            onSearch={(v) => setCurriculumListSearch(v)}
            filterOption={false}
            onPopupScroll={(e) => {
              const el = e.target as HTMLDivElement;
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4 && !curriculumFetching) {
                const total = curriculumPaged?.totalCount || 0;
                if (curriculumOptions.length < total) setCurriculumListPage(p => p + 1);
              }
            }}
            onChange={(val) => setCurriculumFilter(val)}
            options={curriculumOptions.map((c: any) => ({ value: c.id, label: `${c.curriculumName} (${c.curriculumCode})` }))}
          />
          <Select
            allowClear
            placeholder="Filter by Combo"
            style={{minWidth: 240, borderRadius: 999}}
            size="large"
            value={comboFilter}
            showSearch
            onSearch={(v) => setComboListSearch(v)}
            filterOption={false}
            onPopupScroll={(e) => {
              const el = e.target as HTMLDivElement;
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4 && !comboFetching) {
                const total = comboPaged?.totalCount || 0;
                if (comboOptions.length < total) setComboListPage(p => p + 1);
              }
            }}
            onChange={(val) => setComboFilter(val)}
            options={comboOptions.map((cb: any) => ({ value: cb.id, label: cb.comboName }))}
          />
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
      {/* Combo List Toolbar + Table */}
      <div style={{ marginTop: 48 }}>
        {/* Combo Toolbar */}
        <div style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginBottom: 12,
          borderRadius: 16,
          padding: 12,
          boxShadow: '0 6px 20px rgba(30,64,175,0.10)'
        }}
        className={glassStyles.appleGlassCard}
        >
          <Input
            placeholder="Search combos..."
            value={comboSearch}
            onChange={(e) => {
              const val = e.target.value;
              setComboSearch(val);
              setComboPage(1);
            }}
            prefix={<SearchOutlined />}
            style={{ maxWidth: 320, borderRadius: 999 }}
            allowClear
            size="large"
          />
        </div>
        <Collapse 
          accordion 
          bordered={false} 
          className={styles.sttFreshTable} 
          style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)'}} 
          onChange={handleComboPanelChange}
          items={comboList.map(combo => ({
            key: combo.id,
            label: <span style={{fontWeight: 700, fontSize: '1.1rem', color: '#1E40AF'}}>Combo: {combo.comboName}</span>,
            children: (
              loadingComboSubjects && expandedCombo === combo.id ? (
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
              )
            ),
            extra: <Button icon={<EditOutlined />} size="small" style={{borderRadius: 999, background: '#f97316', color: '#fff', border: 'none'}} onClick={(e) => { e.stopPropagation(); handleEditCombo(combo.id); }}>{'Edit'}</Button>,
            style: {background: 'rgba(255, 255, 255, 0.90)', borderRadius: 16, marginBottom: 12, color: '#1E40AF'}
          }))}
        />
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
    </ConfigProvider>
  );
};

export default SubjectPage; 