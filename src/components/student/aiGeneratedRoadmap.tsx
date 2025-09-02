import React, { useState, useMemo, useCallback, memo, useRef } from 'react';
import { Button, Input, Tag, Modal, Tabs, Spin } from 'antd';
import { SendOutlined, SaveOutlined, EditOutlined, DeleteOutlined, LinkOutlined, LeftOutlined, DownOutlined } from '@ant-design/icons';
import { IAIGeneratedNode, IAIGeneratedLink, ICreateRoadmapNodeRequest } from '../../interfaces/IRoadMap';
import { useRoadmap } from '../../hooks/useRoadmap';

interface AIGeneratedRoadmapProps {
  onSaveNodes: (nodes: ICreateRoadmapNodeRequest[]) => Promise<boolean>;
  onSaveLinks: (links: IAIGeneratedLink[]) => Promise<boolean>;
  roadmapId: number;
  isLoading?: boolean;
}

const AIGeneratedRoadmap: React.FC<AIGeneratedRoadmapProps> = ({ 
  onSaveNodes, 
  onSaveLinks, 
  roadmapId, 
  isLoading = false 
}) => {
  // AI Generated Nodes State
  const [studentMessage, setStudentMessage] = useState('');
  const [generatedNodes, setGeneratedNodes] = useState<IAIGeneratedNode[]>([]);
  const [editingNodeIndex, setEditingNodeIndex] = useState<number | null>(null);
  const [editingNodeData, setEditingNodeData] = useState<IAIGeneratedNode | null>(null);
  
  // AI Generated Links State
  const [generatedLinks, setGeneratedLinks] = useState<IAIGeneratedLink[]>([]);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [editingLinkData, setEditingLinkData] = useState<IAIGeneratedLink | null>(null);
  
  // Local saving states to prevent double submits
  const [isSavingNodes, setIsSavingNodes] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState<'nodes' | 'links'>('nodes');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isCollapsedRef = useRef(true);
  const [hasRequestedNodes, setHasRequestedNodes] = useState(false);
  const [nodesError, setNodesError] = useState<string | null>(null);
  
  const { getAIGeneratedNodes, getAIGeneratedLinks } = useRoadmap();
  const [isGeneratingNodes, setIsGeneratingNodes] = useState(false);
  const [isGeneratingLinks, setIsGeneratingLinks] = useState(false);

  // ===== AI GENERATED NODES FUNCTIONS =====
  const handleGenerateNodes = async (messageOverride?: string) => {
    if (isCollapsedRef.current) return;
    const source = messageOverride ?? studentMessage;
    const trimmed = (source || '').trim();
    if (!trimmed || isGeneratingNodes) {
      return;
    }

    try {
      // Reset UI before new request
      setNodesError(null);
      setHasRequestedNodes(true);
      setGeneratedNodes([]);
      setIsGeneratingNodes(true);
      const nodes = await getAIGeneratedNodes(trimmed);
      if (!isCollapsedRef.current) {
        setGeneratedNodes(Array.isArray(nodes) ? nodes : []);
      }
    } catch (error: any) {
      console.error('Error generating nodes:', error);
      setNodesError(error?.message || 'Failed to generate nodes. Please try again.');
    } finally {
      setIsGeneratingNodes(false);
    }
  };

  const handleEditNode = (index: number) => {
    setEditingNodeIndex(index);
    setEditingNodeData({ ...generatedNodes[index] });
  };

  const handleSaveEditedNode = () => {
    if (editingNodeIndex !== null && editingNodeData) {
      const updatedNodes = [...generatedNodes];
      updatedNodes[editingNodeIndex] = editingNodeData;
      setGeneratedNodes(updatedNodes);
      setEditingNodeIndex(null);
      setEditingNodeData(null);
    }
  };

  const handleDeleteGeneratedNode = (index: number) => {
    const updatedNodes = generatedNodes.filter((_, i) => i !== index);
    setGeneratedNodes(updatedNodes);
  };

  const handleSaveGeneratedNodes = async () => {
    if (generatedNodes.length === 0 || isSavingNodes) {
      return;
    }

    try {
      setIsSavingNodes(true);
      const nodesToCreate: ICreateRoadmapNodeRequest[] = generatedNodes.map(node => ({
        subjectCode: node.subjectCode,
        subjectName: node.subjectName,
        description: node.description,
        semesterNumber: node.semesterNumber,
        isInternalSubjectData: node.isInternalSubjectData
      }));

      const success = await onSaveNodes(nodesToCreate);

      if (success) {
        setGeneratedNodes([]);
        setStudentMessage('');
      }
    } catch (error) {
      console.error('Error saving generated nodes:', error);
    } finally {
      setIsSavingNodes(false);
    }
  };

  // Keep input updates synchronous for smooth typing
  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentMessage(e.target.value);
  };

  // ===== AI GENERATED LINKS FUNCTIONS =====
  const handleGenerateLinks = async () => {
    if (isGeneratingLinks || isCollapsedRef.current) return;
    try {
      setIsGeneratingLinks(true);
      const links = await getAIGeneratedLinks(roadmapId);
      if (links && !isCollapsedRef.current) {
        setGeneratedLinks(links);
      }
    } catch (error) {
      console.error('Error generating links:', error);
    } finally {
      setIsGeneratingLinks(false);
    }
  };

  const handleEditLink = (index: number) => {
    setEditingLinkIndex(index);
    setEditingLinkData({ ...generatedLinks[index] });
  };

  const handleSaveEditedLink = () => {
    if (editingLinkIndex !== null && editingLinkData) {
      const updatedLinks = [...generatedLinks];
      updatedLinks[editingLinkIndex] = editingLinkData;
      setGeneratedLinks(updatedLinks);
      setEditingLinkIndex(null);
      setEditingLinkData(null);
    }
  };

  const handleDeleteGeneratedLink = (index: number) => {
    const updatedLinks = generatedLinks.filter((_, i) => i !== index);
    setGeneratedLinks(updatedLinks);
  };

  const handleSaveGeneratedLinks = async () => {
    if (generatedLinks.length === 0 || isSavingLinks) {
      return;
    }

    try {
      setIsSavingLinks(true);
      const success = await onSaveLinks(generatedLinks);

      if (success) {
        setGeneratedLinks([]);
      }
    } catch (error) {
      console.error('Error saving generated links:', error);
    } finally {
      setIsSavingLinks(false);
    }
  };

  // Memoize heavy node cards rendering
  const nodesGrid = useMemo(() => (
    generatedNodes.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {generatedNodes.map((node, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-xl p-4 shadow-lg min-w-[280px] hover:bg-white/15 transition-all duration-200 flex flex-col"
          >
            <div className="flex-1 space-y-3">
              {/* Subject Code and Semester */}
              <div className="flex items-center justify-between">
                <Tag color="orange" className="font-semibold">
                  {node.subjectCode}
                </Tag>
                <span className="text-xs text-white/60">Semester {node.semesterNumber}</span>
              </div>
              
              {/* Subject Name */}
              <h4 className="font-semibold text-white text-base leading-tight">
                {node.subjectName}
              </h4>
              
              {/* Description - Limited to 2 lines with ellipsis */}
              <div className="relative">
                <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
                  {node.description}
                </p>
                {node.description.length > 100 && (
                  <span className="text-white/60 text-xs">...</span>
                )}
              </div>
            </div>
            
            {/* Footer Section - Badges and Action Buttons */}
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="flex items-center justify-between">
                <Tag color={node.isInternalSubjectData ? "blue" : "green"} className="text-xs">
                  {node.isInternalSubjectData ? "Internal" : "External"}
                </Tag>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditNode(index)}
                    className="!text-blue-400 hover:!text-blue-300 !bg-blue-500/20 hover:!bg-blue-500/30 !border !border-blue-500/30"
                    size="small"
                    disabled={isSavingNodes}
                  />
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteGeneratedNode(index)}
                    className="!text-red-400 hover:!text-red-300 !bg-red-500/20 hover:!bg-red-500/30 !border !border-red-500/30"
                    size="small"
                    disabled={isSavingNodes}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : null
  ), [generatedNodes, isSavingNodes]);

  // Memoize links grid rendering
  const linksGrid = useMemo(() => (
    generatedLinks.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {generatedLinks.map((link, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-xl p-4 shadow-lg min-w-[280px] hover:bg-white/15 transition-all duration-200 flex flex-col"
          >
            <div className="flex-1 space-y-3">
              {/* Connection Header */}
              <div className="flex items-center justify-between">
                <Tag color="purple" className="font-semibold">
                  Connection {index + 1}
                </Tag>
                <span className="text-xs text-white/60">ID: {link.id}</span>
              </div>
              
              {/* Connection Details */}
              <div className="space-y-2">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/60 mb-1">From Subject</div>
                  <div className="text-white font-medium">ID: {link.fromNodeId}</div>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 mx-auto bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">↓</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/60 mb-1">To Subject</div>
                  <div className="text-white font-medium">ID: {link.toNodeId}</div>
                </div>
              </div>
            </div>
            
            {/* Footer Section - Action Buttons */}
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="flex justify-end gap-2">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditLink(index)}
                  className="!text-blue-400 hover:!text-blue-300 !bg-blue-500/20 hover:!bg-blue-500/30 !border !border-blue-500/30"
                  size="small"
                  disabled={isSavingLinks}
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteGeneratedLink(index)}
                  className="!text-red-400 hover:!text-red-300 !bg-red-500/20 hover:!bg-red-500/30 !border !border-red-500/30"
                  size="small"
                  disabled={isSavingLinks}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : null
  ), [generatedLinks, isSavingLinks]);

  // Lightweight prompt input to avoid re-render lag in parent
  const AIPromptInput = memo(function AIPromptInput({ onGenerate, generating, disabled }: { onGenerate: (text: string) => void; generating: boolean; disabled: boolean }) {
    const [localValue, setLocalValue] = useState('');

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    }, []);

    const triggerGenerate = useCallback(() => {
      const trimmed = localValue.trim();
      if (trimmed.length === 0 || disabled) return;
      onGenerate(trimmed);
    }, [localValue, disabled, onGenerate]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerGenerate();
      }
    }, [triggerGenerate]);

    const isReady = localValue.trim().length > 0 && !disabled && !generating;

    return (
      <>
        <Input
          placeholder="Describe what kind of roadmap nodes you want to generate..."
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1"
          size="large"
          disabled={false}
          allowClear
          autoComplete="off"
          type="text"
        />
        <Button
          type="default"
          icon={<SendOutlined />}
          onClick={triggerGenerate}
          loading={generating}
          disabled={!isReady || generating}
          className={isReady 
            ? "!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !text-white" 
            : "!bg-white/10 !border-white/20 !text-white/60 cursor-not-allowed"}
          size="large"
        >
          Generate
        </Button>
      </>
    );
  });

  
  const AINodesTab = () => (
    <div className="space-y-6">
      {/* AI Input Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3 w-full max-w-2xl">
          <AIPromptInput onGenerate={(text) => { setStudentMessage(text); handleGenerateNodes(text); }} generating={isGeneratingNodes} disabled={isCollapsed} />
        </div>
      </div>
      
      {/* Save Button */}
      {generatedNodes.length > 0 && (
        <div className="flex justify-center items-center">
          <span className="text-white/80 mr-4">
            Generated {generatedNodes.length} nodes - Review and edit before saving
          </span>
          <Button
            type="default"
            icon={<SaveOutlined />}
            onClick={handleSaveGeneratedNodes}
            loading={isSavingNodes || isGeneratingNodes}
            disabled={isSavingNodes || isGeneratingNodes}
            className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !text-white"
            size="large"
          >
            Save All Nodes
          </Button>
        </div>
      )}

      {/* Results Area */}
      {isGeneratingNodes ? (
        <div className="flex items-center justify-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <Spin tip="Generating nodes..." />
        </div>
      ) : nodesError ? (
        <div className="py-10 text-center bg-white/5 border border-red-400/30 rounded-xl text-red-300">
          {nodesError}
        </div>
      ) : hasRequestedNodes && generatedNodes.length === 0 ? (
        <div className="py-10 text-center bg-white/5 border border-white/10 rounded-xl text-white/70">
          No suggestions returned. Try refining your prompt.
        </div>
      ) : (
        nodesGrid || null
      )}
    </div>
  );

  const AILinksTab = () => (
    <div className="space-y-6">
      {isGeneratingLinks && (
        <div className="flex items-center justify-center">
          <Spin />
        </div>
      )}
      {/* AI Links Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Smart Subject Connections</h3>
          <p className="text-white/70 text-sm mb-4 max-w-2xl">
            AI will analyze your current roadmap structure and automatically generate logical connections 
            between subjects based on their relationships, prerequisites, and learning dependencies.
          </p>
          <Button
            type="default"
            icon={<LinkOutlined />}
            onClick={handleGenerateLinks}
            loading={isGeneratingLinks}
            disabled={isGeneratingLinks}
            className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !text-white"
            size="large"
          >
            Analyze & Generate Connections
          </Button>
        </div>
      </div>
      
      {/* Save Button */}
      {generatedLinks.length > 0 && (
        <div className="flex justify-center items-center">
          <span className="text-white/80 mr-4">
            Generated {generatedLinks.length} connections - Review and edit before saving
          </span>
          <Button
            type="default"
            icon={<SaveOutlined />}
            onClick={handleSaveGeneratedLinks}
            loading={isSavingLinks || isGeneratingLinks}
            disabled={isSavingLinks || isGeneratingLinks}
            className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !text-white"
            size="large"
          >
            Save All Connections
          </Button>
        </div>
      )}

      {/* Generated Links Display */}
      {linksGrid}
    </div>
  );


  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">AI-Generated Roadmap</h2>
        <Button
          type="text"
          onClick={() => {
            setIsCollapsed(prev => {
              const next = !prev;
              isCollapsedRef.current = next;
              if (next) {
                // Clear transient AI data when collapsing to avoid background UI changes
                setGeneratedNodes([]);
                setGeneratedLinks([]);
                setEditingNodeIndex(null);
                setEditingLinkIndex(null);
                setEditingNodeData(null);
                setEditingLinkData(null);
              }
              return next;
            });
          }}
          className="!text-white !border !border-white/20 !bg-white/10 hover:!bg-white/20 !rounded-lg !p-2 flex items-center justify-center"
          icon={isCollapsed ? <LeftOutlined className="text-orange-400" /> : <DownOutlined className="text-orange-400" />}
        />
      </div>

      {!isCollapsed && (
        <div className="mt-6">
          <Tabs
            activeKey={activeTabKey}
            centered
            type="card"
            animated
            tabBarGutter={16}
            onChange={(key) => setActiveTabKey(key as 'nodes' | 'links')}
            items={[
              {
                key: 'nodes',
                label: (
                  <span className={activeTabKey === 'nodes' ? 'text-orange-400' : 'text-white/80'}>
                    AI-Generated Subjects
                  </span>
                ),
                children: <AINodesTab />,
              },
              {
                key: 'links',
                label: (
                  <span className={activeTabKey === 'links' ? 'text-orange-400' : 'text-white/80'}>
                    AI-Generated Connections
                  </span>
                ),
                children: <AILinksTab />,
              },
            ]}
            className="ai-roadmap-tabs text-white"
            tabBarStyle={{ color: 'white', marginBottom: 16 }}
            size="large"
          />

          {/* Edit Node Modal */}
          <Modal
            title="Edit Generated Node"
            open={editingNodeIndex !== null}
            onCancel={() => {
              setEditingNodeIndex(null);
              setEditingNodeData(null);
            }}
            onOk={handleSaveEditedNode}
            okText="Save Changes"
            cancelText="Cancel"
            className="bg-white/95 backdrop-blur-lg"
          >
            {editingNodeData && (
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                  <Input
                    value={editingNodeData.subjectCode}
                    onChange={(e) => setEditingNodeData({ ...editingNodeData, subjectCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text.sm font-medium text-gray-700 mb-1">Subject Name</label>
                  <Input
                    value={editingNodeData.subjectName}
                    onChange={(e) => setEditingNodeData({ ...editingNodeData, subjectName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester Number</label>
                  <Input
                    type="number"
                    value={editingNodeData.semesterNumber}
                    onChange={(e) => setEditingNodeData({ ...editingNodeData, semesterNumber: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input.TextArea
                    value={editingNodeData.description}
                    onChange={(e) => setEditingNodeData({ ...editingNodeData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Type</label>
                  <select
                    value={editingNodeData.isInternalSubjectData ? "true" : "false"}
                    onChange={(e) => setEditingNodeData({ ...editingNodeData, isInternalSubjectData: e.target.value === "true" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="true">Internal Subject</option>
                    <option value="false">External Subject</option>
                  </select>
                </div>
              </div>
            )}
          </Modal>

          {/* Edit Link Modal */}
          <Modal
            title="Edit Generated Connection"
            open={editingLinkIndex !== null}
            onCancel={() => {
              setEditingLinkIndex(null);
              setEditingLinkData(null);
            }}
            onOk={handleSaveEditedLink}
            okText="Save Changes"
            cancelText="Cancel"
            className="bg-white/95 backdrop-blur-lg"
          >
            {editingLinkData && (
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Subject ID</label>
                  <input
                    type="number"
                    value={editingLinkData.fromNodeId}
                    onChange={(e) => setEditingLinkData({ ...editingLinkData, fromNodeId: parseInt(e.target.value) || 0 })}
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Subject ID</label>
                  <input
                    type="number"
                    value={editingLinkData.toNodeId}
                    onChange={(e) => setEditingLinkData({ ...editingLinkData, toNodeId: parseInt(e.target.value) || 0 })}
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}
    </div>
  );
};

export default AIGeneratedRoadmap;
