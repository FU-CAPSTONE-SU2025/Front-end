import React, { useState } from 'react';
import {  Input, Button, Affix, message ,Collapse, Modal, Typography, Progress, Select } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, CheckOutlined, ImportOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { useNavigate } from 'react-router';
import { useCRUDCurriculum } from '../../hooks/useCRUDSchoolMaterial';
import { CreateCurriculum } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../../components/common/bulkDataImport';
import { subjects, combos, comboSubjects, curriculums, curriculumSubjects } from '../../data/schoolData';
import { AddSubjectToCurriculum } from '../../api/SchoolAPI/curriculumAPI';
import { isErrorResponse, getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import ApprovalModal from '../../components/manager/approvalModal';
import { useApprovalActions } from '../../hooks/useApprovalActions';

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
  // Remove local approval status state since we'll use backend data
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();
  const [addSubjectModal, setAddSubjectModal] = useState<{ open: boolean, curriculumId: number | null, semester: number | null }>({ open: false, curriculumId: null, semester: null });
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  // Add CRUD hooks
  const {
    addMultipleCurriculumsMutation
  } = useCRUDCurriculum();

  // Approval hook
  const { handleApproval, isApproving } = useApprovalActions();

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

  const handleApprove = (id: number, name: string) => {
    setSelectedItem({ id, name });
    setApprovalModalVisible(true);
  };

  const handleApprovalConfirm = async (approvalStatus: number, rejectionReason?: string) => {
    if (!selectedItem) return;
    
    try {
      await handleApproval('curriculum', selectedItem.id, approvalStatus, rejectionReason);
      // Refresh the curriculum list to get updated approval status
      // Note: Since this page uses mock data, we'll need to refresh the page or implement proper refresh
      window.location.reload(); // Temporary solution until we have proper API integration
      setApprovalModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleAddSubjectToSemester = (curriculumId: number, semester: number) => {
    setAddSubjectModal({ open: true, curriculumId, semester });
  };

  const handleAddSubjectConfirm = async () => {
    if (!addSubjectModal.curriculumId || !addSubjectModal.semester || !selectedSubjectId) return;
    try {
      await AddSubjectToCurriculum(addSubjectModal.curriculumId, {
        subjectId: selectedSubjectId,
        semesterNumber: addSubjectModal.semester,
        isMandatory: true
      });
      message.success('Subject added to curriculum!');
      // TODO: Refresh curriculumSubjects from API when available
      setAddSubjectModal({ open: false, curriculumId: null, semester: null });
      setSelectedSubjectId(null);
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
                  <div>
                    <span style={{fontWeight: 700, fontSize: '1.2rem', color: '#1E40AF'}}>
                      {curriculum.curriculumName} <span style={{color: '#f97316', fontWeight: 400, marginLeft: 8}}>[{curriculum.curriculumCode}]</span>
                    </span>
                    {/* Approval Info */}
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      {curriculum.approvalStatus === 1 ? (
                        <span style={{ color: '#52c41a' }}>
                          Approved by: {curriculum.approvedBy || 'Unknown'} • {curriculum.approvedAt ? new Date(curriculum.approvedAt).toLocaleDateString() : 'Unknown date'}
                        </span>
                      ) : curriculum.rejectionReason ? (
                        <span style={{ color: '#ff4d4f' }}>
                          Rejected • {curriculum.rejectionReason}
                        </span>
                      ) : (
                        <span style={{ color: '#faad14' }}>
                          Created by: {curriculum.createdBy || 'Unknown'} • Pending approval
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    {/* Approval Progress Bar */}
                    <Progress
                      percent={curriculum.approvalStatus === 1 ? 100 : 50}
                      steps={2}
                      showInfo={false}
                      strokeColor={['#f59e42', '#52c41a']}
                      style={{width: 60}}
                    />
                    <Button
                      type={curriculum.approvalStatus === 1 ? 'default' : 'primary'}
                      icon={<CheckOutlined />}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (curriculum.approvalStatus === 1) {
                          // Unapprove
                          await handleApproval('curriculum', curriculum.id, 0, null);
                        } else {
                          // Approve
                          handleApprove(curriculum.id, curriculum.curriculumName);
                        }
                        // Refresh the curriculum list to get updated approval status
                        window.location.reload(); // Temporary solution until we have proper API integration
                      }}
                      style={{borderRadius: 8, height: 32, padding: '0 12px'}}
                    >
                      {curriculum.approvalStatus === 1 ? 'Approved' : 'Approve'}
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
                {[...Array(9)].map((_, semIdx) => {
                  const semesterNumber = semIdx + 1;
                  // Subjects for this semester
                  const semesterSubjects = curriculumSubjects.filter(cs => cs.curriculumId === curriculum.id && cs.semesterNumber === semesterNumber && cs.isMandatory);
                  // Combos for this semester
                  const semesterCombos = curriculumSubjects.filter(cs => cs.curriculumId === curriculum.id && cs.semesterNumber === semesterNumber && !cs.isMandatory);
                  return (
                    <React.Fragment key={semesterNumber}>
                      {/* Timeline node: perfectly centered with semester card */}
                      <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                        <div style={{width: nodeSize, height: nodeSize, borderRadius: '50%', background: nodeColor, border: nodeBorder, boxShadow: '0 2px 8px #1E40AF33', zIndex: 2}} />
                      </div>
                      {/* Semester content */}
                      <div style={{marginBottom: 12, background: 'rgba(255, 255, 255, 0.90)', borderRadius: 12, padding: 16, boxShadow: '0 1px 6px rgba(30,64,175,0.07)', minHeight: 64}}>
                        <Title level={5} style={{color: '#1E40AF', marginBottom: 8}}>Semester {semesterNumber}</Title>
                        {/* Normal Subjects */}
                        <div style={{marginBottom: 8}}>
                          <b style={{color: '#1E90FF'}}>Subjects:</b>
                          <ul style={{margin: 0, paddingLeft: 20}}>
                            {semesterSubjects.map(cs => {
                              const subj = subjects.find(s => s.id === cs.subjectId);
                              return subj ? (
                                <li
                                  key={subj.id}
                                  style={{color: '#1E40AF', cursor: 'pointer', textDecoration: 'underline'}}
                                  onClick={() => navigate(`/manager/subject?title=${encodeURIComponent(subj.subjectName)}`)}
                                >
                                  {subj.subjectName} ({subj.subjectCode})
                                </li>
                              ) : null;
                            })}
                          </ul>
                        </div>
                        {/* Combos (from semester 5+) */}
                        {semesterNumber >= 5 && (
                          <div>
                            {semesterCombos.map(cs => {
                              const combo = combos.find(cb => cb.id === cs.subjectId); // subjectId is comboId for combos
                              if (!combo) return null;
                              return (
                                <div key={combo.id} style={{marginTop: 8, background: 'rgba(30,64,175,0.13)', borderRadius: 8, padding: 8}}>
                                  <b style={{color: '#f97316'}}>Combo: {combo.comboName}</b>
                                  <ul style={{margin: 0, paddingLeft: 20}}>
                                    {comboSubjects.filter(cbs => cbs.comboId === combo.id).map(cbs => {
                                      const subj = subjects.find(s => s.id === cbs.subjectId);
                                      return subj ? <li key={subj.id} style={{color: '#1E40AF'}}>{subj.subjectName} ({subj.subjectCode})</li> : null;
                                    })}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <Button type="dashed" icon={<PlusOutlined />} onClick={() => handleAddSubjectToSemester(curriculum.id, semesterNumber)} style={{ marginTop: 8 }}>Add Subject</Button>
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
          title="Add Subject to Semester"
          open={addSubjectModal.open}
          onOk={handleAddSubjectConfirm}
          onCancel={() => setAddSubjectModal({ open: false, curriculumId: null, semester: null })}
          okButtonProps={{ disabled: !selectedSubjectId }}
        >
          <Select
            showSearch
            placeholder="Select a subject"
            style={{ width: '100%' }}
            value={selectedSubjectId}
            onChange={setSelectedSubjectId}
            optionFilterProp="label"
            filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
          >
            {subjects.map(subj => (
              <Select.Option key={subj.id} value={subj.id} label={`${subj.subjectName} (${subj.subjectCode})`}>
                {subj.subjectName} ({subj.subjectCode})
              </Select.Option>
            ))}
          </Select>
        </Modal>

        {/* Approval Modal */}
        <ApprovalModal
          visible={approvalModalVisible}
          onCancel={() => {
            setApprovalModalVisible(false);
            setSelectedItem(null);
          }}
          onConfirm={handleApprovalConfirm}
          type="curriculum"
          itemId={selectedItem?.id || 0}
          itemName={selectedItem?.name || ''}
          loading={isApproving}
        />
      </div>
    </div>
  );
};

export default CurriculumManagerPage; 