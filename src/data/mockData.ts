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

// Function to generate default version data for any subject
export const generateDefaultVersionData = (subjectId: number, subjectCode: string, subjectName: string) => {
  const today = new Date();
  const oneYearLater = new Date(today);
  oneYearLater.setFullYear(today.getFullYear() + 1);
  
  return {
    subjectId: subjectId,
    versionCode: '1',
    versionName: `${subjectCode} v1`,
    description: `Version 1 of ${subjectName}`,
    isActive: true,
    isDefault: true,
    effectiveFrom: today.toISOString().split('T')[0],
    effectiveTo: oneYearLater.toISOString().split('T')[0],
    createdAt: today.toISOString(),
    updatedAt: today.toISOString()
  };
};

// Function to generate default syllabus data for any subject version
export const generateDefaultSyllabusData = (subjectVersionId: number, subjectCode: string, subjectName: string) => {
  return {
    subjectVersionId: subjectVersionId,
    content: `Syllabus for ${subjectCode} - ${subjectName}. This syllabus contains comprehensive learning materials, assessments, outcomes, and session plans designed to provide students with a thorough understanding of the subject matter.`,
    assessments: [
      {
        id: 1,
        syllabusId: subjectVersionId,
        category: 'Midterm Exam',
        quantity: 1,
        weight: 30,
        completionCriteria: 'Score 60% or higher',
        duration: 90,
        questionType: 'Multiple Choice'
      },
      {
        id: 2,
        syllabusId: subjectVersionId,
        category: 'Final Exam',
        quantity: 1,
        weight: 40,
        completionCriteria: 'Score 60% or higher',
        duration: 120,
        questionType: 'Mixed'
      },
      {
        id: 3,
        syllabusId: subjectVersionId,
        category: 'Assignment',
        quantity: 3,
        weight: 30,
        completionCriteria: 'Submit on time with quality work',
        duration: 0,
        questionType: 'Project'
      }
    ],
    learningMaterials: [
      {
        id: 1,
        syllabusId: subjectVersionId,
        materialName: 'Introduction to Subject',
        authorName: 'Dr. John Doe',
        publishedDate: new Date('2024-01-01'),
        description: 'Comprehensive introduction to the subject matter',
        filepathOrUrl: 'https://example.com/intro.pdf'
      },
      {
        id: 2,
        syllabusId: subjectVersionId,
        materialName: 'Advanced Topics',
        authorName: 'Prof. Jane Smith',
        publishedDate: new Date('2024-02-01'),
        description: 'Advanced concepts and applications',
        filepathOrUrl: 'https://example.com/advanced.pdf'
      }
    ],
    learningOutcomes: [
      {
        id: 1,
        syllabusId: subjectVersionId,
        outcomeCode: 'LO1',
        description: 'Understand fundamental concepts of the subject'
      },
      {
        id: 2,
        syllabusId: subjectVersionId,
        outcomeCode: 'LO2',
        description: 'Apply theoretical knowledge to practical problems'
      },
      {
        id: 3,
        syllabusId: subjectVersionId,
        outcomeCode: 'LO3',
        description: 'Analyze and evaluate complex scenarios'
      }
    ],
    sessions: [
      {
        id: 1,
        syllabusId: subjectVersionId,
        sessionNumber: 1,
        topic: 'Introduction and Course Overview',
        mission: 'Understand course objectives and expectations'
      },
      {
        id: 2,
        syllabusId: subjectVersionId,
        sessionNumber: 2,
        topic: 'Fundamental Concepts',
        mission: 'Master basic principles and terminology'
      },
      {
        id: 3,
        syllabusId: subjectVersionId,
        sessionNumber: 3,
        topic: 'Practical Applications',
        mission: 'Apply concepts to real-world scenarios'
      }
    ]
  };
}; 