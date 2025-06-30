import React, { useState, useEffect } from 'react';
import { 
  Collapse, 
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
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import styles from '../../css/staff/staffEditSyllabus.module.css';
import { 
  CompleteSyllabus,
  SyllabusAssessment,
  SyllabusLearningMaterial,
  SyllabusLearningOutcome,
  SyllabusSession,
  CreateSyllabus
} from '../../interfaces/ISyllabus';
import { subjects } from '../../data/schoolData';
import { mockSyllabus } from '../../data/mockSyllabus';

const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

const SubjectSyllabus: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = useParams();
  const {subjectId,syllabusId} = searchParams
  //console.log("Subject Id: ",subjectId,syllabusId)
  
  // State for syllabus data
  const [syllabus, setSyllabus] = useState<CompleteSyllabus | null>(null);
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
  const [materialEdit, setMaterialEdit] = useState<Partial<SyllabusLearningMaterial>>({});
  const [outcomeEdit, setOutcomeEdit] = useState<Partial<SyllabusLearningOutcome>>({});
  const [sessionEdit, setSessionEdit] = useState<Partial<SyllabusSession>>({});

  // Get subject information
  const subject = subjects.find(s => s.id === Number(subjectId));

  useEffect(() => {
    // For demo, use mockSyllabus directly
    setSyllabus(mockSyllabus);
  }, []);

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
    try {
      const newAssessment: SyllabusAssessment = {
        id: Date.now(), // Temporary ID
        syllabus_id: syllabus!.id,
        ...values
      };
      
      setSyllabus(prev => prev ? {
        ...prev,
        assessments: [...prev.assessments, newAssessment]
      } : null);
      
      setAssessmentModalVisible(false);
      assessmentForm.resetFields();
      message.success('Assessment added successfully');
    } catch (error) {
      message.error('Failed to add assessment');
    }
  };

  const handleAddMaterial = async (values: any) => {
    try {
      const newMaterial: SyllabusLearningMaterial = {
        id: Date.now(),
        syllabus_id: syllabus!.id,
        ...values,
        published_date: values.published_date?.toDate() || new Date()
      };
      
      setSyllabus(prev => prev ? {
        ...prev,
        learningMaterials: [...prev.learningMaterials, newMaterial]
      } : null);
      
      setMaterialModalVisible(false);
      materialForm.resetFields();
      message.success('Learning material added successfully');
    } catch (error) {
      message.error('Failed to add learning material');
    }
  };

  const handleAddOutcome = async (values: any) => {
    try {
      const newOutcome: SyllabusLearningOutcome = {
        id: Date.now(),
        syllabus_id: syllabus!.id,
        ...values
      };
      
      setSyllabus(prev => prev ? {
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, newOutcome]
      } : null);
      
      setOutcomeModalVisible(false);
      outcomeForm.resetFields();
      message.success('Learning outcome added successfully');
    } catch (error) {
      message.error('Failed to add learning outcome');
    }
  };

  const handleAddSession = async (values: any) => {
    try {
      const newSession: SyllabusSession = {
        id: Date.now(),
        syllabus_id: syllabus!.id,
        ...values
      };
      
      setSyllabus(prev => prev ? {
        ...prev,
        sessions: [...prev.sessions, newSession]
      } : null);
      
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
        setSyllabus(prev => {
          if (!prev) return null;
          
          switch (type) {
            case 'assessment':
              return { ...prev, assessments: prev.assessments.filter(a => a.id !== id) };
            case 'material':
              return { ...prev, learningMaterials: prev.learningMaterials.filter(m => m.id !== id) };
            case 'outcome':
              return { ...prev, learningOutcomes: prev.learningOutcomes.filter(o => o.id !== id) };
            case 'session':
              return { ...prev, sessions: prev.sessions.filter(s => s.id !== id) };
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
    setSyllabus(prev => prev ? {
      ...prev,
      assessments: prev.assessments.map(a => a.id === editingAssessmentId ? { ...a, ...assessmentEdit } : a)
    } : null);
    setEditingAssessmentId(null);
    setAssessmentEdit({});
  };
  const cancelEditAssessment = () => {
    setEditingAssessmentId(null);
    setAssessmentEdit({});
  };

  const startEditMaterial = (record: SyllabusLearningMaterial) => {
    setEditingMaterialId(record.id);
    setMaterialEdit(record);
  };
  const saveEditMaterial = () => {
    setSyllabus(prev => prev ? {
      ...prev,
      learningMaterials: prev.learningMaterials.map(m => m.id === editingMaterialId ? { ...m, ...materialEdit } : m)
    } : null);
    setEditingMaterialId(null);
    setMaterialEdit({});
  };
  const cancelEditMaterial = () => {
    setEditingMaterialId(null);
    setMaterialEdit({});
  };

  const startEditOutcome = (record: SyllabusLearningOutcome) => {
    setEditingOutcomeId(record.id);
    setOutcomeEdit(record);
  };
  const saveEditOutcome = () => {
    setSyllabus(prev => prev ? {
      ...prev,
      learningOutcomes: prev.learningOutcomes.map(o => o.id === editingOutcomeId ? { ...o, ...outcomeEdit } : o)
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
    setSyllabus(prev => prev ? {
      ...prev,
      sessions: prev.sessions.map(s => s.id === editingSessionId ? { ...s, ...sessionEdit } : s)
    } : null);
    setEditingSessionId(null);
    setSessionEdit({});
  };
  const cancelEditSession = () => {
    setEditingSessionId(null);
    setSessionEdit({});
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
    { title: 'Question Type', dataIndex: 'question_type', key: 'question_type',
      render: (_: any, record: SyllabusAssessment) =>
        isEditing && editingAssessmentId === record.id ? (
          <Select
            value={assessmentEdit.question_type}
            onChange={v => setAssessmentEdit(e => ({ ...e, question_type: v }))}
            style={{ width: 140 }}
          >
            <Option value="essay">Essay</Option>
            <Option value="multiple-choice">Multiple Choice</Option>
            <Option value="practical exam">Practical Exam</Option>
            <Option value="presentation">Presentation</Option>
            <Option value="project">Project</Option>
            <Option value="other">Other</Option>
          </Select>
        ) : record.question_type
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
    { title: 'Material Name', dataIndex: 'material_name', key: 'material_name',
      render: (_: any, record: SyllabusLearningMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.material_name}
            onChange={e => setMaterialEdit(me => ({ ...me, material_name: e.target.value }))}
          />
        ) : record.material_name
    },
    { title: 'Author', dataIndex: 'author_name', key: 'author_name',
      render: (_: any, record: SyllabusLearningMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.author_name}
            onChange={e => setMaterialEdit(me => ({ ...me, author_name: e.target.value }))}
          />
        ) : record.author_name
    },
    { title: 'Published Date', dataIndex: 'published_date', key: 'published_date',
      render: (date: Date, record: SyllabusLearningMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <DatePicker
            value={materialEdit.published_date ? (typeof materialEdit.published_date === 'string' ? undefined : materialEdit.published_date as any) : undefined}
            onChange={d => setMaterialEdit(me => ({ ...me, published_date: d ? d.toDate() : new Date() }))}
            format="YYYY-MM-DD"
          />
        ) : date?.toLocaleDateString()
    },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true,
      render: (_: any, record: SyllabusLearningMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.description}
            onChange={e => setMaterialEdit(me => ({ ...me, description: e.target.value }))}
          />
        ) : record.description
    },
    { title: 'File/URL', dataIndex: 'filepath_or_url', key: 'filepath_or_url', ellipsis: true,
      render: (_: any, record: SyllabusLearningMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.filepath_or_url}
            onChange={e => setMaterialEdit(me => ({ ...me, filepath_or_url: e.target.value }))}
          />
        ) : record.filepath_or_url
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusLearningMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <>
            <Button type="link" icon={<SaveOutlined />} onClick={saveEditMaterial} />
            <Button type="link" icon={<DeleteOutlined />} onClick={cancelEditMaterial} />
          </>
        ) : isEditing ? (
          <Button type="link" icon={<EditOutlined />} onClick={() => startEditMaterial(record)} />
        ) : null
    },
  ];

  // Learning Outcomes columns with inline editing
  const outcomeColumns = [
    { title: 'Outcome Code', dataIndex: 'outcome_code', key: 'outcome_code',
      render: (_: any, record: SyllabusLearningOutcome) =>
        isEditing && editingOutcomeId === record.id ? (
          <Input
            value={outcomeEdit.outcome_code}
            onChange={e => setOutcomeEdit(oe => ({ ...oe, outcome_code: e.target.value }))}
          />
        ) : record.outcome_code
    },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true,
      render: (_: any, record: SyllabusLearningOutcome) =>
        isEditing && editingOutcomeId === record.id ? (
          <Input
            value={outcomeEdit.description}
            onChange={e => setOutcomeEdit(oe => ({ ...oe, description: e.target.value }))}
          />
        ) : record.description
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusLearningOutcome) =>
        isEditing && editingOutcomeId === record.id ? (
          <>
            <Button type="link" icon={<SaveOutlined />} onClick={saveEditOutcome} />
            <Button type="link" icon={<DeleteOutlined />} onClick={cancelEditOutcome} />
          </>
        ) : isEditing ? (
          <Button type="link" icon={<EditOutlined />} onClick={() => startEditOutcome(record)} />
        ) : null
    },
  ];

  // Sessions columns with inline editing
  const sessionColumns = [
    { title: 'Session #', dataIndex: 'session_number', key: 'session_number',
      render: (_: any, record: SyllabusSession) =>
        isEditing && editingSessionId === record.id ? (
          <InputNumber
            value={sessionEdit.session_number}
            min={1}
            onChange={v => setSessionEdit(se => ({ ...se, session_number: v ?? se.session_number ?? 1 }))}
          />
        ) : record.session_number
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
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusSession) =>
        isEditing && editingSessionId === record.id ? (
          <>
            <Button type="link" icon={<SaveOutlined />} onClick={saveEditSession} />
            <Button type="link" icon={<DeleteOutlined />} onClick={cancelEditSession} />
          </>
        ) : isEditing ? (
          <Button type="link" icon={<EditOutlined />} onClick={() => startEditSession(record)} />
        ) : null
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
                onChange={(e) => setSyllabus(prev => prev ? { ...prev, content: e.target.value } : null)}
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAssessmentModalVisible(true)}
                style={{ background: '#f97316', borderColor: '#f97316' }}
              >
                Add Assessment
              </Button>
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
                  {isEditing ? 'Click "Add Assessment" to get started' : 'Contact your instructor to add assessments'}
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setMaterialModalVisible(true)}
                style={{ background: '#f97316', borderColor: '#f97316' }}
              >
                Add Material
              </Button>
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
                  {isEditing ? 'Click "Add Material" to get started' : 'Contact your instructor to add materials'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Learning Outcomes Section */}
        <div className={styles.syllabusSection}>
          <div className={styles.syllabusSectionHeader}>
            <h3 className={styles.syllabusSectionTitle}>
              <TagOutlined className={styles.syllabusSectionIcon} />
              Learning Outcomes
            </h3>
            {isEditing && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOutcomeModalVisible(true)}
                style={{ background: '#f97316', borderColor: '#f97316' }}
              >
                Add Outcome
              </Button>
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
                  {isEditing ? 'Click "Add Outcome" to get started' : 'Contact your instructor to add outcomes'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sessions Section */}
        <div className={styles.syllabusSection}>
          <div className={styles.syllabusSectionHeader}>
            <h3 className={styles.syllabusSectionTitle}>
              <ScheduleOutlined className={styles.syllabusSectionIcon} />
              Course Sessions
            </h3>
            {isEditing && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setSessionModalVisible(true)}
                style={{ background: '#f97316', borderColor: '#f97316' }}
              >
                Add Session
              </Button>
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
                  {isEditing ? 'Click "Add Session" to get started' : 'Contact your instructor to add sessions'}
                </div>
              </div>
            )}
          </div>
        </div>
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
          <Form.Item name="question_type" label="Question Type" rules={[{ required: true }]}>
            <Select placeholder="Select question type">
              <Option value="essay">Essay</Option>
              <Option value="multiple-choice">Multiple Choice</Option>
              <Option value="practical exam">Practical Exam</Option>
              <Option value="presentation">Presentation</Option>
              <Option value="project">Project</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="completion_criteria" label="Completion Criteria">
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
          <Form.Item name="material_name" label="Material Name" rules={[{ required: true }]}>
            <Input placeholder="Enter material name" />
          </Form.Item>
          <div className={styles.formRow}>
            <Form.Item name="author_name" label="Author" rules={[{ required: true }]}>
              <Input placeholder="Enter author name" />
            </Form.Item>
            <Form.Item name="published_date" label="Published Date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="filepath_or_url" label="File Path or URL">
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
          <Form.Item name="outcome_code" label="Outcome Code" rules={[{ required: true }]}>
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
          <Form.Item name="session_number" label="Session Number" rules={[{ required: true }]}>
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
    </div>
  );
};

export default SubjectSyllabus;