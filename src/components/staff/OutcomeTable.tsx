import React, { useState } from 'react';
import { 
  Input, 
  Button, 
  Table, 
  message,
  Modal,
  Form
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { SyllabusOutcome, CreateSyllabusOutcome } from '../../interfaces/ISchoolProgram';
import DataImport from '../common/dataImport';
import { getHeaderConfig } from '../../data/importConfigurations';
import styles from '../../css/staff/staffEditSyllabus.module.css';

const { TextArea } = Input;

interface OutcomeTableProps {
  outcomes: SyllabusOutcome[];
  isEditing: boolean;
  onAddOutcome: (outcome: CreateSyllabusOutcome) => Promise<void>;
  onDeleteOutcome: (id: number) => void;
  onUpdateOutcome: (id: number, outcome: Partial<SyllabusOutcome>) => void;
}

const OutcomeTable: React.FC<OutcomeTableProps> = ({
  outcomes,
  isEditing,
  onAddOutcome,
  onDeleteOutcome,
  onUpdateOutcome
}) => {
  const [outcomeForm] = Form.useForm();
  const [outcomeModalVisible, setOutcomeModalVisible] = useState(false);
  const [outcomeImportVisible, setOutcomeImportVisible] = useState(false);
  const [editingOutcomeId, setEditingOutcomeId] = useState<number | null>(null);
  const [outcomeEdit, setOutcomeEdit] = useState<Partial<SyllabusOutcome>>({});

  const handleAddOutcome = async (values: any) => {
    try {
      await onAddOutcome(values);
      setOutcomeModalVisible(false);
      outcomeForm.resetFields();
      message.success('Learning outcome added successfully');
    } catch (error) {
      message.error('Failed to add learning outcome');
    }
  };

  const handleDeleteItem = (id: number) => {
    onDeleteOutcome(id);
  };

  const startEditOutcome = (record: SyllabusOutcome) => {
    setEditingOutcomeId(record.id);
    setOutcomeEdit(record);
  };

  const saveEditOutcome = () => {
    if (editingOutcomeId) {
      onUpdateOutcome(editingOutcomeId, outcomeEdit);
      setEditingOutcomeId(null);
      setOutcomeEdit({});
    }
  };

  const cancelEditOutcome = () => {
    setEditingOutcomeId(null);
    setOutcomeEdit({});
  };

  const handleOutcomeDataImported = async (data: { [key: string]: string }[]) => {
    try {
      for (const row of data) {
        const outcomeData: CreateSyllabusOutcome = {
          outcomeCode: row.outcomeCode || '',
          description: row.description || ''
        };
        await onAddOutcome(outcomeData);
      }
      message.success(`Successfully imported ${data.length} outcome(s)`);
      setOutcomeImportVisible(false);
    } catch (error) {
      message.error('Failed to import outcome data');
    }
  };

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
            <Button icon={<DeleteOutlined />} onClick={() => handleDeleteItem(record.id)} />
          </>
        )
    },
  ];

  return (
    <>
      <div className={styles.syllabusSection}>
        <div className={styles.syllabusSectionHeader}>
          <h3 className={styles.syllabusSectionTitle}>
            🎯 Learning Outcomes
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
          {outcomes.length ? (
            <Table
              columns={outcomeColumns}
              dataSource={outcomes}
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
    </>
  );
};

export default OutcomeTable; 