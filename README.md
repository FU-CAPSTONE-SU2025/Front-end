# AISEA Front-End

Welcome to the Front-End repository of the AISEA project—an AI-based Academic Advisor for Software Engineering (SE) students at FPT University. Also known as AI-SEA.

---

## 📁 Project Structure

The main folders and files are organized as follows:

```
├── .github/            # GitHub workflows and issue templates
├── data/               # Mockup Data for development testing or and configuration files for import and structure
├── public/             # Static assets (images, favicon, etc.)
├── src/                # Source code for the application
│   ├── api/            # API integration logic
│   ├── assets/         # Local images, icons, etc.
│   ├── components/     # React components (UI & features)
│   ├── config/         # App configuration files
│   ├── contexts/       # React context providers
│   ├── css/            # Custom CSS styles
│   ├── datas/          # Data structures, mock data, etc.
│   ├── hooks/          # Custom React hooks
│   ├── interfaces/     # TypeScript interfaces and types
│   ├── pages/          # Page-level React components
│   ├── router/         # Routing configuration
│   ├── utils/          # Utility functions
│   ├── App.css         # Global App CSS
│   ├── App.tsx         # Main App component
│   ├── index.css       # Global styles
│   ├── main.tsx        # Entry point
│   ├── vite-env.d.ts   # Vite environment definitions
├── .dockerignore
├── .gitignore
├── Dockerfile          # Docker file to build the project into a Docker image
├── eslint.config.js
├── index.html
├── nginx.conf          # Nginx configuration to run inside Docker, serving SPA web
├── package-lock.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Installation Guide

### Local Installation (Development)

```bash
git clone https://github.com/FU-CAPSTONE-SU2025/Front-end.git
cd Front-end
npm install
npm start
```
Open your browser and go to [http://localhost:5173](http://localhost:5173)

---

### Docker Installation (Production or Testing)

1. Clone this repository:
    ```bash
    git clone https://github.com/FU-CAPSTONE-SU2025/Front-end.git
    cd Front-end
    ```
2. Ensure Docker CLI is installed. Open a terminal in the project folder.
3. Build the Docker image:
    ```bash
    docker build -t aisea -f ./Dockerfile .
    ```
4. Run the container:
    ```bash
    docker run -p 5173:80 -td aisea
    ```
5. Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## ✨ Features

- Modern React UI with TypeScript
- Modular code structure for maintainability
- Role-based access: Students, Advisors, Academic Staff, Managers, Admins
- Data import and configuration support
- Ready for CI/CD and cloud deployment (DigitalOcean, Vercel, Docker)
- Production-ready Nginx setup via `nginx.conf`

---

## 📝 Documentation

- Full documentation, requirements, and design details are available in the `/docs` folder or the project wiki.
- For backend/API details, see [AISEA Back-End](https://github.com/FU-CAPSTONE-SU2025/Back-end).

---

## 📧 Contact

For questions, support, or contributions, please open an issue or contact the project maintainers.

---

**Empowering SE students at FPT University with smart academic guidance.**
