import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, message, Card, Steps, Divider, Tag, Spin, Space } from 'antd';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router';
import { useCRUDCombo, useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';

const { Option } = Select;
const { TextArea } = Input;

interface ComboData {
  id?: number;
  name: string;
  description?: string;
  status: 'pending' | 'active' | 'in-active';
  subjects?: string;
  credits?: number;
  semester?: number;
  year?: number;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'in-active', label: 'Inactive' },
];

// Mock data for combos (same as in comboPage)
const mockCombos = [
  { id: 340, name: 'SE_COM5.2: Topic on Japanese Bridge Engineer_Chủ đề Kỹ sư cầu nối Nhật Bản (Định hướng Tiếng Nhật nâng cao cho kỹ sư CNTT) BIT_SE_K15A', status: 'active' as const, description: '', subjects: '', credits: 0, semester: 1, year: 2024 },
  { id: 402, name: 'SE_COM6: Topic on Information Technology - Korean Language_Chủ đề Công nghệ thông tin - tiếng Hàn BIT_SE_K15C', status: 'pending' as const, description: '', subjects: '', credits: 0, semester: 1, year: 2024 },
  { id: 1469, name: 'SE_COM5.1.1:Topic on Japanese Bridge Engineer_Chủ đề Kỹ sư cầu nối Nhật Bản (Định hướng Tiếng Nhật CNTT: Lựa chọn JFE301 và 1 trong 2 học phần JIS401, JIT401 để triển khai ở kỳ 8) BIT_SE_K15C', status: 'in-active' as const, description: '', subjects: '', credits: 0, semester: 1, year: 2024 },
  { id: 2566, name: 'SE_COM7.1:Topic on AI_Chủ đề AI', status: 'active' as const, description: '', subjects: '', credits: 0, semester: 1, year: 2024 },
  { id: 2497, name: 'SE_COM4.1: Topic on React/NodeJS_Chủ đề React/NodeJS', status: 'pending' as const, description: '', subjects: '', credits: 0, semester: 1, year: 2024 },
  { id: 2605, name: 'SE_COM11: Topic on IC design_Chủ đề Thiết kế vi mạch', status: 'active' as const, description: '', subjects: '', credits: 0, semester: 1, year: 2024 },
  { id: 2616, name: 'SE_COM3.2: Topic on .NET Programming_Chủ đề lập trình .NET BIT_SE_From_K18A', status: 'in-active' as const, description: '', subjects: '', credits: 0, semester: 1, year: 2024 },
  { id: 2640, name: 'SE_COM10.2: Topic on Intensive Java_Chủ đề Java chuyên sâu_K19A', status: 'active' as const, description: '', subjects: '', credits: 0, semester: 1, year: 2024 },
  { id: 2639, name: 'SE_COM14: Topic on Applied Data Science_Chủ đề Khoa học dữ liệu (KHDL) ứng dụng', status: 'pending' as const, description: '', subjects: '', credits: 0, semester: 1, year: 2024 },
  { id: 2638, name: 'SE_COM13: Topic on DevSepOps for cloud_Chủ đề Tích hợp DevSepOps cho cloud', status: 'active' as const, description: '', subjects: '', credits: 0, semester: 1, year: 2024 },
  { id: 2628, name: 'SE_COM12: Topic on Game Development_Phát triển game', status: 'in-active' as const, description: '', subjects: '', credits: 0, semester: 1, year: 2024 },
];

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
    getAllSubjects
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
    getAllSubjects({ pageNumber: 1, pageSize: 100 });
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
                        <Tag
                          key={subject.id}
                          color="blue"
                          closable
                          onClose={() => handleRemoveSubject(subject.id)}
                        >
                          {subject.subjectName} ({subject.subjectCode})
                        </Tag>
                      );
                    })}
                  </div>
                )}
                <div style={{ marginTop: 16 }}>
                  <Select
                    showSearch
                    placeholder="Add subject to combo"
                    value={addSubjectId}
                    onChange={setAddSubjectId}
                    style={{ width: 240, marginRight: 8 }}
                    optionFilterProp="children"
                  >
                    {subjectList
                      .filter(s => !comboSubjects.includes(s.id))
                      .map(subject => (
                        <Option key={subject.id} value={subject.id}>
                          {subject.subjectName} ({subject.subjectCode})
                        </Option>
                      ))}
                  </Select>
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