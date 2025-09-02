import { axiosCreate, axiosRead, throwApiError, axiosDelete, axiosUpdate } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { IRoadMap, ICreateRoadMapRequest, IRoadmapGraph, ICreateRoadmapNodeRequest, IRoadmapNode, IRoadmapLink, IAIGeneratedNode, IAIGeneratedLink } from "../../interfaces/IRoadMap";

const roadMapURL = baseUrl + "/RoadMap";

export const CreateRoadMap = async (studentId: number, data: ICreateRoadMapRequest): Promise<IRoadMap> => {
  const queryParams = new URLSearchParams({ name: data.name });
  const url = `${roadMapURL}/create/${studentId}?${queryParams.toString()}`;
  
  const props = {
    data: null, // No body data needed since name is in query
    url: url,
    headers: GetHeader(),
  };
  
  const result = await axiosCreate(props);
  
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const GetRoadmapId = async (studentProfileId: number): Promise<number | null> => {
  const props = {
    data: null,
    url: `${roadMapURL}/get-roadmap-id/${studentProfileId}`,
    headers: GetHeader(),
  };
  
  const result = await axiosRead(props);
  
  if (result.success) {
    // API returns -1 when no roadmap exists, convert to null
    const roadmapId = result.data;
    return roadmapId === -1 ? null : roadmapId;
  } else {
    // If API fails, return null
    return null;
  }
};

export const GetRoadmapGraph = async (roadmapId: number): Promise<IRoadmapGraph> => {
  const props = {
    data: null,
    url: `${roadMapURL}/${roadmapId}/graph`,
    headers: GetHeader(),
  };
  
  const result = await axiosRead(props);
  
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const DeleteRoadMap = async (roadmapId: number): Promise<boolean> => {
  const props = {
    data: null,
    url: `${roadMapURL}/${roadmapId}`,
    headers: GetHeader(),
  };
  
  const result = await axiosDelete(props);
  
  if (result.success) {
    return true;
  } else {
    throwApiError(result);
    return false;
  }
};

export const CreateRoadmapNode = async (roadmapId: number, data: ICreateRoadmapNodeRequest): Promise<IRoadmapNode> => {
  const props = {
    data: data,
    url: `${roadMapURL}/${roadmapId}/node`,
    headers: GetHeader(),
  };
  
  const result = await axiosCreate(props);
  
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const CreateRoadmapLink = async (fromNodeId: number, toNodeId: number): Promise<IRoadmapLink> => {
  const queryParams = new URLSearchParams({ 
    fromNodeId: fromNodeId.toString(), 
    toNodeId: toNodeId.toString() 
  });
  const url = `${roadMapURL}/link?${queryParams.toString()}`;
  
  const props = {
    data: null, // No body data needed since parameters are in query
    url: url,
    headers: GetHeader(),
  };
  
  const result = await axiosCreate(props);
  
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const DeleteRoadmapLink = async (linkId: number): Promise<boolean> => {
  const props = {
    data: null,
    url: `${roadMapURL}/link/${linkId}`,
    headers: GetHeader(),
  };
  
  const result = await axiosDelete(props);
  
  if (result.success) {
    return true;
  } else {
    throwApiError(result);
    return false;
  }
};

export const CreateBulkRoadmapNodes = async (roadmapId: number, nodes: ICreateRoadmapNodeRequest[]): Promise<IRoadmapNode[]> => {
  const props = {
    data: nodes,
    url: `${roadMapURL}/${roadmapId}/nodes/bulk`,
    headers: GetHeader(),
  };
  
  const result = await axiosCreate(props);
  
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const GetAIGeneratedNodes = async (studentMessage: string): Promise<IAIGeneratedNode[]> => {
  const queryParams = new URLSearchParams({ studentMessage });
  const url = `${roadMapURL}/ai-gen-node?${queryParams.toString()}`;
  
  const props = {
    data: null,
    url: url,
    headers: GetHeader(),
  };
  
  const result = await axiosRead(props);
  
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const GetAIGeneratedLinks = async (roadmapId: number): Promise<IAIGeneratedLink[]> => {
  // First get the roadmap graph data
  const roadmapGraph = await GetRoadmapGraph(roadmapId);
  
  const props = {
    data: roadmapGraph, // Send the roadmap graph data in the body
    url: `${roadMapURL}/ai-gen-link`,
    headers: GetHeader(),
  };
  
  const result = await axiosCreate(props); // Use POST instead of GET since we're sending data
  
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const CreateBulkRoadmapLinks = async (links: IAIGeneratedLink[]): Promise<IRoadmapLink[]> => {
  const props = {
    data: links,
    url: `${roadMapURL}/links/bulk`,
    headers: GetHeader(),
  };
  
  const result = await axiosCreate(props);
  
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const GetRoadmapNode = async (nodeId: number): Promise<IRoadmapNode> => {
  const props = {
    data: null,
    url: `${roadMapURL}/node/${nodeId}`,
    headers: GetHeader(),
  };
  
  const result = await axiosRead(props);
  
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const DeleteRoadmapNode = async (nodeId: number): Promise<boolean> => {
  const props = {
    data: null,
    url: `${roadMapURL}/node/${nodeId}`,
    headers: GetHeader(),
  };
  
  const result = await axiosDelete(props);
  
  if (result.success) {
    return true;
  } else {
    throwApiError(result);
    return false;
  }
};

export const UpdateRoadmapNode = async (nodeId: number, data: ICreateRoadmapNodeRequest): Promise<IRoadmapNode> => {
  const props = {
    data: data,
    url: `${roadMapURL}/node/${nodeId}`,
    headers: GetHeader(),
  };
  
  const result = await axiosUpdate(props); // Use PUT method for update
  
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};
