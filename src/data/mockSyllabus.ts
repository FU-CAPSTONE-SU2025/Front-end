// Mock syllabus data for demo purposes
import { CompleteSyllabus } from '../interfaces/ISyllabus';

export const mockSyllabus: CompleteSyllabus = {
  id: 1,
  subject_id: 101,
  content: 'This course provides an overview of computer science, including algorithms, programming, and the basics of computer systems.',
  assessments: [
    { id: 1, syllabus_id: 1, category: 'Quiz', quantity: 1, weight: 10, completion_criteria: 'Complete Quiz 1', duration: 30, question_type: 'multiple-choice' },
    { id: 2, syllabus_id: 1, category: 'Final Exam', quantity: 1, weight: 40, completion_criteria: 'Pass Final Exam', duration: 120, question_type: 'essay' },
    { id: 3, syllabus_id: 1, category: 'Assignment', quantity: 2, weight: 20, completion_criteria: 'Submit assignments', duration: 60, question_type: 'project' },
    { id: 4, syllabus_id: 1, category: 'Assignment', quantity: 1, weight: 30, completion_criteria: 'Complete group project', duration: 90, question_type: 'presentation' },
  ],
  learningMaterials: [
    { id: 1, syllabus_id: 1, material_name: 'Textbook: Computer Science: An Overview', author_name: 'J. Glenn Brookshear', published_date: new Date('2020-01-01'), filepath_or_url: 'https://example.com/textbook', description: 'Main textbook for the course.' },
    { id: 2, syllabus_id: 1, material_name: 'Lecture Slides', author_name: 'Course Staff', published_date: new Date('2023-09-01'), filepath_or_url: 'https://example.com/slides', description: 'Slides for all lectures.' },
    { id: 3, syllabus_id: 1, material_name: 'Online Tutorials', author_name: 'Various', published_date: new Date('2022-05-10'), filepath_or_url: 'https://example.com/tutorials', description: 'Supplementary online tutorials.' },
  ],
  learningOutcomes: [
    { id: 1, syllabus_id: 1, outcome_code: 'LO1', description: 'Understand the fundamentals of algorithms and programming.' },
    { id: 2, syllabus_id: 1, outcome_code: 'LO2', description: 'Describe the basic components of a computer system.' },
    { id: 3, syllabus_id: 1, outcome_code: 'LO3', description: 'Apply problem-solving techniques to simple computational problems.' },
  ],
  sessions: [
    { id: 1, syllabus_id: 1, session_number: 1, topic: 'Introduction & History of Computing', mission: 'Lecture, Discussion' },
    { id: 2, syllabus_id: 1, session_number: 2, topic: 'Algorithms & Flowcharts', mission: 'Lecture, Lab' },
    { id: 3, syllabus_id: 1, session_number: 3, topic: 'Programming Basics', mission: 'Lecture, Coding Practice' },
    { id: 4, syllabus_id: 1, session_number: 4, topic: 'Data Types & Variables', mission: 'Lecture, Lab' },
    { id: 5, syllabus_id: 1, session_number: 5, topic: 'Control Structures', mission: 'Lecture, Coding Practice' },
    { id: 6, syllabus_id: 1, session_number: 6, topic: 'Functions & Procedures', mission: 'Lecture, Lab' },
    { id: 7, syllabus_id: 1, session_number: 7, topic: 'Midterm Review', mission: 'Review Session' },
    { id: 8, syllabus_id: 1, session_number: 8, topic: 'Computer Systems Overview', mission: 'Lecture, Discussion' },
    { id: 9, syllabus_id: 1, session_number: 9, topic: 'Operating Systems', mission: 'Lecture, Lab' },
    { id: 10, syllabus_id: 1, session_number: 10, topic: 'Networks & The Internet', mission: 'Lecture, Coding Practice' },
    { id: 11, syllabus_id: 1, session_number: 11, topic: 'Databases', mission: 'Lecture, Lab' },
    { id: 12, syllabus_id: 1, session_number: 12, topic: 'Project Presentations', mission: 'Student Presentations' },
  ],
}; 