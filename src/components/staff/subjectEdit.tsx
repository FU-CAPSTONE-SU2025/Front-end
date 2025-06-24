import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, message, Space, Typography, Select } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { Subject } from '../../interfaces/ISchoolProgram';
import { subjects } from '../../data/schoolData';
import { subjectPrerequisites } from '../../data/schoolData';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface SubjectEditProps {
  id?: number;
}

const SubjectEdit: React.FC<SubjectEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<Subject | null>(null);
  const [prereqIds, setPrereqIds] = useState<number[]>([]);
  const isCreateMode = !id;
  const isEditMode = !!id;

  // Load existing data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const subject = subjects.find(s => s.id === id);
      if (subject) {
        setInitialData(subject);
        form.setFieldsValue(subject);
        // Pre-fill prerequisites
        const prereqs = subjectPrerequisites
          .filter(sp => sp.subject_id === id)
          .map(sp => sp.prerequisite_subject_id);
        setPrereqIds(prereqs);
        form.setFieldsValue({ prerequisites: prereqs });
      }
    }
  }, [id, isEditMode, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const subjectData: Partial<Subject> = {
        ...values,
        credits: parseInt(values.credits)
      };
      const selectedPrereqs: number[] = values.prerequisites || [];

      if (isCreateMode) {
        // Simulate API call for create
        console.log('Creating subject:', subjectData);
        console.log('With prerequisites:', selectedPrereqs);
        message.success('Subject created successfully!');
      } else {
        // Simulate API call for update
        console.log('Updating subject:', { id, ...subjectData });
        console.log('With prerequisites:', selectedPrereqs);
        message.success('Subject updated successfully!');
      }
      
      // Reset form after successful submission
      if (isCreateMode) {
        form.resetFields();
        setPrereqIds([]);
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
      console.log('Deleting subject:', id);
      message.success('Subject deleted successfully!');
      // Navigate back or reset form
    } catch (error) {
      message.error('An error occurred while deleting.');
    } finally {
      setLoading(false);
    }
  };

  // All other subjects except this one
  const otherSubjects = subjects.filter(s => s.id !== id);

  return (
    <div style={{ padding: '1rem' }}>
      <Title level={4} style={{ color: '#1E40AF', marginBottom: '2rem', textAlign: 'center' }}>
        {isCreateMode ? 'Create New Subject' : 'Edit Subject'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Form.Item
          label="Subject Code"
          name="subjectCode"
          rules={[
            { required: true, message: 'Please enter subject code!' },
            { min: 2, message: 'Subject code must be at least 2 characters!' },
            { pattern: /^[A-Z0-9]+$/, message: 'Subject code must contain only uppercase letters and numbers!' }
          ]}
        >
          <Input 
            placeholder="e.g., CS101" 
            style={{ borderRadius: 8 }}
            disabled={isEditMode} // Code shouldn't be changed after creation
          />
        </Form.Item>

        <Form.Item
          label="Subject Name"
          name="subjectName"
          rules={[
            { required: true, message: 'Please enter subject name!' },
            { min: 3, message: 'Subject name must be at least 3 characters!' }
          ]}
        >
          <Input 
            placeholder="e.g., Introduction to Computer Science" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          label="Credits"
          name="credits"
          rules={[
            { required: true, message: 'Please enter number of credits!' },
            { type: 'number', min: 1, max: 6, message: 'Credits must be between 1 and 6!' }
          ]}
        >
          <InputNumber
            placeholder="e.g., 3"
            style={{ width: '100%', borderRadius: 8 }}
            min={1}
            max={6}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Please enter subject description!' },
            { min: 10, message: 'Description must be at least 10 characters!' }
          ]}
        >
          <TextArea 
            placeholder="Enter a detailed description of the subject..."
            rows={4}
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          label="Prerequisite Subjects"
          name="prerequisites"
          extra="Select one or more subjects that must be completed before this subject."
        >
          <Select
            mode="multiple"
            placeholder="Select prerequisite subjects"
            value={prereqIds}
            onChange={setPrereqIds}
            style={{ borderRadius: 8 }}
            optionFilterProp="children"
            showSearch
            allowClear
          >
            {otherSubjects.map(subject => (
              <Option key={subject.id} value={subject.id}>
                {subject.subjectName} ({subject.subjectCode})
              </Option>
            ))}
          </Select>
        </Form.Item>

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
              {isCreateMode ? 'Create Subject' : 'Update Subject'}
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
                Delete Subject
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SubjectEdit; 