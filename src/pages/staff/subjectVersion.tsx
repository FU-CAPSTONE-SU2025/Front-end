import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Tabs, Typography, message, Table, Card } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useMockSubjectVersions, useMockPrerequisites } from '../../api/SchoolAPI/subjectAPI';
import AddVersionModal from '../../components/staff/AddVersionModal';
import { SubjectVersion, Syllabus } from '../../interfaces/ISchoolProgram';
import styles from '../../css/staff/staffEditSyllabus.module.css';
import { mockSyllabuses } from '../../../data/mockData';
import AssessmentTable from '../../components/staff/AssessmentTable';
import MaterialTable from '../../components/staff/MaterialTable';
import OutcomeTable from '../../components/staff/OutcomeTable';
import SessionTable from '../../components/staff/SessionTable';

const { Title } = Typography;
const { TabPane } = Tabs;

// Mock subject data array with 2 versions for visualization
const mockSubjects = [
  { id: 1, subjectCode: 'MATH201', subjectName: 'Advanced Calculus' },
  { id: 2, subjectName: 'Modern Physics' },
];

const noopAsync = async () => {};

// Remove useParams, subjectId, and dynamic subject lookup
// Use hardcoded mock subject and versions for static UI

const staticMockSubject = { id: 1, subjectCode: 'MATH201', subjectName: 'Advanced Calculus' };
const staticMockVersions = [
  { id: 1, versionNumber: 1 },
  { id: 2, versionNumber: 2 },
  { id: 3, versionNumber: 3 },
];

// Mock syllabuses for each version
const staticMockSyllabuses = [
  { versionId: 1, content: 'Syllabus content for Version 1: Calculus fundamentals, limits, derivatives, and integrals.' },
  { versionId: 2, content: 'Syllabus content for Version 2: Advanced topics in Calculus, multivariable calculus, and series.' },
  { versionId: 3, content: 'Syllabus content for Version 3: Calculus applications, differential equations, and real analysis.' },
];
// Mock prerequisites for each version
const staticMockPrerequisites = [
  { versionId: 1, subjectCode: 'MATH101', subjectName: 'Calculus I' },
  { versionId: 1, subjectCode: 'PHYS101', subjectName: 'Physics I' },
  { versionId: 2, subjectCode: 'MATH102', subjectName: 'Calculus II' },
  { versionId: 3, subjectCode: 'MATH201', subjectName: 'Linear Algebra' },
  { versionId: 3, subjectCode: 'CS101', subjectName: 'Introduction to Programming' },
];

// Mock data for all sub-tables (assessments, materials, outcomes, sessions)
const staticMockAssessments = [
  { id: 1, syllabusId: 1, category: 'Quiz', quantity: 2, weight: 20, duration: 30, questionType: 'multiple-choice', completionCriteria: 'Score above 50%' },
  { id: 2, syllabusId: 1, category: 'Assignment', quantity: 1, weight: 30, duration: 60, questionType: 'essay', completionCriteria: 'Submit on time' },
];
const staticMockMaterials = [
  { id: 1, syllabusId: 1, materialName: 'Calculus Textbook', authorName: 'James Stewart', publishedDate: new Date('2020-01-01'), description: 'Main course textbook', filepathOrUrl: 'https://example.com/calculus.pdf' },
  { id: 2, syllabusId: 1, materialName: 'Lecture Slides', authorName: 'Prof. Smith', publishedDate: new Date('2023-01-01'), description: 'Slides for all lectures', filepathOrUrl: '' },
];
const staticMockOutcomes = [
  { id: 1, syllabusId: 1, outcomeCode: 'LO1', description: 'Understand limits and derivatives' },
  { id: 2, syllabusId: 1, outcomeCode: 'LO2', description: 'Apply integration techniques' },
];
const staticMockSessions = [
  { id: 1, syllabusId: 1, sessionNumber: 1, topic: 'Limits', mission: 'Introduction to limits' },
  { id: 2, syllabusId: 1, sessionNumber: 2, topic: 'Derivatives', mission: 'Basic differentiation' },
];

