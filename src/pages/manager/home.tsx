import React, { useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, message, Affix, Table, Flex } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../../components/manager/statusBadge';
import { useNavigate } from 'react-router';
import styles from '../../css/staff/staffTranscript.module.css';

const { Option } = Select;

// Mock data (English fields, more rows)
const initialCurriculums = [
  {
    id: 1,
    curriculumCode: 'IT2025',
    name: 'Information Technology',
    description: 'Bachelor of IT program',
    decisionNo: '123/QD-IT',
    decisionDate: '01/15/2023',
    totalCredit: 150,
    status: 'active',
  },
  {
    id: 2,
    curriculumCode: 'BA2025',
    name: 'Business Administration',
    description: 'BA program for managers',
    decisionNo: '456/QD-BA',
    decisionDate: '03/10/2023',
    totalCredit: 140,
    status: 'pending',
  },
  {
    id: 3,
    curriculumCode: 'TOUR2025',
    name: 'Tourism Management',
    description: 'Tourism and hospitality',
    decisionNo: '789/QD-TOUR',
    decisionDate: '12/20/2022',
    totalCredit: 135,
    status: 'in-active',
  },
  {
    id: 4,
    curriculumCode: 'ENG2025',
    name: 'English Language',
    description: 'English for international communication',
    decisionNo: '234/QD-ENG',
    decisionDate: '05/05/2023',
    totalCredit: 120,
    status: 'active',
  },
  {
    id: 5,
    curriculumCode: 'LAW2025',
    name: 'Law',
    description: 'Bachelor of Law',
    decisionNo: '567/QD-LAW',
    decisionDate: '07/18/2023',
    totalCredit: 130,
    status: 'pending',
  },
  {
    id: 6,
    curriculumCode: 'MED2025',
    name: 'Medicine',
    description: 'General Medicine program',
    decisionNo: '890/QD-MED',
    decisionDate: '09/30/2022',
    totalCredit: 180,
    status: 'active',
  },
  {
    id: 7,
    curriculumCode: 'CS2025',
    name: 'Computer Science',
    description: 'CS for software engineers',
    decisionNo: '321/QD-CS',
    decisionDate: '11/11/2022',
    totalCredit: 155,
    status: 'in-active',
  },
  {
    id: 8,
    curriculumCode: 'FIN2025',
    name: 'Finance',
    description: 'Finance and banking',
    decisionNo: '654/QD-FIN',
    decisionDate: '02/22/2023',
    totalCredit: 125,
    status: 'active',
  },
  {
    id: 9,
    curriculumCode: 'ARCH2025',
    name: 'Architecture',
    description: 'Architecture and design',
    decisionNo: '987/QD-ARCH',
    decisionDate: '04/14/2023',
    totalCredit: 160,
    status: 'pending',
  },
  {
    id: 10,
    curriculumCode: 'EDU2025',
    name: 'Education',
    description: 'Teacher education program',
    decisionNo: '111/QD-EDU',
    decisionDate: '06/01/2023',
    totalCredit: 110,
    status: 'active',
  },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'in-active', label: 'Inactive' },
];

const pageSize = 5;

