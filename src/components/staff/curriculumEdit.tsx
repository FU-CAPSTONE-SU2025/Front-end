import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Space, Typography, Spin } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { Curriculum, Program } from '../../interfaces/ISchoolProgram';
import { programs } from '../../data/schoolData';
import dayjs from 'dayjs';
import {useCRUDCurriculum} from '../../hooks/useCRUDSchoolMaterial';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CurriculumEditProps {
  id?: number;
}

const CurriculumEdit: React.FC<CurriculumEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const isCreateMode = !id;
  const isEditMode = !!id;

  // API hooks
  const {
    addCurriculumMutation,
    updateCurriculumMutation,
    getCurriculumById
  } = useCRUDCurriculum();

  const [loading, setLoading] = useState(false);

  // Fetch curriculum by ID on mount (edit mode)
  useEffect(() => {
    if (isEditMode && id) {
      getCurriculumById.mutate(id);
    }
  }, [id, isEditMode]);

  // Set form fields when data is loaded
  useEffect(() => {
    if (isEditMode && getCurriculumById.data) {
      const c = getCurriculumById.data;
      form.setFieldsValue({
        ...c,
        effectiveDate: dayjs(c.effectiveDate)
      });
    }
  }, [getCurriculumById.data, isEditMode, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const curriculumData: Partial<Curriculum> = {
        ...values,
        effectiveDate: values.effectiveDate.toDate(),
        programId: 2 // FOR NOW
      };

      if (isCreateMode) {
        await addCurriculumMutation.mutateAsync(curriculumData as Curriculum);
        message.success('Curriculum created successfully!');
        form.resetFields();
      } else if (id) {
        // Ensure all required fields are non-undefined for update
        const updateData = {
          ...curriculumData,
          programId: Number(curriculumData.programId),
          curriculumCode: curriculumData.curriculumCode ?? '',
          curriculumName: curriculumData.curriculumName ?? '',
          effectiveDate: curriculumData.effectiveDate as Date // ensure effectiveDate is always Date, not undefined
        };
        await updateCurriculumMutation.mutateAsync({ id, data: updateData });
        message.success('Curriculum updated successfully!');
      }
    } catch (error) {
      message.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner if fetching data
  if (isEditMode && getCurriculumById.isPending) {
    return <Spin tip="Loading curriculum..." style={{ width: '100%', margin: '2rem 0' }} />;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <Title level={4} style={{ color: '#1E40AF', marginBottom: '2rem', textAlign: 'center' }}>
        {isCreateMode ? 'Create New Curriculum' : 'Edit Curriculum'}
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Form.Item
          label="Program"
          name="programId"
          rules={[{ required: true, message: 'Please select a program!' }]}
        >
          <Select
            placeholder="Select a program"
            style={{ borderRadius: 8 }}
            disabled={isEditMode} // Program shouldn't be changed after creation
          >
            {programs.map(program => (
              <Option key={program.id} value={program.id}>
                {program.programName} ({program.programCode})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Curriculum Code"
          name="curriculumCode"
          rules={[
            { required: true, message: 'Please enter curriculum code!' },
            { min: 2, message: 'Curriculum code must be at least 2 characters!' }
          ]}
        >
          <Input 
            placeholder="e.g., CS2023" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          label="Curriculum Name"
          name="curriculumName"
          rules={[
            { required: true, message: 'Please enter curriculum name!' },
            { min: 3, message: 'Curriculum name must be at least 3 characters!' }
          ]}
        >
          <Input 
            placeholder="e.g., Computer Science 2023 Curriculum" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          label="Effective Date"
          name="effectiveDate"
          rules={[{ required: true, message: 'Please select effective date!' }]}
        >
          <DatePicker 
            style={{ width: '100%', borderRadius: 8 }}
            placeholder="Select effective date"
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
              {isCreateMode ? 'Create Curriculum' : 'Update Curriculum'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CurriculumEdit; 