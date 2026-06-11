# AI Usage Declaration File

This project, **Consultation Recording Manager**, was developed as part of the recruitment process for **Humara Pandit** (Batch 2027). In alignment with the evaluation guidelines, this file outlines the collaboration between the candidate and AI coding assistants.

---

## 🤖 AI Tools & Assistants Utilized
- **Antigravity**: An advanced agentic AI coding assistant designed by the Google DeepMind team.

---

## 🛠️ Scope of AI Collaboration

### 1. Architecture Design & Planning
- Assisted in designing the MERN stack architecture, including database relationships (Mongoose schemas) and authorization rules.
- Helped structure the Cascade deletion relationships (deleting clients deletes consultations, which in turn deletes recordings and notes).

### 2. Component Generation & Frontend UI
- Paired on styling the premium dashboard, implementing a default dark-mode system with Zustland theme state management.
- Assisted in building interactive charts (using Recharts) for the Analytics screen and implementing a responsive sidebar navigation drawer with a click-away backdrop on mobile viewports.

### 3. Resilient Storage Implementation
- Co-developed the double-engine upload pipeline that attempts to upload files to Cloudinary but gracefully falls back to local storage `/uploads/` if credentials are empty or throw `403 Forbidden` errors.

### 4. Debugging & Port Resolution
- Assisted in diagnostic logging to capture raw Cloudinary REST API server response payloads to pinpoint auth mismatches.
- Resolved local development port collisions (`EADDRINUSE`) by safely terminating lingering background server processes.

---

## 🙋‍♂️ Human Guidance, Review, and Engineering Decisions

While the AI provided templates, code suggestions, and layout skeletons, the candidate drove all engineering decisions and performed final manual testing:

1. **UX Design Decisions**: Swapped the auth layouts to place the form on the right-hand panel, fixed the navigation links, and adjusted form container sizing to maximize input widths.
2. **Instant Upload Implementation**: Directed the profile picture upload change to execute immediately upon image selection for fluid SaaS-grade responsiveness.
3. **Database Setup**: Set up the MongoDB Atlas cluster, created database user credentials, and populated the `.env` variables to connect the MERN app database layers.
4. **Validation and Verification**: Conducted manual cross-role tests (Admin, Consultant, Staff) to verify access level validation guards and tested the app compilation via production builds.
