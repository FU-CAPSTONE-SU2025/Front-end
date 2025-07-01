import React, { useState, useCallback } from 'react';
import { Button, Tooltip, Collapse, Input, message } from 'antd';
import { motion } from 'framer-motion';
import { InfoCircleOutlined, CheckCircleTwoTone, CloseCircleTwoTone, SyncOutlined, DragOutlined, EditOutlined, DeleteOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ReactFlow, { Background, Controls, MiniMap, Handle, Position, useNodesState, useEdgesState, addEdge, Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams } from 'react-router';

const { Panel } = Collapse;

const initialNodes = [
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
];

const initialEdges = [
  { id: 'e1', source: 'root', target: 'internet', animated: true },
  { id: 'e2', source: 'internet', target: 'learn-basic' },
  { id: 'e3', source: 'internet', target: 'semantic-html' },
  { id: 'e4', source: 'internet', target: 'forms' },
  { id: 'e5', source: 'internet', target: 'accessibility' },
  { id: 'e6', source: 'internet', target: 'seo-basics' },
  { id: 'root-html', source: 'html', target: 'css' },
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

const CustomNode = ({ id, data, selected, isConnectable, type, onEdit, onDelete, editingId, onEditChange, onEditSave, onEditCancel }: any) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={`relative group ${type === 'main' ? 'bg-gradient-to-r from-orange-200 to-yellow-100 border-2 border-orange-400' : 'bg-white/80 border border-orange-200'} rounded-2xl px-10 py-3 font-bold text-lg shadow-xl flex items-center gap-2`}
      animate={selected ? { scale: 1.08, boxShadow: '0 0 32px #ff9800aa' } : { scale: 1, boxShadow: '0 2px 12px #ff980055' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <DragOutlined className={`text-orange-400 text-xl absolute left-2 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none`} />
      {editingId === id ? (
        <div className="flex items-center gap-2 w-full">
          <Input
            size="small"
            value={data.label}
            onChange={e => onEditChange(id, e.target.value)}
            onPressEnter={() => onEditSave(id)}
            onBlur={() => onEditCancel()}
            autoFocus
            className="rounded px-2 py-1 text-base"
            style={{ minWidth: 80, maxWidth: 180 }}
          />
          <Button icon={<CheckOutlined />} size="small" type="primary" onClick={() => onEditSave(id)} />
          <Button icon={<CloseOutlined />} size="small" onClick={() => onEditCancel()} />
        </div>
      ) : (
        <>
          <span className="pl-6 pr-2 select-none whitespace-nowrap">{data.label}</span>
          {hovered && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 z-10">
              <Tooltip title="Edit"><Button icon={<EditOutlined />} size="small" onClick={() => onEdit(id)} /></Tooltip>
              <Tooltip title="Delete"><Button icon={<DeleteOutlined />} size="small" danger onClick={() => onDelete(id)} /></Tooltip>
            </div>
          )}
        </>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
    </motion.div>
  );
};

const nodeTypes = {
  main: (props: any) => <CustomNode {...props} type="main" />,
  default: (props: any) => <CustomNode {...props} type="default" />,
};

const SemesterPlannerDetail = () => {
  const { roadmap } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Thêm node mới
  const handleAddNode = () => {
    const newId = `node-${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      {
        id: newId,
        data: { label: 'New Node' },
        position: { x: 400, y: 400 },
        draggable: true,
      },
    ]);
    message.success('Đã thêm node mới!');
  };

  // Xóa node và các edge liên quan
  const handleDeleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    message.success('Đã xóa node!');
  };

  // Sửa label node
  const handleEditNode = (id: string) => setEditingId(id);
  const handleEditChange = (id: string, value: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label: value } } : n));
  };
  const handleEditSave = (id: string) => {
    setEditingId(null);
    message.success('Đã cập nhật tên node!');
  };
  const handleEditCancel = () => setEditingId(null);

  // Custom nodeTypes truyền props edit/xóa/sửa
  const customNodeTypes = {
    main: (props: any) => <CustomNode {...props} editingId={editingId} onEdit={handleEditNode} onDelete={handleDeleteNode} onEditChange={handleEditChange} onEditSave={handleEditSave} onEditCancel={handleEditCancel} />,
    default: (props: any) => <CustomNode {...props} editingId={editingId} onEdit={handleEditNode} onDelete={handleDeleteNode} onEditChange={handleEditChange} onEditSave={handleEditSave} onEditCancel={handleEditCancel} />,
  };

  // Thêm edge khi kéo nối
  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-orange-500 to-blue-900 items-center py-6">
      <motion.div
        className="w-full bg-white/20 border border-white/30 rounded-2xl p-8 mb-8 shadow-2xl backdrop-blur-lg"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          <div>
            <div className="text-xs text-white/80 font-semibold tracking-wider mb-1">SUMMER SEMESTER 27/05/2025 - 15/09/2025</div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">{roadmap ? decodeURIComponent(roadmap) : 'Backend Developer'}</div>
            <div className="text-white/90 text-base mb-2">Step by step guide to becoming a modern {roadmap ? decodeURIComponent(roadmap) : 'frontend'} developer in 2025</div>
            <Button type="link" className="text-orange-300 px-0">Roadmap</Button>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Button type="default" className="border-white/60 text-white bg-white/10 hover:bg-white/20 transition-all mb-2">Change Roadmap</Button>
            <Button type="primary" className="bg-orange-500 border-none font-semibold shadow hover:bg-orange-600">AI Academic Evaluation</Button>
          </div>
        </div>
        <Collapse ghost className="mt-4 bg-transparent">
          <Panel
            header={<span className="text-white text-base flex items-center gap-2"><InfoCircleOutlined /> What is {roadmap ? decodeURIComponent(roadmap) : 'Backend Developer'}?</span>}
            key="1"
            className="bg-white/10 border-none text-white"
            showArrow={false}
          >
            <div className="text-white/90">{roadmap ? decodeURIComponent(roadmap) : 'Backend Developer'} là người xây dựng và duy trì logic, database, server, API cho ứng dụng web hoặc mobile.</div>
          </Panel>
        </Collapse>
      </motion.div>
      <div className="w-full flex flex-row items-center gap-4 mb-4 px-2">
        <DragOutlined className="text-orange-300 text-xl" />
        <span className="text-white/80 text-sm">Bạn có thể kéo thả, thêm, sửa, xóa các node trong sơ đồ bên dưới để tự do sắp xếp lộ trình học!</span>
        <Button icon={<PlusOutlined />} type="primary" className="ml-auto bg-gradient-to-r from-orange-400 to-blue-500 border-none font-semibold shadow" onClick={handleAddNode}>Thêm Node</Button>
      </div>
      <div className="w-full flex flex-row flex-wrap gap-3 mb-4">
        {courseStatus.map((c) => (
          <div key={c.name} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg shadow border border-white/30">
            {statusIcon(c.status)}
            <span className="text-white font-medium">{c.name}</span>
          </div>
        ))}
      </div>
      <div className="w-full h-[700px] bg-white/20 rounded-2xl border border-white/20 shadow-2xl overflow-hidden backdrop-blur-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={customNodeTypes}
          fitView
          panOnScroll
          zoomOnScroll
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelected(node.id)}
          onConnect={onConnect}
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
