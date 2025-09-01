export interface IRoadMap {
  id: number;
  name: string;
  studentProfileId: number;
  nodes: IRoadmapNode[];
  links: IRoadmapLink[];
}

export interface ICreateRoadMapRequest {
  name: string;
}

export interface IRoadmapLink {
  id: number;
  fromNodeId: number;
  toNodeId: number;
}

export interface IRoadmapNode {
  id: number;
  subjectCode: string;
  semesterNumber: number;
  subjectName: string;
  description: string;
  prerequisiteIds: number[];
  dependentIds: number[];
  outgoingLinks: IRoadmapLink[];
  isInternalSubjectData?: boolean; // Optional for existing nodes
}

export interface ICreateRoadmapNodeRequest {
  subjectCode: string;
  semesterNumber: number;
  subjectName: string;
  description: string;
  isInternalSubjectData: boolean;
}

export interface IRoadmapGraph {
  id: number;
  name: string;
  studentProfileId: number;
  nodes: IRoadmapNode[];
  links: IRoadmapLink[];
}
