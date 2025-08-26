import React from 'react';
import { Modal, Button, Tag, Spin, Typography, Space, Divider, Row, Col, message } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined, 
  LinkOutlined,
  FileTextOutlined,
  BookOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { SubjectCheckpointDetail } from '../../interfaces/IStudent';
import { useCompleteCheckpoint } from '../../hooks/useStudentFeature';

const { Title, Text, Paragraph } = Typography;

interface CheckpointDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  checkpointDetail: SubjectCheckpointDetail | null;
  isLoading: boolean;
}

const CheckpointDetailModal: React.FC<CheckpointDetailModalProps> = ({
  isVisible,
  onClose,
  checkpointDetail,
  isLoading
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = () => {
    if (!checkpointDetail) return 'blue';
    if (checkpointDetail.isCompleted) return 'success';
    
    const daysUntil = getDaysUntilDeadline(checkpointDetail.deadline);
    if (daysUntil < 0) return 'error';
    if (daysUntil <= 3) return 'warning';
    return 'processing';
  };

  const getStatusText = () => {
    if (!checkpointDetail) return '';
    if (checkpointDetail.isCompleted) return 'Completed';
    
    const daysUntil = getDaysUntilDeadline(checkpointDetail.deadline);
    if (daysUntil < 0) return 'Overdue';
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    if (daysUntil <= 3) return `Due in ${daysUntil} days`;
    return `Due in ${daysUntil} days`;
  };

  const getLinks = () => {
    if (!checkpointDetail) return [];
    return [checkpointDetail.link1, checkpointDetail.link2, checkpointDetail.link3, checkpointDetail.link4, checkpointDetail.link5]
      .filter(link => link && link.trim() !== '');
  };

  const getAllLinkSlots = () => {
    if (!checkpointDetail) return [];
    return [
      checkpointDetail.link1,
      checkpointDetail.link2,
      checkpointDetail.link3,
      checkpointDetail.link4,
      checkpointDetail.link5
    ];
  };

  const links = getLinks();
  const allLinkSlots = getAllLinkSlots();

  const completeCheckpointMutation = useCompleteCheckpoint();

  const handleCompleteCheckpoint = async () => {
    if (!checkpointDetail?.id) return;
    try {
      await completeCheckpointMutation.mutateAsync(checkpointDetail.id);
      message.success('Checkpoint marked as complete!');
      onClose();
    } catch (error) {
      message.error('Failed to mark checkpoint as complete.');
      console.error(error);
    }
  };

  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      title={
        <Space>
          <BookOutlined />
          <span>Checkpoint Details</span>
        </Space>
      }
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 12 }}>
            <Text>Loading checkpoint details...</Text>
          </div>
        </div>
      ) : checkpointDetail ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Header Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <Title level={4} style={{ margin: 0, flex: 1, marginRight: 12 }}>
                {checkpointDetail.title}
              </Title>
              <Tag 
                color={getStatusColor()} 
                icon={checkpointDetail.isCompleted ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              >
                {getStatusText()}
              </Tag>
            </div>
            
            <Space>
              <CalendarOutlined />
              <Text type="secondary" style={{ fontSize: '13px' }}>Deadline: {formatDate(checkpointDetail.deadline)}</Text>
            </Space>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* Content in 2 columns */}
          <Row gutter={24}>
            {/* Left Column */}
            <Col span={12}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Content Section */}
                <div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    <FileTextOutlined style={{ marginRight: 6 }} />
                    Description
                  </Title>
                  <Paragraph style={{ margin: 0, fontSize: '14px' }}>
                    {checkpointDetail.content}
                  </Paragraph>
                </div>

                {/* Note Section */}
                {checkpointDetail.note && (
                  <div style={{ backgroundColor: '#fff7e6', padding: 12, borderRadius: 6, border: '1px solid #ffd591' }}>
                    <Title level={5} style={{ color: '#d46b08', marginBottom: 6, fontSize: '14px' }}>
                      <BookOutlined style={{ marginRight: 6 }} />
                      Important Note
                    </Title>
                    <Paragraph style={{ margin: 0, color: '#d46b08', fontSize: '13px' }}>
                      {checkpointDetail.note}
                    </Paragraph>
                  </div>
                )}
              </Space>
            </Col>

            {/* Right Column */}
            <Col span={12}>
              <div>
                <Title level={5} style={{ marginBottom: 8 }}>
                  <LinkOutlined style={{ marginRight: 6 }} />
                  Useful Links
                </Title>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {links.length > 0 ? (
                    links.map((link, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            display: 'block', 
                            flex: 1,
                            wordBreak: 'break-all',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                          }}
                        >
                          <Button 
                            type="link" 
                            icon={<LinkOutlined />}
                            style={{ 
                              padding: 0, 
                              height: 'auto', 
                              textAlign: 'left', 
                              fontSize: '13px',
                              whiteSpace: 'normal',
                              wordBreak: 'break-all',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              lineHeight: '1.4'
                            }}
                          >
                            {link}
                          </Button>
                        </a>
                      </div>
                    ))
                  ) : (
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      No links available
                    </Text>
                  )}
                </Space>
              </div>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button size="small" onClick={onClose}>
                Close
              </Button>
              {!checkpointDetail.isCompleted && (
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={handleCompleteCheckpoint}
                  loading={completeCheckpointMutation.isPending}
                >
                  Mark as Complete
                </Button>
              )}
            </Space>
          </div>
        </Space>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text type="danger">Failed to load checkpoint details</Text>
        </div>
      )}
    </Modal>
  );
};

export default CheckpointDetailModal;
