import { JoinedSubject, SemesterSubjects } from '../interfaces/IStudent';

/**
 * Groups subjects by semester ID
 */
export const groupSubjectsBySemester = (subjects: JoinedSubject[]): SemesterSubjects => {
  return subjects.reduce((acc, subject) => {
    const semesterId = subject.semesterId;
    if (!acc[semesterId]) {
      acc[semesterId] = [];
    }
    acc[semesterId].push(subject);
    return acc;
  }, {} as SemesterSubjects);
};

/**
 * Calculates progress percentage for a subject
 */
export const calculateSubjectProgress = (subject: JoinedSubject): number => {
  if (subject.isCompleted) return 100;
  if (subject.isPassed) return 80;
  return 30; // Default progress for active subjects
};

/**
 * Gets semester options for dropdown
 */
export const getSemesterOptions = (semesterSubjects: SemesterSubjects) => {
  const semesterIds = Object.keys(semesterSubjects).map(Number).sort((a, b) => b - a);
  return semesterIds.map(semesterId => {
    const subjects = semesterSubjects[semesterId];
    // Get semesterName from the first subject (they should all have the same semesterName for the same semesterId)
    const semesterName = subjects[0]?.semesterName || `Semester ${semesterId}`;
    return {
      label: semesterName,
      value: semesterId.toString()
    };
  });
};

/**
 * Calculates total credits for a list of subjects
 */
export const calculateTotalCredits = (subjects: JoinedSubject[]): number => {
  return subjects.reduce((total, subject) => total + subject.credits, 0);
};

/**
 * Gets subjects statistics
 */
export const getSubjectsStats = (subjects: JoinedSubject[]) => {
  const total = subjects.length;
  const completed = subjects.filter(s => s.isCompleted).length;
  const passed = subjects.filter(s => s.isPassed && !s.isCompleted).length;
  const inProgress = subjects.filter(s => !s.isPassed && !s.isCompleted).length;
  const totalCredits = calculateTotalCredits(subjects);

  return {
    total,
    completed,
    passed,
    inProgress,
    totalCredits,
    completionRate: total > 0 ? (completed / total) * 100 : 0
  };
};
