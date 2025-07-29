
import React, { useState, useEffect } from 'react';
import { Input, Button, Collapse, Typography, Affix, Pagination, Spin, Empty, Table, Tag, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, ImportOutlined, BookOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { useSearchParams, useNavigate } from 'react-router';
import BulkDataImport from '../../components/common/bulkDataImport';
import { useCRUDCurriculum } from '../../hooks/useCRUDSchoolMaterial';
import { Curriculum, SubjectWithCurriculumInfo, CreateCurriculum } from '../../interfaces/ISchoolProgram';
import { ErrorResponse, isErrorResponse, getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import dayjs from 'dayjs';
import ExcelImportButton from '../../components/common/ExcelImportButton';

const { Panel } = Collapse;
const { Title } = Typography;

const CurriculumPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [expandedCurriculum, setExpandedCurriculum] = useState<number | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // CRUD hooks
  const {
    getAllCurriculums,
    curriculumList,
    paginationCurriculum,
    isLoading,
    fetchCurriculumSubjectsMutation,
    addMultipleCurriculumsMutation
  } = useCRUDCurriculum();

  // State to store subjects for each curriculum
  const [curriculumSubjectsMap, setCurriculumSubjectsMap] = useState<{[key: number]: SubjectWithCurriculumInfo[]}>({});

  // Fetch data on mount, page, pageSize, or search change
  useEffect(() => {
    getAllCurriculums({ pageNumber: page, pageSize, filterType: 'search', filterValue: search });
  }, [page, pageSize, search]);

  useEffect(() => {
    const title = searchParams.get('title');
    if (title) setSearch(title);
  }, [searchParams]);

  // Remove the automatic success handling effect to prevent false positives
  // Success handling is now only done in the mutation's onSuccess callback

  // Fetch subjects when a curriculum is expanded
  const handlePanelChange = async (key: string | string[]) => {
    if (Array.isArray(key) && key.length > 0) {
      const curriculumId = parseInt(key[0]);
      setExpandedCurriculum(curriculumId);
      
      // Only fetch if we haven't already
      if (!curriculumSubjectsMap[curriculumId]) {
        try {
          const subjects = await fetchCurriculumSubjectsMutation.mutateAsync(curriculumId);
          if (subjects) {
            setCurriculumSubjectsMap(prev => ({
              ...prev,
              [curriculumId]: subjects
            }));
          }
        } catch (error) {
          console.error('Failed to fetch curriculum subjects:', error);
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
        message.warning('No curriculum data found in the imported file');
        setUploadStatus('error');
        return;
      }

      // Transform the imported data to match CreateCurriculum interface
      const transformedData: CreateCurriculum[] = curriculumData.map(item => {
        // Parse the date properly
        let effectiveDate: Date;
        if (item.effectiveDate) {
          effectiveDate = new Date(item.effectiveDate);
          // If the date is invalid, use current date
          if (isNaN(effectiveDate.getTime())) {
            effectiveDate = new Date();
          }
        } else {
          effectiveDate = new Date();
        }

        return {
          programId: parseInt(item.programId) || 0,
          curriculumCode: item.curriculumCode || '',
          curriculumName: item.curriculumName || '',
          effectiveDate: effectiveDate
        };
      });

      // Validate the data
      const validData = transformedData.filter(item => 
        item.curriculumCode.trim() !== '' && 
        item.curriculumName.trim() !== '' && 
        item.programId > 0
      );

      if (validData.length === 0) {
        message.error('No valid curriculum data found. Please check your data format and ensure all required fields are filled.');
        setUploadStatus('error');
        return;
      }

      if (validData.length !== transformedData.length) {
        message.warning(`${transformedData.length - validData.length} rows were skipped due to missing required fields.`);
      }

      // Call the bulk import mutation
      addMultipleCurriculumsMutation.mutate(validData, {
        onSuccess: () => {
          message.success(`Successfully imported ${validData.length} curricula`);
          setUploadStatus('success');
          setTimeout(() => {
            setIsImportOpen(false);
            setUploadStatus('idle');
            // Refresh the curriculum list
            getAllCurriculums({ pageNumber: page, pageSize, filterType: 'search', filterValue: search });
          }, 2000); // Show success for 2 seconds before closing
        },
        onError: (error: any) => {
          console.error('Import error:', error);
          const errorMessage = getUserFriendlyErrorMessage(error);
          message.error(errorMessage);
          setUploadStatus('error');
        }
      });

    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = getUserFriendlyErrorMessage(error);
      message.error(errorMessage);
      setUploadStatus('error');
    }
  };

  // Table columns for subjects
  const subjectColumns = [
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
      render: (_: any, record: SubjectWithCurriculumInfo) => (
        <Tag color="green" style={{ fontWeight: '600' }}>
          Semester {record.semesterNumber}
        </Tag>
      ),
    },
    {
      title: 'isMandatory',
      key: 'isMandatory',
      render: (_: any, record: SubjectWithCurriculumInfo) => (
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
        >
          {curriculumList && curriculumList.length > 0 ? curriculumList.map((curriculum: Curriculum) => {
            const subjects = curriculumSubjectsMap[curriculum.id] || [];
            const isLoadingSubjects = expandedCurriculum === curriculum.id && fetchCurriculumSubjectsMutation.isPending;
            
            return (
              <Panel
                header={
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
                }
                key={curriculum.id}
                style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 16, marginBottom: 12, color: '#1E40AF', boxShadow: '0 2px 12px rgba(30,64,175,0.13)'}}
              >
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
                      <strong style={{ color: '#64748b' }}>Program ID:</strong>
                      <div style={{ color: '#1E40AF', fontWeight: '600' }}>{curriculum.programId}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#64748b' }}>Effective Date:</strong>
                      <div style={{ color: '#1E40AF', fontWeight: '600' }}>
                        {curriculum.effectiveDate ? dayjs(curriculum.effectiveDate).format('MMM DD, YYYY') : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#64748b' }}>Total Subjects:</strong>
                      <div style={{ color: '#1E40AF', fontWeight: '600' }}>{subjects.length}</div>
                    </div>
                  </div>

                  {/* Subjects Table */}
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
                        Curriculum Subjects
                      </Title>
                    </div>
                    
                    {isLoadingSubjects ? (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin tip="Loading subjects..." />
                      </div>
                    ) : subjects.length > 0 ? (
                      <Table
                        dataSource={subjects}
                        columns={subjectColumns}
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
                        <div>No subjects assigned to this curriculum yet.</div>
                        <Button 
                          type="primary" 
                          size="small" 
                          style={{ marginTop: 12 }}
                          onClick={() => handleEditCurriculum(curriculum.id)}
                        >
                          Add Subjects
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            );
          }) : (
            !isLoading && <Empty description="No curricula found" style={{margin: '40px 0'}} />
          )}
        </Collapse>
        
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
      </Spin>
      
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