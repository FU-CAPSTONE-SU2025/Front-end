import React, { useState } from 'react';
import {  Input, Button, Affix, message ,Collapse, Modal, Typography, Progress, Select } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, CheckOutlined, ImportOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { useNavigate } from 'react-router';
import { useCRUDCurriculum } from '../../hooks/useCRUDSchoolMaterial';
import { CreateCurriculum } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../../components/common/bulkDataImport';
import { subjects, combos, comboSubjects, curriculums } from '../../data/schoolData';
import { AddSubjectVersionToCurriculum } from '../../api/SchoolAPI/curriculumAPI';
import { isErrorResponse, getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';

const { Panel } = Collapse;
const { Title } = Typography;

const nodeColor = 'rgba(30,64,175,1)';
const nodeBorder = '2.5px solid #fff';
const nodeSize = 18;
const lineWidth = 4;
const lineColor = 'rgba(30,64,175,0.18)';

const CurriculumManagerPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<{ [id: number]: 'pending' | 'approved' }>({});
  const navigate = useNavigate();
  const [addSubjectVersionModal, setAddSubjectVersionModal] = useState<{ open: boolean, curriculumId: number | null, semester: number | null }>({ open: false, curriculumId: null, semester: null });
  const [selectedSubjectVersionId, setSelectedSubjectVersionId] = useState<number | null>(null);

  // Add CRUD hooks
  const {
    addMultipleCurriculumsMutation
  } = useCRUDCurriculum();

  const filteredCurriculums = curriculums.filter(
    c => c.curriculumName.toLowerCase().includes(search.toLowerCase()) || c.id.toString().includes(search)
  );

  const handleAddCurriculum = () => {
    navigate('/manager/addCurriculum');
  };

  const handleEditCurriculum = (curriculumId: number) => {
    navigate(`/manager/editCurriculum/${curriculumId}`);
  };

  const handleImportCurriculum = () => {
    setIsImportOpen(true);
  };

  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      // Extract curriculum data from the imported data
      const curriculumData = importedData['CURRICULUM'] || [];
      
      if (curriculumData.length === 0) {
        message.warning('No curriculum data found in the imported file');
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
        return;
      }

      if (validData.length !== transformedData.length) {
        message.warning(`${transformedData.length - validData.length} rows were skipped due to missing required fields.`);
      }

      // Call the bulk import mutation
      addMultipleCurriculumsMutation.mutate(validData, {
        onSuccess: () => {
          message.success(`Successfully imported ${validData.length} curricula`);
          setIsImportOpen(false);
        },
        onError: (error: any) => {
          console.error('Import error:', error);
          const errorMessage = getUserFriendlyErrorMessage(error);
          message.error(errorMessage);
        }
      });

    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = getUserFriendlyErrorMessage(error);
      message.error(errorMessage);
    }
  };

  const handleApprove = (id: number) => {
    setApprovalStatus(prev => ({ ...prev, [id]: 'approved' }));
    message.success('Curriculum approved!');
  };

  const handleAddSubjectVersionToSemester = (curriculumId: number, semester: number) => {
    setAddSubjectVersionModal({ open: true, curriculumId, semester });
  };

  const handleAddSubjectVersionConfirm = async () => {
    if (!addSubjectVersionModal.curriculumId || !addSubjectVersionModal.semester || !selectedSubjectVersionId) return;
    try {
      await AddSubjectVersionToCurriculum(addSubjectVersionModal.curriculumId, {
        subjectVersionId: selectedSubjectVersionId,
        semesterNumber: addSubjectVersionModal.semester,
        isMandatory: true
      });
      message.success('Subject version added to curriculum!');
      // TODO: Refresh curriculumSubjectVersions from API when available
      setAddSubjectVersionModal({ open: false, curriculumId: null, semester: null });
      setSelectedSubjectVersionId(null);
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      message.error(errorMessage);
    }
  };

  return (
    <div>
      <div className={styles.sttContainer} style={{ paddingTop: 12 }}>
        {/* Sticky Toolbar */}
        <Affix offsetTop={80} style={{zIndex: 10}}>
          <div className={glassStyles.appleGlassCard} style={{padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'}}>
            <Input
              placeholder="Search by Curriculum ID or Name"
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{maxWidth: 240, borderRadius: 999}}
              size="large"
              className={glassStyles.appleGlassInput}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large" 
              style={{borderRadius: 999}}
              onClick={handleAddCurriculum}
              className={glassStyles.appleGlassButton}
            >
              Add Curriculum
            </Button>
            <Button 
              icon={<ImportOutlined />} 
              size="large" 
              style={{borderRadius: 999}}
              onClick={handleImportCurriculum}
              className={glassStyles.appleGlassButton}
            >
              Import Curricula
            </Button>
          </div>
        </Affix>
        {/* Curriculum Cards */}
        <Collapse accordion bordered={false} className={styles.sttFreshTable} style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)'}}>
          {filteredCurriculums.map(curriculum => (
            <Panel
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{fontWeight: 700, fontSize: '1.2rem', color: '#1E40AF'}}>
                    {curriculum.curriculumName} <span style={{color: '#f97316', fontWeight: 400, marginLeft: 8}}>[{curriculum.curriculumCode}]</span>
                  </span>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    {/* Approval Progress Bar */}
                    <Progress
                      percent={approvalStatus[curriculum.id] === 'approved' ? 100 : 50}
                      steps={2}
                      showInfo={false}
                      strokeColor={['#f59e42', '#52c41a']}
                      style={{width: 60}}
                    />
                    <Button
                      type={approvalStatus[curriculum.id] === 'approved' ? 'default' : 'primary'}
                      icon={<CheckOutlined />}
                      disabled={approvalStatus[curriculum.id] === 'approved'}
                      onClick={e => {
                        e.stopPropagation();
                        handleApprove(curriculum.id);
                      }}
                      style={{borderRadius: 8, height: 32, padding: '0 12px'}}
                    >
                      {approvalStatus[curriculum.id] === 'approved' ? 'Approved' : 'Approve'}
                    </Button>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={e => {
                        e.stopPropagation();
                        handleEditCurriculum(curriculum.id);
                      }}
                      style={{ color: '#1E40AF', borderRadius: 8, height: 32, padding: '0 12px' }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              }
              key={curriculum.id}
              style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 16, marginBottom: 12, color: '#1E40AF', boxShadow: '0 2px 12px rgba(30,64,175,0.13)'}}
            >
              {/* Timeline for 9 Semesters */}
              <div style={{display: 'grid', gridTemplateColumns: `${nodeSize + lineWidth + 18}px 1fr`, gap: 0, position: 'relative', marginLeft: 8}}>
                {/* Vertical line: absolute, centered behind all nodes */}
                <div style={{position: 'absolute', left: (nodeSize + lineWidth + 18) / 2 - lineWidth / 2, top: 0, width: lineWidth, height: '100%', background: lineColor, zIndex: 0, borderRadius: 2}} />
                {/* Timeline and semester content rows */}
                {Array.from({ length: 9 }, (_, semIdx) => {
                  const semesterNumber = semIdx + 1;
                  // TODO: Replace with actual API data when available
                  // For now, show empty semester structure
                  return (
                    <React.Fragment key={semesterNumber}>
                      <div style={{
                        background: 'rgba(255,255,255,0.85)',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        border: '1px solid rgba(30,64,175,0.1)',
                        boxShadow: '0 2px 8px rgba(30,64,175,0.1)'
                      }}>
                        <Title level={5} style={{color: '#1E40AF', marginBottom: 8}}>Semester {semesterNumber}</Title>
                        {/* Normal Subjects */}
                        <div style={{marginBottom: 8}}>
                          <b style={{color: '#1E90FF'}}>Subject Versions:</b>
                          <ul style={{margin: 0, paddingLeft: 20}}>
                            <li style={{color: '#64748b', fontStyle: 'italic'}}>
                              No subject versions assigned yet
                            </li>
                          </ul>
                        </div>
                        {/* Combos (from semester 5+) */}
                        {semesterNumber >= 5 && (
                          <div>
                            <div style={{marginTop: 8, background: 'rgba(30,64,175,0.13)', borderRadius: 8, padding: 8}}>
                              <b style={{color: '#f97316'}}>Combos:</b>
                              <ul style={{margin: 0, paddingLeft: 20}}>
                                <li style={{color: '#64748b', fontStyle: 'italic'}}>
                                  No combos assigned yet
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}
                        <Button type="dashed" icon={<PlusOutlined />} onClick={() => handleAddSubjectVersionToSemester(curriculum.id, semesterNumber)} style={{ marginTop: 8 }}>Add Subject</Button>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </Panel>
          ))}
        </Collapse>
        {/* Data Import Modal */}
        {isImportOpen && (
          <BulkDataImport 
            onClose={() => setIsImportOpen(false)} 
            onDataImported={handleDataImported}
            supportedTypes={['CURRICULUM']}
          />
        )}
        {/* Add Subject Modal */}
        <Modal
          title="Add Subject Version to Semester"
          open={addSubjectVersionModal.open}
          onOk={handleAddSubjectVersionConfirm}
          onCancel={() => setAddSubjectVersionModal({ open: false, curriculumId: null, semester: null })}
          okButtonProps={{ disabled: !selectedSubjectVersionId }}
        >
          <Select
            showSearch
            placeholder="Select a subject version"
            style={{ width: '100%' }}
            value={selectedSubjectVersionId}
            onChange={setSelectedSubjectVersionId}
            optionFilterProp="label"
            filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
          >
            {/* TODO: Replace with actual subject versions data */}
            <Select.Option key="placeholder" value={null} label="Subject versions not available in mock data" disabled>
              Subject versions not available in mock data
            </Select.Option>
          </Select>
        </Modal>
      </div>
    </div>
  );
};

export default CurriculumManagerPage; 