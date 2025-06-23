import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Space, Typography, Select, Card, Tag } from 'antd';
import { SaveOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Combo, Subject } from '../../interfaces/ISchoolProgram';
import { combos, subjects, comboSubjects } from '../../data/schoolData';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ComboEditProps {
  id?: number;
}

const ComboEdit: React.FC<ComboEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<Combo | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const isCreateMode = !id;
  const isEditMode = !!id;

  // Load existing data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const combo = combos.find(c => c.id === id);
      if (combo) {
        setInitialData(combo);
        form.setFieldsValue(combo);
        
        // Load associated subjects
        const comboSubjectIds = comboSubjects
          .filter(cs => cs.comboId === id)
          .map(cs => cs.subjectId);
        setSelectedSubjects(comboSubjectIds);
      }
    }
  }, [id, isEditMode, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const comboData: Partial<Combo> = {
        ...values
      };

      if (isCreateMode) {
        // Simulate API call for create
        console.log('Creating combo:', comboData);
        console.log('Selected subjects:', selectedSubjects);
        message.success('Combo created successfully!');
      } else {
        // Simulate API call for update
        console.log('Updating combo:', { id, ...comboData });
        console.log('Selected subjects:', selectedSubjects);
        message.success('Combo updated successfully!');
      }
      
      // Reset form after successful submission
      if (isCreateMode) {
        form.resetFields();
        setSelectedSubjects([]);
      }
    } catch (error) {
      message.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Simulate API call for delete
      console.log('Deleting combo:', id);
      message.success('Combo deleted successfully!');
      // Navigate back or reset form
    } catch (error) {
      message.error('An error occurred while deleting.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (value: number[]) => {
    setSelectedSubjects(value);
  };

  const getSelectedSubjectNames = () => {
    return selectedSubjects.map(subjectId => {
      const subject = subjects.find(s => s.id === subjectId);
      return subject ? subject.subjectName : '';
    }).filter(name => name);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <Title level={4} style={{ color: '#1E40AF', marginBottom: '2rem', textAlign: 'center' }}>
        {isCreateMode ? 'Create New Combo' : 'Edit Combo'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Form.Item
          label="Combo Name"
          name="comboName"
          rules={[
            { required: true, message: 'Please enter combo name!' },
            { min: 3, message: 'Combo name must be at least 3 characters!' }
          ]}
        >
          <Input 
            placeholder="e.g., AI Electives" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Please enter combo description!' },
            { min: 10, message: 'Description must be at least 10 characters!' }
          ]}
        >
          <TextArea 
            placeholder="Enter a detailed description of the combo..."
            rows={4}
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          label="Select Subjects"
          name="subjects"
          rules={[
            { required: true, message: 'Please select at least one subject!' }
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select subjects for this combo"
            value={selectedSubjects}
            onChange={handleSubjectChange}
            style={{ borderRadius: 8 }}
            optionFilterProp="children"
          >
            {subjects.map(subject => (
              <Option key={subject.id} value={subject.id}>
                {subject.subjectName} ({subject.subjectCode})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Display selected subjects */}
        {selectedSubjects.length > 0 && (
          <Card 
            size="small" 
            title="Selected Subjects" 
            style={{ marginBottom: '1rem', borderRadius: 8 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {getSelectedSubjectNames().map((subjectName, index) => (
                <Tag 
                  key={index} 
                  color="blue"
                  style={{ borderRadius: 6, padding: '4px 8px' }}
                >
                  {subjectName}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        <Form.Item style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Space size="large">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              style={{
                borderRadius: 999,
                height: 48,
                paddingLeft: 32,
                paddingRight: 32,
                background: '#1E40AF',
                border: 'none',
                fontWeight: 600
              }}
            >
              {isCreateMode ? 'Create Combo' : 'Update Combo'}
            </Button>
            
            {isEditMode && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                loading={loading}
                style={{
                  borderRadius: 999,
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                  fontWeight: 600
                }}
              >
                Delete Combo
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ComboEdit; 