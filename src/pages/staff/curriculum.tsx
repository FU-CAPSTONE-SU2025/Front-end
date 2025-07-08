
import React, { useState, useEffect } from 'react';
import { Input, Button, Collapse, Typography, Affix, Pagination, Spin, Empty, Table, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, ImportOutlined, BookOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { useSearchParams, useNavigate } from 'react-router';
import BulkDataImport from '../../components/common/bulkDataImport';
import { useCRUDCurriculum } from '../../hooks/useCRUDSchoolMaterial';
import { Curriculum, SubjectWithCurriculumInfo } from '../../interfaces/ISchoolProgram';
import dayjs from 'dayjs';
import ExcelImportButton from '../../components/common/ExcelImportButton';

const { Panel } = Collapse;
const { Title } = Typography;

const CurriculumPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [expandedCurriculum, setExpandedCurriculum] = useState<number | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // CRUD hooks
  const {
    getAllStaff,
    curriculumList,
    paginationCurriculum,
    isLoading,
    fetchCurriculumSubjectsMutation,
  } = useCRUDCurriculum();

  // State to store subjects for each curriculum
  const [curriculumSubjectsMap, setCurriculumSubjectsMap] = useState<{[key: number]: SubjectWithCurriculumInfo[]}>({});

  // Fetch data on mount, page, pageSize, or search change
  useEffect(() => {
    getAllStaff({ pageNumber: page, pageSize, filterType: 'search', filterValue: search });
  }, [page, pageSize, search]);

  useEffect(() => {
    const title = searchParams.get('title');
    if (title) setSearch(title);
  }, [searchParams]);

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

  const handleImportCurriculum = () => {
    setIsImportOpen(true);
  };

  const handleDataImported = (data: { [key: string]: string }[]) => {
    console.log('Imported curriculum data:', data);
    setIsImportOpen(false);
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
            size="large"
            style={{ borderRadius: 999 }}
            onClick={handleImportCurriculum}
          >
            Import Curricula
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
                      <Tag color="blue" style={{ margin: 0 }}>
                        {subjects.length} subjects
                      </Tag>
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
        />
      )}
    </div>
  );
};

export default CurriculumPage;