const SubjectVersionPage: React.FC = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeKey, setActiveKey] = useState(String(staticMockVersions[0].id));
  useEffect(() => {
    setActiveKey(String(staticMockVersions[0].id));
  }, []);

  // Handler for adding a new version (mocked)
  const handleAddVersion = (values: any) => {
    setAdding(true);
    setTimeout(() => {
      message.success('Version added (mock)!');
      setAdding(false);
      setModalVisible(false);
    }, 1000);
  };

  return (
    <>
      <style>
        {
        `
          .ant-tabs-top >.ant-tabs-nav::before{
            border-bottom: 2px solid #ffffff;
          }
          .ant-tabs-nav, .ant-tabs-nav-list {
            width: 100% !important;
          }
          .ant-tabs-card .ant-tabs-tab {
            margin: 0 8px !important;
          }
        `}
      </style>
      <div className={styles.syllabusContainer} style={{ width: '100%', maxWidth: 'none', minWidth: 0 }}>
        {/* Header */}
        <div className={styles.syllabusHeader}>
          <div className={styles.syllabusHeaderLeft}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
              <ArrowLeftOutlined /> Back to Subjects
            </button>
            <div className={styles.syllabusTitleCard}>
              <h2 className={styles.syllabusTitle}>
                {`${staticMockSubject.subjectCode} - ${staticMockSubject.subjectName}`}
              </h2>
              <p className={styles.syllabusSubtitle}>
                Course Syllabus & Learning Management
              </p>
            </div>
          </div>
          <div className={styles.syllabusHeaderRight}>
            {isEditing ? (
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={() => setIsEditing(false)}
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
            <Button type="primary" icon={<PlusOutlined />} style={{ marginLeft: 16 }} onClick={() => setModalVisible(true)}>
              Add Version
            </Button>
          </div>
        </div>
        {/* Tabs for Versions */}
        <div>
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            type="card"
            tabBarStyle={{ background: 'transparent', borderRadius: 12, boxShadow: 'none', display: 'flex', justifyContent: 'center' }}
            items={staticMockVersions.map((v) => {
              const isActive = activeKey === String(v.id);
              const syllabus = staticMockSyllabuses.find(s => s.versionId === v.id);
              const prerequisites = staticMockPrerequisites.filter(p => p.versionId === v.id);
              return {
                key: String(v.id),
                label: (
                  <span
                    style={{
                      color:  isActive ? '#f97316' : '#fff',
                      fontWeight: isActive ? 700 : 600,
                      borderRadius: '8px 8px 0 0',
                      fontSize: '16px',
                      padding: '8px 16px',
                      display: 'inline-block',
                      transition: 'background 0.2s, color 0.2s',
               
                    }}
                  >
                    {`Version ${v.versionNumber}`}
                  </span>
                ),
                children: (
                  <div className={styles.syllabusContent} style={{ width: '100%', maxWidth: 'none', minWidth: 0, margin: '0 auto' }}>
                    {/* Syllabus Section */}
                    <div style={{ marginBottom: 32 }}>
                      <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', marginBottom: 16, letterSpacing: '-0.5px' }}>
                        📄 Syllabus
                      </h3>
                      <div style={{ fontSize: 16, color: '#334155', lineHeight: 1.7 }}>
                        {syllabus ? syllabus.content : 'No syllabus data for this version.'}
                      </div>
                    </div>
                    {/* Prerequisite Subjects Section */}
                    <div style={{ marginBottom: 32 }}>
                      <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1E40AF', marginBottom: 16, letterSpacing: '-0.5px' }}>
                        📚 Prerequisite Subjects
                      </h3>
                      <Table
                        columns={[
                          { title: 'Subject Code', dataIndex: 'subjectCode', key: 'subjectCode', width: 160 },
                          { title: 'Subject Name', dataIndex: 'subjectName', key: 'subjectName' },
                        ]}
                        dataSource={prerequisites}
                        rowKey={r => r.subjectCode + r.subjectName}
                        pagination={false}
                        style={{ marginTop: 12 }}
                      />
                    </div>
                    {/* Assessment Table Section */}
                    <AssessmentTable
                      assessments={staticMockAssessments}
                      isEditing={false}
                      onAddAssessment={noopAsync}
                      onDeleteAssessment={noopAsync}
                      onUpdateAssessment={noopAsync}
                    />
                    {/* Material Table Section */}
                    <MaterialTable
                      materials={staticMockMaterials}
                      isEditing={false}
                      onAddMaterial={noopAsync}
                      onDeleteMaterial={noopAsync}
                      onUpdateMaterial={noopAsync}
                    />
                    {/* Outcome Table Section */}
                    <OutcomeTable
                      outcomes={staticMockOutcomes}
                      isEditing={false}
                      onAddOutcome={noopAsync}
                      onDeleteOutcome={noopAsync}
                      onUpdateOutcome={noopAsync}
                    />
                    {/* Session Table Section */}
                    <SessionTable
                      sessions={staticMockSessions}
                      outcomes={staticMockOutcomes}
                      isEditing={false}
                      onAddSession={noopAsync}
                      onDeleteSession={noopAsync}
                      onUpdateSession={noopAsync}
                      onAddOutcomeToSession={noopAsync}
                    />
                  </div>
                ),
              };
            })}
          />
        </div>
        <AddVersionModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onAdd={handleAddVersion}
          confirmLoading={adding}
        />
      </div>
    </>
  );
};

export default SubjectVersionPage; 