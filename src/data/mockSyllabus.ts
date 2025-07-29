// Mock syllabus data for demo purposes
import { Syllabus } from '../interfaces/ISchoolProgram';

export const mockSyllabus: Syllabus = {
  id: 1,
  subjectVersionId: 1, // Added to fix TS error
  content: 'This course provides an overview of computer science, including algorithms, programming, and the basics of computer systems.',
  assessments: [
    { id: 1, syllabusId: 1, category: 'Quiz', quantity: 1, weight: 10, completionCriteria: 'Complete Quiz 1', duration: 30, questionType: 'multiple-choice' },
    { id: 2, syllabusId: 1, category: 'Final Exam', quantity: 1, weight: 40, completionCriteria: 'Pass Final Exam', duration: 120, questionType: 'essay' },
    { id: 3, syllabusId: 1, category: 'Assignment', quantity: 2, weight: 20, completionCriteria: 'Submit assignments', duration: 60, questionType: 'project' },
    { id: 4, syllabusId: 1, category: 'Assignment', quantity: 1, weight: 30, completionCriteria: 'Complete group project', duration: 90, questionType: 'presentation' },
  ],
  learningMaterials: [
    { id: 1, syllabusId: 1, materialName: 'Textbook: Computer Science: An Overview', authorName: 'J. Glenn Brookshear', publishedDate: new Date('2020-01-01'), filepathOrUrl: 'https://example.com/textbook', description: 'Main textbook for the course.' },
    { id: 2, syllabusId: 1, materialName: 'Lecture Slides', authorName: 'Course Staff', publishedDate: new Date('2023-09-01'), filepathOrUrl: 'https://example.com/slides', description: 'Slides for all lectures.' },
    { id: 3, syllabusId: 1, materialName: 'Online Tutorials', authorName: 'Various', publishedDate: new Date('2022-05-10'), filepathOrUrl: 'https://example.com/tutorials', description: 'Supplementary online tutorials.' },
  ],
  learningOutcomes: [
    { id: 1, syllabusId: 1, outcomeCode: 'LO1', description: 'Understand the fundamentals of algorithms and programming.' },
    { id: 2, syllabusId: 1, outcomeCode: 'LO2', description: 'Describe the basic components of a computer system.' },
    { id: 3, syllabusId: 1, outcomeCode: 'LO3', description: 'Apply problem-solving techniques to simple computational problems.' },
  ],
  sessions: [
    { id: 1, syllabusId: 1, sessionNumber: 1, topic: 'Introduction & History of Computing', mission: 'Lecture, Discussion' },
    { id: 2, syllabusId: 1, sessionNumber: 2, topic: 'Algorithms & Flowcharts', mission: 'Lecture, Lab' },
    { id: 3, syllabusId: 1, sessionNumber: 3, topic: 'Programming Basics', mission: 'Lecture, Coding Practice' },
    { id: 4, syllabusId: 1, sessionNumber: 4, topic: 'Data Types & Variables', mission: 'Lecture, Lab' },
    { id: 5, syllabusId: 1, sessionNumber: 5, topic: 'Control Structures', mission: 'Lecture, Coding Practice' },
    { id: 6, syllabusId: 1, sessionNumber: 6, topic: 'Functions & Procedures', mission: 'Lecture, Lab' },
    { id: 7, syllabusId: 1, sessionNumber: 7, topic: 'Midterm Review', mission: 'Review Session' },
    { id: 8, syllabusId: 1, sessionNumber: 8, topic: 'Computer Systems Overview', mission: 'Lecture, Discussion' },
    { id: 9, syllabusId: 1, sessionNumber: 9, topic: 'Operating Systems', mission: 'Lecture, Lab' },
    { id: 10, syllabusId: 1, sessionNumber: 10, topic: 'Networks & The Internet', mission: 'Lecture, Coding Practice' },
    { id: 11, syllabusId: 1, sessionNumber: 11, topic: 'Databases', mission: 'Lecture, Lab' },
    { id: 12, syllabusId: 1, sessionNumber: 12, topic: 'Project Presentations', mission: 'Student Presentations' },
  ],
}; 