import React, { useState } from 'react';
import { Modal, Input, Button, Typography, Space, Spin, message, Form, Popconfirm, Switch } from 'antd';
import { RobotOutlined, SaveOutlined, SendOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useGenerateCheckpoints, useBulkSaveCheckpoints } from '../../hooks/useStudentFeature';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface AIGenerateTodoModalProps {
  isVisible: boolean;
  onClose: () => void;
  joinedSubjectId: number;
}

interface GeneratedCheckpoint {
  title: string;
  content: string;
  note: string;
  link1: string;
  link2: string;
  link3: string;
  link4: string;
  link5: string;
  deadline: string;
}

const AIGenerateTodoModal: React.FC<AIGenerateTodoModalProps> = ({
  isVisible,
  onClose,
  joinedSubjectId
}) => {
  const [form] = Form.useForm();
  const [studentMessage, setStudentMessage] = useState('');
  const [generatedCheckpoints, setGeneratedCheckpoints] = useState<GeneratedCheckpoint[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm] = Form.useForm();
  const [doReplaceAll, setDoReplaceAll] = useState(false);

  const generateCheckpointsMutation = useGenerateCheckpoints();
  const bulkSaveCheckpointsMutation = useBulkSaveCheckpoints();

  const handleGenerate = async () => {
    if (!studentMessage.trim()) {
      message.warning('Please enter a message for AI generation');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateCheckpointsMutation.mutateAsync({
        joinedSubjectId,
        studentMessage
      });
      
      if (result && result.length > 0) {
        setGeneratedCheckpoints(result);
        message.success(`Generated ${result.length} checkpoints successfully!`);
      } else {
        message.info('No checkpoints were generated. Try a different message.');
      }
    } catch (error) {
      message.error('Failed to generate checkpoints. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (generatedCheckpoints.length === 0) {
      message.warning('No checkpoints to save');
      return;
    }

    try {
      await bulkSaveCheckpointsMutation.mutateAsync({
        joinedSubjectId,
        checkpoints: generatedCheckpoints,
        doReplaceAll
      });
      
      message.success('Checkpoints saved successfully!');
      onClose();
      setGeneratedCheckpoints([]);
      setStudentMessage('');
      setDoReplaceAll(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save checkpoints. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClose = () => {
    setGeneratedCheckpoints([]);
    setStudentMessage('');
    setEditingIndex(null);
    form.resetFields();
    editForm.resetFields();
    onClose();
  };

  const handleEditCheckpoint = (index: number) => {
    const checkpoint = generatedCheckpoints[index];
    setEditingIndex(index);
    editForm.setFieldsValue({
      title: checkpoint.title,
      content: checkpoint.content,
      note: checkpoint.note,
      deadline: checkpoint.deadline,
      link1: checkpoint.link1,
      link2: checkpoint.link2,
      link3: checkpoint.link3,
      link4: checkpoint.link4,
      link5: checkpoint.link5,
    });
  };

  const handleSaveEdit = () => {
    editForm.validateFields().then((values) => {
      const updatedCheckpoints = [...generatedCheckpoints];
      updatedCheckpoints[editingIndex!] = {
        ...updatedCheckpoints[editingIndex!],
        ...values,
        deadline: values.deadline
      };
      setGeneratedCheckpoints(updatedCheckpoints);
      setEditingIndex(null);
      editForm.resetFields();
      message.success('Checkpoint updated successfully!');
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    editForm.resetFields();
  };

  const handleDeleteCheckpoint = (index: number) => {
    const updatedCheckpoints = generatedCheckpoints.filter((_, i) => i !== index);
    setGeneratedCheckpoints(updatedCheckpoints);
    message.success('Checkpoint removed successfully!');
  };

  return (
    <Modal
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      width={1200}
      centered
      title={
        <Space>
          <RobotOutlined style={{ color: '#1890ff' }} />
          <span>AI Generate Todo List</span>
        </Space>
      }
    >
      <div style={{ display: 'flex', gap: '24px', height: '600px' }}>
        {/* Left Panel - Input */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <Title level={5} style={{ marginBottom: '16px' }}>
            Describe what you want to achieve
          </Title>
          
          <Form form={form} layout="vertical" style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
            <Form.Item style={{ flex: '1', marginBottom: '16px' }}>
              <TextArea
                value={studentMessage}
                onChange={(e) => setStudentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your learning goals, project requirements, or what milestones you want to create. For example: 'Create a timeline for learning React with TypeScript, including setup, basic concepts, hooks, and a final project.'"
                style={{ 
                  height: '100%', 
                  resize: 'none',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}
                autoSize={{ minRows: 8, maxRows: 12 }}
              />
            </Form.Item>
            
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleGenerate}
              loading={isGenerating}
              size="large"
              style={{ width: '100%' }}
            >
              {isGenerating ? 'Generating...' : 'Generate Todo List'}
            </Button>
          </Form>
        </div>

        {/* Right Panel - Generated Results */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={5} style={{ margin: 0 }}>
              Generated Checkpoints
            </Title>
            {generatedCheckpoints.length > 0 && (
              <Text type="secondary">
                {generatedCheckpoints.length} items
              </Text>
            )}
          </div>
          
          <div style={{ 
            flex: '1', 
            overflowY: 'auto', 
            border: '1px solid #d9d9d9', 
            borderRadius: '6px',
            padding: '16px',
            backgroundColor: '#fafafa'
          }}>
            {isGenerating ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>
                  <Text>AI is generating your todo list...</Text>
                </div>
              </div>
            ) : generatedCheckpoints.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {generatedCheckpoints.map((checkpoint, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      border: '1px solid #e8e8e8',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {editingIndex === index ? (
                      // Edit Mode
                      <Form form={editForm} layout="vertical">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <Form.Item name="title" style={{ flex: '1', margin: 0, marginRight: '8px' }} rules={[{ required: true, message: 'Title is required' }]}>
                            <Input placeholder="Checkpoint title" style={{ fontSize: '14px', fontWeight: 'bold' }} />
                          </Form.Item>
                          <Form.Item name="deadline" style={{ margin: 0 }} rules={[{ required: true, message: 'Deadline is required' }]}>
                            <Input placeholder="Deadline" style={{ width: '120px', fontSize: '12px' }} />
                          </Form.Item>
                        </div>
                        
                        <Form.Item name="content" style={{ marginBottom: '8px' }} rules={[{ required: true, message: 'Content is required' }]}>
                          <TextArea placeholder="Description" rows={2} style={{ fontSize: '13px' }} />
                        </Form.Item>
                        
                        <Form.Item name="note" style={{ marginBottom: '8px' }}>
                          <TextArea placeholder="Important note (optional)" rows={1} style={{ fontSize: '12px' }} />
                        </Form.Item>
                        
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <Form.Item name="link1" style={{ flex: '1', margin: 0 }}>
                            <Input placeholder="Link 1" style={{ fontSize: '12px' }} />
                          </Form.Item>
                          <Form.Item name="link2" style={{ flex: '1', margin: 0 }}>
                            <Input placeholder="Link 2" style={{ fontSize: '12px' }} />
                          </Form.Item>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                          <Form.Item name="link3" style={{ flex: '1', margin: 0 }}>
                            <Input placeholder="Link 3" style={{ fontSize: '12px' }} />
                          </Form.Item>
                          <Form.Item name="link4" style={{ flex: '1', margin: 0 }}>
                            <Input placeholder="Link 4" style={{ fontSize: '12px' }} />
                          </Form.Item>
                          <Form.Item name="link5" style={{ flex: '1', margin: 0 }}>
                            <Input placeholder="Link 5" style={{ fontSize: '12px' }} />
                          </Form.Item>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Button size="small" onClick={handleCancelEdit}>
                            <CloseOutlined />
                          </Button>
                          <Button type="primary" size="small" onClick={handleSaveEdit}>
                            <CheckOutlined />
                          </Button>
                        </div>
                      </Form>
                    ) : (
                      // View Mode
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <Title level={5} style={{ margin: 0, flex: '1' }}>
                            {checkpoint.title}
                          </Title>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Text type="secondary" style={{ fontSize: '12px', marginRight: '8px' }}>
                              {formatDate(checkpoint.deadline)}
                            </Text>
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditCheckpoint(index)}
                              style={{ padding: '2px 4px' }}
                            />
                                                         <Popconfirm
                               title="Remove this checkpoint?"
                               description="This action cannot be undone."
                               onConfirm={() => handleDeleteCheckpoint(index)}
                               okText="Yes"
                               cancelText="No"
                               okButtonProps={{ style: { marginRight: '8px' } }}
                               cancelButtonProps={{ style: { marginLeft: '8px' } }}
                             >
                               <Button
                                 type="text"
                                 size="small"
                                 icon={<DeleteOutlined />}
                                 danger
                                 style={{ padding: '2px 4px' }}
                               />
                             </Popconfirm>
                          </div>
                        </div>
                        
                        <Text style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>
                          {checkpoint.content}
                        </Text>
                        
                        {checkpoint.note && (
                          <div style={{ 
                            backgroundColor: '#fff7e6', 
                            padding: '8px', 
                            borderRadius: '4px', 
                            border: '1px solid #ffd591',
                            marginBottom: '8px'
                          }}>
                            <Text style={{ fontSize: '12px', color: '#d46b08' }}>
                              <strong>Note:</strong> {checkpoint.note}
                            </Text>
                          </div>
                        )}
                        
                        {/* Links */}
                        {[checkpoint.link1, checkpoint.link2, checkpoint.link3, checkpoint.link4, checkpoint.link5]
                          .filter(link => link && link.trim() !== '')
                          .map((link, linkIndex) => (
                            <div key={linkIndex} style={{ marginBottom: '4px' }}>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  fontSize: '12px', 
                                  color: '#1890ff',
                                  wordBreak: 'break-all'
                                }}
                              >
                                {link}
                              </a>
                            </div>
                          ))}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <RobotOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>
                  <Text>No checkpoints generated yet</Text>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Enter a description and click "Generate Todo List"
                  </Text>
                </div>
              </div>
            )}
          </div>
          
                     {generatedCheckpoints.length > 0 && (
             <>
               <div style={{ 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'space-between', 
                 marginTop: '16px',
                 padding: '12px',
                 backgroundColor: '#f5f5f5',
                 borderRadius: '6px',
                 border: '1px solid #d9d9d9'
               }}>
                 <div>
                   <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                     Save Options
                   </Text>
                   <Text type="secondary" style={{ fontSize: '12px' }}>
                     {doReplaceAll ? 'Replace all existing checkpoints' : 'Add new checkpoints to existing ones'}
                   </Text>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Text style={{ fontSize: '12px' }}>Add New</Text>
                   <Switch
                     checked={doReplaceAll}
                     onChange={setDoReplaceAll}
                     checkedChildren="Replace All"
                     unCheckedChildren="Add New"
                   />
                 </div>
               </div>
               <Button
                 type="primary"
                 icon={<SaveOutlined />}
                 onClick={handleSave}
                 loading={bulkSaveCheckpointsMutation.isPending}
                 size="large"
                 style={{ width: '100%', marginTop: '12px' }}
               >
                 {bulkSaveCheckpointsMutation.isPending ? 'Saving...' : 'Save All Checkpoints'}
               </Button>
             </>
           )}
        </div>
      </div>
    </Modal>
  );
};

export default AIGenerateTodoModal;
