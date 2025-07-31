import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, message, Space, Typography, Select } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import { CreateSubject, Subject } from '../../interfaces/ISchoolProgram';

const { Title } = Typography;
const { TextArea } = Input;

interface SubjectEditProps {
  id?: number;
}

const SubjectEdit: React.FC<SubjectEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const isCreateMode = !id;
  const isEditMode = !!id;

  // CRUD hook
  const {
    getSubjectById,
    addSubjectMutation,
    updateSubjectMutation,
    isLoading,
    addPrerequisiteMutation,
  } = useCRUDSubject();

  // Fetch subject by ID on mount (edit mode)
  useEffect(() => {
    if (isEditMode && id) {
      getSubjectById.mutate(id); 
    }
  }, [id, isEditMode]);

  // Set form fields when data is loaded 
  useEffect(() => {
    if (isEditMode && getSubjectById.data) {
      const s = getSubjectById.data;
      form.setFieldsValue(s);
    }
  }, [getSubjectById.data, isEditMode, form]);
  const onFinish = async (values: any) => {
    try {
      const subjectData: Partial<Subject> = {
        ...values,
        credits: parseInt(values.credits)
      };
      const selectedPrereqs: number[] = values.prerequisites || [];

      if (isCreateMode) {
        // Ensure subjectCode is a string (not undefined) to satisfy CreateSubject type
        if (!subjectData.subjectCode) {
          message.error('Subject code is required!');
          return;
        }
        const created = await addSubjectMutation.mutateAsync(subjectData as CreateSubject);
        message.success('Subject created successfully!');
        // Add prerequisites if any
        if (created && created.id && selectedPrereqs.length > 0) {
          for (const prereqId of selectedPrereqs) {
            await addPrerequisiteMutation.mutateAsync({ id: created.id, prerequisitesId: prereqId });
          }
        }
        form.resetFields();
      } else if (id) {
        // Ensure subjectCode is a string (not undefined) to satisfy UpdateSubject type
        if (!subjectData.subjectCode) {
          message.error('Subject code is required!');
          return;
        }
        // Ensure subjectName is a string to satisfy UpdateSubject type
        if (!subjectData.subjectName) {
          message.error('Subject name is required!');
          return;
        }
        // Remove undefined status to satisfy UpdateSubject type
        const { id: _omit } = subjectData;
        await updateSubjectMutation.mutateAsync({ 
          id, 
          data: {
            id: id,
            subjectCode: subjectData.subjectCode as string,
            subjectName: subjectData.subjectName as string,
            credits: subjectData.credits as number,
            description: subjectData.description as string,
            createdBy: '',
            approvalStatus: 0,
            approvedBy: '',
            approvedAt: '',
            rejectionReason: ''
          } 
        });
       
        message.success('Subject updated successfully!');
      }
    } catch (error) {
      message.error('An error occurred. Please try again.');
    }
  };
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
              }}
            >
              {isCreateMode ? 'Create Subject' : 'Update Subject'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SubjectEdit; 