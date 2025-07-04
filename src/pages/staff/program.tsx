import React, { useState } from 'react';
import { Input, Button, Collapse, Affix, Space, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { programs, curriculums } from '../../data/schoolData';
import { useNavigate } from 'react-router';
import DataImport from '../../components/common/dataImport';

const { Panel } = Collapse;

const ProgramPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const filteredPrograms = programs.filter(
    p => p.programName.toLowerCase().includes(search.toLowerCase()) || p.id.toString().includes(search)
  );

  const handleAddProgram = () => {
    navigate('/staff/editData/program');
  };

  const handleEditProgram = (programId: number) => {
    navigate(`/staff/editData/program/${programId}`);
  };

  const handleDataImported = async (data: { [key: string]: string }[]) => {
    try {
      // Process each imported program
      for (const programData of data) {
        // TODO: Add createProgram API call when available
        console.log('Importing program:', programData);
      }
      
      message.success(`Successfully imported ${data.length} programs`);
      // TODO: Refresh the program list when API is available
    } catch (error) {
      message.error('Error importing programs. Please check your data format.');
    }
  };

  return (
    <div className={styles.sttContainer}>
      {/* Sticky Toolbar */}
      <Affix style={{zIndex: 10}}>
        <div style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 4px 18px rgba(30,64,175,0.13)', border: '1.5px solid rgba(255,255,255,0.18)', padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'}}>
          <Input
            placeholder="Search by Program ID or Name"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{maxWidth: 240, borderRadius: 999}}
            size="large"
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large" 
            style={{borderRadius: 999}}
            onClick={handleAddProgram}
          >
            Add Program
          </Button>
          <Button 
            type="default" 
            icon={<UploadOutlined />} 
            size="large" 
            style={{borderRadius: 999, borderColor: '#10B981', color: '#10B981'}} 
            onClick={() => setIsImportOpen(true)}
          >
            Import Programs
          </Button>
        </div>
      </Affix>
      {/* Program Cards */}
      <Collapse accordion bordered={false} className={styles.sttFreshTable} style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)'}}>
        {filteredPrograms.map(program => (
          <Panel
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{fontWeight: 700, fontSize: '1.2rem', color: '#1E40AF'}}>
                  {program.programName} <span style={{color: '#f97316', fontWeight: 400, marginLeft: 8}}>[{program.programCode}]</span>
                </span>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProgram(program.id);
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
            key={program.id}
            style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 16, marginBottom: 12, color: '#1E40AF', boxShadow: '0 2px 12px rgba(30,64,175,0.13)'}}
          >
            {/* Mocked curriculum content for now */}
            <div style={{padding: 16, color: '#1E40AF', fontWeight: 500}}>
              <b>Curriculum:</b> <br/>
              {curriculums.filter(c => c.programId === program.id).map(c => (
                <div key={c.id} style={{marginBottom: 8}}>
                  <span
                    style={{fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'}}
                    onClick={() => navigate(`/staff/curriculums?title=${encodeURIComponent(c.curriculumName)}`)}
                  >
                    {c.curriculumName}
                  </span> (Effective: {new Date(c.effectiveDate).toLocaleDateString()})
                </div>
              ))}
              {/* TODO: Expand to show full curriculum details */}
            </div>
          </Panel>
        ))}
      </Collapse>
      
      {/* Data Import Modal */}
      {isImportOpen && (
        <DataImport 
          onClose={() => setIsImportOpen(false)} 
          onDataImported={handleDataImported}
          headerConfig="PROGRAM"
          allowMultipleRows={true}
          dataType="program"
        />
      )}
    </div>
  );
};

export default ProgramPage;