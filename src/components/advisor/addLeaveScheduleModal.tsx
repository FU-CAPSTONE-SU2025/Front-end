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
      console.log('values.range:', values.range);
      const startDateTime = dayjs(values.range[0]).format('YYYY-MM-DDTHH:mm');
      const endDateTime = dayjs(values.range[1]).format('YYYY-MM-DDTHH:mm');
      console.log('startDateTime:', startDateTime);
      console.log('endDateTime:', endDateTime);
      setLoading(true);
      await createLeave.mutateAsync({
        startDateTime,
        endDateTime,
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
          <DatePicker.RangePicker showTime={{ format: 'HH:mm', use12Hours: false }} format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>
       
      </Form>
    </Modal>
  );
};

export default AddLeaveScheduleModal; 