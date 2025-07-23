import React, { useState, useEffect } from 'react';
import { Button, Form, Input, message, Card, Steps, Tag} from 'antd';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router';
import { useCRUDCombo, useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import SubjectSelect from '../../components/common/SubjectSelect';

const EditComboPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [comboSubjects, setComboSubjects] = useState<number[]>([]);
  const [addSubjectId, setAddSubjectId] = useState<number | null>(null);

  const {
    getComboById,
    updateComboMutation
  } = useCRUDCombo();
  const {
    subjectList,
  } = useCRUDSubject();

  useEffect(() => {
    if (id) {
      getComboById.mutate(Number(id), {
        onSuccess: (combo) => {
          if (combo) {
            form.setFieldsValue({
              comboName: combo.comboName,
              comboDescription: combo.comboDescription || '',
            });
            // Initialize subjects as empty array since they're managed separately
            setComboSubjects([]);
            setLoading(false);
          } else {
            message.error('Combo not found!');
            navigate('/manager/combo');
          }
        },
        onError: () => {
          message.error('Failed to fetch combo!');
          navigate('/manager/combo');
        }
      });
    }
    // Removed getAllSubjects({ pageNumber: 1, pageSize: 100 });
  }, [id, form, navigate]);

  const handleSubmit = (values: any) => {
    setPreviewData({ ...values, id: Number(id) });
    setCurrentStep(1);
  };

  const handleAddSubject = () => {
    if (!addSubjectId || comboSubjects.includes(addSubjectId)) return;
    setComboSubjects([...comboSubjects, addSubjectId]);
    setAddSubjectId(null);
  };

  const handleRemoveSubject = (subjectId: number) => {
    setComboSubjects(comboSubjects.filter(id => id !== subjectId));
  };

  const handleConfirm = () => {
    updateComboMutation.mutate({
      id: Number(id),
      data: {
        comboName: form.getFieldValue('comboName'),
        comboDescription: form.getFieldValue('comboDescription'),
        subjectIds: comboSubjects
      }
    }, {
      onSuccess: () => {
        message.success('Combo updated successfully!');
        navigate('/manager/combo');
      },
      onError: () => {
        message.error('Failed to update combo!');
      }
    });
  };

  if (loading || getComboById.isPending) {
    return (
      <div className="p-6 mx-auto max-w-4xl">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading combo data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Combo</h1>
          <p className="text-gray-600">Modify combo program information</p>
        </div>

        <Steps current={currentStep} className="mb-8">
          <Steps.Step title="Edit Data" description="Modify combo information" />
          <Steps.Step title="Review" description="Preview and confirm" />
        </Steps>

        {currentStep === 0 && (
          <Card title="Edit Combo Information" className="shadow-md">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ comboName: '', comboDescription: '' }}
            >
              <Form.Item label="Combo Name" name="comboName" rules={[{ required: true, message: 'Please enter combo name' }]}> 
                <Input />
              </Form.Item>
              <Form.Item label="Combo Description" name="comboDescription">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">Preview</Button>
              </Form.Item>
            </Form>
            {id && (
              <Card title="Subjects in this Combo" size="small" style={{ marginTop: 32 }}>
                {comboSubjects.length === 0 ? (
                  <div>No subjects in this combo.</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {comboSubjects.map(subjectId => {
                      const subject = subjectList.find(s => s.id === subjectId);
                      if (!subject) return null;
                      return (
                        <span key={subject.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Tag
                            color="blue"
                            closable
                            onClose={() => handleRemoveSubject(subject.id)}
                          >
                            {subject.subjectName} ({subject.subjectCode})
                          </Tag>
                          <Button
                            type="link"
                            icon={<span className="anticon" style={{ color: '#f97316' }}><svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024"><path d="M257 768a32 32 0 0 0 32 32h446a32 32 0 0 0 32-32V320H257v448zm512-544h-96l-34-56a48 48 0 0 0-41-24H426a48 48 0 0 0-41 24l-34 56h-96a32 32 0 0 0-32 32v48a8 8 0 0 0 8 8h672a8 8 0 0 0 8-8v-48a32 32 0 0 0-32-32z"></path></svg></span>}
                            onClick={() => navigate(`/manager/subject/edit/${subject.id}`)}
                            style={{ padding: 0, marginLeft: 2 }}
                            title="Edit Subject"
                          />
                        </span>
                      );
                    })}
                  </div>
                )}
                <div style={{ marginTop: 16 }}>
                  <SubjectSelect
                    value={addSubjectId === null ? undefined : addSubjectId}
                    onChange={val => setAddSubjectId(val === undefined ? null : (val as number))}
                    placeholder="Add subject to combo"
                    style={{ width: 320, marginRight: 8 }}
                    disabledIds={comboSubjects}
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
            )}
          </Card>
        )}

        {currentStep === 1 && previewData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card title="Review Combo Information" className="shadow-md">
              <p><b>Combo Name:</b> {previewData.comboName}</p>
              <p><b>Combo Description:</b> {previewData.comboDescription}</p>
              <div style={{ marginTop: 24 }}>
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleConfirm} loading={updateComboMutation.isPending}>
                  Confirm & Save
                </Button>
                <Button style={{ marginLeft: 16 }} onClick={() => setCurrentStep(0)}>
                  Back
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EditComboPage; 