import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Tabs, Typography, message, Card, Tag, Space, Tooltip} from 'antd';
import {  ArrowLeftOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';

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
import { SubjectVersion, Syllabus, CreateSubjectVersion } from '../../interfaces/ISchoolProgram';
import { useCRUDSubject, useCRUDSubjectVersion, useCRUDSyllabus } from '../../hooks/useCRUDSchoolMaterial';
import { generateDefaultVersionData, generateDefaultSyllabusData } from '../../data/mockData';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';

// Function to create default version for a subject (moved outside component)
const createDefaultVersion = async (
  subjectData: any, 
  addSubjectVersionMutation: any
) => {
  try {
    const defaultVersionData = generateDefaultVersionData(
      subjectData.id,
      subjectData.subjectCode,
      subjectData.subjectName
    );
    
    const newVersion = await addSubjectVersionMutation.mutateAsync(defaultVersionData);
    if (newVersion) {
      message.success('Default version created successfully!');
      return [newVersion];
    }
  } catch (err: any) {
    const errorMessage = getUserFriendlyErrorMessage(err);
    message.error('Failed to create default version: ' + errorMessage);
  }
  return [];
};

// Function to create default syllabus for a subject version (moved outside component)
const createDefaultSyllabus = async (
  subjectVersionId: number,
  subjectCode: string,
  subjectName: string,
  addSyllabusMutation: any
) => {
  try {
    const defaultSyllabusData = generateDefaultSyllabusData(
      subjectVersionId,
      subjectCode,
      subjectName
    );
    
    const newSyllabus = await addSyllabusMutation.mutateAsync(defaultSyllabusData);
    if (newSyllabus) {
      message.success('Default syllabus created successfully!');
      return newSyllabus;
    }
  } catch (err: any) {
    const errorMessage = getUserFriendlyErrorMessage(err);
    message.error('Failed to create default syllabus: ' + errorMessage);
  }
  return null;
};

const ManagerSubjectVersionPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveHover, setApproveHover] = useState(false);
  const [activeKey, setActiveKey] = useState<string>('');

  // State for Add Prerequisite Modal
  const [prereqModalOpen, setPrereqModalOpen] = useState(false);
  const [selectedPrereqSubject, setSelectedPrereqSubject] = useState<any>(null);
  const [editingVersionId, setEditingVersionId] = useState<number | null>(null);
  
  // Local state for prerequisites per version
  const [prereqMap, setPrereqMap] = useState<Record<number, any[]>>({});
  const [prereqLoading, setPrereqLoading] = useState<Record<number, boolean>>({});

  // Local state for each sub-table (per version)
  const [assessmentMap, setAssessmentMap] = useState<Record<number, any[]>>({});
  const [materialMap, setMaterialMap] = useState<Record<number, any[]>>({});
  const [outcomeMap, setOutcomeMap] = useState<Record<number, any[]>>({});
  const [sessionMap, setSessionMap] = useState<Record<number, any[]>>({});
  
  // Bulk import modal state
  const [bulkModal, setBulkModal] = useState<{ type: string, versionId: number } | null>(null);

  // API hooks
  const { getSubjectById } = useCRUDSubject();
  const { 
    getSubjectVersionsBySubjectId, 
    addSubjectVersionMutation, 
    deleteSubjectVersionMutation,
    toggleActiveSubjectVersionMutation,
    addPrerequisiteToSubjectVersionMutation,
    getPrerequisitesBySubjectVersionMutation,
    deletePrerequisiteFromSubjectVersionMutation,
    getPrerequisitesBySubjectMutation,
    copyPrerequisitesBetweenVersionsMutation
  } = useCRUDSubjectVersion();
  const {
    fetchSyllabusBySubjectVersionMutation,
    addSyllabusMutation
  } = useCRUDSyllabus();

  const [subject, setSubject] = useState<any | null>(null);
  const [subjectVersions, setSubjectVersions] = useState<SubjectVersion[]>([]);
  const [syllabusMap, setSyllabusMap] = useState<Record<number, Syllabus | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch prerequisites for a specific version
  const fetchPrerequisitesForVersion = useCallback(async (versionId: number) => {
    setPrereqLoading(prev => ({ ...prev, [versionId]: true }));
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const prerequisitesPromise = getPrerequisitesBySubjectVersionMutation.mutateAsync(versionId);
      const prerequisites = await Promise.race([prerequisitesPromise, timeoutPromise]);
      
      if (prerequisites && Array.isArray(prerequisites)) {
        setPrereqMap(prev => ({
          ...prev,
          [versionId]: prerequisites
        }));
      }
    } catch (error) {
      console.error('Failed to fetch prerequisites for version:', versionId, error);
      message.error('Failed to fetch prerequisites');
    } finally {
      setPrereqLoading(prev => ({ ...prev, [versionId]: false }));
    }
  }, [getPrerequisitesBySubjectVersionMutation]);

  // Function to fetch all prerequisites for the subject
  const fetchAllPrerequisites = useCallback(async () => {
    if (!subjectId) return;
    
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const allPrerequisitesPromise = getPrerequisitesBySubjectMutation.mutateAsync(Number(subjectId));
      const allPrerequisites = await Promise.race([allPrerequisitesPromise, timeoutPromise]);
      
      if (allPrerequisites && Array.isArray(allPrerequisites)) {
        const groupedPrereqs: Record<number, any[]> = {};
        allPrerequisites.forEach((prereq: any) => {
          const versionId = prereq.version_id || prereq.subjectVersionId;
          if (versionId) {
            if (!groupedPrereqs[versionId]) {
              groupedPrereqs[versionId] = [];
            }
            groupedPrereqs[versionId].push(prereq);
          }
        });
        setPrereqMap(groupedPrereqs);
      }
    } catch (error) {
      console.error('Failed to fetch all prerequisites:', error);
      message.error('Failed to fetch prerequisites');
    }
  }, [subjectId, getPrerequisitesBySubjectMutation]);

  // Handler to fetch or create syllabus for a specific version
  const fetchOrCreateSyllabus = useCallback(async (versionId: number, subjectData: any) => {
    if (!subjectData) {
      return;
    }
    
    try {
      // Try to fetch existing syllabus for this version
      let syllabusData: Syllabus | null = null;
      try {
        syllabusData = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      } catch (err) {
        console.error('Error fetching syllabus for version:', versionId, err);
        syllabusData = null;
      }
      
      if (!syllabusData) {
        // No syllabus exists, create default syllabus
        message.info('No syllabus found. Creating default syllabus...');
        const newSyllabus = await createDefaultSyllabus(
          versionId,
          subjectData.subjectCode,
          subjectData.subjectName,
          addSyllabusMutation
        );
        
        if (newSyllabus) {
          setSyllabusMap(prev => ({
            ...prev,
            [versionId]: newSyllabus
          }));
          
          // Update the assessment, material, outcome, and session maps with the new syllabus data
          setAssessmentMap(prev => ({
            ...prev,
            [versionId]: newSyllabus.assessments || []
          }));
          setMaterialMap(prev => ({
            ...prev,
            [versionId]: newSyllabus.learningMaterials || []
          }));
          setOutcomeMap(prev => ({
            ...prev,
            [versionId]: newSyllabus.learningOutcomes || []
          }));
          setSessionMap(prev => ({
            ...prev,
            [versionId]: newSyllabus.sessions || []
          }));
        }
      } else {
        // Syllabus exists, use it
        // Check if the nested arrays exist and are arrays
        const assessments = Array.isArray(syllabusData.assessments) ? syllabusData.assessments : [];
        const materials = Array.isArray(syllabusData.learningMaterials) ? syllabusData.learningMaterials : [];
        const outcomes = Array.isArray(syllabusData.learningOutcomes) ? syllabusData.learningOutcomes : [];
        const sessions = Array.isArray(syllabusData.sessions) ? syllabusData.sessions : [];
        
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: syllabusData
        }));
        
        // Update the maps with existing syllabus data
        setAssessmentMap(prev => ({
          ...prev,
          [versionId]: assessments
        }));
        setMaterialMap(prev => ({
          ...prev,
          [versionId]: materials
        }));
        setOutcomeMap(prev => ({
          ...prev,
          [versionId]: outcomes
        }));
        setSessionMap(prev => ({
          ...prev,
          [versionId]: sessions
        }));
      }
    } catch (err: any) {
      console.error('Error in fetchOrCreateSyllabus:', err);
      message.error('Failed to fetch/create syllabus: ' + err.message);
    }
  }, [fetchSyllabusBySubjectVersionMutation, addSyllabusMutation]);

  // Fetch subject and versions
  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) return;
      
      setLoading(true);
      try {
        // Fetch subject first
        const subjectData = await getSubjectById.mutateAsync(Number(subjectId));
        setSubject(subjectData);
        
        // Fetch subject versions
        let versionsData: SubjectVersion[] | null = null;
        try {
          versionsData = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
        } catch (err) {
          console.log('No versions found or API error:', err);
          versionsData = null;
        }
        
        if (!versionsData || versionsData.length === 0) {
          // No versions exist, create default version
          message.info('No versions found. Creating default version...');
          const defaultVersions = await createDefaultVersion(subjectData, addSubjectVersionMutation);
          setSubjectVersions(defaultVersions);
          if (defaultVersions.length > 0) {
            setActiveKey(String(defaultVersions[0].id));
            // Fetch syllabus for the first version
            await fetchOrCreateSyllabus(defaultVersions[0].id, subjectData);
            // Fetch prerequisites for the first version
            try {
              await fetchPrerequisitesForVersion(defaultVersions[0].id);
            } catch (error) {
              console.error('Failed to fetch prerequisites for default version:', error);
            }
          }
        } else {
          // Versions exist, use them
          setSubjectVersions(versionsData);
          if (versionsData.length > 0) {
            setActiveKey(String(versionsData[0].id));
            // Fetch syllabus for the first version
            await fetchOrCreateSyllabus(versionsData[0].id, subjectData);
            // Fetch prerequisites for all versions - with error handling
            try {
              await fetchAllPrerequisites();
            } catch (error) {
              console.error('Failed to fetch all prerequisites:', error);
              // Fallback: fetch prerequisites for the first version only
              try {
                await fetchPrerequisitesForVersion(versionsData[0].id);
              } catch (prereqError) {
                console.error('Failed to fetch prerequisites for first version:', prereqError);
              }
            }
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch data: ' + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId]);

  // Handler for tab change
  const handleTabChange = useCallback(async (key: string) => {
    setActiveKey(key);
    const versionId = Number(key);
    
    // Fetch syllabus for this version if not already loaded
    if (!syllabusMap[versionId]) {
      await fetchOrCreateSyllabus(versionId, subject);
    }
    
    // Fetch prerequisites for this version if not already loaded
    if (!prereqMap[versionId] && !prereqLoading[versionId]) {
      await fetchPrerequisitesForVersion(versionId);
    }
  }, [syllabusMap, prereqMap, prereqLoading, fetchOrCreateSyllabus, fetchPrerequisitesForVersion, subject]);

  // Handler for adding a new version
  const handleAddVersion = useCallback(async (values: CreateSubjectVersion) => {
    setAdding(true);
    try {
      await addSubjectVersionMutation.mutateAsync(values);
      message.success('Version added successfully!');
      
      // Refresh versions list
      const updatedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (updatedVersions) {
        setSubjectVersions(updatedVersions);
        if (updatedVersions.length > 0) {
          const newVersionId = updatedVersions[updatedVersions.length - 1].id;
          setActiveKey(String(newVersionId));
          // Fetch prerequisites for the new version
          await fetchPrerequisitesForVersion(newVersionId);
        }
      }
      
      setModalVisible(false);
    } catch (err: any) {
      message.error('Failed to add version: ' + err.message);
    } finally {
      setAdding(false);
    }
  }, [addSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId, fetchPrerequisitesForVersion]);

  // Handler to delete a version
  const handleDeleteVersion = useCallback(async (versionId: number) => {
    try {
      await deleteSubjectVersionMutation.mutateAsync(versionId);
      message.success('Version deleted successfully!');
      
      // Refresh versions list
      const updatedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (updatedVersions) {
        setSubjectVersions(updatedVersions);
        if (updatedVersions.length > 0 && activeKey === String(versionId)) {
          setActiveKey(String(updatedVersions[0].id));
        }
      }
    } catch (err: any) {
      message.error('Failed to delete version: ' + err.message);
    }
  }, [deleteSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId, activeKey]);

  // Handler to toggle active status (Manager approval)
  const handleToggleActive = useCallback(async (versionId: number) => {
    try {
      await toggleActiveSubjectVersionMutation.mutateAsync(versionId);
      message.success('Version status updated successfully!');
      
      // Refresh versions list
      const updatedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (updatedVersions) {
        setSubjectVersions(updatedVersions);
      }
    } catch (err: any) {
      message.error('Failed to update version status: ' + err.message);
    }
  }, [toggleActiveSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId]);

  // Handler to add a prerequisite
  const handleAddPrerequisite = (versionId: number) => {
    setEditingVersionId(versionId);
    setPrereqModalOpen(true);
  };

  const handlePrereqModalOk = async () => {
    if (selectedPrereqSubject && editingVersionId) {
      try {
        // Use the real API to add prerequisite
        await addPrerequisiteToSubjectVersionMutation.mutateAsync({
          subjectVersionId: editingVersionId,
          prerequisiteId: selectedPrereqSubject.id
        });
        
        // Refetch prerequisites for this version to ensure UI reflects server state
        await fetchPrerequisitesForVersion(editingVersionId);
        
        message.success('Prerequisite added successfully!');
      } catch (error) {
        console.error('Failed to add prerequisite:', error);
        message.error('Failed to add prerequisite');
      }
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

  // Handlers for AssessmentTable
  const handleAddAssessment = async (versionId: number, assessment: any): Promise<void> => {
    setAssessmentMap(prev => ({ 
      ...prev, 
      [versionId]: [...(prev[versionId] || []), { ...assessment, id: Date.now() }] 
    }));
  };

  const handleDeleteAssessment = async (versionId: number, id: number): Promise<void> => {
    setAssessmentMap(prev => ({ 
      ...prev, 
      [versionId]: (prev[versionId] || []).filter(a => a.id !== id) 
    }));
  };

  const handleUpdateAssessment = async (versionId: number, id: number, update: any): Promise<void> => {
    setAssessmentMap(prev => ({ 
      ...prev, 
      [versionId]: (prev[versionId] || []).map(a => a.id === id ? { ...a, ...update } : a) 
    }));
  };

  // Handlers for MaterialTable
  const handleAddMaterial = async (versionId: number, material: any): Promise<void> => {
    setMaterialMap(prev => ({ 
      ...prev, 
      [versionId]: [...(prev[versionId] || []), { ...material, id: Date.now() }] 
    }));
  };

  const handleDeleteMaterial = async (versionId: number, id: number): Promise<void> => {
    setMaterialMap(prev => ({ 
      ...prev, 
      [versionId]: (prev[versionId] || []).filter(m => m.id !== id) 
    }));
  };

  const handleUpdateMaterial = async (versionId: number, id: number, update: any): Promise<void> => {
    setMaterialMap(prev => ({ 
      ...prev, 
      [versionId]: (prev[versionId] || []).map(m => m.id === id ? { ...m, ...update } : m) 
    }));
  };

  // Handlers for OutcomeTable
  const handleAddOutcome = async (versionId: number, outcome: any): Promise<void> => {
    setOutcomeMap(prev => ({ 
      ...prev, 
      [versionId]: [...(prev[versionId] || []), { ...outcome, id: Date.now() }] 
    }));
  };

  const handleDeleteOutcome = async (versionId: number, id: number): Promise<void> => {
    setOutcomeMap(prev => ({ 
      ...prev, 
      [versionId]: (prev[versionId] || []).filter(o => o.id !== id) 
    }));
  };

  const handleUpdateOutcome = async (versionId: number, id: number, update: any): Promise<void> => {
    setOutcomeMap(prev => ({ 
      ...prev, 
      [versionId]: (prev[versionId] || []).map(o => o.id === id ? { ...o, ...update } : o) 
    }));
  };

  // Handlers for SessionTable
  const handleAddSession = async (versionId: number, session: any): Promise<void> => {
    setSessionMap(prev => ({ 
      ...prev, 
      [versionId]: [...(prev[versionId] || []), { ...session, id: Date.now() }] 
    }));
  };

  const handleDeleteSession = async (versionId: number, id: number): Promise<void> => {
    setSessionMap(prev => ({ 
      ...prev, 
      [versionId]: (prev[versionId] || []).filter(s => s.id !== id) 
    }));
  };

  const handleUpdateSession = async (versionId: number, id: number, update: any): Promise<void> => {
    setSessionMap(prev => ({ 
      ...prev, 
      [versionId]: (prev[versionId] || []).map(s => s.id === id ? { ...s, ...update } : s) 
    }));
  };

  const handleAddOutcomeToSession = async (versionId: number, sessionId: number, outcomeId: number): Promise<void> => {
    alert("Feature disabled for Manager")
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
    message.success(`${type} data imported successfully!`);
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
            onChange={handleTabChange}
            type="card"
            tabBarStyle={{ background: 'transparent', borderRadius: 12, boxShadow: 'none', display: 'flex', justifyContent: 'center' }}
            items={subjectVersions.map((v) => {
              const isActive = v.isActive;
              const syllabus = syllabusMap[v.id];
              const prerequisites = prereqMap[v.id];
              return {
                key: String(v.id),
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        color: isActive ? '#f97316' : '#fff',
                        fontWeight: isActive ? 700 : 600,
                        borderRadius: '8px 8px 0 0',
                        fontSize: '16px',
                        padding: '8px 16px',
                        display: 'inline-block',
                        transition: 'background 0.2s, color 0.2s',
                      }}
                    >
                      Version {index + 1}
                    </span>
                    <Space size={4}>
                      {version.isActive ? <Tag color="green">Active</Tag> : <Tag color="default">Inactive</Tag>}
                      {version.isDefault && <Tag color="blue">Default</Tag>}
                      <Tooltip title="Toggle Active Status">
                        <Button
                          size="small"
                          type="text"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(version.id);
                          }}
                        >
                          <EyeOutlined />
                        </Button>
                      </Tooltip>
                    </Space>
                  </div>
                ),
                children: (
                  <div className={styles.syllabusContent} style={{ width: '100%', maxWidth: 'none', minWidth: 0, margin: '0 auto' }}>
                    {/* Version Info Section */}
                    <div style={{ marginBottom: 32 }}>
                      <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', marginBottom: 16, letterSpacing: '-0.5px' }}>
                        📄 Version Information
                      </h3>
                      <Card>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                          <div>
                            <strong>Version Code:</strong> {version.versionCode}
                          </div>
                          <div>
                            <strong>Version Name:</strong> {version.versionName}
                          </div>
                          <div>
                            <strong>Description:</strong> {version.description}
                          </div>
                          <div>
                            <strong>Effective From:</strong> {new Date(version.effectiveFrom).toLocaleDateString()}
                          </div>
                          {version.effectiveTo && (
                            <div>
                              <strong>Effective To:</strong> {new Date(version.effectiveTo).toLocaleDateString()}
                            </div>
                          )}
                          <div>
                            <strong>Status:</strong> 
                            <Space style={{ marginLeft: 8 }}>
                              {version.isActive ? <Tag color="green">Active</Tag> : <Tag color="default">Inactive</Tag>}
                              {version.isDefault && <Tag color="blue">Default</Tag>}
                            </Space>
                          </div>
                        </div>
                      </Card>
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
                        dataSource={prerequisites}
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