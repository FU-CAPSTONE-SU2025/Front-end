import React, { useState } from 'react';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import ManagerTable from '../../components/manager/managerTable';
import StatusBadge from '../../components/manager/statusBadge';
import SearchBar from '../../components/common/searchBar';
import { useNavigate } from 'react-router-dom';
import { ISubject } from '../../interfaces/ISubject';

// Mock data based on the provided format
const initialSubjects: ISubject[] = [
  {
    id: 1,
    subjectCode: 'CSP202m',
    subjectName: 'Introduction of Content Strategy',
    combos: ['SE_COM1', 'SE_COM2'],
    prerequisites: ['MKT101', 'COM201'],
    status: 'active',
  },
  {
    id: 2,
    subjectCode: 'DXE291c',
    subjectName: 'Digital Ecosystem: From Governance to Business',
    combos: ['BA_COM1'],
    prerequisites: ['BUS101', 'TECH201'],
    status: 'active',
  },
  {
    id: 3,
    subjectCode: 'GRF491',
    subjectName: 'Graduation Thesis - Finance',
    combos: ['FIN_COM1'],
    prerequisites: ['FIN301', 'FIN302'],
    status: 'pending',
  },
  {
    id: 4,
    subjectCode: 'JJP301',
    subjectName: 'Japanese Phonetics and Lexicology',
    combos: ['LANG_COM1'],
    prerequisites: ['JPN201', 'JPN202'],
    status: 'in-active',
  },
  {
    id: 5,
    subjectCode: 'CSD301',
    subjectName: 'Computer Science Design',
    combos: ['IT_COM1', 'IT_COM2'],
    prerequisites: ['CS101', 'CS102'],
    status: 'active',
  },
  {
    id: 6,
    subjectCode: 'MKT401',
    subjectName: 'Marketing Management',
    combos: ['BA_COM2'],
    prerequisites: ['MKT201', 'MKT202'],
    status: 'active',
  },
  {
    id: 7,
    subjectCode: 'FIN301',
    subjectName: 'Financial Management',
    combos: ['FIN_COM1'],
    prerequisites: ['FIN101', 'FIN102'],
    status: 'pending',
  },
  {
    id: 8,
    subjectCode: 'ENG201',
    subjectName: 'English Communication',
    combos: ['LANG_COM1'],
    prerequisites: ['ENG101'],
    status: 'active',
  },
];



const pageSize = 5;

const SubjectPage: React.FC = () => {
  const [subjects, setSubjects] = useState<ISubject[]>(initialSubjects);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Filtered data
  const filtered = subjects.filter(s =>
    s.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
    s.subjectName.toLowerCase().includes(search.toLowerCase())
  );
  
  // Pagination
  const pagedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Table columns
  const columns = [
    {
      title: 'Subject Code',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      width: 120,
      align: 'center' as const,
    },
    {
      title: 'Subject Name',
      dataIndex: 'subjectName',
      key: 'subjectName',
      width: 300,
      align: 'left' as const,
    },
    {
      title: 'Combos',
      dataIndex: 'combos',
      key: 'combos',
      width: 200,
      align: 'center' as const,
      render: (combos: string[]) => combos?.join(', ') || '-',
    },
    {
      title: 'Prerequisites',
      dataIndex: 'prerequisites',
      key: 'prerequisites',
      width: 200,
      align: 'center' as const,
      render: (prerequisites: string[]) => prerequisites?.join(', ') || '-',
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
      title: 'View',
      key: 'view',
      dataIndex: 'view',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => navigate(`/manager/subject/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  // CRUD handlers
  const onAdd = () => {
    navigate('/manager/subject/add');
  };

  const onEdit = (record: any) => {
    navigate(`/manager/subject/edit/${record.id}`);
  };

  const onDelete = (id: number) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    message.success('Deleted subject!');
  };

  return (
    <div className="p-6 mx-auto">
      <div className="bg-white rounded-t-xl border border-b-0 border-gray-200 shadow-md p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={v => { setSearch(v); setCurrentPage(1); }}
              placeholder="Search by subject code or name..."
              className="w-full"
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} className="sm:ml-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              Add Subject
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

export default SubjectPage; 