import React, { useState, useEffect } from 'react';
import { Button, message, Steps } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ISubject } from '../../interfaces/ISubject';
import ExcelUpload from '../../components/manager/excel-upload';
import DataPreview from '../../components/manager/data-preview';
import ManualInput from '../../components/manager/manual-input';
import ReviewSection from '../../components/manager/review-section';
import SummaryCard from '../../components/manager/summary-card';

// Custom CSS for better table styling
const customTableStyles = `
  .custom-table .ant-table-thead > tr > th {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    border: none;
  }
  
  .custom-table .ant-table-tbody > tr:hover > td {
    background-color: #f8fafc;
  }
  
  .custom-table .ant-table-tbody > tr:nth-child(even) > td {
    background-color: #f9fafb;
  }
  
  .custom-table .ant-table-tbody > tr > td {
    border-bottom: 1px solid #e5e7eb;
    padding: 12px 16px;
  }
  
  .custom-table .ant-table-container {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

interface SubjectData {
  id?: number;
  subjectCode: string;
  subjectName: string;
  combos: string[];
  prerequisites: string[];
  status: 'pending' | 'active' | 'in-active';
  description?: string;
  credits?: number;
}

interface MaterialData {
  id?: number;
  materialName: string;
  authorName: string;
  publishedDate: string;
  description: string;
  filepathOrUrl: string;
}

interface OutcomeData {
  id?: number;
  outcomeCode: string;
  description: string;
}

interface SessionData {
  id?: number;
  sessionNumber: number;
  topic: string;
  mission: string;
  outcomes: string[];
}

interface AssessmentData {
  id?: number;
  category: string;
  quantity: number;
  weight: number;
  completionCriteria: string;
  duration: string;
  questionType: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'in-active', label: 'Inactive' },
];

const comboOptions = [
  { value: 'SE_COM1', label: 'Software Engineering Combo 1' },
  { value: 'SE_COM2', label: 'Software Engineering Combo 2' },
  { value: 'BA_COM1', label: 'Business Administration Combo 1' },
  { value: 'BA_COM2', label: 'Business Administration Combo 2' },
  { value: 'IT_COM1', label: 'Information Technology Combo 1' },
  { value: 'IT_COM2', label: 'Information Technology Combo 2' },
];
const prerequisiteOptions = [
  { value: 'MKT101', label: 'Marketing Fundamentals' },
  { value: 'COM201', label: 'Communication Skills' },
  { value: 'BUS101', label: 'Business Basics' },
  { value: 'TECH201', label: 'Technology Fundamentals' },
  { value: 'FIN101', label: 'Finance Basics' },
  { value: 'ENG101', label: 'English Communication' },
];

// Mock data - in real app this would come from API
const mockSubjects: SubjectData[] = [
  {
    id: 1,
    subjectCode: 'CSP202m',
    subjectName: 'Introduction of Content Strategy _ Nhập môn chiến lược nội dung',
    combos: ['SE_COM1'],
    prerequisites: ['MKT101'],
    status: 'active',
    description: 'This course introduces students to the fundamentals of content strategy',
    credits: 3,
  },
  // ...other subjects
];

const EditSubjectPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [previewData, setPreviewData] = useState<SubjectData[]>([]);
  const [materialsData, setMaterialsData] = useState<MaterialData[]>([]);
  const [outcomesData, setOutcomesData] = useState<OutcomeData[]>([]);
  const [sessionsData, setSessionsData] = useState<SessionData[]>([]);
  const [assessmentsData, setAssessmentsData] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      const subject = mockSubjects.find(s => s.id === parseInt(id));
      if (subject) {
        setPreviewData([subject]);
        setMaterialsData((subject as any).materialsData || []);
        setOutcomesData((subject as any).outcomesData || []);
        setSessionsData((subject as any).sessionsData || []);
        setAssessmentsData((subject as any).assessmentsData || []);
        setLoading(false);
      } else {
        message.error('Subject not found');
        navigate('/manager/subject');
      }
    }
  }, [id, navigate]);

  // Handle manual form submission
  const handleManualSubmit = (values: SubjectData) => {
    const updatedSubject: SubjectData = {
      ...values,
      id: parseInt(id || '0'),
    };
    setPreviewData([updatedSubject]);
    message.success('Subject data prepared for review');
  };

  // Handle Excel import and update preview
  const handleExcelImport = (data: any[]) => {
    if (data && data.length > 0) {
      const subject = data[0];
      setPreviewData([subject]);
      message.success('Imported subject data from Excel!');
      setCurrentStep(0);
    } else {
      message.error('No data found in Excel file.');
    }
  };

  // Handle final confirmation
  const handleConfirm = () => {
    // Here you would typically send the data to your API
    console.log('Final subject data:', previewData);
    console.log('Final material data:', materialsData);
    console.log('Final outcome data:', outcomesData);
    console.log('Final session data:', sessionsData);
    console.log('Final assessment data:', assessmentsData);
    message.success('All data updated successfully!');
    navigate('/manager/subject');
  };

  // Export current subject data to Excel
  const handleExportExcel = () => {
    if (!previewData[0]) return;
    const ws = XLSX.utils.json_to_sheet([previewData[0]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subject');
    XLSX.writeFile(wb, `subject_${previewData[0].subjectCode || 'edit'}.xlsx`);
  };

  // Preview table columns for each type
  const getSubjectColumns = () => [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Subject Code', dataIndex: 'subjectCode', key: 'subjectCode', width: 120 },
    { title: 'Subject Name', dataIndex: 'subjectName', key: 'subjectName', width: 300, render: (text: string) => (<div className="max-w-xs truncate" title={text}>{text}</div>), },
    { title: 'Combos', dataIndex: 'combos', key: 'combos', width: 200, render: (combos: string[]) => combos?.join(', ') || '-', },
    { title: 'Prerequisites', dataIndex: 'prerequisites', key: 'prerequisites', width: 200, render: (prerequisites: string[]) => prerequisites?.join(', ') || '-', },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, render: (status: string) => (<span className={`px-2 py-1 rounded-full text-xs ${status === 'active' ? 'bg-green-100 text-green-800' : status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{status}</span>), },
    { title: 'Credits', dataIndex: 'credits', key: 'credits', width: 80 },
  ];

  const getMaterialColumns = () => [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Material Name', dataIndex: 'materialName', key: 'materialName', width: 250, render: (text: string) => (<div className="max-w-xs truncate" title={text}>{text}</div>), },
    { title: 'Author Name', dataIndex: 'authorName', key: 'authorName', width: 150 },
    { title: 'Published Date', dataIndex: 'publishedDate', key: 'publishedDate', width: 120 },
    { title: 'Description', dataIndex: 'description', key: 'description', width: 300, render: (text: string) => (<div className="max-w-xs truncate" title={text}>{text}</div>), },
    { title: 'File Path/URL', dataIndex: 'filepathOrUrl', key: 'filepathOrUrl', width: 200, render: (text: string) => (<div className="max-w-xs truncate" title={text}>{text}</div>), },
  ];

  const getOutcomeColumns = () => [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Outcome Code', dataIndex: 'outcomeCode', key: 'outcomeCode', width: 120 },
    { title: 'Description', dataIndex: 'description', key: 'description', width: 400, render: (text: string) => (<div className="max-w-xs truncate" title={text}>{text}</div>), },
  ];

  const getSessionColumns = () => [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Session Number', dataIndex: 'sessionNumber', key: 'sessionNumber', width: 120 },
    { title: 'Topic', dataIndex: 'topic', key: 'topic', width: 250, render: (text: string) => (<div className="max-w-xs truncate" title={text}>{text}</div>), },
    { title: 'Mission', dataIndex: 'mission', key: 'mission', width: 250, render: (text: string) => (<div className="max-w-xs truncate" title={text}>{text}</div>), },
    { title: 'Outcomes', dataIndex: 'outcomes', key: 'outcomes', width: 200, render: (outcomes: string[]) => outcomes?.join(', ') || '-', },
  ];

  const getAssessmentColumns = () => [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 120 },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 100 },
    { title: 'Weight (%)', dataIndex: 'weight', key: 'weight', width: 100 },
    { title: 'Completion Criteria', dataIndex: 'completionCriteria', key: 'completionCriteria', width: 200, render: (text: string) => (<div className="max-w-xs truncate" title={text}>{text}</div>), },
    { title: 'Duration', dataIndex: 'duration', key: 'duration', width: 120 },
    { title: 'Question Type', dataIndex: 'questionType', key: 'questionType', width: 150 },
  ];

  const steps = [
    { title: 'Edit Data', description: 'Update subject information' },
    { title: 'Review', description: 'Preview and confirm' },
  ];

  if (loading) {
    return (
      <div className="p-6 mx-auto max-w-6xl">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-6xl">
      <style>{customTableStyles}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Subject</h1>
            <p className="text-gray-600">Update subject information</p>
          </div>
          <Button onClick={handleExportExcel} type="default" className="rounded-lg" >
            Export to Excel
          </Button>
        </div>

        <Steps current={currentStep} className="mb-8">
          {steps.map((step, index) => (
            <Steps.Step key={index} title={step.title} description={step.description} />
          ))}
        </Steps>

        {/* Excel Import Section */}
      

        {currentStep === 0 && (
          <div className="space-y-8">
            {/* Subject Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📚</span>
                <span>Subject Information</span>
              </h2>
              <ManualInput
                title="Subject"
                icon="📚"
                formItems={[
                  {
                    name: 'subjectCode',
                    label: 'Subject Code',
                    type: 'input',
                    required: true,
                    placeholder: 'Enter subject code'
                  },
                  {
                    name: 'subjectName',
                    label: 'Subject Name',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Enter subject name',
                    rows: 2
                  },
                  {
                    name: 'combos',
                    label: 'Combos',
                    type: 'multiSelect',
                    placeholder: 'Select combos',
                    options: comboOptions
                  },
                  {
                    name: 'prerequisites',
                    label: 'Prerequisites',
                    type: 'multiSelect',
                    placeholder: 'Select prerequisite subjects',
                    options: prerequisiteOptions
                  },
                  {
                    name: 'status',
                    label: 'Status',
                    type: 'select',
                    required: true,
                    options: statusOptions
                  },
                  {
                    name: 'description',
                    label: 'Description',
                    type: 'textarea',
                    placeholder: 'Enter subject description',
                    rows: 3
                  },
                  {
                    name: 'credits',
                    label: 'Credits',
                    type: 'number',
                    placeholder: '0'
                  }
                ]}
                onSubmit={handleManualSubmit}
                initialValues={previewData[0] ? previewData[0] : { status: 'pending' }}
              />
              <DataPreview
                title="📚 Subject"
                icon="📚"
                color="#3B82F6"
                data={previewData}
                columns={getSubjectColumns()}
                visible={previewData.length > 0}
              />
            </div>

            {/* Material Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📖</span>
                <span>Material Information</span>
              </h2>
              <DataPreview
                title="📖 Material"
                icon="📖"
                color="#10B981"
                data={materialsData}
                columns={getMaterialColumns()}
                visible={true}
              />
              <ExcelUpload
                title="Material"
                icon="📖"
                color="#10B981"
                expectedFormat={{
                  required: ['Material Name', 'Author Name', 'Published Date'],
                  optional: ['Description', 'File Path/URL'],
                  notes: ['Published Date: Use year format (e.g., 2023)']
                }}
                onDataUploaded={(data) => setMaterialsData(data)}
                transformData={(jsonData) => jsonData.map((row: any, index: number) => ({
                  id: index + 1,
                  materialName: row['Material Name'] || row['materialName'] || '',
                  authorName: row['Author Name'] || row['authorName'] || '',
                  publishedDate: row['Published Date'] || row['publishedDate'] || '',
                  description: row['Description'] || row['description'] || '',
                  filepathOrUrl: row['File Path/URL'] || row['filepathOrUrl'] || '',
                }))}
                templateData={[
                  {
                    'Material Name': 'Content Strategy Fundamentals',
                    'Author Name': 'John Smith',
                    'Published Date': '2023',
                    'Description': 'Comprehensive guide to content strategy',
                    'File Path/URL': 'https://example.com/material1.pdf'
                  },
                  {
                    'Material Name': 'Digital Marketing Handbook',
                    'Author Name': 'Jane Doe',
                    'Published Date': '2024',
                    'Description': 'Complete digital marketing guide',
                    'File Path/URL': 'https://example.com/material2.pdf'
                  }
                ]}
                fileName="material_template.xlsx"
                sheetName="Material Template"
              />
            </div>

            {/* Outcome Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>🎯</span>
                <span>Learning Outcomes</span>
              </h2>
              <DataPreview
                title="🎯 Learning Outcomes"
                icon="🎯"
                color="#8B5CF6"
                data={outcomesData}
                columns={getOutcomeColumns()}
                visible={true}
              />
              <ExcelUpload
                title="Learning Outcomes"
                icon="🎯"
                color="#8B5CF6"
                expectedFormat={{
                  required: ['Outcome Code', 'Description'],
                  notes: ['Outcome Code: Use format like LO1, LO2, etc.']
                }}
                onDataUploaded={(data) => setOutcomesData(data)}
                transformData={(jsonData) => jsonData.map((row: any, index: number) => ({
                  id: index + 1,
                  outcomeCode: row['Outcome Code'] || row['outcomeCode'] || '',
                  description: row['Description'] || row['description'] || '',
                }))}
                templateData={[
                  {
                    'Outcome Code': 'LO1',
                    'Description': 'Understand content strategy principles'
                  },
                  {
                    'Outcome Code': 'LO2',
                    'Description': 'Develop content marketing plans'
                  }
                ]}
                fileName="outcome_template.xlsx"
                sheetName="Outcome Template"
              />
            </div>

            {/* Session Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📅</span>
                <span>Session Information</span>
              </h2>
              <DataPreview
                title="📅 Session"
                icon="📅"
                color="#F59E0B"
                data={sessionsData}
                columns={getSessionColumns()}
                visible={true}
              />
              <ExcelUpload
                title="Sessions"
                icon="📅"
                color="#F59E0B"
                expectedFormat={{
                  required: ['Session Number', 'Topic', 'Mission'],
                  optional: ['Outcomes'],
                  notes: ['Outcomes: Use comma-separated outcome codes']
                }}
                onDataUploaded={(data) => setSessionsData(data)}
                transformData={(jsonData) => jsonData.map((row: any, index: number) => ({
                  id: index + 1,
                  sessionNumber: row['Session Number'] || row['sessionNumber'] || 1,
                  topic: row['Topic'] || row['topic'] || '',
                  mission: row['Mission'] || row['mission'] || '',
                  outcomes: row['Outcomes'] || row['outcomes'] ? (row['Outcomes'] || row['outcomes']).split(',').map((s: string) => s.trim()) : [],
                }))}
                templateData={[
                  {
                    'Session Number': 1,
                    'Topic': 'Introduction to Content Strategy',
                    'Mission': 'Understand basic concepts',
                    'Outcomes': 'LO1,LO2'
                  },
                  {
                    'Session Number': 2,
                    'Topic': 'Content Planning',
                    'Mission': 'Create content plans',
                    'Outcomes': 'LO2,LO3'
                  }
                ]}
                fileName="session_template.xlsx"
                sheetName="Session Template"
              />
            </div>

            {/* Assessment Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📝</span>
                <span>Assessment Information</span>
              </h2>
              <DataPreview
                title="📝 Assessment"
                icon="📝"
                color="#EF4444"
                data={assessmentsData}
                columns={getAssessmentColumns()}
                visible={true}
              />
              <ExcelUpload
                title="Assessments"
                icon="📝"
                color="#EF4444"
                expectedFormat={{
                  required: ['Category', 'Quantity', 'Weight'],
                  optional: ['Completion Criteria', 'Duration', 'Question Type'],
                  notes: ['Weight: Use percentage (e.g., 20 for 20%)']
                }}
                onDataUploaded={(data) => setAssessmentsData(data)}
                transformData={(jsonData) => jsonData.map((row: any, index: number) => ({
                  id: index + 1,
                  category: row['Category'] || row['category'] || '',
                  quantity: row['Quantity'] || row['quantity'] || 1,
                  weight: row['Weight'] || row['weight'] || 0,
                  completionCriteria: row['Completion Criteria'] || row['completionCriteria'] || '',
                  duration: row['Duration'] || row['duration'] || '',
                  questionType: row['Question Type'] || row['questionType'] || '',
                }))}
                templateData={[
                  {
                    'Category': 'Quiz',
                    'Quantity': 10,
                    'Weight': 20,
                    'Completion Criteria': 'Score 70% or higher',
                    'Duration': '30 minutes',
                    'Question Type': 'Multiple Choice'
                  },
                  {
                    'Category': 'Assignment',
                    'Quantity': 1,
                    'Weight': 30,
                    'Completion Criteria': 'Submit on time',
                    'Duration': '1 week',
                    'Question Type': 'Essay'
                  }
                ]}
                fileName="assessment_template.xlsx"
                sheetName="Assessment Template"
              />
            </div>

            {/* Review All Button */}
            {(previewData.length > 0 || materialsData.length > 0 || outcomesData.length > 0 || sessionsData.length > 0 || assessmentsData.length > 0) && (
              <div className="text-center pt-6">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => setCurrentStep(1)}
                  icon={<CheckCircleOutlined />}
                  className="rounded-lg px-8"
                >
                  Review All Data
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">📋 Data Review</h1>
                  <p className="text-blue-100 text-lg">
                    Please review all uploaded data before confirming
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-blue-100">Ready to Update</div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <SummaryCard
                icon="📚"
                count={previewData.length}
                label="Subjects"
                color="#3B82F6"
                delay={0.1}
              />
              <SummaryCard
                icon="📖"
                count={materialsData.length}
                label="Materials"
                color="#10B981"
                delay={0.2}
              />
              <SummaryCard
                icon="🎯"
                count={outcomesData.length}
                label="Outcomes"
                color="#8B5CF6"
                delay={0.3}
              />
              <SummaryCard
                icon="📅"
                count={sessionsData.length}
                label="Sessions"
                color="#F59E0B"
                delay={0.4}
              />
              <SummaryCard
                icon="📝"
                count={assessmentsData.length}
                label="Assessments"
                color="#EF4444"
                delay={0.5}
              />
            </div>

            {/* Data Sections */}
            <div className="space-y-6">
              <ReviewSection
                title="Subject Information"
                icon="📚"
                color="#3B82F6"
                data={previewData}
                columns={getSubjectColumns()}
                visible={previewData.length > 0}
                delay={0.6}
              />
              <ReviewSection
                title="Material Information"
                icon="📖"
                color="#10B981"
                data={materialsData}
                columns={getMaterialColumns()}
                visible={materialsData.length > 0}
                delay={0.7}
              />
              <ReviewSection
                title="Learning Outcomes"
                icon="🎯"
                color="#8B5CF6"
                data={outcomesData}
                columns={getOutcomeColumns()}
                visible={outcomesData.length > 0}
                delay={0.8}
              />
              <ReviewSection
                title="Session Information"
                icon="📅"
                color="#F59E0B"
                data={sessionsData}
                columns={getSessionColumns()}
                visible={sessionsData.length > 0}
                delay={0.9}
              />
              <ReviewSection
                title="Assessment Information"
                icon="📝"
                color="#EF4444"
                data={assessmentsData}
                columns={getAssessmentColumns()}
                visible={assessmentsData.length > 0}
                delay={1.0}
              />
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-8 bg-white rounded-lg shadow-lg p-6 border"
            >
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600 font-medium">
                    All data is ready for update
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setCurrentStep(0)}
                    size="large"
                    className="rounded-lg px-6"
                  >
                    ← Back to Edit
                  </Button>
                  <Button 
                    onClick={() => navigate('/manager/subject')}
                    size="large"
                    className="rounded-lg px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleConfirm}
                    icon={<CheckCircleOutlined />}
                    size="large"
                    className="rounded-lg px-8 bg-gradient-to-r from-green-500 to-blue-500 border-0 hover:from-green-600 hover:to-blue-600"
                  >
                    Confirm & Update
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EditSubjectPage; 