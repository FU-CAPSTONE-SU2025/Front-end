import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Tabs, Typography, Card, Tag, Space, Popconfirm, Tooltip } from 'antd';
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
import { generateDefaultVersionData, generateDefaultSyllabusData } from '../../data/mockData';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import AddPrerequisiteSubjectVersionModal from '../../components/staff/AddPrerequisiteSubjectVersionModal';
import BulkDataImport from '../../components/common/bulkDataImport';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';

// Function to create default version for a subject (moved outside component)
const createDefaultVersion = async (
  subjectData: any, 
  addSubjectVersionMutation: any,
  handleSuccess: (message: string) => void,
  handleError: (error: any, title?: string) => void
): Promise<SubjectVersion[]> => {
  try {
    // Check if subject is approved before creating version
    if (subjectData.approvalStatus !== 1) {
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
    const errorMessage = getUserFriendlyErrorMessage(err);
    handleError('Failed to create default version: ' + errorMessage);
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
    const errorMessage = getUserFriendlyErrorMessage(err);
    handleError('Failed to create default syllabus: ' + errorMessage);
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

  // Function to fetch prerequisites for a specific version
  const fetchPrerequisitesForVersion = useCallback(async (versionId: number) => {
    setPrereqLoading(prev => ({ ...prev, [versionId]: true }));
    try {
      // Add timeout protection
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
        if (subjectData.approvalStatus !== 1) {
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
          // No versions exist, automatically create default version
          showInfo('No versions found. Automatically creating default version and syllabus...');
          
          try {
            const defaultVersions = await createDefaultVersion(subjectData, addSubjectVersionMutation, handleSuccess, handleError);
            // Ensure defaultVersions is an array
            const versionsToSet = Array.isArray(defaultVersions) ? defaultVersions : [];
            
            if (versionsToSet.length > 0) {
              setSubjectVersions(versionsToSet);
              setActiveKey(String(versionsToSet[0].id));
              
              // Wait a moment before creating syllabus to ensure version is fully created
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Automatically create syllabus for the first version
              await fetchOrCreateSyllabus(versionsToSet[0].id, subjectData);
              
              // Wait before fetching prerequisites
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Fetch prerequisites for the first version
              try {
                await fetchPrerequisitesForVersion(versionsToSet[0].id);
              } catch (error) {
                console.error('Failed to fetch prerequisites for default version:', error);
              }
            } else {
              handleError('Failed to create default version');
            }
          } catch (error) {
            console.error('Error creating default version:', error);
            handleError('Failed to create default version. Please try again.');
          }
        } else {
          // Versions exist, use them
          const finalVersionsData = Array.isArray(versionsData) ? versionsData : [];
          setSubjectVersions(finalVersionsData);
          if (finalVersionsData.length > 0) {
            setActiveKey(String(finalVersionsData[0].id));
            
            // Fetch syllabus for the first version
            await fetchOrCreateSyllabus(finalVersionsData[0].id, subjectData);
            
            // Fetch prerequisites for all versions - with error handling
            try {
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
      handleError('Failed to add version: ' + err.message);
    } finally {
      setAdding(false);
    }
  }, [addSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId, fetchPrerequisitesForVersion, handleSuccess, handleError]);

  // Handler to delete a version
  const handleDeleteVersion = useCallback(async (versionId: number) => {
    try {
      await deleteSubjectVersionMutation.mutateAsync(versionId);
      handleSuccess('Version deleted successfully!');
      
      // Refresh versions list
      const updatedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (updatedVersions) {
        setSubjectVersions(updatedVersions);
        if (updatedVersions.length > 0 && activeKey === String(versionId)) {
          setActiveKey(String(updatedVersions[0].id));
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
      
      // Refresh versions list
      const updatedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (updatedVersions) {
        setSubjectVersions(updatedVersions);
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
      
      // Refresh versions list
      const updatedVersions = await getSubjectVersionsBySubjectId.mutateAsync(Number(subjectId));
      if (updatedVersions) {
        setSubjectVersions(updatedVersions);
      }
    } catch (err: any) {
      handleError('Failed to set version as default: ' + err.message);
    }
  }, [setDefaultSubjectVersionMutation, getSubjectVersionsBySubjectId, subjectId, handleSuccess, handleError]);

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
      handleError('Failed to add outcome');
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
      handleError('Failed to delete outcome');
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
      handleError('Failed to update outcome');
    }
  };

  // Handlers for SessionTable
  const handleAddSession = async (versionId: number, session: any): Promise<void> => {
    try {
      const syllabus = syllabusMap[versionId];
      if (!syllabus) {
        handleError('Syllabus not found for this version');
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
      handleError('Failed to add session');
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
      handleError('Failed to delete session');
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
      handleError('Failed to update session');
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
      handleError('Failed to add outcome to session');
    }
  };

  const handleRemoveOutcomeFromSession = async (versionId: number, sessionId: number, outcomeId: number): Promise<void> => {
    try {
      await removeOutcomeFromSessionMutation.mutateAsync({
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
      
      handleSuccess('Outcome removed from session successfully!');
    } catch (error) {
      console.error('Error removing outcome from session:', error);
      handleError('Failed to remove outcome from session');
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
      handleError('Failed to copy prerequisites');
    }
  };

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

  if (!Array.isArray(subjectVersions) || subjectVersions.length === 0) {
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
            activeKey={activeKey || (Array.isArray(subjectVersions) && subjectVersions.length > 0 ? String(subjectVersions[0].id) : '')}
            onChange={handleTabChange}
            type="card"
            tabBarStyle={{ background: 'transparent', borderRadius: 12, boxShadow: 'none', display: 'flex', justifyContent: 'center' }}
            items={(Array.isArray(subjectVersions) ? subjectVersions : [])
              .filter(version => version && typeof version.id !== 'undefined')
              .map((version, index) => {
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
                            handleError('Failed to add prerequisite');
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