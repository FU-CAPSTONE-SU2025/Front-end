import React, { useState } from 'react';
import { 
  Input, 
  Button, 
  Table, 
  InputNumber,
  message,
  Modal,
  Form,
  Select
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { SyllabusSession, CreateSyllabusSession, SyllabusOutcome } from '../../interfaces/ISchoolProgram';
import DataImport from '../common/dataImport';
import { getHeaderConfig } from '../../data/importConfigurations';
import styles from '../../css/staff/staffEditSyllabus.module.css';

const { Option } = Select;
const { TextArea } = Input;

interface SessionTableProps {
  sessions: SyllabusSession[];
  outcomes: SyllabusOutcome[];
  isEditing: boolean;
  onAddSession: (session: CreateSyllabusSession) => Promise<void>;
  onDeleteSession: (id: number) => void;
  onUpdateSession: (id: number, session: Partial<SyllabusSession>) => void;
  onAddOutcomeToSession: (sessionId: number, outcomeId: number) => Promise<void>;
}

const SessionTable: React.FC<SessionTableProps> = ({
  sessions,
  outcomes,
  isEditing,
  onAddSession,
  onDeleteSession,
  onUpdateSession,
  onAddOutcomeToSession
}) => {
  const [sessionForm] = Form.useForm();
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [sessionImportVisible, setSessionImportVisible] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [sessionEdit, setSessionEdit] = useState<Partial<SyllabusSession>>({});

  // State for Add Outcomes to Session modal
  const [addOutcomeModalVisible, setAddOutcomeModalVisible] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<number | null>(null);

  const [addOutcomeSessionId, setAddOutcomeSessionId] = useState<number | null>(null);

  const handleAddSession = async (values: any) => {
    try {
      await onAddSession(values);
      setSessionModalVisible(false);
      sessionForm.resetFields();
      message.success('Session added successfully');
    } catch (error) {
      message.error('Failed to add session');
    }
  };

  const handleDeleteItem = (id: number) => {
    onDeleteSession(id);
  };

  const startEditSession = (record: SyllabusSession) => {
    setEditingSessionId(record.id);
    setSessionEdit(record);
  };

  const saveEditSession = () => {
    if (editingSessionId) {
      onUpdateSession(editingSessionId, sessionEdit);
      setEditingSessionId(null);
      setSessionEdit({});
    }
  };

  const cancelEditSession = () => {
    setEditingSessionId(null);
    setSessionEdit({});
  };

  const openAddOutcomeModal = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setSelectedOutcomeId(null);
    setAddOutcomeModalVisible(true);
  };

  const handleAddOutcomeToSession = async () => {
    if (!selectedSessionId || !selectedOutcomeId) return;
    try {
      await onAddOutcomeToSession(selectedSessionId, selectedOutcomeId);
      setAddOutcomeModalVisible(false);
      setSelectedSessionId(null);
      setSelectedOutcomeId(null);
      message.success('Outcome added to session successfully');
    } catch (error) {
      message.error('Failed to add outcome to session');
    }
  };

  const handleSessionDataImported = async (data: { [key: string]: string }[]) => {
    try {
      for (const row of data) {
        const sessionData: Partial<CreateSyllabusSession> = {
          syllabusId: parseInt(row.syllabusId),
          sessionNumber: parseInt(row.sessionNumber) || 1,
          topic: row.topic || '',
          mission: row.mission || ''
        };
        await onAddSession(sessionData as CreateSyllabusSession);
      }
      message.success(`Successfully imported ${data.length} session(s)`);
      setSessionImportVisible(false);
    } catch (error) {
      message.error('Failed to import session data');
    }
  };

  const openAddOutcomeModalForSession = (sessionId: number) => {
    setAddOutcomeSessionId(sessionId);
    setAddOutcomeModalVisible(true);
  };

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
          {(/* record.outcomes || */ []).length > 0 ? (
            /* record.outcomes */ [].map((outcome: any) => (
              <div key={outcome.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{outcome.outcomeCode || outcome.description || 'Outcome'}</span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => startEditSession(record)}
              style={{ 
                padding: '0.5rem',
                background: '#3b82f6', 
                borderColor: '#3b82f6', 
                color: 'white',
                fontWeight: '600',
              }}
            />
            <Button 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteItem(record.id)}
              style={{ 
                padding: '0.5rem',
                background: '#ef4444', 
                borderColor: '#ef4444', 
                color: 'white',
                fontWeight: '600'
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openAddOutcomeModal(record.id)}
              style={{ 
                color: 'white',
                padding: '0.5rem',
                background: '#f97316', 
                borderColor: '#f97316',
                fontWeight: '600'
              }}
            >
              Add Outcomes
            </Button>
          </div>
        ) : isEditing && editingSessionId === record.id ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button 
              icon={<SaveOutlined />} 
              onClick={saveEditSession}
              style={{ 
                background: '#10b981', 
                borderColor: '#10b981', 
                color: 'white',
                fontWeight: '600'
              }}
            />
            <Button 
              icon={<DeleteOutlined />} 
              onClick={cancelEditSession}
              style={{ 
                background: '#ef4444', 
                borderColor: '#ef4444', 
                color: 'white',
                fontWeight: '600'
              }}
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
            📅 Course Sessions
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
          {sessions.length ? (
            <Table
              columns={sessionColumns}
              dataSource={sessions}
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

      {/* Add Outcome to Session Modal */}
      <Modal
        title="Add Outcome"
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
          {outcomes.map((outcome: SyllabusOutcome) => (
            <Option key={outcome.id} value={outcome.id}>
              {outcome.outcomeCode} - {outcome.description}
            </Option>
          ))}
        </Select>
      </Modal>
    </>
  );
};

export default SessionTable; 