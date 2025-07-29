import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Tabs, Typography, message, Table, Card } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, EditOutlined, SaveOutlined, FileExcelOutlined, CheckOutlined } from '@ant-design/icons';

import AddVersionModal from '../../components/staff/AddVersionModal';
import styles from '../../css/staff/staffEditSyllabus.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';

import AssessmentTable from '../../components/staff/AssessmentTable';
import MaterialTable from '../../components/staff/MaterialTable';
import OutcomeTable from '../../components/staff/OutcomeTable';
import SessionTable from '../../components/staff/SessionTable';
import SubjectSelect from '../../components/common/SubjectSelect';
import { Modal } from 'antd';
import BulkDataImport from '../../components/common/bulkDataImport';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { SubjectVersion, Syllabus, SyllabusAssessment, SyllabusMaterial, SyllabusOutcome, SyllabusSession, SubjectPrerequisite } from '../../interfaces/ISchoolProgram';
import { useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';

const noopAsync = async () => {};

// Remove useParams, subjectId, and dynamic subject lookup
// Use hardcoded mock subject and versions for static UI

// Remove staticMockSubject
// Mock data using correct interfaces
const staticMockVersions: SubjectVersion[] = [
  { 
    id: 1, 
    subjectId: 1, 
    versionCode: 'v1.0',
    versionName: 'Version 1.0',
    description: 'Initial version',
    isActive: true, 
    isDefault: true,
    effectiveFrom: '2022-01-01',
    effectiveTo: null,
    createdAt: '2022-01-01T00:00:00Z',
    updatedAt: null
  },
  { 
    id: 2, 
    subjectId: 1, 
    versionCode: 'v2.0',
    versionName: 'Version 2.0',
    description: 'Updated version',
    isActive: false, 
    isDefault: false,
    effectiveFrom: '2022-06-01',
    effectiveTo: null,
    createdAt: '2022-06-01T00:00:00Z',
    updatedAt: null
  },
  { 
    id: 3, 
    subjectId: 1, 
    versionCode: 'v3.0',
    versionName: 'Version 3.0',
    description: 'Latest version',
    isActive: true, 
    isDefault: false,
    effectiveFrom: '2023-01-01',
    effectiveTo: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: null
  },
];
// Mock syllabuses for each version
const staticMockSyllabuses: Syllabus[] = [
  { id: 1, subjectVersionId: 1, content: 'Syllabus content for Version 1: Calculus fundamentals, limits, derivatives, and integrals.', assessments: [], learningMaterials: [], learningOutcomes: [], sessions: [] },
  { id: 2, subjectVersionId: 2, content: 'Syllabus content for Version 2: Advanced topics in Calculus, multivariable calculus, and series.', assessments: [], learningMaterials: [], learningOutcomes: [], sessions: [] },
  { id: 3, subjectVersionId: 3, content: 'Syllabus content for Version 3: Calculus applications, differential equations, and real analysis.', assessments: [], learningMaterials: [], learningOutcomes: [], sessions: [] },
];
// Mock prerequisites for each version
const staticMockPrerequisites: SubjectPrerequisite[] = [
  { version_id: 1, subject_id: 1, prerequisite_subject_id: 101, subjectCode: 'MATH101', subjectName: 'Calculus I' } as any,
  { version_id: 1, subject_id: 1, prerequisite_subject_id: 102, subjectCode: 'PHYS101', subjectName: 'Physics I' } as any,
  { version_id: 2, subject_id: 1, prerequisite_subject_id: 103, subjectCode: 'CHEM101', subjectName: 'Chemistry I' } as any,
  { version_id: 3, subject_id: 1, prerequisite_subject_id: 104, subjectCode: 'BIO101', subjectName: 'Biology I' } as any,
];

// Mock data for all sub-tables (assessments, materials, outcomes, sessions)
const staticMockAssessments: SyllabusAssessment[] = [
  { id: 1, syllabusId: 1, category: 'Quiz', quantity: 2, weight: 20, duration: 30, questionType: 'multiple-choice', completionCriteria: 'Score above 50%' },
  { id: 2, syllabusId: 1, category: 'Assignment', quantity: 1, weight: 30, duration: 60, questionType: 'essay', completionCriteria: 'Submit on time' },
];
const staticMockMaterials: SyllabusMaterial[] = [
  { id: 1, syllabusId: 1, materialName: 'Calculus Textbook', authorName: 'James Stewart', publishedDate: new Date('2020-01-01'), description: 'Main course textbook', filepathOrUrl: 'https://example.com/calculus.pdf' },
  { id: 2, syllabusId: 1, materialName: 'Lecture Slides', authorName: 'Prof. Smith', publishedDate: new Date('2023-01-01'), description: 'Slides for all lectures', filepathOrUrl: '' },
];
const staticMockOutcomes: SyllabusOutcome[] = [
  { id: 1, syllabusId: 1, outcomeCode: 'LO1', description: 'Understand limits and derivatives' },
  { id: 2, syllabusId: 1, outcomeCode: 'LO2', description: 'Apply integration techniques' },
];
const staticMockSessions: SyllabusSession[] = [
  { id: 1, syllabusId: 1, sessionNumber: 1, topic: 'Limits', mission: 'Introduction to limits' },
  { id: 2, syllabusId: 1, sessionNumber: 2, topic: 'Derivatives', mission: 'Basic differentiation' },
];

const ManagerSubjectVersionPage: React.FC = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveHover, setApproveHover] = useState(false);
  const [versions, setVersions] = useState(staticMockVersions);
  const [activeKey, setActiveKey] = useState(String(staticMockVersions[0].id));
  const [activateModal, setActivateModal] = useState<{ open: boolean, versionId: number | null }>({ open: false, versionId: null });
  const [activeHover, setActiveHover] = useState<number | null>(null);
  useEffect(() => {
    setActiveKey(String(staticMockVersions[0].id));
  }, []);

  // State for Add Prerequisite Modal
  const [prereqModalOpen, setPrereqModalOpen] = useState(false);
  const [selectedPrereqSubject, setSelectedPrereqSubject] = useState<any>(null);
  const [editingVersionId, setEditingVersionId] = useState<number | null>(null);
  // Local state for prerequisites per version (for demo)
  const [prereqMap, setPrereqMap] = useState(() => {
    // Map versionId to its prerequisites
    const map: Record<number, any[]> = {};
    staticMockVersions.forEach(v => {
      map[v.id] = staticMockPrerequisites.filter(p => p.version_id === v.id);
    });
    return map;
  });

  // Local state for each sub-table (per version for demo)
  const [assessmentMap, setAssessmentMap] = useState(() => {
    const map: Record<number, any[]> = {};
    staticMockVersions.forEach(v => { map[v.id] = [...staticMockAssessments]; });
    return map;
  });
  const [materialMap, setMaterialMap] = useState(() => {
    const map: Record<number, any[]> = {};
    staticMockVersions.forEach(v => { map[v.id] = [...staticMockMaterials]; });
    return map;
  });
  const [outcomeMap, setOutcomeMap] = useState(() => {
    const map: Record<number, any[]> = {};
    staticMockVersions.forEach(v => { map[v.id] = [...staticMockOutcomes]; });
    return map;
  });
  const [sessionMap, setSessionMap] = useState(() => {
    const map: Record<number, any[]> = {};
    staticMockVersions.forEach(v => { map[v.id] = [...staticMockSessions]; });
    return map;
  });
  // Bulk import modal state
  const [bulkModal, setBulkModal] = useState<{ type: string, versionId: number } | null>(null);

  // Fetch subject from BE (replace 1 with dynamic subjectId when routing is ready)
  const { getSubjectById } = useCRUDSubject();
  const [subject, setSubject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subjectId } = useParams();
  useEffect(() => {
    setLoading(true);
    getSubjectById.mutateAsync(Number(subjectId))
      .then(data => {
        setSubject(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch subject:' + err);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler for adding a new version (mocked)
  const handleAddVersion = (values: any) => {
    setAdding(true);
    setTimeout(() => {
      message.success('Version added (mock)!');
      setAdding(false);
      setModalVisible(false);
    }, 1000);
  };

  // Handler to add a prerequisite
  const handleAddPrerequisite = (versionId: number) => {
    setEditingVersionId(versionId);
    setPrereqModalOpen(true);
  };
  const handlePrereqModalOk = () => {
    if (selectedPrereqSubject && editingVersionId) {
      setPrereqMap(prev => ({
        ...prev,
        [editingVersionId]: [
          ...prev[editingVersionId],
          {
            version_id: editingVersionId,
            subject_id: 1, // Assuming subject_id is always 1 for mock
            prerequisite_subject_id: selectedPrereqSubject.id,
            subjectCode: selectedPrereqSubject.subjectCode,
            subjectName: selectedPrereqSubject.subjectName,
          },
        ],
      }));
    }
    setPrereqModalOpen(false);
    setSelectedPrereqSubject(null);
    setEditingVersionId(null);
  };
  const handlePrereqModalCancel = () => {
    setPrereqModalOpen(false);
    setSelectedPrereqSubject(null);
    setEditingVersionId(null);
  };
  // Handler to delete a prerequisite
  const handleDeletePrerequisite = (versionId: number, prerequisite_subject_id: number) => {
    setPrereqMap(prev => ({
      ...prev,
      [versionId]: prev[versionId].filter(p => p.prerequisite_subject_id !== prerequisite_subject_id),
    }));
  };

  // Handlers for AssessmentTable
  const handleAddAssessment = async (versionId: number, assessment: any): Promise<void> => {
    setAssessmentMap(prev => ({ ...prev, [versionId]: [...prev[versionId], { ...assessment, id: Date.now() }] }));
  };
  const handleDeleteAssessment = async (versionId: number, id: number): Promise<void> => {
    setAssessmentMap(prev => ({ ...prev, [versionId]: prev[versionId].filter(a => a.id !== id) }));
  };
  const handleUpdateAssessment = async (versionId: number, id: number, update: any): Promise<void> => {
    setAssessmentMap(prev => ({ ...prev, [versionId]: prev[versionId].map(a => a.id === id ? { ...a, ...update } : a) }));
  };
  // Handlers for MaterialTable
  const handleAddMaterial = async (versionId: number, material: any): Promise<void> => {
    setMaterialMap(prev => ({ ...prev, [versionId]: [...prev[versionId], { ...material, id: Date.now() }] }));
  };
  const handleDeleteMaterial = async (versionId: number, id: number): Promise<void> => {
    setMaterialMap(prev => ({ ...prev, [versionId]: prev[versionId].filter(m => m.id !== id) }));
  };
  const handleUpdateMaterial = async (versionId: number, id: number, update: any): Promise<void> => {
    setMaterialMap(prev => ({ ...prev, [versionId]: prev[versionId].map(m => m.id === id ? { ...m, ...update } : m) }));
  };
  // Handlers for OutcomeTable
  const handleAddOutcome = async (versionId: number, outcome: any): Promise<void> => {
    setOutcomeMap(prev => ({ ...prev, [versionId]: [...prev[versionId], { ...outcome, id: Date.now() }] }));
  };
  const handleDeleteOutcome = async (versionId: number, id: number): Promise<void> => {
    setOutcomeMap(prev => ({ ...prev, [versionId]: prev[versionId].filter(o => o.id !== id) }));
  };
  const handleUpdateOutcome = async (versionId: number, id: number, update: any): Promise<void> => {
    setOutcomeMap(prev => ({ ...prev, [versionId]: prev[versionId].map(o => o.id === id ? { ...o, ...update } : o) }));
  };
  // Handlers for SessionTable
  const handleAddSession = async (versionId: number, session: any): Promise<void> => {
    setSessionMap(prev => ({ ...prev, [versionId]: [...prev[versionId], { ...session, id: Date.now() }] }));
  };
  const handleDeleteSession = async (versionId: number, id: number): Promise<void> => {
    setSessionMap(prev => ({ ...prev, [versionId]: prev[versionId].filter(s => s.id !== id) }));
  };
  const handleUpdateSession = async (versionId: number, id: number, update: any): Promise<void> => {
    setSessionMap(prev => ({ ...prev, [versionId]: prev[versionId].map(s => s.id === id ? { ...s, ...update } : s) }));
  };
  const handleAddOutcomeToSession = async (versionId: number, sessionId: number, outcomeId: number): Promise<void> => {
    // For demo, no-op or add to session's outcomes array if present
  };
  // Bulk import handlers
  const handleBulkImport = (type: string, versionId: number) => {
    setBulkModal({ type, versionId });
  };
  const handleBulkDataImported = (type: string, versionId: number, importedData: any[]) => {
    if (type === 'ASSESSMENT') setAssessmentMap(prev => ({ ...prev, [versionId]: importedData }));
    if (type === 'MATERIAL') setMaterialMap(prev => ({ ...prev, [versionId]: importedData }));
    if (type === 'OUTCOME') setOutcomeMap(prev => ({ ...prev, [versionId]: importedData }));
    if (type === 'SESSION') setSessionMap(prev => ({ ...prev, [versionId]: importedData }));
    setBulkModal(null);
  };
  const handleBulkModalClose = () => setBulkModal(null);

  return (
    <>
      <style>
        {
        `
          .ant-tabs-top >.ant-tabs-nav::before{
            border-bottom: 2px solid #ffffff;
          }
          .ant-tabs-nav, .ant-tabs-nav-list {
            width: 100% !important;
          }
          .ant-tabs-card .ant-tabs-tab {
            margin: 0 8px !important;
          }
        `}
      </style>
      <div className={styles.syllabusContainer} style={{ width: '100%', maxWidth: 'none', minWidth: 0 }}>
        {/* Header */}
        <div className={`${styles.syllabusHeader} ${glassStyles.appleGlassCard}`}>
          <div className={styles.syllabusHeaderLeft}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
              <ArrowLeftOutlined /> Back to Subjects
            </button>
            <div className={styles.syllabusTitleCard}>
              <h2 className={styles.syllabusTitle}>
                {loading ? 'Loading...' : error ? error : subject ? `${subject.subjectCode} - ${subject.subjectName}` : 'Subject'}
              </h2>
              <h3 className={styles.syllabusSubtitle}>
                {subject?.description}
              </h3>
              <p className={styles.syllabusSubtitle}>
                Course Syllabus & Learning Management
              </p>
            </div>
          </div>
          <div className={styles.syllabusHeaderRight}>
            <Button
              type="default"
              onClick={() => setApproveModalOpen(true)}
              disabled={isApproved}
              onMouseEnter={() => setApproveHover(true)}
              onMouseLeave={() => setApproveHover(false)}
              className={glassStyles.appleGlassButton}
              style={
                isApproved
                  ? {
                      minWidth: 120,
                      backgroundColor: '#22c55e',
                      color: '#fff',
                      borderColor: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }
                  : approveHover
                  ? {
                      minWidth: 120,
                      backgroundColor: '#4ade80',
                      color: '#fff',
                      borderColor: '#4ade80',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }
                  : {
                      minWidth: 120,
                      backgroundColor: '#fff',
                      color: '#4ade80',
                      borderColor: '#4ade80',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }
              }
            >
              {isApproved && <CheckOutlined style={{ color: '#fff', marginRight: 8, fontSize: 18 }} />}
              {isApproved ? 'Approved' : 'APPROVE'}
            </Button>
            <Modal
              open={approveModalOpen}
              onOk={() => { setIsApproved(true); setApproveModalOpen(false); message.success('Subject version approved! (mock)'); }}
              onCancel={() => setApproveModalOpen(false)}
              okText="Confirm"
              cancelText="Cancel"
              title="Approve Subject Version"
            >
              <p>Are you sure you want to approve this subject version?</p>
            </Modal>
          </div>
        </div>
        {/* Tabs for Versions */}
        <div>
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            type="card"
            tabBarStyle={{ background: 'transparent', borderRadius: 12, boxShadow: 'none', display: 'flex', justifyContent: 'center' }}
            items={versions.map((v) => {
              const isActive = v.isActive;
              const syllabus = staticMockSyllabuses.find(s => s.subjectVersionId === v.id);
              const prerequisites = staticMockPrerequisites.filter(p => p.version_id === v.id);
              return {
                key: String(v.id),
                label: (
                  <span
                    style={{
                      color: activeKey === String(v.id) ? '#f97316' : '#fff',
                      fontWeight: activeKey === String(v.id) ? 700 : 600,
                      borderRadius: '8px 8px 0 0',
                      fontSize: '16px',
                      padding: '8px 16px',
                      display: 'inline-block',
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >
                    {`Version ${v.versionCode}`}
                  </span>
                ),
                children: (
                  <div className={styles.syllabusContent} style={{ width: '100%', maxWidth: 'none', minWidth: 0, margin: '0 auto' }}>
                    {/* Syllabus Section */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                      <Button
                        type="default"
                        onClick={() => {
                          if (!isActive) setActivateModal({ open: true, versionId: v.id });
                        }}
                        disabled={isActive}
                        onMouseEnter={() => setActiveHover(v.id)}
                        onMouseLeave={() => setActiveHover(null)}
                        style={
                          isActive
                            ? {
                                minWidth: 120,
                                backgroundColor: '#22c55e',
                                color: '#fff',
                                borderColor: '#22c55e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                              }
                            : activeHover === v.id
                            ? {
                                minWidth: 120,
                                backgroundColor: '#4ade80',
                                color: '#fff',
                                borderColor: '#4ade80',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                              }
                            : {
                                minWidth: 120,
                                backgroundColor: '#fff',
                                color: '#4ade80',
                                borderColor: '#4ade80',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                              }
                        }
                      >
                        {isActive && <CheckOutlined style={{ color: '#fff', marginRight: 8, fontSize: 18 }} />}
                        {isActive ? 'Active' : 'Set Active'}
                      </Button>
                      <Modal
                        open={activateModal.open && activateModal.versionId === v.id}
                        onOk={() => {
                          setVersions(prev => prev.map(ver => ({ ...ver, isActive: ver.id === v.id })));
                          setActivateModal({ open: false, versionId: null });
                          message.success('Version set as active! (mock)');
                        }}
                        onCancel={() => setActivateModal({ open: false, versionId: null })}
                        okText="Confirm"
                        cancelText="Cancel"
                        title="Set Version as Active"
                      >
                        <p>Are you sure you want to set this version as active?</p>
                      </Modal>
                    </div>
                    {/* Syllabus Section */}
                    <div style={{ marginBottom: 32 }}>
                      <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', marginBottom: 16, letterSpacing: '-0.5px' }}>
                        📄 Syllabus
                      </h3>
                      <div style={{ fontSize: 16, color: '#334155', lineHeight: 1.7 }}>
                        {syllabus ? syllabus.content : 'No syllabus data for this version.'}
                      </div>
                    </div>
                    {/* Prerequisite Subjects Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          📚 Prerequisite Subjects
                        </h3>
                        <ExcelImportButton
                          onClick={() => handleAddPrerequisite(v.id)}
                          style={{
                            borderColor: '#1E40AF',
                            color: '#1E40AF',
                            borderRadius: 999,
                            marginLeft: 8,
                            padding: '0 20px',
                            fontWeight: 600,
                            background: '#fff',
                          }}
                          size="large"
                        >
                          Add Prerequisite
                        </ExcelImportButton>
                      </div>
                      <Table
                        columns={[
                          { title: 'Subject Code', dataIndex: 'subjectCode', key: 'subjectCode', width: 160 },
                          { title: 'Subject Name', dataIndex: 'subjectName', key: 'subjectName' },
                        ].filter(Boolean)}
                        dataSource={prereqMap[v.id]}
                        rowKey={r => r.prerequisite_subject_id}
                        pagination={false}
                        style={{ marginTop: 12 }}
                      />
                    </div>
                    {/* Add Prerequisite Modal */}
                    <Modal
                      title="Add Prerequisite Subject"
                      open={prereqModalOpen && editingVersionId === v.id}
                      onOk={handlePrereqModalOk}
                      onCancel={handlePrereqModalCancel}
                      okButtonProps={{ disabled: !selectedPrereqSubject }}
                    >
                      <SubjectSelect
                        value={selectedPrereqSubject ? [selectedPrereqSubject] : []}
                        onChange={arr => Array.isArray(arr) && arr.length > 0 ? setSelectedPrereqSubject(arr[0]) : setSelectedPrereqSubject(null)}
                        multiple={false}
                        placeholder="Select subject..."
                        style={{ width: '100%' }}
                      />
                    </Modal>
                    {/* Assessment Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          📊 Assessments
                        </h3>
                        <ExcelImportButton onClick={() => handleBulkImport('ASSESSMENT', v.id)}>
                          Import Excel
                        </ExcelImportButton>
                      </div>
                      <AssessmentTable
                        assessments={assessmentMap[v.id]}
                        isEditing={false}
                        onAddAssessment={a => handleAddAssessment(v.id, a)}
                        onDeleteAssessment={id => handleDeleteAssessment(v.id, id)}
                        onUpdateAssessment={(id, a) => handleUpdateAssessment(v.id, id, a)}
                      />
                    </div>
                    {/* Material Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          📚 Learning Materials
                        </h3>
                        <ExcelImportButton onClick={() => handleBulkImport('MATERIAL', v.id)}>
                          Import Excel
                        </ExcelImportButton>
                      </div>
                      <MaterialTable
                        materials={materialMap[v.id]}
                        isEditing={false}
                        onAddMaterial={m => handleAddMaterial(v.id, m)}
                        onDeleteMaterial={id => handleDeleteMaterial(v.id, id)}
                        onUpdateMaterial={(id, m) => handleUpdateMaterial(v.id, id, m)}
                      />
                    </div>
                    {/* Outcome Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          🎯 Learning Outcomes
                        </h3>
                        <ExcelImportButton onClick={() => handleBulkImport('OUTCOME', v.id)}>
                          Import Excel
                        </ExcelImportButton>
                      </div>
                      <OutcomeTable
                        outcomes={outcomeMap[v.id]}
                        isEditing={false}
                        onAddOutcome={o => handleAddOutcome(v.id, o)}
                        onDeleteOutcome={id => handleDeleteOutcome(v.id, id)}
                        onUpdateOutcome={(id, o) => handleUpdateOutcome(v.id, id, o)}
                      />
                    </div>
                    {/* Session Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          📅 Course Sessions
                        </h3>
                        <ExcelImportButton onClick={() => handleBulkImport('SESSION', v.id)}>
                          Import Excel
                        </ExcelImportButton>
                      </div>
                      <SessionTable
                        sessions={sessionMap[v.id]}
                        outcomes={outcomeMap[v.id]}
                        isEditing={false}
                        onAddSession={s => handleAddSession(v.id, s)}
                        onDeleteSession={id => handleDeleteSession(v.id, id)}
                        onUpdateSession={(id, s) => handleUpdateSession(v.id, id, s)}
                        onAddOutcomeToSession={(sessionId, outcomeId) => handleAddOutcomeToSession(v.id, sessionId, outcomeId)}
                      />
                    </div>
                    {/* Bulk Import Modal */}
                    <Modal
                      open={!!bulkModal && bulkModal.versionId === v.id}
                      onCancel={handleBulkModalClose}
                      footer={null}
                      title={`Bulk Import ${bulkModal?.type || ''}`}
                    >
                      <BulkDataImport
                        onClose={handleBulkModalClose}
                        onDataImported={data => {
                          const imported = data[bulkModal?.type || ''] || [];
                          handleBulkDataImported(bulkModal?.type || '', v.id, imported);
                        }}
                        supportedTypes={[bulkModal?.type as any]}
                      />
                    </Modal>
                  </div>
                ),
              };
            })}
          />
        </div>
        <AddVersionModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onAdd={handleAddVersion}
          confirmLoading={adding}
          subjectId={Number(subjectId)}
        />
      </div>
    </>
  );
};

export default ManagerSubjectVersionPage; 