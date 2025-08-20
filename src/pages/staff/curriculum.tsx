
import React, { useState, useEffect } from 'react';
import { Input, Button, Collapse, Typography, Affix, Pagination, Spin, Empty, Table, Tag, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, BookOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { useSearchParams, useNavigate, useParams } from 'react-router';
import BulkDataImport from '../../components/common/bulkDataImport';
import { useCRUDCurriculum } from '../../hooks/useCRUDSchoolMaterial';
import { Curriculum, SubjectVersionWithCurriculumInfo, CreateCurriculum, Program } from '../../interfaces/ISchoolProgram';
import dayjs from 'dayjs';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useSchoolApi } from '../../hooks/useSchoolApi';

const { Title } = Typography;
const { Option } = Select;

const CurriculumPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [expandedCurriculum, setExpandedCurriculum] = useState<number | null>(null);
  const { handleError, handleSuccess } = useApiErrorHandler();
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { useProgramList } = useSchoolApi();
  const { data: programsData } = useProgramList();
  const programs = programsData?.items || [];
  
  // Program filter state
  const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>();

  // CRUD hooks
  const {
    getAllCurriculums,
    curriculumList,
    paginationCurriculum,
    isLoading,
    fetchCurriculumSubjectVersionsMutation,
    addMultipleCurriculumsMutation
  } = useCRUDCurriculum();

  // State to store subject versions for each curriculum
  const [curriculumSubjectVersionsMap, setCurriculumSubjectVersionsMap] = useState<{[key: number]: SubjectVersionWithCurriculumInfo[]}>({});
  // Add default Filter if navigate from the Program page
  const [programId] = useSearchParams();
  useEffect(() => {
    if(programId!==null && programId!==undefined){
      setSelectedProgramId(parseInt(programId.get('programId') || '0'));
    }
    //console.log("programId",programId)
  }, [programId]);

  // Fetch data on mount, page, pageSize, or search change
  useEffect(() => {
   
    getAllCurriculums({ pageNumber: page, pageSize, search: search || undefined, programId: selectedProgramId || undefined });
  }, [page, pageSize, search, selectedProgramId]);
  useEffect(() => {
    const title = searchParams.get('title');
    if (title) setSearch(title);
  }, [searchParams]);



  const handleProgramsPopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Programs are loaded all at once, no pagination needed
    // This function is kept for compatibility but doesn't need to do anything
  };

  // Remove the automatic success handling effect to prevent false positives
  // Success handling is now only done in the mutation's onSuccess callback

  // Fetch subject versions when a curriculum is expanded
  const handlePanelChange = async (key: string | string[]) => {
    if (Array.isArray(key) && key.length > 0) {
      const curriculumId = parseInt(key[0]);
      setExpandedCurriculum(curriculumId);
      
      // Only fetch if we haven't already
      if (!curriculumSubjectVersionsMap[curriculumId]) {
        try {
          const subjectVersions = await fetchCurriculumSubjectVersionsMutation.mutateAsync(curriculumId);
          if (subjectVersions) {
            setCurriculumSubjectVersionsMap(prev => ({
              ...prev,
              [curriculumId]: subjectVersions
            }));
          }
        } catch (error) {
          console.error('Failed to fetch curriculum subject versions:', error);
        }
      }
    } else {
      setExpandedCurriculum(null);
    }
  };

  const handleAddCurriculum = () => {
    navigate('/staff/editData/curriculum');
  };

  const handleEditCurriculum = (curriculumId: number) => {
    navigate(`/staff/editData/curriculum/${curriculumId}`);
  };


  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      setUploadStatus('uploading');
      
      // Extract curriculum data from the imported data
      const curriculumData = importedData['CURRICULUM'] || [];
      
      if (curriculumData.length === 0) {
        handleError('No curriculum data found in the imported file');
        setUploadStatus('error');
        return;
      }

      // Transform the data to match the CreateCurriculum interface
      const transformedData: CreateCurriculum[] = curriculumData.map((item: any) => ({
        curriculumCode: item.curriculumCode || '',
        curriculumName: item.curriculumName || '',
        effectiveDate: item.effectiveDate ? new Date(item.effectiveDate) : new Date(),
        programId: parseInt(item.programId) || 1,
      }));

      // Validate the transformed data
      const validData = transformedData.filter(item => 
        item.curriculumCode && 
        item.curriculumName && 
        item.effectiveDate && 
        item.programId
      );

      if (validData.length === 0) {
        handleError('No valid curriculum data found. Please check your data format and ensure all required fields are filled.');
        setUploadStatus('error');
        return;
      }

      if (validData.length < transformedData.length) {
        handleError(`${transformedData.length - validData.length} rows were skipped due to missing required fields.`);
      }

      // Import the valid data
      await addMultipleCurriculumsMutation.mutateAsync(validData);
      handleSuccess(`Successfully imported ${validData.length} curricula`);
      setUploadStatus('success');
      setIsImportOpen(false);
      
      // Refresh the curriculum list
      getAllCurriculums({ pageNumber: page, pageSize, search: search });
    } catch (error) {
      handleError(error);
      setUploadStatus('error');
    }
  };

  // Table columns for subject versions
  const subjectVersionColumns = [
    {
      title: 'Subject Code',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      render: (text: string) => (
        <span style={{ fontWeight: '600', color: '#1E40AF' }}>{text}</span>
      ),
    },
    {
      title: 'Subject Name',
      dataIndex: 'subjectName',
      key: 'subjectName',
    },
    {
      title: 'Version',
      dataIndex: 'versionName',
      key: 'versionName',
      render: (text: string, record: SubjectVersionWithCurriculumInfo) => (
        <span style={{ fontWeight: '600', color: '#059669' }}>
          {record.versionName} ({record.versionCode})
        </span>
      ),
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      render: (credits: number) => (
        <Tag color="blue" style={{ fontWeight: '600' }}>
          {credits} credits
        </Tag>
      ),
    },
    {
      title: 'Semester',
      key: 'semester',
      render: (_: any, record: SubjectVersionWithCurriculumInfo) => (
        <Tag color="green" style={{ fontWeight: '600' }}>
          Semester {record.semesterNumber}
        </Tag>
      ),
    },
    {
      title: 'isMandatory',
      key: 'isMandatory',
      render: (_: any, record: SubjectVersionWithCurriculumInfo) => (
        <Tag color={record.isMandatory ? 'red' : 'orange'} style={{ fontWeight: '600' }}>
          {record.isMandatory ? 'Mandatory' : 'Optional'}
        </Tag>
      ),
    },
  ];

  return (
    <div className={styles.sttContainer}>
      {/* Sticky Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <div style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 4px 18px rgba(30,64,175,0.13)', border: '1.5px solid rgba(255,255,255,0.18)', padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'}}>
          <Input
            placeholder="Search by Curriculum ID or Name"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{maxWidth: 240, borderRadius: 999}}
            size="large"
          />
          <Select
            allowClear
            placeholder="Filter by Program"
            value={selectedProgramId}
            onChange={(v) => { setSelectedProgramId(v); setPage(1); }}
            style={{ minWidth: 220, borderRadius: 8 }}
            size="large"
          >
            {(programs || []).map(pr => (
              <Option key={pr.id} value={pr.id}>
                {pr.programName} ({pr.programCode})
              </Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large" 
            style={{borderRadius: 999}}
            onClick={handleAddCurriculum}
          >
            Add Curriculum
          </Button>
          <ExcelImportButton
            style={{ borderRadius: 999 }}
            onClick={() => setIsImportOpen(true)}
          >
            Import Curriculum
          </ExcelImportButton>
        </div>
      </Affix>
      
      {/* Curriculum Cards */}
      <Spin spinning={isLoading} tip="Loading curricula...">
        <Collapse 
          accordion 
          bordered={false} 
          className={styles.sttFreshTable} 
          style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)'}}
          onChange={handlePanelChange}
          items={curriculumList && curriculumList.length > 0 ? curriculumList.map((curriculum: Curriculum) => {
            const subjectVersions = curriculumSubjectVersionsMap[curriculum.id] || [];
            const isLoadingSubjectVersions = expandedCurriculum === curriculum.id && fetchCurriculumSubjectVersionsMutation.isPending;
            
            return {
              key: curriculum.id,
              label: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{fontWeight: 700, fontSize: '1.2rem', color: '#1E40AF'}}>
                      {curriculum.curriculumName} 
                      <span style={{color: '#f97316', fontWeight: 400, marginLeft: 8}}>
                        [{curriculum.curriculumCode}]
                      </span>
                    </span>
                  </div>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCurriculum(curriculum.id);
                    }}
                    style={{ 
                      color: '#1E40AF',
                      borderRadius: 8,
                      height: 32,
                      padding: '0 12px'
                    }}
                  >
                    Edit
                  </Button>
                </div>
              ),
              children: (
                <div style={{ padding: '16px 0' }}>
                  {/* Curriculum Details */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: 16, 
                    marginBottom: 24,
                    padding: '16px',
                    background: 'rgba(30,64,175,0.05)',
                    borderRadius: 12
                  }}>
                    <div>
                      <strong style={{ color: '#64748b' }}>Program Name:</strong>
                      <div style={{ color: '#1E40AF', fontWeight: '600' }}>{curriculum.programName}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#64748b' }}>Effective Date:</strong>
                      <div style={{ color: '#1E40AF', fontWeight: '600' }}>
                        {curriculum.effectiveDate ? dayjs(curriculum.effectiveDate).format('MMM DD, YYYY') : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#64748b' }}>Total Subject Versions:</strong>
                      <div style={{ color: '#1E40AF', fontWeight: '600' }}>{subjectVersions.length}</div>
                    </div>
                  </div>

                  {/* Subject Versions Table */}
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      marginBottom: 16,
                      padding: '0 16px'
                    }}>
                      <BookOutlined style={{ color: '#1E40AF', fontSize: '18px' }} />
                      <Title level={5} style={{ margin: 0, color: '#1E40AF' }}>
                        Curriculum Subjects (By Version)
                      </Title>
                    </div>
                    
                    {isLoadingSubjectVersions ? (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin tip="Loading subject versions..." />
                      </div>
                    ) : subjectVersions.length > 0 ? (
                      <Table
                        dataSource={subjectVersions}
                        columns={subjectVersionColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        style={{
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '40px',
                        color: '#64748b',
                        background: 'rgba(30,64,175,0.05)',
                        borderRadius: 12,
                        margin: '0 16px'
                      }}>
                        <BookOutlined style={{ fontSize: '48px', marginBottom: 16, opacity: 0.5 }} />
                        <div>No subject versions assigned to this curriculum yet.</div>
                        <Button 
                          type="primary" 
                          size="small" 
                          style={{ marginTop: 12 }}
                          onClick={() => handleEditCurriculum(curriculum.id)}
                        >
                          Add Subject Versions
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ),
              style: {background: 'rgba(255, 255, 255, 0.90)', borderRadius: 16, marginBottom: 12, color: '#1E40AF', boxShadow: '0 2px 12px rgba(30,64,175,0.13)'}
            };
          }) : []}
        />
      </Spin>
        
        {/* Pagination */}
        {paginationCurriculum && paginationCurriculum.total > 0 && (
          <div style={{marginTop: 32, display: 'flex', justifyContent: 'center'}}>
            <Pagination
              current={paginationCurriculum.current}
              pageSize={paginationCurriculum.pageSize}
              total={paginationCurriculum.total}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50]}
              onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
              style={{borderRadius: 8}}
            />
          </div>
        )}
      
      {/* Data Import Modal */}
      {isImportOpen && (
        <BulkDataImport 
          onClose={() => setIsImportOpen(false)} 
          onDataImported={handleDataImported}
          supportedTypes={['CURRICULUM']}
          uploadStatus={uploadStatus}
        />
      )}
    </div>
  );
};

export default CurriculumPage;