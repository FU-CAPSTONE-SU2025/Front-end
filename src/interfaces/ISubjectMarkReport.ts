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
}