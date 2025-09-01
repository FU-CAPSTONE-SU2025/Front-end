import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Divider, message, Tooltip, Card, Tag, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined, PlusOutlined, DeleteOutlined, BookOutlined, CalendarOutlined } from '@ant-design/icons';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import DeleteRoadmapModal from '../../components/student/deleteRoadmapModal';
import CreateNodeModal from '../../components/student/createNodeModal';
import CreateBulkNodesModal from '../../components/student/createBulkNodesModal';
import RoadmapFlow from '../../components/student/roadmapFlow';
import { DeleteRoadMap, GetRoadmapGraph } from '../../api/student/RoadMapAPI';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';
import { useRoadmap } from '../../hooks/useRoadmap';
import { IRoadmapGraph, ICreateRoadmapNodeRequest } from '../../interfaces/IRoadMap';

const SemesterPlannerDetail = () => {
  const { roadmapId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMessagePopupContext();
  const { createNode, createLink, deleteLink, createBulkNodes, isLoading: isCreatingNode } = useRoadmap();
  
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateNodeModalVisible, setIsCreateNodeModalVisible] = useState(false);
  const [isCreateBulkNodesModalVisible, setIsCreateBulkNodesModalVisible] = useState(false);

  // Fetch roadmap graph data
  const { data: roadmap, isLoading: isRoadmapLoading, error: roadmapError } = useQuery({
    queryKey: ['roadmap-graph', roadmapId],
    queryFn: () => GetRoadmapGraph(parseInt(roadmapId!)),
    enabled: !!roadmapId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalVisible(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteModalVisible(false);
  };

  const handleDeleteConfirm = async () => {
    if (!roadmapId) return;
    
    setIsDeleting(true);
    try {
      const success = await DeleteRoadMap(parseInt(roadmapId));
      
      if (success) {
        showSuccess('Roadmap deleted successfully!', 'Your roadmap has been permanently removed.');
        
        // Invalidate and refetch roadmap-related queries
        await queryClient.invalidateQueries({ queryKey: ['roadmap-exists'] });
        await queryClient.invalidateQueries({ queryKey: ['roadmap'] });
        await queryClient.invalidateQueries({ queryKey: ['roadmap-graph'] });
        
        // Navigate back to semester planner page
        navigate('/student/semesterPlanner', { replace: true });
      } else {
        showError('Delete Failed', 'Failed to delete roadmap. Please try again.');
      }
    } catch (error: any) {
      console.error('Error deleting roadmap:', error);
      showError('Delete Failed', error?.message || 'An error occurred while deleting the roadmap.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalVisible(false);
    }
  };

  const handleCreateNodeClick = () => {
    setIsCreateNodeModalVisible(true);
  };

  const handleCreateNodeClose = () => {
    setIsCreateNodeModalVisible(false);
  };

  const handleCreateNodeSubmit = async (values: ICreateRoadmapNodeRequest) => {
    if (!roadmapId) return;
    
    try {
      const result = await createNode(parseInt(roadmapId), values);
      
      if (result) {
        // Invalidate and refetch roadmap graph to show new node
        await queryClient.invalidateQueries({ queryKey: ['roadmap-graph', roadmapId] });
        setIsCreateNodeModalVisible(false);
      }
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Error creating node:', error);
    }
  };

  const handleCreateBulkNodesClick = () => {
    setIsCreateBulkNodesModalVisible(true);
  };

  const handleCreateBulkNodesClose = () => {
    setIsCreateBulkNodesModalVisible(false);
  };

  const handleCreateBulkNodesSubmit = async (values: { nodes: ICreateRoadmapNodeRequest[] }) => {
    if (!roadmapId) return;

    try {
      const result = await createBulkNodes(parseInt(roadmapId), values.nodes);

      if (result) {
        // Invalidate and refetch roadmap graph to show new nodes
        await queryClient.invalidateQueries({ queryKey: ['roadmap-graph', roadmapId] });
        setIsCreateBulkNodesModalVisible(false);
        
        // Refresh the entire page as requested
        window.location.reload();
      }
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Error creating bulk nodes:', error);
    }
  };

  const handleLinkCreate = async (fromNodeId: number, toNodeId: number) => {
    try {
      const result = await createLink(fromNodeId, toNodeId);
      
      if (result) {
        // Invalidate and refetch roadmap graph to show new link
        await queryClient.invalidateQueries({ queryKey: ['roadmap-graph', roadmapId] });
      }
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Error creating link:', error);
    }
  };

  const handleLinkDelete = async (linkId: number) => {
    try {
      const result = await deleteLink(linkId);
      
      if (result) {
        // Invalidate and refetch roadmap graph to remove deleted link
        await queryClient.invalidateQueries({ queryKey: ['roadmap-graph', roadmapId] });
      }
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Error deleting link:', error);
    }
  };

  // Loading state
  if (isRoadmapLoading) {
    return (
      <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-orange-500 to-blue-900 items-center justify-center py-6">
        <Spin size="large" />
        <p className="text-white mt-4">Loading roadmap...</p>
      </div>
    );
  }

  // Error state
  if (roadmapError) {
    return (
      <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-orange-500 to-blue-900 items-center justify-center py-6">
        <div className="text-red-400 text-xl">Error loading roadmap: {roadmapError.message}</div>
        <Button onClick={handleBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  // No roadmap data
  if (!roadmap) {
    return (
      <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-orange-500 to-blue-900 items-center justify-center py-6">
        <div className="text-white text-xl">Roadmap not found.</div>
        <Button onClick={handleBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-orange-500 to-blue-900 items-center py-6">
      {/* Header Section - Minimal Design */}
      <div className="w-full max-w-6xl px-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Back Button and Delete Button Row */}
          <div className="flex items-center justify-between mb-6">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className="!text-white !border-white/30 !bg-white/10 hover:!bg-white/20 !h-10 !px-4 !flex !items-center !gap-2 !backdrop-blur-md"
              size="large"
            >
              Back
            </Button>
            
            {/* Delete Button - Same style as todoList */}
            <Tooltip title="Delete roadmap" placement="left">
              <button
                onClick={handleDeleteClick}
                className="p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors border border-red-500/30 hover:border-red-500/50 w-8 h-8 flex items-center justify-center"
              >
                <DeleteOutlined className="w-4 h-4 !text-red-400" />
              </button>
            </Tooltip>
          </div>

          {/* Header Content */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                {roadmap.name}
              </h1>
              
              <p className="text-lg text-white/90 max-w-3xl leading-relaxed">
                A personalized step-by-step guide to becoming a modern software engineer in 2025. 
                This roadmap is tailored to your learning journey and academic progress.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 lg:items-end">
            
              <Button 
                type="default" 
                size="large"
                icon={<PlusOutlined />}
                onClick={handleCreateNodeClick}
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 h-12 px-6"
              >
                Add Subject
              </Button>
              <Button 
                type="default" 
                size="large"
                icon={<PlusOutlined />}
                onClick={handleCreateBulkNodesClick}
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 h-12 px-6"
              >
                Bulk Add Subjects
              </Button>
            </div>
          </div>

          <Divider className="border-white/20 my-6" />

          {/* Roadmap Stats - Dynamic from actual data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">{roadmap.nodes.length}</div>
              <div className="text-white/70 text-sm">Total Subjects</div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {Math.max(...roadmap.nodes.map(node => node.semesterNumber))}
              </div>
              <div className="text-white/70 text-sm">Total Semesters</div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {roadmap.links.length}
              </div>
              <div className="text-white/70 text-sm">Dependencies</div>
            </div>
          </div>

          {/* Roadmap Description - Minimal */}
          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">About This Roadmap</h3>
            <p className="text-white/80 leading-relaxed">
              This roadmap is designed to guide you through the essential skills and knowledge areas 
              needed for modern software development. It covers fundamental concepts, practical skills, 
              and industry best practices. Each milestone represents a significant learning objective 
              that builds upon previous knowledge, ensuring a structured and comprehensive learning experience.
            </p>
          </div>
        </div>
      </div>

      {/* Roadmap Content - React Flow Graph */}
      <div className="w-full max-w-7xl px-4 mt-8">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Roadmap Content</h2>
          
          {/* React Flow Component */}
          <RoadmapFlow 
            roadmap={roadmap} 
            onLinkCreate={handleLinkCreate} 
            onLinkDelete={handleLinkDelete} 
          />
        </div>
      </div>

      {/* Modal Components */}
      <CreateNodeModal
        isVisible={isCreateNodeModalVisible}
        onClose={handleCreateNodeClose}
        onSubmit={handleCreateNodeSubmit}
        isLoading={isCreatingNode}
      />

      <CreateBulkNodesModal
        isVisible={isCreateBulkNodesModalVisible}
        onClose={handleCreateBulkNodesClose}
        onSubmit={handleCreateBulkNodesSubmit}
        isLoading={isCreatingNode}
      />

      <DeleteRoadmapModal
        isVisible={isDeleteModalVisible}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        roadmapName={roadmap.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SemesterPlannerDetail;
