import React from 'react';
import { Modal, Form, InputNumber, DatePicker, Switch, Button } from 'antd';
import dayjs from 'dayjs';

interface AddVersionModalProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (values: {
    versionNumber: number;
    isActive: boolean;
    isApproved: boolean;
    decisionNoDate: string;
  }) => void;
  confirmLoading?: boolean;
}

const AddVersionModal: React.FC<AddVersionModalProps> = ({ visible, onCancel, onAdd, confirmLoading }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onAdd({
        ...values,
        decisionNoDate: values.decisionNoDate.format('YYYY-MM-DD'),
      });
      form.resetFields();
    } catch (err) {
      // Validation error
    }
  };

  return (
    <Modal
      title="Add Version"
      open={visible}
      onCancel={() => { form.resetFields(); onCancel(); }}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      okText="Add"
      cancelText="Cancel"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Version Number"
          name="versionNumber"
          rules={[{ required: true, message: 'Please input the version number!' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Active" name="isActive" valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
        <Form.Item label="Approved" name="isApproved" valuePropName="checked" initialValue={false}>
          <Switch />
        </Form.Item>
        <Form.Item
          label="Decision Date"
          name="decisionNoDate"
          rules={[{ required: true, message: 'Please select the decision date!' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddVersionModal; 