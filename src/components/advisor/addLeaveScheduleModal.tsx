import React, { useState, useEffect } from 'react';
import { Modal, Form, TimePicker, Select, Button, Space, Tabs, Card, Typography, Divider, Row, Col, DatePicker, Tag } from 'antd';
import { PlusOutlined, ClockCircleOutlined, CalendarOutlined, DeleteOutlined, CopyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCreateLeaveSchedule, useCreateBulkLeaveSchedule } from '../../hooks/useCRUDLeaveSchedule';
import dayjs, { Dayjs } from 'dayjs';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface AddLeaveScheduleProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  selectedSlotInfo?: { date: Dayjs; start: Dayjs; end: Dayjs } | null;
}

interface LeaveSlot {
  key: string;
  date: any;
  startTime: any;
  endTime: any;
}

const AddLeaveScheduleModal: React.FC<AddLeaveScheduleProps> = ({ visible, onCancel, onSuccess, selectedSlotInfo }) => {
  const { showSuccess, showError, showInfo, showWarning } = useMessagePopupContext();
  const [singleForm] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('single');
  const [leaveSlots, setLeaveSlots] = useState<LeaveSlot[]>([
    { key: '1', date: dayjs(), startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }
  ]);
  const [selectedDates, setSelectedDates] = useState<Dayjs[]>([dayjs()]);

  const createLeave = useCreateLeaveSchedule();
  const createBulkLeave = useCreateBulkLeaveSchedule();

  // Set form values when selectedSlotInfo changes
  useEffect(() => {
    if (selectedSlotInfo && visible) {
      singleForm.setFieldsValue({
        startTime: selectedSlotInfo.start,
        endTime: selectedSlotInfo.end,
      });
      setSelectedDates([selectedSlotInfo.date]);
    }
  }, [selectedSlotInfo, visible, singleForm]);

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

  // Helper: split date range into daily slots
  const splitDateRange = (startDate: any, endDate: any, startTime: any, endTime: any) => {
    const slots: LeaveSlot[] = [];
    let currentDate = dayjs(startDate);
    const endDateObj = dayjs(endDate);
    let idx = 1;

    while (currentDate.isBefore(endDateObj) || currentDate.isSame(endDateObj, 'day')) {
      slots.push({
        key: idx.toString(),
        date: currentDate,
        startTime: startTime,
        endTime: endTime
      });
      currentDate = currentDate.add(1, 'day');
      idx++;
    }
    return slots;
  };

  // Helper: check if date range spans multiple days
  const isMultiDayRange = (startDate: any, endDate: any) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, 'day') > 0;
  };

  // Helper: create slots from multiple selected dates
  const createSlotsFromDates = (dates: Dayjs[], startTime: any, endTime: any) => {
    return dates.map((date, index) => ({
      key: (index + 1).toString(),
      date: date,
      startTime: startTime,
      endTime: endTime
    }));
  };

  // Handle date selection in Single tab
  const handleDateSelect = (date: Dayjs | null) => {
    if (date) {
      setSelectedDates([date]);
    }
  };

  // Handle multiple date selection
  const handleMultipleDateSelect = (dates: Dayjs[]) => {
    setSelectedDates(dates);
  };

  // SINGLE TAB
  const handleSingleSubmit = async (values: any) => {
    const start = dayjs(values.startTime);
    const end = dayjs(values.endTime);
    const duration = end.diff(start, 'minute');
    if (duration < 30) {
      showError('Leave slot must be at least 30 minutes.');
      return;
    }

    // If multiple dates are selected, switch to bulk tab
    if (selectedDates.length > 1) {
      const splitSlots = createSlotsFromDates(selectedDates, start, end);
      setLeaveSlots(splitSlots);
      setActiveTab('bulk');
      showInfo(`Multiple dates detected (${selectedDates.length} days). Switched to Multiple tab with daily breakdown.`);
      return;
    }

    try {
      // Create datetime strings in 24-hour format without timezone conversion
      const startDateTime = dayjs(selectedDates[0])
        .hour(start.hour())
        .minute(start.minute())
        .second(0)
        .millisecond(0)
        .format('YYYY-MM-DDTHH:mm:ss');
      
      const endDateTime = dayjs(selectedDates[0])
        .hour(end.hour())
        .minute(end.minute())
        .second(0)
        .millisecond(0)
        .format('YYYY-MM-DDTHH:mm:ss');

      await createLeave.mutateAsync({
        startDateTime: startDateTime,
        endDateTime: endDateTime,
      });
      showSuccess('Leave schedule created successfully!');
      singleForm.resetFields();
      setSelectedDates([dayjs()]);
      onSuccess();
      onCancel();
    } catch (error) {
      showError('An error occurred while creating the leave schedule.');
    }
  };

  // BULK TAB
  const handleBulkSubmit = async () => {
    try {
      const invalidItems = leaveSlots.filter((_, index) => !validateBulkTimeRange(index));
      if (invalidItems.length > 0) {
        showError('Please check that all end times are after start times.');
        return;
      }

      const bulkData = leaveSlots.map(item => {
        // Create datetime strings in 24-hour format without timezone conversion
        const startDateTime = dayjs(item.date)
          .hour(item.startTime.hour())
          .minute(item.startTime.minute())
          .second(0)
          .millisecond(0)
          .format('YYYY-MM-DDTHH:mm:ss');
        
        const endDateTime = dayjs(item.date)
          .hour(item.endTime.hour())
          .minute(item.endTime.minute())
          .second(0)
          .millisecond(0)
          .format('YYYY-MM-DDTHH:mm:ss');

        return {
          startDateTime: startDateTime,
          endDateTime: endDateTime,
        };
      });
      
      await createBulkLeave.mutateAsync(bulkData);
      showSuccess(`Successfully created ${leaveSlots.length} leave schedules!`);
      setLeaveSlots([{ key: '1', date: dayjs(), startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }]);
      onSuccess();
      onCancel();
    } catch (error) {
      showError('An error occurred while creating the leave schedules.');
    }
  };

  // Bulk item helpers
  const addLeaveSlot = () => {
    const newKey = (leaveSlots.length + 1).toString();
    setLeaveSlots([...leaveSlots, { key: newKey, date: dayjs(), startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }]);
  };
  const removeLeaveSlot = (key: string) => {
    if (leaveSlots.length > 1) setLeaveSlots(leaveSlots.filter(item => item.key !== key));
    else showWarning('At least one leave slot is required.');
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

  // New function to handle date range input
  const handleDateRangeInput = (startDate: any, endDate: any, startTime: any, endTime: any) => {
    if (isMultiDayRange(startDate, endDate)) {
      const splitSlots = splitDateRange(startDate, endDate, startTime, endTime);
      setLeaveSlots(splitSlots);
      setActiveTab('bulk');
      showInfo(`Created ${splitSlots.length} daily leave slots from ${dayjs(startDate).format('YYYY-MM-DD')} to ${dayjs(endDate).format('YYYY-MM-DD')}`);
    }
  };

  const handleCancel = () => {
    singleForm.resetFields();
    bulkForm.resetFields();
    setLeaveSlots([{ key: '1', date: dayjs(), startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }]);
    setSelectedDates([dayjs()]);
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
        destroyOnHidden
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Single Leave" key="single">
            <Form
              form={singleForm}
              layout="vertical"
              onFinish={handleSingleSubmit}
              initialValues={{
                startTime: dayjs('09:00', 'HH:mm'),
                endTime: dayjs('17:00', 'HH:mm'),
              }}
            >
              <Form.Item
                label={<Space><CalendarOutlined />Select Date(s)</Space>}
                required
              >
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Select one or multiple dates. If multiple dates are selected, it will automatically switch to Multiple tab.</Text>
                </div>
                
                {/* Date Selection */}
                <div style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Start Date" style={{ marginBottom: 8 }}>
                        <DatePicker
                          style={{ width: '100%' }}
                          format="YYYY-MM-DD"
                          placeholder="Start date"
                          onChange={(startDate) => {
                            if (startDate) {
                              setSelectedDates([startDate]);
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="End Date (Optional)" style={{ marginBottom: 8 }}>
                        <DatePicker
                          style={{ width: '100%' }}
                          format="YYYY-MM-DD"
                          placeholder="End date (for range)"
                          onChange={(endDate) => {
                            if (endDate && selectedDates.length > 0) {
                              const startDate = selectedDates[0];
                              const newDates = [];
                              let current = dayjs(startDate);
                              const end = dayjs(endDate);
                              while (current.isBefore(end) || current.isSame(end, 'day')) {
                                newDates.push(current);
                                current = current.add(1, 'day');
                              }
                              setSelectedDates(newDates);
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Selected Dates Display */}
                {selectedDates.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Selected Dates ({selectedDates.length}):</Text>
                    <div style={{ marginTop: 4, maxHeight: 120, overflowY: 'auto' }}>
                      {selectedDates.map((date, index) => (
                        <Tag 
                          key={index} 
                          closable 
                          onClose={() => setSelectedDates(selectedDates.filter((_, i) => i !== index))}
                          style={{ marginBottom: 4, marginRight: 4 }}
                        >
                          {date.format('YYYY-MM-DD')}
                        </Tag>
                      ))}
                    </div>
                    {selectedDates.length > 1 && (
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => setSelectedDates([])}
                        style={{ padding: 0, marginTop: 4 }}
                      >
                        Clear all dates
                      </Button>
                    )}
                  </div>
                )}
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<Space><ClockCircleOutlined />Start Time</Space>}
                    name="startTime"
                    rules={[{ required: true, message: 'Please select start time' }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} use12Hours={false} />
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
                    <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} use12Hours={false} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                    Create Leave{selectedDates.length > 1 ? `s (${selectedDates.length})` : ''}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Multiple Leaves" key="bulk">
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Create multiple leave slots at once. You can add, remove, or duplicate leave slots. 
                For date ranges, the system will automatically break down into daily slots.
              </Text>
            </div>
            
            {/* Date Range Input Section */}
            <Card size="small" style={{ marginBottom: 16 }} title="Quick Date Range Input">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Start Date" style={{ marginBottom: 8 }}>
                    <DatePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                      placeholder="Start date"
                      onChange={(startDate) => {
                        const endDate = bulkForm.getFieldValue('endDate');
                        const startTime = bulkForm.getFieldValue('rangeStartTime') || dayjs('09:00', 'HH:mm');
                        const endTime = bulkForm.getFieldValue('rangeEndTime') || dayjs('17:00', 'HH:mm');
                        if (startDate && endDate) {
                          handleDateRangeInput(startDate, endDate, startTime, endTime);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="End Date" style={{ marginBottom: 8 }}>
                    <DatePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                      placeholder="End date"
                      onChange={(endDate) => {
                        const startDate = bulkForm.getFieldValue('startDate');
                        const startTime = bulkForm.getFieldValue('rangeStartTime') || dayjs('09:00', 'HH:mm');
                        const endTime = bulkForm.getFieldValue('rangeEndTime') || dayjs('17:00', 'HH:mm');
                        if (startDate && endDate) {
                          handleDateRangeInput(startDate, endDate, startTime, endTime);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Time Range" style={{ marginBottom: 8 }}>
                    <Space>
                      <TimePicker
                        format="HH:mm"
                        placeholder="Start"
                        minuteStep={15}
                        use12Hours={false}
                        onChange={(startTime) => {
                          const startDate = bulkForm.getFieldValue('startDate');
                          const endDate = bulkForm.getFieldValue('endDate');
                          const endTime = bulkForm.getFieldValue('rangeEndTime') || dayjs('17:00', 'HH:mm');
                          if (startDate && endDate && startTime) {
                            handleDateRangeInput(startDate, endDate, startTime, endTime);
                          }
                        }}
                      />
                      <span>-</span>
                      <TimePicker
                        format="HH:mm"
                        placeholder="End"
                        minuteStep={15}
                        use12Hours={false}
                        onChange={(endTime) => {
                          const startDate = bulkForm.getFieldValue('startDate');
                          const endDate = bulkForm.getFieldValue('endDate');
                          const startTime = bulkForm.getFieldValue('rangeStartTime') || dayjs('09:00', 'HH:mm');
                          if (startDate && endDate && endTime) {
                            handleDateRangeInput(startDate, endDate, startTime, endTime);
                          }
                        }}
                      />
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {leaveSlots.map((item, index) => (
              <Card
                key={item.key}
                size="small"
                style={{ marginBottom: 16 }}
                title={<Space><CalendarOutlined />Leave {index + 1} - {dayjs(item.date).format('YYYY-MM-DD')}</Space>}
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
                <Row gutter={[16, 16]} align="bottom" style={{ alignItems: 'flex-start' }}>
                  <Col span={8}>
                    <Form.Item
                      label="Date"
                      required
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <DatePicker
                        value={item.date}
                        onChange={val => updateLeaveSlot(item.key, 'date', val)}
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        placeholder="Date"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Start Time"
                      required
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <TimePicker
                        value={item.startTime}
                        onChange={val => updateLeaveSlot(item.key, 'startTime', val)}
                        format="HH:mm"
                        style={{ width: '100%' }}
                        placeholder="Start time"
                        minuteStep={15}
                        use12Hours={false}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="End Time"
                      required
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <TimePicker
                        value={item.endTime}
                        onChange={val => updateLeaveSlot(item.key, 'endTime', val)}
                        format="HH:mm"
                        style={{ width: '100%' }}
                        placeholder="End time"
                        minuteStep={15}
                        use12Hours={false}
                      />
                    </Form.Item>
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
    </>
  );
};

export default AddLeaveScheduleModal; 