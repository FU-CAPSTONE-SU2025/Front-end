import React from 'react';
import { Button, Tooltip, Collapse } from 'antd';
import { motion } from 'framer-motion';
import { InfoCircleOutlined, CheckCircleTwoTone, CloseCircleTwoTone, SyncOutlined } from '@ant-design/icons';
import ReactFlow, { Background, Controls, MiniMap, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';

const { Panel } = Collapse;

// Node data for the roadmap (draggable enabled)
const nodes = [
  { id: 'root', data: { label: 'Back-end' }, position: { x: 500, y: 0 }, type: 'main', draggable: true },
  { id: 'internet', data: { label: 'Internet' }, position: { x: 500, y: 100 }, draggable: true },
  { id: 'learn-basic', data: { label: 'Learn Basic' }, position: { x: 900, y: 60 }, draggable: true },
  { id: 'semantic-html', data: { label: 'Writing Semantic HTML' }, position: { x: 900, y: 120 }, draggable: true },
  { id: 'forms', data: { label: 'Forms and Validations' }, position: { x: 900, y: 180 }, draggable: true },
  { id: 'accessibility', data: { label: 'Accessibility' }, position: { x: 900, y: 240 }, draggable: true },
  { id: 'seo-basics', data: { label: 'SEO Basics' }, position: { x: 900, y: 300 }, draggable: true },
  { id: 'html', data: { label: 'HTML' }, position: { x: 100, y: 200 }, draggable: true },
  { id: 'css', data: { label: 'CSS' }, position: { x: 300, y: 200 }, draggable: true },
  { id: 'github', data: { label: 'Github' }, position: { x: 1200, y: 200 }, draggable: true },
  // ... add more nodes as needed
];

const edges = [
  { id: 'e1', source: 'root', target: 'internet', animated: true },
  { id: 'e2', source: 'internet', target: 'learn-basic' },
  { id: 'e3', source: 'internet', target: 'semantic-html' },
  { id: 'e4', source: 'internet', target: 'forms' },
  { id: 'e5', source: 'internet', target: 'accessibility' },
  { id: 'e6', source: 'internet', target: 'seo-basics' },
  { id: 'root-html', source: 'html', target: 'css' },
  // ... add more edges as needed
];

const courseStatus = [
  { name: 'PRN212', status: 'done' },
  { name: 'CS102', status: 'done' },
  { name: 'PRN231', status: 'done' },
  { name: 'Accessibility', status: 'fail' },
  { name: 'SEO Basics', status: 'fail' },
];

const statusIcon = (status: string) => {
  if (status === 'done') return <CheckCircleTwoTone twoToneColor="#52c41a" className="text-xl" />;
  if (status === 'fail') return <CloseCircleTwoTone twoToneColor="#ff4d4f" className="text-xl" />;
  return <SyncOutlined spin className="text-xl text-yellow-500" />;
};

const nodeTypes = {
  main: ({ data }: any) => (
    <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl px-8 py-2 font-bold text-lg shadow-md">
      {data.label}
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </div>
  ),
  default: ({ data }: any) => (
    <div className="bg-yellow-100 border border-yellow-400 rounded-xl px-6 py-2 text-base shadow">
      {data.label}
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </div>
  ),
};

const SemesterPlannerDetail = () => {
  return (
    <div className="min-h-screen mt-120 bg-gradient-to-br from-orange-500 to-blue-900 flex flex-col items-center py-6 px-2">
      {/* Top Info Card */}
      <motion.div
        className="w-full max-w-5xl bg-white/10 border border-white/30 rounded-2xl p-6 mb-6 shadow-lg"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs text-white/80 font-semibold tracking-wider mb-1">SUMMER SEMESTER 27/05/2025 - 15/09/2025</div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">Backend Developer</div>
            <div className="text-white/90 text-base mb-2">Step by step guide to becoming a modern frontend developer in 2025</div>
            <Button type="link" className="text-orange-300 px-0">Roadmap</Button>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Button type="default" className="border-white/60 text-white bg-white/10 hover:bg-white/20 transition-all mb-2">Change Roadmap</Button>
            <Button type="primary" className="bg-orange-500 border-none font-semibold shadow hover:bg-orange-600">AI Academic Evaluation</Button>
          </div>
        </div>
        <Collapse ghost className="mt-4 bg-transparent">
          <Panel
            header={<span className="text-white text-base flex items-center gap-2"><InfoCircleOutlined /> What is Backend Developer?</span>}
            key="1"
            className="bg-white/10 border-none text-white"
            showArrow={false}
          >
            <div className="text-white/90">Backend Developer là người xây dựng và duy trì logic, database, server, API cho ứng dụng web hoặc mobile.</div>
          </Panel>
        </Collapse>
      </motion.div>

      {/* Course Status */}
      <div className="w-full max-w-5xl flex flex-row flex-wrap gap-3 mb-4">
        {courseStatus.map((c) => (
          <div key={c.name} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg shadow border border-white/30">
            {statusIcon(c.status)}
            <span className="text-white font-medium">{c.name}</span>
          </div>
        ))}
      </div>

      {/* React Flow Roadmap */}
      <div className="w-full max-w-6xl h-[700px] bg-white/10 rounded-2xl border border-white/20 shadow-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          panOnScroll
          zoomOnScroll
        >
          <Background color="#facc15" gap={32} />
          <MiniMap nodeColor={() => '#fde68a'} maskColor="#fff0" />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default SemesterPlannerDetail;
