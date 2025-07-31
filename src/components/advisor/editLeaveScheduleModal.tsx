import React, { useEffect } from 'react';
import { Modal, Form, DatePicker, Input, Button, Spin } from 'antd';
import { useUpdateLeaveSchedule, useLeaveScheduleDetail } from '../../hooks/useCRUDLeaveSchedule';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

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
      console.log('=== EDIT MODAL DEBUG ===');
      console.log('Raw data from API:', data);
      console.log('Start DateTime (raw):', data.startDateTime);
      console.log('End DateTime (raw):', data.endDateTime);
      
      // Parse UTC time correctly to match backend time
      const startDate = dayjs.utc(data.startDateTime);
      const endDate = dayjs.utc(data.endDateTime);
      
      console.log('Parsed start date (UTC):', startDate.format('YYYY-MM-DD HH:mm:ss'));
      console.log('Parsed end date (UTC):', endDate.format('YYYY-MM-DD HH:mm:ss'));
      console.log('Start hour:', startDate.hour());
      console.log('End hour:', endDate.hour());
      console.log('=== END DEBUG ===');
      
      form.setFieldsValue({
        range: [startDate, endDate],
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [data, visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!leaveId) return;
      
      console.log('Form values:', values);
      console.log('Range values:', values.range);
      
      // Submit UTC time to match backend format
      const startDateTime = values.range[0].utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      const endDateTime = values.range[1].utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      
      console.log('Sending to backend - Start (UTC):', startDateTime);
      console.log('Sending to backend - End (UTC):', endDateTime);
      
      await updateLeave.mutateAsync({
        id: leaveId,
        data: {
          startDateTime: startDateTime,
          endDateTime: endDateTime,
        },
      });
      form.resetFields();
      onSuccess();
    } catch (err) {
      console.error('Edit error:', err);
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
    <div className='flex justify-between'>
          <Button key="back" onClick={() => { form.resetFields(); onCancel(); }}>Cancel</Button>,
          <Button key="submit" type="primary" loading={updateLeave.isPending} onClick={handleOk}>Save</Button>,
    </div>
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