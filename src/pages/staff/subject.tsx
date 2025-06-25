import React, { useState } from 'react';
import { Table, Input, Button, Select, Affix, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { subjects, curriculums, combos, comboSubjects } from '../../data/schoolData';
import { useNavigate, useSearchParams } from 'react-router';

const { Option } = Select;
const { Panel } = Collapse;

const SubjectPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [curriculumFilter, setCurriculumFilter] = useState<number | undefined>();
  const [comboFilter, setComboFilter] = useState<number | undefined>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    const title = searchParams.get('title');
    if (title) setSearch(title);
  }, [searchParams]);

  // Filtered subjects
  let filteredSubjects = subjects.filter(s =>
    (s.subjectName.toLowerCase().includes(search.toLowerCase()) || s.id.toString().includes(search)) &&
    (!curriculumFilter || true) && // TODO: filter by curriculum
    (!comboFilter || comboSubjects.some(cs => cs.comboId === comboFilter && cs.subjectId === s.id))
  );

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

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'left' as 'left' },
    { title: 'Subject Name', dataIndex: 'subjectName', key: 'subjectName', align: 'left' as 'left' },
    { title: 'Subject Code', dataIndex: 'subjectCode', key: 'subjectCode', align: 'left' as 'left' },
    { title: 'Credits', dataIndex: 'credits', key: 'credits', align: 'center' as 'center' },
    { title: 'Description', dataIndex: 'description', key: 'description', align: 'left' as 'left' },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as 'center',
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EditOutlined style={{ color: '#f97316' }} />}
          onClick={() => handleEditSubject(record.id)}
          className={styles.sttFreshEditButton}
          style={{ color: '#f97316' }}
        />
      ),
    },
  ];

  return (
    <div className={styles.sttContainer}>
      {/* Sticky Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <div style={{background: 'rgba(30,58,138,0.22)', borderRadius: 20, boxShadow: '0 4px 18px rgba(30,64,175,0.13)', padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'}}>
          <Input
            placeholder="Search by Subject Name or ID"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
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
        </div>
      </Affix>
      {/* Subject Table */}
      <Table
        columns={columns}
        dataSource={filteredSubjects}
        rowKey="id"
        className={styles.sttFreshTable}
        locale={{ emptyText: 'No records available.' }}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 10 }}
        style={{marginBottom: 48}}
      />
      {/* Combo List Below Table */}
      <Collapse accordion bordered={false} className={styles.sttFreshTable} style={{background: 'rgba(30,58,138,0.22)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)'}}>
        {combos.map(combo => (
          <Panel
            header={<span style={{fontWeight: 700, fontSize: '1.1rem', color: '#fff'}}>Combo: {combo.comboName}</span>}
            key={combo.id}
            style={{background: 'rgba(30,58,138,0.22)', borderRadius: 16, marginBottom: 12, color: '#fff'}}
            extra={<Button icon={<EditOutlined />} size="small" style={{borderRadius: 999, background: '#f97316', color: '#fff', border: 'none'}} onClick={(e) => { e.stopPropagation(); handleEditCombo(combo.id); }}>{'Edit'}</Button>}
          >
            <ul style={{margin: 0, paddingLeft: 20}}>
              {comboSubjects.filter(cs => cs.comboId === combo.id).map(cs => {
                const subj = subjects.find(s => s.id === cs.subjectId);
                return subj ? <li key={subj.id} style={{color: '#fff'}}>{subj.subjectName} ({subj.subjectCode})</li> : null;
              })}
            </ul>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default SubjectPage; 