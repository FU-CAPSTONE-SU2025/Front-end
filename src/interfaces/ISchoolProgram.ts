// Interface for Program table
export interface Program {
  id: number; // Primary key
  programName: string; // nvarchar(255)
  programCode: string; // varchar(50)
}

// Interface for Curriculum table
export interface Curriculum {
  id: number; // Primary key
  programId: number; // Foreign key referencing Program.id
  curriculumCode: string; // varchar(50), unique
  curriculumName: string; // varchar(255)
  effectiveDate: Date; // datetime2(0)
}

// Interface for Subject table
export interface Subject {
  id: number; // Primary key
  subjectCode: string; // varchar(50)
  subjectName: string; // nvarchar(255)
  credits: number; // int
  description: string; // text
}

// Interface for Syllabus table
export interface Syllabus {
  id: number; // Primary key
  subjectId: number; // Foreign key referencing Subject.id
  content: string; // text
}

// Interface for Combo table
export interface Combo {
  id: number; // Primary key
  comboName: string; // nvarchar(255)
  description: string; // text
}

// Interface for Curriculum_Subject table (junction table)
export interface CurriculumSubject {
  curriculumId: number; // Foreign key referencing Curriculum.id, part of composite primary key
  subjectId: number; // Foreign key referencing Subject.id, part of composite primary key
  semesterNumber: number; // int
  isMandetory: boolean; // bool
}

// Interface for Combo_Subject table (junction table)
export interface ComboSubject {
  comboId: number; // Foreign key referencing Combo.id, part of composite primary key
  subjectId: number; // Foreign key referencing Subject.id, part of composite primary key
}
