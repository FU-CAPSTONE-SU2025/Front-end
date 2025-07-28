export const mockUserActivity = [
  { date: '2025-06-01', student: 120, advisor: 10, manager: 5, staff: 15 },
  { date: '2025-06-02', student: 130, advisor: 12, manager: 4, staff: 18 },
  { date: '2025-06-03', student: 125, advisor: 11, manager: 6, staff: 16 },
  { date: '2025-06-04', student: 140, advisor: 13, manager: 5, staff: 20 },
  { date: '2025-06-05', student: 135, advisor: 10, manager: 7, staff: 17 },
  { date: '2025-06-06', student: 145, advisor: 14, manager: 4, staff: 19 },
  { date: '2025-06-07', student: 150, advisor: 12, manager: 5, staff: 21 },
  { date: '2025-06-08', student: 130, advisor: 11, manager: 6, staff: 18 },
  { date: '2025-06-09', student: 125, advisor: 10, manager: 5, staff: 16 },
  { date: '2025-06-10', student: 160, advisor: 15, manager: 8, staff: 22 },
];

export const mockApiLogs = [
  { id: 'log1', userId: 'SE123456', role: 'Student', apiType: 'GET /profile', timestamp: '2025-06-01 10:00:00' },
  { id: 'log2', userId: 'AD789012', role: 'Advisor', apiType: 'POST /schedule', timestamp: '2025-06-01 10:05:00' },
  { id: 'log3', userId: 'MG345678', role: 'Manager', apiType: 'PUT /user', timestamp: '2025-06-01 10:10:00' },
  { id: 'log4', userId: 'ST901234', role: 'Staff', apiType: 'GET /dashboard', timestamp: '2025-06-01 10:15:00' },
  { id: 'log5', userId: 'SE456789', role: 'Student', apiType: 'POST /submit', timestamp: '2025-06-02 09:00:00' },
  { id: 'log6', userId: 'AD012345', role: 'Advisor', apiType: 'GET /students', timestamp: '2025-06-02 09:30:00' },
  { id: 'log7', userId: 'MG678901', role: 'Manager', apiType: 'DELETE /user', timestamp: '2025-06-02 10:00:00' },
  { id: 'log8', userId: 'ST234567', role: 'Staff', apiType: 'GET /reports', timestamp: '2025-06-03 11:00:00' },
  { id: 'log9', userId: 'SE789012', role: 'Student', apiType: 'GET /grades', timestamp: '2025-06-03 12:00:00' },
  { id: 'log10', userId: 'AD345678', role: 'Advisor', apiType: 'POST /meeting', timestamp: '2025-06-03 12:30:00' },
];

// Mock SubjectVersion data
export const mockSubjectVersions = [
  // Subject 1 has 3 versions
  { 
    id: 1, 
    subjectId: 1, 
    versionCode: 'v1.0',
    versionName: 'Version 1.0',
    description: 'Initial version of Advanced Calculus',
    isActive: true, 
    isDefault: true,
    effectiveFrom: '2022-01-01',
    effectiveTo: null,
    createdAt: '2022-01-01T00:00:00Z',
    updatedAt: null
  },
  { 
    id: 2, 
    subjectId: 1, 
    versionCode: 'v2.0',
    versionName: 'Version 2.0',
    description: 'Updated version with new content',
    isActive: false, 
    isDefault: false,
    effectiveFrom: '2022-06-01',
    effectiveTo: null,
    createdAt: '2022-06-01T00:00:00Z',
    updatedAt: null
  },
  { 
    id: 3, 
    subjectId: 1, 
    versionCode: 'v3.0',
    versionName: 'Version 3.0',
    description: 'Latest version with improvements',
    isActive: true, 
    isDefault: false,
    effectiveFrom: '2023-01-01',
    effectiveTo: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: null
  },
  // Subject 2 has 2 versions
  { 
    id: 4, 
    subjectId: 2, 
    versionCode: 'v1.0',
    versionName: 'Version 1.0',
    description: 'Initial version of Modern Physics',
    isActive: true, 
    isDefault: true,
    effectiveFrom: '2022-02-01',
    effectiveTo: null,
    createdAt: '2022-02-01T00:00:00Z',
    updatedAt: null
  },
  { 
    id: 5, 
    subjectId: 2, 
    versionCode: 'v2.0',
    versionName: 'Version 2.0',
    description: 'Updated version with new experiments',
    isActive: true, 
    isDefault: false,
    effectiveFrom: '2023-02-01',
    effectiveTo: null,
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: null
  },
  // Subject 3 has 1 version
  { 
    id: 6, 
    subjectId: 3, 
    versionCode: 'v1.0',
    versionName: 'Version 1.0',
    description: 'Initial version of Data Structures',
    isActive: true, 
    isDefault: true,
    effectiveFrom: '2022-03-01',
    effectiveTo: null,
    createdAt: '2022-03-01T00:00:00Z',
    updatedAt: null
  },
];

// Add mock syllabuses for all subject/version combinations for subjectId 1 and 2, two versions each
export const mockSyllabuses = [
  // Subject 1, Version 1
  {
    id: 1,
    subjectId: 1,
    versionId: 1,
    content: 'Syllabus for Advanced Calculus v1',
    assessments: [],
    learningMaterials: [],
    learningOutcomes: [],
    sessions: [],
  },
  // Subject 1, Version 2
  {
    id: 2,
    subjectId: 1,
    versionId: 2,
    content: 'Syllabus for Advanced Calculus v2',
    assessments: [],
    learningMaterials: [],
    learningOutcomes: [],
    sessions: [],
  },
  // Subject 2, Version 1
  {
    id: 3,
    subjectId: 2,
    versionId: 21,
    content: 'Syllabus for Modern Physics v1',
    assessments: [],
    learningMaterials: [],
    learningOutcomes: [],
    sessions: [],
  },
  // Subject 2, Version 2
  {
    id: 4,
    subjectId: 2,
    versionId: 22,
    content: 'Syllabus for Modern Physics v2',
    assessments: [],
    learningMaterials: [],
    learningOutcomes: [],
    sessions: [],
  },
];

// Update mockSubjectPrerequisites to include version_id
export const mockSubjectPrerequisites = [
  // For version 1 of subject 1
  { subject_id: 1, version_id: 1, prerequisite_subject_id: 101, subjectCode: 'MATH101', subjectName: 'Calculus I' },
  { subject_id: 1, version_id: 1, prerequisite_subject_id: 102, subjectCode: 'PHYS101', subjectName: 'Physics I' },
  // For version 2 of subject 1
  { subject_id: 1, version_id: 2, prerequisite_subject_id: 103, subjectCode: 'CHEM101', subjectName: 'Chemistry I' },
  // For version 1 of subject 2
  { subject_id: 2, version_id: 4, prerequisite_subject_id: 104, subjectCode: 'BIO101', subjectName: 'Biology I' },
];