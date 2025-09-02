import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CreateRoadMap, GetRoadmapId, CreateRoadmapNode, CreateRoadmapLink, DeleteRoadmapLink, CreateBulkRoadmapNodes, GetAIGeneratedNodes, GetAIGeneratedLinks, CreateBulkRoadmapLinks, DeleteRoadmapNode, UpdateRoadmapNode } from '../api/student/RoadMapAPI';
import { IRoadMap, ICreateRoadMapRequest, ICreateRoadmapNodeRequest, IRoadmapNode, IRoadmapLink, IAIGeneratedNode, IAIGeneratedLink } from '../interfaces/IRoadMap';
import { useMessagePopupContext } from '../contexts/MessagePopupContext';

export const useRoadmap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useMessagePopupContext();

  const createRoadmapMutation = useMutation({
    mutationFn: async ({ studentId, data }: { studentId: number; data: ICreateRoadMapRequest }): Promise<IRoadMap> => {
      setIsLoading(true);
      try {
        const result = await CreateRoadMap(studentId, data);
        return result;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      showSuccess('Roadmap created successfully!', `Your "${data.name}" roadmap has been created.`);
    },
    onError: (error: any) => {
      console.error('Failed to create roadmap:', error);
      const errorMessage = error?.message || 'Failed to create roadmap. Please try again.';
      showError('Creation Failed', errorMessage);
    },
  });

  const createNodeMutation = useMutation({
    mutationFn: async ({ roadmapId, data }: { roadmapId: number; data: ICreateRoadmapNodeRequest }): Promise<IRoadmapNode> => {
      setIsLoading(true);
      try {
        const result = await CreateRoadmapNode(roadmapId, data);
        return result;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      showSuccess('Node created successfully!', `Subject "${data.subjectName}" has been added to your roadmap.`);
    },
    onError: (error: any) => {
      console.error('Failed to create node:', error);
      const errorMessage = error?.message || 'Failed to create node. Please try again.';
      showError('Creation Failed', errorMessage);
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async ({ fromNodeId, toNodeId }: { fromNodeId: number; toNodeId: number }): Promise<IRoadmapLink> => {
      setIsLoading(true);
      try {
        const result = await CreateRoadmapLink(fromNodeId, toNodeId);
        return result;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      showSuccess('Link created successfully!', 'Connection between subjects has been established.');
    },
    onError: (error: any) => {
      console.error('Failed to create link:', error);
      const errorMessage = error?.message || 'Failed to create link. Please try again.';
      showError('Creation Failed', errorMessage);
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: number): Promise<boolean> => {
      setIsLoading(true);
      try {
        const result = await DeleteRoadmapLink(linkId);
        return result;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      showSuccess('Link deleted successfully!', 'Connection between subjects has been removed.');
    },
    onError: (error: any) => {
      console.error('Failed to delete link:', error);
      const errorMessage = error?.message || 'Failed to delete link. Please try again.';
      showError('Deletion Failed', errorMessage);
    },
  });

  const createBulkNodesMutation = useMutation({
    mutationFn: async ({ roadmapId, nodes }: { roadmapId: number; nodes: ICreateRoadmapNodeRequest[] }): Promise<IRoadmapNode[]> => {
      setIsLoading(true);
      try {
        const result = await CreateBulkRoadmapNodes(roadmapId, nodes);
        return result;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      showSuccess('Bulk nodes created successfully!', `${data.length} subjects have been added to your roadmap.`);
    },
    onError: (error: any) => {
      console.error('Failed to create bulk nodes:', error);
      const errorMessage = error?.message || 'Failed to create bulk nodes. Please try again.';
      showError('Creation Failed', errorMessage);
    },
  });

  const getAIGeneratedNodesMutation = useMutation({
    mutationFn: async (studentMessage: string): Promise<IAIGeneratedNode[]> => {
      setIsLoading(true);
      try {
        const result = await GetAIGeneratedNodes(studentMessage);
        return result;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      showSuccess('AI Nodes Generated', `Successfully generated ${data.length} roadmap nodes.`);
    },
    onError: (error: any) => {
      console.error('Failed to generate AI nodes:', error);
      const errorMessage = error?.message || 'Failed to generate AI nodes. Please try again.';
      showError('Generation Failed', errorMessage);
    },
  });

  const getAIGeneratedLinksMutation = useMutation({
    mutationFn: async (roadmapId: number): Promise<IAIGeneratedLink[]> => {
      setIsLoading(true);
      try {
        const result = await GetAIGeneratedLinks(roadmapId);
        return result;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      showSuccess('AI Links Generated', `Successfully generated ${data.length} roadmap connections.`);
    },
    onError: (error: any) => {
      console.error('Failed to generate AI links:', error);
      const errorMessage = error?.message || 'Failed to generate AI links. Please try again.';
      showError('Generation Failed', errorMessage);
    },
  });

  const createBulkLinksMutation = useMutation({
    mutationFn: async (links: IAIGeneratedLink[]): Promise<IRoadmapLink[]> => {
      setIsLoading(true);
      try {
        const result = await CreateBulkRoadmapLinks(links);
        return result;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      showSuccess('Bulk links created successfully!', `${data.length} connections have been added to your roadmap.`);
    },
    onError: (error: any) => {
      console.error('Failed to create bulk links:', error);
      const errorMessage = error?.message || 'Failed to create bulk links. Please try again.';
      showError('Creation Failed', errorMessage);
    },
  });

  const deleteNodeMutation = useMutation({
    mutationFn: async (nodeId: number): Promise<boolean> => {
      setIsLoading(true);
      try {
        const result = await DeleteRoadmapNode(nodeId);
        return result;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      showSuccess('Node deleted successfully!', 'Subject has been removed from your roadmap.');
    },
    onError: (error: any) => {
      console.error('Failed to delete node:', error);
      const errorMessage = error?.message || 'Failed to delete node. Please try again.';
      showError('Deletion Failed', errorMessage);
    },
  });

  const updateNodeMutation = useMutation({
    mutationFn: async ({ nodeId, data }: { nodeId: number; data: ICreateRoadmapNodeRequest }): Promise<IRoadmapNode> => {
      setIsLoading(true);
      try {
        const result = await UpdateRoadmapNode(nodeId, data);
        return result;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      showSuccess('Node updated successfully!', `Subject "${data.subjectName}" has been updated in your roadmap.`);
    },
    onError: (error: any) => {
      console.error('Failed to update node:', error);
      const errorMessage = error?.message || 'Failed to update node. Please try again.';
      showError('Update Failed', errorMessage);
    },
  });

  const createRoadmap = async (studentId: number, roadmapName: string): Promise<IRoadMap | null> => {
    if (!roadmapName.trim()) {
      showError('Validation Error', 'Please enter a roadmap name');
      return null;
    }

    try {
      const result = await createRoadmapMutation.mutateAsync({ 
        studentId, 
        data: { name: roadmapName.trim() } 
      });
      return result;
    } catch (error) {
      // Error is already handled by the mutation onError
      return null;
    }
  };

  const createNode = async (roadmapId: number, nodeData: ICreateRoadmapNodeRequest): Promise<IRoadmapNode | null> => {
    try {
      const result = await createNodeMutation.mutateAsync({ 
        roadmapId, 
        data: nodeData 
      });
      return result;
    } catch (error) {
      // Error is already handled by the mutation onError
      return null;
    }
  };

  const createLink = async (fromNodeId: number, toNodeId: number): Promise<IRoadmapLink | null> => {
    try {
      const result = await createLinkMutation.mutateAsync({ 
        fromNodeId, 
        toNodeId 
      });
      return result;
    } catch (error) {
      // Error is already handled by the mutation onError
      return null;
    }
  };

  const deleteLink = async (linkId: number): Promise<boolean | null> => {
    try {
      const result = await deleteLinkMutation.mutateAsync(linkId);
      return result;
    } catch (error) {
      // Error is already handled by the mutation onError
      return null;
    }
  };

  const createBulkNodes = async (roadmapId: number, nodes: ICreateRoadmapNodeRequest[]): Promise<IRoadmapNode[] | null> => {
    try {
      const result = await createBulkNodesMutation.mutateAsync({ 
        roadmapId, 
        nodes 
      });
      return result;
    } catch (error) {
      // Error is already handled by the mutation onError
      return null;
    }
  };

  const getAIGeneratedNodes = async (studentMessage: string): Promise<IAIGeneratedNode[] | null> => {
    if (!studentMessage.trim()) {
      showError('Input Required', 'Please enter a message to generate roadmap nodes.');
      return null;
    }

    try {
      const result = await getAIGeneratedNodesMutation.mutateAsync(studentMessage);
      return result;
    } catch (error) {
      // Error is already handled by the mutation onError
      return null;
    }
  };

  const getAIGeneratedLinks = async (roadmapId: number): Promise<IAIGeneratedLink[] | null> => {
    try {
      const result = await getAIGeneratedLinksMutation.mutateAsync(roadmapId);
      return result;
    } catch (error) {
      // Error is already handled by the mutation onError
      return null;
    }
  };

  const createBulkLinks = async (links: IAIGeneratedLink[]): Promise<IRoadmapLink[] | null> => {
    try {
      const result = await createBulkLinksMutation.mutateAsync(links);
      return result;
    } catch (error) {
      // Error is already handled by the mutation onError
      return null;
    }
  };

  const deleteNode = async (nodeId: number): Promise<boolean | null> => {
    try {
      const result = await deleteNodeMutation.mutateAsync(nodeId);
      return result;
    } catch (error) {
      // Error is already handled by the mutation onError
      return null;
    }
  };

  const updateNode = async (nodeId: number, nodeData: ICreateRoadmapNodeRequest): Promise<IRoadmapNode | null> => {
    try {
      const result = await updateNodeMutation.mutateAsync({
        nodeId,
        data: nodeData
      });
      return result;
    } catch (error) {
      // Error is already handled by the mutation onError
      return null;
    }
  };

  const checkRoadmapExists = async (studentProfileId: number): Promise<number | null> => {
    try {
      const roadmapId = await GetRoadmapId(studentProfileId);
      return roadmapId;
    } catch (error) {
      console.error('Failed to check roadmap existence:', error);
      return null;
    }
  };

  // Hook to check if roadmap exists with caching
  const useRoadmapExists = (studentProfileId: number | null) => {
    return useQuery({
      queryKey: ['roadmap-exists', studentProfileId],
      queryFn: () => checkRoadmapExists(studentProfileId!),
      enabled: !!studentProfileId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      retry: 1,
    });
  };

  return {
    createRoadmap,
    createNode,
    createLink,
    deleteLink,
    deleteNode,
    createBulkNodes,
    getAIGeneratedNodes,
    getAIGeneratedLinks,
    createBulkLinks,
    updateNode,
    checkRoadmapExists,
    useRoadmapExists,
    isLoading: isLoading || createRoadmapMutation.isPending || createNodeMutation.isPending || createLinkMutation.isPending || deleteLinkMutation.isPending || deleteNodeMutation.isPending || createBulkNodesMutation.isPending || getAIGeneratedNodesMutation.isPending || getAIGeneratedLinksMutation.isPending || createBulkLinksMutation.isPending || updateNodeMutation.isPending,
    isError: createRoadmapMutation.isError || createNodeMutation.isError || createLinkMutation.isError || deleteLinkMutation.isError || deleteNodeMutation.isError || createBulkNodesMutation.isError || getAIGeneratedNodesMutation.isError || getAIGeneratedLinksMutation.isError || createBulkLinksMutation.isError || updateNodeMutation.isError,
    error: createRoadmapMutation.error || createNodeMutation.error || createLinkMutation.error || deleteLinkMutation.error || deleteNodeMutation.error || createBulkNodesMutation.error || getAIGeneratedNodesMutation.error || createBulkLinksMutation.error || updateNodeMutation.error,
    reset: () => {
      createRoadmapMutation.reset();
      createNodeMutation.reset();
      createLinkMutation.reset();
      deleteLinkMutation.reset();
      deleteNodeMutation.reset();
      createBulkNodesMutation.reset();
      getAIGeneratedNodesMutation.reset();
      getAIGeneratedLinksMutation.reset();
      createBulkLinksMutation.reset();
      updateNodeMutation.reset();
    },
  };
};
