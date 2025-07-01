import React, { useState } from 'react';
import { Card, Typography, Row, Col, Button, Table, Tag, InputNumber, message } from 'antd';
import { CloseOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import styles from '../../css/staff/transcriptEditDialog.module.css';

const { Title, Text } = Typography;

interface Subject {
  id: number;
  title: string;
  code: string;
  credits: number;
  description: string;
  progress: number;
  status: 'Current' | 'Completed' | 'Failed';
  semester: number;
  grade?: string;
}

interface Assessment {
  id: number;
  type: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number; // percentage weight in final grade
}

interface Props {
  transcriptId: number;
  subject: Subject;
  onClose: () => void;
}

// Mock assessment data
const initialAssessments: Assessment[] = [
  { id: 1, type: 'Progress Test', name: 'Progress Test 01', score: 8.5, maxScore: 10, weight: 10 },
  { id: 2, type: 'Progress Test', name: 'Progress Test 02', score: 9.0, maxScore: 10, weight: 10 },
  { id: 3, type: 'Assignment', name: 'Assignment 01', score: 9.2, maxScore: 10, weight: 15 },
  { id: 4, type: 'Assignment', name: 'Assignment 02', score: 8.8, maxScore: 10, weight: 15 },
  { id: 5, type: 'Participation', name: 'Class Participation', score: 9.5, maxScore: 10, weight: 10 },
  { id: 6, type: 'Practical Exam', name: 'Midterm Practical', score: 7.5, maxScore: 10, weight: 20 },
  { id: 7, type: 'Final Exam', name: 'Final Examination', score: 8.0, maxScore: 10, weight: 20 },
];

export default function TranscriptEdit({ transcriptId, subject, onClose }: Props) {
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempScore, setTempScore] = useState<number>(0);

  // Calculate weighted average
  const calculateFinalGrade = () => {
    const totalWeightedScore = assessments.reduce((sum, assessment) => {
      return sum + (assessment.score / assessment.maxScore) * assessment.weight;
    }, 0);
    return totalWeightedScore.toFixed(2);
  };

  // Handle score editing
  const startEditing = (assessment: Assessment) => {
    setEditingId(assessment.id);
    setTempScore(assessment.score);
  };

  const saveScore = (assessmentId: number) => {
    setAssessments(prev => 
      prev.map(assessment => 
        assessment.id === assessmentId 
          ? { ...assessment, score: tempScore }
          : assessment
      )
    );
    setEditingId(null);
    message.success('Score updated successfully!');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempScore(0);
  };

  // Table columns for assessments
  const columns = [
    {
      title: 'Assessment Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={
          type === 'Progress Test' ? 'blue' :
          type === 'Assignment' ? 'green' :
          type === 'Participation' ? 'orange' :
          type === 'Practical Exam' ? 'purple' :
          'red'
        }>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Assessment Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Score',
      key: 'score',
      render: (record: Assessment) => (
        <div className={styles.scoreContainer}>
          {editingId === record.id ? (
            <>
              <InputNumber
                value={tempScore}
                onChange={(value) => setTempScore(value || 0)}
                min={0}
                max={record.maxScore}
                step={0.1}
                className={styles.scoreInput}
              />
              <Text>/{record.maxScore}</Text>
              <Button 
                type="link" 
                icon={<SaveOutlined />} 
                onClick={() => saveScore(record.id)}
                className={styles.saveButton}
              />
              <Button 
                type="link" 
                icon={<CloseOutlined />} 
                onClick={cancelEditing}
                className={styles.cancelButton}
              />
            </>
          ) : (
            <>
              <Text className={styles.scoreText}>{record.score}/{record.maxScore}</Text>
              <Button 
                type="link" 
                icon={<EditOutlined />} 
                onClick={() => startEditing(record)}
                className={styles.editButton}
              />
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (record: Assessment) => (
        <Text>{((record.score / record.maxScore) * 100).toFixed(1)}%</Text>
      ),
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => <Text>{weight}%</Text>,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Title level={2} className={styles.subjectTitle}>
            {subject.title}
          </Title>
          <Text type="secondary" className={styles.subjectDetails}>
            {subject.code} • {subject.credits} Credits • Semester {subject.semester}
          </Text>
        </div>
        <Button 
          icon={<CloseOutlined />} 
          onClick={onClose}
          size="large"
          className={styles.closeButton}
        >
          Close
        </Button>
      </div>

      {/* Subject Description */}
      <Card className={styles.descriptionCard}>
        <Title level={4} className={styles.descriptionTitle}>Subject Description</Title>
        <Text className={styles.descriptionText}>
          {subject.description}
        </Text>
      </Card>

      {/* Grade Summary */}
      <Row gutter={16} className={styles.gradeSummaryRow}>
        <Col span={8}>
          <Card className={`${styles.gradeCard} ${styles.gradeCardOrange}`}>
            <Title level={3} className={`${styles.gradeValue} ${styles.gradeValueOrange}`}>
              {calculateFinalGrade()}%
            </Title>
            <Text type="secondary">Current Grade</Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card className={`${styles.gradeCard} ${styles.gradeCardBlue}`}>
            <Title level={3} className={`${styles.gradeValue} ${styles.gradeValueBlue}`}>
              {subject.progress}%
            </Title>
            <Text type="secondary">Progress</Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card className={`${styles.gradeCard} ${styles.gradeCardGreen}`}>
            <Title level={3} className={`${styles.gradeValue} ${styles.gradeValueGreen}`}>
              {subject.status === 'Completed' ? subject.grade : 'In Progress'}
            </Title>
            <Text type="secondary">Status</Text>
          </Card>
        </Col>
      </Row>

      {/* Assessments Table */}
      <Card className={styles.assessmentsCard}>
        <div className={styles.assessmentsHeader}>
          <Title level={4} className={styles.assessmentsTitle}>
            Assessment Scores
          </Title>
          <Text className={styles.assessmentsHint}>
            Click the edit icon to modify scores
          </Text>
        </div>
        <Table
          columns={columns}
          dataSource={assessments}
          rowKey="id"
          pagination={false}
          className={styles.assessmentsTable}
          bordered
        />
        
        {/* Final Grade Calculation */}
        <div className={styles.finalGradeSection}>
          <Row justify="space-between" align="middle">
            <Col>
              <Text className={styles.finalGradeLabel}>Final Grade Calculation:</Text>
            </Col>
            <Col>
              <Text className={styles.finalGradeValue}>
                {calculateFinalGrade()}% 
                {subject.status === 'Completed' && subject.grade && (
                  <span className={styles.letterGrade}>
                    (Letter Grade: {subject.grade})
                  </span>
                )}
              </Text>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
}