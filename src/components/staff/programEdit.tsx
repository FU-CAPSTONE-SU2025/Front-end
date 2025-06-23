import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Space, Typography } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { Program } from '../../interfaces/ISchoolProgram';
import { programs } from '../../data/schoolData';

const { Title } = Typography;

interface ProgramEditProps {
  id?: number;
}

const ProgramEdit: React.FC<ProgramEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<Program | null>(null);
  const isCreateMode = !id;
  const isEditMode = !!id;

  // Load existing data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const program = programs.find(p => p.id === id);
      if (program) {
        setInitialData(program);
        form.setFieldsValue(program);
      }
    }
  }, [id, isEditMode, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const programData: Partial<Program> = {
        ...values
      };

      if (isCreateMode) {
        // Simulate API call for create
        console.log('Creating program:', programData);
        message.success('Program created successfully!');
      } else {
        // Simulate API call for update
        console.log('Updating program:', { id, ...programData });
        message.success('Program updated successfully!');
      }
      
      // Reset form after successful submission
      if (isCreateMode) {
        form.resetFields();
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
      console.log('Deleting program:', id);
      message.success('Program deleted successfully!');
      // Navigate back or reset form
    } catch (error) {
      message.error('An error occurred while deleting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <Title level={4} style={{ color: '#1E40AF', marginBottom: '2rem', textAlign: 'center' }}>
        {isCreateMode ? 'Create New Program' : 'Edit Program'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Form.Item
          label="Program Code"
          name="programCode"
          rules={[
            { required: true, message: 'Please enter program code!' },
            { min: 2, message: 'Program code must be at least 2 characters!' },
            { pattern: /^[A-Z0-9]+$/, message: 'Program code must contain only uppercase letters and numbers!' }
          ]}
        >
          <Input 
            placeholder="e.g., CS101" 
            style={{ borderRadius: 8 }}
            disabled={isEditMode} // Code shouldn't be changed after creation
          />
        </Form.Item>

        <Form.Item
          label="Program Name"
          name="programName"
          rules={[
            { required: true, message: 'Please enter program name!' },
            { min: 3, message: 'Program name must be at least 3 characters!' }
          ]}
        >
          <Input 
            placeholder="e.g., Computer Science" 
            style={{ borderRadius: 8 }}
          />
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
              {isCreateMode ? 'Create Program' : 'Update Program'}
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
                Delete Program
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProgramEdit; 