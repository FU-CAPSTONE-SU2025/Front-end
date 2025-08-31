export interface ISubjectMarkReport {
    id: number;
    createdAt: string;
    category: string;
    weight: number;
    minScore: number;
    scoreUpdatedBy: string;
    joinedSubjectId: number;
    score: number;
}

export interface IUpdateSubjectMarkReport {
    category: string;
    weight: number;
    minScore: number;
    score: number;
}
export interface ICreateSubjectMarkReport {
    category: string;
    weight: number;
    minScore: number;
    score: number;
}

export interface IViewSubjectAssessment {
    category: string;
    weight: number;
    minScore: number;
    score: number;
}

export interface JoinedSubjectAssessment {
    category: string;
    weight: number;
    minScore: number;
    score?: number;
    maxScore: number;
    isExisting: boolean;
  }

export interface IPersonalAcademicTranscript {
  subjectCode: string;
  subjectVersionCode: string;
  name: string;
  isPassed: boolean;
  credits: number;
  avgScore: number;
}