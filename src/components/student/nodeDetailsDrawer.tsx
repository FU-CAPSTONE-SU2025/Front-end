import React, { useState, useEffect } from 'react';
import { Drawer, Tag, Spin, Divider, Button, Modal, Tooltip, Form, Input, InputNumber, Switch } from 'antd';
import { BookOutlined, CalendarOutlined, InfoCircleOutlined, LinkOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { IRoadmapNode, ICreateRoadmapNodeRequest } from '../../interfaces/IRoadMap';
import { GetRoadmapNode } from '../../api/student/RoadMapAPI';
import { useRoadmap } from '../../hooks/useRoadmap';
import { useNavigate } from 'react-router';

// Minimal markdown to HTML converter (safe-ish, no external deps)
function simpleMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  // Escape HTML first
  let text = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks ```code```
  text = text.replace(/```([\s\S]*?)```/g, (_m, code) => {
    const safe = code.replace(/\n/g, '\n');
    return `<pre style="background: #0f172a0d; padding: 12px; border-radius: 8px; overflow:auto"><code>${safe}</code></pre>`;
  });

  // Headings #, ##, ###
  text = text
    .replace(/^###\s+(.*)$/gm, '<h3 style="margin:8px 0 6px; color:#111827">$1</h3>')
    .replace(/^##\s+(.*)$/gm, '<h2 style="margin:10px 0 6px; color:#111827">$1</h2>')
    .replace(/^#\s+(.*)$/gm, '<h1 style="margin:12px 0 6px; color:#111827">$1</h1>');

  // Bold and italics (order matters)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline code `code`
  text = text.replace(/`([^`]+)`/g, '<code style="background:#0f172a0d; padding:2px 6px; border-radius:6px">$1</code>');

  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#2563eb">$1</a>');

  // Simple unordered lists - each line starting with - or * becomes a list item
  text = text.replace(/^(?:-|\*)\s+(.*)$/gm, '<li>$1</li>');
  // Wrap isolated li with ul
  text = text.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul style="margin:6px 0 6px 18px; list-style:disc">$1</ul>');

  // Paragraphs: split by double newline and wrap if not already block elements
  const blocks = text.split(/\n\n+/).map(b => {
    if (/^\s*<(h\d|ul|pre|blockquote)/.test(b)) return b;
    return `<p style="margin:6px 0; color:#374151">${b.replace(/\n/g, '<br/>')}</p>`;
  });

  return blocks.join('\n');
}

interface NodeDetailsDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  nodeId: string;
  onNodeDeleted?: () => void; // Callback khi node bị xóa
  onNodeUpdated?: () => void; // Callback khi node được cập nhật
}

const NodeDetailsDrawer: React.FC<NodeDetailsDrawerProps> = ({ 
  isVisible, 
  onClose, 
  nodeId,
  onNodeDeleted,
  onNodeUpdated
}) => {
  const [nodeDetails, setNodeDetails] = useState<IRoadmapNode | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm] = Form.useForm();
  
  const { deleteNode, updateNode, isLoading: isDeleting } = useRoadmap();
  const navigate = useNavigate();

  const handleSubjectCodeClick = () => {
    if (!nodeDetails?.subjectCode) return;
    // Navigate to new page that will display joined subjects by subject code
    navigate(`/student/joined-subjects-by-code?subjectCode=${encodeURIComponent(nodeDetails.subjectCode)}`);
  };

  useEffect(() => {
    if (isVisible) {
      fetchNodeDetails();
    }
  }, [isVisible, nodeId]);

  const fetchNodeDetails = async () => {
    setIsLoadingDetails(true);
    
    try {
      const details = await GetRoadmapNode(parseInt(nodeId));
      if (details) {
        setNodeDetails(details);
      }
    } catch (error) {
      console.error('Error fetching node details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleClose = () => {
    setNodeDetails(null);
    onClose();
  };

  const handleDeleteClick = () => {
    setIsDeleteModalVisible(true);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    // Pre-fill edit form with current values
    if (nodeDetails) {
      editForm.setFieldsValue({
        subjectCode: nodeDetails.subjectCode,
        semesterNumber: nodeDetails.semesterNumber,
        subjectName: nodeDetails.subjectName,
        description: nodeDetails.description,
        isInternalSubjectData: nodeDetails.isInternalSubjectData || true,
      });
    }
    // Slight delay to ensure inputs mount before focusing
    setTimeout(() => {
      const subjectNameInput = document.querySelector<HTMLInputElement>('input#drawer-subject-name');
      subjectNameInput?.focus();
    }, 0);
  };

  const handleEditSave = async () => {
    try {
      setIsSaving(true);
      const values = await editForm.validateFields();
      const success = await updateNode(parseInt(nodeId), values);

      if (success) {
        setIsEditing(false);
        setNodeDetails(prev => prev ? { ...prev, ...values } : null);
        if (onNodeUpdated) {
          onNodeUpdated();
        }
      }
    } catch (error) {
      // validation or mutation error handled elsewhere
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    editForm.resetFields();
  };

  const handleDeleteConfirm = async () => {
    try {
      const success = await deleteNode(parseInt(nodeId));
      
      if (success) {
        setIsDeleteModalVisible(false);
        handleClose(); // Đóng drawer
        
        // Gọi callback để refresh roadmap nếu cần
        if (onNodeDeleted) {
          onNodeDeleted();
        }
      }
    } catch (error) {
      // Error đã được xử lý trong hook
      console.error('Error in delete confirmation:', error);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
  };

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <BookOutlined className="text-orange-500" />
              <span>Subject Details</span>
            </div>
            
            {/* Action Buttons */}
            {nodeDetails && (
              <div className="flex items-center gap-2">
                {/* Edit Button */}
                <Tooltip 
                  title={isEditing ? "Save changes" : "Edit this subject"} 
                  placement="left"
                  color="#3b82f6"
                >
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={isEditing ? handleEditSave : handleEditClick}
                    className={isEditing 
                      ? "!text-green-500 hover:!text-green-600 hover:!bg-green-50 !border !border-green-200 hover:!border-green-300"
                      : "!text-blue-500 hover:!text-blue-600 hover:!bg-blue-50 !border !border-blue-200 hover:!border-blue-300"
                    }
                    size="small"
                    loading={isDeleting}
                  >
                    {isEditing ? "Save" : ""}
                  </Button>
                </Tooltip>

                {/* Cancel Edit Button (only show when editing) */}
                {isEditing && (
                  <Tooltip 
                    title="Cancel editing" 
                    placement="left"
                    color="#6b7280"
                  >
                    <Button
                      type="text"
                      onClick={handleEditCancel}
                      className="!text-gray-500 hover:!text-gray-600 hover:!bg-gray-50 !border !border-gray-200 hover:!border-gray-300"
                      size="small"
                    >
                      Cancel
                    </Button>
                  </Tooltip>
                )}
                
                {/* Delete Button */}
                <Tooltip 
                  title="Delete this subject from roadmap" 
                  placement="left"
                  color="#ef4444"
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteClick}
                    className="!text-red-500 hover:!text-red-600 hover:!bg-red-50 !border !border-red-200 hover:!border-red-300"
                    size="small"
                    danger
                  />
                </Tooltip>
              </div>
            )}
          </div>
        }
        placement="right"
        onClose={handleClose}
        open={isVisible}
        width={500}
        className="bg-white/95 backdrop-blur-lg"
        headerStyle={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)' 
        }}
        bodyStyle={{ background: 'rgba(255, 255, 255, 0.95)' }}
      >
        {isLoadingDetails ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : nodeDetails ? (
          <Form form={editForm} layout="vertical">
            <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {isEditing ? (
                  <Form.Item
                    name="subjectCode"
                    rules={[{ required: true, message: 'Please enter subject code!' }]}
                    className="mb-0"
                  >
                    <Input 
                      placeholder="e.g., SSL101c" 
                      className="w-32"
                    />
                  </Form.Item>
                ) : (
                  <Tooltip title="View your joined subjects with this code">
                    <Tag 
                      color="orange" 
                      className="font-semibold text-base px-3 py-1 cursor-pointer hover:opacity-80"
                      onClick={handleSubjectCodeClick}
                    >
                      {nodeDetails.subjectCode}
                    </Tag>
                  </Tooltip>
                )}
                
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarOutlined />
                  {isEditing ? (
                    <Form.Item
                      name="semesterNumber"
                      rules={[{ required: true, message: 'Please enter semester number!' }]}
                      className="mb-0"
                    >
                      <InputNumber 
                        min={1} 
                        max={10} 
                        placeholder="e.g., 1" 
                        className="w-20"
                      />
                    </Form.Item>
                  ) : (
                    <span className="font-medium">Semester {nodeDetails.semesterNumber}</span>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <Form.Item
                  name="subjectName"
                  rules={[{ required: true, message: 'Please enter subject name!' }]}
                  className="mb-0"
                >
                  <Input 
                    placeholder="e.g., Academic Skills for University Success" 
                    className="text-xl font-bold"
                    id="drawer-subject-name"
                  />
                </Form.Item>
              ) : (
                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                  {nodeDetails.subjectName}
                </h2>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <InfoCircleOutlined className="text-blue-500" />
                  Description
                </h4>
                {isEditing ? (
                  <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please enter description!' }]}
                    className="mb-0"
                  >
                    <Input.TextArea 
                      rows={3} 
                      placeholder="Enter subject description..."
                      className="resize-none"
                    />
                  </Form.Item>
                ) : (
                  <div
                    className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(nodeDetails.description || '') }}
                  />
                )}
              </div>

              {/* Internal Subject Data Switch - Only show when editing */}
              {isEditing && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <Form.Item
                    name="isInternalSubjectData"
                    valuePropName="checked"
                    className="mb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-700">Internal Subject Data</span>
                      <Switch />
                    </div>
                  </Form.Item>
                </div>
              )}
            </div>

            <Divider />

     
          </div>
        </Form>
        ) : (
          <div className="text-center py-20 text-gray-500">
            Failed to load node details
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Subject"
        open={isDeleteModalVisible}
        onCancel={handleDeleteCancel}
        footer={[
          <Button key="cancel" onClick={handleDeleteCancel}>
            Cancel
          </Button>,
          <Button 
            key="confirm" 
            danger 
            type="primary" 
            onClick={handleDeleteConfirm}
            loading={isDeleting}
          >
            Delete Subject
          </Button>,
        ]}
        className="bg-white/95 backdrop-blur-lg"
      >
        <div className="py-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this subject from your roadmap?
          </p>
          {nodeDetails && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <DeleteOutlined className="text-red-500" />
                <span className="font-semibold text-red-700">Subject to Delete:</span>
              </div>
              <div className="space-y-1">
                <div className="text-red-700">
                  <span className="font-medium">Code:</span> {nodeDetails.subjectCode}
                </div>
                <div className="text-red-700">
                  <span className="font-medium">Name:</span> {nodeDetails.subjectName}
                </div>
                <div className="text-red-700">
                  <span className="font-medium">Semester:</span> {nodeDetails.semesterNumber}
                </div>
              </div>
            </div>
          )}
          <p className="text-sm text-red-600">
            <strong>Warning:</strong> This action cannot be undone. All connections to and from this subject will also be removed.
          </p>
        </div>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal
        title="Edit Subject"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={[
          <Button key="cancel" onClick={handleEditCancel}>
            Cancel
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            onClick={handleEditSave}
            loading={isDeleting}
            className="bg-blue-500 border-none hover:bg-blue-600"
          >
            Update Subject
          </Button>,
        ]}
        className="bg-white/95 backdrop-blur-lg"
        width={600}
      >
        <div className="py-4">
          <Form
            form={editForm}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              label="Subject Code"
              name="subjectCode"
              rules={[{ required: true, message: 'Please enter subject code!' }]}
            >
              <Input placeholder="e.g., SSL101c" />
            </Form.Item>

            <Form.Item
              label="Semester Number"
              name="semesterNumber"
              rules={[{ required: true, message: 'Please enter semester number!' }]}
            >
              <InputNumber 
                min={1} 
                max={10} 
                placeholder="e.g., 1" 
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label="Subject Name"
              name="subjectName"
              rules={[{ required: true, message: 'Please enter subject name!' }]}
            >
              <Input placeholder="e.g., Academic Skills for University Success" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please enter description!' }]}
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Enter subject description..."
              />
            </Form.Item>

            <Form.Item
              label="Internal Subject Data"
              name="isInternalSubjectData"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default NodeDetailsDrawer;
