import React, { useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, message, Affix, Table, Flex, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../../components/manager/statusBadge';
import { useNavigate } from 'react-router';
import styles from '../../css/staff/staffTranscript.module.css';
import { useCRUDCurriculum } from '../../hooks/useCRUDSchoolMaterial';

const { Option } = Select;

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'in-active', label: 'Inactive' },
];

const HomePage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  // API integration
  const {
    getCurriculumMutation,
    addCurriculumMutation,
    updateCurriculumMutation,
    curriculumList,
    paginationCurriculum,
    isLoading
  } = useCRUDCurriculum();

  // Fetch curriculums on mount and when search/page changes
  React.useEffect(() => {
    getCurriculumMutation.mutate({
      pageNumber: currentPage,
      pageSize,
      filterValue: search
    });
  }, [currentPage, pageSize, search]);

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

  // Handlers
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
    // TODO: Implement delete API call
    message.info('Delete API not implemented yet.');
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editing) {
        updateCurriculumMutation.mutate({
          id: editing.id,
          data: values
        }, {
          onSuccess: () => {
            message.success('Updated successfully!');
            setModalOpen(false);
            getCurriculumMutation.mutate({ pageNumber: currentPage, pageSize, filterValue: search });
          },
          onError: () => {
            message.error('Failed to update curriculum!');
          }
        });
      } else {
        addCurriculumMutation.mutate(values, {
          onSuccess: () => {
            message.success('Added successfully!');
            setModalOpen(false);
            getCurriculumMutation.mutate({ pageNumber: currentPage, pageSize, filterValue: search });
          },
          onError: () => {
            message.error('Failed to add curriculum!');
          }
        });
      }
    });
  };

  // Use API-driven data
  const pagedData = curriculumList;

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
          loading={isLoading}
          pagination={false}
        />
      </div>
      {/* Pagination */}
      {paginationCurriculum && paginationCurriculum.total > 0 && (
        <div style={{marginTop: 32, display: 'flex', justifyContent: 'center'}}>
          <Pagination
            current={paginationCurriculum.current}
            pageSize={paginationCurriculum.pageSize}
            total={paginationCurriculum.total}
            showSizeChanger
            pageSizeOptions={[5, 10, 20, 50]}
            onChange={(p, ps) => { setCurrentPage(p); setPageSize(ps); }}
            style={{borderRadius: 8}}
          />
        </div>
      )}
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