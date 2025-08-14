import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Card, Divider, Select, Modal, Table, Space } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useCRUDSyllabus, useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import { Syllabus, Subject, SyllabusSession, SyllabusOutcome } from '../../interfaces/ISchoolProgram';
import styles from '../../css/manager/managerCustomTable.module.css';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

const SubjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
  const [addOutcomeModal, setAddOutcomeModal] = useState<{ open: boolean, sessionId: number | null }>({ open: false, sessionId: null });
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<SyllabusOutcome[]>([]);
  const { handleError, handleSuccess } = useApiErrorHandler();

  const {
    fetchSyllabusBySubjectVersionMutation,
    addSyllabusMutation,
    addSyllabusOutcomesToSessionMutation,
  } = useCRUDSyllabus();
  const { getSubjectById } = useCRUDSubject();

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch subject info
        const subj = await getSubjectById.mutateAsync(Number(id));
        setSubject(subj || null);
        // Fetch or create syllabus
        const result = await fetchSyllabusBySubjectVersionMutation.mutateAsync(Number(id));
        let loadedSyllabus = null;
        if (!result) {
          const content = `Syllabus for subject ${id}`;
          loadedSyllabus = await addSyllabusMutation.mutateAsync({
            subjectVersionId: Number(id),
            content
          });
        } else {
          loadedSyllabus = Array.isArray(result) ? result[0] : result;
        }
        setSyllabus(loadedSyllabus);
        setOutcomes(loadedSyllabus?.outcomes || []);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Table columns for different data types
  const getMaterialColumns = () => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Material Name',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 250,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'Author Name',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 150,
    },
    {
      title: 'Published Date',
      dataIndex: 'publishedDate',
      key: 'publishedDate',
      width: 120,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'File Path/URL',
      dataIndex: 'filepathOrUrl',
      key: 'filepathOrUrl',
      width: 200,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
  ];

  const getOutcomeColumns = () => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Outcome Code',
      dataIndex: 'outcomeCode',
      key: 'outcomeCode',
      width: 120,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 400,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
  ];

  const getSessionColumns = () => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Session Number',
      dataIndex: 'sessionNumber',
      key: 'sessionNumber',
      width: 120,
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      width: 250,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'Mission',
      dataIndex: 'mission',
      key: 'mission',
      width: 250,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'Outcomes',
      dataIndex: 'outcomes',
      key: 'outcomes',
      width: 200,
      render: (outcomes: string[]) => outcomes?.join(', ') || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: SyllabusSession) => (
        <Button type="link" onClick={() => handleOpenAddOutcome(record.id)}>Add Outcome</Button>
      ),
    },
  ];

  const getAssessmentColumns = () => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Weight (%)',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
    },
    {
      title: 'Completion Criteria',
      dataIndex: 'completionCriteria',
      key: 'completionCriteria',
      width: 200,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
    },
    {
      title: 'Question Type',
      dataIndex: 'questionType',
      key: 'questionType',
      width: 150,
    },
  ];

  const handleOpenAddOutcome = (sessionId: number) => {
    setAddOutcomeModal({ open: true, sessionId });
  };

  const handleAddOutcomeToSession = async () => {
    if (!addOutcomeModal.sessionId || !selectedOutcomeId) return;
    try {
      await addSyllabusOutcomesToSessionMutation.mutateAsync({ sessionId: addOutcomeModal.sessionId, outcomeId: selectedOutcomeId });
      handleSuccess('Outcome added to session!');
      // TODO: Refresh session outcomes from API when available
      setAddOutcomeModal({ open: false, sessionId: null });
      setSelectedOutcomeId(null);
    } catch (err) {
      handleError('Failed to add outcome to session');
    }
  };

  if (loading || !syllabus || !subject) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/manager/subject')}
                className="flex items-center"
              >
                Back to Subjects
              </Button>
              <h1 className="text-3xl font-bold text-gray-800">
                Subject Details
              </h1>
            </div>
            <Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/manager/subject/edit/${id}`)}
              >
                Edit
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            </Space>
          </div>
        </div>

        {/* Subject Information */}
        <Card 
          title={
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-semibold text-blue-600">Subject Information</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                ID: {subject.id}
              </span>
            </div>
          } 
          className="shadow-lg border-l-4 border-blue-500 mb-8"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subject Code:</span>
              <span className="font-medium">{subject.subjectCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subject Name:</span>
              <span className="font-medium">{subject.subjectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Credits:</span>
              <span className="font-medium">{subject.credits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-gray-400">(pending backend)</span>
            </div>
          </div>
          <Divider />
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{subject.description}</p>
          </div>
        </Card>

        {/* Learning Outcomes */}
        <Card 
          title={
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-semibold text-purple-600">Learning Outcomes</span>
              {/* <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                {syllabus.outcomes.length} outcomes
              </span> */}
            </div>
          } 
          className="shadow-lg border-l-4 border-purple-500 mb-8"
        >
          <Table
            columns={getOutcomeColumns()}
            dataSource={[]}
            pagination={false}
            scroll={{ x: 800 }}
            size="small"
            className={styles.customTable}
            locale={{ emptyText: 'No outcomes yet. (Fetching not supported until backend update)' }}
          />
        </Card>

        {/* Learning Materials */}
        <Card 
          title={
            <div className="flex items-center gap-3">
              <span className="text-2xl">📖</span>
              <span className="text-xl font-semibold text-green-600">Learning Materials</span>
              {/* <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                {syllabus.materials.length} materials
              </span> */}
            </div>
          } 
          className="shadow-lg border-l-4 border-green-500 mb-8"
        >
          <Table
            columns={getMaterialColumns()}
            dataSource={[]}
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
            className={styles.customTable}
            locale={{ emptyText: 'No materials yet. (Fetching not supported until backend update)' }}
          />
        </Card>

        {/* Session Information */}
        <Card 
          title={
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <span className="text-xl font-semibold text-orange-600">Session Information</span>
              {/* <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                {syllabus.sessions.length} sessions
              </span> */}
            </div>
          } 
          className="shadow-lg border-l-4 border-orange-500 mb-8"
        >
          <Table
            columns={getSessionColumns()}
            dataSource={[]}
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
            className={styles.customTable}
            locale={{ emptyText: 'No sessions yet. (Fetching not supported until backend update)' }}
          />
        </Card>

        {/* Assessment Information */}
        <Card 
          title={
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <span className="text-xl font-semibold text-red-600">Assessment Information</span>
              {/* <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                {syllabus.assessments.length} assessments
              </span> */}
            </div>
          } 
          className="shadow-lg border-l-4 border-red-500"
        >
          <Table
            columns={getAssessmentColumns()}
            dataSource={[]}
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
            className={styles.customTable}
            locale={{ emptyText: 'No assessments yet. (Fetching not supported until backend update)' }}
          />
        </Card>
        {/* Note: All sub-entity tables are placeholders until backend supports fetching. */}

        <Modal
          title="Add Outcome to Session"
          open={addOutcomeModal.open}
          onOk={handleAddOutcomeToSession}
          onCancel={() => setAddOutcomeModal({ open: false, sessionId: null })}
          okButtonProps={{ disabled: !selectedOutcomeId }}
        >
          <Select
            showSearch
            placeholder="Select an outcome"
            style={{ width: '100%' }}
            value={selectedOutcomeId}
            onChange={setSelectedOutcomeId}
            optionFilterProp="label"
            filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
          >
            {outcomes.map(outcome => (
              <Select.Option key={outcome.id} value={outcome.id} label={`${outcome.outcomeCode}: ${outcome.description}`.slice(0, 60)}>
                {outcome.outcomeCode}: {outcome.description}
              </Select.Option>
            ))}
          </Select>
        </Modal>
      </motion.div>
    </div>
  );
};

export default SubjectDetail; 