import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, Space, Typography, Modal, Popconfirm } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCRUDSubject, useCRUDSubjectVersion } from '../../hooks/useCRUDSchoolMaterial';
import { CreateSubject, Subject } from '../../interfaces/ISchoolProgram';
import styles from '../../css/staff/subjectEdit.module.css';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { DisableSubject } from '../../api/SchoolAPI/subjectAPI';

const { TextArea } = Input;
const { Title } = Typography;

interface SubjectEditProps {
  id?: number;
  onDelete?: () => void; // Callback to refresh parent component
}

const SubjectEdit: React.FC<SubjectEditProps> = ({ id, onDelete }) => {
  const [form] = Form.useForm();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const isCreateMode = !id;
  const isEditMode = !!id;
  const { handleError, handleSuccess } = useApiErrorHandler();

  // CRUD hook
  const {
    getSubjectById,
    updateSubjectMutation,
    isLoading,
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
      if (isCreateMode) {
        // Ensure subjectCode is a string (not undefined) to satisfy CreateSubject type
        if (!subjectData.subjectCode) {
          handleError('Subject code is required!', 'Validation Error');
          return;
        }
        form.resetFields();
      } else if (id) {
        // Ensure subjectCode is a string (not undefined) to satisfy UpdateSubject type
        if (!subjectData.subjectCode) {
          handleError('Subject code is required!', 'Validation Error');
          return;
        }
        // Ensure subjectName is a string to satisfy UpdateSubject type
        if (!subjectData.subjectName) {
          handleError('Subject name is required!', 'Validation Error');
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
       
        handleSuccess('Subject updated successfully!');
      }
    } catch (error) {
      handleError(error, 'Subject operation failed');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleteLoading(true);
      const result = await DisableSubject(id);
      
      if (result) {
        handleSuccess('Subject disabled successfully!');
        // Call parent callback to refresh the list
        if (onDelete) {
          onDelete();
        }
      } else {
        handleError('Failed to disable subject');
      }
    } catch (error) {
      console.error('Error disabling subject:', error);
      handleError(error, 'Failed to disable subject');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className={styles.subjectContainer}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className={styles.subjectForm}
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
            className={styles.subjectFormInput}
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
            className={styles.subjectFormInput}
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
            className={styles.subjectFormInput}
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
            className={styles.subjectFormTextArea}
          />
        </Form.Item>
        <Form.Item className={styles.subjectFormActions}>
          <Space size="large">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={isLoading}
              className={styles.subjectFormButton}
            >
              {isCreateMode ? 'Create Subject' : 'Update Subject'}
            </Button>
            
            {/* Delete button - only show in edit mode */}
            {isEditMode && (
              <Popconfirm
                title="Disable Subject"
                description="Are you sure you want to disable this subject? This action cannot be undone."
                onConfirm={handleDelete}
                okText="Yes, Disable"
                cancelText="Cancel"
                okType="danger"
              >
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  loading={isDeleteLoading}
                  className={styles.subjectFormButton}
                >
                  Disable Subject
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SubjectEdit; 