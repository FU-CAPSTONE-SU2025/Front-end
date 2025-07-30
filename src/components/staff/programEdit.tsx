import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Space, Typography, Modal } from 'antd';
import { SaveOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Program, CreateProgram } from '../../interfaces/ISchoolProgram';
import { useCRUDProgram } from '../../hooks/useCRUDSchoolMaterial';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';

const { Title } = Typography;

interface ProgramEditProps {
  id?: number;
}

const ProgramEdit: React.FC<ProgramEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const [initialData, setInitialData] = useState<Program | null>(null);
  const isCreateMode = !id;
  const isEditMode = !!id;

  // Use the Program CRUD hook
  const {
    getProgramById,
    addProgramMutation,
    updateProgramMutation,
    disableProgramMutation,
    isSuccessCreateProgram,
    isSuccessUpdateProgram
  } = useCRUDProgram();

  // Load existing data if in edit mode
  useEffect(() => {
    if (isEditMode && id && !initialData) {
      getProgramById.mutate(id, {
        onSuccess: (program) => {
          if (program) {
            setInitialData(program);
            form.setFieldsValue({
              programCode: program.programCode,
              programName: program.programName
            });
          } else {
            message.error('Program not found');
          }
        },
        onError: (error) => {
          console.error('Failed to fetch program:', error);
          message.error('Failed to load program data');
        }
      });
    }
  }, [id, isEditMode, form, initialData]); // Removed getProgramById from dependencies

  // Reset initialData when ID changes to handle navigation between different programs
  useEffect(() => {
    setInitialData(null);
  }, [id]);

  // Handle successful operations
  useEffect(() => {
    if (isSuccessCreateProgram) {
      message.success('Program created successfully!');
      if (isCreateMode) {
        form.resetFields();
      }
    }
  }, [isSuccessCreateProgram, isCreateMode, form]);

  useEffect(() => {
    if (isSuccessUpdateProgram) {
      message.success('Program updated successfully!');
    }
  }, [isSuccessUpdateProgram]);

  const onFinish = async (values: CreateProgram) => {
    try {
      if (isCreateMode) {
        // Create new program
        addProgramMutation.mutate(values, {
          onError: (error) => {
            console.error('Create error:', error);
            const errorMessage = getUserFriendlyErrorMessage(error);
            message.error(errorMessage);
          }
        });
      } else {
        // Update existing program
        updateProgramMutation.mutate({
          id: id!,
          data: values
        }, {
          onError: (error) => {
            console.error('Update error:', error);
            const errorMessage = getUserFriendlyErrorMessage(error);
            message.error(errorMessage);
          }
        });
      }
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      message.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!id || !initialData) return;
    
    Modal.confirm({
      title: 'Delete Program',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${initialData.programName}"? This action cannot be undone and may affect related curriculums.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        disableProgramMutation.mutate(id, {
          onSuccess: () => {
            message.success('Program deleted successfully!');
            // Navigate back or reset form
            form.resetFields();
          },
          onError: (error) => {
            console.error('Delete error:', error);
            const errorMessage = getUserFriendlyErrorMessage(error);
            message.error(errorMessage);
          }
        });
      },
    });
  };

  // Loading states
  const isLoading = addProgramMutation.isPending || updateProgramMutation.isPending || disableProgramMutation.isPending;
  const isLoadingData = getProgramById.isPending;

  if (isEditMode && isLoadingData) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <Title level={4} style={{ color: '#1E40AF', marginBottom: '2rem' }}>
          Loading program data...
        </Title>
      </div>
    );
  } 

  return (
    <div style={{ padding: '1rem' }}>
      <Title level={4} style={{ color: '#1E40AF', marginBottom: '2rem', textAlign: 'center' }}>
        {isCreateMode ? 'Create New Program' : `Edit Program: ${initialData?.programName || ''}`}
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
            { pattern: /^[A-Z0-9_-]+$/, message: 'Program code must contain only "-", "_", uppercase letters and numbers!' }
          ]}
        >
          <Input 
            placeholder="e.g., SE, IT, BA" 
            style={{ borderRadius: 8 }}
            maxLength={30}
          />
        </Form.Item>

        <Form.Item
          label="Program Name"
          name="programName"
          rules={[
            { required: true, message: 'Please enter program name!' },
            { min: 3, message: 'Program name must be at least 3 characters!' },
            { max: 100, message: 'Program name must not exceed 100 characters!' }
          ]}
        >
          <Input 
            placeholder="e.g., Software Engineering, Information Technology" 
            style={{ borderRadius: 8 }}
            maxLength={100}
          />
        </Form.Item>

        <Form.Item style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Space size="large">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={isLoading}
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
            
            {isEditMode && initialData && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                loading={isLoading}
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

        {isEditMode && initialData && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '16px', 
            background: '#f8fafc', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <Title level={5} style={{ margin: 0, color: '#64748b' }}>Program Information</Title>
            <p style={{ margin: '8px 0 0 0', color: '#64748b' }}>
              <strong>ID:</strong> {initialData.id} | 
              <strong> Code:</strong> {initialData.programCode} | 
              <strong> Name:</strong> {initialData.programName}
            </p>
          </div>
        )}
      </Form>
    </div>
  );
};

export default ProgramEdit; 