AI-Based Academic Advisor for SE Students at FPT University (AISEA)
Project Overview

Class: Software Engineering (SE)
Duration: May 2025 to August 2025
Profession: Software Engineer
Specialty: Software Engineering
Register Types: Lecturer, Students
Project Name:
English: AI-Based Academic Advisor for SE Students at FPT University
Vietnamese: Hệ thống cố vấn học tập dựa trên AI dành cho sinh viên ngành Kỹ thuật phần mềm tại Đại học FPT
Abbreviation: AISEA



Context
FPT University promotes advanced technologies in education, but Software Engineering (SE) students face challenges in managing their academic roadmap, including:

Navigating the Program (training program), Curriculum (standardized structure), Combos (subject groupings for specialization), and individual Subjects.
Aligning studies with graduation requirements, GPA optimization, and career goals.
Current systems (e.g., FPT Academic Portal, Learning Material System) provide static data but lack personalized advisory features.

Proposed Solution
AISEA is a smart academic assistant designed to support personalized learning paths and decision-making for SE students at FPT University. It integrates with existing systems to provide tailored guidance.
Key Features

AI-Powered Combo Advising: Suggests specialization combos (e.g., AI, Web, IoT) based on student interests and academic history.
Semester Planning Assistant: Recommends subject combinations with balanced workload.
Course-Specific Study Tips: Generates tips from syllabus and learning materials.
GPA Calculator and Transcript Tracker: Tracks academic progress visually.
Data Integration: Extracts and imports data from FPTU Academic Portal and Learning Material System.
Personalized Dashboard: Displays progress, goals, and deadlines.

Actors



Actor
Role Description



Student
Primary user receiving personalized academic support.



- Views learning roadmap based on Curriculum.



- Receives AI-based suggestions for Combos and subjects.



- Plans semester schedules and subject combinations.



- Gets course-specific learning strategies using Syllabus data.



- Calculates GPA, tracks progress, and receives deadline alerts.



- Explores course details, prerequisites, and outcomes.



- Interacts with advisors or requests feedback.


Advisor
Provides direct academic advising.



- Accesses student profiles and academic trajectories.



- Recommends combos and strategies based on performance.



- Provides manual guidance with AI support.



- Assesses appropriateness of course selections.


Academic Staff
Supports academic data operations and student records.



- Updates academic records (GPA, transcripts, registrations).



- Inputs or edits Subject and Syllabus data.



- Assigns or approves specialization Combos.



- Assists in academic advising when needed.


Manager
Oversees program structure, curricula, and combos.



- Manages Programs, Curricula, and Combos.



- Monitors academic trends and combo selections across cohorts.



- Approves or updates subject groups and curriculum changes.



- Accesses analytics on student performance and program decisions.


Admin
Manages system access, configuration, and integration.



- Manages users (create, update, delete accounts).



- Configures system and integrates external APIs.



- Monitors activity logs and system performance.


Non-Functional Requirements

API Consistency & Compatibility: Use RESTful API standards for client-server communication.
Role-Based Access Control: Restrict features by user role (e.g., Admin, Advisor) to enhance security.

System Requirements and Deliverables
Theory and Practice (Documentation)
Complete software development lifecycle documentation using UML 2.0, including:

User Requirements Document (URD)
Software Requirements Specification (SRS)
Software Architecture Document (SAD)
Detailed Design Document (DDD)
Implementation Documentation
Test Documentation
Installation Guide
Source Code Documentation
Deployment Package Documentation

Server-Side Technologies

Server: .NET Core
Database: SQL Server, MySQL Server, PostgreSQL, or MongoDB
Authentication: JSON Web Tokens (JWT)
Deployment: Docker/AWS for containerization
Third-Party Services: Gemini AI, Google Agent Dev Kit, or similar

Client-Side Technologies

Framework: React or Angular for web application
Technologies: HTML5, CSS3, TypeScript, ReactJS/Angular

Program Components

RESTful API: Supports all client-server communication.
Web App: Interface for admin and users.
AI Chatbot: Provides interactive academic advising.

