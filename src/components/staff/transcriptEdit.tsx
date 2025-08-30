import  { useState, useEffect, useRef } from 'react';
import { Card, Typography, Row, Col, Button, Table, Tag, InputNumber, Spin } from 'antd';
import { CloseOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import styles from '../../css/staff/transcriptEditDialog.module.css';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useSubjectMarkReport, useSubjectMarkReportTemplate } from '../../hooks/useSubjectMarkReport';
import { JoinedSubject } from '../../interfaces/ISchoolProgram';
import { ICreateSubjectMarkReport } from '../../interfaces/ISubjectMarkReport';

const { Title, Text } = Typography;

interface Assessment {
  category: string;
  weight: number;
  minScore: number;
  score?: number;
  maxScore: number;
  isExisting: boolean;
}

interface Props {
  joinedSubject: JoinedSubject;
  onClose: () => void;
}

export default function TranscriptEdit({ joinedSubject, onClose }: Props) {
  const { handleSuccess, handleError } = useApiErrorHandler();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempScore, setTempScore] = useState<number>(0);
  const hasFetchedMarks = useRef(false);
  const [marksError, setMarksError] = useState<string | null>(null);

  // Subject mark report hooks
  const { 
    fetchSubjectMarkReportMutation, 
    addSubjectMarkReportMutation,
    updateSubjectMarkReportMutation 
  } = useSubjectMarkReport();

  // Get assessment template for this subject
  const { 
    data: templateData, 
    isLoading: templateLoading, 
    error: templateError,
    refetch: refetchTemplate
  } = useSubjectMarkReportTemplate(
    joinedSubject.subjectCode, 
    joinedSubject.subjectVersionCode
  );

  // Reset all state when component mounts or joinedSubject changes
  useEffect(() => {
    // Reset all state
    setAssessments([]);
    setExistingMarks([]);
    setEditingCategory(null);
    setTempScore(0);
    setMarksError(null);
    hasFetchedMarks.current = false;
    
    // Refetch template data
    refetchTemplate();
  }, [joinedSubject.id, joinedSubject.subjectCode, joinedSubject.subjectVersionCode, refetchTemplate]);

  // Fetch existing marks for this subject
  const [existingMarks, setExistingMarks] = useState<any[]>([]);
  const [marksLoading, setMarksLoading] = useState(false);

  // Fetch existing marks when component mounts
  useEffect(() => {
    const fetchExistingMarks = async () => {
      if (!joinedSubject.id || joinedSubject.id <= 0) {
        console.log('No valid joinedSubject.id, skipping marks fetch');
        return;
      }
      
      setMarksLoading(true);
      try {
        const marks = await fetchSubjectMarkReportMutation.mutateAsync(joinedSubject.id);
        setExistingMarks(marks || []);
      } catch (error: any) {
        console.error('Failed to fetch existing marks:', error);
        // Handle 404 specifically - this means no marks exist yet, which is normal
        if (error?.response?.status === 404) {
          console.log('No marks found for this subject - consider adding the marks');
          setExistingMarks([]);
        } else {
          console.error('Unexpected error fetching marks:', error);
          setExistingMarks([]);
        }
      } finally {
        setMarksLoading(false);
      }
    };

    fetchExistingMarks();
  }, [joinedSubject.id]); 

  // Merge template data with existing marks
  useEffect(() => {
    if (!templateData || !Array.isArray(templateData)) return;

    const mergedAssessments: Assessment[] = templateData.map(template => {
      const existingMark = existingMarks.find(mark => mark.category === template.category);
      
      return {
        category: template.category,
        weight: template.weight,
        minScore: template.minScore,
        score: existingMark?.score,
        maxScore: 10, // Assuming max score is 10, adjust if needed
        isExisting: !!existingMark
      };
    });

    setAssessments(mergedAssessments);
  }, [templateData, existingMarks]);

  // Calculate weighted average
  const calculateFinalGrade = () => {
    const validAssessments = assessments.filter(assessment => assessment.score !== undefined);
    if (validAssessments.length === 0) return 0;

    const totalWeightedScore = validAssessments.reduce((sum, assessment) => {
      return sum + (assessment.score! / assessment.maxScore) * assessment.weight;
    }, 0);

    return totalWeightedScore.toFixed(2);
  };

  // Calculate total weight of existing assessments (real ones, not template)
  const calculateTotalExistingWeight = () => {
    const existingAssessments = assessments.filter(assessment => assessment.isExisting);
    return existingAssessments.reduce((sum, assessment) => sum + assessment.weight, 0);
  };

  // Determine subject status based on the three-state logic
  const getSubjectStatus = () => {
    const totalExistingWeight = calculateTotalExistingWeight();
    
    if (joinedSubject.isPassed === true) {
      console.log(`Status: Pass (isPassed: ${joinedSubject.isPassed}, weight: ${totalExistingWeight}/100)`);
      return 'Pass';
    } else if (joinedSubject.isPassed === false) {
      if (totalExistingWeight < 100) {
        console.log(`Status: In Progress (isPassed: ${joinedSubject.isPassed}, weight: ${totalExistingWeight}/100)`);
        return 'In Progress';
      } else {
        console.log(`Status: Failed (isPassed: ${joinedSubject.isPassed}, weight: ${totalExistingWeight}/100)`);
        return 'Failed';
      }
    } else {
      // Handle undefined/null case
      if (totalExistingWeight < 100) {
        console.log(`Status: In Progress (isPassed: ${joinedSubject.isPassed}, weight: ${totalExistingWeight}/100)`);
        return 'In Progress';
      } else {
        console.log(`Status: Unknown (isPassed: ${joinedSubject.isPassed}, weight: ${totalExistingWeight}/100)`);
        return 'Unknown';
      }
    }
  };

  // Get status color based on the status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'green';
      case 'Failed':
        return 'red';
      case 'In Progress':
        return 'orange';
      default:
        return 'default';
    }
  };

  // Handle score editing
  const startEditing = (category: string) => {
    const assessment = assessments.find(a => a.category === category);
    if (assessment) {
      setEditingCategory(category);
      setTempScore(assessment.score || 0);
    }
  };

  const saveScore = async (category: string) => {
    const assessment = assessments.find(a => a.category === category);
    if (!assessment) return;

    try {
      if (assessment.isExisting) {
        // Update existing mark
        const existingMark = existingMarks.find(mark => mark.category === category);
        if (existingMark) {
          await updateSubjectMarkReportMutation.mutateAsync({
            id: existingMark.id,
            data: { category, weight: assessment.weight, minScore: assessment.minScore, score: tempScore }
          });
        }
      } else {
        // Add new mark
        const markData: ICreateSubjectMarkReport = {
          category,
          weight: assessment.weight,
          minScore: assessment.minScore,
          score: tempScore
        };

        await addSubjectMarkReportMutation.mutateAsync({
          joinedSubjectId: joinedSubject.id,
          data: [markData]
        });
      }

      // Update local state
      setAssessments(prev => 
        prev.map(a => 
          a.category === category 
            ? { ...a, score: tempScore, isExisting: true }
            : a
        )
      );

      setEditingCategory(null);
      handleSuccess('Score updated successfully!');
    } catch (error) {
      handleError('Failed to save score');
    }
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setTempScore(0);
  };

  // Enhanced close handler that ensures clean state
  const handleClose = () => {
    // Reset all state before closing
    setAssessments([]);
    setExistingMarks([]);
    setEditingCategory(null);
    setTempScore(0);
    setMarksError(null);
    hasFetchedMarks.current = false;
    
    // Call the original onClose
    onClose();
  };

  // Table columns for assessments
  const columns = [
    {
      title: 'Assessment Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={
          category === 'Assignment' ? 'green' :
          category === 'Final Exam' ? 'red' :
          category === 'Midterm' ? 'orange' :
          category === 'Participation' ? 'blue' :
          'default'
        }>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number, record: Assessment) => (
        <div>
          <Text>{weight}%</Text>
          {record.isExisting && (
            <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>
              ✓ Counted
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Min Score',
      dataIndex: 'minScore',
      key: 'minScore',
      render: (minScore: number) => <Text>{minScore}</Text>,
    },
    {
      title: 'Score',
      key: 'score',
      render: (record: Assessment) => (
        <div className={styles.scoreContainer}>
          {editingCategory === record.category ? (
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
                onClick={() => saveScore(record.category)}
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
              <Text className={styles.scoreText}>
                {record.score !== undefined ? `${record.score}/${record.maxScore}` : 'Not scored'}
              </Text>
              <Button 
                type="link" 
                icon={<EditOutlined />} 
                onClick={() => startEditing(record.category)}
                className={styles.editButton}
              />
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: Assessment) => (
        <Tag color={record.isExisting ? 'green' : 'orange'}>
          {record.isExisting ? 'Scored' : 'Not Scored'}
        </Tag>
      ),
    },
  ];

  if (templateLoading || marksLoading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading assessment data...</div>
        </div>
      </div>
    );
  }

  if (templateError) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          Failed to load assessment template. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Title level={2} className={styles.subjectTitle}>
            {joinedSubject.name || joinedSubject.subjectName}
          </Title>
          <Text type="secondary" className={styles.subjectDetails}>
            {joinedSubject.subjectCode} • v{joinedSubject.subjectVersionCode} • {joinedSubject.credits} Credits
          </Text>
        </div>
        <Button 
          icon={<CloseOutlined />} 
          onClick={handleClose}
          size="large"
          className={styles.closeButton}
        >
          Close
        </Button>
      </div>

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
              {assessments.filter(a => a.score !== undefined).length}/{assessments.length}
            </Title>
            <Text type="secondary">Assessments Scored</Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card className={`${styles.gradeCard} ${styles.gradeCardGreen}`}>
            <Title level={3} className={`${styles.gradeValue} ${styles.gradeValueGreen}`}>
              {getSubjectStatus()}
            </Title>
            <Text type="secondary">Status</Text>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Weight: {calculateTotalExistingWeight()}/100%
            </Text>
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
            Click the edit icon to modify scores. Unscored assessments will be created when you first enter a score.
          </Text>
        </div>
        <Table
          columns={columns}
          dataSource={assessments}
          rowKey="category"
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
              </Text>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
}