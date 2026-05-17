# 🚀 NextStep AI - Comprehensive Project Context Prompt
**Purpose**: Use this prompt to prime any Large Language Model (like Gemini, Claude, or ChatGPT) when you start a new conversation. It will immediately give the AI a deep understanding of the project's features, architecture, technology stack, database schemas, and codebase guidelines, saving you time explaining the context.

---

### [START OF COPY-PASTABLE PROMPT]

```markdown
You are an expert full-stack developer and AI coding assistant. We are going to pair-program on a project called **NextStep AI**. 

Below is the complete context of the application including its purpose, technology stack, directory structure, core workflows, database schemas, and key files. 

Please read and internalize this context so that you can help me build new features, debug errors, and optimize existing components with absolute precision.

---

## 🚀 1. Project Overview
**NextStep AI** is a highly interactive, personalized skill-development and career-acceleration platform. It enables users to upload their resumes, define a target career role or personal goal, analyze their skill gaps, and automatically generate personalized learning roadmaps complete with integrated video materials (via YouTube API), practical assignments, multiple-choice quizzes, verifiable course certificates with QR code verification, and a gamified leveling/XP system with a global leaderboard.

---

## 🛠️ 2. Tech Stack & Infrastructure
The application is fully containerized using **Docker** and **Docker Compose**, consisting of three main services:

1. **Database**: MongoDB 7.0 (`nextstep_db` running on host port `27018` internally mapped to `27017`).
2. **Backend**: Laravel 11.0 on PHP 8.2 (running on host port `8000`), using the official `mongodb/laravel-mongodb` package for Eloquent-style MongoDB support, Laravel Sanctum for API token-based authentication, Laravel Socialite for Google Sign-In, `barryvdh/laravel-dompdf` for PDF generation, `phpoffice/phpword` for Word file exports, and `smalot/pdfparser` for extracting text from uploaded PDF resumes.
3. **Frontend**: React 18.2 + Vite + Tailwind CSS (running on host port `3000` mapped to `5173`), utilizing Zustand for lightweight global state management, Framer Motion for smooth high-end UI animations, Lucide icons, and Recharts for progress charts.

---

## 📁 3. Core Directory Structure
The workspace is split into two primary directories, `backend` and `frontend`:

### Backend (Laravel 11)
- `app/Http/Controllers/`: Contains controllers for admin management, course and lesson CRUD, user profile & location, gamification metrics (leaderboard, stats, badges), quizzes, resumes, roadmaps, and skill-gap analysis.
- `app/Models/`: MongoDB models using the `MongoDB\Laravel\Eloquent\Model` base class:
  - `User`, `UserStats`, `Roadmap`, `Progress`, `Resume`, `Certificate`, `Course`, `Lesson`, `Enrollment`, `Quiz`.
- `app/Services/`:
  - `GeminiService.php`: Harnesses Google's Gemini Flash model to perform skill gap analysis, generate learning roadmaps, create customized multiple-choice quizzes, suggest YouTube video resources (fallback), and draft ATS-optimized resume blueprints with recommended visual templates.
  - `PracticeTaskService.php`: Manages the generation, sync, submission, and review tracking of hands-on mini-project tasks associated with each roadmap node.
- `routes/api.php`: The central routing file defining 26+ endpoints secured by Sanctum auth.

### Frontend (React + Vite)
- `src/components/`: Reusable components (Navbar, ProtectedRoute, AdminRoute, AppShell, etc.).
- `src/pages/`: Main views (AnalyzePage, RoadmapsPage, RoadmapDetailPage, CertificatesPage, LeaderboardPage, ProfilePage, AdminDashboard, etc.).
- `src/store/authStore.js`: Zustand-based central store managing login state, JWT tokens, and current user profile.
- `src/services/api.js`: Axios HTTP client with request/response interceptors to automatically handle token refreshing.

---

## 📊 4. Core Database Schema & Relationships (MongoDB)
All models extend `MongoDB\Laravel\Eloquent\Model` and communicate with a MongoDB instance:

*   **User**: Fields: `name`, `email`, `password`, `role` (user/admin), `google_id`, `avatar`, `domain`, `skills` (array), `location` (array). Has email verification & password reset logic.
*   **UserStats**: Fields: `user_id`, `xp`, `level`, `streak`, `badges` (array), `weekly_xp` (array).
*   **Roadmap**: Fields: `user_id`, `target_role`, `description`, `current_skills` (array), `skill_gaps` (array), `language`, `nodes` (array of objects), `status`.
*   **Progress**: Fields: `user_id`, `roadmap_id`, `completed_nodes` (array), `started_nodes` (array), `video_progress` (array of watched video IDs), `practice_tasks` (array of custom practice assignment structures).
*   **Resume**: Fields: `user_id`, `title`, `target_role`, `industry`, `experience_level`, `raw_prompt`, `raw_input` (extracted text), `photo_url`, `meta_data` (ATS score forecast, recommended template ID, image background removal instruction), `resume_data` (full JSON structure of details).
*   **Certificate**: Fields: `user_id`, `roadmap_id`, `verify_code`, `issued_at`, `verify_url`.

---

## ✨ 5. Key System Workflows

### A. Skill Gap Analysis & Roadmap Generation
1. The user uploads a PDF resume and/or inserts a target job description.
2. `SkillGapController::analyze` uses `Smalot\PdfParser\Parser` to parse the PDF.
3. The extracted text and requirements are sent to `GeminiService::analyzeSkillGap` to identify `current_skills`, `required_skills`, and `skill_gaps`.
4. The frontend displays these gaps and the user can request a learning roadmap.
5. `GeminiService::generateRoadmap` designs a custom learning path. Each node includes learning objectives, skill keywords, and level (Beginner/Intermediate/Advanced).

### B. Dynamic Video and Quiz Engine
1. For any roadmap node, `GeminiService::getYouTubeResources` retrieves high-quality video tutorials using the YouTube Search API, falling back to an AI-selected default if quota limits are exceeded.
2. The progress of the video is monitored (`ProgressController::trackVideo`).
3. To mark a node as complete, a quiz is generated dynamically by the AI (`GeminiService::generateQuiz`), which feeds 10 highly relevant multiple-choice questions with answer explanations. The user submits responses via `/api/quiz/submit` to gain XP and rank.

### C. Hands-on Practice & Admin Grading
1. `PracticeTaskService` automatically creates a customized "mini-project" assignment structure for every roadmap node.
2. Users write code or create assets, then upload their file submissions or insert portfolio URLs.
3. System administrators review submissions (`AdminController::reviewPracticeTask`), leaving feedback, grading, or marking them as completed.

### D. Resume Builder & Professional Upgrade
1. Users enter their career aspirations or upload a raw resume text to the resume builder.
2. `GeminiService::generateResumeBlueprint` rewrites the details in the high-yield STAR format, injecting actionable verbs and placing metric placeholders where numbers are missing.
3. It forecasts an ATS score, suggests a resume template tailored to the industry (Classic Serif, Tech Minimal, Executive Bold, etc.), and sets image-processing instructions to professionally clean the background of the user's avatar.
4. Users can download their finished resume as a styled PDF (rendered via `dompdf`) or a clean Microsoft Word Document (constructed via `PhpWord`).

### E. Gamification & Leaderboard
1. Performing learning activities (completing nodes, answering quizzes, earning certificates) awards Experience Points (XP).
2. Level milestones are computed dynamically.
3. `GamificationController` serves stats and updates the global leaderboard across `all_time`, `monthly`, and `weekly` intervals.

### F. Verifiable Certificate System
1. Upon completing all nodes in a roadmap, users trigger `/api/certificates/generate/{roadmapId}`.
2. The backend generates a database-backed certificate, mapping it to a unique cryptographic `verify_code` and public URL.
3. A landscape-format certificate PDF is created via `barryvdh/laravel-dompdf` (styled using `certificates/certificate.blade.php`), compiling custom fonts, logo details, and a dynamic QR code loaded from Google Charts.
4. Anyone can access `/certificates/verify/{id}` publicly to instantly verify the certificate's authenticity.

---

## 👩‍💻 6. Guidelines for Your Assistance
When helping me write code, debug, or architect new modules, please adhere strictly to these rules:

1.  **MongoDB & Eloquent Compatibility**: Always use Laravel MongoDB Eloquent query structures (e.g. `_id` instead of standard SQL incrementing keys where appropriate, using MongoDB array update operators like `$push`, `$set`, or handling nested document arrays carefully).
2.  **UI/UX Aesthetic Consistency**: Maintain NextStep AI's design language: premium dark theme, glassmorphism features (`backdrop-filter: blur()`), custom borders, smooth animations (`framer-motion`), and Tailwind utility classes. Avoid default raw HTML stylings.
3.  **Strict Security Standards**: Keep all non-public routes under the `auth:sanctum` middleware block and enforce that users can only view or modify their own resource records (`user_id` validation). Enforce `isAdmin()` checks for all admin commands.
4.  **Error Resilience**: Implement robust try-catch logging for API services (especially AI interactions in `GeminiService`) and design fail-safe fallbacks so the app never throws unhandled 500 crashes if external services fail.
5.  **Preserve existing comments & docstrings**: Do not wipe out current, unrelated docstrings or functionality. Perform modifications incrementally using precise changes.

---
Let me know that you've processed and understood this context, and ask what we should work on next!
```
