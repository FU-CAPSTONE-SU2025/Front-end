import React, { useState } from 'react';
import { Modal, Input, Button, Typography, Space, Spin, message, Form, Switch } from 'antd';
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
      width={1080}
      centered
      title={
        <Space size={8}>
          <RobotOutlined style={{ color: '#8c8c8c' }} />
          <span style={{ fontWeight: 600 }}>AI Generate Todo</span>
        </Space>
      }
    >
      <div style={{ display: 'flex', gap: 24, height: 560 }}>
        {/* Left Panel - Input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Text style={{ color: '#595959', marginBottom: 12, fontWeight: 600 }}>
            Describe what you want to achieve
          </Text>
          
          <Form form={form} layout="vertical" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Form.Item style={{ flex: 1, marginBottom: 12 }}>
              <TextArea
                value={studentMessage}
                onChange={(e) => setStudentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your learning goals, project requirements, or milestones you want."
                style={{ 
                  height: '100%', 
                  resize: 'none',
                  fontSize: 14,
                  lineHeight: 1.6,
                  background: '#fafafa',
                  borderColor: '#d9d9d9'
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
              {isGenerating ? 'Generating…' : 'Generate'}
            </Button>
          </Form>
        </div>

        {/* Right Panel - Generated Results */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ margin: 0, fontWeight: 600, color: '#595959' }}>
              Generated Checkpoints
            </Text>
            {generatedCheckpoints.length > 0 && (
              <Text type="secondary">
                {generatedCheckpoints.length} items
              </Text>
            )}
          </div>
          
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            border: '1px solid rgba(0,0,0,0.06)', 
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#fff'
          }}>
            {isGenerating ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary">AI is generating your todo list…</Text>
                </div>
              </div>
            ) : generatedCheckpoints.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {generatedCheckpoints.map((checkpoint, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 12,
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 10,
                      backgroundColor: '#fcfcfc'
                    }}
                  >
                    {editingIndex === index ? (
                      // Edit Mode
                      <Form form={editForm} layout="vertical">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                          <Form.Item name="title" style={{ flex: 1, margin: 0 }} rules={[{ required: true, message: 'Title is required' }]}>
                            <Input placeholder="Checkpoint title" style={{ fontSize: 14, fontWeight: 600 }} />
                          </Form.Item>
                          <Form.Item name="deadline" style={{ margin: 0 }} rules={[{ required: true, message: 'Deadline is required' }]}>
                            <Input placeholder="Deadline" style={{ width: 140, fontSize: 12 }} />
                          </Form.Item>
                        </div>
                        
                        <Form.Item name="content" style={{ marginBottom: 8 }} rules={[{ required: true, message: 'Content is required' }]}>
                          <TextArea placeholder="Description" rows={2} style={{ fontSize: 13 }} />
                        </Form.Item>
                        
                        <Form.Item name="note" style={{ marginBottom: 8 }}>
                          <TextArea placeholder="Important note (optional)" rows={1} style={{ fontSize: 12 }} />
                        </Form.Item>
                        
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <Form.Item name="link1" style={{ flex: 1, margin: 0 }}>
                            <Input placeholder="Link 1" style={{ fontSize: 12 }} />
                          </Form.Item>
                          <Form.Item name="link2" style={{ flex: 1, margin: 0 }}>
                            <Input placeholder="Link 2" style={{ fontSize: 12 }} />
                          </Form.Item>
                        </div>
                        
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                          <Form.Item name="link3" style={{ flex: 1, margin: 0 }}>
                            <Input placeholder="Link 3" style={{ fontSize: 12 }} />
                          </Form.Item>
                          <Form.Item name="link4" style={{ flex: 1, margin: 0 }}>
                            <Input placeholder="Link 4" style={{ fontSize: 12 }} />
                          </Form.Item>
                          <Form.Item name="link5" style={{ flex: 1, margin: 0 }}>
                            <Input placeholder="Link 5" style={{ fontSize: 12 }} />
                          </Form.Item>
                        </div>
                        
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <Button size="small" onClick={handleCancelEdit} icon={<CloseOutlined />}>
                          </Button>
                          <Button type="primary" size="small" onClick={handleSaveEdit} icon={<CheckOutlined />}>
                          </Button>
                        </div>
                      </Form>
                    ) : (
                      // View Mode
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <Text style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
                            {checkpoint.title}
                          </Text>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Text type="secondary" style={{ fontSize: 12, marginRight: 6 }}>
                              {formatDate(checkpoint.deadline)}
                            </Text>
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditCheckpoint(index)}
                              style={{ padding: '2px 4px' }}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                              danger
                              style={{ padding: '2px 4px' }}
                              onClick={() => handleDeleteCheckpoint(index)}
                            />
                          </div>
                        </div>
                        
                        <Text style={{ fontSize: 13, color: '#595959', display: 'block', marginBottom: 8 }}>
                          {checkpoint.content}
                        </Text>
                        
                        {checkpoint.note && (
                          <div style={{ 
                            backgroundColor: '#f5f5f5', 
                            padding: 8, 
                            borderRadius: 6, 
                            border: '1px solid rgba(0,0,0,0.06)',
                            marginBottom: 8
                          }}>
                            <Text style={{ fontSize: 12, color: '#595959' }}>
                              <strong>Note:</strong> {checkpoint.note}
                            </Text>
                          </div>
                        )}
                        
                        {/* Links */}
                        {[checkpoint.link1, checkpoint.link2, checkpoint.link3, checkpoint.link4, checkpoint.link5]
                          .filter(link => link && link.trim() !== '')
                          .map((link, linkIndex) => (
                            <div key={linkIndex} style={{ marginBottom: 4 }}>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  fontSize: 12, 
                                  color: '#1677ff',
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
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 0', 
                color: '#8c8c8c',
                border: '1px dashed rgba(0,0,0,0.06)',
                borderRadius: 8
              }}>
                <RobotOutlined style={{ fontSize: 42, marginBottom: 12, color: '#bfbfbf' }} />
                <div>
                  <Text>No checkpoints generated yet</Text>
                </div>
                <div style={{ marginTop: 6 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Enter a description and click Generate
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
                 marginTop: 12,
                 padding: 16,
                 backgroundColor: '#f8f9fa',
                 borderRadius: 12,
                 border: '1px solid rgba(0,0,0,0.08)',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
               }}>
                 <div>
                   <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 6, color: '#262626' }}>
                     Save Options
                   </Text>
                                       <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.4 }}>
                      {doReplaceAll ? (
                        <span style={{ color: '#ff4d4f' }}>Replace all existing checkpoints</span>
                      ) : (
                        <span style={{ color: '#1677ff' }}>Add new checkpoints to existing ones</span>
                      )}
                    </Text>
                 </div>
                                   <div>
                    <Switch
                      checked={doReplaceAll}
                      onChange={setDoReplaceAll}
                      size="default"
                      style={{
                        backgroundColor: doReplaceAll ? '#1677ff' : '#d9d9d9',
                        transform: 'scale(1.3)'
                      }}
                    />
                  </div>
               </div>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={bulkSaveCheckpointsMutation.isPending}
                size="large"
                style={{ width: '100%', marginTop: 12 }}
              >
                {bulkSaveCheckpointsMutation.isPending ? 'Saving…' : 'Save All Checkpoints'}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AIGenerateTodoModal;
