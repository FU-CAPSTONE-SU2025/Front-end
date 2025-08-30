import { JoinedSubject, SemesterSubjects } from '../interfaces/IStudent';
import { JoinedSubjectAssessment } from '../interfaces/ISubjectMarkReport';

/**
 * Groups subjects by semester ID
 */
export const groupSubjectsBySemester = (subjects: JoinedSubject[]): SemesterSubjects => {
  if (!subjects || !Array.isArray(subjects)) {
    return {};
  }
  
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
  if (!semesterSubjects || Object.keys(semesterSubjects).length === 0) {
    return [];
  }
  
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
  if (!subjects || !Array.isArray(subjects)) {
    return 0;
  }
  
  return subjects.reduce((total, subject) => total + subject.credits, 0);
};

/**
 * Gets subjects statistics
 */
export const getSubjectsStats = (subjects: JoinedSubject[]) => {
  if (!subjects || !Array.isArray(subjects)) {
    return {
      total: 0,
      completed: 0,
      passed: 0,
      inProgress: 0,
      totalCredits: 0,
      completionRate: 0
    };
  }
  
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

  export const calculateFinalGrade = (assessments:JoinedSubjectAssessment[]) => {
    const validAssessments = assessments.filter(assessment => assessment.score !== undefined);
    if (validAssessments.length === 0) return 0;
    const totalWeightedScore = validAssessments.reduce((sum, assessment) => {
      return sum + (assessment.score! / assessment.maxScore) * assessment.weight;
    }, 0);

    return totalWeightedScore.toFixed(2);
  };
