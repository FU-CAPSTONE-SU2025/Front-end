// Mock data for Student Monitoring Dashboard

export interface ComboComparisonData {
  combo: string;
  studentCount: number;
  percentage: number;
}

export interface CurriculumData {
  curriculum: string;
  studentCount: number;
  color: string;
}

export interface SemesterData {
  semester: number;
  studentCount: number;
  curriculum: string;
}

export interface GrowthTrendData {
  period: string;
  studentCount: number;
  growthRate: number;
}

export interface DetailedStudentEnrollment {
  id: string;
  studentName: string;
  studentId: string;
  curriculum: string;
  combo: string;
  semester: number;
  enrollmentDate: string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  gpa: number;
  advisor: string;
  email: string;
}

// Mock data for Student Comparison Across Combos
export const mockComboComparisonData: ComboComparisonData[] = [
  { combo: 'Web Development', studentCount: 156, percentage: 28 },
  { combo: 'Mobile Development', studentCount: 134, percentage: 24 },
  { combo: 'AI & Machine Learning', studentCount: 98, percentage: 18 },
  { combo: 'Cybersecurity', studentCount: 87, percentage: 16 },
  { combo: 'Data Science', studentCount: 76, percentage: 14 }
];

// Mock data for Students by Curriculum
export const mockCurriculumData: CurriculumData[] = [
  { curriculum: 'Computer Science', studentCount: 245, color: '#1E40AF' },
  { curriculum: 'Information Technology', studentCount: 189, color: '#f97316' },
  { curriculum: 'Software Engineering', studentCount: 156, color: '#059669' },
  { curriculum: 'Data Science', studentCount: 134, color: '#dc2626' },
  { curriculum: 'Cybersecurity', studentCount: 98, color: '#7c3aed' }
];

// Mock data for Student Distribution by Semester
export const mockSemesterData: SemesterData[] = [
  { semester: 1, studentCount: 89, curriculum: 'Computer Science' },
  { semester: 2, studentCount: 112, curriculum: 'Computer Science' },
  { semester: 3, studentCount: 134, curriculum: 'Computer Science' },
  { semester: 4, studentCount: 156, curriculum: 'Computer Science' },
  { semester: 5, studentCount: 178, curriculum: 'Computer Science' },
  { semester: 6, studentCount: 145, curriculum: 'Computer Science' },
  { semester: 7, studentCount: 123, curriculum: 'Computer Science' },
  { semester: 8, studentCount: 98, curriculum: 'Computer Science' },
  { semester: 9, studentCount: 67, curriculum: 'Computer Science' }
];

// Mock data for Student Growth Over Time (kept for context, but not used in final UI)
export const mockGrowthTrendData: GrowthTrendData[] = [
  { period: 'Spring 2023', studentCount: 450, growthRate: 0 },
  { period: 'Summer 2023', studentCount: 523, growthRate: 16.2 },
  { period: 'Fall 2023', studentCount: 612, growthRate: 17.0 },
  { period: 'Winter 2023', studentCount: 589, growthRate: -3.8 },
  { period: 'Spring 2024', studentCount: 678, growthRate: 15.1 },
  { period: 'Summer 2024', studentCount: 745, growthRate: 9.9 },
  { period: 'Fall 2024', studentCount: 823, growthRate: 10.5 },
  { period: 'Winter 2024', studentCount: 789, growthRate: -4.1 },
  { period: 'Spring 2025', studentCount: 822, growthRate: 4.2 }
];

