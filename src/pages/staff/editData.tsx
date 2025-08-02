import { useParams, useNavigate } from 'react-router';
import { Card, Typography, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyle from '../../css/manager/appleGlassEffect.module.css';
import CurriculumEdit from '../../components/staff/curriculumEdit';
import SubjectEdit from '../../components/staff/subjectEdit';
import ProgramEdit from '../../components/staff/programEdit';
import ComboEdit from '../../components/staff/comboEdit';


const { Title } = Typography;

type Props = {}

export default function EditData({}: Props) {
  const { type, id } = useParams();
  const navigate = useNavigate();
  
  // Determine if this is create or edit mode
  const isCreateMode = !id;
  
  // Get the title based on type and mode
  const getPageTitle = () => {
    const safeType = type || 'data';
    const typeName = safeType.charAt(0).toUpperCase() + safeType.slice(1);
    return `${isCreateMode ? 'Create' : 'Edit'} ${typeName}`;
  };
  
  // Render the appropriate component based on type
  const renderEditComponent = () => {
    switch (type?.toLowerCase()) {
      case 'curriculum':
        return <CurriculumEdit id={id ? parseInt(id) : undefined} />;
      case 'subject':
        return <SubjectEdit id={id ? parseInt(id) : undefined} />;
      case 'program':
        return <ProgramEdit id={id ? parseInt(id) : undefined} />;
      case 'combo':
        return <ComboEdit id={id ? parseInt(id) : undefined} />;
      default:
        return (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Title level={3} style={{ color: '#1E40AF' }}>
              Unknown data type: {type}
            </Title>
            <p>Please specify a valid data type in the URL.</p>
          </div>
        );
    }
  };
  
  // Get the back navigation path based on type
  const getBackPath = () => {
    switch (type?.toLowerCase()) {
      case 'curriculum':
        return '/staff/curriculums';
      case 'subject':
        return '/staff/subjects';
      case 'program':
        return '/staff/programs';
      case 'combo':
        return '/staff/subjects'; // Combos are managed from curriculum page
      default:
        return '/staff';
    }
  };

  return (
    <div className={styles.sttContainer}>
      {/* Background */}
      <div/>
      
      {/* Header */}
      <div className={styles.sttHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title className={styles.sttTitle} style={{ margin: 0 }}>
            {getPageTitle()}
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
                fontWeight: 600
              }}
            >
              Back
            </Button>
          </Space>
        </div>
      </div>
      
      {/* Edit Component */}
      <div>
        <Card 
        className={glassStyle.appleGlassCard}
        
        >
          {renderEditComponent()}
        </Card>
      </div>
    </div>
  );
}