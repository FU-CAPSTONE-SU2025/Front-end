import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Tabs, Typography, Card, Tag, Space, Tooltip} from 'antd';
import {  ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';

import styles from '../../css/staff/staffEditSyllabus.module.css';

import AssessmentTable from '../../components/staff/AssessmentTable';
import MaterialTable from '../../components/staff/MaterialTable';
import OutcomeTable from '../../components/staff/OutcomeTable';
import SessionTable from '../../components/staff/SessionTable';
import { SubjectVersion, Syllabus } from '../../interfaces/ISchoolProgram';
import { useCRUDSubject, useCRUDSubjectVersion, useCRUDSyllabus } from '../../hooks/useCRUDSchoolMaterial';
import { generateDefaultSyllabusData } from '../../datas/mockData';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';
import LoadingScreen from '../../components/LoadingScreen';

// Function to create default syllabus for a subject version (moved outside component)
const createDefaultSyllabus = async (
  subjectVersionId: number,
  subjectCode: string,
  subjectName: string,
  addSyllabusMutation: any,
  handleSuccess: (message: string) => void,
  handleError: (message: string) => void
) => {
  try {
    const defaultSyllabusData = generateDefaultSyllabusData(
      subjectVersionId,
      subjectCode,
      subjectName
    );
    
    const newSyllabus = await addSyllabusMutation.mutateAsync(defaultSyllabusData);
    if (newSyllabus) {
      handleSuccess('Default syllabus created successfully!');
      return newSyllabus;
    }
  } catch (err: any) {
    const errorMessage = err.message || 'Failed to create default syllabus.';
    console.log('Failed to create default syllabus: ' + errorMessage);
  }
  return null;
};

const ManagerSubjectVersionPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [activeKey, setActiveKey] = useState<string>('');

  // State for Add Prerequisite Modal
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
  
  const { showInfo } = useMessagePopupContext();
  const { handleError, handleSuccess } = useApiErrorHandler();

  // API hooks
  const { getSubjectById } = useCRUDSubject();
  const { 
    getSubjectVersionsBySubjectId, 
    addSubjectVersionMutation, 
    deleteSubjectVersionMutation,
    toggleActiveSubjectVersionMutation,
    setDefaultSubjectVersionMutation,
    addPrerequisiteToSubjectVersionMutation,
    getPrerequisitesBySubjectVersionMutation,
    getPrerequisitesBySubjectMutation,
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
  const [initLoading, setInitLoading] = useState<string | null>(null);

  // Function to fetch prerequisites for a specific version
  const fetchPrerequisitesForVersion = useCallback(async (versionId: number) => {
    if (!versionId || Number.isNaN(versionId) || versionId <= 0) {
      console.warn('[Manager][Prereq] Skip fetch due to invalid versionId:', versionId);
      return;
    }
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
      handleError('Failed to fetch prerequisites');
    } finally {
      setPrereqLoading(prev => ({ ...prev, [versionId]: false }));
    }
  }, [getPrerequisitesBySubjectVersionMutation, handleError]);

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
      handleError('Failed to fetch prerequisites');
    }
  }, [subjectId, getPrerequisitesBySubjectMutation, handleError]);

  // Handler to fetch or create syllabus for a specific version
  const fetchOrCreateSyllabus = useCallback(async (versionId: number, subjectData: any) => {
    if (!versionId || Number.isNaN(versionId) || versionId <= 0) {
      console.warn('[Manager][Syllabus] Skip due to invalid versionId:', versionId);
      return;
    }
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
        showInfo('No syllabus found. Creating default syllabus...');
        const newSyllabus = await createDefaultSyllabus(
          versionId,
          subjectData.subjectCode,
          subjectData.subjectName,
          addSyllabusMutation,
          handleSuccess,
          handleError
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
        const assessments = Array.isArray(syllabusData.assessments) ? syllabusData.assessments : [];
        const materials = Array.isArray(syllabusData.learningMaterials) ? syllabusData.learningMaterials : [];
        const outcomes = Array.isArray(syllabusData.learningOutcomes) ? syllabusData.learningOutcomes : [];
        const sessions = Array.isArray(syllabusData.sessions) ? syllabusData.sessions : [];
        
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: syllabusData
        }));
        
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
      handleError('Failed to fetch/create syllabus: ' + err.message);
    }
  }, [fetchSyllabusBySubjectVersionMutation, addSyllabusMutation, showInfo, handleError, handleSuccess]);

  // Fetch subject and versions
  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) return;
      
      setLoading(true);
      try {
        // Fetch subject first
        const subjectData = await getSubjectById.mutateAsync(Number(subjectId));
        setSubject(subjectData);
        
        // Check if subject is approved before proceeding
        if (subjectData.approvalStatus !== "APPROVED") {
          handleError('Cannot create versions for unapproved subjects. Please approve the subject first.');
          setError('Subject must be approved before creating versions.');
          setLoading(false);
          return;
        }
        
        // Fetch subject versions
        let versionsData: SubjectVersion[] | null = null;
        try {
          versionsData = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
        } catch (err) {
          console.log('No versions found or API error:', err);
          versionsData = null;
        }
        
        if (!versionsData || versionsData.length === 0) {
          // No versions exist, create default version then refetch to get real ID
          showInfo('No versions found. Creating default version...');
          setInitLoading('Creating default version...');
          setInitLoading('Fetching newly created version...');
          let refreshed: SubjectVersion[] = [];
          try {
            const resp = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
            if (Array.isArray(resp)) refreshed = resp; else if (resp && typeof resp === 'object' && 'data' in (resp as any)) refreshed = Array.isArray((resp as any).data) ? (resp as any).data : [];
          } catch (refErr) {
            console.error('[Manager] Refetch after create failed:', refErr);
          }
          const valid = (refreshed || []).filter(v => v && typeof v.id === 'number' && v.id > 0);
          const newest = valid.slice().sort((a, b) => (b.id || 0) - (a.id || 0))[0];
          if (newest) {
            setSubjectVersions(valid);
            setActiveKey(String(newest.id));
            setInitLoading('Preparing syllabus...');
            await new Promise(r => setTimeout(r, 600));
            await fetchOrCreateSyllabus(newest.id, subjectData);
            setInitLoading('Fetching prerequisites...');
            await fetchPrerequisitesForVersion(newest.id);
            setInitLoading(null);
          } else {
            handleError('Failed to load created version');
            setInitLoading(null);
            setLoading(false);
            return;
          }
        } else {
          // Versions exist, use them
          const valid = versionsData.filter(v => v && typeof v.id === 'number' && v.id > 0);
          setSubjectVersions(valid);
          if (valid.length > 0) {
            setActiveKey(String(valid[0].id));
            setInitLoading('Loading syllabus...');
            await fetchOrCreateSyllabus(valid[0].id, subjectData);
            try {
              setInitLoading('Loading prerequisites...');
              await fetchAllPrerequisites();
            } catch (e) {
              console.error('Failed to fetch all prerequisites:', e);
            }
            await fetchPrerequisitesForVersion(valid[0].id);
            setInitLoading(null);
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch data: ' + err.message);
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  // Handler for tab change
  const handleTabChange = useCallback(async (key: string) => {
    setActiveKey(key);
    const versionId = Number(key);
    if (!versionId || Number.isNaN(versionId) || versionId <= 0) return;
    
    // Fetch syllabus for this version if not already loaded
    if (!syllabusMap[versionId]) {
      await fetchOrCreateSyllabus(versionId, subject);
    }
    
    // Fetch prerequisites for this version if not already loaded
    if (!prereqMap[versionId] && !prereqLoading[versionId]) {
      await fetchPrerequisitesForVersion(versionId);
    }
  }, [syllabusMap, prereqMap, prereqLoading, fetchOrCreateSyllabus, fetchPrerequisitesForVersion, subject]);

 
  // Handler to toggle active status (Manager approval)
  const handleToggleActive = useCallback(async (versionId: number) => {
    try {
      await toggleActiveSubjectVersionMutation.mutateAsync(versionId);
      handleSuccess('Version status updated successfully!');
      
      // Refresh versions list
      const updatedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (updatedVersions) {
        setSubjectVersions(updatedVersions);
      }
    } catch (err: any) {
      handleError('Failed to update version status: ' + err.message);
    }
  }, [toggleActiveSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId, handleSuccess, handleError]);

  // Handler to add a prerequisite
  const handleAddPrerequisite = (versionId: number) => {
    setEditingVersionId(versionId);
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
        
        handleSuccess('Prerequisite added successfully!');
      } catch (error) {
        console.error('Failed to add prerequisite:', error);
        handleError('Failed to add prerequisite');
      }
    }
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
    // This feature is disabled for Manager
  };

  // Deprecated bulk handlers removed

  // Set default handler
  const handleSetDefault = useCallback(async (versionId: number) => {
    try {
      await setDefaultSubjectVersionMutation.mutateAsync(versionId);
      handleSuccess('Version set as default successfully!');
      const updatedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (updatedVersions) {
        setSubjectVersions(updatedVersions);
      }
    } catch (err: any) {
      handleError('Failed to set default version: ' + err.message);
    }
  }, [setDefaultSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId, handleSuccess, handleError]);

  if (loading || !!initLoading) {
    return (
      <>
        <LoadingScreen isLoading={true} message={initLoading || 'Loading...'} />
      </>
    );
  }
  if (error) {
    return (
      <div style={{ position: 'fixed', inset: 0, backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, width: 'min(560px, 92vw)', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ display: 'inline-flex', width: 36, height: 36, borderRadius: 999, background: '#fee2e2', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontWeight: 800 }}>!</span>
            <Typography.Title level={4} style={{ margin: 0, color: '#1f2937' }}>Something went wrong</Typography.Title>
          </div>
          <Typography.Paragraph style={{ color: '#6b7280', marginBottom: 16 }}>
            {error}
          </Typography.Paragraph>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => window.history.back()}>Back</Button>
            <Button type="primary" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }
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
        <div className={styles.syllabusHeader}>
          <div className={styles.syllabusHeaderLeft}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
              <ArrowLeftOutlined /> Back to Subjects
            </button>
            <div className={styles.syllabusTitleCard}>
              <h2 className={styles.syllabusTitle}>
                {subject ? `${subject.subjectCode} - ${subject.subjectName}` : 'Subject'}
              </h2>
              <h3 className={styles.syllabusSubtitle}>
                <span style={{ whiteSpace: 'pre-line' }}>{subject?.description}</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Tabs for Versions */}
        <div style={{ width: '100%' }}>
          <Tabs
            activeKey={activeKey}
            onChange={handleTabChange}
            type="card"
            tabBarStyle={{ background: 'transparent', borderRadius: 12, boxShadow: 'none', display: 'flex', justifyContent: 'center' }}
            items={(Array.isArray(subjectVersions) ? subjectVersions : [])
              .filter(v => v && typeof v.id === 'number' && v.id > 0)
              .map((version, index) => {
              const isActive = activeKey === String(version.id);
              const syllabus = syllabusMap[version.id];
              const prerequisites = prereqMap[version.id];
              return {
                key: String(version.id),
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
                            <strong>Description:</strong> <span style={{ whiteSpace: 'pre-line' }}>{version.description}</span>
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
                    <Card style={{ marginBottom: 32, backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          📚 Prerequisite Subjects
                        </h3>
                        <Button
                          onClick={() => handleAddPrerequisite(version.id)}
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
                        </Button>
                      </div>
                      {/* Prerequisite chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: '40px', alignItems: 'center' }}>
                        {(prerequisites || []).length === 0 ? (
                          <Typography.Text type="secondary" style={{ fontStyle: 'italic' }}>No prerequisites added yet.</Typography.Text>
                        ) : (
                          (prerequisites || []).map((prereq: any) => (
                            <span key={prereq.prerequisite_subject_id} style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              background: '#f0f9ff',
                              border: '1px solid #0ea5e9',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#0369a1',
                              marginRight: 8,
                              marginBottom: 8,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}>
                              <b>{prereq.subject?.subjectCode || prereq.subjectCode}</b> v{prereq.versionCode}
                            </span>
                          ))
                        )}
                      </div>
                    </Card>

                    {/* Assessment Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>📊 Assessments</h3>
                      </div>
                      <div style={{ overflow: 'auto' }}>
                        <AssessmentTable
                          assessments={assessmentMap[version.id] || []}
                          isEditing={false}
                          onAddAssessment={a => handleAddAssessment(version.id, a)}
                          onDeleteAssessment={id => handleDeleteAssessment(version.id, id)}
                          onUpdateAssessment={(id, a) => handleUpdateAssessment(version.id, id, a)} syllabusId={0}                        />
                      </div>
                    </div>

                    {/* Material Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>📚 Learning Materials</h3>
                      </div>
                      <div style={{ overflow: 'auto' }}>
                        <MaterialTable
                          materials={materialMap[version.id] || []}
                          isEditing={false}
                          onAddMaterial={m => handleAddMaterial(version.id, m)}
                          onDeleteMaterial={id => handleDeleteMaterial(version.id, id)}
                          onUpdateMaterial={(id, m) => handleUpdateMaterial(version.id, id, m)} syllabusId={0}                        />
                      </div>
                    </div>

                    {/* Outcome Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>🎯 Learning Outcomes</h3>
                      </div>
                      <div style={{ overflow: 'auto' }}>
                        <OutcomeTable
                          outcomes={outcomeMap[version.id] || []}
                          isEditing={false}
                          onAddOutcome={o => handleAddOutcome(version.id, o)}
                          onDeleteOutcome={id => handleDeleteOutcome(version.id, id)}
                          onUpdateOutcome={(id, o) => handleUpdateOutcome(version.id, id, o)} syllabusId={0}                        />
                      </div>
                    </div>

                    {/* Session Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>📅 Course Sessions</h3>
                      </div>
                      <div style={{ overflow: 'auto' }}>
                        <SessionTable
                          sessions={sessionMap[version.id] || []}
                          outcomes={outcomeMap[version.id] || []}
                          isEditing={false}
                          onAddSession={s => handleAddSession(version.id, s)}
                          onDeleteSession={id => handleDeleteSession(version.id, id)}
                          onUpdateSession={(id, s) => handleUpdateSession(version.id, id, s)}
                          onAddOutcomeToSession={(sessionId, outcomeId) => handleAddOutcomeToSession(version.id, sessionId, outcomeId)} syllabusId={0}                        />
                      </div>
                    </div>

                    {/* Set Default Button */}
                    {!version.isDefault && (
                      <div style={{ marginBottom: 16 }}>
                        <Button
                          type="primary"
                          onClick={() => handleSetDefault(version.id)}
                          style={{ borderRadius: 8, background: '#10b981', borderColor: '#10b981' }}
                        >
                          Set as Default Version
                        </Button>
                      </div>
                    )}
                  </div>
                ),
              };
            })}
          />
        </div>
      </div>
    </>
  );
};

export default ManagerSubjectVersionPage; 