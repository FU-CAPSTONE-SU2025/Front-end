import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Affix, Tag, message, Pagination, Spin, Empty } from 'antd';
import {SearchOutlined, CheckOutlined, UploadOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { curriculums, combos } from '../../data/schoolData';
import { useNavigate, useSearchParams } from 'react-router';
import { useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';

const { Option } = Select;

const SubjectManagerPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [curriculumFilter, setCurriculumFilter] = useState<number | undefined>();
  const [comboFilter, setComboFilter] = useState<number | undefined>();
  const [approvalStatus, setApprovalStatus] = useState<{ [id: number]: 'pending' | 'approved' }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  const handleViewVersion = (subjectId: number) => {
    navigate(`/manager/subject/${subjectId}/version`);
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
          <Button
            type="default"
            size="small"
            style={{ borderRadius: 6, height: 22, padding: '0 10px', fontSize: 12, marginBottom: 0 }}
            onClick={() => handleViewVersion(record.id)}
          >
            View Version
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
        
      </div>
    </div>
  );
};

export default SubjectManagerPage; 