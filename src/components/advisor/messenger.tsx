import React, { useState } from 'react';
import { Avatar, Button, Drawer, Tabs, Input, Badge } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import ReactDOM from 'react-dom';
import AdvisorChatBox from './advisorChatBox';

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: string;
  unreadCount?: number;
}

const Messenger: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [studentChatBoxOpen, setStudentChatBoxOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('students');

  // Mock students data
  const students: Student[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@student.com',
      role: 'Computer Science',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      isOnline: true,
      unreadCount: 2
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@student.com',
      role: 'Information Technology',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
      isOnline: false,
      lastSeen: '2 hours ago',
      unreadCount: 0
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.brown@student.com',
      role: 'Software Engineering',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
      isOnline: true,
      unreadCount: 1
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@student.com',
      role: 'Data Science',
      avatarUrl: 'https://i.pravatar.cc/150?img=4',
      isOnline: false,
      lastSeen: '1 day ago',
      unreadCount: 0
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'david.wilson@student.com',
      role: 'Computer Science',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      isOnline: true,
      unreadCount: 3
    },
    {
      id: '6',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@student.com',
      role: 'Information Technology',
      avatarUrl: 'https://i.pravatar.cc/150?img=6',
      isOnline: false,
      lastSeen: '30 minutes ago',
      unreadCount: 0
    }
  ];

  // Filter students based on search term
  const filteredStudents = students.filter((student: Student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render AdvisorChatBox outside root
  const advisorChatBoxPortal = studentChatBoxOpen && selectedStudent
    ? ReactDOM.createPortal(
        <AdvisorChatBox 
          onClose={() => {
            setStudentChatBoxOpen(false);
            setSelectedStudent(null);
          }} 
          selectedStudent={selectedStudent} 
        />,
        document.body
      )
    : null;

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setStudentChatBoxOpen(true);
    setOpen(false);
  };

  const items = [
    {
      key: 'students',
      label: (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Students</span>
          <Badge count={students.filter((s: Student) => s.isOnline).length} size="small" />
        </div>
      ),
      children: (
        <div className="flex flex-col h-full bg-gray-50">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <Input
              placeholder="Search students..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-full"
            />
          </div>
          
          {/* Students List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredStudents.map((student: Student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 cursor-pointer`}
                  onClick={() => handleStudentClick(student)}
                >
                  <div className="relative">
                    <Avatar src={student.avatarUrl} size={40} />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      student.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">{student.name}</span>
                      <span className={`text-xs ml-2 ${
                        student.isOnline ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {student.isOnline ? 'Online' : student.lastSeen}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{student.role}</div>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredStudents.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No students found
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Button
        icon={<MessageOutlined className="text-lg" />}
        shape="circle"
        onClick={() => setOpen(true)}
        className="relative"
      />
      <Drawer
        title={<div className="font-bold text-gray-800">Messages</div>}
        placement="right"
        width={400}
        onClose={() => setOpen(false)}
        open={open}
        styles={{ body: { padding: 0 }, header: { borderBottom: '1px solid #e5e7eb' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          className="h-full"
          tabBarStyle={{ margin: 0, padding: '0 16px' }}
        />
      </Drawer>
      {advisorChatBoxPortal}
    </>
  );
};

export default Messenger; 