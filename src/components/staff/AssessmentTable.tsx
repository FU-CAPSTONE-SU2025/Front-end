import React, { useState } from 'react';
import { 
  Input, 
  Select, 
  Button, 
  Table, 
  InputNumber,
  message,
  Modal,
  Form
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { SyllabusAssessment, CreateSyllabusAssessment } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../common/bulkDataImport';
import styles from '../../css/staff/staffEditSyllabus.module.css';

const { Option } = Select;
const { TextArea } = Input;

interface AssessmentTableProps {
  assessments: SyllabusAssessment[];
  isEditing: boolean;
  onAddAssessment: (assessment: CreateSyllabusAssessment) => Promise<void>;
  onDeleteAssessment: (id: number) => void;
  onUpdateAssessment: (id: number, assessment: Partial<SyllabusAssessment>) => void;
}

const AssessmentTable: React.FC<AssessmentTableProps> = ({
  assessments,
  isEditing,
  onAddAssessment,
  onDeleteAssessment,
  onUpdateAssessment
}) => {
  const [assessmentForm] = Form.useForm();
  const [assessmentModalVisible, setAssessmentModalVisible] = useState(false);
  const [assessmentImportVisible, setAssessmentImportVisible] = useState(false);
  const [editingAssessmentId, setEditingAssessmentId] = useState<number | null>(null);
  const [assessmentEdit, setAssessmentEdit] = useState<Partial<SyllabusAssessment>>({});

  const handleAddAssessment = async (values: any) => {
    try {
      await onAddAssessment(values);
      setAssessmentModalVisible(false);
      assessmentForm.resetFields();
      message.success('Assessment added successfully');
    } catch (error) {
      message.error('Failed to add assessment');
    }
  };

  const handleDeleteItem = (id: number) => {
    onDeleteAssessment(id);
  };

  const startEditAssessment = (record: SyllabusAssessment) => {
    setEditingAssessmentId(record.id);
    setAssessmentEdit(record);
  };

  const saveEditAssessment = () => {
    if (editingAssessmentId) {
      onUpdateAssessment(editingAssessmentId, assessmentEdit);
      setEditingAssessmentId(null);
      setAssessmentEdit({});
    }
  };

  const cancelEditAssessment = () => {
    setEditingAssessmentId(null);
    setAssessmentEdit({});
  };

  const handleAssessmentDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      // Extract assessment data from the imported data
      const assessmentData = importedData['ASSESSMENT'] || [];
      
      for (const row of assessmentData) {
        const assessment: CreateSyllabusAssessment = {
          syllabusId: parseInt(row.syllabusId),
          category: row.category || 'Assignment',
          quantity: parseInt(row.quantity) || 1,
          weight: parseFloat(row.weight) || 0,
          duration: parseInt(row.duration) || 60,
          questionType: row.questionType || 'essay',
          completionCriteria: row.completionCriteria || ''
        };
        await onAddAssessment(assessment);
      }
      message.success(`Successfully imported ${assessmentData.length} assessment(s)`);
      setAssessmentImportVisible(false);
    } catch (error) {
      message.error('Failed to import assessment data');
    }
  };

  // Assessment columns with inline editing
  const assessmentColumns = [
    { title: 'Category', dataIndex: 'category', key: 'category',
      render: (_: any, record: SyllabusAssessment) =>
        isEditing && editingAssessmentId === record.id ? (
          <Select
            value={assessmentEdit.category}
            onChange={v => setAssessmentEdit(e => ({ ...e, category: v }))}
            className={styles.assessmentFormInputNumberSmall}
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
            className={styles.assessmentFormInputNumberMedium}
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
          <div className={styles.assessmentTableCellActions}>
            <Button 
              icon={<SaveOutlined />} 
              onClick={saveEditAssessment}
              className={styles.assessmentTableCellActionsButtonSave}
            />
            <Button 
              icon={<DeleteOutlined />} 
              onClick={cancelEditAssessment}
              className={styles.assessmentTableCellActionsButtonCancel}
            />
          </div>
        ) : isEditing ? (
          <div className={styles.assessmentTableCellActions}>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => startEditAssessment(record)}
              className={styles.assessmentTableCellActionsButtonEdit}
            />
            <Button 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteItem(record.id)}
              className={styles.assessmentTableCellActionsButtonDelete}
            />
          </div>
        ) : null
    },
  ];

  return (
    <>
      <div className={styles.syllabusSection}>
        <div className={styles.syllabusSectionHeader}>
          <h3 className={styles.syllabusSectionTitle}>
            📊 Assessments
          </h3>
          {isEditing && (
            <div className={styles.assessmentTableActions}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAssessmentModalVisible(true)}
                className={styles.assessmentTableButtonDanger}
              >
                Add Assessment
              </Button>
              <Button
                type="default"
                icon={<UploadOutlined />}
                onClick={() => setAssessmentImportVisible(true)}
                className={styles.assessmentTableButtonSecondary}
              >
                Import from Excel
              </Button>
            </div>
          )}
        </div>
        <div className={styles.syllabusSectionContent}>
          {assessments.length ? (
            <Table
              columns={assessmentColumns}
              dataSource={assessments}
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
                <Option value="Participation">Participation</Option>
                <Option value="Progress test">Progress test</Option>
                <Option value="Assignment">Assignment</Option>
                <Option value="Pratical Exam">Pratical Exam</Option>
                <Option value="Final Exam">Final Exam</Option>
              </Select>
            </Form.Item>
            <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
              <InputNumber min={1} placeholder="Number of items" className={styles.assessmentFormInputNumber} />
            </Form.Item>
          </div>
          <div className={styles.formRow}>
            <Form.Item name="weight" label="Weight (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} placeholder="Percentage" className={styles.assessmentFormInputNumber} />
            </Form.Item>
            <Form.Item name="duration" label="Duration (minutes)" rules={[{ required: true }]}>
              <InputNumber min={1} placeholder="Duration" className={styles.assessmentFormInputNumber} />
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

      {/* Assessment Excel Import Modal */}
      <Modal
        title="Import Assessments from Excel"
        open={assessmentImportVisible}
        onCancel={() => setAssessmentImportVisible(false)}
        footer={null}
        width={700}
      >
        <BulkDataImport
          onClose={() => setAssessmentImportVisible(false)}
          onDataImported={handleAssessmentDataImported}
          supportedTypes={['ASSESSMENT']}
        />
      </Modal>
    </>
  );
};

export default AssessmentTable; 