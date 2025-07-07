import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface DeleteSessionModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  sessionTitle: string;
}

const DeleteSessionModal: React.FC<DeleteSessionModalProps> = ({ open, onClose, onDelete, sessionTitle }) => (
  <Modal
    open={open}
    onCancel={onClose}
    footer={null}
    width={400}
    className="delete-session-modal"
  >
    <div className="text-center py-4">
      <ExclamationCircleOutlined className="text-red-500 text-4xl mb-4" />
      <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Chat Session</h3>
      <p className="text-gray-600 mb-4">
        Are you sure you want to delete <span className="font-semibold text-blue-700">"{sessionTitle}"</span>?
      </p>
      <p className="text-sm text-gray-500 mb-6">
        This action cannot be undone. All messages in this session will be permanently deleted.
      </p>
      <div className="flex gap-3 justify-center">
        <Button 
          onClick={onClose}
          className="px-6 py-2 h-auto"
        >
          Cancel
        </Button>
        <Button 
          type="primary" 
          danger 
          onClick={onDelete}
          className="px-6 py-2 h-auto"
        >
          Delete Session
        </Button>
      </div>
    </div>
  </Modal>
);

export default DeleteSessionModal; 