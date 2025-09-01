import React, { useMemo, useCallback, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Handle, 
  Position, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Node, 
  Edge, 
  Connection,
  NodeTypes,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, Tag, Modal, Button } from 'antd';
import { IRoadmapNode } from '../../interfaces/IRoadMap';

// Custom Node Component for Subject Cards
const SubjectNode = ({ data }: { data: IRoadmapNode }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-xl p-4 shadow-lg min-w-[280px]">
      <div className="space-y-3">
        {/* Subject Code */}
        <div className="flex items-center justify-between">
          <Tag color="orange" className="font-semibold">
            {data.subjectCode}
          </Tag>
          <span className="text-xs text-white/60">Semester {data.semesterNumber}</span>
        </div>
        
        {/* Subject Name */}
        <h4 className="font-semibold text-white text-base leading-tight">
          {data.subjectName}
        </h4>
        
        {/* Description */}
        <p className="text-white/80 text-sm leading-relaxed">
          {data.description}
        </p>
        
        {/* Prerequisites */}
        {data.prerequisiteIds.length > 0 && (
          <div className="text-xs text-white/60">
            Prerequisites: {data.prerequisiteIds.join(', ')}
          </div>
        )}
      </div>
      
      {/* React Flow Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-400" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-400" />
    </div>
  );
};

// Node types configuration
const nodeTypes: NodeTypes = {
  subject: SubjectNode,
};

interface RoadmapFlowProps {
  roadmap: {
    nodes: IRoadmapNode[];
    links: any[];
  };
  onLinkCreate?: (fromNodeId: number, toNodeId: number) => void;
  onLinkDelete?: (linkId: number) => void;
}

const RoadmapFlowInner: React.FC<RoadmapFlowProps> = ({ roadmap, onLinkCreate, onLinkDelete }) => {
  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [isDeleteLinkModalVisible, setIsDeleteLinkModalVisible] = useState(false);
  const [pendingDeleteLink, setPendingDeleteLink] = useState<Edge | null>(null);

  // Transform roadmap data to React Flow format
  const { nodes, edges } = useMemo(() => {
    if (!roadmap) return { nodes: [], edges: [] };

    // Sort all nodes by ID to ensure consistent ordering
    const sortedNodes = [...roadmap.nodes].sort((a, b) => a.id - b.id);

    // Calculate optimal layout to prevent edge overlaps
    const nodeWidth = 320;
    const nodeHeight = 200;
    const horizontalSpacing = 500; // Increased spacing between columns
    const verticalSpacing = 350;   // Increased spacing between rows
    
    // Create nodes with better spacing to prevent overlaps
    const flowNodes: Node[] = sortedNodes.map((node, index) => {
      const row = Math.floor(index / 2); // 2 nodes per row
      const col = index % 2; // 2 columns
      
      return {
        id: node.id.toString(),
        type: 'subject',
        position: { 
          x: col * horizontalSpacing + 150, // Better horizontal distribution
          y: row * verticalSpacing + 150    // Better vertical distribution
        },
        data: node,
        draggable: true,
      };
    });

    // Create edges from outgoingLinks with better routing
    const flowEdges: Edge[] = roadmap.nodes.flatMap(node => 
      node.outgoingLinks.map(link => ({
        id: link.id.toString(),
        source: link.fromNodeId.toString(),
        target: link.toNodeId.toString(),
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#f97316', strokeWidth: 2 }, // Orange color
        // Fix TypeScript error by using proper marker type
        markerEnd: {
          type: 'arrowclosed' as any, // Use arrowclosed for better visibility
          width: 20,
          height: 20,
          color: '#f97316',
        },
        // Add edge routing to avoid node overlaps
        sourceHandle: 'source',
        targetHandle: 'target',
        // Add data for deletion
        data: { linkId: link.id },
      }))
    );

    return { nodes: flowNodes, edges: flowEdges };
  }, [roadmap]);

  // React Flow state
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Update flow data when roadmap changes
  React.useEffect(() => {
    if (nodes.length > 0) {
      setFlowNodes(nodes);
    }
  }, [nodes, setFlowNodes]);

  React.useEffect(() => {
    if (edges.length > 0) {
      setFlowEdges(edges);
    }
  }, [edges, setFlowEdges]);

  // Handle connections
  const onConnect = useCallback((params: Connection) => {
    // Store the pending connection and show confirmation modal
    setPendingConnection(params);
    setIsLinkModalVisible(true);
  }, []);

  // Handle edge click for deletion
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setPendingDeleteLink(edge);
    setIsDeleteLinkModalVisible(true);
  }, []);

  const handleLinkConfirm = () => {
    if (pendingConnection && onLinkCreate) {
      const fromNodeId = parseInt(pendingConnection.source!);
      const toNodeId = parseInt(pendingConnection.target!);
      onLinkCreate(fromNodeId, toNodeId);
    }
    setIsLinkModalVisible(false);
    setPendingConnection(null);
  };

  const handleLinkCancel = () => {
    setIsLinkModalVisible(false);
    setPendingConnection(null);
  };

  const handleDeleteLinkConfirm = () => {
    if (pendingDeleteLink && onLinkDelete) {
      const linkId = pendingDeleteLink.data?.linkId;
      if (linkId) {
        onLinkDelete(linkId);
      }
    }
    setIsDeleteLinkModalVisible(false);
    setPendingDeleteLink(null);
  };

  const handleDeleteLinkCancel = () => {
    setIsDeleteLinkModalVisible(false);
    setPendingDeleteLink(null);
  };

  // Get node names for the confirmation modal
  const getNodeNames = () => {
    if (!pendingConnection) return { fromName: '', toName: '' };
    
    const fromNode = roadmap.nodes.find(node => node.id.toString() === pendingConnection.source);
    const toNode = roadmap.nodes.find(node => node.id.toString() === pendingConnection.target);
    
    return {
      fromName: fromNode?.subjectName || 'Unknown',
      toName: toNode?.subjectName || 'Unknown'
    };
  };

  // Get node names for the delete link modal
  const getDeleteLinkNodeNames = () => {
    if (!pendingDeleteLink) return { fromName: '', toName: '' };
    
    const fromNode = roadmap.nodes.find(node => node.id.toString() === pendingDeleteLink.source);
    const toNode = roadmap.nodes.find(node => node.id.toString() === pendingDeleteLink.target);
    
    return {
      fromName: fromNode?.subjectName || 'Unknown',
      toName: toNode?.subjectName || 'Unknown'
    };
  };

  const { fromName, toName } = getNodeNames();
  const { fromName: deleteFromName, toName: deleteToName } = getDeleteLinkNodeNames();

  return (
    <>
      <div className="h-[800px] w-full relative">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          fitView
          panOnScroll
          zoomOnScroll
          className="bg-transparent"
          // Add edge routing options to prevent overlaps
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#f97316', strokeWidth: 2 },
          }}
        >
          <Background color="#f97316" gap={32} />
          <MiniMap 
            nodeColor={() => '#f97316'} 
            maskColor="#fff0"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            position="bottom-left"
          />
          <Controls 
            position="top-right"
            className="!bg-white/90 !backdrop-blur-md !rounded-lg !shadow-lg !border !border-white/20"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />
        </ReactFlow>
      </div>

      {/* Link Confirmation Modal */}
      <Modal
        title="Confirm Connection"
        open={isLinkModalVisible}
        onCancel={handleLinkCancel}
        footer={[
          <Button key="cancel" onClick={handleLinkCancel}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" onClick={handleLinkConfirm} className="bg-orange-500 border-none hover:bg-orange-600">
            Confirm Connection
          </Button>,
        ]}
        className="bg-white/95 backdrop-blur-lg"
      >
        <div className="py-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to create a connection between these subjects?
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-700">From:</span>
              <span className="text-gray-600">{fromName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">To:</span>
              <span className="text-gray-600">{toName}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            This will establish a prerequisite relationship between the subjects.
          </p>
        </div>
      </Modal>

      {/* Delete Link Confirmation Modal */}
      <Modal
        title="Delete Connection"
        open={isDeleteLinkModalVisible}
        onCancel={handleDeleteLinkCancel}
        footer={[
          <Button key="cancel" onClick={handleDeleteLinkCancel}>
            Cancel
          </Button>,
          <Button key="confirm" danger type="primary" onClick={handleDeleteLinkConfirm}>
            Delete Connection
          </Button>,
        ]}
        className="bg-white/95 backdrop-blur-lg"
      >
        <div className="py-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete the connection between these subjects?
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-700">From:</span>
              <span className="text-gray-600">{deleteFromName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">To:</span>
              <span className="text-gray-600">{deleteToName}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            This will remove the prerequisite relationship between the subjects.
          </p>
        </div>
      </Modal>
    </>
  );
};

const RoadmapFlow: React.FC<RoadmapFlowProps> = (props) => {
  return (
    <ReactFlowProvider>
      <RoadmapFlowInner {...props} />
    </ReactFlowProvider>
  );
};

export default RoadmapFlow;
