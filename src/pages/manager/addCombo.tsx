import React, { useState } from 'react';
import { Button, Form, Input, Select, Upload, Table, message, Card, Steps, Divider, Typography, Space, Progress, Alert } from 'antd';
import {  FileExcelOutlined, CheckCircleOutlined, PlusOutlined, UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import * as XLSX from 'xlsx';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import { CreateCombo } from '../../interfaces/ISchoolProgram';
import { useCRUDCombo } from '../../hooks/useCRUDSchoolMaterial';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface ComboData {
  id?: number;
  name: string;
  description?: string;
  status: 'pending' | 'active' | 'in-active';
  subjects?: string[];
  credits?: number;
  semester?: number;
  year?: number;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'in-active', label: 'Inactive' },
];

const AddComboPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [uploadedData, setUploadedData] = useState<ComboData[]>([]);
  const [previewData, setPreviewData] = useState<ComboData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [transformedData, setTransformedData] = useState<CreateCombo[]>([]);
  const [reviewMode, setReviewMode] = useState(false);
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useApiErrorHandler();

  const { addMultipleCombosMutation } = useCRUDCombo();

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        
        // Enhanced error handling for xlsx 0.20.3 compatibility
        let workbook;
        try {
          workbook = XLSX.read(data, { type: 'array' });
        } catch (xlsxError) {
          console.error('XLSX parsing error:', xlsxError);
          const errorMessage = getUserFriendlyErrorMessage(xlsxError);
          handleError(errorMessage);
          setIsUploading(false);
          return;
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          handleError('No worksheet found in the Excel file.');
          setIsUploading(false);
          return;
        }
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!jsonData || jsonData.length === 0) {
          handleError('No data found in the Excel file.');
          setIsUploading(false);
          return;
        }
        
        // Transform Excel data to ComboData format
        const transformedData: ComboData[] = jsonData.map((row: any, index: number) => ({
          id: index + 1,
          name: row['Combo Name'] || row['Name'] || row['name'] || '',
          description: row['Description'] || row['description'] || '',
          status: row['Status'] || row['status'] || 'pending',
          subjects: row['Subjects'] || row['subjects'] || '',
          credits: row['Credits'] || row['credits'] || 0,
          semester: row['Semester'] || row['semester'] || 1,
          year: row['Year'] || row['year'] || new Date().getFullYear(),
        }));

        setUploadedData(transformedData);
        setPreviewData(transformedData);
        handleSuccess(`Successfully uploaded ${transformedData.length} combos`);
        setCurrentStep(1);
      } catch (error) {
        console.error('File processing error:', error);
        const errorMessage = getUserFriendlyErrorMessage(error);
        handleError(errorMessage);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
    return false; // Prevent default upload behavior
  };

  // Handle manual form submission
  const handleManualSubmit = (values: ComboData) => {
    const newCombo: ComboData = {
      ...values,
      id: Date.now(), // Generate temporary ID
    };
    
    setPreviewData([newCombo]);
    setCurrentStep(1);
    handleSuccess('Combo data prepared for review');
  };

  // Handle final confirmation
  const handleConfirm = () => {
    // Here you would typically send the data to your API
    console.log('Final combo data:', previewData);
    handleSuccess('Combo(s) created successfully!');
    navigate('/manager/combo');
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Combo Name': 'SE_COM1',
        'Description': 'Software Engineering Basic',
        'Status': 'active',
        'Subjects': 'SE101,SE102,SE103',
        'Credits': 9,
        'Semester': 1,
        'Year': 2024
      },
      {
        'Combo Name': 'SE_COM2',
        'Description': 'Software Engineering Advanced',
        'Status': 'pending',
        'Subjects': 'SE201,SE202,SE203',
        'Credits': 12,
        'Semester': 2,
        'Year': 2024
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Combo Template');
    XLSX.writeFile(wb, 'combo_template.xlsx');
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      handleError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('files[]', file);
    });

    setUploading(true);
    setUploadStatus('uploading');

    try {
      const file = fileList[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          if (!worksheetName) {
            handleError('No worksheet found in the Excel file.');
            setUploadStatus('error');
            return;
          }

          const worksheet = workbook.Sheets[worksheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            handleError('No data found in the Excel file.');
            setUploadStatus('error');
            return;
          }

          // Transform the data
          const transformed: CreateCombo[] = jsonData.map((item: any) => ({
            comboName: item.comboName || item['Combo Name'] || item.ComboName || '',
            comboCode: item.comboCode || item['Combo Code'] || item.ComboCode || '',
            description: item.description || item.Description || ''
          }));

          setTransformedData(transformed);
          handleSuccess(`Successfully uploaded ${transformed.length} combos`);
          setUploadStatus('success');
          setReviewMode(true);
        } catch (error) {
          const errorMessage = getUserFriendlyErrorMessage(error);
          handleError(errorMessage);
          setUploadStatus('error');
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      handleError(errorMessage);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCombos = async () => {
    try {
      await addMultipleCombosMutation.mutateAsync(transformedData);
      handleSuccess('Combo data prepared for review');
      setReviewMode(false);
      navigate('/manager/combo');
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      handleError(errorMessage);
    }
  };

  const handleFinalCreate = async () => {
    try {
      await addMultipleCombosMutation.mutateAsync(transformedData);
      handleSuccess('Combo(s) created successfully!');
      navigate('/manager/combo');
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      handleError(errorMessage);
    }
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
      title: 'Input Data',
      description: 'Enter combo information',
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Add New Combo</h1>
          <p className="text-gray-600">Create new combo programs for students</p>
        </div>

        <Steps current={currentStep} className="mb-8">
          {steps.map((step, index) => (
            <Steps.Step key={index} title={step.title} description={step.description} />
          ))}
        </Steps>

        {currentStep === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Manual Input Card */}
            <Card title="Manual Input" className="shadow-md">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleManualSubmit}
                initialValues={{ status: 'pending' }}
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

            {/* Excel Upload Card */}
            <Card title="Upload from Excel" className="shadow-md">
              <div className="text-center py-8">
                <Upload.Dragger
                  name="file"
                  accept=".xlsx,.xls"
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                  disabled={isUploading}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileExcelOutlined className="text-4xl text-blue-500 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {isUploading ? 'Processing...' : 'Click or drag Excel file here'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Support for .xlsx and .xls files
                    </p>
                  </motion.div>
                </Upload.Dragger>

                <div className="mt-6 text-left">
                  <h4 className="font-medium text-gray-700 mb-2">Expected Excel Format:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p><strong>Columns:</strong> Combo Name, Description, Status, Subjects, Credits, Semester, Year</p>
                    <p><strong>Status values:</strong> pending, active, in-active</p>
                    <p><strong>Example:</strong></p>
                    <div className="bg-white p-2 rounded border text-xs font-mono">
                      Combo Name | Description | Status | Subjects | Credits | Semester | Year<br/>
                      SE_COM1 | Software Engineering | active | SE101,SE102 | 6 | 1 | 2024
                    </div>
                    <Button 
                      type="link" 
                      onClick={handleDownloadTemplate}
                      icon={<FileExcelOutlined />}
                      className="mt-2 p-0"
                    >
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card title="Review Combo Data" className="shadow-md">
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Please review the combo data below before confirming:
                </p>
                <Table
                  columns={previewColumns}
                  dataSource={previewData}
                  pagination={false}
                  scroll={{ x: 1000 }}
                  size="small"
                  className="mb-6"
                />
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
                    Confirm & Create
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

export default AddComboPage; 