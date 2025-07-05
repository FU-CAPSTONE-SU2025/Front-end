import React, { useState, useEffect } from 'react';
import { 
  Button, 
  message,
  Typography,
  Spin
} from 'antd';
import { 
  EditOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router';
import styles from '../../css/manager/managerSyllabus.module.css';

import { useCRUDSyllabus, useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import { Syllabus,SyllabusAssessment, SyllabusMaterial, SyllabusOutcome, SyllabusSession, CreateSyllabusAssessment, CreateSyllabusMaterial, CreateSyllabusOutcome, CreateSyllabusSession } from '../../interfaces/ISchoolProgram';
import AssessmentTable from '../../components/staff/AssessmentTable';
import MaterialTable from '../../components/staff/MaterialTable';
import OutcomeTable from '../../components/staff/OutcomeTable';
import SessionTable from '../../components/staff/SessionTable';

const { Title } = Typography;

const ManagerSubjectSyllabus: React.FC = () => {
  const navigate = useNavigate();
  const idParams = useParams();
  const { subjectId,syllabusId } = idParams;

  // Syllabus API hooks
  const {
    fetchSyllabusBySubjectMutation,
    addSyllabusMutation,
    addSyllabusAssessmentMutation,
    addSyllabusMaterialMutation,
    addSyllabusOutcomeMutation,
    addSyllabusSessionMutation,
    addSyllabusOutcomesToSessionMutation,
  } = useCRUDSyllabus();

  const { getSubjectById } = useCRUDSubject();
  const [subject, setSubject] = useState<any | null>(null);

  // State for syllabus data
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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
        const result = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
        console.log(result);
        if(result === null){
            // Check for 404 error (syllabus not found)
            console.log("create a syllabus");
          const content = subject ? `${subject.subjectCode} - ${subject.subjectName}'s syllabus` : `Syllabus for subject ${subjectId}`;
            await addSyllabusMutation.mutateAsync({ subjectId: Number(subjectId), content });
            // Refetch syllabus after creation
            const newResult = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
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
  }, [subjectId, syllabusId, subject]);

  const handleSaveSyllabus = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      message.success('Syllabus saved successfully');
      setIsEditing(false);
    } catch (error) {
      message.error('Failed to save syllabus');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssessment = async (assessment: CreateSyllabusAssessment) => {
    if (!syllabus) return;
    try {
      console.log('Adding assessment:', assessment);
      await addSyllabusAssessmentMutation.mutateAsync({
        ...assessment,
        syllabusId: syllabus.id
      });
      console.log('Assessment added successfully');
      // Refetch syllabus to update UI
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      console.error('Error adding assessment:', error);
      throw error;
    }
  };

  const handleAddMaterial = async (material: CreateSyllabusMaterial) => {
    if (!syllabus) return;
    try {
      console.log('Adding material:', material);
      await addSyllabusMaterialMutation.mutateAsync({
        ...material,
        syllabusId: syllabus.id
      });
      console.log('Material added successfully');
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      console.error('Error adding material:', error);
      throw error;
    }
  };

  const handleAddOutcome = async (outcome: CreateSyllabusOutcome) => {
    if (!syllabus) return;
    try {
      console.log('Adding outcome:', outcome);
      await addSyllabusOutcomeMutation.mutateAsync({
        ...outcome,
        syllabusId: syllabus.id
      });
      console.log('Outcome added successfully');
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      console.error('Error adding outcome:', error);
      throw error;
    }
  };

  const handleAddSession = async (session: CreateSyllabusSession) => {
    if (!syllabus) return;
    try {
      console.log('Adding session:', session);
      await addSyllabusSessionMutation.mutateAsync({
        ...session,
        syllabusId: syllabus.id
      });
      console.log('Session added successfully');
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  };

  const handleDeleteItem = async (type: string, id: number) => {
    try {
      // TODO: Implement delete mutations
      message.success(`${type} deleted successfully`);
      // Refetch syllabus to update UI
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      message.error(`Failed to delete ${type}`);
    }
  };

  const handleUpdateAssessment = async (id: number, assessment: Partial<SyllabusAssessment>) => {
    try {
      // TODO: Implement update mutation
      message.success('Assessment updated successfully');
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      message.error('Failed to update assessment');
    }
  };

  const handleUpdateMaterial = async (id: number, material: Partial<SyllabusMaterial>) => {
    try {
      // TODO: Implement update mutation
      message.success('Material updated successfully');
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      message.error('Failed to update material');
    }
  };

  const handleUpdateOutcome = async (id: number, outcome: Partial<SyllabusOutcome>) => {
    try {
      // TODO: Implement update mutation
      message.success('Outcome updated successfully');
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      message.error('Failed to update outcome');
    }
  };

  const handleUpdateSession = async (id: number, session: Partial<SyllabusSession>) => {
    try {
      // TODO: Implement update mutation
      message.success('Session updated successfully');
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      message.error('Failed to update session');
    }
  };

  const handleAddOutcomeToSession = async (sessionId: number, outcomeId: number) => {
    try {
      await addSyllabusOutcomesToSessionMutation.mutateAsync({ sessionId, outcomeId });
      message.success('Outcome added to session successfully');
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      message.error('Failed to add outcome to session');
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
    </div>
  );
};

export default ManagerSubjectSyllabus; 