export interface IOverviewDashboard{
    summary: {
        totalSubjects: number;
        totalCurricula: number;
        activeSubjectVersions: number;
        totalSyllabi: number;
    };
    approvalDistribution: {
        subjects: {
            pending: number;
            approved: number;
            rejected: number;
            total: number;
        };
        curricula: {
            pending: number;
            approved: number;
            rejected: number;
            total: number;
        };
        syllabi: {
            pending: number;
            approved: number;
            rejected: number;
            total: number;
        };
    };
    generatedAt: string;
}

export interface ISubjectOverView {
    subjectsByProgram: IProgramOverview[];
    creditDistribution: {
        oneToTwoCredits: number;
        threeToFourCredits: number;
        fivePlusCredits: number;
    };
    syllabusAvailability: {
        subjectsWithSyllabus: number;
        subjectsWithoutSyllabus: number;
        percentageWithSyllabus: number;
    };
    topSubjectsWithMostVersions: ITopSubjectsWithMostVersions[];
    generatedAt: string;
}

interface IProgramOverview {
    programCode: string;
    programName: string;
    subjectCount: number;
}
interface ITopSubjectsWithMostVersions{
    subjectCode: string;
    subjectName: string;
    versionCount: number;
}

export interface ICurriculumOverview {
    curriculaByProgram: curriculaByProgram[];
    averageSubjects: {
      average: number;
      minSubjects: number;
      maxSubjects: number;
    };
    sizeDistribution: {
      lessThan30Subjects: number;
      between30And50Subjects: number;
      moreThan50Subjects: number;
    };
    semesterCompleteness: {
      curriculaWithFullEightSemesters: number;
      totalCurricula: number;
      percentageComplete: number;
    };
    generatedAt: string;
  }

  interface curriculaByProgram {
    programCode: string;
    programName: string;
    curriculumCount: number;
  }

  interface newSubjects {
    id: number;
    subjectCode: string;
    subjectName: string;
    credits: number;
    createdBy: string;
    createdAt: string;
  }
  interface pendingSubjects {
    id: number;
    subjectCode: string;
    subjectName: string;
    credits: number;
    createdBy: string;
    createdAt: string;
  }

 export interface ISubjectActivityOverview {
 newSubjects: newSubjects[];
 pendingSubjects: (pendingSubjects & { daysPending?: number })[];
 generatedAt: string;
}


export interface IStudentSubjectActivityOverview {
  semesterId: number;
  semesterName: string;
  subjectsAttempted: number;
  subjectsPassed: number;
  creditsAttempted: number;
  creditsEarned: number;
  averageFinalScore: number;
  subjectCount: number; // For chart display
}

export interface IStudentPerformanceOverview {
    category: string;
    averageScore: number;
    totalWeight: number;
}