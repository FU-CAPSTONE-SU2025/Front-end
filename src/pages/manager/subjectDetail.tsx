import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Card, Descriptions, Tag, Space, Table, Divider } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, BookOutlined, FileTextOutlined, TagOutlined, CalendarOutlined, FormOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import StatusBadge from '../../components/manager/statusBadge';
import { ISubjectDetail } from '../../interfaces/ISubject';

// Custom CSS for better table styling
const customStyles = `
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

interface MaterialData {
  id: number;
  materialName: string;
  authorName: string;
  publishedDate: string;
  description: string;
  filepathOrUrl: string;
}

interface OutcomeData {
  id: number;
  outcomeCode: string;
  description: string;
}

interface SessionData {
  id: number;
  sessionNumber: number;
  topic: string;
  mission: string;
  outcomes: string[];
}

interface AssessmentData {
  id: number;
  category: string;
  quantity: number;
  weight: number;
  completionCriteria: string;
  duration: string;
  questionType: string;
}

// Extended interface for full subject data
interface ExtendedSubjectDetail extends ISubjectDetail {
  materials: MaterialData[];
  outcomes: OutcomeData[];
  sessions: SessionData[];
  assessments: AssessmentData[];
}

// Mock data - in real app this would come from API
const mockSubjects: ExtendedSubjectDetail[] = [
  {
    id: 1,
    syllabusId: '12577',
    subjectCode: 'CSP202m',
    subjectName: 'Introduction of Content Strategy _ Nhập môn chiến lược nội dung',
    syllabusName: 'Introduction of Content Strategy _ Nhập môn chiến lược nội dung',
    decisionNo: '553/QĐ-ĐHFPT dated 05/15/2025',
    status: 'active',
    description: 'This course introduces students to the fundamentals of content strategy and its application in digital marketing.',
    credits: 3,
    semester: 'Fall 2025',
    department: 'Digital Marketing',
    prerequisites: ['MKT101', 'COM201'],
    learningOutcomes: [
      'Understand content strategy principles',
      'Develop content marketing plans',
      'Analyze content performance metrics'
    ],
    materials: [
      {
        id: 1,
        materialName: 'Content Strategy Fundamentals',
        authorName: 'Content Marketing Institute',
        publishedDate: '2024',
        description: 'Core concepts of content strategy',
        filepathOrUrl: 'https://contentmarketinginstitute.com/fundamentals'
      },
      {
        id: 2,
        materialName: 'Digital Marketing Guide',
        authorName: 'Marketing Experts',
        publishedDate: '2023',
        description: 'Comprehensive digital marketing guide',
        filepathOrUrl: 'https://example.com/digital-marketing-guide.pdf'
      }
    ],
    outcomes: [
      {
        id: 1,
        outcomeCode: 'LO1',
        description: 'Understand content strategy principles'
      },
      {
        id: 2,
        outcomeCode: 'LO2',
        description: 'Develop content marketing plans'
      },
      {
        id: 3,
        outcomeCode: 'LO3',
        description: 'Analyze content performance metrics'
      }
    ],
    sessions: [
      {
        id: 1,
        sessionNumber: 1,
        topic: 'Introduction to Content Strategy',
        mission: 'Understand basic content strategy concepts',
        outcomes: ['LO1']
      },
      {
        id: 2,
        sessionNumber: 2,
        topic: 'Content Planning and Development',
        mission: 'Learn to develop content marketing plans',
        outcomes: ['LO1', 'LO2']
      },
      {
        id: 3,
        sessionNumber: 3,
        topic: 'Content Performance Analysis',
        mission: 'Analyze and measure content performance',
        outcomes: ['LO3']
      }
    ],
    assessments: [
      {
        id: 1,
        category: 'Assignment',
        quantity: 3,
        weight: 40,
        completionCriteria: 'Submit on time with proper documentation',
        duration: '2 weeks each',
        questionType: 'Case Study'
      },
      {
        id: 2,
        category: 'Project',
        quantity: 1,
        weight: 30,
        completionCriteria: 'Present final project',
        duration: '4 weeks',
        questionType: 'Project'
      },
      {
        id: 3,
        category: 'Final Exam',
        quantity: 1,
        weight: 30,
        completionCriteria: 'Score 60% or higher',
        duration: '2 hours',
        questionType: 'Written'
      }
    ]
  },
  {
    id: 2,
    syllabusId: '12908',
    subjectCode: 'DXE291c',
    subjectName: 'Digital Ecosystem: From Governance to Business_Hệ sinh thái số: Từ Quản lý đến Kinh doanh',
    syllabusName: 'Digital Ecosystem: From Governance to Business_Hệ sinh thái số: Từ Quản lý đến Kinh doanh',
    decisionNo: '524/QĐ-ĐHFPT dated 05/09/2025',
    status: 'active',
    description: 'Comprehensive study of digital ecosystems and their impact on business governance and operations.',
    credits: 4,
    semester: 'Spring 2025',
    department: 'Business Administration',
    prerequisites: ['BUS101', 'TECH201'],
    learningOutcomes: [
      'Analyze digital ecosystem components',
      'Evaluate governance frameworks',
      'Design business strategies for digital transformation'
    ],
    materials: [
      {
        id: 1,
        materialName: 'Digital Ecosystem Analysis',
        authorName: 'Business Technology Institute',
        publishedDate: '2024',
        description: 'Understanding digital ecosystems',
        filepathOrUrl: 'https://example.com/digital-ecosystem.pdf'
      }
    ],
    outcomes: [
      {
        id: 1,
        outcomeCode: 'LO1',
        description: 'Analyze digital ecosystem components'
      },
      {
        id: 2,
        outcomeCode: 'LO2',
        description: 'Evaluate governance frameworks'
      },
      {
        id: 3,
        outcomeCode: 'LO3',
        description: 'Design business strategies for digital transformation'
      }
    ],
    sessions: [
      {
        id: 1,
        sessionNumber: 1,
        topic: 'Introduction to Digital Ecosystems',
        mission: 'Understand digital ecosystem fundamentals',
        outcomes: ['LO1']
      }
    ],
    assessments: [
      {
        id: 1,
        category: 'Research Paper',
        quantity: 1,
        weight: 50,
        completionCriteria: 'Submit comprehensive analysis',
        duration: '6 weeks',
        questionType: 'Research'
      }
    ]
  },
  {
    id: 3,
    syllabusId: '12931',
    subjectCode: 'GRF491',
    subjectName: 'Graduation Thesis - Finance_Khóa luận tốt nghiệp -Tài chính',
    syllabusName: 'Graduation Thesis - Finance_Khóa luận tốt nghiệp -Tài chính',
    decisionNo: '524/QĐ-ĐHFPT dated 05/09/2025',
    status: 'pending',
    description: 'Capstone project for finance students to demonstrate comprehensive understanding of financial concepts.',
    credits: 6,
    semester: 'Final Year',
    department: 'Finance',
    prerequisites: ['FIN301', 'FIN302', 'FIN303'],
    learningOutcomes: [
      'Conduct independent research',
      'Apply financial theories to real-world problems',
      'Present findings professionally'
    ],
    materials: [
      {
        id: 1,
        materialName: 'Research Methodology Guide',
        authorName: 'Academic Research Institute',
        publishedDate: '2024',
        description: 'Guide for conducting academic research',
        filepathOrUrl: 'https://example.com/research-methodology.pdf'
      }
    ],
    outcomes: [
      {
        id: 1,
        outcomeCode: 'LO1',
        description: 'Conduct independent research'
      },
      {
        id: 2,
        outcomeCode: 'LO2',
        description: 'Apply financial theories to real-world problems'
      },
      {
        id: 3,
        outcomeCode: 'LO3',
        description: 'Present findings professionally'
      }
    ],
    sessions: [
      {
        id: 1,
        sessionNumber: 1,
        topic: 'Research Methodology',
        mission: 'Learn research methods and approaches',
        outcomes: ['LO1']
      }
    ],
    assessments: [
      {
        id: 1,
        category: 'Thesis',
        quantity: 1,
        weight: 100,
        completionCriteria: 'Submit and defend thesis',
        duration: '12 weeks',
        questionType: 'Research Project'
      }
    ]
  },
  {
    id: 4,
    syllabusId: '12915',
    subjectCode: 'JJP301',
    subjectName: 'Japanese Phonetics and Lexicology_Ngữ âm học và từ vựng học tiếng Nhật',
    syllabusName: 'Japanese Phonetics and Lexicology_Ngữ âm học và từ vựng học tiếng Nhật',
    decisionNo: '',
    status: 'in-active',
    description: 'Advanced study of Japanese phonetics and vocabulary development for language learners.',
    credits: 3,
    semester: 'Fall 2025',
    department: 'Languages',
    prerequisites: ['JPN201', 'JPN202'],
    learningOutcomes: [
      'Master Japanese pronunciation',
      'Expand vocabulary knowledge',
      'Improve listening comprehension'
    ],
    materials: [
      {
        id: 1,
        materialName: 'Japanese Phonetics Guide',
        authorName: 'Language Learning Institute',
        publishedDate: '2024',
        description: 'Comprehensive guide to Japanese phonetics',
        filepathOrUrl: 'https://example.com/japanese-phonetics.pdf'
      }
    ],
    outcomes: [
      {
        id: 1,
        outcomeCode: 'LO1',
        description: 'Master Japanese pronunciation'
      },
      {
        id: 2,
        outcomeCode: 'LO2',
        description: 'Expand vocabulary knowledge'
      },
      {
        id: 3,
        outcomeCode: 'LO3',
        description: 'Improve listening comprehension'
      }
    ],
    sessions: [
      {
        id: 1,
        sessionNumber: 1,
        topic: 'Japanese Phonetics Basics',
        mission: 'Learn basic Japanese pronunciation',
        outcomes: ['LO1']
      }
    ],
    assessments: [
      {
        id: 1,
        category: 'Oral Exam',
        quantity: 1,
        weight: 40,
        completionCriteria: 'Demonstrate pronunciation skills',
        duration: '30 minutes',
        questionType: 'Oral'
      },
      {
        id: 2,
        category: 'Written Exam',
        quantity: 1,
        weight: 60,
        completionCriteria: 'Score 70% or higher',
        duration: '2 hours',
        questionType: 'Written'
      }
    ]
  }
];

const SubjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const subject = mockSubjects.find(s => s.id === parseInt(id || '0'));
  
  if (!subject) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Subject not found
        </div>
      </div>
    );
  }

  // Table columns for different data types
  const getMaterialColumns = () => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Material Name',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 250,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'Author Name',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 150,
    },
    {
      title: 'Published Date',
      dataIndex: 'publishedDate',
      key: 'publishedDate',
      width: 120,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'File Path/URL',
      dataIndex: 'filepathOrUrl',
      key: 'filepathOrUrl',
      width: 200,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
  ];

  const getOutcomeColumns = () => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Outcome Code',
      dataIndex: 'outcomeCode',
      key: 'outcomeCode',
      width: 120,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 400,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
  ];

  const getSessionColumns = () => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Session Number',
      dataIndex: 'sessionNumber',
      key: 'sessionNumber',
      width: 120,
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      width: 250,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'Mission',
      dataIndex: 'mission',
      key: 'mission',
      width: 250,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'Outcomes',
      dataIndex: 'outcomes',
      key: 'outcomes',
      width: 200,
      render: (outcomes: string[]) => outcomes?.join(', ') || '-',
    },
  ];

  const getAssessmentColumns = () => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Weight (%)',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
    },
    {
      title: 'Completion Criteria',
      dataIndex: 'completionCriteria',
      key: 'completionCriteria',
      width: 200,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
    },
    {
      title: 'Question Type',
      dataIndex: 'questionType',
      key: 'questionType',
      width: 150,
    },
  ];

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <style>{customStyles}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/manager/subject')}
                className="flex items-center"
              >
                Back to Subjects
              </Button>
              <h1 className="text-3xl font-bold text-gray-800">
                Subject Details
              </h1>
            </div>
            <Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/manager/subject/edit/${id}`)}
              >
                Edit
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            </Space>
          </div>
        </div>

        {/* Subject Information */}
        <Card 
          title={
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-semibold text-blue-600">Subject Information</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                ID: {subject.id}
              </span>
            </div>
          } 
          className="shadow-lg border-l-4 border-blue-500 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Syllabus ID:</span>
                  <span className="font-medium">{subject.syllabusId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject Code:</span>
                  <span className="font-medium">{subject.subjectCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject Name:</span>
                  <span className="font-medium">{subject.subjectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Syllabus Name:</span>
                  <span className="font-medium">{subject.syllabusName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits:</span>
                  <span className="font-medium">{subject.credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <StatusBadge status={subject.status} />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Additional Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">Prerequisites:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {subject.prerequisites.map((prereq, index) => (
                      <Tag key={index} color="orange">{prereq}</Tag>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Divider />
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{subject.description}</p>
          </div>
        </Card>

        {/* Learning Outcomes */}
        <Card 
          title={
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-semibold text-purple-600">Learning Outcomes</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                {subject.learningOutcomes.length} outcomes
              </span>
            </div>
          } 
          className="shadow-lg border-l-4 border-purple-500 mb-8"
        >
          <Table
            columns={getOutcomeColumns()}
            dataSource={subject.outcomes}
            pagination={false}
            scroll={{ x: 800 }}
            size="small"
            className="custom-table"
          />
        </Card>

        {/* Learning Materials */}
        <Card 
          title={
            <div className="flex items-center gap-3">
              <span className="text-2xl">📖</span>
              <span className="text-xl font-semibold text-green-600">Learning Materials</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                {subject.materials.length} materials
              </span>
            </div>
          } 
          className="shadow-lg border-l-4 border-green-500 mb-8"
        >
          <Table
            columns={getMaterialColumns()}
            dataSource={subject.materials}
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
            className="custom-table"
          />
        </Card>

        {/* Session Information */}
        <Card 
          title={
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <span className="text-xl font-semibold text-orange-600">Session Information</span>
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                {subject.sessions.length} sessions
              </span>
            </div>
          } 
          className="shadow-lg border-l-4 border-orange-500 mb-8"
        >
          <Table
            columns={getSessionColumns()}
            dataSource={subject.sessions}
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
            className="custom-table"
          />
        </Card>

        {/* Assessment Information */}
        <Card 
          title={
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <span className="text-xl font-semibold text-red-600">Assessment Information</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                {subject.assessments.length} assessments
              </span>
            </div>
          } 
          className="shadow-lg border-l-4 border-red-500"
        >
          <Table
            columns={getAssessmentColumns()}
            dataSource={subject.assessments}
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
            className="custom-table"
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default SubjectDetail; 