const HomePage: React.FC = () => {
  const [curriculums, setCurriculums] = useState(initialCurriculums);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Filtered data
  const filtered = curriculums.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.curriculumCode.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );
  // Pagination
  const pagedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Table columns
  const columns = [
    {
      title: 'Curriculum Code',
      dataIndex: 'curriculumCode',
      key: 'curriculumCode',
      width: 140,
      align: 'center' as const,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      align: 'left' as const,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 220,
      align: 'left' as const,
    },
    {
      title: 'Decision No',
      dataIndex: 'decisionNo',
      key: 'decisionNo',
      width: 120,
      align: 'center' as const,
    },
    {
      title: 'Decision Date',
      dataIndex: 'decisionDate',
      key: 'decisionDate',
      width: 120,
      align: 'center' as const,
    },
    {
      title: 'Total Credit',
      dataIndex: 'totalCredit',
      key: 'totalCredit',
      width: 110,
      align: 'center' as const,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => <StatusBadge status={status as 'pending' | 'active' | 'in-active'} />,
      align: 'center' as const,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => (
        <div className={styles.sttActionButtons}>
          <Button
            type="link"
            icon={<EditOutlined style={{ color: '#f97316' }} />}
            onClick={() => onEdit(record)}
            style={{ color: '#f97316' }}
            title="Edit Curriculum"
          />
          <Button
            type="link"
            icon={<DeleteOutlined style={{ color: '#e53e3e' }} />}
            onClick={() => onDelete(record.id)}
            style={{ color: '#e53e3e' }}
            title="Delete Curriculum"
          />
        </div>
      ),
    },
  ];

  // CRUD handlers
  const onAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const onEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const onDelete = (id: number) => {
    setCurriculums(curriculums.filter((c) => c.id !== id));
    message.success('Deleted curriculum!');
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setCurriculums(curriculums.map((c) => (c.id === editing.id ? { ...editing, ...values } : c)));
        message.success('Updated successfully!');
      } else {
        const newId = Math.max(...curriculums.map((c) => c.id)) + 1;
        setCurriculums([
          ...curriculums,
          {
            ...values,
            id: newId,
            status: values.status,
          },
        ]);
        message.success('Added successfully!');
      }
      setModalOpen(false);
    });
  };

  return (
    <div className={styles.sttContainer}>
      {/* Sticky Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <div className={styles.sttToolbar}>
          <Input
            placeholder="Search by code, name, or description..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{maxWidth: 240, borderRadius: 999}}
            size="large"
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large" 
            style={{borderRadius: 999}}
            onClick={onAdd}
          >
            Add Curriculum
          </Button>
        </div>
      </Affix>
      {/* Curriculum Table */}
      <div>
        <Table
          columns={columns}
          dataSource={pagedData}
          rowKey="id"
          className={styles.sttFreshTable}
          locale={{ emptyText: 'No records available.' }}
          pagination={{ 
            current: currentPage,
            pageSize: pageSize,
            total: filtered.length,
            onChange: setCurrentPage,
            showSizeChanger: false
          }}
          style={{marginBottom: 0}}
        />
      </div>
      <AnimatePresence>
        {modalOpen && (
          <Modal
            open={modalOpen}
            title={editing ? 'Update Curriculum' : 'Add Curriculum'}
            onCancel={() => setModalOpen(false)}
            onOk={handleOk}
            okText={editing ? 'Update' : 'Add'}
            cancelText="Cancel"
            centered
            footer={null}
            width={480}
            destroyOnClose
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3 }}
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={{ status: 'pending', totalCredit: 120 }}
                onFinish={handleOk}
              >
                <Form.Item
                  name="curriculumCode"
                  label="Curriculum Code"
                  rules={[{ required: true, message: 'Please enter curriculum code!' }]}
                >
                  <Input placeholder="Enter curriculum code" />
                </Form.Item>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: 'Please enter name!' }]}
                >
                  <Input placeholder="Enter curriculum name" />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: 'Please enter description!' }]}
                >
                  <Input.TextArea placeholder="Enter description" rows={2} />
                </Form.Item>
                <Form.Item
                  name="decisionNo"
                  label="Decision No"
                  rules={[{ required: true, message: 'Please enter decision number!' }]}
                >
                  <Input placeholder="Enter decision number" />
                </Form.Item>
                <Form.Item
                  name="decisionDate"
                  label="Decision Date (MM/dd/yyyy)"
                  rules={[{ required: true, message: 'Please enter decision date!' }]}
                >
                  <Input placeholder="MM/dd/yyyy" />
                </Form.Item>
                <Form.Item
                  name="totalCredit"
                  label="Total Credit"
                  rules={[{ required: true, message: 'Please enter total credit!' }]}
                >
                  <InputNumber min={1} max={300} placeholder="Enter total credit" style={{width: '100%'}} />
                </Form.Item>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status!' }]}
                >
                  <Select>
                    {statusOptions.map((opt) => (
                      <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16}}>
                  <Button onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editing ? 'Update' : 'Add'}
                  </Button>
                </div>
              </Form>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;