import React, { useState } from 'react';
import { Modal, Button, Radio, Input, message, Space, Typography } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

export type ApprovalType = 'subject' | 'curriculum' | 'syllabus' | 'combo';

interface ApprovalModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (approvalStatus: "APPROVED" | "PENDING" | "REJECTED", rejectionReason?: string) => Promise<void>;
  type: ApprovalType;
  itemId: number;
  itemName: string;
  loading?: boolean;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  type,
  itemId,
  itemName,
  loading = false
}) => {
  const [approvalStatus, setApprovalStatus] = useState<"APPROVED" | "PENDING" | "REJECTED">("PENDING");
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const handleConfirm = async () => {
    try {
      await onConfirm(approvalStatus, approvalStatus === "REJECTED" ? rejectionReason : undefined);
      // Reset form
      setApprovalStatus("PENDING");
      setRejectionReason('');
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleCancel = () => {
    // Reset form
    setApprovalStatus(undefined);
    setRejectionReason('');
    onCancel();
  };

  const getTypeDisplayName = (type: ApprovalType): string => {
    switch (type) {
      case 'subject': return 'Subject';
      case 'curriculum': return 'Curriculum';
      case 'syllabus': return 'Syllabus';
      case 'combo': return 'Combo';
      default: return 'Item';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <CheckOutlined style={{ color: '#52c41a' }} />
          <Title level={4} style={{ margin: 0 }}>
            {getTypeDisplayName(type)} Approval
          </Title>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={approvalStatus === "APPROVED" ? <CheckOutlined /> : <CloseOutlined />}
            onClick={handleConfirm}
            loading={loading}
            danger={approvalStatus === "REJECTED"}
            disabled={approvalStatus === undefined || approvalStatus === "PENDING"}
          >
            {approvalStatus}
          </Button>
        </div>
      }
      width={500}
      destroyOnHidden
    >
      <div style={{ marginBottom: 10 }}>
        <Text strong>Material: </Text>
        <Text>{itemName}</Text>
      </div>
      
      <div style={{ marginBottom: 10 }}>
        <Text strong>ID: </Text>
        <Text code>{itemId}</Text>
      </div>

      <div style={{ marginBottom: 10 }}>
        <Text strong>Action: </Text>
        <Radio.Group
          value={approvalStatus}
          onChange={(e) => setApprovalStatus(e.target.value as "APPROVED" | "PENDING" | "REJECTED")}
          style={{ marginTop: 5 }}
        >
          <Space direction="vertical">
            <Radio value="APPROVED">
              <Space>
                <CheckOutlined style={{ color: '#52c41a' }} />
                Approve this{getTypeDisplayName(type).toUpperCase()}
              </Space>
            </Radio>
            <Radio value="REJECTED">
              <Space>
                <CloseOutlined style={{ color: '#ff4d4f' }} />
                Reject this{getTypeDisplayName(type).toUpperCase()}
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </div>

      {approvalStatus === "REJECTED" && (
        <div style={{ marginBottom: 10 }}>
          <Text strong>Rejection Reason: </Text>
          <TextArea
            rows={3}
            placeholder="Please provide a reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>
      )}

      <div style={{ 
        padding: 12, 
        backgroundColor: '#f6f8fa', 
        borderRadius: 6,
        border: '1px solid #e1e4e8'
      }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <strong>Note:</strong> This action will update the approval status of this {getTypeDisplayName(type).toLowerCase()}. 
          {approvalStatus === "REJECTED" && ' Rejection requires a reason.'}
        </Text>
      </div>
    </Modal>
  );
};

export default ApprovalModal; 