export interface SyllabusItem {
  id: number;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  content: string;
  createdAt: string;
  updatedAt: string | null; 
}
export interface Syllabus {
  items: SyllabusItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface SyllabusAssessment {
  id: number;
  syllabus_id: number;
  category: 'Assignment' | 'Quiz' | 'Final Exam';
  quantity: number;
  weight: number; // decimal(5,2) - percentage
  completion_criteria: string;
  duration: number; // in minutes
  question_type: 'essay' | 'multiple-choice' | 'practical exam' | 'presentation' | 'project' | 'other';
}

export interface SyllabusLearningMaterial {
  id: number;
  syllabus_id: number;
  material_name: string;
  author_name: string;
  published_date: Date;
  filepath_or_url: string;
  description: string;
}

export interface SyllabusLearningOutcome {
  id: number;
  syllabus_id: number;
  outcome_code: string; // LO1, LO2, etc.
  description: string;
}

export interface SyllabusSession {
  id: number;
  syllabus_id: number;
  session_number: number;
  topic: string;
  mission: string;
}

// Combined interface for a complete syllabus with all related data
export interface CompleteSyllabus extends Syllabus {
  assessments: SyllabusAssessment[];
  learningMaterials: SyllabusLearningMaterial[];
  learningOutcomes: SyllabusLearningOutcome[];
  sessions: SyllabusSession[];
}

// Interface for creating a new syllabus
export interface CreateSyllabus {
  subject_id: number;
  content: string;
}

// Interface for creating assessment
export interface CreateSyllabusAssessment {
  syllabus_id: number;
  category: 'Assignment' | 'Quiz' | 'Final Exam';
  quantity: number;
  weight: number;
  completion_criteria: string;
  duration: number;
  question_type: 'essay' | 'multiple-choice' | 'practical exam' | 'presentation' | 'project' | 'other';
}

// Interface for creating learning material
export interface CreateSyllabusLearningMaterial {
  syllabus_id: number;
  material_name: string;
  author_name: string;
  published_date: Date;
  filepath_or_url: string;
  description: string;
}

// Interface for creating learning outcome
export interface CreateSyllabusLearningOutcome {
  syllabus_id: number;
  outcome_code: string;
  description: string;
}

// Interface for creating session
export interface CreateSyllabusSession {
  syllabus_id: number;
  session_number: number;
  topic: string;
  mission: string;
}

// Interface for paged syllabus data (chuẩn hóa trả về API phân trang)
export interface pagedSyllabusData {
  items: SyllabusItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
} 