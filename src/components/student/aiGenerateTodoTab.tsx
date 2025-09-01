import React, { useState } from 'react';
import { Input, Button, Typography, Space, Spin, message, Form, Switch, Card, Tag } from 'antd';
import { RobotOutlined, SaveOutlined, SendOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, CalendarOutlined } from '@ant-design/icons';
import { useGenerateCheckpoints, useBulkSaveCheckpoints } from '../../hooks/useStudentFeature';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface AIGenerateTodoTabProps {
  joinedSubjectId: number;
  onSuccess?: () => void;
  ownerGitRepo?: string | null;
  gitRepoName?: string | null;
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

const AIGenerateTodoTab: React.FC<AIGenerateTodoTabProps> = ({
  joinedSubjectId,
  onSuccess,
  ownerGitRepo,
  gitRepoName
}) => {
  const [form] = Form.useForm();
  const [studentMessage, setStudentMessage] = useState('');
  const [generatedCheckpoints, setGeneratedCheckpoints] = useState<GeneratedCheckpoint[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm] = Form.useForm();
  const [doReplaceAll, setDoReplaceAll] = useState(false);

  // Message popup context
  const { showSuccess, showError, showWarning, showInfo } = useMessagePopupContext();

  // Hooks for API calls
  const generateCheckpointsMutation = useGenerateCheckpoints();
  const bulkSaveCheckpointsMutation = useBulkSaveCheckpoints();

  const handleGenerate = async () => {
    if (!studentMessage.trim()) {
      showWarning('Please enter a message for AI generation');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateCheckpointsMutation.mutateAsync({
        joinedSubjectId,
        studentMessage: studentMessage.trim(),
        ownerGitRepo: ownerGitRepo ?? '',
        gitRepoName: gitRepoName ?? ''
      });

      if (result && result.length > 0) {
        setGeneratedCheckpoints(result);
        showSuccess(`Generated ${result.length} checkpoints successfully!`);
      } else {
        showInfo('No checkpoints were generated. Try a different message.');
      }
    } catch (error) {
      showError('Failed to generate checkpoints. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (generatedCheckpoints.length === 0) {
      showWarning('No checkpoints to save');
      return;
    }

    setIsGenerating(true);
    try {
      await bulkSaveCheckpointsMutation.mutateAsync({
        joinedSubjectId,
        checkpoints: generatedCheckpoints.map(checkpoint => ({
          ...checkpoint,
          joinedSubjectId
        })),
        doReplaceAll
      });
      
      showSuccess('Checkpoints saved successfully!');
      setGeneratedCheckpoints([]);
      setStudentMessage('');
      setDoReplaceAll(false);
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      showError('Failed to save checkpoints. Please try again.');
    } finally {
      setIsGenerating(false);
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
      showSuccess('Checkpoint updated successfully!');
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    editForm.resetFields();
  };

  const handleDeleteCheckpoint = (index: number) => {
    const updatedCheckpoints = generatedCheckpoints.filter((_, i) => i !== index);
    setGeneratedCheckpoints(updatedCheckpoints);
    showSuccess('Checkpoint removed successfully!');
  };

  return (
    <div className="!space-y-6 !mb-10">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <RobotOutlined className="text-2xl !text-white" />
          <Title level={3} className="!text-white !mb-0">AI Generate Todo</Title>
        </div>
        <Text className="!text-white">
          Describe your learning goals, project requirements, or milestones you want AI to generate for you.
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Input */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          <Text className="!text-white !text-lg font-semibold mb-4 block">
            Describe what you want to achieve
          </Text>
          
          <Form form={form} layout="vertical" className="!space-y-10">
            <Form.Item>
              <TextArea
                value={studentMessage}
                onChange={(e) => setStudentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your learning goals, project requirements, or milestones you want."
                className="!bg-white/10 !border-white/20 !text-white placeholder:text-gray-400"
                autoSize={{ minRows: 8, maxRows: 12 }}
              />
            </Form.Item>
            
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleGenerate}
              loading={isGenerating}
              size="large"
              className="w-full !h-12 !text-base !font-bold !bg-orange-500 hover:!bg-orange-600 !border-orange-500"
            >
              {isGenerating ? 'Generating…' : 'Generate Todo'}
            </Button>
          </Form>
        </div>

        {/* Right Panel - Generated Results */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <Text className="!text-white !text-lg font-semibold">
              Generated Checkpoints
            </Text>
            {generatedCheckpoints.length > 0 && (
              <Tag className="!text-white !bg-orange-500 hover:!bg-orange-600 !border-orange-500">
                {generatedCheckpoints.length} items
              </Tag>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-3">
            {isGenerating ? (
              <div className="text-center py-12">
                <Spin size="large" className="!text-blue-400" />
                <div className="mt-4 text-white">
                  <Text className="!text-white">AI is generating your todo list…</Text>
                </div>
              </div>
            ) : generatedCheckpoints.length > 0 ? (
              generatedCheckpoints.map((checkpoint, index) => (
                <Card
                  key={index}
                  className="!bg-white/5 !border-white/20 !text-white"
                  bodyStyle={{ padding: '16px' }}
                >
                  {editingIndex === index ? (
                    // Edit Mode
                    <Form form={editForm} layout="vertical">
                      <div className="flex justify-between items-start mb-3 gap-3">
                        <Form.Item name="title" className="flex-1 !mb-0" rules={[{ required: true, message: 'Title is required' }]}>
                          <Input 
                            placeholder="Checkpoint title" 
                            className="!bg-white/10 !border-white/20 !text-white"
                          />
                        </Form.Item>
                        <Form.Item name="deadline" className="!mb-0" rules={[{ required: true, message: 'Deadline is required' }]}>
                          <Input 
                            placeholder="Deadline" 
                            className="!w-32 !bg-white/10 !border-white/20 !text-white"
                          />
                        </Form.Item>
                      </div>
                      
                      <Form.Item name="content" className="!mb-2" rules={[{ required: true, message: 'Content is required' }]}>
                        <TextArea 
                          placeholder="Description" 
                          rows={2} 
                          className="!bg-white/10 !border-white/20 !text-white"
                        />
                      </Form.Item>
                      
                      <Form.Item name="note" className="!mb-2">
                        <TextArea 
                          placeholder="Important note (optional)" 
                          rows={1} 
                          className="!bg-white/10 !border-white/20 !text-white"
                        />
                      </Form.Item>
                      
                      <div className="flex gap-2 mb-2">
                        <Form.Item name="link1" className="flex-1 !mb-0">
                          <Input placeholder="Link 1" className="!bg-white/10 !border-white/20 !text-white" />
                        </Form.Item>
                        <Form.Item name="link2" className="flex-1 !mb-0">
                          <Input placeholder="Link 2" className="!bg-white/10 !border-white/20 !text-white" />
                        </Form.Item>
                      </div>
                      
                      <div className="flex gap-2 mb-3">
                        <Form.Item name="link3" className="flex-1 !mb-0">
                          <Input placeholder="Link 3" className="!bg-white/10 !border-white/20 !text-white" />
                        </Form.Item>
                        <Form.Item name="link4" className="flex-1 !mb-0">
                          <Input placeholder="Link 4" className="!bg-white/10 !border-white/20 !text-white" />
                        </Form.Item>
                        <Form.Item name="link5" className="flex-1 !mb-0">
                          <Input placeholder="Link 5" className="!bg-white/10 !border-white/20 !text-white" />
                        </Form.Item>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <Button size="small" onClick={handleCancelEdit} icon={<CloseOutlined />} className="!text-white !bg-orange-500 hover:!bg-orange-600 !border-orange-500  ">
                        </Button>
                        <Button type="primary" size="small" onClick={handleSaveEdit} icon={<CheckOutlined />}>
                        </Button>
                      </div>
                    </Form>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <Text className="!text-white font-semibold text-base">
                          {checkpoint.title}
                        </Text>
                        <div className="flex items-center gap-2">
                          <Tag  className="!text-white !bg-orange-500 hover:!bg-orange-600 !border-orange-500">
                            <CalendarOutlined className="mr-1" />
                            {formatDate(checkpoint.deadline)}
                          </Tag>
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditCheckpoint(index)}
                            className="!text-white hover:!bg-white/10"
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDeleteCheckpoint(index)}
                            className="hover:!bg-white/10"
                          />
                        </div>
                      </div>
                      
                      <Text className="!text-white text-sm block mb-3">
                        {checkpoint.content}
                      </Text>
                      
                      {checkpoint.note && (
                        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-3">
                          <Text className="!text-yellow-200 text-sm">
                            <strong>Note:</strong> {checkpoint.note}
                          </Text>
                        </div>
                      )}
                      
                      {/* Links */}
                      {[checkpoint.link1, checkpoint.link2, checkpoint.link3, checkpoint.link4, checkpoint.link5]
                        .filter(link => link && link.trim() !== '')
                        .map((link, linkIndex) => (
                          <div key={linkIndex} className="mb-1 bg-white border border-yellow-500/30 rounded-lg p-3">
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm break-all"
                          >
                            {link}
                          </a>
                        </div>
                        ))}
                    </>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg">
                <RobotOutlined className="text-4xl !text-white mb-3" />
                <div className="text-white">
                  <Text className="!text-white">No checkpoints generated yet</Text>
                </div>
                <div className="mt-2">
                  <Text className="!text-gray-300 text-sm">
                    Enter a description and click Generate
                  </Text>
                </div>
              </div>
            )}
          </div>
          
          {generatedCheckpoints.length > 0 && (
            <>
              <div className="mt-6 p-4 bg-white/5 border border-white/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="!text-white font-semibold block mb-1">
                      Save Options
                    </Text>
                    <Text className="!text-gray-300 text-sm">
                      {doReplaceAll ? (
                        <span className="!text-white">Replace all existing checkpoints</span>
                      ) : (
                        <span className="!text-blue-300">Add new checkpoints to existing ones</span>
                      )}
                    </Text>
                  </div>
                  <Switch
                    checked={doReplaceAll}
                    onChange={setDoReplaceAll}
                    className="scale-125 !bg-orange-500 hover:!bg-orange-600 !border-orange-500"
                  />
                </div>
              </div>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={isGenerating}
                size="large"
                className="w-full !mt-5 !h-12 !text-base !font-bold !bg-orange-500 hover:!bg-orange-600 !border-orange-500 mt-4"
              >
                {isGenerating ? 'Saving…' : 'Save All Checkpoints'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGenerateTodoTab;
