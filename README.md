# 🎓 IAPAS — Intelligent Academic Process Automation System

> **What is IAPAS?**
> IAPAS is a smart school management web app where **students** can check their attendance and marks, **teachers** can record grades and take attendance, and **admins** can manage the whole system — all in one place.
> It also uses **AI (machine learning)** to predict what grade a student is likely to get before exams, so teachers can help struggling students early.

---

## 📋 Table of Contents

1. [What You Need Before Starting](#-what-you-need-before-starting)
2. [Step 1 — Install & Start XAMPP (Database)](#-step-1--install--start-xampp-database)
3. [Step 2 — Start the Backend (Brain of the App)](#-step-2--start-the-backend-brain-of-the-app)
4. [Step 3 — Load the Sample Data](#-step-3--load-the-sample-data-first-time-only)
5. [Step 4 — Start the Frontend (The Website)](#-step-4--start-the-frontend-the-website)
6. [First Login — Test Accounts](#-first-login--test-accounts)
7. [Features by Role](#-features-by-role)
8. [Does My Data Save Permanently?](#-does-my-data-save-permanently)
9. [Troubleshooting Common Problems](#-troubleshooting-common-problems)
10. [Pushing to GitHub](#-pushing-to-github)
11. [Easy Update Script](#-easy-update-script-push-with-one-click)
12. [Tech Stack](#-tech-stack-for-developers)

---

## 🧰 What You Need Before Starting

Before you begin, make sure you have these **4 programs installed** on your computer. If you are not sure, just click the links to download them.

| # | Program | Why You Need It | Download |
|---|---------|----------------|----------|
| 1 | **XAMPP** | Runs the MySQL database (where all data is stored) | [apachefriends.org](https://www.apachefriends.org) |
| 2 | **Python 3.10 or newer** | Runs the backend server | [python.org/downloads](https://www.python.org/downloads) |
| 3 | **Node.js (LTS version)** | Runs the frontend website | [nodejs.org](https://nodejs.org) |
| 4 | **VS Code** *(recommended)* | A nice code editor with a built-in terminal | [code.visualstudio.com](https://code.visualstudio.com) |

> ⚠️ **During Python installation:** Check the box that says **"Add Python to PATH"** before clicking Install. This is the most common mistake people make.

---

## 🗄️ Step 1 — Install & Start XAMPP (Database)

The database is like the filing cabinet for all student data. XAMPP gives you MySQL for free.

**1a. Open the XAMPP Control Panel.**

**1b. Click "Start" next to both Apache and MySQL.**

> ✅ You should see green "Running" status for both.

**1c. Create the database.**

- Click the **"Admin"** button next to MySQL. This opens phpMyAdmin in your browser.
- Click **"New"** in the left sidebar.
- Type `iapas_db` as the database name and click **"Create"**.

> 🎉 Your database is ready! You only need to do this once.

---

## ⚙️ Step 2 — Start the Backend (Brain of the App)

The backend is the Python server that handles all the logic — logins, AI predictions, saving data.

**Open a terminal** (in VS Code: press `` Ctrl + ` ``) and run these commands **one by one**:

```bash
# Go into the backend folder
cd "backend"

# Create a virtual environment (only needed the first time)
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate
```

> ✅ You should see `(venv)` appear at the start of your terminal line. This means it worked.

```bash
# Install all required Python packages (only needed the first time)
pip install -r requirements.txt

# Start the backend server
venv\Scripts\uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

> ✅ **Success looks like:** `Uvicorn running on http://0.0.0.0:8000`

> 🛑 **Keep this terminal window open.** The server stops if you close it.

The backend is now running at: **http://localhost:8000**
You can also explore all API endpoints at: **http://localhost:8000/docs**

---

## 🌱 Step 3 — Load the Sample Data (First Time Only)

This step fills the database with 14 test users, 1,500 attendance records, and 250 marks entries so you can see the app working immediately.

**Open a second terminal** (or a new tab in VS Code) and run:

```bash
cd "backend"
venv\Scripts\activate
venv\Scripts\python seed.py
```

> ✅ **Success looks like:** A list of messages saying students, subjects, marks, and attendance were created.

> ⚠️ Only run this once. Running it again will try to add duplicate data.

---

## 🌐 Step 4 — Start the Frontend (The Website)

The frontend is the actual website you see and click on.

**Open a third terminal** and run:

```bash
cd "frontend"

# Install website packages (only needed the first time)
npm install

# Start the website
npm run dev
```

> ✅ **Success looks like:** `Local: http://localhost:5173`

Now open your browser and go to: **http://localhost:5173**

> 🛑 **Keep this terminal window open too.** The website stops if you close it.

---

## 🔐 First Login — Test Accounts

When you first open the app, use one of these accounts to log in:

| Role | Email | Password | What You Can Do |
|------|-------|----------|----------------|
| 👑 **Admin** | `admin@iapas.edu` | `Admin@123` | Manage all users, see system-wide reports |
| 👩‍🏫 **Faculty** | `anita.sharma@iapas.edu` | `Faculty@123` | Mark attendance, add marks, view analytics |
| 🎓 **Student** | `aarav.mehta@student.iapas.edu` | `Student@123` | View attendance, marks, AI grade prediction |

**More test accounts:**
- Extra faculty: `rajesh.kumar@iapas.edu` and `priya.nair@iapas.edu` (password: `Faculty@123`)
- All 10 student accounts follow the pattern `firstname.lastname@student.iapas.edu` (password: `Student@123`)

---

## ✨ Features by Role

### 🎓 Student
- **Dashboard** — See your overall attendance %, average marks, and your AI-predicted grade at a glance
- **Attendance** — View a subject-by-subject breakdown with colour-coded status (green = good, red = at risk)
- **Marks** — See all your exam results (internal, external, assignments) in a detailed table with charts
- **AI Insights** — Get a machine-learning prediction of your likely final grade, plus study tips
- **Profile** — View your account and academic details

### 👩‍🏫 Faculty
- **Dashboard** — See class-wide stats: how many students are passing, grade distribution charts, top and struggling students
- **Mark Attendance** — Take attendance for your class with one click per student
- **Add Marks** — Enter exam scores for any student and subject
- **Student Analytics** — Deep-dive charts comparing students side by side

### 👑 Admin
- **Dashboard** — System-wide overview: total users, average marks, all charts
- **User Management** — Create new student/faculty/admin accounts, search, filter, and delete users
- **Reports** — Full attendance and performance reports for all subjects

---

## 💾 Does My Data Save Permanently?

**Yes — absolutely.** Every action you take in the UI (marking attendance, adding marks, creating a user) sends a request to the FastAPI backend, which immediately writes the data to your **MySQL database** on your computer.

- The data lives in the `iapas_db` database in XAMPP's MySQL.
- You can verify this yourself: after marking attendance, open **phpMyAdmin** (`http://localhost/phpmyadmin`), click `iapas_db` → `attendance`, and you'll see your new row.
- The data **persists between restarts** — even if you stop and restart the backend and frontend, your data is still there in MySQL.
- React state (in the browser) is only a temporary display layer. The source of truth is always the MySQL database.

---

## 🔧 Troubleshooting Common Problems

### ❌ "Port 3306 already in use" (MySQL won't start)
Another program is using the database port.
- Open **Task Manager** → find any process named `mysqld.exe` → End Task.
- Then click Start in XAMPP again.
- Or change the MySQL port to `3307` in XAMPP config (advanced users).

### ❌ "'python' is not recognized as a command"
Python was installed but not added to PATH.
- **Fix:** Uninstall Python, then reinstall it. On the first screen of the installer, check the box **"Add Python to PATH"** before clicking Install.
- Then close and reopen your terminal.

### ❌ "'pip' is not recognized" or "pip install fails"
- Make sure your venv is activated (you should see `(venv)` in the terminal).
- Try: `python -m pip install -r requirements.txt`

### ❌ "venv\Scripts\activate is not recognized"
You might be using PowerShell instead of Command Prompt.
- In VS Code, click the `+` dropdown in the terminal and select **"Command Prompt"** instead of PowerShell.
- Or run this in PowerShell first: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

### ❌ Backend starts but frontend shows blank page or "Network Error"
- Make sure **both** the backend (`port 8000`) **and** frontend (`port 5173`) are running at the same time.
- Check that your backend terminal shows no red error messages.
- Try refreshing the browser at `http://localhost:5173`.

### ❌ "npm: command not found"
- Node.js is not installed. Download it from [nodejs.org](https://nodejs.org) and choose the **LTS** version.
- After installing, close and reopen your terminal.

### ❌ Database shows no data / seed.py errors
- Make sure XAMPP MySQL is running and `iapas_db` database exists in phpMyAdmin.
- Make sure your venv is activated before running `seed.py`.
- Check the `backend/.env` file — the database URL should be: `mysql+pymysql://root:@localhost:3306/iapas_db`

---

## 🚀 Pushing to GitHub

Follow these steps to put your project on GitHub so it's backed up and shareable.

### Step A — Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in.
2. Click the **"+"** icon in the top right → **"New repository"**.
3. Name it `iapas` (or anything you like).
4. Set it to **Public** or **Private**.
5. **Do NOT** check "Add a README" — we already have one.
6. Click **"Create repository"**.
7. GitHub will show you a URL like: `https://github.com/YOUR-USERNAME/iapas.git` — **copy this URL**.

### Step B — Run These Commands in Your Terminal

Open a terminal in the **root project folder** (where this README is) and run these commands **one by one**:

```bash
# 1. Initialize Git (only needed once)
git init

# 2. Stage all files for the first commit
git add .

# 3. Create the first commit
git commit -m "Initial commit: IAPAS full-stack project"

# 4. Rename the branch to 'main' (standard practice)
git branch -M main

# 5. Connect to your GitHub repository (replace the URL with yours)
git remote add origin https://github.com/YOUR-USERNAME/iapas.git

# 6. Push your code to GitHub
git push -u origin main
```

> ✅ After this, refresh your GitHub repository page — you should see all your files there.

> 💡 GitHub may ask you to log in. Use your GitHub username and a **Personal Access Token** (not your password). Create one at: GitHub → Settings → Developer Settings → Personal access tokens → Generate new token (classic). Give it `repo` scope.

---

## 🔄 Easy Update Script (Push with One Click)

Whenever you make changes to the code and want to save them to GitHub, just double-click the update script.

**The scripts are already created for you:**

### Windows: `push.bat`
Double-click `push.bat` in the project folder. It will:
1. Add all your changes
2. Create a commit with today's date
3. Push to GitHub automatically

### Mac/Linux: `push.sh`
Open a terminal in the project folder and run:
```bash
chmod +x push.sh   # (only needed the first time to make it executable)
./push.sh
```

> ✅ After running, check your GitHub repository page — your latest changes will be there within seconds.

---

## 🛠️ Tech Stack (For Developers)

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | FastAPI + SQLAlchemy | Python 3.10+ |
| Database | MySQL (via XAMPP) | 8.0+ |
| Frontend | React + Vite | React 19 |
| Styling | Tailwind CSS | v4 |
| AI / ML | scikit-learn (Random Forest) | 1.x |
| Auth | JWT (HS256) + bcrypt | — |
| Charts | Recharts | 3.x |
| Icons | Lucide React | — |

### API Endpoints at a Glance

```
POST   /api/auth/login                   Log in — returns JWT token
GET    /api/attendance/student/{id}      Get a student's attendance
POST   /api/attendance/mark              Mark attendance (faculty)
GET    /api/marks/student/{id}           Get a student's marks
POST   /api/marks/add                    Add marks (faculty)
GET    /api/performance/predict/{id}     AI grade prediction for a student
GET    /api/performance/dashboard        Aggregate stats for faculty/admin
GET    /api/admin/users                  List all users (admin only)
POST   /api/admin/create-user            Create a new user (admin only)
DELETE /api/admin/user/{id}              Delete a user (admin only)
GET    /api/subjects                     List all subjects
GET    /api/students                     List all student profiles
```

Full interactive API explorer: **http://localhost:8000/docs**

---

*Built with FastAPI, React, scikit-learn, and Tailwind CSS.*
