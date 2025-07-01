import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, message, Card, Steps, Divider } from 'antd';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ISubject, ISubjectForm } from '../../interfaces/ISubject';

const { Option } = Select;
const { TextArea } = Input;

interface SubjectData {
  id?: number;
  syllabusId: string;
  subjectCode: string;
  subjectName: string;
  syllabusName: string;
  decisionNo?: string;
  status: 'pending' | 'active' | 'in-active';
  description?: string;
  credits?: number;
  semester?: string;
  department?: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'in-active', label: 'Inactive' },
];

// Mock data - in real app this would come from API
const mockSubjects: SubjectData[] = [
  {
    id: 1,
    syllabusId: '12577',
    subjectCode: 'CSP202m',
    subjectName: 'Introduction of Content Strategy _ Nhập môn chiến lược nội dung',
    syllabusName: 'Introduction of Content Strategy _ Nhập môn chiến lược nội dung',
    decisionNo: '553/QĐ-ĐHFPT dated 05/15/2025',
    status: 'active',
    description: 'This course introduces students to the fundamentals of content strategy',
    credits: 3,
    semester: 'Fall 2025',
    department: 'Digital Marketing'
  },
  {
    id: 2,
    syllabusId: '12908',
    subjectCode: 'DXE291c',
    subjectName: 'Digital Ecosystem: From Governance to Business_Hệ sinh thái số: Từ Quản lý đến Kinh doanh',
    syllabusName: 'Digital Ecosystem: From Governance to Business_Hệ sinh thái số: Từ Quản lý đến Kinh doanh',
    decisionNo: '524/QĐ-ĐHFPT dated 05/09/2025',
    status: 'active',
    description: 'Comprehensive study of digital ecosystems and their impact on business',
    credits: 4,
    semester: 'Spring 2025',
    department: 'Business Administration'
  },
  {
    id: 3,
    syllabusId: '12931',
    subjectCode: 'GRF491',
    subjectName: 'Graduation Thesis - Finance_Khóa luận tốt nghiệp -Tài chính',
    syllabusName: 'Graduation Thesis - Finance_Khóa luận tốt nghiệp -Tài chính',
    decisionNo: '524/QĐ-ĐHFPT dated 05/09/2025',
    status: 'pending',
    description: 'Capstone project for finance students',
    credits: 6,
    semester: 'Final Year',
    department: 'Finance'
  },
  {
    id: 4,
    syllabusId: '12915',
    subjectCode: 'JJP301',
    subjectName: 'Japanese Phonetics and Lexicology_Ngữ âm học và từ vựng học tiếng Nhật',
    syllabusName: 'Japanese Phonetics and Lexicology_Ngữ âm học và từ vựng học tiếng Nhật',
    decisionNo: '',
    status: 'in-active',
    description: 'Advanced study of Japanese phonetics',
    credits: 3,
    semester: 'Fall 2025',
    department: 'Languages'
  }
];

const EditSubjectPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [previewData, setPreviewData] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      const subject = mockSubjects.find(s => s.id === parseInt(id));
      if (subject) {
        form.setFieldsValue(subject);
        setPreviewData([subject]);
        setLoading(false);
      } else {
        message.error('Subject not found');
        navigate('/manager/subject');
      }
    }
  }, [id, form, navigate]);

  // Handle manual form submission
  const handleManualSubmit = (values: SubjectData) => {
    const updatedSubject: SubjectData = {
      ...values,
      id: parseInt(id || '0'),
    };
    
    setPreviewData([updatedSubject]);
    setCurrentStep(1);
    message.success('Subject data prepared for review');
  };

  // Handle final confirmation
  const handleConfirm = () => {
    // Here you would typically send the data to your API
    console.log('Final subject data:', previewData);
    message.success('Subject updated successfully!');
    navigate('/manager/subject');
  };

  if (loading) {
    return (
      <div className="p-6 mx-auto max-w-6xl">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const steps = [
    {
      title: 'Edit Data',
      description: 'Update subject information',
    },
    {
      title: 'Review',
      description: 'Preview and confirm',
    },
  ];

  return (
    <div className="p-6 mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Subject</h1>
          <p className="text-gray-600">Update subject information</p>
        </div>

        <Steps current={currentStep} className="mb-8">
          {steps.map((step, index) => (
            <Steps.Step key={index} title={step.title} description={step.description} />
          ))}
        </Steps>

        {currentStep === 0 && (
          <Card title="Edit Subject Information" className="shadow-md">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleManualSubmit}
              initialValues={{ status: 'pending' }}
            >
              <Form.Item
                name="syllabusId"
                label="Syllabus ID"
                rules={[{ required: true, message: 'Please enter syllabus ID!' }]}
              >
                <Input placeholder="Enter syllabus ID" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="subjectCode"
                label="Subject Code"
                rules={[{ required: true, message: 'Please enter subject code!' }]}
              >
                <Input placeholder="Enter subject code" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="subjectName"
                label="Subject Name"
                rules={[{ required: true, message: 'Please enter subject name!' }]}
              >
                <TextArea 
                  rows={2} 
                  placeholder="Enter subject name" 
                  className="rounded-lg" 
                />
              </Form.Item>

              <Form.Item
                name="syllabusName"
                label="Syllabus Name"
                rules={[{ required: true, message: 'Please enter syllabus name!' }]}
              >
                <TextArea 
                  rows={2} 
                  placeholder="Enter syllabus name" 
                  className="rounded-lg" 
                />
              </Form.Item>

              <Form.Item
                name="decisionNo"
                label="Decision No"
              >
                <Input placeholder="Enter decision number (optional)" className="rounded-lg" />
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
                name="description"
                label="Description"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Enter subject description" 
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
                  <Input placeholder="e.g., Fall 2025" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  name="department"
                  label="Department"
                >
                  <Input placeholder="e.g., Digital Marketing" className="rounded-lg" />
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
            <Card title="Review Updated Subject Data" className="shadow-md">
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Please review the updated subject data below before confirming:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Syllabus ID:</strong> {previewData[0]?.syllabusId}
                    </div>
                    <div>
                      <strong>Subject Code:</strong> {previewData[0]?.subjectCode}
                    </div>
                    <div className="col-span-2">
                      <strong>Subject Name:</strong> {previewData[0]?.subjectName}
                    </div>
                    <div className="col-span-2">
                      <strong>Syllabus Name:</strong> {previewData[0]?.syllabusName}
                    </div>
                    <div>
                      <strong>Decision No:</strong> {previewData[0]?.decisionNo || '-'}
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        previewData[0]?.status === 'active' ? 'bg-green-100 text-green-800' :
                        previewData[0]?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {previewData[0]?.status}
                      </span>
                    </div>
                    <div>
                      <strong>Credits:</strong> {previewData[0]?.credits || '-'}
                    </div>
                    <div>
                      <strong>Semester:</strong> {previewData[0]?.semester || '-'}
                    </div>
                    <div>
                      <strong>Department:</strong> {previewData[0]?.department || '-'}
                    </div>
                    <div className="col-span-2">
                      <strong>Description:</strong> {previewData[0]?.description || '-'}
                    </div>
                  </div>
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
                    onClick={() => navigate('/manager/subject')}
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

export default EditSubjectPage; 