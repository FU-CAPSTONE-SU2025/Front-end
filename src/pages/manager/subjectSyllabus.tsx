import React, { useState, useEffect } from 'react';
import { 
  Button, 
  message,
  Typography,
  Card,
  Spin
} from 'antd';
import { 
  EditOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router';
import styles from '../../css/staff/staffEditSyllabus.module.css';

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
      {/* Header with back button and title */}
      <div className={styles.syllabusHeader}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/manager/subject')}
          className={styles.backButton}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            marginBottom: '1rem'
          }}
        >
          Back to Subjects
        </Button>
        
        <Title level={3} className={styles.syllabusTitle}>
          Syllabus for {subject.subjectCode} - {subject.subjectName}
        </Title>

        {/* Sticky Edit Button */}
        <div className={styles.editButtonContainer}>
          {!isEditing ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600'
              }}
            >
              Edit Syllabus
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveSyllabus}
              loading={loading}
              className={styles.saveButton}
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600'
              }}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Syllabus Content */}
      <div className={styles.syllabusContent}>
        <Card 
          title="Syllabus Content" 
          className={styles.contentCard}
          headStyle={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            borderBottom: 'none'
          }}
        >
          <div className={styles.contentText}>
            {syllabus.content}
          </div>
        </Card>

        {/* Assessments Section */}
        <Card 
          title={
            <div className={styles.cardTitle}>
              📊 Assessments ({syllabus.assessments.length})
            </div>
          } 
          className={styles.assessmentsCard}
          headStyle={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            borderBottom: 'none'
          }}
        >
          <AssessmentTable
            assessments={syllabus.assessments}
            isEditing={isEditing}
            onAdd={handleAddAssessment}
            onUpdate={handleUpdateAssessment}
            onDelete={(id) => handleDeleteItem('Assessment', id)}
          />
        </Card>

        {/* Learning Materials Section */}
        <Card 
          title={
            <div className={styles.cardTitle}>
              📚 Learning Materials ({syllabus.learningMaterials.length})
            </div>
          } 
          className={styles.materialsCard}
          headStyle={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            borderBottom: 'none'
          }}
        >
          <MaterialTable
            materials={syllabus.learningMaterials}
            isEditing={isEditing}
            onAdd={handleAddMaterial}
            onUpdate={handleUpdateMaterial}
            onDelete={(id) => handleDeleteItem('Material', id)}
          />
        </Card>

        {/* Learning Outcomes Section */}
        <Card 
          title={
            <div className={styles.cardTitle}>
              🎯 Learning Outcomes ({syllabus.learningOutcomes.length})
            </div>
          } 
          className={styles.outcomesCard}
          headStyle={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            borderBottom: 'none'
          }}
        >
          <OutcomeTable
            outcomes={syllabus.learningOutcomes}
            isEditing={isEditing}
            onAdd={handleAddOutcome}
            onUpdate={handleUpdateOutcome}
            onDelete={(id) => handleDeleteItem('Outcome', id)}
          />
        </Card>

        {/* Sessions Section */}
        <Card 
          title={
            <div className={styles.cardTitle}>
              📅 Sessions ({syllabus.sessions.length})
            </div>
          } 
          className={styles.sessionsCard}
          headStyle={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            borderBottom: 'none'
          }}
        >
          <SessionTable
            sessions={syllabus.sessions}
            outcomes={syllabus.learningOutcomes}
            isEditing={isEditing}
            onAdd={handleAddSession}
            onUpdate={handleUpdateSession}
            onDelete={(id) => handleDeleteItem('Session', id)}
            onAddOutcomeToSession={handleAddOutcomeToSession}
          />
        </Card>
      </div>
    </div>
  );
};

export default ManagerSubjectSyllabus; 