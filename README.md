# LinkUp MVP (FWEB Project Part 3)

LinkUp is a simple tutor booking platform for Temasek Polytechnic students.  
Students can browse available tutors, request sessions, manage bookings, and leave reviews.  
Tutors can register a tutor profile, accept/reject bookings, and track their ratings.

---

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)

---

## Repository Structure

linkup-mvp/
backend/ # Express API + MongoDB models/routes
src/ # React pages/components
public/ # static assets
index.html
package.json # frontend package.json
vite.config.js
README.md


---

## Core Features
- **Signup/Login (TP email)**: Accounts created with `@tp.edu.sg` emails.
- **Tutor Registration (Auto-approve)**: Tutor profile created and user role switches to `tutor` immediately.
- **Tutor Browsing + Filters**: Search by name, filter by year/module; shows tutor rating and review count.
- **Bookings Workflow**:
  - Student requests session
  - Tutor accepts/rejects
  - Both student and tutor mark completed
  - Booking becomes **completed** only when both confirm
- **Reviews**:
  - Students can submit **one review per completed booking**
  - Reviews contribute to tutor rating stats

---

## Local Setup (Run on Your Computer)

### 1) Clone the repository
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd linkup-mvp
2) Install frontend dependencies (root folder)
npm install
3) Install backend dependencies
cd backend
npm install
Environment Variables (Backend)
Create a file at:

backend/.env

Add:

MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
PORT=5050
✅ Important notes:

Do NOT commit .env

If you are using MongoDB Atlas, your MONGO_URI should look like:
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/tuition_backend

Running the App (2 Terminals)
Terminal 1 — Start Backend
cd backend
npm run dev
Backend should run on:

http://localhost:5050

You should see logs like:

MongoDB Connected

Server running on http://localhost:5050

Terminal 2 — Start Frontend
# from project root
npm run dev
Frontend should run on:

http://localhost:5173

API Endpoints (Backend)
Users
GET /users

GET /users?email=...

POST /users

Tutors
GET /tutors (returns approved tutor profiles + rating stats)

GET /tutors/:id (tutor profile by profile id)

GET /tutors/by-user/:userId (tutor profile by user id)

POST /tutors (auto-approve + updates user role)

Bookings
GET /bookings?studentId=...

GET /bookings?tutorId=...

POST /bookings

PATCH /bookings/:id/status (accept/reject)

PATCH /bookings/:id/complete (role-based completion)

DELETE /bookings/:id

Reviews
GET /reviews?tutorId=...

GET /reviews?studentId=...

GET /reviews?bookingId=...

POST /reviews (one review per booking)

Common Troubleshooting
1) ERR_CONNECTION_REFUSED from frontend
This usually means the backend is not running.

Start backend first: cd backend && npm run dev

Confirm backend is on http://localhost:5050

2) MongoDB changes not appearing
Check backend/.env exists and MONGO_URI is correct

Confirm backend terminal shows MongoDB Connected

Ensure your Atlas IP access allows your current network (Network Access → IP allowlist)

3) Tutor module is blank
Tutor profiles store modules as:

moduleCodes (array of strings)

Make sure frontend reads moduleCodes and not moduleCode.

4) Reviews say “already submitted” incorrectly
Check your reviews collection indexes:

There should be one unique index on the booking field (e.g., booking)

If you accidentally created another unique index like bookingId, remove it to avoid false duplicates