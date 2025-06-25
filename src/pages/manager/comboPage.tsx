import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import ManagerTable from '../../components/manager/managerTable';
import StatusBadge from '../../components/manager/statusBadge';
import SearchBar from '../../components/common/searchBar';

const { Option } = Select;

// Mock data for combos
const initialCombos = [
  { id: 340, name: 'SE_COM5.2: Topic on Japanese Bridge Engineer_Chủ đề Kỹ sư cầu nối Nhật Bản (Định hướng Tiếng Nhật nâng cao cho kỹ sư CNTT) BIT_SE_K15A' },
  { id: 402, name: 'SE_COM6: Topic on Information Technology - Korean Language_Chủ đề Công nghệ thông tin - tiếng Hàn BIT_SE_K15C' },
  { id: 1469, name: 'SE_COM5.1.1:Topic on Japanese Bridge Engineer_Chủ đề Kỹ sư cầu nối Nhật Bản (Định hướng Tiếng Nhật CNTT: Lựa chọn JFE301 và 1 trong 2 học phần JIS401, JIT401 để triển khai ở kỳ 8) BIT_SE_K15C' },
  { id: 2566, name: 'SE_COM7.1:Topic on AI_Chủ đề AI' },
  { id: 2497, name: 'SE_COM4.1: Topic on React/NodeJS_Chủ đề React/NodeJS' },
  { id: 2605, name: 'SE_COM11: Topic on IC design_Chủ đề Thiết kế vi mạch' },
  { id: 2616, name: 'SE_COM3.2: Topic on .NET Programming_Chủ đề lập trình .NET BIT_SE_From_K18A' },
  { id: 2640, name: 'SE_COM10.2: Topic on Intensive Java_Chủ đề Java chuyên sâu_K19A' },
  { id: 2639, name: 'SE_COM14: Topic on Applied Data Science_Chủ đề Khoa học dữ liệu (KHDL) ứng dụng' },
  { id: 2638, name: 'SE_COM13: Topic on DevSepOps for cloud_Chủ đề Tích hợp DevSepOps cho cloud' },
  { id: 2628, name: 'SE_COM12: Topic on Game Development_Phát triển game' },
].map((combo, idx) => ({
  ...combo,
  status: ['pending', 'active', 'in-active'][idx % 3] as 'pending' | 'active' | 'in-active',
}));

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'in-active', label: 'Inactive' },
];

const pageSize = 5;

const ComboPage: React.FC = () => {
  const [combos, setCombos] = useState(initialCombos);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');

  // Filtered data
  const filtered = combos.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    String(c.id).includes(search)
  );
  // Pagination
  const pagedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Combo Name',
      dataIndex: 'name',
      key: 'name',
      width: 500,
      align: 'left' as const,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => <StatusBadge status={status as 'pending' | 'active' | 'in-active'} />,
      align: 'center' as const,
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
    setCombos(combos.filter((c) => c.id !== id));
    message.success('Deleted combo!');
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setCombos(combos.map((c) => (c.id === editing.id ? { ...editing, ...values } : c)));
        message.success('Updated successfully!');
      } else {
        const newId = Math.max(...combos.map((c) => c.id)) + 1;
        setCombos([
          ...combos,
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
    <div className="p-6 mx-auto">
      <div className="bg-white rounded-t-xl border border-b-0 border-gray-200 shadow-md p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={v => { setSearch(v); setCurrentPage(1); }}
              placeholder="Search by ID or combo name..."
              className="w-full"
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} className="sm:ml-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              Add Combo
            </Button>
          </motion.div>
        </div>
      </div>
      <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 shadow-md p-4">
        <ManagerTable
          columns={columns}
          data={pagedData}
          pageSize={pageSize}
          currentPage={currentPage}
          total={filtered.length}
          onPageChange={setCurrentPage}
          onEdit={onEdit}
          onDelete={(row) => onDelete(row.id)}
        />
      </div>
      <AnimatePresence>
        {modalOpen && (
          <Modal
            open={modalOpen}
            title={editing ? 'Update Combo' : 'Add Combo'}
            onCancel={() => setModalOpen(false)}
            onOk={handleOk}
            okText={editing ? 'Update' : 'Add'}
            cancelText="Cancel"
            centered
            footer={null}
            width={520}
            className="rounded-xl"
            destroyOnClose
            style={{ background: '#fff', borderRadius: 16 }}
            bodyStyle={{ background: '#fff', borderRadius: 16 }}
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
                initialValues={{ status: 'pending' }}
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

export default ComboPage;
