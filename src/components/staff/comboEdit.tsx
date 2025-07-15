import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Space, Typography, Select, Card, Tag } from 'antd';
import { SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { SubjectInCombo } from '../../interfaces/ISchoolProgram';
import { useCRUDCombo, useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import { GetSubjectsInCombo } from '../../api/SchoolAPI/comboAPI';
import SubjectSelect from '../common/SubjectSelect';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ComboEditProps {
  id?: number;
}

const ComboEdit: React.FC<ComboEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [comboSubjects, setComboSubjects] = useState<SubjectInCombo[]>([]);
  const [addSubjectId, setAddSubjectId] = useState<number | null>(null);
  const isCreateMode = !id;
  const isEditMode = !!id;

  const {
    getComboById,
    addComboMutation,
    updateComboMutation,
    addSubjectToComboMutation,
    removeSubjectFromComboMutation
  } = useCRUDCombo();
  const {
    subjectList,
    getAllSubjects
  } = useCRUDSubject();

  // Function to load subjects in the combo
  const loadComboSubjects = async () => {
    if (id) {
      const subjects = await GetSubjectsInCombo(id);
      setComboSubjects(subjects || []);
    }
  };

  useEffect(() => {
    getAllSubjects('NONE');
    if (isEditMode && id) {
      setLoading(true);
      getComboById.mutate(id, {
        onSuccess: (combo) => {
          if (combo) {
            setInitialData(combo);
            form.setFieldsValue({
              comboName: combo.comboName,
              comboDescription: combo.comboDescription || '',
            });
            loadComboSubjects();
          }
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
          message.error('Failed to fetch combo data.');
        }
      });
    }
  }, [id, isEditMode, form]);

  if (loading || getComboById.isPending) {
    return <div style={{ textAlign: 'center', marginTop: 48 }}>Loading...</div>;
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const comboData = {
        comboName: values.comboName,
        comboDescription: values.comboDescription,
        subjectIds: isCreateMode ? [] : comboSubjects.map(s => s.subjectId),
      };
      if (isCreateMode) {
        await addComboMutation.mutateAsync(comboData);
        message.success('Combo created successfully!');
        form.resetFields();
      } else {
        await updateComboMutation.mutateAsync({ id, data: comboData });
        message.success('Combo updated successfully!');
      }
    } catch (error) {
      message.error('An error occurred. Please try again.');
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
      message.success('Subject added to combo!');
      await loadComboSubjects();
      setAddSubjectId(null);
    } catch {
      message.error('Failed to add subject.');
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
      message.success('Subject removed from combo!');
      await loadComboSubjects();
    } catch {
      message.error('Failed to remove subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <Title level={4} style={{ color: '#1E40AF', marginBottom: '2rem', textAlign: 'center' }}>
        {isCreateMode ? 'Create New Combo' : 'Edit Combo'}
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: '0 auto' }}
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
          <Input placeholder="e.g., AI Electives" style={{ borderRadius: 8 }} />
        </Form.Item>
        <Form.Item
          label="Combo Description"
          name="comboDescription"
          rules={[
            { required: true, message: 'Please enter combo description!' },
            { min: 10, message: 'Description must be at least 10 characters!' }
          ]}
        >
          <TextArea placeholder="Enter a detailed description of the combo..." rows={4} style={{ borderRadius: 8 }} />
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
              {isCreateMode ? 'Create Combo' : 'Update Combo'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
      {!isCreateMode && (
        <div style={{ marginTop: 32 }}>
          <Card title="Subjects in this Combo" size="small">
            {comboSubjects.length === 0 ? (
              <div>No subjects in this combo.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {comboSubjects.map(subject => (
                  <Tag
                    key={subject.subjectId}
                    color="blue"
                    closable
                    onClose={() => handleRemoveSubject(subject.subjectId)}
                  >
                    {subject.subjectName} ({subject.subjectCode})
                  </Tag>
                ))}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <SubjectSelect
                value={addSubjectId === null ? undefined : addSubjectId}
                onChange={val => setAddSubjectId(val === undefined ? null : (val as number))}
                placeholder="Add subject to combo"
                style={{ width: 320, marginRight: 8 }}
                disabledIds={comboSubjects.map(cs => cs.subjectId)}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddSubject}
                disabled={!addSubjectId}
              >
                Add Subject
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ComboEdit; 