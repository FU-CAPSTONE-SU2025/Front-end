# AISEA Front-End: AI-Based Academic Advisor for SE Students at FPT University

Welcome to the **AISEA Front-End** repository—a modern, responsive web application built for the [AISEA project](https://github.com/FU-CAPSTONE-SU2025), supporting Software Engineering (SE) students at FPT University with AI-powered academic advising.

---

## 🚀 Project Overview

**AISEA** (AI-based Academic Advisor for SE students at FPT University) is a smart, interactive platform that helps SE students:
- Personalize their learning paths
- Optimize course selections and combos
- Track progress and GPA
- Receive tailored advice using AI

This repository contains the **client-side application**—developed with modern web technologies—to deliver a seamless, intuitive user experience.

---

## 🛠️ Tech Stack

- **Framework:** React (with TypeScript) <!-- or Angular, update as needed -->
- **Languages:** TypeScript, JavaScript, HTML5, CSS3
- **State Management:** Redux Toolkit (or Context API, if used)
- **Styling:** CSS Modules, SCSS, or styled-components (adapt to your setup)
- **API Integration:** Axios (RESTful API communication)
- **Authentication:** JWT-based (with support for role-based access)
- **Testing:** Jest, React Testing Library (if applicable)
- **CI/CD:** GitHub Actions (for automated testing and deployments)
- **Containerization/Deployment:** Docker, AWS (if applicable)
- **AI Integration:** Gemini AI, Google Agent Dev Kit (as part of the backend)

---

## ✨ Key Features

- **Interactive Dashboard:** See your academic progress, goals, and deadlines at a glance.
- **AI-Powered Combo Selection:** Get personalized suggestions for specialization combos (e.g., AI, Web, IoT) based on your interests and transcript.
- **Smart Semester Planning:** Receive balanced course recommendations tailored to graduation and GPA targets.
- **Course-Specific Study Tips:** Access AI-generated learning strategies for each subject using integrated syllabus data.
- **GPA Calculator & Tracker:** Visualize your academic standings and simulate outcomes.
- **Data Integration:** Securely import data from FPTU Academic Portal and Learning Material System.
- **Role-Based Access:** Distinct interfaces for Students, Advisors, Academic Staff, Managers, and Admins.
- **Responsive Design:** Optimized for desktop and mobile devices.

---

## 👥 User Roles

| Role           | Description                                                      |
|----------------|------------------------------------------------------------------|
| **Student**    | Personalized support, planning, and actionable advice.           |
| **Advisor**    | Academic guidance with AI-driven suggestions.                    |
| **Academic Staff** | Data management and support.                                 |
| **Manager**    | Program oversight and analytics.                                 |
| **Admin**      | Account management and system configuration.                     |

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/FU-CAPSTONE-SU2025/Front-end.git
cd Front-end
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Run the Application

```bash
npm start
# or
yarn start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔗 Environment Configuration

- Set up environment variables in `.env` for API endpoints, authentication, and third-party integrations.
- Ensure connection to the AISEA backend API for full functionality.

---

## 🧩 Project Structure

```
/src
  /components
  /pages
  /services
  /store
  /assets
  /utils
  App.tsx
  index.tsx
```

---

## 📄 Documentation & Deliverables

- User Requirements, SRS, System Design, and API docs are available in the `/docs` directory or [project wiki](https://drive.google.com/drive/u/1/folders/1Z9PZd7Un842QkpQYVt6cMeUGcW2ZJDjd).
- For backend/API details, see [AISEA-Back-End](https://github.com/FU-CAPSTONE-SU2025/Back-end).


---

## 📧 Contact

For questions or support, open an issue or contact the development team at [blazehendrix007@gmail.com].

---

**AISEA Front-End** — Empowering SE students at FPT University with smart academic guidance.
