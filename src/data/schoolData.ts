import { Program, Curriculum, Subject, Syllabus, Combo, CurriculumSubject, ComboSubject, SubjectPrerequisite } from '../interfaces/ISchoolProgram';

export const programs: Program[] = [
  { id: 1, programName: 'Computer Science', programCode: 'CS101' },
  { id: 2, programName: 'Artificial Intelligence', programCode: 'AI201' },
];

export const curriculums: Curriculum[] = [
  { id: 1, programId: 1, curriculumCode: 'CS2023', curriculumName: 'CS 2023 Curriculum', effectiveDate: new Date('2023-09-01') },
  { id: 2, programId: 2, curriculumCode: 'AI2023', curriculumName: 'AI 2023 Curriculum', effectiveDate: new Date('2023-09-01') },
];

export const subjects: Subject[] = [
  { id: 1, subjectCode: 'CS101', subjectName: 'Intro to Computer Science', credits: 3, description: 'Basics of CS.' },
  { id: 2, subjectCode: 'CS102', subjectName: 'Data Structures', credits: 4, description: 'Data structures and algorithms.' },
  { id: 3, subjectCode: 'AI201', subjectName: 'Intro to AI', credits: 3, description: 'Basics of AI.' },
  { id: 4, subjectCode: 'AI202', subjectName: 'Machine Learning', credits: 4, description: 'Machine learning concepts.' },
  { id: 5, subjectCode: 'CS201', subjectName: 'Operating Systems', credits: 3, description: 'OS principles.' },
  { id: 6, subjectCode: 'CS202', subjectName: 'Databases', credits: 3, description: 'Database systems.' },
];

export const syllabuses: Syllabus[] = [
  { id: 1, subjectId: 1, content: 'Syllabus for CS101' },
  { id: 2, subjectId: 2, content: 'Syllabus for CS102' },
];

export const combos: Combo[] = [
  { id: 1, comboName: 'AI Electives', description: 'AI-focused electives.' },
  { id: 2, comboName: 'Data Science Track', description: 'Data Science electives.' },
];

export const curriculumSubjects: CurriculumSubject[] = [
  // Semester 1
  { curriculumId: 1, subjectId: 1, semesterNumber: 1, isMandetory: true },
  { curriculumId: 1, subjectId: 2, semesterNumber: 1, isMandetory: true },
  { curriculumId: 1, subjectId: 5, semesterNumber: 1, isMandetory: true },
  // Semester 5 with combo
  { curriculumId: 1, subjectId: 1, semesterNumber: 5, isMandetory: true },
  { curriculumId: 1, subjectId: 2, semesterNumber: 5, isMandetory: true },
  { curriculumId: 1, subjectId: 1, semesterNumber: 5, isMandetory: false }, // Combo (comboId=1)
  { curriculumId: 1, subjectId: 2, semesterNumber: 5, isMandetory: false }, // Combo (comboId=2)
];

export const comboSubjects: ComboSubject[] = [
  { comboId: 1, subjectId: 3 },
  { comboId: 1, subjectId: 4 },
  { comboId: 2, subjectId: 6 },
];

export const subjectPrerequisites: SubjectPrerequisite[] = [
  { subject_id: 2, prerequisite_subject_id: 1 }, // CS102 requires CS101
  { subject_id: 4, prerequisite_subject_id: 3 }, // AI202 requires AI201
  { subject_id: 5, prerequisite_subject_id: 2 }, // CS201 requires CS102
];

// Mock fetch functions
export const fetchPrograms = () => new Promise<Program[]>(res => setTimeout(() => res(programs), 300));
export const fetchCurriculums = () => new Promise<Curriculum[]>(res => setTimeout(() => res(curriculums), 300));
export const fetchSubjects = () => new Promise<Subject[]>(res => setTimeout(() => res(subjects), 300));
export const fetchCombos = () => new Promise<Combo[]>(res => setTimeout(() => res(combos), 300));
export const fetchCurriculumSubjects = () => new Promise<CurriculumSubject[]>(res => setTimeout(() => res(curriculumSubjects), 300));
export const fetchComboSubjects = () => new Promise<ComboSubject[]>(res => setTimeout(() => res(comboSubjects), 300));
export const fetchSubjectPrerequisites = () => new Promise<SubjectPrerequisite[]>(res => setTimeout(() => res(subjectPrerequisites), 300)); 