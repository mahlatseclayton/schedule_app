# Final Year Master Schedule Planner

Welcome to my personal scheduling application! I built this to manage the demanding workload of being a **final year university student**, balancing my academic studies, lab sessions, and part-time QA work. 

As a final year student, time management is everything. This application gives me a unified view of my entire week, mapping out exactly when I am working, when I am in class, and when I have dedicated "deep study" blocks.

## Key Features

- **Split Work Shifts:** Automatically adapts my 8-hour daily QA work target around my lectures and labs, even splitting shifts if necessary.
- **Commute Tracking:** Automatically ensures a perfect 15-minute gap between home-based work and on-campus classes to account for commute times.
- **Weekend Study Bias:** Adjusts my weekend schedule to prioritize deep study blocks for my school projects and weekly catchups, keeping my weekends highly productive but sustainable.
- **Admin Security:** My schedule is entirely PIN-protected, meaning I can safely share the link to this dashboard so others know my availability, without worrying about them editing or deleting my events.
- **Automated Email Reminders:** A background Node.js service sends me an email 15 minutes before any major event to ensure I never miss a class or a shift.

## Tech Stack

This project is fully custom-built and heavily optimized:
- **Frontend:** React + Vite, styled entirely with custom TailwindCSS for a premium, glassmorphic UI.
- **Backend:** Node.js Express server.
- **Database:** SQLite (persisted via `schedule.sqlite`).
- **Automation:** `node-cron` and `nodemailer` for the reminder system.

## Local Setup Instructions

1. **Backend Initialization:**
   ```bash
   cd backend
   npm install
   # Make sure you have a .env file with your email credentials and ADMIN_PIN
   node seed.js # To populate the initial timetable
   node server.js
   ```
2. **Frontend Initialization:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## CI/CD Deployment Guide

This project is configured with continuous deployment.

### Frontend (GitHub Pages)
1. Go to your repository **Settings** > **Pages**.
2. Set the Source to **GitHub Actions**.
3. Every push to the `main` branch will automatically build and deploy the frontend to `https://mahlatseclayton.github.io/schedule_app/`.

### Backend (Render)
1. Log in to [Render](https://render.com) and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add your **Environment Variables** in the Render dashboard:
   - `ADMIN_PIN`
   - `EMAIL_USER`
   - `EMAIL_PASS`
5. *(Optional but Recommended)* Render's free tier uses ephemeral storage, which wipes `schedule.sqlite` on every deployment. To prevent data loss on restarts, attach a persistent disk to the Render service.

> **Note:** To connect the Frontend to the Render Backend, add `VITE_API_URL=https://<your-render-url>/api/events` to your frontend's environment or directly in the repository secrets if using a custom build action.

## Workflow & Constraints
- Wake-up time is 6:00 AM on weekdays, allowing early-morning QA work.
- Strict 8-hour work constraints (Mon-Fri) mapped precisely around contact hours.
- Automatic routing of QA work to "Home" when adjacent to early morning classes or late-evening study sessions.
