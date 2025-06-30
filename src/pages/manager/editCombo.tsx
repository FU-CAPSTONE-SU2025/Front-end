import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, message, Card, Steps, Divider } from 'antd';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';

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
  const [previewData, setPreviewData] = useState<ComboData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Load combo data
  useEffect(() => {
    if (id) {
      const combo = mockCombos.find(c => c.id === parseInt(id));
      if (combo) {
        form.setFieldsValue({
          name: combo.name,
          status: combo.status,
          description: combo.description || '',
          subjects: combo.subjects || '',
          credits: combo.credits || 0,
          semester: combo.semester || 1,
          year: combo.year || new Date().getFullYear(),
        });
        setLoading(false);
      } else {
        message.error('Combo not found!');
        navigate('/manager/combo');
      }
    }
  }, [id, form, navigate]);

  // Handle form submission
  const handleSubmit = (values: ComboData) => {
    const updatedCombo: ComboData = {
      ...values,
      id: parseInt(id!),
    };
    
    setPreviewData([updatedCombo]);
    setCurrentStep(1);
    message.success('Combo data prepared for review');
  };

  // Handle final confirmation
  const handleConfirm = () => {
    // Here you would typically send the data to your API
    console.log('Updated combo data:', previewData);
    message.success('Combo updated successfully!');
    navigate('/manager/combo');
  };

  // Preview table columns
  const previewColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Combo Name',
      dataIndex: 'name',
      key: 'name',
      width: 300,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Subjects',
      dataIndex: 'subjects',
      key: 'subjects',
      width: 150,
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      width: 80,
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      width: 80,
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      width: 80,
    },
  ];

  const steps = [
    {
      title: 'Edit Data',
      description: 'Modify combo information',
    },
    {
      title: 'Review',
      description: 'Preview and confirm',
    },
  ];

  if (loading) {
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
          {steps.map((step, index) => (
            <Steps.Step key={index} title={step.title} description={step.description} />
          ))}
        </Steps>

        {currentStep === 0 && (
          <Card title="Edit Combo Information" className="shadow-md">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="space-y-4"
            >
              <Form.Item
                name="name"
                label="Combo Name"
                rules={[{ required: true, message: 'Please enter combo name!' }]}
              >
                <Input placeholder="Enter combo name" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Enter combo description" 
                  className="rounded-lg" 
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status!' }]}
              >
                <Select className="rounded-lg">
                  {statusOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="subjects"
                label="Subjects"
              >
                <TextArea 
                  rows={2} 
                  placeholder="Enter subjects (comma separated)" 
                  className="rounded-lg" 
                />
              </Form.Item>

              <div className="grid grid-cols-3 gap-4">
                <Form.Item
                  name="credits"
                  label="Credits"
                >
                  <Input type="number" placeholder="0" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  name="semester"
                  label="Semester"
                >
                  <Input type="number" placeholder="1" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  name="year"
                  label="Year"
                >
                  <Input type="number" placeholder={new Date().getFullYear().toString()} className="rounded-lg" />
                </Form.Item>
              </div>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<PlusOutlined />}
                  className="w-full rounded-lg"
                >
                  Prepare for Review
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card title="Review Updated Combo Data" className="shadow-md">
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Please review the updated combo data below before confirming:
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        {previewColumns.map((col, index) => (
                          <th key={index} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                            {col.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {previewColumns.map((col, colIndex) => (
                            <td key={colIndex} className="px-4 py-2 border-b text-sm">
                              {col.render ? col.render(String(row[col.dataIndex as keyof ComboData] || '')) : String(row[col.dataIndex as keyof ComboData] || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Divider />

              <div className="flex justify-between items-center">
                <Button 
                  onClick={() => setCurrentStep(0)}
                  className="rounded-lg"
                >
                  Back to Edit
                </Button>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate('/manager/combo')}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleConfirm}
                    icon={<CheckCircleOutlined />}
                    className="rounded-lg"
                  >
                    Confirm & Update
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EditComboPage; 