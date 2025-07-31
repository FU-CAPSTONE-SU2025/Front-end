
import { useParams, useNavigate } from 'react-router';
import { Card, Typography, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import SubjectEdit from '../../components/staff/subjectEdit';

const { Title } = Typography;

export default function EditSubjectManager() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get the back navigation path
  const getBackPath = () => '/manager/subject';

  return (
    <div className={styles.sttContainer}>
      {/* Background (optional, for effect) */}
      <div className={styles.sttBackground} />

      {/* Header */}
      <div className={styles.sttHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title className={styles.sttTitle} style={{ margin: 0 }}>
            {id ? 'Edit Subject' : 'Create Subject'}
          </Title>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(getBackPath())}
              style={{
                borderRadius: 999,
                height: 48,
                paddingLeft: 24,
                paddingRight: 24,
                background: 'rgba(255,255,255,0.85)',
                border: '1.5px solid rgba(30,64,175,0.18)',
                color: '#1E40AF',
                fontWeight: 600,
              }}
            >
              Back
            </Button>
          </Space>
        </div>
      </div>

      {/* Edit Component */}
      <div style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
        <Card
          style={{
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 20,
            boxShadow: '0 10px 40px rgba(30,64,175,0.13)',
            border: '1.5px solid rgba(255,255,255,0.18)',
          }}
        >
          <SubjectEdit id={id ? parseInt(id) : undefined} />
        </Card>
      </div>
    </div>
  );
} 