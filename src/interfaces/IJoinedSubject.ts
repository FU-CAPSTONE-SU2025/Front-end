export interface IJoinedSubjectByCode {
  id: number;
  createdAt: string;
  githubRepositoryURL: string;
  subjectCode: string;
  subjectVersionCode: string;
  name: string;
  semesterName: string;
  isPassed: boolean;
  isActive: boolean;
  credits: number;
  studentProfileId: number;
  semesterStudyBlockType: number;
  semesterId: number;
}
