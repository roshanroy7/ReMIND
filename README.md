# ReMind — Job Application Tracker

> I built this because I needed it.

**Live:** [remind-ruby.vercel.app](https://remind-ruby.vercel.app) · **Built by:** [Roshan Palem](https://linkedin.com/in/roshan-palem-474979239)

---

## Why I Built This

I was applying to 50+ jobs. Emails everywhere. I'd get a screening call and panic — which CV did I send? What role was it? When did I apply?

No spreadsheet was going to fix that. So I built ReMind.

ReMind connects to your Gmail and automatically tracks every job application you send. No manual logging. No copy-pasting. The moment you get a confirmation email, it's in your dashboard. When a rejection comes in, it's auto-detected. When you get a screening call, your CV is right there attached and ready.

I use this every day while job hunting. It's not a tutorial project. It's a real tool that solves a real problem.

---

## What I Built

### Auto Gmail Sync
ReMind reads your Gmail using the Gmail API. When you hit Sync, it scans your inbox for job-related emails, extracts the company name, role, and date, and adds them to your dashboard automatically.

### Smart Status Detection
The backend analyses each email's content. If it finds words like "unfortunately" or "regret to inform" — it marks the application as Rejected. If it finds "screening", "schedule a call", or "next steps" — it marks it as Interview. All automatic, no clicking required.

### Real-Time Notifications
The moment a rejection or interview is detected during a sync, a browser notification fires. You know immediately without even looking at the app.

### CV Attachment
You can attach your CV to each application. So when a recruiter calls, you open ReMind, find the company, and instantly see which version of your resume you sent them. No more scrambling.

### Live Dashboard
Clean multi-page dashboard showing your full job search at a glance — Applied, Interviews, Rejected, and your overall interview rate. Built with React Router so each section is its own page.

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

## How It Works — Under The Hood

1. User logs in via **Google OAuth**. The access token is stored in localStorage and sent with every API request.
2. On sync, the **Express backend** queries the Gmail API for emails matching job-related keywords.
3. Each email is fetched in full format. The subject and snippet are scanned for rejection and interview keywords.
4. Results are stored in **Supabase PostgreSQL**. Duplicate prevention runs before every insert.
5. CV uploads go directly from the browser to **Supabase Storage** using the public anon key. The public URL is saved to the database.
6. The **React frontend** fetches data on load and after every sync, keeping the dashboard live.

---

## Project Structure

```
ReMIND/
├── client/                 # React frontend
│   └── src/
│       ├── App.js          # Main app, sidebar, routing, auth
│       ├── AddApplicationModal.js
│       └── pages/
│           ├── Dashboard.js      # Stats, interview rate, recent activity
│           ├── Applications.js   # All applied jobs + CV upload
│           ├── Interviews.js     # Interview stage applications
│           └── Rejected.js       # Auto-detected rejections
└── server/
    └── index.js            # Express backend — all routes, Gmail sync, auth
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/google` | Initiate Google OAuth |
| GET | `/auth/google/callback` | OAuth callback |
| GET | `/auth/user` | Get current user |
| GET | `/auth/logout` | Logout |
| GET | `/gmail/sync` | Sync Gmail, detect status |
| GET | `/applications` | Fetch all applications |
| POST | `/applications` | Add manual application |
| PATCH | `/applications/:id` | Update application status |
| PATCH | `/applications/:id/cv` | Attach CV to application |

---

## Running Locally

```bash
git clone https://github.com/roshanroy7/ReMIND.git
cd ReMIND

# Backend
cd server
npm install
# Add .env with SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL
node index.js

# Frontend
cd ../client
npm install
npm start
```

---

*MSc Computer Science, University College Dublin*
