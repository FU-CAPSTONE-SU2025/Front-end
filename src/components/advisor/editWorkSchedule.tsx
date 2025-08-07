import React, { useState, useEffect } from 'react';
import { Modal, Form, TimePicker, Select, Button, message, Space, Typography, Card, Alert, Row, Col } from 'antd';
import { EditOutlined, ClockCircleOutlined, CalendarOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useGetBookingAvailabilityById, useUpdateBookingAvailability } from '../../hooks/useCRUDAdvisor';
import { BookingAvailability, UpdateBookingAvailabilityRequest } from '../../interfaces/IBookingAvailability';
import dayjs, { Dayjs } from 'dayjs';
import { dayOptions } from '../../interfaces/IDayOptions';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';

const { Option } = Select;

interface EditWorkScheduleProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  scheduleId: number | null;
}

const EditWorkSchedule: React.FC<EditWorkScheduleProps> = ({
  visible,
  onCancel,
  onSuccess,
  scheduleId
}) => {
  const [form] = Form.useForm();
  const updateBookingAvailability = useUpdateBookingAvailability();
  const { data: schedule, isLoading: isLoadingSchedule } = useGetBookingAvailabilityById(scheduleId);

  // Set form values when schedule changes or modal opens
  useEffect(() => {
    if (schedule && visible && !isLoadingSchedule) {
      // Use setTimeout to ensure the form is ready
      setTimeout(() => {
        form.setFieldsValue({
          dayInWeek: schedule.dayInWeek,
          startTime: dayjs(schedule.startTime, 'HH:mm:ss'),
          endTime: dayjs(schedule.endTime, 'HH:mm:ss')
        });
      }, 100);
    }
  }, [schedule, visible, form, isLoadingSchedule, scheduleId]);

  // Show loading message when fetching schedule details
  useEffect(() => {
    if (visible && scheduleId && isLoadingSchedule) {
      message.loading('Loading schedule details...', 0);
    } else {
      message.destroy();
    }
  }, [visible, scheduleId, isLoadingSchedule]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const validateTimeRange = (_: any, value: any) => {
    const startTime = form.getFieldValue('startTime');
    const endTime = form.getFieldValue('endTime');
    
    if (startTime && endTime) {
      const start = dayjs(startTime);
      const end = dayjs(endTime);
      
      if (start.isAfter(end) || start.isSame(end)) {
        return Promise.reject(new Error('End time must be after start time'));
      }
    }
    
    return Promise.resolve();
  };

  const handleSubmit = async (values: any) => {
    if (!schedule || !scheduleId) {
      message.error('Schedule details not loaded. Please try again.');
      return;
    }

    try {
      // Convert dayjs time objects to string format HH:mm:ss
      const updateData: UpdateBookingAvailabilityRequest = {
        startTime: values.startTime.format('HH:mm:ss'),
        endTime: values.endTime.format('HH:mm:ss'),
        dayInWeek: values.dayInWeek
      };
      
      await updateBookingAvailability.mutateAsync({
        id: scheduleId,
        data: updateData
      });

      // If no error is thrown, consider it successful
      message.success('Work schedule updated successfully!');
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error updating work schedule:', error);
      message.error('An error occurred while updating the work schedule.');
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const isLoading = updateBookingAvailability.isPending || isLoadingSchedule;
  useEffect(() => {
    if (visible && scheduleId && !isLoadingSchedule && !schedule) {
      message.error('Failed to load schedule details. Please try again.');
    }
  }, [visible, scheduleId, isLoadingSchedule, schedule]);

  const getDayName = (dayInWeek: number): string => {
    return dayOptions.find(day => day.value === dayInWeek)?.label || 'Unknown';
  };

  const formatTime = (time: string | undefined): string => {
    if (!time) return '--:--';
    return time.substring(0, 5); 
  };
  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          Edit Work Schedule
          {schedule && (
            <span style={{ 
              background: '#1890ff', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ID: {schedule.id}
            </span>
          )}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      {schedule && (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #d9d9d9',
          color: 'white'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'white' }}>
            📅 Schedule Details (ID: #{schedule.id})
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
            <div style={{ marginBottom: '6px' }}>
              <strong>Day:</strong> {getDayName(schedule.dayInWeek)}
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong>Time:</strong> {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
            </div>
            <div>
              <strong>Staff Profile ID:</strong> {schedule.staffProfileId}
            </div>
          </div>
        </div>
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
          <Space style={{ width: '100%', justifyContent: '' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<EditOutlined />}
              disabled={!schedule || isLoadingSchedule}
            >
              Update Schedule
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditWorkSchedule; 