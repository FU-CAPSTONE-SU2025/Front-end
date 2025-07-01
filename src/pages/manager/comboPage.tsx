import React, { useState } from 'react';
import { Button, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import ManagerTable from '../../components/manager/managerTable';
import StatusBadge from '../../components/manager/statusBadge';
import SearchBar from '../../components/common/searchBar';
import { useNavigate } from 'react-router';

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

const pageSize = 5;

const ComboPage: React.FC = () => {
  const [combos, setCombos] = useState(initialCombos);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

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
    {
      title: 'View',
      key: 'view',
      dataIndex: 'view',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => navigate(`/manager/combo/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  // CRUD handlers
  const onAdd = () => {
    navigate('/manager/combo/add');
  };

  const onEdit = (record: any) => {
    navigate(`/manager/combo/edit/${record.id}`);
  };

  const onDelete = (id: number) => {
    setCombos(combos.filter((c) => c.id !== id));
    message.success('Deleted combo!');
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
    </div>
  );
};

export default ComboPage;
