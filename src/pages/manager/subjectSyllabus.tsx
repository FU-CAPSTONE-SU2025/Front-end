import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Typography,
  Spin
} from 'antd';
import { 
  EditOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router';
import styles from '../../css/manager/managerSyllabus.module.css';

import { useCRUDSyllabus, useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import { Syllabus,SyllabusAssessment, SyllabusMaterial, SyllabusOutcome, SyllabusSession, CreateSyllabusAssessment, CreateSyllabusMaterial, CreateSyllabusOutcome, CreateSyllabusSession } from '../../interfaces/ISchoolProgram';
import AssessmentTable from '../../components/staff/AssessmentTable';
import MaterialTable from '../../components/staff/MaterialTable';
import OutcomeTable from '../../components/staff/OutcomeTable';
import SessionTable from '../../components/staff/SessionTable';

import ApprovalModal from '../../components/manager/approvalModal';
import { useApprovalActions } from '../../hooks/useApprovalActions';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

const { Title } = Typography;

const ManagerSubjectSyllabus: React.FC = () => {
  const navigate = useNavigate();
  const idParams = useParams();
  const { subjectId,syllabusId } = idParams;

  // Syllabus API hooks
  const {
    fetchSyllabusBySubjectVersionMutation,
    addSyllabusMutation,
    addSyllabusAssessmentMutation,
    addSyllabusMaterialMutation,
    addSyllabusOutcomeMutation,
    addSyllabusSessionMutation,
    addSyllabusOutcomesToSessionMutation,
  } = useCRUDSyllabus();

  const { getSubjectById } = useCRUDSubject();
  const [subject, setSubject] = useState<any | null>(null);

  // Approval hook
  const { handleApproval, isApproving } = useApprovalActions();
  const { handleError, handleSuccess } = useApiErrorHandler();

  // State for syllabus data
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    if (!subjectId) return;
    // Fetch subject data
    const fetchSubject = async () => {
      try {
        const subjectData = await getSubjectById.mutateAsync(Number(subjectId));
        setSubject(subjectData);
      } catch (error) {
        setSubject(null);
      }
    };
    fetchSubject();
  }, [subjectId]);

  useEffect(() => {
    if (!subjectId || syllabusId || subject === undefined) return;
    if (subject === null) return; // Wait for subject fetch
    const fetchOrCreateSyllabus = async () => {
      setLoading(true);
      try {
        // Try to fetch syllabus for this subject
        const result = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));

        if(result === null){
            // Check for 404 error (syllabus not found)
          const content = subject ? `${subject.subjectCode} - ${subject.subjectName}'s syllabus` : `Syllabus for subject ${subjectId}`;
            await addSyllabusMutation.mutateAsync({ subjectVersionId: Number(subjectId), content });
            // Refetch syllabus after creation
            const newResult = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));
            setSyllabus(Array.isArray(newResult) ? newResult[0] : newResult);
        }else{
          setSyllabus(Array.isArray(result) ? result[0] : result);
        }
      } catch (error: any) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateSyllabus();
  }, [subjectId, syllabusId]);

  const handleSaveSyllabus = async () => {
    if (!syllabus) return;
    
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      handleSuccess('Syllabus saved successfully');
      setIsEditing(false);
    } catch (error) {

      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssessment = async (assessment: CreateSyllabusAssessment) => {
    if (!syllabus) return;
    try {
      await addSyllabusAssessmentMutation.mutateAsync({
        ...assessment,
        syllabusId: syllabus.id
      });
    
      // Refetch syllabus to update UI
      const updated = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      console.error('Error adding assessment:', error);
      throw error;
    }
  };

  const handleAddMaterial = async (material: CreateSyllabusMaterial) => {
    if (!syllabus) return;
    try {

      await addSyllabusMaterialMutation.mutateAsync({
        ...material,
        syllabusId: syllabus.id
      });

      const updated = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      console.error('Error adding material:', error);
      throw error;
    }
  };

  const handleAddOutcome = async (outcome: CreateSyllabusOutcome) => {
    if (!syllabus) return;
    try {

      await addSyllabusOutcomeMutation.mutateAsync({
        ...outcome,
        syllabusId: syllabus.id
      });
    
      const updated = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      console.error('Error adding outcome:', error);
      throw error;
    }
  };

  const handleAddSession = async (session: CreateSyllabusSession) => {
    if (!syllabus) return;
    try {
  
      await addSyllabusSessionMutation.mutateAsync({
        ...session,
        syllabusId: syllabus.id
      });
  
      const updated = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  };

  const handleDeleteItem = async (type: string, id: number) => {
    try {
      // TODO: Implement delete mutations
      handleSuccess(`${type} deleted successfully`);
      // Refetch syllabus to update UI
      const updated = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
  
      handleError(error);
    }
  };

  const handleUpdateAssessment = async (id: number, assessment: Partial<SyllabusAssessment>) => {
    try {
      // TODO: Implement update mutation
      handleSuccess('Assessment updated successfully');
      const updated = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {

      handleError(error);
    }
  };

  const handleUpdateMaterial = async (id: number, material: Partial<SyllabusMaterial>) => {
    try {
      // TODO: Implement update mutation
      handleSuccess('Material updated successfully');
      const updated = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
 
      handleError(error);
    }
  };

  const handleUpdateOutcome = async (id: number, outcome: Partial<SyllabusOutcome>) => {
    try {
      // TODO: Implement update mutation
      handleSuccess('Outcome updated successfully');
      const updated = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      handleError(error);
    }
  };

  const handleUpdateSession = async (id: number, session: Partial<SyllabusSession>) => {
    try {
      // TODO: Implement update mutation
      handleSuccess('Session updated successfully');
      const updated = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      handleError(error);
    }
  };

  const handleAddOutcomeToSession = async (sessionId: number, outcomeId: number) => {
    try {
      // TODO: Implement add outcome to session mutation
      handleSuccess('Outcome added to session successfully');
      const updated = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      handleError(error);
    }
  };

  const handleApprove = () => {
    setApprovalModalVisible(true);
  };

  const handleApprovalConfirm = async (approvalStatus: number, rejectionReason?: string) => {
    if (!syllabus) return;
    
    try {
      await handleApproval('syllabus', syllabus.id, approvalStatus, rejectionReason);
      if (approvalStatus === 2) {
        setApprovalStatus('approved');
      }
      setApprovalModalVisible(false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  if (loading || !syllabus || !subject) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Spin size="large" tip="Loading syllabus..." />
      </div>
    );
  }

  return (
    <div className={styles.syllabusContainer}>
      {/* Header */}
      <div className={styles.syllabusHeader}>
        <div className={styles.syllabusHeaderLeft}>
          <button className={styles.backButton} onClick={() => navigate('/manager/subject')}>
            <ArrowLeftOutlined /> Back to Subjects
          </button>
          <div className={styles.syllabusTitleCard}>
            <h2 className={styles.syllabusTitle}>
              {subject ? `${subject.subjectCode} - ${subject.subjectName}` : 'Syllabus'}
            </h2>
            <p className={styles.syllabusSubtitle}>
              Course Syllabus & Learning Management
            </p>
          </div>
          <div className={styles.syllabusHeaderRight}>
            <Button 
              type={approvalStatus === 'approved' ? 'default' : 'primary'}
              icon={<CheckOutlined />}
              disabled={approvalStatus === 'approved'}
              onClick={handleApprove}
              style={{ marginRight: 8 }}
            >
              {approvalStatus === 'approved' ? 'Approved' : 'Approve Syllabus'}
            </Button>
            {isEditing ? (
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSaveSyllabus}
                loading={loading}
                className={styles.saveButton}
              >
                Save Syllabus
              </Button>
            ) : (
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => setIsEditing(true)}
                className={styles.editButton}
              >
                Edit Syllabus
              </Button>
            )}
          </div>
        </div>

      </div>

      {/* Syllabus Content */}
      <div className={styles.syllabusContent}>
        {/* Syllabus Content Section */}
        {/* Assessments Section */}
        <AssessmentTable
          assessments={syllabus.assessments}
          isEditing={isEditing}
          onAddAssessment={handleAddAssessment}
          onUpdateAssessment={handleUpdateAssessment}
          onDeleteAssessment={(id: number) => handleDeleteItem('Assessment', id)}
        />

        {/* Learning Materials Section */}
        <MaterialTable
          materials={syllabus.learningMaterials}
          isEditing={isEditing}
          onAddMaterial={handleAddMaterial}
          onUpdateMaterial={handleUpdateMaterial}
          onDeleteMaterial={(id: number) => handleDeleteItem('Material', id)}
        />

        {/* Learning Outcomes Section */}
        <OutcomeTable
          outcomes={syllabus.learningOutcomes}
          isEditing={isEditing}
          onAddOutcome={handleAddOutcome}
          onUpdateOutcome={handleUpdateOutcome}
          onDeleteOutcome={(id: number) => handleDeleteItem('Outcome', id)}
        />

        {/* Sessions Section */}
        <SessionTable
          sessions={syllabus.sessions}
          outcomes={syllabus.learningOutcomes}
          isEditing={isEditing}
          onAddSession={handleAddSession}
          onUpdateSession={handleUpdateSession}
          onDeleteSession={(id: number) => handleDeleteItem('Session', id)}
          onAddOutcomeToSession={handleAddOutcomeToSession}
        />
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        visible={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false);
        }}
        onConfirm={handleApprovalConfirm}
        type="syllabus"
        itemId={syllabus?.id || 0}
        itemName={subject ? `${subject.subjectCode} - ${subject.subjectName}` : 'Syllabus'}
        loading={isApproving}
      />
    </div>
  );
};

export default ManagerSubjectSyllabus; 