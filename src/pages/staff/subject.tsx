import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Affix, Collapse, Pagination, Spin, Empty, message } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { curriculums, combos, comboSubjects } from '../../data/schoolData';
import { useNavigate, useSearchParams } from 'react-router';
import { useCRUDSubject, useCRUDCombo } from '../../hooks/useCRUDSchoolMaterial';
import BulkDataImport from '../../components/common/bulkDataImport';
import ExcelImportButton from '../../components/common/ExcelImportButton';

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
    addSubjectMutation
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
    isComboLoading
  } = useCRUDCombo();

  useEffect(() => {
    // Backend search: pass search as filterValue
    getAllSubjects({ pageNumber: page, pageSize, filterType: undefined, filterValue: search });
  }, [page, pageSize, search]);

  useEffect(() => {
    const title = searchParams.get('title');
    if (title) setSearch(title);
  }, [searchParams]);

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

  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      // Extract subject data from the imported data
      const subjectData = importedData['SUBJECT'] || [];
      
      // Process each imported subject
      for (const subject of subjectData) {
        await addSubjectMutation.mutateAsync({
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          credits: parseInt(subject.credits),
          description: subject.description || ''
        });
      }
      
      message.success(`Successfully imported ${subjectData.length} subjects`);
      // Refresh the subject list
      getAllSubjects({ pageNumber: page, pageSize, filterType: undefined, filterValue: search });
    } catch (error) {
      message.error('Error importing subjects. Please check your data format.');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'left' as 'left', render: (text: any) => <div style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>{text}</div> },
    { title: 'Subject Name', dataIndex: 'subjectName', key: 'subjectName', align: 'left' as 'left', render: (text: any) => <div style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>{text}</div> },
    { title: 'Subject Code', dataIndex: 'subjectCode', key: 'subjectCode', align: 'left' as 'left', render: (text: any) => <div style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>{text}</div> },
    { title: 'Credits', dataIndex: 'credits', key: 'credits', align: 'center' as 'center', render: (text: any) => <div style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>{text}</div> },
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
            onClick={() => handleCreateSyllabus(record.id)}
            style={{ color: '#1E40AF' }}
            title="Create Syllabus"
          >
            Syllabus
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
        <Collapse accordion bordered={false} className={styles.sttFreshTable} style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)'}}>
          {comboList.map(combo => (
            <Panel
              header={<span style={{fontWeight: 700, fontSize: '1.1rem', color: '#1E40AF'}}>Combo: {combo.comboName}</span>}
              key={combo.id}
              style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 16, marginBottom: 12, color: '#1E40AF'}}
              extra={<Button icon={<EditOutlined />} size="small" style={{borderRadius: 999, background: '#f97316', color: '#fff', border: 'none'}} onClick={(e) => { e.stopPropagation(); handleEditCombo(combo.id); }}>{'Edit'}</Button>}
            >
              <ul style={{margin: 0, paddingLeft: 20}}>
                {comboSubjects.filter(cs => cs.comboId === combo.id).length > 0 ? (
                  comboSubjects.filter(cs => cs.comboId === combo.id).map(cs => (
                    <li key={cs.subjectId} style={{color: '#1E40AF'}}>Subject ID: {cs.subjectId}</li>
                  ))
                ) : (
                  <li style={{color: '#aaa'}}>No subjects</li>
                )}
              </ul>
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