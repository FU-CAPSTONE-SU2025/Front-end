import React, { useState } from 'react';
import { Modal, Button, Radio, Input, message, Space, Typography } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import styles from '../../css/manager/approvalModal.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';

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
       className={styles.glassModal}
      classNames={{
        content: styles.glassContainer,
        header: styles.glassHeader,
        body: styles.glassBody,
        footer: styles.glassFooter
      }}
      title={
        <Space>
          <Title level={4} className={styles.gradientTitle}>
            {getTypeDisplayName(type)} Approval
          </Title>
        </Space>
      }
      open={visible}

      onCancel={handleCancel}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={handleCancel} 
            disabled={loading}
            className={styles.glassButton}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            icon={approvalStatus === "APPROVED" ? <CheckOutlined /> : <CloseOutlined />}
            onClick={handleConfirm}
            loading={loading}
            danger={approvalStatus === "REJECTED"}
            disabled={approvalStatus === undefined || approvalStatus === "PENDING"}
            className={approvalStatus === "APPROVED" ? styles.approveButton : approvalStatus === "REJECTED"? styles.rejectButton: styles.pendingButton}
          >
            {approvalStatus}
          </Button>
        </div>
      }
      width={550}
      destroyOnHidden
      
    >
      <div className={styles.infoCard }>
        <Text className={styles.infoLabel}>Material: </Text>
        <Text className={styles.infoValue}>{itemName}</Text>
      </div>
      
      <div className={styles.infoCard}>
        <Text className={styles.infoLabel}>ID: </Text>
        <Text className={styles.infoCode}>{itemId}</Text>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Radio.Group
          value={approvalStatus}
          onChange={(e) => setApprovalStatus(e.target.value as "APPROVED" | "PENDING" | "REJECTED")}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio value="APPROVED" className={styles.radioContainer}>
              <Space>
                <div className={styles.radioIcon}>
                  <CheckOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                </div>
                <span className={styles.radioText}>Approve this {getTypeDisplayName(type).toLowerCase()}</span>
              </Space>
            </Radio>
            <Radio value="REJECTED" className={styles.radioContainerReject}>
              <Space>
                <div className={styles.radioIconReject}>
                  <CloseOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
                </div>
                <span className={styles.radioTextReject}>Reject this {getTypeDisplayName(type).toLowerCase()}</span>
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </div>

      {approvalStatus === "REJECTED" && (
        <div style={{ marginBottom: 20 }}>
          <Text className={styles.infoLabel} style={{ color: '#ff4d4f', display: 'block', marginBottom: 8 }}>Rejection Reason: </Text>
          <TextArea
            rows={4}
            placeholder="Please provide a detailed reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className={styles.rejectionTextArea}
          />
        </div>
      )}

      <div className={styles.noteContainer}>
        <div className={styles.noteTopBorder} />
        <div className={styles.noteContent}>
          <span className={styles.noteIcon}>
            <span className={styles.noteIconText}>ℹ</span>
          </span>
          <span className={styles.noteText}>
            <strong>Note:</strong> This action will update the approval status of this {getTypeDisplayName(type).toLowerCase()}. 
            {approvalStatus === "REJECTED" && ' Rejection requires a detailed reason to help improve the submission.'}
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default ApprovalModal; 