import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface AddReasonForOverdueModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (note: string) => void;
  meetingId: number;
}

const AddReasonForOverdueModal: React.FC<AddReasonForOverdueModalProps> = ({
  open,
  onCancel,
  onSuccess,
  meetingId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      onSuccess(values.note);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-red-500" />
          <span>Add Reason For Overdue</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={[
        <div className='flex justify-between'>
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading}
            onClick={handleSubmit}
            danger
          >
            Add Reason
          </Button>
        </div>
      ]}
      width={500}
      centered
    >
      <Form form={form} layout="vertical">
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 mb-2">
            <ExclamationCircleOutlined className="mr-1" />
            This meeting is overdue. Please provide a reason for the delay.
          </p>
        </div>
        
        <Form.Item
          name="note"
          label="Reason for Overdue"
          rules={[
            { required: true, message: 'Please provide a reason for the overdue meeting' },
            { min: 10, message: 'Reason must be at least 10 characters long' }
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Please explain why this meeting is overdue..."
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddReasonForOverdueModal;
