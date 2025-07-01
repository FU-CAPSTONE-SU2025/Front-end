// Interface for Subject management
export interface ISubject {
  id: number;
  subjectCode: string;
  subjectName: string;
  combos?: string[];
  prerequisites?: string[];
  status: 'pending' | 'active' | 'in-active';
  description?: string;
  credits?: number;
  semester?: string;
  department?: string;
  learningOutcomes?: string[];
}

// Interface for Subject form data
export interface ISubjectForm {
  subjectCode: string;
  subjectName: string;
  combos?: string[];
  prerequisites?: string[];
  status: 'pending' | 'active' | 'in-active';
}

// Interface for Subject detail
export interface ISubjectDetail extends ISubject {
  syllabusId?: string;
  syllabusName?: string;
  decisionNo?: string;
  description: string;
  credits: number;
  semester: string;
  department: string;
  prerequisites: string[];
  learningOutcomes: string[];
} 