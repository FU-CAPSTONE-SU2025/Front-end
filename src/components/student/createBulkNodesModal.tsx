import React from 'react';
import { Modal, Form, Input, InputNumber, Switch, Button, Card, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ICreateRoadmapNodeRequest } from '../../interfaces/IRoadMap';

interface CreateBulkNodesModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (values: { nodes: ICreateRoadmapNodeRequest[] }) => void;
  isLoading: boolean;
}

const CreateBulkNodesModal: React.FC<CreateBulkNodesModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: { nodes: ICreateRoadmapNodeRequest[] }) => {
    onSubmit(values);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Bulk Add Subjects"
      open={isVisible}
      onCancel={handleCancel}
      footer={null}
      width={1200}
      className="bg-white/95 backdrop-blur-lg"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
        initialValues={{
          nodes: [
            {
              subjectCode: '',
              subjectName: '',
              semesterNumber: 1,
              description: '',
              isInternalSubjectData: true,
            }
          ]
        }}
      >
        <Form.List name="nodes">
          {(fields, { add, remove }) => (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Subject List</h3>
                  <Button
                    type="dashed"
                    onClick={() => add({
                      subjectCode: '',
                      subjectName: '',
                      semesterNumber: 1,
                      description: '',
                      isInternalSubjectData: true,
                    })}
                    icon={<PlusOutlined />}
                    className="border-orange-300 text-orange-600 hover:border-orange-400 hover:text-orange-700"
                  >
                    Add Another Subject
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      className="border-orange-200 bg-orange-50/30"
                      extra={
                        fields.length > 1 ? (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                            className="text-red-500 hover:text-red-700"
                          />
                        ) : null
                      }
                    >
                      <Row gutter={[16, 16]}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'subjectCode']}
                            label="Subject Code"
                            rules={[{ required: true, message: 'Please enter subject code' }]}
                          >
                            <Input placeholder="e.g., CS101" />
                          </Form.Item>
                        </Col>
                        
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'semesterNumber']}
                            label="Semester"
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
                        
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'isInternalSubjectData']}
                            label="Internal Subject"
                            valuePropName="checked"
                          >
                            <Switch />
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'subjectName']}
                            label="Subject Name"
                            rules={[{ required: true, message: 'Please enter subject name' }]}
                          >
                            <Input placeholder="e.g., Introduction to Computer Science" />
                          </Form.Item>
                        </Col>
                        
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'description']}
                            label="Description"
                            rules={[{ required: true, message: 'Please enter description' }]}
                          >
                            <Input.TextArea
                              rows={2}
                              placeholder="Brief description of the subject..."
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="bg-orange-500 border-none hover:bg-orange-600"
                >
                  Add All Subjects ({fields.length})
                </Button>
              </div>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default CreateBulkNodesModal;
