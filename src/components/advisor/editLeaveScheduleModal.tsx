import React, { useEffect } from 'react';
import { Modal, Form, DatePicker, Input, Button, Spin } from 'antd';
import { useUpdateLeaveSchedule, useLeaveScheduleDetail } from '../../hooks/useCRUDLeaveSchedule';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';

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
  const { showSuccess, showError } = useMessagePopupContext();
  const [form] = Form.useForm();
  const { data, isLoading } = useLeaveScheduleDetail(leaveId || undefined);
  const updateLeave = useUpdateLeaveSchedule();

  useEffect(() => {
    if (data && visible) {
      const startDate = dayjs(data.startDateTime);
      const endDate = dayjs(data.endDateTime);
    
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
      
      const [startDateTime, endDateTime] = values.range;
      
      await updateLeave.mutateAsync({
        id: leaveId,
        data: {
          startDateTime: startDateTime.utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
          endDateTime: endDateTime.utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        },
      });
      showSuccess('Leave schedule updated successfully!');
      form.resetFields();
      onSuccess();
    } catch (err) {
      showError('An error occurred while updating the leave schedule.');
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