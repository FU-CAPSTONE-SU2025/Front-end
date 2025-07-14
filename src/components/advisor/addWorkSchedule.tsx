import React, { useState } from 'react';
import { Modal, Form, TimePicker, Select, Button, message, Space, Tabs, Card, Typography, Divider, Row, Col } from 'antd';
import { PlusOutlined, ClockCircleOutlined, CalendarOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { 
  useCreateBookingAvailability, 
  useCreateBulkBookingAvailability,
  useUpdateBookingAvailability,
  useDeleteBookingAvailability
} from '../../hooks/useCRUDAdvisor';
import { CreateBookingAvailabilityRequest, CreateBulkBookingAvailabilityRequest } from '../../interfaces/IBookingAvailability';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface AddWorkScheduleProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface ScheduleItem {
  key: string;
  dayInWeek: number;
  startTime: any;
  endTime: any;
}

const AddWorkSchedule: React.FC<AddWorkScheduleProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [singleForm] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('single');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { key: '1', dayInWeek: 1, startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }
  ]);
  
  const createBookingAvailability = useCreateBookingAvailability();
  const createBulkBookingAvailability = useCreateBulkBookingAvailability();

  const dayOptions = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' },
  ];

  const getDayName = (dayInWeek: number): string => {
    return dayOptions.find(day => day.value === dayInWeek)?.label || 'Unknown';
  };

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
    const item = scheduleItems[index];
    if (item.startTime && item.endTime) {
      const start = dayjs(item.startTime);
      const end = dayjs(item.endTime);
      
      if (start.isAfter(end) || start.isSame(end)) {
        return false;
      }
    }
    return true;
  };

  const handleSingleSubmit = async (values: any) => {
    try {
      // Convert dayjs time objects to string format HH:mm:ss
      const startTime = values.startTime.format('HH:mm:ss');
      const endTime = values.endTime.format('HH:mm:ss');
      
      await createBookingAvailability.mutateAsync({
        startTime,
        endTime,
        dayInWeek: values.dayInWeek
      });

      // If no error is thrown, consider it successful
      message.success('Work schedule created successfully!');
      singleForm.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error creating work schedule:', error);
      message.error('An error occurred while creating the work schedule.');
    }
  };

  const handleBulkSubmit = async () => {
    try {
      // Validate all items
      const invalidItems = scheduleItems.filter((_, index) => !validateBulkTimeRange(index));
      if (invalidItems.length > 0) {
        message.error('Please check that all end times are after start times.');
        return;
      }

      // Convert to API format
      const bulkData = scheduleItems.map(item => ({
        startTime: dayjs(item.startTime).format('HH:mm:ss'),
        endTime: dayjs(item.endTime).format('HH:mm:ss'),
        dayInWeek: item.dayInWeek
      }));

      await createBulkBookingAvailability.mutateAsync(bulkData);

      // If no error is thrown, consider it successful
      message.success(`Successfully created ${scheduleItems.length} work schedules!`);
      setScheduleItems([{ key: '1', dayInWeek: 1, startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }]);
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error creating bulk work schedules:', error);
      message.error('An error occurred while creating the work schedules.');
    }
  };

  const addScheduleItem = () => {
    const newKey = (scheduleItems.length + 1).toString();
    setScheduleItems([...scheduleItems, {
      key: newKey,
      dayInWeek: 1,
      startTime: dayjs('09:00', 'HH:mm'),
      endTime: dayjs('17:00', 'HH:mm')
    }]);
  };

  const removeScheduleItem = (key: string) => {
    if (scheduleItems.length > 1) {
      setScheduleItems(scheduleItems.filter(item => item.key !== key));
    } else {
      message.warning('At least one schedule item is required.');
    }
  };

  const updateScheduleItem = (key: string, field: keyof ScheduleItem, value: any) => {
    setScheduleItems(scheduleItems.map(item => 
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  const duplicateScheduleItem = (key: string) => {
    const itemToDuplicate = scheduleItems.find(item => item.key === key);
    if (itemToDuplicate) {
      const newKey = (scheduleItems.length + 1).toString();
      setScheduleItems([...scheduleItems, {
        ...itemToDuplicate,
        key: newKey
      }]);
    }
  };

  const handleCancel = () => {
    singleForm.resetFields();
    bulkForm.resetFields();
    setScheduleItems([{ key: '1', dayInWeek: 1, startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }]);
    onCancel();
  };

  const isLoading = createBookingAvailability.isPending || createBulkBookingAvailability.isPending;

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined />
          Add Work Schedule
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Single Schedule" key="single">
          <Form
            form={singleForm}
            layout="vertical"
            onFinish={handleSingleSubmit}
            initialValues={{
              startTime: dayjs('09:00', 'HH:mm'),
              endTime: dayjs('17:00', 'HH:mm'),
              dayInWeek: 1
            }}
          >
            <Form.Item
              label={
                <Space>
                  <CalendarOutlined />
                  Day of Week
                </Space>
              }
              name="dayInWeek"
              rules={[{ required: true, message: 'Please select a day of the week' }]}
            >
              <Select placeholder="Select day of week">
                {dayOptions.map(day => (
                  <Option key={day.value} value={day.value}>
                    {day.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <Space>
                      <ClockCircleOutlined />
                      Start Time
                    </Space>
                  }
                  name="startTime"
                  rules={[{ required: true, message: 'Please select start time' }]}
                >
                  <TimePicker
                    format="HH:mm"
                    placeholder="Select start time"
                    style={{ width: '100%' }}
                    minuteStep={15}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <Space>
                      <ClockCircleOutlined />
                      End Time
                    </Space>
                  }
                  name="endTime"
                  rules={[
                    { required: true, message: 'Please select end time' },
                    { validator: validateTimeRange }
                  ]}
                >
                  <TimePicker
                    format="HH:mm"
                    placeholder="Select end time"
                    style={{ width: '100%' }}
                    minuteStep={15}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  icon={<PlusOutlined />}
                >
                  Create Schedule
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="Multiple Schedules" key="bulk">
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Create multiple work schedules at once. You can add, remove, or duplicate schedule items.
            </Text>
          </div>

          {scheduleItems.map((item, index) => (
            <Card
              key={item.key}
              size="small"
              style={{ marginBottom: 16 }}
              title={
                <Space>
                  <CalendarOutlined />
                  Schedule {index + 1}
                </Space>
              }
              extra={
                <Space>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => duplicateScheduleItem(item.key)}
                    title="Duplicate"
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeScheduleItem(item.key)}
                    title="Remove"
                  />
                </Space>
              }
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Day of Week"
                    required
                  >
                    <Select
                      value={item.dayInWeek}
                      onChange={(value) => updateScheduleItem(item.key, 'dayInWeek', value)}
                      placeholder="Select day"
                    >
                      {dayOptions.map(day => (
                        <Option key={day.value} value={day.value}>
                          {day.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Start Time"
                    required
                  >
                    <TimePicker
                      value={item.startTime}
                      onChange={(value) => updateScheduleItem(item.key, 'startTime', value)}
                      format="HH:mm"
                      placeholder="Start time"
                      style={{ width: '100%' }}
                      minuteStep={15}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="End Time"
                    required
                  >
                    <TimePicker
                      value={item.endTime}
                      onChange={(value) => updateScheduleItem(item.key, 'endTime', value)}
                      format="HH:mm"
                      placeholder="End time"
                      style={{ width: '100%' }}
                      minuteStep={15}
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
            onClick={addScheduleItem}
            style={{ width: '100%', marginBottom: 16 }}
            icon={<PlusOutlined />}
          >
            Add Another Schedule
          </Button>

          <Divider />

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleBulkSubmit}
              loading={isLoading}
              icon={<PlusOutlined />}
            >
              Create {scheduleItems.length} Schedule{scheduleItems.length > 1 ? 's' : ''}
            </Button>
          </Space>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default AddWorkSchedule; 