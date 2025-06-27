import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

// Mock data giống trang home
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
  // ... (các mục khác, copy từ home.tsx nếu cần)
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'in-active', label: 'Inactive' },
];

const CurriculumDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [curriculums, setCurriculums] = useState(initialCurriculums);
  const [modalOpen, setModalOpen] = useState(false);

  const curriculum = curriculums.find(c => String(c.id) === String(id));

  if (!curriculum) {
    return <div className="p-8">Curriculum not found.</div>;
  }

  const handleEdit = () => {
    form.setFieldsValue(curriculum);
    setEditing(true);
    setModalOpen(true);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Curriculum',
      content: 'Are you sure you want to delete this curriculum?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        message.success('Deleted curriculum!');
        navigate('/manager/home');
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      setCurriculums(curriculums.map((c) => (c.id === curriculum.id ? { ...curriculum, ...values } : c)));
      message.success('Updated successfully!');
      setModalOpen(false);
    });
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Curriculum Detail</h2>
      <div className="mb-4">
        <b>Curriculum Code:</b> {curriculum.curriculumCode}
      </div>
      <div className="mb-4">
        <b>Name:</b> {curriculum.name}
      </div>
      <div className="mb-4">
        <b>Description:</b> {curriculum.description}
      </div>
      <div className="mb-4">
        <b>Decision No:</b> {curriculum.decisionNo}
      </div>
      <div className="mb-4">
        <b>Decision Date:</b> {curriculum.decisionDate}
      </div>
      <div className="mb-4">
        <b>Total Credit:</b> {curriculum.totalCredit}
      </div>
      <div className="mb-4">
        <b>Status:</b> {curriculum.status}
      </div>
      <div className="flex gap-2 mt-6">
        <Button icon={<EditOutlined />} onClick={handleEdit} type="primary">Edit</Button>
        <Button icon={<DeleteOutlined />} onClick={handleDelete} danger>Delete</Button>
        <Button onClick={() => navigate('/manager/home')}>Back</Button>
      </div>
      <Modal
        open={modalOpen}
        title="Edit Curriculum"
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
          initialValues={curriculum}
          onFinish={handleOk}
          className="space-y-2"
        >
          <Form.Item
            name="curriculumCode"
            label="Curriculum Code"
            rules={[{ required: true, message: 'Please enter curriculum code!' }]}
          >
            <Input className="!rounded-lg" placeholder="Enter curriculum code" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name!' }]}
          >
            <Input className="!rounded-lg" placeholder="Enter curriculum name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description!' }]}
          >
            <Input.TextArea className="!rounded-lg" placeholder="Enter description" rows={2} />
          </Form.Item>
          <Form.Item
            name="decisionNo"
            label="Decision No"
            rules={[{ required: true, message: 'Please enter decision number!' }]}
          >
            <Input className="!rounded-lg" placeholder="Enter decision number" />
          </Form.Item>
          <Form.Item
            name="decisionDate"
            label="Decision Date (MM/dd/yyyy)"
            rules={[{ required: true, message: 'Please enter decision date!' }]}
          >
            <Input className="!rounded-lg" placeholder="MM/dd/yyyy" />
          </Form.Item>
          <Form.Item
            name="totalCredit"
            label="Total Credit"
            rules={[{ required: true, message: 'Please enter total credit!' }]}
          >
            <InputNumber className="!rounded-lg w-full" min={1} max={300} placeholder="Enter total credit" />
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
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CurriculumDetail; 