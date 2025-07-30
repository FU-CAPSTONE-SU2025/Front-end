import React, { useState } from 'react';
import { Modal, Form, TimePicker, Select, Button, message, Space, Tabs, Card, Typography, Divider, Row, Col, DatePicker } from 'antd';
import { PlusOutlined, ClockCircleOutlined, CalendarOutlined, DeleteOutlined, CopyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCreateLeaveSchedule, useCreateBulkLeaveSchedule } from '../../hooks/useCRUDLeaveSchedule';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface AddLeaveScheduleProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface LeaveSlot {
  key: string;
  date: any;
  startTime: any;
  endTime: any;
}

const AddLeaveScheduleModal: React.FC<AddLeaveScheduleProps> = ({ visible, onCancel, onSuccess }) => {
  const [singleForm] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('single');
  const [leaveSlots, setLeaveSlots] = useState<LeaveSlot[]>([
    { key: '1', date: dayjs(), startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }
  ]);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitSlots, setSplitSlots] = useState<LeaveSlot[]>([]);
  const [pendingSingleValues, setPendingSingleValues] = useState<any>(null);

  const createLeave = useCreateLeaveSchedule();
  const createBulkLeave = useCreateBulkLeaveSchedule();

  const validateTimeRange = (_: any, value: any) => {
    const startTime = singleForm.getFieldValue('startTime');
    const endTime = singleForm.getFieldValue('endTime');
    if (startTime && endTime) {
      const start = dayjs(startTime);
      const end = dayjs(endTime);
      if (start.isAfter(end) || start.isSame(end)) {
        return Promise.reject(new Error('End time must be after start time'));
      }
    }
    return Promise.resolve();
  };

  const validateBulkTimeRange = (index: number) => {
    const item = leaveSlots[index];
    if (item.startTime && item.endTime) {
      const start = dayjs(item.startTime);
      const end = dayjs(item.endTime);
      if (start.isAfter(end) || start.isSame(end)) {
        return false;
      }
    }
    return true;
  };

  // Helper: split long slot into 1-hour slots, last slot may be shorter
  const splitLargeSlot = (date: any, start: any, end: any) => {
    const slots: LeaveSlot[] = [];
    let current = dayjs(start);
    let idx = 1;
    while (current.add(1, 'hour').isBefore(end) || current.add(1, 'hour').isSame(end)) {
      const next = current.add(1, 'hour');
      slots.push({
        key: idx.toString(),
        date,
        startTime: current,
        endTime: next
      });
      current = next;
      idx++;
    }
    if (current.isBefore(end)) {
      slots.push({
        key: idx.toString(),
        date,
        startTime: current,
        endTime: end
      });
    }
    return slots;
  };

  // SINGLE TAB
  const handleSingleSubmit = async (values: any) => {
    const start = dayjs(values.startTime);
    const end = dayjs(values.endTime);
    const duration = end.diff(start, 'minute');
    if (duration < 30) {
      message.error('Leave slot must be at least 30 minutes.');
      return;
    }
    if (duration > 60) {
      setSplitSlots(splitLargeSlot(values.date, start, end));
      setPendingSingleValues(values);
      setShowSplitModal(true);
      return;
    }
    try {
      await createLeave.mutateAsync({
        startDateTime: dayjs(values.date).hour(start.hour()).minute(start.minute()).second(0).toISOString(),
        endDateTime: dayjs(values.date).hour(end.hour()).minute(end.minute()).second(0).toISOString(),
      });
      singleForm.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      message.error('An error occurred while creating the leave schedule.');
    }
  };

  // BULK TAB
  const handleBulkSubmit = async () => {
    try {
      const invalidItems = leaveSlots.filter((_, index) => !validateBulkTimeRange(index));
      if (invalidItems.length > 0) {
        message.error('Please check that all end times are after start times.');
        return;
      }
      // Nếu có slot dài > 1 tiếng, chia nhỏ
      const needSplit = leaveSlots.find(item => dayjs(item.endTime).diff(dayjs(item.startTime), 'minute') > 60);
      if (needSplit) {
        setSplitSlots(splitLargeSlot(needSplit.date, needSplit.startTime, needSplit.endTime));
        setPendingSingleValues(null);
        setShowSplitModal(true);
        return;
      }
      const bulkData = leaveSlots.map(item => ({
        startDateTime: dayjs(item.date).hour(item.startTime.hour()).minute(item.startTime.minute()).second(0).toISOString(),
        endDateTime: dayjs(item.date).hour(item.endTime.hour()).minute(item.endTime.minute()).second(0).toISOString(),
      }));
      await createBulkLeave.mutateAsync(bulkData);
      setLeaveSlots([{ key: '1', date: dayjs(), startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }]);
      onSuccess();
      onCancel();
    } catch (error) {
      message.error('An error occurred while creating the leave schedules.');
    }
  };

  // Confirm split slots
  const handleConfirmSplitSlots = async () => {
    try {
      const bulkData = splitSlots.map(item => ({
        startDateTime: dayjs(item.date).hour(item.startTime.hour()).minute(item.startTime.minute()).second(0).toISOString(),
        endDateTime: dayjs(item.date).hour(item.endTime.hour()).minute(item.endTime.minute()).second(0).toISOString(),
      }));
      await createBulkLeave.mutateAsync(bulkData);
      setShowSplitModal(false);
      setSplitSlots([]);
      setPendingSingleValues(null);
      setLeaveSlots([{ key: '1', date: dayjs(), startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }]);
      singleForm.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      message.error('An error occurred while creating the leave schedules.');
    }
  };

  // Cancel split modal
  const handleCancelSplitSlots = () => {
    setShowSplitModal(false);
    setSplitSlots([]);
    setPendingSingleValues(null);
  };

  // Bulk item helpers
  const addLeaveSlot = () => {
    const newKey = (leaveSlots.length + 1).toString();
    setLeaveSlots([...leaveSlots, { key: newKey, date: dayjs(), startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }]);
  };
  const removeLeaveSlot = (key: string) => {
    if (leaveSlots.length > 1) setLeaveSlots(leaveSlots.filter(item => item.key !== key));
    else message.warning('At least one leave slot is required.');
  };
  const updateLeaveSlot = (key: string, field: keyof LeaveSlot, value: any) => {
    setLeaveSlots(leaveSlots.map(item => item.key === key ? { ...item, [field]: value } : item));
  };
  const duplicateLeaveSlot = (key: string) => {
    const item = leaveSlots.find(i => i.key === key);
    if (item) {
      const newKey = (leaveSlots.length + 1).toString();
      setLeaveSlots([...leaveSlots, { ...item, key: newKey }]);
    }
  };
  // Split slot helpers
  const updateSplitSlot = (key: string, field: keyof LeaveSlot, value: any) => {
    setSplitSlots(slots => slots.map(slot => slot.key === key ? { ...slot, [field]: value } : slot));
  };
  const removeSplitSlot = (key: string) => {
    if (splitSlots.length > 1) setSplitSlots(slots => slots.filter(slot => slot.key !== key));
    else message.warning('At least one slot is required.');
  };
  const addSplitSlot = () => {
    const last = splitSlots[splitSlots.length - 1];
    const newKey = (splitSlots.length + 1).toString();
    setSplitSlots([...splitSlots, {
      key: newKey,
      date: last.date,
      startTime: dayjs(last.endTime),
      endTime: dayjs(last.endTime).add(30, 'minute')
    }]);
  };

  const handleCancel = () => {
    singleForm.resetFields();
    bulkForm.resetFields();
    setLeaveSlots([{ key: '1', date: dayjs(), startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }]);
    onCancel();
  };

  return (
    <>
      <Modal
        title={
          <Space>
            <PlusOutlined />
            Add Leave Schedule
          </Space>
        }
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Single Leave" key="single">
            <Form
              form={singleForm}
              layout="vertical"
              onFinish={handleSingleSubmit}
              initialValues={{
                date: dayjs(),
                startTime: dayjs('09:00', 'HH:mm'),
                endTime: dayjs('17:00', 'HH:mm'),
              }}
            >
              <Form.Item
                label={<Space><CalendarOutlined />Date</Space>}
                name="date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<Space><ClockCircleOutlined />Start Time</Space>}
                    name="startTime"
                    rules={[{ required: true, message: 'Please select start time' }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<Space><ClockCircleOutlined />End Time</Space>}
                    name="endTime"
                    rules={[
                      { required: true, message: 'Please select end time' },
                      { validator: validateTimeRange }
                    ]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Create Leave</Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Multiple Leaves" key="bulk">
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Create multiple leave slots at once. You can add, remove, or duplicate leave slots.
              </Text>
            </div>
            {leaveSlots.map((item, index) => (
              <Card
                key={item.key}
                size="small"
                style={{ marginBottom: 16 }}
                title={<Space><CalendarOutlined />Leave {index + 1}</Space>}
                extra={
                  <Space>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => duplicateLeaveSlot(item.key)}
                      title="Duplicate"
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeLeaveSlot(item.key)}
                      title="Remove"
                    />
                  </Space>
                }
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <DatePicker
                      value={item.date}
                      onChange={val => updateLeaveSlot(item.key, 'date', val)}
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                      placeholder="Date"
                    />
                  </Col>
                  <Col span={8}>
                    <TimePicker
                      value={item.startTime}
                      onChange={val => updateLeaveSlot(item.key, 'startTime', val)}
                      format="HH:mm"
                      style={{ width: '100%' }}
                      placeholder="Start time"
                      minuteStep={15}
                    />
                  </Col>
                  <Col span={8}>
                    <TimePicker
                      value={item.endTime}
                      onChange={val => updateLeaveSlot(item.key, 'endTime', val)}
                      format="HH:mm"
                      style={{ width: '100%' }}
                      placeholder="End time"
                      minuteStep={15}
                    />
                  </Col>
                </Row>
                {!validateBulkTimeRange(index) && (
                  <Text type="danger" style={{ fontSize: '12px' }}>
                    End time must be after start time
                  </Text>
                )}
              </Card>
            ))}
            <Button
              type="dashed"
              onClick={addLeaveSlot}
              style={{ width: '100%', marginBottom: 16 }}
              icon={<PlusOutlined />}
            >
              Add Another Leave
            </Button>
            <Divider />
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button
                type="primary"
                onClick={handleBulkSubmit}
                icon={<PlusOutlined />}
              >
                Create {leaveSlots.length} Leave{leaveSlots.length > 1 ? 's' : ''}
              </Button>
            </Space>
          </TabPane>
        </Tabs>
      </Modal>
      <Modal
        open={showSplitModal}
        onCancel={handleCancelSplitSlots}
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            Leave slot is longer than 1 hour. Please review and edit the split slots below.
          </Space>
        }
        width={600}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={handleCancelSplitSlots} style={{ minWidth: 100 }} type="default">
            Cancel
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmSplitSlots} style={{ minWidth: 120 }}>
            Confirm
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <span style={{ color: '#faad14' }}>
            The original slot will be split into multiple slots (each 1 hour, last one may be shorter). You can edit, remove, or add slots as needed before confirming.
          </span>
        </div>
        {splitSlots.map((slot, idx) => (
          <Row gutter={8} key={slot.key} align="middle" style={{ marginBottom: 8 }}>
            <Col span={8}>
              <TimePicker
                value={dayjs(slot.startTime)}
                onChange={val => updateSplitSlot(slot.key, 'startTime', val)}
                format="HH:mm"
                minuteStep={5}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={8}>
              <TimePicker
                value={dayjs(slot.endTime)}
                onChange={val => updateSplitSlot(slot.key, 'endTime', val)}
                format="HH:mm"
                minuteStep={5}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={6}>
              <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeSplitSlot(slot.key)} />
            </Col>
          </Row>
        ))}
        <Button type="dashed" onClick={addSplitSlot} icon={<PlusOutlined />} style={{ width: '100%', marginTop: 8 }}>
          Add Another Slot
        </Button>
      </Modal>
    </>
  );
};

export default AddLeaveScheduleModal; 