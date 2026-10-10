# ?? MenteeLog - OJT & Internship Management System

**A modern, secure, and structured web-based On-the-Job Training tracking system.**

---

## ?? Project Overview
MenteeLog is a centralized, department-level web platform designed to streamline On-the-Job Training (OJT) tracking, eliminate paper-based Daily Time Records (DTR), simplify Host Training Establishment (HTE) accreditation, and provide a highly controlled digital workflow for students, industry supervisors, and academic coordinators.

## ?? Brand Guidelines & Identity
MenteeLog represents a modern, clean, and highly professional aesthetic.
* **Colors:** Deep Maroon (Primary branding), Soft Sand/Beige (Backgrounds and premium cards), Clean White (Negative space), and Dark Slate (Typography).
* **Typography:** Modern sans-serif fonts optimized for maximum readability across dense data tables and mobile dashboards.
* **UI Philosophy:** Buttery-smooth CSS transitions, hardware-accelerated GPU animations, and zero-jank interaction design.

## ?? Core Objectives
* **Simplify** student OJT placements with a verified HTE directory.
* **Eliminate** manual, easily-forged paper DTRs.
* **Provide** GPS-verified clock-in and clock-out mechanisms.
* **Track** intern break times with granular precision.
* **Enforce** strict Supervisor-only review and approval of daily hours.
* **Automate** the student grading process via a built-in 5-point evaluation rubric.
* **Deliver** God-view analytics for global cohort compliance.
* **Generate** instant CHED-compliant export reports.
* **Maintain** strict audit logs, role-based access, and incident reporting structures.

---

## ?? System Roles & Permissions

MenteeLog consists of three strictly separated system roles.

| Role | Main Responsibilities |
| :--- | :--- |
| **Student / Trainee** | Placement application, document uploads, read-only DTR monitoring, and incident filing. |
| **Supervisor / Industry Partner** | Slot management, candidate review, Timekeeper Authority (approving DTRs), and performance appraisals. |
| **Coordinator / Faculty Admin**| System administration, HTE accreditation, bulk assignment, compliance monitoring, analytics, and CHED reports. |

---

## ?? Core Architecture & Workflow

The MenteeLog process follows a strict, secure lifecycle:

1. **Setup:** Coordinator accredits HTEs and provisions supervisor accounts.
2. **Sourcing:** Supervisor posts available OJT slots for their specific company.
3. **Application:** Student submits an application to an active position.
4. **Review:** Supervisor reviews the candidate (Accept/Reject/Under Review).
5. **Lock-In:** Coordinator verifies the placement, officially locking the student to that HTE.
6. **Execution (Timekeeping):** Supervisor manages the DTR Terminal, clocking the student in and out using Live GPS verification. (Students cannot edit their own hours).
7. **Monitoring:** Student monitors their progress on their Read-Only DTR dashboard.
8. **Appraisal:** Supervisor performs the Final Appraisal using the built-in grading rubric.
9. **Compliance:** Coordinator monitors global progress and generates final compliance reports for the university.

---

## ?? Security & Authentication Logic

MenteeLog uses layered security mechanisms to enforce data integrity:
* **Role-Based Access Control (RBAC):** Users are strictly routed to their designated portals via Supabase Auth. Supervisors cannot access global cohort data, and Students cannot alter their own DTR hours.
* **Row Level Security (RLS):** Database reads and writes are strictly scoped to the authenticated user's ID at the Postgres level.
* **Absolute-Authority Timekeeping:** Unlike legacy systems where students punch their own time, MenteeLog grants *only* the Supervisor the authority to commit hours, ensuring zero forgery.
* **Secure Storage:** Evidence and compliance documents are securely uploaded to private Supabase Storage buckets using signed URLs for authorized retrieval.

---

## ?? Repository Structure

```text
+-- docs/                     # Documentation, System Architecture, & Database ERDs
¦   +-- design/               # UI/UX Figma references and project design files
¦   +-- assets/               # Team images and brand assets
+-- MenteeLog/           # Primary application source code (Vite + Vanilla JS UI)
¦   +-- src/                  # Core logic (app.js, public.js, portal-views.js)
¦   +-- public/               # Static assets (images, icons)
¦   +-- migrations/           # Supabase SQL database schema migrations
+-- scripts/                  # Automated maintenance & migration scripts
+-- README.md                 # Project documentation
```

---

## ?? Technology Stack

**Frontend:**
* Vite (Bundler & Dev Server)
* Vanilla JavaScript (ES6+ SPA Architecture)
* CSS3 (High-performance transitions & GPU acceleration)
* Leaflet.js (Geolocation mapping)

**Backend & Database:**
* Supabase (Auth, Storage, Edge Functions)
* PostgreSQL (with strict Row Level Security)
* RESTful APIs / PostgREST

**Design & Prototyping:**
* Figma

---

## ????? Team MenteeLog

MenteeLog is developed collaboratively by Team MenteeLog.

| Name | Role |
| :--- | :--- |
| **Jeff A. Gentapanan** | Project Manager |
| **Kyle Renzo C. Alis** | Software Generalist |
| **Cristina Bernadette Porras** | UI/UX Designer |
| **John Paul B. Wendam** | Frontend Developer |
| **Jhodie Alyssa Ladran** | Backend Developer |
| **Sean Nichole S. Guipo** | Backend Developer |
| **Rolly G. Abella** | Researcher |

---

## ?? Live Development

To run the platform locally:

```bash
cd MenteeLog
npm install
npm run dev
```

### Sample Demo Accounts
*(Contact administration for testing credentials)*

* **Student:** `2021-00421` (or via Magic Link)
* **Supervisor:** `carlos.jose@example.com`
* **Coordinator:** `FAC-2026-001`

