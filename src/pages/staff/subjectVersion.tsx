import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Tabs, Typography, message, Table, Card, Tag, Space, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, EditOutlined, SaveOutlined, FileExcelOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

import AddVersionModal from '../../components/staff/AddVersionModal';
import styles from '../../css/staff/staffEditSyllabus.module.css';

import AssessmentTable from '../../components/staff/AssessmentTable';
import MaterialTable from '../../components/staff/MaterialTable';
import OutcomeTable from '../../components/staff/OutcomeTable';
import SessionTable from '../../components/staff/SessionTable';
import SubjectSelect from '../../components/common/SubjectSelect';
import { Modal } from 'antd';
import BulkDataImport from '../../components/common/bulkDataImport';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { SubjectVersion, Syllabus, SyllabusAssessment, SyllabusMaterial, SyllabusOutcome, SyllabusSession, SubjectPrerequisite, CreateSubjectVersion, CreateSyllabus } from '../../interfaces/ISchoolProgram';
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

const SubjectVersionPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeKey, setActiveKey] = useState<string>('');

  // State for Add Prerequisite Modal
  const [prereqModalOpen, setPrereqModalOpen] = useState(false);
  const [selectedPrereqSubject, setSelectedPrereqSubject] = useState<any>(null);
  const [editingVersionId, setEditingVersionId] = useState<number | null>(null);
  
  // Local state for prerequisites per version
  const [prereqMap, setPrereqMap] = useState<Record<number, any[]>>({});

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
    toggleActiveSubjectVersionMutation 
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

  // Handler to fetch or create syllabus for a specific version
  const fetchOrCreateSyllabus = useCallback(async (versionId: number) => {
    if (!subject) return;
    
    try {
      // Try to fetch existing syllabus for this version
      let syllabusData: Syllabus | null = null;
      try {
        syllabusData = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      } catch (err) {
        console.log('No syllabus found for version:', versionId, err);
        syllabusData = null;
      }
      
      if (!syllabusData) {
        // No syllabus exists, create default syllabus
        message.info('No syllabus found. Creating default syllabus...');
        const newSyllabus = await createDefaultSyllabus(
          versionId,
          subject.subjectCode,
          subject.subjectName,
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
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: syllabusData
        }));
        
        // Update the maps with existing syllabus data
        setAssessmentMap(prev => ({
          ...prev,
          [versionId]: syllabusData?.assessments || []
        }));
        setMaterialMap(prev => ({
          ...prev,
          [versionId]: syllabusData?.learningMaterials || []
        }));
        setOutcomeMap(prev => ({
          ...prev,
          [versionId]: syllabusData?.learningOutcomes || []
        }));
        setSessionMap(prev => ({
          ...prev,
          [versionId]: syllabusData?.sessions || []
        }));
      }
    } catch (err: any) {
      message.error('Failed to fetch/create syllabus: ' + err.message);
    }
  }, [subject, fetchSyllabusBySubjectVersionMutation, addSyllabusMutation]);

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
          // API might return 404 or error when no versions exist
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
            await fetchOrCreateSyllabus(defaultVersions[0].id);
          }
        } else {
          // Versions exist, use them
          setSubjectVersions(versionsData);
          if (versionsData.length > 0) {
            setActiveKey(String(versionsData[0].id));
            // Fetch syllabus for the first version
            await fetchOrCreateSyllabus(versionsData[0].id);
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch data: ' + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId, fetchOrCreateSyllabus]); // Only depend on subjectId and fetchOrCreateSyllabus, not the mutation functions

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
          setActiveKey(String(updatedVersions[updatedVersions.length - 1].id));
        }
      }
      
      setModalVisible(false);
    } catch (err: any) {
      message.error('Failed to add version: ' + err.message);
    } finally {
      setAdding(false);
    }
  }, [addSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId]);

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

  // Handler to toggle active status
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

  const handlePrereqModalOk = () => {
    if (selectedPrereqSubject && editingVersionId) {
      setPrereqMap(prev => ({
        ...prev,
        [editingVersionId]: [
          ...(prev[editingVersionId] || []),
          {
            version_id: editingVersionId,
            subject_id: Number(subjectId),
            prerequisite_subject_id: selectedPrereqSubject.id,
            subjectCode: selectedPrereqSubject.subjectCode,
            subjectName: selectedPrereqSubject.subjectName,
          },
        ],
      }));
      message.success('Prerequisite added successfully!');
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
      [versionId]: (prev[versionId] || []).filter(p => p.prerequisite_subject_id !== prerequisite_subject_id),
    }));
    message.success('Prerequisite removed successfully!');
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
    message.success(`${type} data imported successfully!`);
  };

  const handleBulkModalClose = () => setBulkModal(null);

  // Handler for tab change
  const handleTabChange = useCallback((key: string) => {
    setActiveKey(key);
    const versionId = Number(key);
    if (versionId && !syllabusMap[versionId]) {
      fetchOrCreateSyllabus(versionId);
    }
  }, [syllabusMap, fetchOrCreateSyllabus]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography.Text>Loading...</Typography.Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography.Text type="danger">{error}</Typography.Text>
      </div>
    );
  }

  if (subjectVersions.length === 0) {
    return (
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
                {subject?.description}
              </h3>
              <p className={styles.syllabusSubtitle}>
                Subject Versions & Learning Management
              </p>
            </div>
          </div>
          <div className={styles.syllabusHeaderRight}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setModalVisible(true)}
            >
              Add Version
            </Button>
          </div>
        </div>

        {/* No Versions Message */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          textAlign: 'center'
        }}>
          <Typography.Title level={3} style={{ color: '#666', marginBottom: 16 }}>
            No Versions Found
          </Typography.Title>
          <Typography.Text style={{ color: '#999', marginBottom: 24 }}>
            This subject doesn't have any versions yet. Create the first version to get started.
          </Typography.Text>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />} 
            onClick={() => setModalVisible(true)}
          >
            Create First Version
          </Button>
        </div>

        <AddVersionModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onAdd={handleAddVersion}
          confirmLoading={adding}
          subjectId={Number(subjectId)}
        />
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
                {subject?.description}
              </h3>
              <p className={styles.syllabusSubtitle}>
                Subject Versions & Learning Management
              </p>
            </div>
          </div>
          <div className={styles.syllabusHeaderRight}>
            <Button
              type="primary"
              icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
              onClick={() => setIsEditing(e => !e)}
              className={isEditing ? styles.saveButton : styles.editButton}
            >
              {isEditing ? 'Finish Editing' : 'Edit Versions'}
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              style={{ marginLeft: 16 }} 
              onClick={() => setModalVisible(true)}
            >
              Add Version
            </Button>
          </div>
        </div>

        {/* Tabs for Versions */}
        <div style={{ width: '100%' }}>
          <Tabs
            activeKey={activeKey}
            onChange={handleTabChange}
            type="card"
            tabBarStyle={{ background: 'transparent', borderRadius: 12, boxShadow: 'none', display: 'flex', justifyContent: 'center' }}
            items={subjectVersions.map((version, index) => {
              const isActive = activeKey === String(version.id);
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
                      {version.isActive && <Tag color="green">Active</Tag>}
                      {version.isDefault && <Tag color="blue">Default</Tag>}
                      {isEditing && (
                        <Space>
                          <Tooltip title="Toggle Active">
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
                          <Tooltip title="Delete Version">
                            <Popconfirm
                              title="Are you sure you want to delete this version?"
                              onConfirm={(e) => {
                                e?.stopPropagation();
                                handleDeleteVersion(version.id);
                              }}
                              onCancel={(e) => e?.stopPropagation()}
                            >
                              <Button
                                size="small"
                                type="text"
                                danger
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DeleteOutlined />
                              </Button>
                            </Popconfirm>
                          </Tooltip>
                        </Space>
                      )}
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
                              {version.isActive && <Tag color="green">Active</Tag>}
                              {version.isDefault && <Tag color="blue">Default</Tag>}
                            </Space>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Prerequisite Subjects Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          📚 Prerequisite Subjects
                        </h3>
                        <ExcelImportButton onClick={() => handleAddPrerequisite(version.id)}>
                          Add Prerequisite
                        </ExcelImportButton>
                      </div>
                      <Table
                        columns={[
                          { title: 'Subject Code', dataIndex: 'subjectCode', key: 'subjectCode', width: 160 },
                          { title: 'Subject Name', dataIndex: 'subjectName', key: 'subjectName' },
                          ...(isEditing ? [{
                            title: 'Action',
                            key: 'action',
                            render: (_: any, record: any) => (
                              <Button type="link" danger onClick={() => handleDeletePrerequisite(version.id, record.prerequisite_subject_id)}>
                                Delete
                              </Button>
                            ),
                          }] : [])
                        ].filter(Boolean)}
                        dataSource={prereqMap[version.id] || []}
                        rowKey={r => r.prerequisite_subject_id}
                        pagination={false}
                        style={{ marginTop: 12 }}
                      />
                    </div>

                    {/* Assessment Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          📊 Assessments
                        </h3>
                        <ExcelImportButton onClick={() => handleBulkImport('ASSESSMENT', version.id)}>
                          Import Excel
                        </ExcelImportButton>
                      </div>
                      <AssessmentTable
                        assessments={assessmentMap[version.id] || []}
                        isEditing={isEditing}
                        onAddAssessment={a => handleAddAssessment(version.id, a)}
                        onDeleteAssessment={id => handleDeleteAssessment(version.id, id)}
                        onUpdateAssessment={(id, a) => handleUpdateAssessment(version.id, id, a)}
                      />
                    </div>

                    {/* Material Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          📚 Learning Materials
                        </h3>
                        <ExcelImportButton onClick={() => handleBulkImport('MATERIAL', version.id)}>
                          Import Excel
                        </ExcelImportButton>
                      </div>
                      <MaterialTable
                        materials={materialMap[version.id] || []}
                        isEditing={isEditing}
                        onAddMaterial={m => handleAddMaterial(version.id, m)}
                        onDeleteMaterial={id => handleDeleteMaterial(version.id, id)}
                        onUpdateMaterial={(id, m) => handleUpdateMaterial(version.id, id, m)}
                      />
                    </div>

                    {/* Outcome Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          🎯 Learning Outcomes
                        </h3>
                        <ExcelImportButton onClick={() => handleBulkImport('OUTCOME', version.id)}>
                          Import Excel
                        </ExcelImportButton>
                      </div>
                      <OutcomeTable
                        outcomes={outcomeMap[version.id] || []}
                        isEditing={isEditing}
                        onAddOutcome={o => handleAddOutcome(version.id, o)}
                        onDeleteOutcome={id => handleDeleteOutcome(version.id, id)}
                        onUpdateOutcome={(id, o) => handleUpdateOutcome(version.id, id, o)}
                      />
                    </div>

                    {/* Session Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          📅 Course Sessions
                        </h3>
                        <ExcelImportButton onClick={() => handleBulkImport('SESSION', version.id)}>
                          Import Excel
                        </ExcelImportButton>
                      </div>
                      <SessionTable
                        sessions={sessionMap[version.id] || []}
                        outcomes={outcomeMap[version.id] || []}
                        isEditing={isEditing}
                        onAddSession={s => handleAddSession(version.id, s)}
                        onDeleteSession={id => handleDeleteSession(version.id, id)}
                        onUpdateSession={(id, s) => handleUpdateSession(version.id, id, s)}
                        onAddOutcomeToSession={(sessionId, outcomeId) => handleAddOutcomeToSession(version.id, sessionId, outcomeId)}
                      />
                    </div>

                    {/* Add Prerequisite Modal */}
                    <Modal
                      title="Add Prerequisite Subject"
                      open={prereqModalOpen && editingVersionId === version.id}
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

                    {/* Bulk Import Modal */}
                    <Modal
                      open={!!bulkModal && bulkModal.versionId === version.id}
                      onCancel={handleBulkModalClose}
                      footer={null}
                      title={`Bulk Import ${bulkModal?.type || ''}`}
                    >
                      <BulkDataImport
                        onClose={handleBulkModalClose}
                        onDataImported={data => {
                          const imported = data[bulkModal?.type || ''] || [];
                          handleBulkDataImported(bulkModal?.type || '', version.id, imported);
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

export default SubjectVersionPage; 