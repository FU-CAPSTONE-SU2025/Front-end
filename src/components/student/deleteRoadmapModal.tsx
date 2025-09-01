import React from 'react';
import { Modal, Button } from 'antd';
import { DeleteOutlined, WarningOutlined } from '@ant-design/icons';

interface DeleteRoadmapModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roadmapName?: string;
  isLoading?: boolean;
}

const DeleteRoadmapModal: React.FC<DeleteRoadmapModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  roadmapName = 'this roadmap',
  isLoading = false
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <WarningOutlined className="text-red-500 text-lg" />
          <span>Delete Roadmap</span>
        </div>
      }
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>,
        <Button 
          key="delete" 
          danger 
          type="primary"
          icon={<DeleteOutlined />}
          onClick={onConfirm}
          loading={isLoading}
        >
          Delete
        </Button>
      ]}
      confirmLoading={isLoading}
      width={500}
    >
      <div className="py-4">
        <p className="text-base mb-4">
          Are you sure you want to delete <strong>{roadmapName}</strong>?
        </p>
        <p className="text-gray-600 text-sm">
          This action cannot be undone. All roadmap data, milestones, and progress will be permanently deleted.
        </p>
      </div>
    </Modal>
  );
};

export default DeleteRoadmapModal;
