import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Space, message, DatePicker } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useCreateCheckpoint } from '../../hooks/useStudentFeature';
import dayjs from 'dayjs';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';

const { TextArea } = Input;
const { Title } = Typography;

interface AddManualTodoModalProps {
  isVisible: boolean;
  onClose: () => void;
  joinedSubjectId: number;
}

const AddManualTodoModal: React.FC<AddManualTodoModalProps> = ({
  isVisible,
  onClose,
  joinedSubjectId
}) => {
  const [form] = Form.useForm();
  const [linkCount, setLinkCount] = useState(2); // Start with 2 link fields
  const createCheckpointMutation = useCreateCheckpoint();
  const { showSuccess, showError } = useMessagePopupContext();

  const handleClose = () => {
    form.resetFields();
    setLinkCount(2); // Reset to 2 links when closing
    onClose();
  };

  const handleAddLink = () => {
    if (linkCount < 5) {
      setLinkCount(linkCount + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Prepare links array
      const links = [];
      for (let i = 1; i <= linkCount; i++) {
        const linkValue = values[`link${i}`] || '';
        if (linkValue.trim()) {
          links.push(linkValue);
        }
      }
      
      // Pad with empty strings to ensure 5 links
      while (links.length < 5) {
        links.push('');
      }
      
      // Format deadline from dayjs to ISO string
      const deadline = values.deadline ? values.deadline.toISOString() : '';
      
      await createCheckpointMutation.mutateAsync({
        joinedSubjectId,
        data: {
          title: values.title,
          content: values.content,
          note: values.note || '',
          link1: links[0] || '',
          link2: links[1] || '',
          link3: links[2] || '',
          link4: links[3] || '',
          link5: links[4] || '',
          deadline: deadline
        }
      });
      
      showSuccess('Todo item added successfully!');
      handleClose();
    } catch (error) {
      showError('Failed to add todo item. Please try again.');
    }
  };

  return (
    <Modal
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      width={600}
      centered
      title={
        <Space>
          <PlusOutlined style={{ color: '#52c41a' }} />
          <span>Add Manual Todo</span>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Enter todo title" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Enter detailed description of the todo item"
          />
        </Form.Item>

        <Form.Item
          name="note"
          label="Important Note (Optional)"
        >
          <TextArea 
            rows={2} 
            placeholder="Any important notes or reminders"
          />
        </Form.Item>

        <Form.Item
          name="deadline"
          label="Deadline"
          rules={[{ required: true, message: 'Please select a deadline' }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>

        <Title level={5} style={{ marginTop: '16px', marginBottom: '8px' }}>
          Useful Links (Optional)
        </Title>

        {/* Dynamic link fields */}
        {Array.from({ length: linkCount }, (_, index) => (
          <Form.Item 
            key={index} 
            name={`link${index + 1}`} 
            style={{ marginBottom: '8px' }}
          >
            <Input placeholder={`Link ${index + 1}`} />
          </Form.Item>
        ))}

        {/* Add Link button */}
        {linkCount < 5 && (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddLink}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            Add Link
          </Button>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button onClick={handleClose} size="large">
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={createCheckpointMutation.isPending}
            size="large"
          >
            {createCheckpointMutation.isPending ? 'Adding...' : 'Add Todo'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddManualTodoModal;
