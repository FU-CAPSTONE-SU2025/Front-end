import React, { useState, useEffect } from 'react';
import { 
  Button, 
  message
} from 'antd';
import { 
  EditOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router';
import styles from '../../css/staff/staffEditSyllabus.module.css';

import { subjects } from '../../data/schoolData';
import { useCRUDSyllabus } from '../../hooks/useCRUDSchoolMaterial';
import { SyllabusAssessment, SyllabusMaterial, SyllabusOutcome, SyllabusSession, CreateSyllabusAssessment, CreateSyllabusMaterial, CreateSyllabusOutcome, CreateSyllabusSession } from '../../interfaces/ISchoolProgram';
import AssessmentTable from '../../components/staff/AssessmentTable';
import MaterialTable from '../../components/staff/MaterialTable';
import OutcomeTable from '../../components/staff/OutcomeTable';
import SessionTable from '../../components/staff/SessionTable';

const SubjectSyllabus: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = useParams();
  const { subjectId } = searchParams;

  // Syllabus API hooks
  const {
    fetchSyllabusBySubjectMutation,
    addSyllabusMutation,
    addSyllabusAssessmentMutation,
    addSyllabusMaterialMutation,
    addSyllabusOutcomeMutation,
    addSyllabusSessionMutation,
    addSyllabusOutcomesToSessionMutation,
    // Other mutations will be used in further steps
  } = useCRUDSyllabus();

  // State for syllabus data
  const [syllabus, setSyllabus] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get subject information
  const subject = subjects.find(s => s.id === Number(subjectId));

  useEffect(() => {
    if (!subjectId || !subject) return;
    const fetchOrCreateSyllabus = async () => {
      setLoading(true);
      try {
        // Try to fetch syllabus for this subject
        const result = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
        if (!result || (Array.isArray(result) && result.length === 0)) {
          // No syllabus found, create one
          const content = `${subject.subjectCode} - ${subject.subjectName}'s syllabus`;
          const newSyllabus = await addSyllabusMutation.mutateAsync({
            subjectId: subject.id,
            content,
          });
          setSyllabus(newSyllabus);
        } else {
          // Syllabus found
          setSyllabus(Array.isArray(result) ? result[0] : result);
        }
      } catch (error) {
        message.error('Failed to load or create syllabus');
      } finally {
        setLoading(false);
      }
    };
    fetchOrCreateSyllabus();
  }, [subjectId, subject]);

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
      await addSyllabusAssessmentMutation.mutateAsync({
        ...assessment,
        syllabusId: syllabus.id
      });
      // Refetch syllabus to update UI
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
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
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
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
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
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
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
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
      await addSyllabusOutcomesToSessionMutation.mutateAsync({
        sessionId,
        outcomeId
      });
      // Refetch syllabus to update UI
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
    } catch (error) {
      throw error;
    }
  };

  if (!subject) {
    return <div>Subject not found</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.syllabusContainer}>
      {/* Header */}
      <div className={styles.syllabusHeader}>
        <div className={styles.syllabusHeaderLeft}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            className={styles.backButton}
          >
            Back
          </Button>
          <div className={styles.syllabusTitle}>
            <h1>{subject.subjectCode} - {subject.subjectName}</h1>
            <p>Syllabus Management</p>
          </div>
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

      {/* Syllabus Content */}
      <div className={styles.syllabusContent}>
        {/* Assessment Table */}
        <AssessmentTable
          assessments={syllabus?.assessments || []}
          isEditing={isEditing}
          onAddAssessment={handleAddAssessment}
          onDeleteAssessment={(id) => handleDeleteItem('assessment', id)}
          onUpdateAssessment={handleUpdateAssessment}
        />

        {/* Material Table */}
        <MaterialTable
          materials={syllabus?.learningMaterials || []}
          isEditing={isEditing}
          onAddMaterial={handleAddMaterial}
          onDeleteMaterial={(id) => handleDeleteItem('material', id)}
          onUpdateMaterial={handleUpdateMaterial}
        />

        {/* Outcome Table */}
        <OutcomeTable
          outcomes={syllabus?.learningOutcomes || []}
          isEditing={isEditing}
          onAddOutcome={handleAddOutcome}
          onDeleteOutcome={(id) => handleDeleteItem('outcome', id)}
          onUpdateOutcome={handleUpdateOutcome}
        />

        {/* Session Table */}
        <SessionTable
          sessions={syllabus?.sessions || []}
          outcomes={syllabus?.learningOutcomes || []}
          isEditing={isEditing}
          onAddSession={handleAddSession}
          onDeleteSession={(id) => handleDeleteItem('session', id)}
          onUpdateSession={handleUpdateSession}
          onAddOutcomeToSession={handleAddOutcomeToSession}
        />
      </div>
    </div>
  );
};

export default SubjectSyllabus;