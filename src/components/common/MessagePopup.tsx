import React from 'react';
import { Modal, Typography, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
const { Text } = Typography;

interface MessagePopupState {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface MessagePopupProps {
  popupState: MessagePopupState;
  onClose: () => void;
}

const MessagePopup: React.FC<MessagePopupProps> = ({ popupState, onClose }) => {
  const getIcon = () => {
    switch (popupState.type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '24px' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '24px' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '24px' }} />;
    }
  };

  const getModalProps = () => {
    const baseProps = {
      open: popupState.visible,
      onCancel: onClose,
      footer: null,
      centered: true,
      width: 400,
      maskClosable: true,
      closable: true,
    };

    switch (popupState.type) {
      case 'success':
        return {
          ...baseProps,
          title: (
            <Space>
              {getIcon()}
              <span style={{ color: '#52c41a' }}>{popupState.title}</span>
            </Space>
          ),
        };
      case 'error':
        return {
          ...baseProps,
          title: (
            <Space>
              {getIcon()}
              <span style={{ color: '#ff4d4f' }}>{popupState.title}</span>
            </Space>
          ),
        };
      case 'warning':
        return {
          ...baseProps,
          title: (
            <Space>
              {getIcon()}
              <span style={{ color: '#faad14' }}>{popupState.title}</span>
            </Space>
          ),
        };
      case 'info':
        return {
          ...baseProps,
          title: (
            <Space>
              {getIcon()}
              <span style={{ color: '#1890ff' }}>{popupState.title}</span>
            </Space>
          ),
        };
      default:
        return {
          ...baseProps,
          title: (
            <Space>
              {getIcon()}
              <span>{popupState.title}</span>
            </Space>
          ),
        };
    }
  };

  return (
    <Modal {...getModalProps()}>
      <div style={{ padding: '16px 0' }}>
        <Text style={{ fontSize: '16px', lineHeight: '1.6' }}>
          {popupState.message}
        </Text>
      </div>
    </Modal>
  );
};

export default MessagePopup; 