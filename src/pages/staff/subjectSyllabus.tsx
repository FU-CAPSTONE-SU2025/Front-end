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

const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

const SubjectSyllabus: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = useParams();
  const {subjectId,syllabusId} = searchParams
  console.log("Subject Id: ",subjectId,syllabusId)
  
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
  
  // Get subject information
  const subject = subjects.find(s => s.id === Number(subjectId));

  useEffect(() => {
    if (subjectId) {
      loadSyllabus();
    }
  }, [subjectId]);

  const loadSyllabus = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, create a mock syllabus
      const mockSyllabus: CompleteSyllabus = {
        id: 1,
        subject_id: Number(subjectId),
        content: 'This course provides an introduction to software engineering principles and practices.',
        assessments: [],
        learningMaterials: [],
        learningOutcomes: [],
        sessions: []
      };
      setSyllabus(mockSyllabus);
    } catch (error) {
      message.error('Failed to load syllabus');
    } finally {
      setLoading(false);
    }
  };

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

  // Table columns for each section
  const assessmentColumns = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Weight (%)', dataIndex: 'weight', key: 'weight' },
    { title: 'Duration (min)', dataIndex: 'duration', key: 'duration' },
    { title: 'Question Type', dataIndex: 'question_type', key: 'question_type' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusAssessment) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem('assessment', record.id)}
        />
      ),
    },
  ];

  const materialColumns = [
    { title: 'Material Name', dataIndex: 'material_name', key: 'material_name' },
    { title: 'Author', dataIndex: 'author_name', key: 'author_name' },
    { title: 'Published Date', dataIndex: 'published_date', key: 'published_date', 
      render: (date: Date) => date?.toLocaleDateString() },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusLearningMaterial) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem('material', record.id)}
        />
      ),
    },
  ];

  const outcomeColumns = [
    { title: 'Outcome Code', dataIndex: 'outcome_code', key: 'outcome_code' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusLearningOutcome) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem('outcome', record.id)}
        />
      ),
    },
  ];

  const sessionColumns = [
    { title: 'Session #', dataIndex: 'session_number', key: 'session_number' },
    { title: 'Topic', dataIndex: 'topic', key: 'topic', ellipsis: true },
    { title: 'Mission', dataIndex: 'mission', key: 'mission', ellipsis: true },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusSession) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem('session', record.id)}
        />
      ),
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
              onClick={() => navigate('/staff/subject')}
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