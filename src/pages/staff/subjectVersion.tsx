import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Tabs, Typography, Card, Tag, Space, Popconfirm, Tooltip, Input } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, EditOutlined, SaveOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import AddVersionModal from '../../components/staff/AddVersionModal';
import styles from '../../css/staff/staffEditSyllabus.module.css';
import AssessmentTable from '../../components/staff/AssessmentTable';
import MaterialTable from '../../components/staff/MaterialTable';
import OutcomeTable from '../../components/staff/OutcomeTable';
import SessionTable from '../../components/staff/SessionTable';
import { Modal } from 'antd';
import { SubjectVersion, Syllabus, CreateSubjectVersion } from '../../interfaces/ISchoolProgram';
import { useCRUDSubject, useCRUDSubjectVersion, useCRUDSyllabus } from '../../hooks/useCRUDSchoolMaterial';
import { generateDefaultVersionData, generateDefaultSyllabusData } from '../../datas/mockData';
import AddPrerequisiteSubjectVersionModal from '../../components/staff/AddPrerequisiteSubjectVersionModal';
import BulkDataImport from '../../components/common/bulkDataImport';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';
import LoadingScreen from '../../components/LoadingScreen';

// Function to create default version for a subject (moved outside component)
const createDefaultVersion = async (
  subjectData: any, 
  addSubjectVersionMutation: any,
  handleSuccess: (message: string) => void,
  handleError: (error: any, title?: string) => void
): Promise<SubjectVersion[]> => {
  try {
    // Check if subject is approved before creating version
    if (subjectData.approvalStatus !== 2) {
      throw new Error('Cannot create versions for unapproved subjects. Please approve the subject first.');
    }
    
    const defaultVersionData = generateDefaultVersionData(
      subjectData.id,
      subjectData.subjectCode,
      subjectData.subjectName
    );
    
    const newVersion = await addSubjectVersionMutation.mutateAsync(defaultVersionData);
    if (newVersion) {
      handleSuccess('Default version created successfully!');
      return Array.isArray(newVersion) ? newVersion : [newVersion];
    }
  } catch (err: any) {
    console.log(err, 'Failed to create default version');
  }
  return [];
};

// Function to create default syllabus for a subject version (moved outside component)
const createDefaultSyllabus = async (
  subjectVersionId: number,
  subjectCode: string,
  subjectName: string,
  addSyllabusMutation: any,
  handleSuccess: (message: string) => void,
  handleError: (error: any, title?: string) => void
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
    handleError(err, 'Failed to create default syllabus');
  }
  return null;
};

const SubjectVersionPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { showInfo } = useMessagePopupContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeKey, setActiveKey] = useState<string>('');

  // State for Add Prerequisite Modal
  const [prereqModalOpen, setPrereqModalOpen] = useState(false);
  const [editingVersionId, setEditingVersionId] = useState<number | null>(null);
  
  // State for editing version data
  const [editingVersionData, setEditingVersionData] = useState<Record<number, any>>({});
  const [savingVersion, setSavingVersion] = useState<Record<number, boolean>>({});
  
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
    editSubjectVersionMutation,
    deleteSubjectVersionMutation,
    toggleActiveSubjectVersionMutation,
    setDefaultSubjectVersionMutation,
    addPrerequisiteToSubjectVersionMutation,
    getPrerequisitesBySubjectVersionMutation,
    deletePrerequisiteFromSubjectVersionMutation,
    getPrerequisitesBySubjectMutation,
    copyPrerequisitesBetweenVersionsMutation
  } = useCRUDSubjectVersion();
  const {
    fetchSyllabusBySubjectVersionMutation,
    addSyllabusMutation,
    addSyllabusAssessmentMutation,
    updateSyllabusAssessmentMutation,
    deleteSyllabusAssessmentMutation,
    addSyllabusMaterialMutation,
    updateSyllabusMaterialMutation,
    deleteSyllabusMaterialMutation,
    addSyllabusOutcomeMutation,
    updateSyllabusOutcomeMutation,
    deleteSyllabusOutcomeMutation,
    addSyllabusSessionMutation,
    updateSyllabusSessionMutation,
    deleteSyllabusSessionMutation,
    addSyllabusOutcomesToSessionMutation,
    removeOutcomeFromSessionMutation
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
      console.warn('Skip fetch due to invalid versionId:', versionId);
      return;
    }
    setPrereqLoading(prev => ({ ...prev, [versionId]: true }));
    try {
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const prerequisitesPromise = getPrerequisitesBySubjectVersionMutation.mutateAsync(versionId);
      const prerequisites = await Promise.race([prerequisitesPromise, timeoutPromise]);
      
      if (prerequisites && Array.isArray(prerequisites)) {
        console.log('Loaded for version', versionId, 'count:', prerequisites.length);
        setPrereqMap(prev => ({
          ...prev,
          [versionId]: prerequisites
        }));
      } else {
        console.log('Empty or invalid list for version', versionId, prerequisites);
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
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const allPrerequisitesPromise = getPrerequisitesBySubjectMutation.mutateAsync(Number(subjectId));
      const allPrerequisites = await Promise.race([allPrerequisitesPromise, timeoutPromise]);
      
      if (allPrerequisites && Array.isArray(allPrerequisites)) {
        // Group prerequisites by version
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
      console.warn('Syllabus: Skip due to invalid versionId:', versionId);
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
        console.log('Syllabus: Fetch for version', versionId, 'result:', !!syllabusData);
      } catch (err) {
        console.error('Error fetching syllabus for version:', versionId, err);
        syllabusData = null;
      }
      
      if (!syllabusData) {
        // No syllabus exists, create default syllabus
        showInfo('No syllabus found. Creating default syllabus...');
        
        // Add delay to ensure version is fully created
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newSyllabus = await createDefaultSyllabus(
          versionId,
          subjectData.subjectCode,
          subjectData.subjectName,
          addSyllabusMutation,
          handleSuccess,
          handleError
        );
        
        if (newSyllabus) {
          console.log('[Syllabus] Created for version', versionId, 'id:', newSyllabus.id);
          
          // Add delay to ensure backend has finalized the syllabus creation
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Refetch the syllabus to ensure we have the complete data with proper ID and nested arrays
          try {
            console.log('[Syllabus] Refetching after creation for version', versionId);
            const refetchedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
            
            if (refetchedSyllabus) {
              console.log('[Syllabus] Refetch successful for version', versionId, 'id:', refetchedSyllabus.id);
              setSyllabusMap(prev => ({
                ...prev,
                [versionId]: refetchedSyllabus
              }));
              
              // Update the assessment, material, outcome, and session maps with the refetched syllabus data
              const assessments = Array.isArray(refetchedSyllabus.assessments) ? refetchedSyllabus.assessments : [];
              const materials = Array.isArray(refetchedSyllabus.learningMaterials) ? refetchedSyllabus.learningMaterials : [];
              const outcomes = Array.isArray(refetchedSyllabus.learningOutcomes) ? refetchedSyllabus.learningOutcomes : [];
              const sessions = Array.isArray(refetchedSyllabus.sessions) ? refetchedSyllabus.sessions : [];
              
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
              
              console.log('[Syllabus] Maps updated for version', versionId, 'assessments:', assessments.length, 'materials:', materials.length, 'outcomes:', outcomes.length, 'sessions:', sessions.length);
            } else {
              console.warn('[Syllabus] Refetch returned null for version', versionId);
              // Fallback to using the original created syllabus
              setSyllabusMap(prev => ({
                ...prev,
                [versionId]: newSyllabus
              }));
              
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
          } catch (refetchError) {
            console.error('[Syllabus] Refetch failed for version', versionId, refetchError);
            // Fallback to using the original created syllabus
            setSyllabusMap(prev => ({
              ...prev,
              [versionId]: newSyllabus
            }));
            
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
          console.warn('[Syllabus] Create returned null for version', versionId);
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
        console.log('[Syllabus] Using existing for version', versionId, 'assessments:', assessments.length, 'materials:', materials.length, 'outcomes:', outcomes.length, 'sessions:', sessions.length);
        
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
      handleError('Failed to fetch/create syllabus: ' + err.message);
    }
  }, [fetchSyllabusBySubjectVersionMutation, addSyllabusMutation, showInfo, handleSuccess, handleError]);

  // Fetch subject and versions
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
        
        // Fetch subject versions with proper error handling
        let versionsData: SubjectVersion[] = [];
        try {
          const response = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
          // Handle different response types
          if (Array.isArray(response)) {
            versionsData = response;
          } else if (response && typeof response === 'object' && 'data' in (response as any)) {
            // API might return { data: [...] }
            versionsData = Array.isArray((response as any).data) ? (response as any).data : [];
          } else if (response === true || response === false) {
            // API returned boolean instead of array
            console.log('API returned boolean instead of array:', response);
            versionsData = [];
          } else {
            console.log('API returned unexpected data type:', typeof response, response);
            versionsData = [];
          }
          console.log('[Versions] Fetched count:', Array.isArray(versionsData) ? versionsData.length : 'N/A', versionsData);
        } catch (err: any) {
          // Handle specific error cases
          if (err?.response?.status === 400 && err?.response?.data?.message?.includes('not approved')) {
            handleError('Cannot create versions for unapproved subjects. Please approve the subject first.');
            setError('Subject must be approved before creating versions.');
            setLoading(false);
            return;
          }
          console.log('No versions found or API error:', err);
          versionsData = [];
        }
        
        if (!Array.isArray(versionsData) || versionsData.length === 0) {
          // No versions exist, automatically create default version and then refetch to get its real ID
          showInfo('No versions found. Automatically creating default version and syllabus...');
          setInitLoading('Creating default version...');
          
          try {
            const defaultVersions = await createDefaultVersion(subjectData, addSubjectVersionMutation, handleSuccess, handleError);
            console.log('[Versions] Default create returned:', defaultVersions);
            
            // After creation, always refetch to ensure we have a valid ID instead of a message payload
            setInitLoading('Fetching newly created version...');
            let refreshedAfterCreate: SubjectVersion[] = [];
            try {
              const resp = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
              if (Array.isArray(resp)) refreshedAfterCreate = resp;
              else if (resp && typeof resp === 'object' && 'data' in (resp as any)) {
                refreshedAfterCreate = Array.isArray((resp as any).data) ? (resp as any).data : [];
              }
            } catch (refErr) {
              console.error('[Versions] Refetch after create failed:', refErr);
            }
            
            const validVersions = (refreshedAfterCreate || [])
              .filter(v => v && typeof v.id === 'number' && v.id > 0);
            const newestVersion = validVersions
              .slice()
              .sort((a, b) => (b.id || 0) - (a.id || 0))[0];
            
            if (newestVersion && newestVersion.id > 0) {
              console.log('[Versions] Using newly created version id:', newestVersion.id, newestVersion);
              setSubjectVersions(validVersions);
              setActiveKey(String(newestVersion.id));
              
              // Ensure backend has finalized creation
              setInitLoading('Preparing syllabus...');
              await new Promise(resolve => setTimeout(resolve, 800));
              
              // Create syllabus for the new version
              await fetchOrCreateSyllabus(newestVersion.id, subjectData);
              
              // Fetch prerequisites for the new version
              setInitLoading('Fetching prerequisites...');
              await new Promise(resolve => setTimeout(resolve, 300));
              await fetchPrerequisitesForVersion(newestVersion.id);
              setInitLoading(null);
            } else {
              console.warn('[Versions] No valid version found after creation refetch', refreshedAfterCreate);
              handleError('Failed to load created version');
              setInitLoading(null);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error creating default version:', error);
            setInitLoading(null);
          }
        } else {
          // Versions exist, use them
          const finalVersionsData = Array.isArray(versionsData) ? versionsData : [];
          setSubjectVersions(finalVersionsData);
          if (finalVersionsData.length > 0) {
            setActiveKey(String(finalVersionsData[0].id));
            setTimeout(() => {
              console.log('[Versions] Using existing, post-set snapshot', {
                activeKeyAfterSet: String(finalVersionsData[0].id),
                versionIds: finalVersionsData.map(v => v?.id)
              });
            }, 0);
            
            setInitLoading('Loading syllabus...');
            // Fetch syllabus for the first version
            await fetchOrCreateSyllabus(finalVersionsData[0].id, subjectData);
            
            // Fetch prerequisites for all versions - with error handling
            try {
              setInitLoading('Loading prerequisites...');
              await fetchAllPrerequisites();
            } catch (error) {
              console.error('Failed to fetch all prerequisites:', error);
            }
            // Always fetch prerequisites for the first (active) version to guarantee display
            try {
              await fetchPrerequisitesForVersion(finalVersionsData[0].id);
            } catch (prereqError) {
              console.error('Failed to fetch prerequisites for first version:', prereqError);
            }
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
  }, [subjectId]); // Only depend on subjectId to prevent infinite loops

  // Handler for adding a new version
  const handleAddVersion = useCallback(async (values: CreateSubjectVersion) => {
    setAdding(true);
    try {
      await addSubjectVersionMutation.mutateAsync(values);
      handleSuccess('Version added successfully!');
      
      // Force refresh versions list to get the latest data
      const refreshedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (refreshedVersions) {
        setSubjectVersions(refreshedVersions);
        if (refreshedVersions.length > 0) {
          const newVersionId = refreshedVersions[refreshedVersions.length - 1].id;
          setActiveKey(String(newVersionId));
          // Fetch prerequisites for the new version
          await fetchPrerequisitesForVersion(newVersionId);
        }
      }
      
      setModalVisible(false);
    } catch (err: any) {
      console.log('Failed to add version: ' + err.message);
    } finally {
      setAdding(false);
    }
  }, [addSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId, fetchPrerequisitesForVersion, handleSuccess, handleError]);

  // Handler to delete a version
  const handleDeleteVersion = useCallback(async (versionId: number) => {
    try {
      await deleteSubjectVersionMutation.mutateAsync(versionId);
      handleSuccess('Version deleted successfully!');
      
      // Force refresh versions list to get the latest data
      const refreshedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (refreshedVersions) {
        setSubjectVersions(refreshedVersions);
        if (refreshedVersions.length > 0 && activeKey === String(versionId)) {
          setActiveKey(String(refreshedVersions[0].id));
        }
      }
    } catch (err: any) {
      handleError('Failed to delete version: ' + err.message);
    }
  }, [deleteSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId, activeKey, handleSuccess, handleError]);

  // Handler to toggle active status
  const handleToggleActive = useCallback(async (versionId: number) => {
    try {
      await toggleActiveSubjectVersionMutation.mutateAsync(versionId);
      handleSuccess('Version status updated successfully!');
      
      // Force refresh versions list to get the latest data
      const refreshedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (refreshedVersions) {
        setSubjectVersions(refreshedVersions);
      }
    } catch (err: any) {
      handleError('Failed to update version status: ' + err.message);
    }
  }, [toggleActiveSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId, handleSuccess, handleError]);

  // Handler to set default version
  const handleSetDefault = useCallback(async (versionId: number) => {
    try {
      await setDefaultSubjectVersionMutation.mutateAsync(versionId);
      handleSuccess('Version set as default successfully!');
      
      // Force refresh versions list to get the latest data
      const refreshedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (refreshedVersions) {
        setSubjectVersions(refreshedVersions);
      }
    } catch (err: any) {
      handleError('Failed to set version as default: ' + err.message);
    }
  }, [setDefaultSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId, handleSuccess, handleError]);

  // Handler to save version edits
  const handleSaveVersion = useCallback(async (versionId: number) => {
    console.log('handleSaveVersion called with versionId:', versionId);
    console.log('Current editingVersionData:', editingVersionData);
    
    const versionData = editingVersionData[versionId];
    console.log('Version data for this version:', versionData);
    
    if (!versionData) {
      console.error('No version data found for versionId:', versionId);
      return;
    }

    // Validate required fields
    if (!versionData.versionCode?.trim() || !versionData.versionName?.trim() || !versionData.description?.trim()) {
      console.error('Validation failed - missing required fields:', {
        versionCode: versionData.versionCode,
        versionName: versionData.versionName,
        description: versionData.description
      });
      handleError('Version Code, Version Name, and Description are required fields');
      return;
    }

    if (!versionData.effectiveFrom) {
      console.error('Validation failed - missing effectiveFrom:', versionData.effectiveFrom);
      handleError('Effective From date is required');
      return;
    }

    setSavingVersion(prev => ({ ...prev, [versionId]: true }));
    try {
      // Convert to UpdateSubjectVersion format
      const updateData = {
        versionCode: versionData.versionCode.trim(),
        versionName: versionData.versionName.trim(),
        description: versionData.description.trim(),
        isActive: versionData.isActive,
        isDefault: versionData.isDefault,
        effectiveFrom: versionData.effectiveFrom,
        effectiveTo: versionData.effectiveTo || null,
        createdAt: subjectVersions.find(v => v.id === versionId)?.createdAt || '',
        updatedAt: new Date().toISOString()
      };

      console.log('Sending update data:', updateData);
      console.log('Current subjectVersions before update:', subjectVersions);

      const updatedVersion = await editSubjectVersionMutation.mutateAsync({ id: versionId, data: updateData });
      console.log('API response:', updatedVersion);
      
      if (updatedVersion) {
        handleSuccess('Version updated successfully!');
        
        // Force refresh the subject versions list to get the latest data
        try {
          console.log('Force refreshing subject versions list...');
          const refreshedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
          if (refreshedVersions && Array.isArray(refreshedVersions)) {
            setSubjectVersions(refreshedVersions);
            console.log('Subject versions refreshed successfully:', refreshedVersions);
            
            // Ensure activeKey is still valid after refresh
            if (activeKey && !refreshedVersions.some(v => String(v.id) === activeKey)) {
              setActiveKey(String(refreshedVersions[0].id));
            }
          }
        } catch (refreshError) {
          console.error('Failed to refresh subject versions:', refreshError);
          // Fallback to local state update if refresh fails
          setSubjectVersions(prev => {
            const newVersions = prev.map(v => {
              if (v.id === versionId) {
                return {
                  ...v,
                  ...updatedVersion,
                  subject: v.subject
                };
              }
              return v;
            });
            return newVersions;
          });
        }
        
        // Clear editing data for this version
        setEditingVersionData(prev => {
          const newData = { ...prev };
          delete newData[versionId];
          console.log('Cleared editing data for version:', versionId, 'New editing data:', newData);
          return newData;
        });
      } else {
        console.error('API returned null/undefined for updated version');
        handleError('Failed to update version - no response from server');
        
        // Fallback: refresh the data from server
        try {
          console.log('Attempting to refresh data from server...');
          const refreshedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
          if (refreshedVersions && Array.isArray(refreshedVersions)) {
            setSubjectVersions(refreshedVersions);
            console.log('Data refreshed successfully:', refreshedVersions);
          }
        } catch (refreshError) {
          console.error('Failed to refresh data:', refreshError);
        }
      }
    } catch (err: any) {
      console.error('Error in handleSaveVersion:', err);
      handleError('Failed to update version: ' + (err.message || 'Unknown error'));
      
      // Fallback: refresh the data from server on error
      try {
        console.log('Attempting to refresh data from server after error...');
        const refreshedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
        if (refreshedVersions && Array.isArray(refreshedVersions)) {
          setSubjectVersions(refreshedVersions);
          console.log('Data refreshed successfully after error:', refreshedVersions);
        }
      } catch (refreshError) {
        console.error('Failed to refresh data after error:', refreshError);
      }
    } finally {
      setSavingVersion(prev => ({ ...prev, [versionId]: false }));
    }
  }, [editingVersionData, editSubjectVersionMutation, handleSuccess, handleError, subjectVersions, subjectId, getSubjectVersionsBySubjectId, activeKey]);

  // Handler to initialize editing data when editing mode is turned on
  const handleStartEditing = useCallback(() => {
    console.log('handleStartEditing called');
    console.log('Current subjectVersions:', subjectVersions);
    
    setIsEditing(true);
    // Initialize editing data for all versions
    const initialEditingData: Record<number, any> = {};
    subjectVersions.forEach(version => {
      initialEditingData[version.id] = {
        subjectId: version.subjectId,
        versionCode: version.versionCode,
        versionName: version.versionName,
        description: version.description,
        isActive: version.isActive,
        isDefault: version.isDefault,
        effectiveFrom: version.effectiveFrom,
        effectiveTo: version.effectiveTo
      };
    });
    
    console.log('Initial editing data:', initialEditingData);
    setEditingVersionData(initialEditingData);
  }, [subjectVersions]);

  // Handler to cancel editing
  const handleCancelEditing = useCallback(() => {
    console.log('handleCancelEditing called');
    setIsEditing(false);
    setEditingVersionData({});
  }, []);

  // Debug useEffect for editing state
  useEffect(() => {
    console.log('Editing state changed:', { isEditing, editingVersionData });
  }, [isEditing, editingVersionData]);

  // Debug useEffect for subjectVersions
  useEffect(() => {
    console.log('SubjectVersions changed:', subjectVersions);
  }, [subjectVersions]);

  // Debug useEffect for activeKey
  useEffect(() => {
    console.log('[Render Sanity] activeKey:', activeKey, 'versionIds:', subjectVersions.map(v => v.id));
  }, [subjectVersions, activeKey]);

  // Safety check for activeKey - ensure it's still valid after state updates
  useEffect(() => {
    if (subjectVersions.length > 0 && activeKey) {
      const activeVersionExists = subjectVersions.some(v => String(v.id) === activeKey);
      if (!activeVersionExists) {
        console.log('Active key is no longer valid, setting to first version');
        setActiveKey(String(subjectVersions[0].id));
      }
    } else if (subjectVersions.length > 0 && !activeKey) {
      console.log('No active key but versions exist, setting to first version');
      setActiveKey(String(subjectVersions[0].id));
    }
  }, [subjectVersions, activeKey]);

  // Handler to handle version field changes
  const handleVersionFieldChange = useCallback((versionId: number, field: string, value: any) => {
    console.log('handleVersionFieldChange called:', { versionId, field, value });
    
    setEditingVersionData(prev => {
      const newData = {
        ...prev,
        [versionId]: {
          ...prev[versionId],
          [field]: value
        }
      };
      console.log('New editingVersionData after change:', newData);
      return newData;
    });
  }, []);

  // Handler to delete a prerequisite
  const handleDeletePrerequisite = async (versionId: number, prerequisite_subject_id: number) => {
    try {
      // Find the prerequisite that matches the subject ID to get the subject version ID
      const prerequisite = (prereqMap[versionId] || []).find((p: any) => p.prerequisite_subject_id === prerequisite_subject_id);
      if (!prerequisite) {
        handleError('Prerequisite not found');
        return;
      }
      
      // Use the prerequisite subject version ID for deletion
      const prerequisiteSubjectVersionId = prerequisite.prerequisite_subject_version_id || prerequisite.id;
      
      // Use the real API to delete prerequisite
      await deletePrerequisiteFromSubjectVersionMutation.mutateAsync({
        subjectVersionId: versionId,
        prerequisiteId: prerequisiteSubjectVersionId
      });
      
      // Refetch prerequisites for this version to ensure UI reflects server state
      await fetchPrerequisitesForVersion(versionId);
      
      handleSuccess('Prerequisite removed successfully!');
    } catch (error) {
      console.error('Failed to delete prerequisite:', error);
      handleError('Failed to remove prerequisite');
    }
  };
  // Handlers for AssessmentTable
  const handleAddAssessment = async (versionId: number, assessment: any): Promise<void> => {
    try {
      const syllabus = syllabusMap[versionId];
      if (!syllabus) {
        handleError('Syllabus not found for this version');
        return;
      }

      await addSyllabusAssessmentMutation.mutateAsync({
        ...assessment,
        syllabusId: syllabus.id
      });

      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update assessment map with new data
        setAssessmentMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.assessments || []
        }));
      }
      
      handleSuccess('Assessment added successfully!');
    } catch (error) {
      console.error('Error adding assessment:', error);
      handleError('Failed to add assessment');
      throw error;
    }
  };

  const handleDeleteAssessment = async (versionId: number, id: number): Promise<void> => {
    try {
      await deleteSyllabusAssessmentMutation.mutateAsync(id);
      
      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update assessment map with new data
        setAssessmentMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.assessments || []
        }));
      }
      
      handleSuccess('Assessment deleted successfully!');
    } catch (error) {
      console.error('Error deleting assessment:', error);
      handleError('Failed to delete assessment');
    }
  };

  const handleUpdateAssessment = async (versionId: number, id: number, update: any): Promise<void> => {
    try {
      await updateSyllabusAssessmentMutation.mutateAsync({ id, data: update });
      
      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update assessment map with new data
        setAssessmentMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.assessments || []
        }));
      }
      
      handleSuccess('Assessment updated successfully!');
    } catch (error) {
      console.error('Error updating assessment:', error);
      handleError('Failed to update assessment');
    }
  };

  // Handlers for MaterialTable
  const handleAddMaterial = async (versionId: number, material: any): Promise<void> => {
    try {
      const syllabus = syllabusMap[versionId];
      if (!syllabus) {
        handleError('Syllabus not found for this version');
        return;
      }

      await addSyllabusMaterialMutation.mutateAsync({
        ...material,
        syllabusId: syllabus.id
      });

      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update material map with new data
        setMaterialMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.learningMaterials || []
        }));
      }
      
      handleSuccess('Material added successfully!');
    } catch (error) {
      console.error('Error adding material:', error);
      handleError('Failed to add material');
      throw error;
    }
  };

  const handleDeleteMaterial = async (versionId: number, id: number): Promise<void> => {
    try {
      await deleteSyllabusMaterialMutation.mutateAsync(id);
      
      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update material map with new data
        setMaterialMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.learningMaterials || []
        }));
      }
      
      handleSuccess('Material deleted successfully!');
    } catch (error) {
      console.error('Error deleting material:', error);
      handleError('Failed to delete material');
    }
  };

  const handleUpdateMaterial = async (versionId: number, id: number, update: any): Promise<void> => {
    try {
      await updateSyllabusMaterialMutation.mutateAsync({ id, data: update });
      
      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update material map with new data
        setMaterialMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.learningMaterials || []
        }));
      }
      
      handleSuccess('Material updated successfully!');
    } catch (error) {
      console.error('Error updating material:', error);
      handleError('Failed to update material');
    }
  };

  // Handlers for OutcomeTable
  const handleAddOutcome = async (versionId: number, outcome: any): Promise<void> => {
    try {
      const syllabus = syllabusMap[versionId];
      if (!syllabus) {
        handleError('Syllabus not found for this version');
        return;
      }

      await addSyllabusOutcomeMutation.mutateAsync({
        ...outcome,
        syllabusId: syllabus.id
      });

      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update outcome map with new data
        setOutcomeMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.learningOutcomes || []
        }));
      }
      
      handleSuccess('Outcome added successfully!');
    } catch (error) {
      console.error('Error adding outcome:', error);
      handleError(error,'Failed to add outcome');
      throw error;
    }
  };

  const handleDeleteOutcome = async (versionId: number, id: number): Promise<void> => {
    try {
      await deleteSyllabusOutcomeMutation.mutateAsync(id);
      
      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update outcome map with new data
        setOutcomeMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.learningOutcomes || []
        }));
      }
      
      handleSuccess('Outcome deleted successfully!');
    } catch (error) {
      console.error('Error deleting outcome:', error);
      handleError(error,'Failed to delete outcome');
    }
  };

  const handleUpdateOutcome = async (versionId: number, id: number, update: any): Promise<void> => {
    try {
      await updateSyllabusOutcomeMutation.mutateAsync({ id, data: update });
      
      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update outcome map with new data
        setOutcomeMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.learningOutcomes || []
        }));
      }
      
      handleSuccess('Outcome updated successfully!');
    } catch (error) {
      console.error('Error updating outcome:', error);
      handleError(error,'Failed to update outcome');
    }
  };

  // Handlers for SessionTable
  const handleAddSession = async (versionId: number, session: any): Promise<void> => {
    try {
      const syllabus = syllabusMap[versionId];
      if (!syllabus) {
        handleError(error,'Syllabus not found for this version');
        return;
      }

      await addSyllabusSessionMutation.mutateAsync({
        ...session,
        syllabusId: syllabus.id
      });

      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update session map with new data
        setSessionMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.sessions || []
        }));
      }
      
      handleSuccess('Session added successfully!');
    } catch (error) {
      console.error('Error adding session:', error);
      handleError(error,'Failed to add session');
      throw error;
    }
  };

  const handleDeleteSession = async (versionId: number, id: number): Promise<void> => {
    try {
      await deleteSyllabusSessionMutation.mutateAsync(id);
      
      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update session map with new data
        setSessionMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.sessions || []
        }));
      }
      
      handleSuccess('Session deleted successfully!');
    } catch (error) {
      console.error('Error deleting session:', error);
      handleError(error,'Failed to delete session');
    }
  };

  const handleUpdateSession = async (versionId: number, id: number, update: any): Promise<void> => {
    try {
      await updateSyllabusSessionMutation.mutateAsync({ id, data: update });
      
      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update session map with new data
        setSessionMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.sessions || []
        }));
      }
      
      handleSuccess('Session updated successfully!');
    } catch (error) {
      console.error('Error updating session:', error);
      handleError(error,'Failed to update session');
    }
  };

  const handleAddOutcomeToSession = async (versionId: number, sessionId: number, outcomeId: number): Promise<void> => {
    try {
      await addSyllabusOutcomesToSessionMutation.mutateAsync({
        sessionId,
        outcomeId
      });
      
      // Refetch syllabus to update UI
      const updatedSyllabus = await fetchSyllabusBySubjectVersionMutation.mutateAsync(versionId);
      if (updatedSyllabus) {
        setSyllabusMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus
        }));
        
        // Update session map with new data
        setSessionMap(prev => ({
          ...prev,
          [versionId]: updatedSyllabus.sessions || []
        }));
      }
      
      handleSuccess('Outcome added to session successfully!');
    } catch (error) {
      console.error('Error adding outcome to session:', error);
      handleError(error,'Failed to add outcome to session');
    }
  };

  const handleBulkDataImported = (type: string, versionId: number, importedData: any[]) => {
    if (type === 'ASSESSMENT') setAssessmentMap(prev => ({ ...prev, [versionId]: importedData }));
    if (type === 'MATERIAL') setMaterialMap(prev => ({ ...prev, [versionId]: importedData }));
    if (type === 'OUTCOME') setOutcomeMap(prev => ({ ...prev, [versionId]: importedData }));
    if (type === 'SESSION') setSessionMap(prev => ({ ...prev, [versionId]: importedData }));
    setBulkModal(null);
    handleSuccess(`${type} data imported successfully!`);
  };

  const handleBulkModalClose = () => setBulkModal(null);

  // Handler for tab change
  const handleTabChange = useCallback(async (key: string) => {
    setActiveKey(key);
    const versionId = Number(key);
    if (!versionId || Number.isNaN(versionId) || versionId <= 0) {
      console.warn('[Tabs] Ignoring invalid versionId on change:', key, versionId);
      return;
    }
    console.log('[Tabs] Change to key:', key, 'parsed versionId:', versionId, {
      hasSyllabus: !!syllabusMap[versionId],
      hasPrereqs: !!prereqMap[versionId]
    });
    
    // Fetch syllabus for this version if not already loaded
    if (!syllabusMap[versionId]) {
      await fetchOrCreateSyllabus(versionId, subject);
    }
    
    // Fetch prerequisites for this version if not already loaded
    if (!prereqMap[versionId] && !prereqLoading[versionId]) {
      await fetchPrerequisitesForVersion(versionId);
    }
  }, [syllabusMap, prereqMap, prereqLoading, fetchOrCreateSyllabus, fetchPrerequisitesForVersion, subject]);

  // Handler to copy prerequisites between versions. Might not needed
  const handleCopyPrerequisites = async (sourceVersionId: number, targetVersionId: number) => {
    try {
      await copyPrerequisitesBetweenVersionsMutation.mutateAsync({
        sourceVersionId,
        targetVersionId
      });
      
      // Refetch prerequisites for the target version to ensure UI reflects server state
      await fetchPrerequisitesForVersion(targetVersionId);
      
      handleSuccess('Prerequisites copied successfully!');
    } catch (error) {
      console.error('Failed to copy prerequisites:', error);
      handleError(error,'Failed to copy prerequisites');
    }
  };

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

  if (!Array.isArray(subjectVersions) || subjectVersions.length === 0) {
    console.log('No versions found, rendering empty state');
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

      </div>
    );
  }

  console.log('Rendering main component with versions:', subjectVersions.length);
  console.log('Current state:', { isEditing, activeKey, editingVersionData });

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
      <LoadingScreen isLoading={!!initLoading || loading} message={initLoading || 'Loading...'} />
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
          <div className={styles.syllabusHeaderRight}>
            <Button
              type="primary"
              icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
              onClick={() => {
                console.log('Header button clicked, current isEditing:', isEditing);
                if (isEditing) {
                  handleCancelEditing();
                } else {
                  handleStartEditing();
                }
              }}
              className={isEditing ? styles.saveButton : styles.editButton}
            >
              {isEditing ? 'Cancel Editing' : 'Edit Versions'}
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
            activeKey={activeKey || (Array.isArray(subjectVersions) && subjectVersions.length > 0 ? String(subjectVersions[0].id) : '')}
            onChange={handleTabChange}
            type="card"
            tabBarStyle={{ background: 'transparent', borderRadius: 12, boxShadow: 'none', display: 'flex', justifyContent: 'center' }}
            items={(Array.isArray(subjectVersions) ? subjectVersions : [])
              .filter(v => v && typeof v.id === 'number' && v.id > 0)
              .map((version, _index) => {
              const isActive = activeKey === String(version.id);
              
              // Safety check for version data
              if (!version || !version.id || version.id <= 0) {
                console.error('Invalid version data:', version);
                return null;
              }
              
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
                      Version {version.versionCode}
                    </span>
                    <Space size={4}>
                      {version.isActive ? <Tag color="green">Active</Tag> : <Tag color="default">Inactive</Tag>}
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
                    {/* Set as Default Button */}
                    {isEditing && !version.isDefault && (
                      <div style={{ marginBottom: 16, textAlign: 'center' }}>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => handleSetDefault(version.id)}
                          style={{
                            backgroundColor: '#10b981',
                            borderColor: '#10b981',
                            borderRadius: 8,
                            fontWeight: 600,
                            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                          }}
                        >
                          Set as Default Version
                        </Button>
                      </div>
                    )}
                    
                    {/* Version Info Section */}
                    <div style={{ marginBottom: 32 }}>
                      <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', marginBottom: 16, letterSpacing: '-0.5px' }}>
                        📄 Version Information
                        {isEditing && (
                          <span style={{ fontSize: 16, color: '#f97316', marginLeft: 12, fontWeight: 600 }}>
                            (Editing Mode)
                          </span>
                        )}
                      </h3>
                      <Card>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                          <div>
                            <strong>Version Code:</strong> 
                            {isEditing ? (
                              <Input
                                value={editingVersionData[version.id]?.versionCode || version.versionCode || ''}
                                onChange={(e) => {
                                  console.log('Version Code changed:', e.target.value);
                                  handleVersionFieldChange(version.id, 'versionCode', e.target.value);
                                }}
                                style={{ marginTop: 4 }}
                                placeholder="Enter version code"
                                status={editingVersionData[version.id]?.versionCode !== version.versionCode ? 'warning' : undefined}
                              />
                            ) : (
                              <span style={{ marginLeft: 8 }}>{version.versionCode || 'N/A'}</span>
                            )}
                          </div>
                          <div>
                            <strong>Version Name:</strong> 
                            {isEditing ? (
                              <Input
                                value={editingVersionData[version.id]?.versionName || version.versionName || ''}
                                onChange={(e) => handleVersionFieldChange(version.id, 'versionName', e.target.value)}
                                style={{ marginTop: 4 }}
                                placeholder="Enter version name"
                                status={editingVersionData[version.id]?.versionName !== version.versionName ? 'warning' : undefined}
                              />
                            ) : (
                              <span style={{ marginLeft: 8 }}>{version.versionName || 'N/A'}</span>
                            )}
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <strong>Description:</strong> 
                            {isEditing ? (
                              <Input.TextArea
                                value={editingVersionData[version.id]?.description || version.description || ''}
                                onChange={(e) => handleVersionFieldChange(version.id, 'description', e.target.value)}
                                style={{ marginTop: 4 }}
                                rows={3}
                                placeholder="Enter version description"
                                status={editingVersionData[version.id]?.description !== version.description ? 'warning' : undefined}
                              />
                            ) : (
                              <span style={{ marginLeft: 8, whiteSpace: 'pre-line' }}>{version.description || 'N/A'}</span>
                            )}
                          </div>
                          <div>
                            <strong>Effective From:</strong> 
                            {isEditing ? (
                              <Input
                                type="date"
                                value={(() => {
                                  const dateValue = editingVersionData[version.id]?.effectiveFrom || version.effectiveFrom;
                                  if (typeof dateValue === 'string') {
                                    return dateValue.includes('T') ? dateValue.split('T')[0] : dateValue;
                                  }
                                  return '';
                                })()}
                                onChange={(e) => handleVersionFieldChange(version.id, 'effectiveFrom', e.target.value)}
                                style={{ marginTop: 4 }}
                                status={editingVersionData[version.id]?.effectiveFrom !== version.effectiveFrom ? 'warning' : undefined}
                              />
                            ) : (
                              <span style={{ marginLeft: 8 }}>
                                {version.effectiveFrom ? new Date(version.effectiveFrom).toLocaleDateString() : 'N/A'}
                              </span>
                            )}
                          </div>
                          <div>
                            <strong>Effective To:</strong> 
                            {isEditing ? (
                              <Input
                                type="date"
                                value={(() => {
                                  const dateValue = editingVersionData[version.id]?.effectiveTo || version.effectiveTo;
                                  if (typeof dateValue === 'string' && dateValue) {
                                    return dateValue.includes('T') ? dateValue.split('T')[0] : dateValue;
                                  }
                                  return '';
                                })()}
                                onChange={(e) => handleVersionFieldChange(version.id, 'effectiveTo', e.target.value || null)}
                                style={{ marginTop: 4 }}
                                placeholder="Optional end date"
                                status={editingVersionData[version.id]?.effectiveTo !== version.effectiveTo ? 'warning' : undefined}
                              />
                            ) : (
                              <span style={{ marginLeft: 8 }}>
                                {version.effectiveTo ? new Date(version.effectiveTo).toLocaleDateString() : 'No end date'}
                              </span>
                            )}
                          </div>
                          <div>
                            <strong>Status:</strong> 
                            <Space style={{ marginLeft: 8 }}>
                              {version.isActive ? <Tag color="green">Active</Tag> : <Tag color="default">Inactive</Tag>}
                              {version.isDefault && <Tag color="blue">Default</Tag>}
                            </Space>
                          </div>
                        </div>
                        
                        {/* Save/Cancel buttons when editing */}
                        {isEditing && (
                          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <Button onClick={() => handleCancelEditing()}>
                              Cancel
                            </Button>
                            <Button 
                              type="primary" 
                              onClick={() => {
                                console.log('Save button clicked for version:', version.id);
                                handleSaveVersion(version.id);
                              }}
                              loading={savingVersion[version.id]}
                              disabled={(() => {
                                const hasEditingData = editingVersionData[version.id];
                                const isEmpty = !hasEditingData || Object.keys(hasEditingData).length === 0;
                                console.log('Save button disabled check:', { versionId: version.id, hasEditingData, isEmpty });
                                return isEmpty;
                              })()}
                            >
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </Card>
                    </div>

                    {/* Prerequisite Subjects Section */}
                    <Card style={{ marginBottom: 32, backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', margin: 0, letterSpacing: '-0.5px' }}>
                          📚 Prerequisite Subjects
                        </h3>
                        <Space>
                          {isEditing && (
                            <Button type="primary" onClick={async () => { 
                              setEditingVersionId(version.id); 
                              setPrereqModalOpen(true);
                              // Refresh prerequisites when opening modal to ensure latest data
                              await fetchPrerequisitesForVersion(version.id);
                            }}>
                              Add Prerequisite
                            </Button>
                          )}
                        </Space>
                      </div>
                      {/* Prerequisite chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: '40px', alignItems: 'center' }}>
                        {(prereqMap[version.id] || []).length === 0 ? (
                          <Typography.Text type="secondary" style={{ fontStyle: 'italic' }}>No prerequisites added yet.</Typography.Text>
                        ) : (
                          (prereqMap[version.id] || []).map((prereq: any) => (
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
                              {isEditing && (
                                <Button
                                  type="text"
                                  size="small"
                                  danger
                                  style={{ marginLeft: 6, padding: 0, lineHeight: 1, color: '#ef4444' }}
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeletePrerequisite(version.id, prereq.prerequisite_subject_id)}
                                />
                              )}
                            </span>
                          ))
                        )}
                      </div>
                      {/* Add Prerequisite Modal */}
                      <AddPrerequisiteSubjectVersionModal
                        open={prereqModalOpen && editingVersionId === version.id}
                        onClose={() => {
                          setPrereqModalOpen(false);
                          // Refresh prerequisites when modal closes to ensure latest data
                          fetchPrerequisitesForVersion(version.id);
                        }}
                        onAdd={async (prereqVersionId) => {
                          try {
                            await addPrerequisiteToSubjectVersionMutation.mutateAsync({
                              subjectVersionId: version.id,
                              prerequisiteId: prereqVersionId
                            });
                            handleSuccess('Prerequisite added successfully!');
                            
                            // Refresh prerequisites to show the latest data
                            await fetchPrerequisitesForVersion(version.id);
                            
                            // Also refresh all prerequisites to ensure consistency
                            await fetchAllPrerequisites();
                          } catch (error) {
                            console.error('Failed to add prerequisite:', error);
                            handleError(error,'Failed to add prerequisite');
                          }
                        }}
                        currentSubjectVersionId={version.id}
                        existingPrerequisites={(prereqMap[version.id] || []).map((p: any) => p.prerequisite_subject_id)}
                      />
                    </Card>

                    {/* Assessment Table Section */}
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          
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
            }).filter(Boolean)}
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