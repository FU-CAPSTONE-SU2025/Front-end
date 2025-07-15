import React, { useState } from 'react';
import { Modal, Form, DatePicker, Input, Button } from 'antd';
import { useCreateLeaveSchedule } from '../../hooks/useCRUDLeaveSchedule';
import dayjs from 'dayjs';

interface AddLeaveScheduleModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddLeaveScheduleModal: React.FC<AddLeaveScheduleModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const createLeave = useCreateLeaveSchedule();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await createLeave.mutateAsync({
        startDateTime: values.range[0].toISOString(),
        endDateTime: values.range[1].toISOString(),
        note: values.note || null,
      });
      form.resetFields();
      onSuccess();
    } catch (err) {
      // validation or API error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Leave Schedule"
      open={visible}
      onCancel={() => { form.resetFields(); onCancel(); }}
      onOk={handleOk}
      confirmLoading={loading}
      footer={[
        <Button key="back" onClick={() => { form.resetFields(); onCancel(); }}>Cancel</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>Add</Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Leave Period"
          name="range"
          rules={[{ required: true, message: 'Please select the leave period!' }]}
        >
          <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Note" name="note">
          <Input.TextArea placeholder="Enter note (optional)" maxLength={255} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddLeaveScheduleModal; 