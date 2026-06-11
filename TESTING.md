# 🧪 Comprehensive Manual Testing Playbook: Consultation Recording Manager

This document provides a highly detailed, step-by-step manual testing protocol for the **Consultation Recording Manager** platform. Use this playbook to validate every feature, user flow, validation rule, and security boundary on either your local workspace (`http://localhost:5173`) or your live deployed site (`https://consultation-recording-manager.vercel.app/`).

---

## 📂 Table of Contents
1. [Landing Page & Event Loop Simulator](#1-landing-page--event-loop-simulator)
2. [Authentication & Account Recovery (OTP)](#2-authentication--account-recovery-otp)
3. [Staff Member Workflow (Intake & Bookings)](#3-staff-member-workflow-intake--bookings)
4. [Clinical Consultant Workflow (AI Transcripts & Notes)](#4-clinical-consultant-workflow-ai-transcripts--notes)
5. [System Administrator Workflow (Telemetry & Override Scopes)](#5-system-administrator-workflow-telemetry--override-scopes)
6. [Universal User Settings & Profile Pictures](#6-universal-user-settings--profile-pictures)

---

## 1. Landing Page & Event Loop Simulator

### 1.1 Dark & Light Mode Verification
* **Click Path**: Locate the **Sun/Moon icon** in the top navigation header, and the **Light Mode / Dark Mode text toggle** in the bottom footer.
* **Test Actions**: Click both buttons multiple times.
* **Expected Result**: 
  * The theme instantly toggles between light and dark modes.
  * The background changes from white/slate-50 to dark-950.
  * The theme preference is stored in local storage and persists across page refreshes.

### 1.2 System Event Loop & Data Pipeline Simulator
* **Location**: Scroll down below the "Core Pillars / Features" grid to the **System Event Loop & Data Flow** section.
* **Initial State**: Verify the terminal displays `# Consultation Recording Lifecycle Event Stream` and a JSON log with `"status": "system_idle"`. The progress bar is at `0%`. All 4 node cards are in a clean, standby state.
* **Action**: Click the **Run Simulation** button.
* **Step-by-Step Progression (Runs over 12 seconds)**:
  1. **Step 1: Audio Intake & Validation (Seconds 1-3)**:
     * Card 1 highlights with a pulsing teal border, teal background glow, and an active pulsing dot.
     * The terminal displays raw audio metadata JSON (`Consultation_John_Doe_0611.mp3`, validation tokens).
     * The progress bar fills to `25%`.
     * The horizontal connector arrow between Card 1 and Card 2 begins to pulse.
  2. **Step 2: Secure Storage Engine (Seconds 4-6)**:
     * Card 1 shows a green checkmark indicating success.
     * Card 2 highlights with a pulsing blue border and active dot.
     * The terminal logs the Cloudinary rate-limit bypass and lists the fallback to encrypted local uploads (`/uploads/`).
     * The progress bar fills to `50%`.
  3. **Step 3: Whisper AI Transcription (Seconds 7-9)**:
     * Card 2 shows a green checkmark.
     * Card 3 highlights with a pulsing cyan border.
     * The terminal logs the Whisper large-v3 transformer loading and prints extracted text statistics (840 words, 98.4% confidence).
     * The progress bar fills to `75%`.
  4. **Step 4: RBAC Shield & Commit (Seconds 10-12)**:
     * Card 3 shows a green checkmark.
     * Card 4 highlights with a pulsing rose border.
     * The terminal logs database insertions and WebSocket dispatch broadcasts.
     * The progress bar fills to `100%`.
  5. **Completion**: All nodes reset to standby, and the terminal returns to the idle state logs.

### 1.3 Interactive Role Portal Inspector
* **Location**: Scroll to the **Interactive Role Portal Inspector** section.
* **Actions**: Click between the three selector buttons: **Administrator**, **Clinical Consultant**, and **Office Staff**.
* **Expected Results**:
  * The checklist items, permissions scopes, and authorized levels update instantly.
  * The glassmorphic preview console on the right shifts:
    * **Admin**: Renders a mock root CLI console.
    * **Consultant**: Renders an interactive transcript preview with doctor-patient dialogue.
    * **Staff**: Renders a live mock file uploader loading bar at 74%.
  * The button text updates to "Launch [Role] Demo" and appends the role name.

---

## 2. Authentication & Account Recovery (OTP)

### 2.1 Sign Up (Registration & Validations)
* **Click Path**: Click **Get Started** or **Create Account** on the landing page, or go to `/register`.
* **Verification Actions**:
  * **Short Password Check**: Type a password under 6 characters (e.g. `123`). Click **Create Account**. Verify the form blocks submission with an input validation warning.
  * **Password Mismatch Check**: Type `password123` in Password, and `password555` in Confirm Password. Click **Create Account**. Verify a warning alert appears saying "Passwords do not match".
  * **Successful Register**: Fill in name, select role as **Staff**, enter a unique email, and input matching passwords. Click **Create Account**. Verify a success toast notification appears, credentials save in MongoDB, and you are logged in and redirected to the Dashboard.

### 2.2 Forgot Password & OTP Flow
* **Click Path**: Navigate to `/login`, click **Forgot password?** under the input box.
* **Test Action 1 (Forgot Request)**:
  * Enter a non-registered email. Verify the server returns a `404` error ("No user account found").
  * Enter your registered email. Click **Send Reset OTP**.
  * Verify a success message is shown, and the OTP code is displayed on the screen (or logged in your backend server logs).
* **Test Action 2 (OTP Verification)**:
  * Type an incorrect 6-digit code. Click **Verify OTP**. Verify the system rejects it with an error.
  * Enter the correct 6-digit code. Click **Verify OTP**. Verify the system transitions to the "Reset Password" form.
* **Test Action 3 (Password Reset)**:
  * Input a new password (e.g. `newpassword123`) and submit.
  * Verify the password resets successfully.
  * Log in at `/login` using your email and `newpassword123` to confirm the database credentials updated.

---

## 3. Staff Member Workflow (Intake & Bookings)

Log in using the Staff account credentials:
* **Email**: `staff@crm.com`
* **Password**: `password123`

### 3.1 Client Profile Registration
* **Click Path**: Sidebar -> **Clients** -> click the green **Add Client** button.
* **Actions**:
  * Add Client details: Name (`Tony Stark`), Email (`tony@stark.com`), Phone (`+1-555-0800`), Address (`Malibu, CA`).
  * Click **Save Client**.
* **Expected Result**: The new client is created and appears in the table list.
* **Edit Check**: Click the **Edit (Pencil) icon** next to `Tony Stark`, update the address to `New York`, and save. Verify the address updates in the list.

### 3.2 Scheduling Appointments
* **Click Path**: Sidebar -> **Schedule** (Calendar interface) -> click the green **New Consultation** button.
* **Actions**:
  * Select Client: Start typing `Tony` and select `Tony Stark` from the dropdown list.
  * Select Consultant: Choose `Dr. Sarah Jenkins` from the dropdown.
  * Appointment Date: Select a date and time.
  * Duration: Input `45` (minutes).
  * Tags: Input tags (e.g. `heart-rate`, `iron-man`) and press enter/comma.
  * Click **Save Consultation**.
* **Expected Result**: The consultation is successfully booked and displayed on the chronological schedule register list.

### 3.3 Consultation File Upload
* **Click Path**: Sidebar -> **Recordings** -> click the green **Upload Recording** button.
* **Actions**:
  * Select Consultation: Choose the consultation we created for `Tony Stark`.
  * Upload Interface: Drag and drop or browse to upload an audio file (e.g., `.mp3`, `.wav` under 50MB).
  * Observe the progress bar upload status.
* **Expected Result**: 
  * The file uploads, and a success notification appears.
  * The status changes to "Processed" and the file displays inside the Recordings register list.

---

## 4. Clinical Consultant Workflow (AI Transcripts & Notes)

Log in using the Consultant account credentials:
* **Email**: `consultant@crm.com`
* **Password**: `password123`

### 4.1 Audio Streaming & Controls
* **Click Path**: Sidebar -> **Recordings** -> select the recording `Robert Downey - Follow Up Medical Assessment`.
* **Actions**:
  * Click the **Play button** on the audio player.
  * Drag the progress timeline slider back and forth.
  * Click the volume control to mute and unmute.
* **Expected Result**: The audio plays cleanly with active timeline indicator updates.

### 4.2 Interactive AI Transcript & Smart Search
* **Actions**:
  * Scroll through the **AI Transcript** transcript container.
  * Locate the search input box inside the transcript panel.
  * Type a specific search term: `dosage` or `headaches`.
* **Expected Result**: The dialogue sections containing matching words are highlighted in light teal with a bold font weight, making key phrases easy to read.

### 4.3 AI Summaries & Actions Checklists
* **Actions**:
  * Review the **AI Summary Card** in the right column.
  * Look at the **Action Items** tab.
  * Click on the checkboxes next to action items (e.g. `Client to track daily sleep metrics`).
* **Expected Result**: Checkboxes can be checked off in real-time, helping clinicians keep track of follow-up metrics.

### 4.4 Formatted Note Editing
* **Click Path**: Under the recording details, locate the **Consultation Notes** tab. Click **Add Note** (or **Edit Note**).
* **Actions**:
  * Type a clinical summary inside the text editor: `Patient showed improved fatigue metrics. Recommend dose continuation for 30 days.`
  * Click **Save Note**.
* **Expected Result**: The formatted note saves successfully, a success toast displays, and the updated note rendering is pinned to the consultation page.

---

## 5. System Administrator Workflow (Telemetry & Override Scopes)

Log in using the Administrator account credentials:
* **Email**: `admin@crm.com`
* **Password**: `password123`

### 5.1 Account Deactivation & Login Guards
* **Click Path**: Sidebar -> **Admin** -> locate user `John Miller (Office Staff)` in the User Management list.
* **Test Action 1 (Deactivate User)**:
  * Click the toggle switch in the **Active** column to turn it off.
  * Log out of the Admin account.
  * Try logging in as `staff@crm.com` with password `password123`.
  * **Expected Result**: The login fails, displaying a red alert box: `Your account is deactivated. Please contact support.` (Coded 403 Forbidden).
* **Test Action 2 (Re-activate User)**:
  * Log back in as `admin@crm.com`.
  * Go to the **Admin** panel and toggle the **Active** switch back on.
  * Verify that the staff user can now log in successfully.

### 5.2 User Deletion & Safety Lock
* **Click Path**: Sidebar -> **Admin**.
* **Test Action 1 (User Deletion)**:
  * Click the red **Trash/Delete button** on a test account row.
  * Approve the confirmation popup prompt.
  * **Expected Result**: The user is deleted from the database and disappears from the dashboard list.
* **Test Action 2 (Self-Delete Safety Guard)**:
  * Locate your active Admin account `admin@crm.com` in the list.
  * Verify that the delete trash button is disabled or hidden for your own user row. This prevents administrators from locking themselves out of the system.

### 5.3 Recording Deletion Privileges
* **Click Path**: Sidebar -> **Recordings** -> select any test recording from the list.
* **Action**: Locate the red **Delete (Trash) icon** at the top right next to the download button. Click it and confirm.
* **Expected Result**: The recording is fully deleted. The database record is removed, the audio file is deleted from local uploads/Cloudinary, and the recordings list updates instantly.

---

## 6. Universal User Settings & Profile Pictures

Log in to any account (e.g. `admin@crm.com` or `consultant@crm.com`).

### 6.1 Uploading User Profile Pictures
* **Click Path**: Click the profile avatar image in the top-right header and select **My Profile** (or go to `/profile` directly).
* **Test Action 1 (Size Validation)**:
  * Hover over the profile initials circle on the right card to show the Camera icon overlay.
  * Click it and select a file **larger than 2MB**.
  * **Expected Result**: The upload blocks immediately and displays a warning toast: `Profile picture must be under 2MB`.
* **Test Action 2 (Successful Upload)**:
  * Click the overlay again and pick a valid image (`.png`, `.jpg`, `.jpeg`, `.gif` under 2MB).
  * Verify that the profile card immediately shows a loading spinner overlay.
  * Fill in a new name in the Full Name input field.
  * Click **Save Profile Changes** at the bottom.
  * **Expected Result**:
    * A success toast notification appears.
    * The avatar updates in the top-right header, the left-sidebar footer profile card, and the profile dashboard.
    * The name updates globally across the system.
