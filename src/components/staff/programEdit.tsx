import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Typography, Modal, Card, Spin } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { CreateProgram, Program } from '../../interfaces/ISchoolProgram';
import { useCRUDProgram } from '../../hooks/useCRUDSchoolMaterial';
import styles from '../../css/staff/staffEditSyllabus.module.css';
import cardStyles from '../../css/staff/curriculumEdit.module.css';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

const { Title } = Typography;

interface ProgramEditProps {
  id?: number;
}

const ProgramEdit: React.FC<ProgramEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const isCreateMode = !id;
  const isEditMode = !!id;
  const { handleError, handleSuccess } = useApiErrorHandler();

  // API hooks
  const {
    addProgramMutation,
    updateProgramMutation,
    getProgramById,
    disableProgramMutation,
    isLoading,
  } = useCRUDProgram();

  const [initialData, setInitialData] = useState<Program | null>(null);

  // Fetch program by ID on mount (edit mode)
  useEffect(() => {
    if (isEditMode && id) {
      getProgramById.mutate(id);
    }
  }, [id, isEditMode]);

  // Set form fields when data is loaded
  useEffect(() => {
    if (isEditMode && getProgramById.data) {
      const program = getProgramById.data;
      setInitialData(program);
      form.setFieldsValue({
        programCode: program.programCode,
        programName: program.programName
      });
    }
  }, [getProgramById.data, isEditMode, form]);

  const onFinish = async (values: CreateProgram) => {
    try {
      const programData:CreateProgram = {
        ...values
      };

      if (isCreateMode) {
        await addProgramMutation.mutateAsync(programData as CreateProgram);
        handleSuccess('Program created successfully!');
        form.resetFields();
      } else if (id) {
        await updateProgramMutation.mutateAsync({ id, data: programData });
        handleSuccess('Program updated successfully!');
      }
    } catch (error) {
      handleError(error, 'Program operation failed');
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Program',
      content: 'Are you sure you want to delete this program? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          if (id) {
            await disableProgramMutation.mutateAsync(id);
            handleSuccess('Program deleted successfully!');
          }
        } catch (error) {
          handleError(error, 'Failed to delete program');
        }
      },
    });
  };

  // Loading states
  const isLoadingData = getProgramById.isPending;

  if (isEditMode && isLoadingData) {
    return <Spin tip="Loading program..." className={cardStyles.loadingSpinner} />;
  }

  return (
    <div className={cardStyles.curriculumContainer}>
      <Card
        title={<div className={cardStyles.cardTitle}>{isCreateMode ? 'Create Program' : 'Edit Program'}</div>}
        className={cardStyles.curriculumInfoCard}
        classNames={{ header: cardStyles.cardHeader, body: cardStyles.cardBody }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.programForm}
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
              className={styles.programFormInput}
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
              className={styles.programFormInput}
              maxLength={100}
            />
          </Form.Item>

          <Form.Item className={cardStyles.formActions}>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isLoading}
                className={styles.programFormButton}
              >
                {isCreateMode ? 'Create Program' : 'Update Program'}
              </Button>
              {isEditMode && initialData && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  loading={isLoading}
                  className={styles.programFormButton}
                >
                  Delete Program
                </Button>
              )}
            </Space>
          </Form.Item>

          {isEditMode && initialData && (
            <div className={styles.programInfo}>
              <Title level={5} className={styles.programInfoTitle}>Program Information</Title>
              <p className={styles.programInfoDescription}>
                <strong>ID:</strong> {initialData.id} | 
                <strong> Code:</strong> {initialData.programCode} | 
                <strong> Name:</strong> {initialData.programName}
              </p>
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default ProgramEdit; 