import React from 'react';
import { Modal, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { CloseOutlined, DownloadOutlined, BookOutlined, BulbOutlined, TeamOutlined, CodeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

// --- DUMMY DATA ---
const dummySubject = {
  code: 'PRN 212',
  name: 'Basis Cross-Platform Application Programming With .NET',
  credit: 3,
  timeAllocation: 'Study hour (150h) = 49.5h contact hours + 1h final exam + 85 practical exam + 99.5h self-study',
  preRequisite: ['PRO192', 'DBI202'],
  details: {
    description: 'This course provides students with the fundamental knowledge of Cross-Platform Application Development using .NET Technology. Students will be able to develop desktop applications, and console applications, and understand the core concepts of building robust software.',
    objectives: [
      {
        id: 1,
        icon: <CodeOutlined />,
        main: 'Understand the followings:',
        sub: [
          'C# language for developing .NET applications;',
          'Fundamental concepts of .NET Platform',
          'Basic knowledge of Windows Presentation Foundation in .NET',
        ],
      },
      {
        id: 2,
        icon: <BookOutlined />,
        main: 'Be able to:',
        sub: ['Develop Cross-platform Desktop applications and support for user experience ( UI & UX )'],
      },
      {
        id: 3,
        icon: <TeamOutlined />,
        main: "Be able to work in a team and present group's results",
        sub: [],
      },
    ],
  },
  tips: 'To succeed in this course, practice coding daily. Focus on understanding the core concepts rather than memorizing syntax. Collaborate with peers on small projects to enhance your teamwork and problem-solving skills.',
};

// --- VARIANTS FOR ANIMATION ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// --- TAB CONTENT COMPONENTS ---
const DetailTab = ({ subject }: { subject: any }) => (
  <motion.div variants={itemVariants} className="space-y-6">
    {subject?.details?.description && (
      <div className="p-5 bg-black/20 rounded-xl border border-white/10">
        <h4 className="font-semibold text-lg mb-2 text-orange-400">Course Description</h4>
        <p className="text-gray-300">{subject.details.description}</p>
      </div>
    )}
    {subject?.details?.objectives && (
      <div className="p-5 bg-black/20 rounded-xl border border-white/10">
        <h4 className="font-semibold text-lg mb-4 text-orange-400">Learning Objectives</h4>
        <div className="space-y-5">
          {subject.details.objectives.map((obj: any) => (
            <div key={obj.id} className="flex items-start gap-4">
              <div className="bg-orange-900/50 border border-orange-500/30 text-orange-400 rounded-lg p-2 text-2xl">
                {obj.icon || <BookOutlined />}
              </div>
              <div>
                <p className="font-semibold text-base text-white">{obj.main}</p>
                {obj.sub?.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {obj.sub.map((s: string, sIndex: number) => (
                      <li key={sIndex} className="flex items-start gap-2 text-gray-400">
                        <CheckCircleOutlined className="text-orange-400 mt-1 text-sm" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

const TipsTab = ({ subject }: { subject: any }) => (
  <motion.div variants={itemVariants} className="border-l-4 border-orange-500 bg-orange-500/10 p-5 rounded-r-lg">
    <div className="flex items-start gap-4">
      <div className="text-orange-400 text-2xl mt-1">
        <BulbOutlined />
      </div>
      <div>
        <h4 className="font-semibold text-lg mb-1 text-orange-400">Tips for Success</h4>
        <p className="text-gray-300">{subject?.tips || 'No tips available for this course.'}</p>
      </div>
    </div>
  </motion.div>
);

// --- MODAL COMPONENT ---
interface SubjectDetailModalProps {
  visible: boolean;
  onClose: () => void;
  subject: any;
}

const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({ visible, onClose, subject }) => {
  const subjectData = subject || dummySubject;

  const tabItems: TabsProps['items'] = [
    { key: '1', label: 'Details', children: <DetailTab subject={subjectData} /> },
    { key: '2', label: 'Tips', children: <TipsTab subject={subjectData} /> },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <Modal
          open={visible}
          onCancel={onClose}
          footer={null}
          closeIcon={null}
          width={800}
          centered
          styles={{
            mask: { backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.6)' },
            content: { background: 'transparent', padding: 0, boxShadow: 'none' },
          }}
          destroyOnHidden
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-900/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl shadow-black/30 text-white overflow-hidden"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="p-6 border-b border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-extrabold text-orange-400 tracking-tight">{subjectData.code}</h1>
                  <h2 className="text-lg text-white/90 mt-1 max-w-lg">{subjectData.name}</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <CloseOutlined className="text-white/70 text-lg" />
                </button>
              </div>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="p-3 bg-black/20 rounded-lg border border-white/10">
                  <dt className="text-gray-400 font-semibold">Credit</dt>
                  <dd className="text-white/90 font-bold text-base">{subjectData?.credit || 'N/A'}</dd>
                </div>
                <div className="p-3 bg-black/20 rounded-lg border border-white/10">
                  <dt className="text-gray-400 font-semibold">Pre-Requisite(s)</dt>
                  <dd className="flex items-center gap-2 flex-wrap mt-1">
                    {subjectData?.preRequisite?.length > 0 ? subjectData.preRequisite.map((req: string) => (
                      <span key={req} className="bg-orange-500/20 text-orange-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {req}
                      </span>
                    )) : <span className="text-gray-500">None</span>}
                  </dd>
                </div>
                <div className="md:col-span-2 p-3 bg-black/20 rounded-lg border border-white/10">
                  <dt className="text-gray-400 font-semibold">Time Allocation</dt>
                  <dd className="text-gray-300 text-xs mt-1">{subjectData?.timeAllocation || 'Not specified'}</dd>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div variants={itemVariants} className="p-6">
              <Tabs
                defaultActiveKey="1"
                items={tabItems}
                className="[&_.ant-tabs-nav]:before:border-white/10 [&_.ant-tabs-tab]:!text-gray-300 [&_.ant-tabs-tab]:text-base [&_.ant-tabs-tab-active]:!text-orange-400 [&_.ant-tabs-ink-bar]:!bg-orange-400 [&_.ant-tabs-tab]:hover:!text-orange-300 [&_.ant-tabs-tab-btn]:!text-gray-300 [&_.ant-tabs-tab-btn]:hover:!text-orange-300 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-orange-400"
              />
            </motion.div>

            {/* Footer */}
            <motion.div variants={itemVariants} className="p-4 bg-black/30 border-t border-white/10 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-white font-bold px-4 py-2 rounded-lg shadow-lg shadow-orange-500/20"
              >
                <DownloadOutlined />
                Download All Student Material
              </motion.button>
            </motion.div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default SubjectDetailModal; 