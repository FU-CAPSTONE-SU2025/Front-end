// Interface for Syllabus table
export interface Syllabus {
  id: number; // Primary key
  subjectId: number; // Foreign key referencing Subject.id
  content: string; // text
  assessments: SyllabusAssessment[];
  learningMaterials: SyllabusMaterial[];
  learningOutcomes: SyllabusOutcome[];
  sessions: SyllabusSession[];
}

// Additional interfaces for syllabus components
export interface SyllabusAssessment {
  id: number;
  syllabusId: number;
  category: string;
  quantity: number;
  weight: number;
  completionCriteria: string;
  duration: number;
  questionType: string;
}

export interface SyllabusMaterial {
  id: number;
  syllabusId: number;
  materialName: string;
  authorName: string;
  publishedDate: Date;
  description: string;
  filepathOrUrl: string;
}

export interface SyllabusOutcome {
  id: number;
  syllabusId: number;
  outcomeCode: string;
  description: string;
}

export interface SyllabusSession {
  id: number;
  syllabusId: number;
  sessionNumber: number;
  topic: string;
  mission: string;
}

// Create operation interfaces
export interface CreateSyllabus {
  subjectId: number;
  content: string;
}

export interface UpdateSyllabus {
  content: string;
}

export interface CreateSyllabusAssessment {
  syllabusId: number;
  category: string;
  quantity: number;
  weight: number;
  completionCriteria: string;
  duration: number;
  questionType: string;
}

export interface CreateSyllabusMaterial {
  syllabusId: number;
  materialName: string;
  authorName: string;
  publishedDate: Date;
  description: string;
  filepathOrUrl: string;
}

export interface CreateSyllabusOutcome {
  syllabusId: number;
  outcomeCode: string;
  description: string;
}

export interface CreateSyllabusSession {
  syllabusId: number;
  sessionNumber: number;
  topic: string;
  mission: string;
} 