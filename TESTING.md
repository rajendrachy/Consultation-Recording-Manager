# 🧪 Consultation Recording Manager - Testing Guide

This guide provides step-by-step instructions to test all features of the **Consultation Recording Manager** platform. You can perform these tests on either your local workspace (`http://localhost:5173`) or your live deployed site (`https://consultation-recording-manager.vercel.app/`).

---

## 🔗 Project Entry Points

* **Live Frontend (Vercel)**: [https://consultation-recording-manager.vercel.app/](https://consultation-recording-manager.vercel.app/)
* **Live Backend (Render)**: [https://consultation-manager-backend.onrender.com/](https://consultation-manager-backend.onrender.com/)
* **Local Frontend**: `http://localhost:5173/`
* **Local Backend**: `http://localhost:5000/`

---

## 🛠️ Step 1: Landing Page Telemetry & Role Inspector

Before logging in, test the interactive features on the homepage:

1. **Theme Switcher**:
   * Click the **Sun/Moon icon** in the navigation header or the footer.
   * Verify that the entire theme transitions smoothly between Light and Dark modes.
2. **Interactive Role Portal Inspector**:
   * Scroll down to the **Interactive Role Portal Inspector**.
   * Click between the **Administrator**, **Clinical Consultant**, and **Office Intake Staff** tabs.
   * Observe how the permissions, description, features list, and interactive console screen (mock logs/transcripts/upload queues) update dynamically for each role.
3. **Data Pipeline Simulator**:
   * Scroll down to the **System Event Loop & Data Flow** section.
   * Click the glowing **Run Simulation** button.
   * Observe the visual pipeline nodes highlight sequentially (Steps 1–4) with pulsing lights and progress bars.
   * Watch the dark code terminal display live syntax-highlighted JSON telemetry packets for each processing step.

---

## 🔐 Step 2: Sign Up (Registration Flow)

Test creating a new account to verify database writes:

1. Go to the registration page: Click **Create Account** or navigate directly to `/register`.
2. Fill in the fields:
   * **Full Name**: `Test User`
   * **Email Address**: Use a new email (e.g., `tester@test.com`).
   * **Account Role**: Select **Staff (Upload & Schedule)**.
   * **Password**: `password123`
   * **Confirm Password**: `password123`
3. Click **Create Account**.
4. **Verification**: Verify that the account is created successfully, a success toast notification appears, and you are logged in and redirected to the **Dashboard**.

---

## 💼 Step 3: Sign In & Role Permissions (Pre-seeded Demo Accounts)

Log out of your registered account and test the three pre-seeded workflows:

### A. Staff Desk (Intake & Audio Uploads)
1. Navigate to `/login`.
2. Enter the Staff credentials:
   * **Email**: `staff@crm.com`
   * **Password**: `password123`
3. **Test Ingestion**:
   * Go to **Clients** -> click **Add Client** -> register a client (e.g., `Bruce Wayne`, `bruce@wayne.com`, `+1-555-0100`).
   * Go to **Schedule** -> click **New Consultation** -> book an appointment for `Bruce Wayne` with `Dr. Sarah Jenkins` (Consultant).
   * Go to **Recordings** -> click **Upload Recording**. Drag and drop an audio file (e.g., `.mp3`, `.wav`) or click to browse.
   * Verify the upload progress bar functions. Since Cloudinary falls back to local storage on API limitations, verify the upload succeeds and lists the recording immediately.

### B. Consultant Workspace (AI Transcripts & Summaries)
1. Log out and sign in using the Consultant credentials:
   * **Email**: `consultant@crm.com`
   * **Password**: `password123`
2. **Test AI Reviews**:
   * Go to the **Recordings** page. Click on the seeded recording: `Robert Downey - Follow Up Medical Assessment`.
   * **Voice-to-Text**: Verify that the audio player streams successfully and the **AI Transcript** panel shows the fully transcribed text.
   * **Smart Keywords**: Type `prescriptions` or `fatigue` in the search bar. Verify that matches are highlighted in light teal directly inside the transcript text.
   * **Action Items**: Verify the AI-extracted **Bulleted Summary**, **Discussion Points**, and **Action Items Checklists** display correctly.
   * **Structured Notes**: Click **Add Note** under the recording -> compose clinical notes -> click Save. Verify that the note attaches to the consultation history.

### C. System Admin Command Center (Audit & Management)
1. Log out and sign in using the Administrator credentials:
   * **Email**: `admin@crm.com`
   * **Password**: `password123`
2. **Test Operational Control**:
   * Go to the **Admin** page from the sidebar.
   * **Registry Manager**: Verify you can see all registered users (Admin, Dr. Sarah Jenkins, and Staff).
   * **Recording Deletion Scopes**: Go to the **Recordings** page. Verify that a red **Delete (Trash)** button is visible next to recordings. Delete a test recording and verify it is pruned from the MongoDB database.
   * **Security Deletion**: Go to the **Admin** page. Locate your created `tester@test.com` account and click **Delete User**. Verify the user is removed from the system. (Admin cannot delete their own active session user).

---

## 👤 Step 4: User Profile Pictures & Settings

Verify settings editing and avatar upload functionalities:

1. Log in to any user account.
2. Click the top-right header profile dropdown and select **My Profile** (or go to `/profile` directly).
3. **Change Profile Photo**:
   * Hover over the profile initials circle. Click the **Camera overlay** that fades in.
   * Choose a local image file (`.jpg`, `.jpeg`, `.png`, `.gif` under 2MB).
   * Confirm that the circle shows a loading spinner overlay and immediately displays a preview of your image.
4. **Save Changes**:
   * Click **Save Profile Changes** at the bottom of the form.
   * Verify the success toast notification displays.
   * Confirm that your profile picture updates globally in the top-right header, the left-sidebar footer profile card, and the profile dashboard!
5. **Logout**:
   * Click the dropdown in the header or the logout button at the bottom of the sidebar to securely close your session.
