// Interface for Program table
export interface Program {
  id: number; // Primary key
  programName: string; // nvarchar(255)
  programCode: string; // varchar(50)
}
export interface CreateProgram {
  programName: string,
  programCode: string
}

// Interface for Curriculum table
export interface Curriculum {
  id: number; // Primary key
  programId: number; // Foreign key referencing Program.id
  curriculumCode: string; // varchar(50), unique
  curriculumName: string; // varchar(255)
  effectiveDate: Date; // datetime2(0)
  createdBy: string | null;
  approvalStatus: number;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
}

// Interface for Subject table
export interface Subject {
  id: number; // Primary key
  subjectCode: string; // varchar(50)
  subjectName: string; // nvarchar(255)
  credits: number; // int
  description: string; // text
  createdBy: string | null;
  approvalStatus: number | 1 | 0;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}
export interface SubjectInCombo {
  subjectId: number; // Primary key
  subjectCode: string; // varchar(50)
  subjectName: string; // nvarchar(255)
  credits: number; // int
  description: string; // text
}

// Interface for Syllabus table
export interface Syllabus {
  id: number;
  subjectVersionId: number;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  assessments: SyllabusAssessment[];
  learningMaterials: SyllabusMaterial[];
  learningOutcomes: SyllabusOutcome[];
  sessions: SyllabusSession[];
}

// Interface for Combo table
export interface Combo {
  id: number; // Primary key
  comboName: string; // nvarchar(255)
  comboDescription: string; // text
  subjectCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  approvalStatus: number | 1 | 0;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

// Interface for Combo_Subject table (junction table)
export interface ComboSubject {
  comboId: number; // Foreign key referencing Combo.id, part of composite primary key
  subjectId: number; // Foreign key referencing Subject.id, part of composite primary key
}

// Interface for Curriculum_Subject table (junction table)
export interface CurriculumSubject {
  curriculumId: number; // Foreign key referencing Curriculum.id, part of composite primary key
  subjectId: number; // Foreign key referencing Subject.id, part of composite primary key
  semesterNumber: number; // int
  isMandatory: boolean; // bool
}

// Interface for displaying subject with curriculum relationship data
export interface SubjectWithCurriculumInfo extends Subject {
  semesterNumber: number;
  isMandatory: boolean;
}

// Interface for Subject_Prerequisites table (junction table)
export interface SubjectPrerequisite {
  subject_id: number; // The subject that has a prerequisite
  version_id: number | null; // The version of the subject that has a prerequisite
  prerequisite_subject_id: number; // The subject that is the prerequisite
}

export interface CreateCurriculum {
  programId: number,
  curriculumCode: string,
  curriculumName: string,
  effectiveDate: Date
}

export interface CreateSubjectToCurriculum {
  subjectId: number,
  semesterNumber: number,
  isMandatory: boolean
}

export interface CreateSubject {
  subjectCode: string,
  subjectName: string,
  credits: number,
  description: string
}

export interface UpdateSubject {
  subjectCode: string,
  subjectName: string,
  credits: number,
  description: string
}

export interface CreateSyllabus {
  subjectVersionId: number,
  content: string
}
export interface UpdateSyllabus {
  content: string
}

export interface CreateSyllabusAssessments {
  syllabusId: number,
  category: string,
  quantity: number,
  weight: number,
  completionCriteria: string,
  duration: number,
  questionType: string
}

export interface CreateSyllabusMaterials {
  syllabusId: number,
  materialName: string,
  authorName: string,
  publishedDate: Date,
  description: string,
  filepathOrUrl: string
}

export interface CreateSyllabusOutcomes {
  syllabusId: number,
  outcomeCode: string,
  description: string
}

export interface CreateSyllabusSessions {
  syllabusId: number,
  sessionNumber: number,
  topic: string,
  mission: string
}

export interface CreateCombo {
  comboName: string,
  comboDescription: string,
  subjectIds: number[]
}

export interface UpdateCombo {
  comboName: string,
  comboDescription: string,
  subjectIds: number[]
}

export interface UpdateCurriculum {
  programId: number,
  curriculumCode: string,
  curriculumName: string,
  effectiveDate: Date,
}

export interface SubjectVersion {
  id: number,
  subjectId: number,
  versionCode: string,
  versionName: string,
  description: string,
  isActive: boolean,
  isDefault: boolean,
  effectiveFrom: string,
  effectiveTo: string | null,
  createdAt: string,
  updatedAt: string | null,
  subject: Subject
}

export interface CreateSubjectVersion {
  subjectId: number,
  versionCode: string,
  versionName: string,
  description: string,
  isActive: boolean,
  isDefault: boolean,
  effectiveFrom: string,
  effectiveTo: string
}

export interface UpdateSubjectVersion {
  versionCode: string,
  versionName: string,
  description: string,
  isActive: boolean,
  isDefault: boolean,
  effectiveFrom: string,
  effectiveTo: string | null,
  createdAt: string,
  updatedAt: string | null,
}

export interface SubjectApproval{
  approvalStatus: number | 1 | 0
  rejectionReason: string | null
}

export interface CurriculumApproval{
  approvalStatus: number | 1 | 0
  rejectionReason: string | null
}

export interface SyllabusApproval{
  approvalStatus: number | 1 | 0
  rejectionReason: string | null
}

export interface ComboApproval{
  approvalStatus: number | 1 | 0
  rejectionReason: string | null
}

// ==================== RESPONSE TYPES ====================

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Paged Response wrapper
export interface PagedResponse<T> {
  success: boolean;
  data: PagedData<T>;
  message?: string;
  error?: string;
}

// Specific response types for each entity
export type SubjectResponse = ApiResponse<Subject>;
export type SyllabusResponse = ApiResponse<Syllabus>;
export type ComboResponse = ApiResponse<Combo>;
export type ProgramResponse = ApiResponse<Program>;
export type SubjectVersionResponse = ApiResponse<SubjectVersion>;

// Paged response types
export type PagedSubjectResponse = PagedResponse<Subject>;
export type PagedSyllabusResponse = PagedResponse<Syllabus>;
export type PagedComboResponse = PagedResponse<Combo>;
export type PagedProgramResponse = PagedResponse<Program>;
export type PagedSubjectVersionResponse = PagedResponse<SubjectVersion>;

// Create operation response types
export type CreateSubjectResponse = ApiResponse<Subject>;
export type CreateSyllabusResponse = ApiResponse<Syllabus>;
export type CreateComboResponse = ApiResponse<Combo>;
export type CreateSyllabusAssessmentsResponse = ApiResponse<SyllabusAssessment>;
export type CreateSyllabusMaterialsResponse = ApiResponse<SyllabusMaterial>;
export type CreateSyllabusOutcomesResponse = ApiResponse<SyllabusOutcome>;
export type CreateSyllabusSessionsResponse = ApiResponse<SyllabusSession>;
export type CreateSubjectVersionResponse = ApiResponse<SubjectVersion>;

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

// Creation interfaces for syllabus-related objects
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

// ==================== PAGED DATA INTERFACES ====================

// Base paged data interface following backend response pattern
export interface PagedData<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

// Paged data for each entity
export interface PagedSubject extends PagedData<Subject> {}
export interface PagedSyllabus extends PagedData<Syllabus> {}
export interface PagedCombo extends PagedData<Combo> {}
export interface PagedProgram extends PagedData<Program> {}
export interface PagedSubjectVersion extends PagedData<SubjectVersion> {}

// Search parameters for filtering
export interface SearchParams {
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
