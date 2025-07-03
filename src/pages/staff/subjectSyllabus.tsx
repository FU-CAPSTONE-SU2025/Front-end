import React, { useState, useEffect } from 'react';
import { 
  Input, 
  Select, 
  Button, 
  Table, 
  DatePicker, 
  InputNumber,
  message,
  Modal,
  Form
} from 'antd';
import { 
  BookOutlined, 
  FileTextOutlined, 
  TagOutlined, 
  ScheduleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router';
import styles from '../../css/staff/staffEditSyllabus.module.css';
import dayjs from 'dayjs';

import { subjects } from '../../data/schoolData';
import { useCRUDSyllabus } from '../../hooks/useCRUDSchoolMaterial';
import { SyllabusAssessment, SyllabusMaterial, SyllabusOutcome, SyllabusSession, CreateSyllabusAssessment, CreateSyllabusMaterial, CreateSyllabusOutcome, CreateSyllabusSession } from '../../interfaces/ISchoolProgram';
import DataImport from '../../components/common/dataImport';
import { getHeaderConfig } from '../../data/importConfigurations';

const { Option } = Select;
const { TextArea } = Input;

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
  
  // Form states for each section
  const [assessmentForm] = Form.useForm();
  const [materialForm] = Form.useForm();
  const [outcomeForm] = Form.useForm();
  const [sessionForm] = Form.useForm();
  
  // Modal states
  const [assessmentModalVisible, setAssessmentModalVisible] = useState(false);
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const [outcomeModalVisible, setOutcomeModalVisible] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  
  // Inline edit state for each section
  const [editingAssessmentId, setEditingAssessmentId] = useState<number | null>(null);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [editingOutcomeId, setEditingOutcomeId] = useState<number | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  // Temp state for editing
  const [assessmentEdit, setAssessmentEdit] = useState<Partial<SyllabusAssessment>>({});
  const [materialEdit, setMaterialEdit] = useState<Partial<SyllabusMaterial>>({});
  const [outcomeEdit, setOutcomeEdit] = useState<Partial<SyllabusOutcome>>({});
  const [sessionEdit, setSessionEdit] = useState<Partial<SyllabusSession>>({});

  // State for Add Outcomes to Session modal
  const [addOutcomeModalVisible, setAddOutcomeModalVisible] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<number | null>(null);

  // State for Excel import modals
  const [assessmentImportVisible, setAssessmentImportVisible] = useState(false);
  const [materialImportVisible, setMaterialImportVisible] = useState(false);
  const [outcomeImportVisible, setOutcomeImportVisible] = useState(false);
  const [sessionImportVisible, setSessionImportVisible] = useState(false);

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

  const handleAddAssessment = async (values: any) => {
    if (!syllabus) return;
    try {
      await addSyllabusAssessmentMutation.mutateAsync({
        syllabusId: syllabus.id,
        ...values
      });
      // Refetch syllabus to update UI
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
      setAssessmentModalVisible(false);
      assessmentForm.resetFields();
      message.success('Assessment added successfully');
    } catch (error) {
      message.error('Failed to add assessment');
    }
  };

  const handleAddMaterial = async (values: any) => {
    if (!syllabus) return;
    try {
      await addSyllabusMaterialMutation.mutateAsync({
        syllabusId: syllabus.id,
        ...values
      });
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
      setMaterialModalVisible(false);
      materialForm.resetFields();
      message.success('Learning material added successfully');
    } catch (error) {
      message.error('Failed to add learning material');
    }
  };

  const handleAddOutcome = async (values: any) => {
    if (!syllabus) return;
    try {
      await addSyllabusOutcomeMutation.mutateAsync({
        syllabusId: syllabus.id,
        ...values
      });
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
      setOutcomeModalVisible(false);
      outcomeForm.resetFields();
      message.success('Learning outcome added successfully');
    } catch (error) {
      message.error('Failed to add learning outcome');
    }
  };

  const handleAddSession = async (values: any) => {
    if (!syllabus) return;
    try {
      await addSyllabusSessionMutation.mutateAsync({
        syllabusId: syllabus.id,
        ...values
      });
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
      setSessionModalVisible(false);
      sessionForm.resetFields();
      message.success('Session added successfully');
    } catch (error) {
      message.error('Failed to add session');
    }
  };

  const handleDeleteItem = (type: string, id: number) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete this ${type}?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        setSyllabus((prev: any) => {
          if (!prev) return null;
          
          switch (type) {
            case 'assessment':
              return { ...prev, assessments: prev.assessments.filter((a: any) => a.id !== id) };
            case 'material':
              return { ...prev, learningMaterials: prev.learningMaterials.filter((m: any) => m.id !== id) };
            case 'outcome':
              return { ...prev, learningOutcomes: prev.learningOutcomes.filter((o: any) => o.id !== id) };
            case 'session':
              return { ...prev, sessions: prev.sessions.filter((s: any) => s.id !== id) };
            default:
              return prev;
          }
        });
        message.success(`${type} deleted successfully`);
      }
    });
  };

  // Inline edit handlers
  const startEditAssessment = (record: SyllabusAssessment) => {
    setEditingAssessmentId(record.id);
    setAssessmentEdit(record);
  };
  const saveEditAssessment = () => {
    setSyllabus((prev: any) => prev ? {
      ...prev,
      assessments: prev.assessments.map((a: SyllabusAssessment) => a.id === editingAssessmentId ? { ...a, ...assessmentEdit } : a)
    } : null);
    setEditingAssessmentId(null);
    setAssessmentEdit({});
  };
  const cancelEditAssessment = () => {
    setEditingAssessmentId(null);
    setAssessmentEdit({});
  };

  const startEditMaterial = (record: SyllabusMaterial) => {
    setEditingMaterialId(record.id);
    setMaterialEdit(record);
  };
  const saveEditMaterial = () => {
    setSyllabus((prev:any) => prev ? {
      ...prev,
      learningMaterials: prev.learningMaterials.map((m: SyllabusMaterial) => m.id === editingMaterialId ? { ...m, ...materialEdit } : m)
    } : null);
    setEditingMaterialId(null);
    setMaterialEdit({});
  };
  const cancelEditMaterial = () => {
    setEditingMaterialId(null);
    setMaterialEdit({});
  };

  const startEditOutcome = (record: SyllabusOutcome) => {
    setEditingOutcomeId(record.id);
    setOutcomeEdit(record);
  };
  const saveEditOutcome = () => {
    setSyllabus((prev: any) => prev ? {
      ...prev,
      learningOutcomes: prev.learningOutcomes.map((o: SyllabusOutcome) => o.id === editingOutcomeId ? { ...o, ...outcomeEdit } : o)
    } : null);
    setEditingOutcomeId(null);
    setOutcomeEdit({});
  };
  const cancelEditOutcome = () => {
    setEditingOutcomeId(null);
    setOutcomeEdit({});
  };

  const startEditSession = (record: SyllabusSession) => {
    setEditingSessionId(record.id);
    setSessionEdit(record);
  };
  const saveEditSession = () => {
    setSyllabus((prev: any) => prev ? {
      ...prev,
      sessions: prev.sessions.map((s: SyllabusSession) => s.id === editingSessionId ? { ...s, ...sessionEdit } : s)
    } : null);
    setEditingSessionId(null);
    setSessionEdit({});
  };
  const cancelEditSession = () => {
    setEditingSessionId(null);
    setSessionEdit({});
  };

  // Handler to open Add Outcomes modal
  const openAddOutcomeModal = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setSelectedOutcomeId(null);
    setAddOutcomeModalVisible(true);
  };

  // Handler to add outcome to session
  const handleAddOutcomeToSession = async () => {
    if (!selectedSessionId || !selectedOutcomeId) return;
    try {
      await addSyllabusOutcomesToSessionMutation.mutateAsync({
        sessionId: selectedSessionId,
        outcomeId: selectedOutcomeId
      });
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
      setAddOutcomeModalVisible(false);
      setSelectedSessionId(null);
      setSelectedOutcomeId(null);
      message.success('Outcome added to session successfully');
    } catch (error) {
      message.error('Failed to add outcome to session');
    }
  };

  // Handler for imported assessment data
  const handleAssessmentDataImported = async (data: { [key: string]: string }[]) => {
    if (!syllabus) return;
    try {
      for (const row of data) {
        const payload: CreateSyllabusAssessment = {
          syllabusId: syllabus.id,
          category: row.category,
          quantity: Number(row.quantity),
          weight: Number(row.weight),
          completionCriteria: row.completionCriteria,
          duration: Number(row.duration),
          questionType: row.questionType
        };
        await addSyllabusAssessmentMutation.mutateAsync(payload);
      }
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
      message.success(`Imported ${data.length} assessments successfully`);
    } catch (error) {
      message.error('Failed to import some or all assessments');
    } finally {
      setAssessmentImportVisible(false);
    }
  };

  // Handler for imported material data
  const handleMaterialDataImported = async (data: { [key: string]: string }[]) => {
    if (!syllabus) return;
    try {
      for (const row of data) {
        const payload: CreateSyllabusMaterial = {
          syllabusId: syllabus.id,
          materialName: row.materialName,
          authorName: row.authorName,
          publishedDate: row.publishedDate ? new Date(row.publishedDate) : new Date(),
          description: row.description,
          filepathOrUrl: row.filepathOrUrl
        };
        await addSyllabusMaterialMutation.mutateAsync(payload);
      }
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
      message.success(`Imported ${data.length} materials successfully`);
    } catch (error) {
      message.error('Failed to import some or all materials');
    } finally {
      setMaterialImportVisible(false);
    }
  };
  // Handler for imported outcome data
  const handleOutcomeDataImported = async (data: { [key: string]: string }[]) => {
    if (!syllabus) return;
    try {
      for (const row of data) {
        const payload: CreateSyllabusOutcome = {
          syllabusId: syllabus.id,
          outcomeCode: row.outcomeCode,
          description: row.description
        };
        await addSyllabusOutcomeMutation.mutateAsync(payload);
      }
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
      message.success(`Imported ${data.length} outcomes successfully`);
    } catch (error) {
      message.error('Failed to import some or all outcomes');
    } finally {
      setOutcomeImportVisible(false);
    }
  };
  // Handler for imported session data
  const handleSessionDataImported = async (data: { [key: string]: string }[]) => {
    if (!syllabus) return;
    try {
      for (const row of data) {
        const payload: CreateSyllabusSession = {
          syllabusId: syllabus.id,
          sessionNumber: Number(row.sessionNumber),
          topic: row.topic,
          mission: row.mission
        };
        await addSyllabusSessionMutation.mutateAsync(payload);
      }
      const updated = await fetchSyllabusBySubjectMutation.mutateAsync(Number(subjectId));
      setSyllabus(Array.isArray(updated) ? updated[0] : updated);
      message.success(`Imported ${data.length} sessions successfully`);
    } catch (error) {
      message.error('Failed to import some or all sessions');
    } finally {
      setSessionImportVisible(false);
    }
  };

  // Table columns for each section
  const assessmentColumns = [
    { title: 'Category', dataIndex: 'category', key: 'category',
      render: (_: any, record: SyllabusAssessment) =>
        isEditing && editingAssessmentId === record.id ? (
          <Select
            value={assessmentEdit.category}
            onChange={v => setAssessmentEdit(e => ({ ...e, category: v }))}
            style={{ width: 120 }}
          >
            <Option value="Assignment">Assignment</Option>
            <Option value="Quiz">Quiz</Option>
            <Option value="Final Exam">Final Exam</Option>
          </Select>
        ) : record.category
    },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity',
      render: (_: any, record: SyllabusAssessment) =>
        isEditing && editingAssessmentId === record.id ? (
          <InputNumber
            value={assessmentEdit.quantity}
            min={1}
            onChange={v => setAssessmentEdit(e => ({ ...e, quantity: v ?? e.quantity ?? 1 }))}
          />
        ) : record.quantity
    },
    { title: 'Weight (%)', dataIndex: 'weight', key: 'weight',
      render: (_: any, record: SyllabusAssessment) =>
        isEditing && editingAssessmentId === record.id ? (
          <InputNumber
            value={assessmentEdit.weight}
            min={0}
            max={100}
            onChange={v => setAssessmentEdit(e => ({ ...e, weight: v ?? e.weight ?? 0 }))}
          />
        ) : record.weight
    },
    { title: 'Duration (min)', dataIndex: 'duration', key: 'duration',
      render: (_: any, record: SyllabusAssessment) =>
        isEditing && editingAssessmentId === record.id ? (
          <InputNumber
            value={assessmentEdit.duration}
            min={0}
            onChange={v => setAssessmentEdit(e => ({ ...e, duration: v ?? e.duration ?? 0 }))}
          />
        ) : record.duration
    },
    { title: 'Question Type', dataIndex: 'questionType', key: 'questionType',
      render: (_: any, record: SyllabusAssessment) =>
        isEditing && editingAssessmentId === record.id ? (
          <Select
            value={assessmentEdit.questionType}
            onChange={v => setAssessmentEdit(e => ({ ...e, questionType: v }))}
            style={{ width: 140 }}
          >
            <Option value="essay">Essay</Option>
            <Option value="multiple-choice">Multiple Choice</Option>
            <Option value="practical exam">Practical Exam</Option>
            <Option value="presentation">Presentation</Option>
            <Option value="project">Project</Option>
            <Option value="other">Other</Option>
          </Select>
        ) : record.questionType
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusAssessment) =>
        isEditing && editingAssessmentId === record.id ? (
          <>
            <Button type="link" icon={<SaveOutlined />} onClick={saveEditAssessment} />
            <Button type="link" icon={<DeleteOutlined />} onClick={cancelEditAssessment} />
          </>
        ) : isEditing ? (
          <Button type="link" icon={<EditOutlined />} onClick={() => startEditAssessment(record)} />
        ) : null
    },
  ];

  // Learning Materials columns with inline editing
  const materialColumns = [
    { title: 'Material Name', dataIndex: 'materialName', key: 'materialName',
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.materialName}
            onChange={e => setMaterialEdit({ ...materialEdit, materialName: e.target.value })}
          />
        ) : (
          record.materialName
        )
    },
    { title: 'Author', dataIndex: 'authorName', key: 'authorName',
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.authorName}
            onChange={e => setMaterialEdit({ ...materialEdit, authorName: e.target.value })}
          />
        ) : (
          record.authorName
        )
    },
    { title: 'Published Date', dataIndex: 'publishedDate', key: 'publishedDate',
      render: (date: Date, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <DatePicker
            value={materialEdit.publishedDate ? dayjs(materialEdit.publishedDate) : undefined}
            onChange={date => setMaterialEdit({ ...materialEdit, publishedDate: date ? date.toDate() : undefined })}
          />
        ) : (
          record.publishedDate ? new Date(record.publishedDate).toLocaleDateString() : ''
        )
    },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true,
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.description}
            onChange={e => setMaterialEdit({ ...materialEdit, description: e.target.value })}
          />
        ) : (
          record.description
        )
    },
    { title: 'File/URL', dataIndex: 'filepathOrUrl', key: 'filepathOrUrl', ellipsis: true,
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.filepathOrUrl}
            onChange={e => setMaterialEdit({ ...materialEdit, filepathOrUrl: e.target.value })}
          />
        ) : (
          record.filepathOrUrl
        )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <>
            <Button icon={<SaveOutlined />} onClick={saveEditMaterial} />
            <Button icon={<DeleteOutlined />} onClick={cancelEditMaterial} />
          </>
        ) : (
          <>
            <Button icon={<EditOutlined />} onClick={() => startEditMaterial(record)} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDeleteItem('material', record.id)} />
          </>
        )
    },
  ];

  // Learning Outcomes columns with inline editing
  const outcomeColumns = [
    { title: 'Outcome Code', dataIndex: 'outcomeCode', key: 'outcomeCode',
      render: (_: any, record: SyllabusOutcome) =>
        isEditing && editingOutcomeId === record.id ? (
          <Input
            value={outcomeEdit.outcomeCode}
            onChange={e => setOutcomeEdit({ ...outcomeEdit, outcomeCode: e.target.value })}
          />
        ) : (
          record.outcomeCode
        )
    },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true,
      render: (_: any, record: SyllabusOutcome) =>
        isEditing && editingOutcomeId === record.id ? (
          <Input
            value={outcomeEdit.description}
            onChange={e => setOutcomeEdit({ ...outcomeEdit, description: e.target.value })}
          />
        ) : (
          record.description
        )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusOutcome) =>
        isEditing && editingOutcomeId === record.id ? (
          <>
            <Button icon={<SaveOutlined />} onClick={saveEditOutcome} />
            <Button icon={<DeleteOutlined />} onClick={cancelEditOutcome} />
          </>
        ) : (
          <>
            <Button icon={<EditOutlined />} onClick={() => startEditOutcome(record)} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDeleteItem('outcome', record.id)} />
          </>
        )
    },
  ];

  // Sessions columns with inline editing
  const sessionColumns = [
    { title: 'Session #', dataIndex: 'sessionNumber', key: 'sessionNumber',
      render: (_: any, record: SyllabusSession) =>
        isEditing && editingSessionId === record.id ? (
          <InputNumber
            value={sessionEdit.sessionNumber}
            min={1}
            onChange={v => setSessionEdit(se => ({ ...se, sessionNumber: v ?? se.sessionNumber ?? 1 }))}
          />
        ) : record.sessionNumber
    },
    { title: 'Topic', dataIndex: 'topic', key: 'topic', ellipsis: true,
      render: (_: any, record: SyllabusSession) =>
        isEditing && editingSessionId === record.id ? (
          <Input
            value={sessionEdit.topic}
            onChange={e => setSessionEdit(se => ({ ...se, topic: e.target.value }))}
          />
        ) : record.topic
    },
    { title: 'Mission', dataIndex: 'mission', key: 'mission', ellipsis: true,
      render: (_: any, record: SyllabusSession) =>
        isEditing && editingSessionId === record.id ? (
          <Input
            value={sessionEdit.mission}
            onChange={e => setSessionEdit(se => ({ ...se, mission: e.target.value }))}
          />
        ) : record.mission
    },
    {
      title: 'Outcomes',
      dataIndex: 'outcomes',
      key: 'outcomes',
      render: (_: any, record: SyllabusSession) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* TODO: Replace with real outcomes when backend supports session-outcome mapping */}
          {(/* record.outcomes || */ []).length > 0 ? (
            /* record.outcomes */ [].map((outcome: any) => (
              <div key={outcome.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{outcome.outcomeCode || outcome.description || 'Outcome'}</span>
                {/* Remove button (mocked, disabled) */}
                <Button size="small" disabled title="Remove not implemented">Remove</Button>
              </div>
            ))
          ) : (
            <span style={{ color: '#888' }}>No outcomes</span>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusSession) =>
        isEditing && editingSessionId !== record.id ? (
          <>
            <Button icon={<EditOutlined />} onClick={() => startEditSession(record)} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDeleteItem('session', record.id)} />
            <Button icon={<PlusOutlined />} onClick={() => openAddOutcomeModal(record.id)} style={{ marginLeft: 8 }}>
              Add Outcomes
            </Button>
          </>
        ) : isEditing ? null : null
    },
  ];

  if (!subject) {
    return (
      <div className={styles.syllabusContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📚</div>
          <div className={styles.emptyStateText}>Subject not found</div>
          <Button onClick={() => navigate('/staff/subjects')}>
            <ArrowLeftOutlined /> Back to Subjects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.syllabusContainer}>
      {/* Header */}
      <div className={styles.syllabusHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className={styles.syllabusTitle}>Syllabus Management</h1>
            <p className={styles.syllabusSubtitle}>
              {subject.subjectName} ({subject.subjectCode}) - {subject.credits} Credits
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/staff/subjects')}
              className={`${styles.syllabusButton} ${styles.secondaryButton}`}
            >
              Back to Subjects
            </Button>
            {!isEditing ? (
              <Button 
                icon={<EditOutlined />} 
                onClick={() => setIsEditing(true)}
                className={`${styles.syllabusButton} ${styles.primaryButton}`}
              >
                Edit Syllabus
              </Button>
            ) : (
              <Button 
                icon={<SaveOutlined />} 
                onClick={handleSaveSyllabus}
                loading={loading}
                className={`${styles.syllabusButton} ${styles.primaryButton}`}
              >
                Save Syllabus
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Syllabus Content */}
      <div className={styles.syllabusContent}>
        {/* Main Content */}
        <div className={styles.syllabusSection}>
          <div className={styles.syllabusSectionHeader}>
            <h3 className={styles.syllabusSectionTitle}>
              <FileTextOutlined className={styles.syllabusSectionIcon} />
              Course Description
            </h3>
          </div>
          <div className={styles.syllabusSectionContent}>
            {isEditing ? (
              <TextArea
                value={syllabus?.content || ''}
                onChange={(e) => setSyllabus((prev:any) => prev ? { ...prev, content: e.target.value } : null)}
                placeholder="Enter course description..."
                className={styles.formTextArea}
                rows={6}
              />
            ) : (
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#374151' }}>
                {syllabus?.content || 'No course description available.'}
              </p>
            )}
          </div>
        </div>

        {/* Assessments Section */}
        <div className={styles.syllabusSection}>
          <div className={styles.syllabusSectionHeader}>
            <h3 className={styles.syllabusSectionTitle}>
              <TagOutlined className={styles.syllabusSectionIcon} />
              Assessments
            </h3>
            {isEditing && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAssessmentModalVisible(true)}
                  style={{ background: '#f97316', borderColor: '#f97316' }}
                >
                  Add Assessment
                </Button>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => setAssessmentImportVisible(true)}
                  style={{ background: '#22c55e', borderColor: '#22c55e', color: 'white' }}
                >
                  Import from Excel
                </Button>
              </div>
            )}
          </div>
          <div className={styles.syllabusSectionContent}>
            {syllabus?.assessments.length ? (
              <Table
                columns={assessmentColumns}
                dataSource={syllabus.assessments}
                rowKey="id"
                className={styles.syllabusTable}
                pagination={false}
              />
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📊</div>
                <div className={styles.emptyStateText}>No assessments defined</div>
                <div className={styles.emptyStateSubtext}>
                  {isEditing ? 'Click "Add Assessment" or "Import from Excel" to get started' : 'Contact your instructor to add assessments'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Learning Materials Section */}
        <div className={styles.syllabusSection}>
          <div className={styles.syllabusSectionHeader}>
            <h3 className={styles.syllabusSectionTitle}>
              <BookOutlined className={styles.syllabusSectionIcon} />
              Learning Materials
            </h3>
            {isEditing && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setMaterialModalVisible(true)}
                  style={{ background: '#f97316', borderColor: '#f97316' }}
                >
                  Add Material
                </Button>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => setMaterialImportVisible(true)}
                  style={{ background: '#22c55e', borderColor: '#22c55e', color: 'white' }}
                >
                  Import from Excel
                </Button>
              </div>
            )}
          </div>
          <div className={styles.syllabusSectionContent}>
            {syllabus?.learningMaterials.length ? (
              <Table
                columns={materialColumns}
                dataSource={syllabus.learningMaterials}
                rowKey="id"
                className={styles.syllabusTable}
                pagination={false}
              />
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📚</div>
                <div className={styles.emptyStateText}>No learning materials</div>
                <div className={styles.emptyStateSubtext}>
                  {isEditing ? 'Click "Add Material" or "Import from Excel" to get started' : 'Contact your instructor to add materials'}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Material Excel Import Modal */}
        <Modal
          title="Import Materials from Excel"
          open={materialImportVisible}
          onCancel={() => setMaterialImportVisible(false)}
          footer={null}
          width={700}
        >
          <DataImport
            onClose={() => setMaterialImportVisible(false)}
            onDataImported={handleMaterialDataImported}
            headerConfig={{...getHeaderConfig('MATERIAL'), headers: [...getHeaderConfig('MATERIAL').headers] }}
            allowMultipleRows={true}
            dataType="material"
          />
        </Modal>

        {/* Learning Outcomes Section */}
        <div className={styles.syllabusSection}>
          <div className={styles.syllabusSectionHeader}>
            <h3 className={styles.syllabusSectionTitle}>
              <TagOutlined className={styles.syllabusSectionIcon} />
              Learning Outcomes
            </h3>
            {isEditing && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setOutcomeModalVisible(true)}
                  style={{ background: '#f97316', borderColor: '#f97316' }}
                >
                  Add Outcome
                </Button>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => setOutcomeImportVisible(true)}
                  style={{ background: '#22c55e', borderColor: '#22c55e', color: 'white' }}
                >
                  Import from Excel
                </Button>
              </div>
            )}
          </div>
          <div className={styles.syllabusSectionContent}>
            {syllabus?.learningOutcomes.length ? (
              <Table
                columns={outcomeColumns}
                dataSource={syllabus.learningOutcomes}
                rowKey="id"
                className={styles.syllabusTable}
                pagination={false}
              />
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🎯</div>
                <div className={styles.emptyStateText}>No learning outcomes defined</div>
                <div className={styles.emptyStateSubtext}>
                  {isEditing ? 'Click "Add Outcome" or "Import from Excel" to get started' : 'Contact your instructor to add outcomes'}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Outcome Excel Import Modal */}
        <Modal
          title="Import Outcomes from Excel"
          open={outcomeImportVisible}
          onCancel={() => setOutcomeImportVisible(false)}
          footer={null}
          width={700}
        >
          <DataImport
            onClose={() => setOutcomeImportVisible(false)}
            onDataImported={handleOutcomeDataImported}
            headerConfig={{...getHeaderConfig('OUTCOME'), headers: [...getHeaderConfig('OUTCOME').headers] }}
            allowMultipleRows={true}
            dataType="outcome"
          />
        </Modal>

        {/* Sessions Section */}
        <div className={styles.syllabusSection}>
          <div className={styles.syllabusSectionHeader}>
            <h3 className={styles.syllabusSectionTitle}>
              <ScheduleOutlined className={styles.syllabusSectionIcon} />
              Course Sessions
            </h3>
            {isEditing && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setSessionModalVisible(true)}
                  style={{ background: '#f97316', borderColor: '#f97316' }}
                >
                  Add Session
                </Button>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => setSessionImportVisible(true)}
                  style={{ background: '#22c55e', borderColor: '#22c55e', color: 'white' }}
                >
                  Import from Excel
                </Button>
              </div>
            )}
          </div>
          <div className={styles.syllabusSectionContent}>
            {syllabus?.sessions.length ? (
              <Table
                columns={sessionColumns}
                dataSource={syllabus.sessions}
                rowKey="id"
                className={styles.syllabusTable}
                pagination={false}
              />
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📅</div>
                <div className={styles.emptyStateText}>No sessions planned</div>
                <div className={styles.emptyStateSubtext}>
                  {isEditing ? 'Click "Add Session" or "Import from Excel" to get started' : 'Contact your instructor to add sessions'}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Session Excel Import Modal */}
        <Modal
          title="Import Sessions from Excel"
          open={sessionImportVisible}
          onCancel={() => setSessionImportVisible(false)}
          footer={null}
          width={700}
        >
          <DataImport
            onClose={() => setSessionImportVisible(false)}
            onDataImported={handleSessionDataImported}
            headerConfig={{...getHeaderConfig('SESSION'), headers: [...getHeaderConfig('SESSION').headers] }}
            allowMultipleRows={true}
            dataType="session"
          />
        </Modal>
      </div>

      {/* Assessment Modal */}
      <Modal
        title="Add Assessment"
        open={assessmentModalVisible}
        onCancel={() => setAssessmentModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={assessmentForm} onFinish={handleAddAssessment} layout="vertical">
          <div className={styles.formRow}>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Select category">
                <Option value="Assignment">Assignment</Option>
                <Option value="Quiz">Quiz</Option>
                <Option value="Final Exam">Final Exam</Option>
              </Select>
            </Form.Item>
            <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
              <InputNumber min={1} placeholder="Number of items" style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div className={styles.formRow}>
            <Form.Item name="weight" label="Weight (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} placeholder="Percentage" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="duration" label="Duration (minutes)" rules={[{ required: true }]}>
              <InputNumber min={1} placeholder="Duration" style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="questionType" label="Question Type" rules={[{ required: true }]}>
            <Select placeholder="Select question type">
              <Option value="essay">Essay</Option>
              <Option value="multiple-choice">Multiple Choice</Option>
              <Option value="practical exam">Practical Exam</Option>
              <Option value="presentation">Presentation</Option>
              <Option value="project">Project</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="completionCriteria" label="Completion Criteria">
            <TextArea rows={3} placeholder="Describe completion criteria..." />
          </Form.Item>
          <div className={styles.syllabusActions}>
            <Button onClick={() => setAssessmentModalVisible(false)} className={`${styles.syllabusButton} ${styles.cancelButton}`}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className={`${styles.syllabusButton} ${styles.primaryButton}`}>
              Add Assessment
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Learning Material Modal */}
      <Modal
        title="Add Learning Material"
        open={materialModalVisible}
        onCancel={() => setMaterialModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={materialForm} onFinish={handleAddMaterial} layout="vertical">
          <Form.Item name="materialName" label="Material Name" rules={[{ required: true }]}>
            <Input placeholder="Enter material name" />
          </Form.Item>
          <div className={styles.formRow}>
            <Form.Item name="authorName" label="Author" rules={[{ required: true }]}>
              <Input placeholder="Enter author name" />
            </Form.Item>
            <Form.Item name="publishedDate" label="Published Date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="filepathOrUrl" label="File Path or URL">
            <Input placeholder="Enter file path or URL" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter description..." />
          </Form.Item>
          <div className={styles.syllabusActions}>
            <Button onClick={() => setMaterialModalVisible(false)} className={`${styles.syllabusButton} ${styles.cancelButton}`}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className={`${styles.syllabusButton} ${styles.primaryButton}`}>
              Add Material
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Learning Outcome Modal */}
      <Modal
        title="Add Learning Outcome"
        open={outcomeModalVisible}
        onCancel={() => setOutcomeModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={outcomeForm} onFinish={handleAddOutcome} layout="vertical">
          <Form.Item name="outcomeCode" label="Outcome Code" rules={[{ required: true }]}>
            <Input placeholder="e.g., LO1, LO2" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Describe the learning outcome..." />
          </Form.Item>
          <div className={styles.syllabusActions}>
            <Button onClick={() => setOutcomeModalVisible(false)} className={`${styles.syllabusButton} ${styles.cancelButton}`}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className={`${styles.syllabusButton} ${styles.primaryButton}`}>
              Add Outcome
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Session Modal */}
      <Modal
        title="Add Session"
        open={sessionModalVisible}
        onCancel={() => setSessionModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={sessionForm} onFinish={handleAddSession} layout="vertical">
          <Form.Item name="sessionNumber" label="Session Number" rules={[{ required: true }]}>
            <InputNumber min={1} placeholder="Session number" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="topic" label="Topic" rules={[{ required: true }]}>
            <Input placeholder="Enter session topic" />
          </Form.Item>
          <Form.Item name="mission" label="Mission">
            <TextArea rows={4} placeholder="Describe the session mission..." />
          </Form.Item>
          <div className={styles.syllabusActions}>
            <Button onClick={() => setSessionModalVisible(false)} className={`${styles.syllabusButton} ${styles.cancelButton}`}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className={`${styles.syllabusButton} ${styles.primaryButton}`}>
              Add Session
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Add Outcome to Session Modal */}
      <Modal
        title="Add Outcome to Session"
        open={addOutcomeModalVisible}
        onCancel={() => setAddOutcomeModalVisible(false)}
        onOk={handleAddOutcomeToSession}
        okButtonProps={{ disabled: !selectedOutcomeId }}
        okText="Add Outcome"
        cancelText="Cancel"
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select an outcome to add"
          value={selectedOutcomeId || undefined}
          onChange={setSelectedOutcomeId}
          showSearch
          optionFilterProp="children"
        >
          {(syllabus?.learningOutcomes || []).map((outcome: SyllabusOutcome) => (
            <Option key={outcome.id} value={outcome.id}>
              {outcome.outcomeCode} - {outcome.description}
            </Option>
          ))}
        </Select>
      </Modal>

      {/* Assessment Excel Import Modal */}
      <Modal
        title="Import Assessments from Excel"
        open={assessmentImportVisible}
        onCancel={() => setAssessmentImportVisible(false)}
        footer={null}
        width={700}
      >
        <DataImport
          onClose={() => setAssessmentImportVisible(false)}
          onDataImported={handleAssessmentDataImported}
          headerConfig={{...getHeaderConfig('ASSESSMENT'), headers: [...getHeaderConfig('ASSESSMENT').headers] }}
          allowMultipleRows={true}
          dataType="assessment"
        />
      </Modal>
    </div>
  );
};

export default SubjectSyllabus;