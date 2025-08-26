import React from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface DeleteCheckpointModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  checkpointTitle: string;
  isLoading: boolean;
}

const DeleteCheckpointModal: React.FC<DeleteCheckpointModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  checkpointTitle,
  isLoading
}) => {
  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Delete Checkpoint</span>
        </Space>
      }
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <ExclamationCircleOutlined 
          style={{ 
            fontSize: '48px', 
            color: '#ff4d4f', 
            marginBottom: '16px' 
          }} 
        />
        
        <Title level={4} style={{ marginBottom: '8px' }}>
          Are you sure?
        </Title>
        
        <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '20px' }}>
          You are about to delete the checkpoint:
        </Text>
        
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '24px',
          border: '1px solid #d9d9d9'
        }}>
          <Text strong style={{ fontSize: '14px' }}>
            "{checkpointTitle}"
          </Text>
        </div>
        
        <Text type="danger" style={{ fontSize: '13px', display: 'block', marginBottom: '24px' }}>
          This action cannot be undone.
        </Text>
        
        <Space size="middle">
          <Button 
            onClick={onClose}
            disabled={isLoading}
            size="large"
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            danger
            icon={<DeleteOutlined />}
            onClick={onConfirm}
            loading={isLoading}
            size="large"
          >
            Delete Checkpoint
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default DeleteCheckpointModal;
