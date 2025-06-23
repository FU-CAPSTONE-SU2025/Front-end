import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Space, Typography } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { Curriculum, Program } from '../../interfaces/ISchoolProgram';
import { programs, curriculums } from '../../data/schoolData';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface CurriculumEditProps {
  id?: number;
}

const CurriculumEdit: React.FC<CurriculumEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<Curriculum | null>(null);
  const isCreateMode = !id;
  const isEditMode = !!id;

  // Load existing data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const curriculum = curriculums.find(c => c.id === id);
      if (curriculum) {
        setInitialData(curriculum);
        form.setFieldsValue({
          ...curriculum,
          effectiveDate: dayjs(curriculum.effectiveDate)
        });
      }
    }
  }, [id, isEditMode, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const curriculumData: Partial<Curriculum> = {
        ...values,
        effectiveDate: values.effectiveDate.toDate(),
        programId: parseInt(values.programId)
      };

      if (isCreateMode) {
        // Simulate API call for create
        console.log('Creating curriculum:', curriculumData);
        message.success('Curriculum created successfully!');
      } else {
        // Simulate API call for update
        console.log('Updating curriculum:', { id, ...curriculumData });
        message.success('Curriculum updated successfully!');
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
      console.log('Deleting curriculum:', id);
      message.success('Curriculum deleted successfully!');
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
            disabled={isEditMode} // Code shouldn't be changed after creation
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
                Delete Curriculum
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CurriculumEdit; 