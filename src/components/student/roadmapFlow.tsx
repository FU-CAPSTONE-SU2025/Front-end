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
import NodeDetailsDrawer from './nodeDetailsDrawer';
import LinkConfirmationModal from './linkConfirmationModal';
import DeleteLinkConfirmationModal from './deleteLinkConfirmationModal';

interface RoadmapFlowProps {
  roadmap: {
    nodes: IRoadmapNode[];
    links: any[];
  };
  onLinkCreate?: (fromNodeId: number, toNodeId: number) => void;
  onLinkDelete?: (linkId: number) => void;
  onNodeDeleted?: () => void; // Callback khi node bị xóa
}

// Custom Node Component for Subject Cards - Move outside to avoid re-creation
const SubjectNode = ({ data, id, onNodeDeleted }: { data: IRoadmapNode; id: string; onNodeDeleted?: () => void }) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const handleNodeClick = () => {
    console.log('Node clicked:', id); // Debug log
    setIsDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
  };

  return (
    <>
      <div 
        className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-xl p-4 shadow-lg min-w-[280px] cursor-pointer hover:bg-white/15 transition-all duration-200"
        onClick={handleNodeClick}
      >
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

      {/* Node Details Drawer */}
      <NodeDetailsDrawer
        isVisible={isDrawerVisible}
        onClose={handleDrawerClose}
        nodeId={id}
        onNodeDeleted={() => {
          // Trigger roadmap refresh instead of page reload
          if (onNodeDeleted) {
            onNodeDeleted();
          }
        }}
        onNodeUpdated={() => {
          // Trigger roadmap refresh when node is updated
          if (onNodeDeleted) {
            onNodeDeleted();
          }
        }}
      />
    </>
  );
};

const RoadmapFlowInner: React.FC<RoadmapFlowProps> = ({ roadmap, onLinkCreate, onLinkDelete, onNodeDeleted }) => {
  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [isDeleteLinkModalVisible, setIsDeleteLinkModalVisible] = useState(false);
  const [pendingDeleteLink, setPendingDeleteLink] = useState<Edge | null>(null);

  // Node types configuration - Pass onNodeDeleted to SubjectNode
  const nodeTypes: NodeTypes = useMemo(() => ({
    subject: (props: any) => <SubjectNode {...props} onNodeDeleted={onNodeDeleted} />,
  }), [onNodeDeleted]);

  // Transform roadmap data to React Flow format
  const { nodes, edges } = useMemo(() => {
    console.log('RoadmapFlow: Recalculating nodes and edges', {
      nodesCount: roadmap?.nodes?.length || 0,
      linksCount: roadmap?.links?.length || 0
    });
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
  }, [roadmap.nodes, roadmap.links]); // Add explicit dependencies

  // React Flow state
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Update flow data when roadmap changes
  React.useEffect(() => {
    console.log('RoadmapFlow: Updating nodes', nodes.length);
    setFlowNodes(nodes);
  }, [nodes, setFlowNodes]);

  React.useEffect(() => {
    console.log('RoadmapFlow: Updating edges', edges.length);
    setFlowEdges(edges);
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
      
      // Call the parent callback to create the link
      onLinkCreate(fromNodeId, toNodeId);
      
      // Note: We can't immediately add the edge here because we don't have the link ID yet
      // The edge will be added when the roadmap prop updates
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
        // Call the parent callback to delete the link
        onLinkDelete(linkId);
        
        // Immediately remove the edge from local state for better UX
        const updatedEdges = flowEdges.filter(edge => edge.data?.linkId !== linkId);
        setFlowEdges(updatedEdges);
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
      <LinkConfirmationModal
        isVisible={isLinkModalVisible}
        onCancel={handleLinkCancel}
        onConfirm={handleLinkConfirm}
        fromName={fromName}
        toName={toName}
      />

      {/* Delete Link Confirmation Modal */}
      <DeleteLinkConfirmationModal
        isVisible={isDeleteLinkModalVisible}
        onCancel={handleDeleteLinkCancel}
        onConfirm={handleDeleteLinkConfirm}
        fromName={deleteFromName}
        toName={deleteToName}
      />
    </>
  );
};

const RoadmapFlow: React.FC<RoadmapFlowProps> = (props) => {
  // Force re-render when roadmap data changes by using a key
  const roadmapKey = `${props.roadmap?.id || 'no-id'}-${props.roadmap?.nodes?.length || 0}-${props.roadmap?.links?.length || 0}`;
  
  return (
    <ReactFlowProvider>
      <RoadmapFlowInner key={roadmapKey} {...props} />
    </ReactFlowProvider>
  );
};

export default RoadmapFlow;
