import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, message, Space, Typography, Select } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import { GetPrerequisitesSubject, DeletePrerequisitesSubject } from '../../api/SchoolAPI/subjectAPI';
import { CreateSubject, Subject } from '../../interfaces/ISchoolProgram';
import SubjectSelect from '../common/SubjectSelect';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface SubjectEditProps {
  id?: number;
}

const SubjectEdit: React.FC<SubjectEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const [prereqIds, setPrereqIds] = useState<number[]>([]);
  const [currentPrerequisites, setCurrentPrerequisites] = useState<Subject[]>([]);
  const [deletingPrereqId, setDeletingPrereqId] = useState<number | null>(null);
  const isCreateMode = !id;
  const isEditMode = !!id;

  // CRUD hook
  const {
    getSubjectById,
    addSubjectMutation,
    updateSubjectMutation,
    isLoading,
    addPrerequisiteMutation,
    subjectList,
    getAllSubjects
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

  // Fetch all subjects for prerequisites select
  useEffect(() => {
    getAllSubjects('NONE');
  }, []);

  // Fetch current prerequisites for this subject (edit mode)
  useEffect(() => {
    if (isEditMode && id) {
      GetPrerequisitesSubject(id).then((data) => {
        if (data) setCurrentPrerequisites(data);
      });
    }
  }, [isEditMode, id]);

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
        setPrereqIds([]);
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
        const { id: _omit, ...restSubjectData } = subjectData;
        await updateSubjectMutation.mutateAsync({ 
          id, 
          data: {
            id: id,
            subjectCode: subjectData.subjectCode as string,
            subjectName: subjectData.subjectName as string,
            credits: subjectData.credits as number,
            description: subjectData.description as string
          } 
        });
        // Add prerequisites if any
        if (selectedPrereqs.length > 0) {
          for (const prereqId of selectedPrereqs) {
            await addPrerequisiteMutation.mutateAsync({ id, prerequisitesId: prereqId });
          }
        }
        message.success('Subject updated successfully!');
      }
    } catch (error) {
      message.error('An error occurred. Please try again.');
    }
  };

  // Delete a prerequisite subject
  const handleDeletePrerequisite = async (prereqId: number) => {
    if (!id) return;
    setDeletingPrereqId(prereqId);
    try {
      await DeletePrerequisitesSubject(id, prereqId);
      setCurrentPrerequisites(prev => prev.filter(subj => subj.id !== prereqId));
      message.success('Prerequisite removed successfully!');
    } catch (error) {
      message.error('Failed to remove prerequisite.');
    } finally {
      setDeletingPrereqId(null);
    }
  };

  // All other subjects except this one (for prerequisites)
  const otherSubjects = subjectList.filter(s => s.id !== id);

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
        <Form.Item
          label="Prerequisite Subjects"
          name="prerequisites"
          extra="Select one or more subjects that must be completed before this subject."
        >
          <>
            {isEditMode && currentPrerequisites.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <strong>Current Prerequisite Subjects:</strong>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {currentPrerequisites.map(subj => (
                    <li key={subj.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {subj.subjectName} ({subj.subjectCode})
                      <Button
                        type="text"
                        icon={<CloseOutlined style={{ color: '#f5222d' }} />}
                        size="small"
                        loading={deletingPrereqId === subj.id}
                        onClick={() => handleDeletePrerequisite(subj.id)}
                        style={{ marginLeft: 4 }}
                        aria-label="Remove prerequisite"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <SubjectSelect
              multiple
              placeholder="Select prerequisite subjects"
              value={prereqIds}
              onChange={val => setPrereqIds(Array.isArray(val) ? val as number[] : val === undefined ? [] : [val as number])}
              style={{ borderRadius: 8, width: '100%' }}
              disabledIds={[id, ...prereqIds].filter(Boolean) as number[]}
            />
          </>
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