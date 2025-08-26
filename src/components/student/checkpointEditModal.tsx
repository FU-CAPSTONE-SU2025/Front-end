import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, DatePicker, Space, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { SubjectCheckpointDetail } from '../../interfaces/IStudent';
import { useUpdateCheckpoint } from '../../hooks/useStudentFeature';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title } = Typography;

interface CheckpointEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  checkpointDetail: SubjectCheckpointDetail | null;
}

const CheckpointEditModal: React.FC<CheckpointEditModalProps> = ({
  isVisible,
  onClose,
  checkpointDetail
}) => {
  const [form] = Form.useForm();
  const [linkFields, setLinkFields] = useState<string[]>([]);
  const updateCheckpointMutation = useUpdateCheckpoint();

  // Initialize form and link fields when modal opens
  useEffect(() => {
    if (isVisible && checkpointDetail) {
      const links = [
        checkpointDetail.link1,
        checkpointDetail.link2,
        checkpointDetail.link3,
        checkpointDetail.link4,
        checkpointDetail.link5
      ].filter(link => link && link.trim() !== '');

      setLinkFields(links);
      
      form.setFieldsValue({
        title: checkpointDetail.title,
        content: checkpointDetail.content,
        note: checkpointDetail.note,
        deadline: dayjs(checkpointDetail.deadline),
        ...links.reduce((acc, link, index) => {
          acc[`link${index + 1}`] = link;
          return acc;
        }, {} as Record<string, string>)
      });
    }
  }, [isVisible, checkpointDetail, form]);

  const handleSubmit = async (values: any) => {
    if (!checkpointDetail) return;

    try {
      // Prepare links array (fill with empty strings for missing links)
      const links = Array(5).fill('').map((_, index) => {
        const linkKey = `link${index + 1}`;
        return values[linkKey] || '';
      });

      const updateData = {
        title: values.title,
        content: values.content,
        note: values.note || '',
        deadline: values.deadline.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        link1: links[0],
        link2: links[1],
        link3: links[2],
        link4: links[3],
        link5: links[4],
      };

      await updateCheckpointMutation.mutateAsync({
        checkpointId: checkpointDetail.id,
        data: updateData
      });

      message.success('Checkpoint updated successfully!');
      onClose();
    } catch (error) {
      message.error('Failed to update checkpoint');
    }
  };

  const addLinkField = () => {
    if (linkFields.length < 5) {
      setLinkFields([...linkFields, '']);
    }
  };

  const removeLinkField = (index: number) => {
    const newLinkFields = linkFields.filter((_, i) => i !== index);
    setLinkFields(newLinkFields);
    
    // Clear the form field
    form.setFieldValue(`link${index + 1}`, '');
  };

  const handleCancel = () => {
    form.resetFields();
    setLinkFields([]);
    onClose();
  };

  return (
    <Modal
      open={isVisible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      title={
        <Space>
          <Title level={5} style={{ margin: 0 }}>Edit Checkpoint</Title>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          title: '',
          content: '',
          note: '',
          deadline: dayjs(),
        }}
      >
        {/* Title */}
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Enter checkpoint title" />
        </Form.Item>

        {/* Content */}
        <Form.Item
          name="content"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Enter checkpoint description"
          />
        </Form.Item>

        {/* Note */}
        <Form.Item
          name="note"
          label="Important Note"
        >
          <TextArea 
            rows={3} 
            placeholder="Enter important note (optional)"
          />
        </Form.Item>

        {/* Deadline */}
        <Form.Item
          name="deadline"
          label="Deadline"
          rules={[{ required: true, message: 'Please select a deadline' }]}
        >
          <DatePicker 
            showTime 
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="Select deadline"
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* Links Section */}
        <Form.Item label="Useful Links">
          <Space direction="vertical" style={{ width: '100%' }}>
            {linkFields.map((_, index) => (
              <Space key={index} style={{ width: '100%' }}>
                <Form.Item
                  name={`link${index + 1}`}
                  style={{ flex: 1, margin: 0 }}
                >
                  <Input 
                    placeholder={`Link ${index + 1}`}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => removeLinkField(index)}
                  danger
                />
              </Space>
            ))}
            
            {linkFields.length < 5 && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addLinkField}
                style={{ width: '100%' }}
              >
                Add Link
              </Button>
            )}
          </Space>
        </Form.Item>

        {/* Action Buttons */}
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={updateCheckpointMutation.isPending}
            >
              Update Checkpoint
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CheckpointEditModal;
