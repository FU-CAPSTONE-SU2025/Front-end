import React from 'react';
import { Modal, Form, Input, InputNumber, Switch, Button, Row, Col, Card } from 'antd';
import { ICreateRoadmapNodeRequest } from '../../interfaces/IRoadMap';

interface CreateNodeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (values: ICreateRoadmapNodeRequest) => void;
  isLoading: boolean;
}

const CreateNodeModal: React.FC<CreateNodeModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: ICreateRoadmapNodeRequest) => {
    onSubmit(values);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Add New Subject"
      open={isVisible}
      onCancel={handleCancel}
      footer={null}
      width={900}
      className="bg-white/95 backdrop-blur-lg"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {/* Basic Information Card */}
        <Card 
          size="small" 
          className="mb-4 border-orange-200 bg-orange-50/30"
          title={<span className="text-orange-700 font-semibold">Basic Information</span>}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                label="Subject Code"
                name="subjectCode"
                rules={[{ required: true, message: 'Please enter subject code' }]}
              >
                <Input placeholder="e.g., CS101" />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Semester Number"
                name="semesterNumber"
                rules={[{ required: true, message: 'Please enter semester number' }]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  placeholder="e.g., 1"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Internal Subject"
                name="isInternalSubjectData"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Subject Name"
                name="subjectName"
                rules={[{ required: true, message: 'Please enter subject name' }]}
              >
                <Input placeholder="e.g., Introduction to Computer Science and Programming Fundamentals" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Description Card */}
        <Card 
          size="small" 
          className="mb-4 border-blue-200 bg-blue-50/30"
          title={<span className="text-blue-700 font-semibold">Subject Description</span>}
        >
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Provide a comprehensive description of the subject, including learning objectives, topics covered, and expected outcomes. This description will help students understand what they will learn in this course."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Card>

        {/* Help Text */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm text-gray-700 font-medium mb-1">Internal Subject</p>
              <p className="text-xs text-gray-600">
                Toggle <strong>ON</strong> if this is a subject from your school curriculum, 
                <strong> OFF</strong> if it's a custom learning milestone or external course.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
          <Button onClick={handleCancel} size="large">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            size="large"
            className="bg-orange-500 border-none hover:bg-orange-600 px-8"
          >
            Add Subject
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateNodeModal;
