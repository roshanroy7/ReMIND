# ReMind — Job Application Tracker

> Stop losing track. Never forget what you applied for.

**Live App:** [remind-ruby.vercel.app](https://remind-ruby.vercel.app)

---

## The Problem

You apply for 50 jobs. Emails pile up. You get a screening call and you're scrambling — which CV did I send? What role was it? When did I apply?

ReMind fixes that.

---

## What It Does

ReMind connects to your Gmail and automatically reads your job application emails. No manual logging. No spreadsheets. Just open the app and your entire job search is tracked.

When you get a screening call, you open ReMind, find the company, and your CV is right there attached to that application. You walk into every call prepared.

---

## How It Works

1. **Login with Google** — one click, secure OAuth
2. **Sync Gmail** — ReMind scans your inbox for application emails and pulls out the company name, role, and date automatically
3. **Auto-detection** — emails containing words like "unfortunately" or "regret to inform" are marked as Rejected. Emails with "screening" or "schedule a call" are marked as Interview. All automatically.
4. **Real-time notifications** — browser notification fires the moment a rejection or interview is detected
5. **Attach your CV** — upload your resume to each application so you always know which version you sent
6. **Dashboard** — clean view of everything. Applied, Interviews, Rejected — all in one place

---

## Features

- Google OAuth login (secure, no passwords stored)
- Gmail auto-sync — reads application confirmation emails
- Auto-detects rejections and interview requests from email content
- Browser push notifications on status changes
- Resume/CV upload per application (stored in Supabase Storage)
- Multi-page dashboard — Dashboard, Applied, Interviews, Rejected
- Search by company or role
- Manual add application option
- Real-time stats — Applied count, Interview count, Rejection count, Interview rate %

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, React Router |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Auth | Google OAuth 2.0 via Passport.js |
| Email | Gmail API (readonly) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## Running Locally

### Prerequisites
- Node.js
- A Google Cloud project with Gmail API enabled
- A Supabase project

### 1. Clone the repo
```bash
git clone https://github.com/roshanroy7/ReMIND.git
cd ReMIND
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
```

Start the server:
```bash
node index.js
```

### 3. Set up the frontend
```bash
cd client
npm install
npm start
```

### 4. Supabase setup

Create a table called `applications` with these columns:
```
id          int8 (primary key, auto increment)
created_at  timestamptz
company     text
role        text
date_applied text
status      text
cv_url      text
```

Create a Storage bucket called `resumes` and set it to public with an INSERT policy.

---

## Project Structure

```
ReMIND/
├── client/                 # React frontend
│   └── src/
│       ├── App.js          # Main app, sidebar, routing
│       ├── AddApplicationModal.js
│       └── pages/
│           ├── Dashboard.js
│           ├── Applications.js
│           ├── Interviews.js
│           └── Rejected.js
└── server/
    └── index.js            # Express backend, all routes
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/google` | Initiate Google OAuth |
| GET | `/auth/google/callback` | OAuth callback |
| GET | `/auth/user` | Get current user |
| GET | `/auth/logout` | Logout |
| GET | `/gmail/sync` | Sync Gmail emails |
| GET | `/applications` | Get all applications |
| POST | `/applications` | Add manual application |
| PATCH | `/applications/:id` | Update status |
| PATCH | `/applications/:id/cv` | Attach CV URL |

---

## Built By

Roshan Palem — MSc Computer Science, UCD  
[LinkedIn](https://linkedin.com/in/roshan-palem-474979239) · [GitHub](https://github.com/roshanroy7)
