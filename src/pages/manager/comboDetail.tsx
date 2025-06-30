import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Input, Select, message, Card, Tag, Statistic, Row, Col } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  BookOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Option } = Select;

// Mock data giống comboPage
const initialCombos = [
  { id: 340, name: 'SE_COM5.2: Topic on Japanese Bridge Engineer_Chủ đề Kỹ sư cầu nối Nhật Bản (Định hướng Tiếng Nhật nâng cao cho kỹ sư CNTT) BIT_SE_K15A', status: 'pending' },
  { id: 402, name: 'SE_COM6: Topic on Information Technology - Korean Language_Chủ đề Công nghệ thông tin - tiếng Hàn BIT_SE_K15C', status: 'active' },
  { id: 1469, name: 'SE_COM5.1.1:Topic on Japanese Bridge Engineer_Chủ đề Kỹ sư cầu nối Nhật Bản (Định hướng Tiếng Nhật CNTT: Lựa chọn JFE301 và 1 trong 2 học phần JIS401, JIT401 để triển khai ở kỳ 8) BIT_SE_K15C', status: 'in-active' },
  { id: 2566, name: 'SE_COM7.1:Topic on AI_Chủ đề AI', status: 'pending' },
  { id: 2497, name: 'SE_COM4.1: Topic on React/NodeJS_Chủ đề React/NodeJS', status: 'active' },
  { id: 2605, name: 'SE_COM11: Topic on IC design_Chủ đề Thiết kế vi mạch', status: 'in-active' },
  { id: 2616, name: 'SE_COM3.2: Topic on .NET Programming_Chủ đề lập trình .NET BIT_SE_From_K18A', status: 'pending' },
  { id: 2640, name: 'SE_COM10.2: Topic on Intensive Java_Chủ đề Java chuyên sâu_K19A', status: 'active' },
  { id: 2639, name: 'SE_COM14: Topic on Applied Data Science_Chủ đề Khoa học dữ liệu (KHDL) ứng dụng', status: 'in-active' },
  { id: 2638, name: 'SE_COM13: Topic on DevSepOps for cloud_Chủ đề Tích hợp DevSepOps cho cloud', status: 'pending' },
  { id: 2628, name: 'SE_COM12: Topic on Game Development_Phát triển game', status: 'active' },
];

// Mock data cho subjects trong combo
const comboSubjects: { [key: number]: Array<{
  id: number;
  subjectCode: string;
  subjectName: string;
  semester: number;
  note: string;
  credits: number;
  type: string;
}> } = {
  2497: [ // SE_COM4.1: Topic on React/NodeJS
    {
      id: 6327,
      subjectCode: 'WDP301',
      subjectName: 'Web Development Project_Dự án phát triển web',
      semester: 8,
      note: '',
      credits: 3,
      type: 'Project'
    },
    {
      id: 6706,
      subjectCode: 'FER202',
      subjectName: 'Front-End web development with React_Phát triển web Front-End với React',
      semester: 5,
      note: '',
      credits: 3,
      type: 'Core'
    },
    {
      id: 6707,
      subjectCode: 'MMA301',
      subjectName: 'Multiplatform Mobile App Development_Phát triển ứng dụng di động đa nền tảng',
      semester: 7,
      note: '',
      credits: 3,
      type: 'Core'
    },
    {
      id: 6823,
      subjectCode: 'SDN302',
      subjectName: 'Server-Side development with NodeJS, Express, and MongoDB_Phát triển Server-Side với NodeJS, Express và MongoDB',
      semester: 6,
      note: '',
      credits: 3,
      type: 'Core'
    }
  ],
  340: [ // SE_COM5.2: Topic on Japanese Bridge Engineer
    {
      id: 1234,
      subjectCode: 'JFE301',
      subjectName: 'Japanese Bridge Engineering_Kỹ sư cầu nối Nhật Bản',
      semester: 7,
      note: 'Core subject for Japanese track',
      credits: 3,
      type: 'Core'
    },
    {
      id: 1235,
      subjectCode: 'JIS401',
      subjectName: 'Japanese Information Systems_Hệ thống thông tin Nhật Bản',
      semester: 8,
      note: 'Optional subject',
      credits: 2,
      type: 'Elective'
    }
  ],
  // Thêm subjects cho các combo khác nếu cần
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'in-active', label: 'Inactive' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'green';
    case 'pending': return 'orange';
    case 'in-active': return 'red';
    default: return 'default';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Core': return 'blue';
    case 'Elective': return 'purple';
    case 'Project': return 'green';
    default: return 'default';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Core': return <CheckCircleOutlined />;
    case 'Elective': return <TeamOutlined />;
    case 'Project': return <TrophyOutlined />;
    default: return <BookOutlined />;
  }
};

const ComboDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [combos, setCombos] = useState(initialCombos);
  const [modalOpen, setModalOpen] = useState(false);

  const combo = combos.find(c => String(c.id) === String(id));
  const subjects = comboSubjects[Number(id)] || [];

  if (!combo) {
    return (
      <div className="p-6 mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-8 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Combo Not Found</h2>
          <p className="text-gray-600 mb-4">The combo you're looking for doesn't exist.</p>
          <Button type="primary" onClick={() => navigate('/manager/combo')}>
            Back to Combos
          </Button>
        </div>
      </div>
    );
  }

  const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
  const semesters = [...new Set(subjects.map(s => s.semester))].sort((a, b) => a - b);

  const handleEdit = () => {
    form.setFieldsValue(combo);
    setModalOpen(true);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Combo',
      content: 'Are you sure you want to delete this combo? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        message.success('Combo deleted successfully!');
        navigate('/manager/combo');
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      setCombos(combos.map((c) => (c.id === combo.id ? { ...combo, ...values } : c)));
      message.success('Combo updated successfully!');
      setModalOpen(false);
    });
  };

  return (
    <div className="p-6 mx-auto">
      {/* Header Section */}
      <motion.div 
        className="bg-white rounded-t-xl border border-b-0 border-gray-200 shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/manager/comboPage')}
                  className="hover:bg-blue-50"
                />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Combo Details</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold">ID:</span> #{combo.id}
                  </span>
                  <Tag 
                    color={getStatusColor(combo.status)} 
                    className="text-xs font-medium"
                  >
                    {combo.status.toUpperCase()}
                  </Tag>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <TrophyOutlined className="text-blue-600" />
                Combo Name
              </h2>
              <p className="text-gray-700 leading-relaxed">{combo.name}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button 
                icon={<EditOutlined />} 
                onClick={handleEdit} 
                type="primary" 
                size="large"
              >
                Edit Combo
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button 
                icon={<DeleteOutlined />} 
                onClick={handleDelete} 
                danger 
                size="large"
              >
                Delete Combo
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Section */}
      <motion.div 
        className="bg-white border border-gray-200 shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm">
              <Statistic
                title="Total Subjects"
                value={subjects.length}
                prefix={<BookOutlined className="text-blue-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm">
              <Statistic
                title="Total Credits"
                value={totalCredits}
                prefix={<FileTextOutlined className="text-green-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm">
              <Statistic
                title="Semesters"
                value={semesters.length}
                prefix={<CalendarOutlined className="text-purple-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm">
              <Statistic
                title="Duration"
                value={`${Math.max(...semesters) - Math.min(...semesters) + 1} sem`}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Subjects Section */}
      <motion.div 
        className="bg-white rounded-b-xl border border-t-0 border-gray-200 shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOutlined className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Subjects in this Combo</h3>
            <p className="text-gray-600 text-sm">Explore all subjects included in this specialization track</p>
          </div>
          <Tag color="blue" className="ml-auto">
            {subjects.length} subjects
          </Tag>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📚</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No Subjects Found</h4>
            <p className="text-gray-600">This combo doesn't have any subjects assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className="hover:shadow-md transition-shadow duration-200 border border-gray-100"
                  bodyStyle={{ padding: '16px' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded text-sm">
                          {subject.subjectCode}
                        </span>
                        <Tag 
                          color={getTypeColor(subject.type)} 
                          icon={getTypeIcon(subject.type)}
                          className="text-xs"
                        >
                          {subject.type}
                        </Tag>
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 leading-relaxed">
                        {subject.subjectName}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <CalendarOutlined />
                        Semester {subject.semester}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileTextOutlined />
                        {subject.credits} credits
                      </span>
                    </div>
                    <span className="text-gray-400">#{subject.id}</span>
                  </div>
                  
                  {subject.note && (
                    <div className="mt-3 pt-2 border-t border-gray-100 bg-yellow-50 rounded p-2">
                      <p className="text-xs text-gray-600 italic">
                        <span className="font-medium">Note:</span> {subject.note}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <Modal
        open={modalOpen}
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-blue-600" />
            Edit Combo
          </div>
        }
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="Update"
        cancelText="Cancel"
        centered
        footer={null}
        width={480}
        className="rounded-xl"
        destroyOnClose
        style={{ background: '#fff', borderRadius: 16 }}
        bodyStyle={{ background: '#fff', borderRadius: 16 }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={combo}
          onFinish={handleOk}
          className="space-y-2"
        >
          <Form.Item
            name="name"
            label="Combo Name"
            rules={[{ required: true, message: 'Please enter combo name!' }]}
          >
            <Input className="!rounded-lg" placeholder="Enter combo name" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select className="!rounded-lg">
              {statusOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Update Combo
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ComboDetail; 