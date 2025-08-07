import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Typography, Select, Tag } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { Combo, CreateCombo, Subject } from '../../interfaces/ISchoolProgram';
import { useCRUDCombo, useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import styles from '../../css/staff/staffEditSyllabus.module.css';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ComboEditProps {
  id?: number;
}

const ComboEdit: React.FC<ComboEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const isCreateMode = !id;
  const isEditMode = !!id;
  const { handleError, handleSuccess } = useApiErrorHandler();

  // API hooks
  const {
    addComboMutation,
    updateComboMutation,
    getComboById,
    addSubjectToComboMutation,
    removeSubjectFromComboMutation
  } = useCRUDCombo();

  const { getSubjectMutation } = useCRUDSubject();

  const [loading, setLoading] = useState(false);
  const [comboSubjects, setComboSubjects] = useState<Subject[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [addSubjectId, setAddSubjectId] = useState<number | null>(null);

  // Fetch combo by ID on mount (edit mode)
  useEffect(() => {
    if (isEditMode && id) {
      getComboById.mutate(id);
    }
  }, [id, isEditMode]);

  // Set form fields when data is loaded
  useEffect(() => {
    if (isEditMode && getComboById.data) {
      const combo = getComboById.data;
      form.setFieldsValue({
        comboName: combo.comboName,
        comboDescription: combo.comboDescription
      });
      loadComboSubjects();
    }
  }, [getComboById.data, isEditMode, form]);

  // Load all subjects for dropdown
  useEffect(() => {
    getSubjectMutation.mutate({ pageNumber: 1, pageSize: 100 });
  }, []);

  // Update all subjects when fetched
  useEffect(() => {
    if (getSubjectMutation.data) {
      setAllSubjects(getSubjectMutation.data.items || []);
    }
  }, [getSubjectMutation.data]);

  const loadComboSubjects = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // This would need to be implemented in the API
      // For now, we'll use a mock approach
      getComboById.mutate(id, {
        onSuccess: (combo) => {
          // Since Combo doesn't have subjects property, we'll need to fetch subjects separately
          // For now, we'll use an empty array
          setComboSubjects([]);
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
          handleError('Failed to fetch combo data.');
        }
      });
    } catch (error) {
      setLoading(false);
      handleError('Failed to fetch combo data.');
    }
  };

  if (loading || getComboById.isPending) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const comboData = {
        comboName: values.comboName,
        comboDescription: values.comboDescription,
        subjectIds: isCreateMode ? [] : comboSubjects.map(s => s.id),
      };
      if (isCreateMode) {
        await addComboMutation.mutateAsync(comboData);
        handleSuccess('Combo created successfully!');
        form.resetFields();
      } else {
        await updateComboMutation.mutateAsync({ id, data: comboData });
        handleSuccess('Combo updated successfully!');
      }
    } catch (error) {
      handleError(error, 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!id || !addSubjectId) return;
    setLoading(true);
    try {
      //console.log(id, addSubjectId);
      await addSubjectToComboMutation.mutateAsync({ comboId: id, subjectId: addSubjectId });
      handleSuccess('Subject added to combo!');
      await loadComboSubjects();
      setAddSubjectId(null);
    } catch {
      handleError('Failed to add subject.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubject = async (subjectId: number) => {
    if (!id) return;
    setLoading(true);
    try {
      //console.log(id, subjectId);
      await removeSubjectFromComboMutation.mutateAsync({ comboId: id, subjectId });
      handleSuccess('Subject removed from combo!');
      await loadComboSubjects();
    } catch {
      handleError('Failed to remove subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.comboContainer}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className={styles.comboForm}
        initialValues={{ comboName: '', comboDescription: '' }}
      >
        <Form.Item
          label="Combo Name"
          name="comboName"
          rules={[
            { required: true, message: 'Please enter combo name!' },
            { min: 3, message: 'Combo name must be at least 3 characters!' }
          ]}
        >
          <Input placeholder="e.g., AI Electives" className={styles.comboFormInput} />
        </Form.Item>
        <Form.Item
          label="Combo Description"
          name="comboDescription"
          rules={[
            { required: true, message: 'Please enter combo description!' },
            { min: 10, message: 'Description must be at least 10 characters!' }
          ]}
        >
          <TextArea placeholder="Enter a detailed description of the combo..." rows={4} className={styles.comboFormTextArea} />
        </Form.Item>
        <Form.Item className={styles.comboFormActions}>
          <Space size="large">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              className={styles.comboFormButton}
            >
              {isCreateMode ? 'Create Combo' : 'Update Combo'}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {isEditMode && (
        <div className={styles.comboSubjects}>
          <Title level={5} className={styles.comboSubjectsTitle}>
            Subjects in this Combo
          </Title>
          <div className={styles.comboSubjectsList}>
            {comboSubjects.map(subject => (
              <Tag
                key={subject.id}
                closable
                onClose={() => handleRemoveSubject(subject.id)}
                className={styles.comboSubjectsItem}
              >
                {subject.subjectName} ({subject.subjectCode})
              </Tag>
            ))}
          </div>
          <div className={styles.comboSubjectsAdd}>
            <Select
              placeholder="Select a subject to add"
              value={addSubjectId}
              onChange={setAddSubjectId}
              className={styles.comboSubjectsAddSelect}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {allSubjects
                .filter(subject => !comboSubjects.some(cs => cs.id === subject.id))
                .map(subject => (
                  <Option key={subject.id} value={subject.id}>
                    {subject.subjectName} ({subject.subjectCode})
                  </Option>
                ))}
            </Select>
            <Button
              type="primary"
              onClick={handleAddSubject}
              disabled={!addSubjectId}
              loading={loading}
              className={styles.comboFormButton}
            >
              Add Subject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboEdit; 