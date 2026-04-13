# 🦷 DentaCare — Dental Appointment Portal

Full-stack dental clinic portal with patient login, appointment booking, prescription management, and admin panel.

---

## 🗂️ Project Structure

```
dentist-portal/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── AdminSidebar.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx       ← handles login/logout globally
│   ├── lib/
│   │   └── supabase.js           ← DB client + SQL schema (read comments!)
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── PatientPortal.jsx
│   │   ├── BookAppointment.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminAppointments.jsx
│   │   ├── AdminPatients.jsx
│   │   └── AdminPrescriptions.jsx
│   ├── index.css
│   └── main.jsx                  ← routes + app entry
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

---

## 🚀 Setup in 3 Steps

### STEP 1 — Supabase Setup (5 min)

1. Go to **https://supabase.com** → Create free account
2. Click **"New Project"** → give it a name (e.g. dentacare)
3. Wait for it to start (~1 min)
4. Go to **SQL Editor** (left sidebar)
5. Copy ALL the SQL from `src/lib/supabase.js` (inside the big comment block)
6. Paste and click **Run** ✅
7. Go to **Settings → API**
8. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

---

### STEP 2 — Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Paste your Supabase keys in .env
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...

# 4. Start dev server
npm run dev

# Open http://localhost:5173
```

---

### STEP 3 — Deploy on Vercel (FREE, 2 min)

1. Push your project to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   # create repo on github.com then:
   git remote add origin https://github.com/YOUR_USERNAME/dentist-portal.git
   git push -u origin main
   ```

2. Go to **https://vercel.com** → Sign in with GitHub
3. Click **"Add New Project"** → Import your repo
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy** ✅

Your site will be live at `https://your-project.vercel.app` 🎉

---

## 👤 Creating Admin Account

After deploying, to make someone an admin:

1. Register normally on the website
2. Go to **Supabase → Table Editor → profiles**
3. Find the user row
4. Change `role` from `patient` to `admin`
5. That user can now access `/admin`

---

## ✅ Features

| Feature | Details |
|---|---|
| Patient Register/Login | Supabase Auth (JWT) |
| Patient Portal | Appointments history + prescriptions |
| Book Appointment | Calendar, time slots, doctor selection |
| Slot conflict check | Taken slots auto-blocked per doctor |
| Admin Dashboard | Stats, today's appointments |
| Admin Appointments | View all, mark complete/cancel |
| Admin Patients | View all registered patients |
| Admin Prescriptions | Add prescriptions linked to visits |
| Row Level Security | Patients see ONLY their own data |
| Responsive | Works on mobile + desktop |

---

## 🛠️ Tech Stack (all FREE)

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Routing | React Router v6 |
| Styling | Custom CSS (no framework) |
| Backend + DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel |
| Notifications | react-hot-toast |