// Mock data for Detailed Student Enrollment Data
export const mockDetailedEnrollmentData: DetailedStudentEnrollment[] = [
  {
    id: '1',
    studentName: 'Alex Johnson',
    studentId: 'STU2024001',
    curriculum: 'Computer Science',
    combo: 'Web Development',
    semester: 3,
    enrollmentDate: '2024-01-15',
    status: 'Active',
    gpa: 3.8,
    advisor: 'Dr. Sarah Chen',
    email: 'alex.johnson@student.edu'
  },
  {
    id: '2',
    studentName: 'Maria Garcia',
    studentId: 'STU2024002',
    curriculum: 'Information Technology',
    combo: 'Mobile Development',
    semester: 2,
    enrollmentDate: '2024-02-01',
    status: 'Active',
    gpa: 3.6,
    advisor: 'Prof. Michael Brown',
    email: 'maria.garcia@student.edu'
  },
  {
    id: '3',
    studentName: 'David Kim',
    studentId: 'STU2024003',
    curriculum: 'Software Engineering',
    combo: 'AI & Machine Learning',
    semester: 4,
    enrollmentDate: '2023-09-10',
    status: 'Active',
    gpa: 3.9,
    advisor: 'Dr. Emily Wilson',
    email: 'david.kim@student.edu'
  },
  {
    id: '4',
    studentName: 'Lisa Thompson',
    studentId: 'STU2024004',
    curriculum: 'Data Science',
    combo: 'Data Science',
    semester: 1,
    enrollmentDate: '2024-03-01',
    status: 'Active',
    gpa: 3.7,
    advisor: 'Prof. James Davis',
    email: 'lisa.thompson@student.edu'
  },
  {
    id: '5',
    studentName: 'Robert Lee',
    studentId: 'STU2024005',
    curriculum: 'Cybersecurity',
    combo: 'Cybersecurity',
    semester: 5,
    enrollmentDate: '2023-01-20',
    status: 'Active',
    gpa: 3.5,
    advisor: 'Dr. Amanda Rodriguez',
    email: 'robert.lee@student.edu'
  },
  {
    id: '6',
    studentName: 'Jennifer White',
    studentId: 'STU2024006',
    curriculum: 'Computer Science',
    combo: 'Web Development',
    semester: 6,
    enrollmentDate: '2022-09-15',
    status: 'Active',
    gpa: 3.4,
    advisor: 'Dr. Sarah Chen',
    email: 'jennifer.white@student.edu'
  },
  {
    id: '7',
    studentName: 'Christopher Martinez',
    studentId: 'STU2024007',
    curriculum: 'Information Technology',
    combo: 'Mobile Development',
    semester: 3,
    enrollmentDate: '2023-09-01',
    status: 'Active',
    gpa: 3.8,
    advisor: 'Prof. Michael Brown',
    email: 'christopher.martinez@student.edu'
  },
  {
    id: '8',
    studentName: 'Amanda Taylor',
    studentId: 'STU2024008',
    curriculum: 'Software Engineering',
    combo: 'AI & Machine Learning',
    semester: 7,
    enrollmentDate: '2022-01-10',
    status: 'Active',
    gpa: 3.6,
    advisor: 'Dr. Emily Wilson',
    email: 'amanda.taylor@student.edu'
  },
  {
    id: '9',
    studentName: 'Daniel Anderson',
    studentId: 'STU2024009',
    curriculum: 'Data Science',
    combo: 'Data Science',
    semester: 2,
    enrollmentDate: '2024-01-05',
    status: 'Active',
    gpa: 3.9,
    advisor: 'Prof. James Davis',
    email: 'daniel.anderson@student.edu'
  },
  {
    id: '10',
    studentName: 'Sophia Brown',
    studentId: 'STU2024010',
    curriculum: 'Cybersecurity',
    combo: 'Cybersecurity',
    semester: 4,
    enrollmentDate: '2023-03-15',
    status: 'Active',
    gpa: 3.7,
    advisor: 'Dr. Amanda Rodriguez',
    email: 'sophia.brown@student.edu'
  }
];

// Filtered data functions (currently return all mock data, but can be extended)
export const getFilteredComboData = (curriculum: string, semester: string, timeRange: string) => {
  return mockComboComparisonData;
};

export const getFilteredCurriculumData = (curriculum: string, semester: string, timeRange: string) => {
  return mockCurriculumData;
};

export const getFilteredSemesterData = (curriculum: string, semester: string, timeRange: string) => {
  if (semester !== 'all') {
    return mockSemesterData.filter(data => data.semester === parseInt(semester));
  }
  return mockSemesterData;
};

export const getFilteredGrowthData = (curriculum: string, semester: string, timeRange: string) => {
  return mockGrowthTrendData;
};

export const getFilteredDetailedEnrollmentData = (curriculum: string, semester: string, timeRange: string) => {
  let filteredData = [...mockDetailedEnrollmentData];
  
  if (curriculum !== 'all') {
    filteredData = filteredData.filter(student => student.curriculum === curriculum);
  }
  
  if (semester !== 'all') {
    filteredData = filteredData.filter(student => student.semester === parseInt(semester));
  }
  
  return filteredData;
}; 