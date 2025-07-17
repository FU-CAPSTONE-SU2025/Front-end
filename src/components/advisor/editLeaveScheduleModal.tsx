import React, { useEffect } from 'react';
import { Modal, Form, DatePicker, Input, Button, Spin } from 'antd';
import { useUpdateLeaveSchedule, useLeaveScheduleDetail } from '../../hooks/useCRUDLeaveSchedule';
import dayjs from 'dayjs';

interface EditLeaveScheduleModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  leaveId: number | null;
}

const EditLeaveScheduleModal: React.FC<EditLeaveScheduleModalProps> = ({ visible, onCancel, onSuccess, leaveId }) => {
  const [form] = Form.useForm();
  const { data, isLoading } = useLeaveScheduleDetail(leaveId || undefined);
  const updateLeave = useUpdateLeaveSchedule();

  useEffect(() => {
    if (data && visible) {
      form.setFieldsValue({
        range: [dayjs(data.startDateTime), dayjs(data.endDateTime)],
      
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [data, visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!leaveId) return;
      await updateLeave.mutateAsync({
        id: leaveId,
        data: {
          startDateTime: values.range[0].toISOString(),
          endDateTime: values.range[1].toISOString(),
        
        },
      });
      form.resetFields();
      onSuccess();
    } catch (err) {
      // validation or API error
    }
  };

  return (
    <Modal
      title="Edit Leave Schedule"
      open={visible}
      onCancel={() => { form.resetFields(); onCancel(); }}
      onOk={handleOk}
      footer={[
        <Button key="back" onClick={() => { form.resetFields(); onCancel(); }}>Cancel</Button>,
        <Button key="submit" type="primary" loading={updateLeave.isPending} onClick={handleOk}>Save</Button>,
      ]}
    >
      {isLoading ? <Spin /> : (
        <Form form={form} layout="vertical">
          <Form.Item
            label="Leave Period"
            name="range"
            rules={[{ required: true, message: 'Please select the leave period!' }]}
          >
            <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default EditLeaveScheduleModal; 