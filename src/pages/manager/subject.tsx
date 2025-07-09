import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Affix, Tag, message, Pagination, Spin, Empty } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, CheckOutlined, UploadOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { curriculums, combos } from '../../data/schoolData';
import { useNavigate, useSearchParams } from 'react-router';
import { useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import { CreateSubject } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../../components/common/bulkDataImport';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { isErrorResponse } from '../../api/AxiosCRUD';

const { Option } = Select;

const SubjectManagerPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [curriculumFilter, setCurriculumFilter] = useState<number | undefined>();
  const [comboFilter, setComboFilter] = useState<number | undefined>();
  const [approvalStatus, setApprovalStatus] = useState<{ [id: number]: 'pending' | 'approved' }>({});
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

  useEffect(() => {
    getAllSubjects({ pageNumber: page, pageSize, filterType: undefined, filterValue: search });
  }, [page, pageSize, search]);

  useEffect(() => {
    const title = searchParams.get('title');
    if (title) setSearch(title);
  }, [searchParams]);

  // Remove the automatic success handling effect to prevent false positives
  // Success handling is now only done in the mutation's onSuccess callback

  const handleAddSubject = () => {
    navigate('/manager/subject/add');
  };

  const handleAddCombo = () => {
    navigate('/manager/combo/add');
  };

  const handleEditSubject = (subjectId: number) => {
    navigate(`/manager/subject/edit/${subjectId}`);
  };

  const handleCreateSyllabus = (subjectId: number) => {
    navigate(`/manager/subject/${subjectId}/syllabus`);
  };

  const handleApprove = (id: number) => {
    setApprovalStatus(prev => ({ ...prev, [id]: 'approved' }));
    message.success('Subject approved!');
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
          
          message.error(`Error importing subjects: ${errorMessage}${errorStatus}`);
        }
      });

    } catch (error) {
      console.error('Import error:', error);
      message.error('Error processing imported data. Please check your data format.');
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'subjectName', key: 'subjectName', align: 'left' as 'left', width: 260 },
    { title: 'Subject Code', dataIndex: 'subjectCode', key: 'subjectCode', align: 'left' as 'left', width: 140 },
    { title: 'Combo Description', dataIndex: 'comboDescription', key: 'comboDescription', align: 'left' as 'left', width: 380, ellipsis: true },
    {
      title: 'Status',
      key: 'status',
      align: 'center' as 'center',
      width: 180,
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <Tag color={approvalStatus[record.id] === 'approved' ? 'green' : 'orange'} style={{ fontWeight: 500, fontSize: 12, padding: '2px 8px', borderRadius: 6, marginBottom: 0 }}>
            {approvalStatus[record.id] === 'approved' ? 'Approved' : 'Waiting'}
          </Tag>
          <Button
            type={approvalStatus[record.id] === 'approved' ? 'default' : 'primary'}
            icon={<CheckOutlined style={{ fontSize: 12 }} />}
            size="small"
            disabled={approvalStatus[record.id] === 'approved'}
            onClick={() => handleApprove(record.id)}
            style={{borderRadius: 6, height: 22, padding: '0 6px', fontSize: 12, marginBottom: 0}}
          >
            {approvalStatus[record.id] === 'approved' ? 'Approved' : 'Approve'}
          </Button>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      align: 'center' as 'center',
      width: 160,
      render: (_: any, record: any) => (
        <div className={styles.sttActionButtons}>
          <Button
            type="link"
            icon={<EditOutlined style={{ color: '#f97316', fontSize: 16 }} />}
            onClick={() => handleEditSubject(record.id)}
            className={styles.sttFreshEditButton}
            style={{ color: '#f97316', padding: 0, fontSize: 12 }}
            title="Edit Subject"
          />
          <Button
            type="link"
            icon={<PlusOutlined style={{ color: '#1E40AF', fontSize: 16 }} />}
            onClick={() => handleCreateSyllabus(record.id)}
            style={{ color: '#1E40AF', padding: 0, fontSize: 12 }}
            title="Create Syllabus"
          >
            Syllabus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.sttContainer} style={{ paddingTop: 12 }}>
        {/* Sticky Toolbar */}
        <Affix offsetTop={80} style={{zIndex: 10}}>
          <div className={styles.sttToolbar}>
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
        
        {/* Data Import Modal */}
        {isImportOpen && (
          <BulkDataImport 
            onClose={() => setIsImportOpen(false)} 
            onDataImported={handleDataImported}
            supportedTypes={['SUBJECT']}
          />
        )}
      </div>
    </div>
  );
};

export default SubjectManagerPage; 