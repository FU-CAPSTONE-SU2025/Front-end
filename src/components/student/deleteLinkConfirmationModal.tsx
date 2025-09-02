import React from 'react';
import { Modal, Button } from 'antd';

interface DeleteLinkConfirmationModalProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  fromName: string;
  toName: string;
}

const DeleteLinkConfirmationModal: React.FC<DeleteLinkConfirmationModalProps> = ({
  isVisible,
  onConfirm,
  onCancel,
  fromName,
  toName
}) => (
  <Modal
    title="Delete Connection"
    open={isVisible}
    onCancel={onCancel}
    footer={[
      <Button key="cancel" onClick={onCancel}>
        Cancel
      </Button>,
      <Button 
        key="confirm" 
        danger 
        type="primary" 
        onClick={onConfirm}
      >
        Delete Connection
      </Button>,
    ]}
    className="bg-white/95 backdrop-blur-lg"
  >
    <div className="py-4">
      <p className="text-gray-700 mb-4">
        Are you sure you want to delete the connection between these subjects?
      </p>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-gray-700">From:</span>
          <span className="text-gray-600">{fromName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">To:</span>
          <span className="text-gray-600">{toName}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        This will remove the prerequisite relationship between the subjects.
      </p>
    </div>
  </Modal>
);

export default DeleteLinkConfirmationModal;
