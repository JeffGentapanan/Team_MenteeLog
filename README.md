# MenteeLog - OJT & Internship Management System

**A modern, secure, and centralized web-based On-the-Job Training tracking platform.**

---

## 📌 Project Overview
**MenteeLog** is a centralized, department-level web platform designed to streamline On-the-Job Training (OJT) tracking, eliminate paper-based Daily Time Records (DTR), simplify Host Training Establishment (HTE) accreditation, and provide a connected, auditable digital workflow for students, industry supervisors, and faculty coordinators.

Developed for university OJT programs (including Batangas State University), MenteeLog unifies placement discovery, GPS-verified attendance logging, daily task summaries, performance appraisals, and CHED compliance reporting into three interconnected portals.

---

## 🎨 Brand Guidelines & Identity
* **Primary Palette:** Deep Burgundy (`#58111A`), Rose Accent (`#D85A63`), Warm Sand/Cream (`#FAF4E8` / `#EFDFBB`), and Emerald Success (`#059669`).
* **Typography:** Clean, high-legibility sans-serif and monospace technical accents (`ui-monospace`, `JetBrains Mono`) for coordinate, telemetry, and time tracking.
* **UI Philosophy:** Frosted acrylic glassmorphism, hardware-accelerated GPU transitions, interactive React Bits & Anime.js-inspired physics, and responsive data tables.

---

## 🎯 Main Objectives & Key Pillars
* **Verified HTE Placements:** Eliminate unaccredited student placements through a vetted directory of partner companies.
* **Supervisor-Authorized Digital Timekeeping:** Replace manual, easily-forged paper DTRs with a live timekeeper terminal where supervisors clock students in/out and review daily task logs (enforcing a 150+ character quality gate).
* **Granular Break & Shift Tracking:** Accurately compute net rendered hours by deducting lunch and personal breaks.
* **Automated 5-Point Appraisal Rubrics:** Streamline student evaluations with digital scoring across technical competencies, attendance, and professionalism.
* **Faculty Governance & God-View Analytics:** Equip coordinators with real-time cohort tracking, incident mediation hubs, and single-click CHED CMO 104 s. 2017 compliant completion reports.
* **Tamper-Resistant Security:** Enforce strict Role-Based Access Control (RBAC), multi-tab session isolation, and audit logs.

---

## 👥 System Roles & Permissions

| Role | Main Responsibilities |
| --- | --- |
| **Student / Trainee** | Browse accredited HTEs, submit applications, upload clearances & MOAs, monitor live read-only DTR progress, and file incident claims. |
| **Supervisor / Industry Partner** | Post verified training slots, review applicants, operate the Timekeeper Terminal (Clock In / Clock Out authority), sign off on DTRs, and submit 5-point performance appraisals. |
| **Coordinator / Faculty Admin** | Accredit HTE partners, manage bulk student placements, monitor cohort compliance, mediate student incidents, and export 1-click CHED reports. |

---

## 🔄 System Overview & Core Workflow

The MenteeLog lifecycle follows an interconnected progression across all three portals:

```mermaid
flowchart TD
    %% Roles Styling
    classDef student fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a;
    classDef supervisor fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;
    classDef coordinator fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px,color:#4c1d95;
    classDef decision fill:#fff1f2,stroke:#e11d48,stroke-width:2px,color:#881337;
    classDef action fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef notice fill:#fdf4ff,stroke:#c026d3,stroke-width:2px,color:#701a75;

    %% 1. Pre-Placement Phase
    subgraph Phase1 ["1. OJT Discovery, Application & Placement"]
        A["Student: Browse Accredited HTE Directory"]:::student --> B["Student: Submit Application & Clearance Documents"]:::student
        B --> C["Supervisor: Screen in Unified Candidate Review Hub"]:::supervisor
        C --> D{"Supervisor Review Decision"}:::decision
        D -->|"Under Review / Interview"| C
        D -->|"Rejected"| B
        D -->|"Accepted"| E["Coordinator: Validate in Student Placement Hub & Lock Assignment"]:::coordinator
        E --> F["Student Officially Placed at Host Training Establishment (HTE)"]:::action
    end

    %% 2. Daily Attendance & Timekeeping Phase
    subgraph Phase2 ["2. Daily Timekeeping, Break Tracking & Log Sheets"]
        F --> G["Student: Clock In on Student Portal with GPS Verification"]:::student
        G --> H["Official Notice: Physical HTE Clock In/Out Required for Certificate"]:::notice
        H --> I["Shift Timer Running (High-Precision Millisecond Tracking)"]:::action
        I --> J{"Take Lunch / Personal Break?"}:::decision
        J -->|"Yes"| K["Student: Start Lunch / Break (Work Timer Pauses, Break Timer Runs)"]:::student
        K --> L["Student: End Break & Resume (Accurately Resumes with Zero Loss)"]:::student
        L --> I
        J -->|"No"| M["Student: + Write Task Draft / Save as Draft (Optional Progress Saving)"]:::student
        M --> N["Student: Clock Out & Submit Daily Summary Reflection (Min. 150 chars)"]:::student
        N --> O["Supervisor: Review Log Sheets & Summary (View GPS, Rendered Hours, Task)"]:::supervisor
        O --> P{"Supervisor Verification"}:::decision
        P -->|"Reject / Needs Correction"| Q["Returned to Student with Remarks for Revision"]:::student
        Q --> N
        P -->|"Approve & Sign"| R["Hours Officially Accrued to Student Training Meter"]:::action
    end

    %% 3. Performance Appraisal & Evaluation Phase
    subgraph Phase3 ["3. 7-Criteria Performance Appraisal & Digital Signing"]
        R --> S{"Training Hours Completed? (e.g. 500 Hours)"}:::decision
        S -->|"No"| G
        S -->|"Yes"| T["Supervisor: Complete 7-Criteria Evaluation Instrument (5-Point Scale + NA)"]:::supervisor
        T --> U["Supervisor: Apply Digital Signature on High-DPI Canvas Station"]:::supervisor
        U --> V["Student: View Signed Appraisal Breakdown & Rubric Scores"]:::student
    end

    %% 4. Governance & Completion
    subgraph Phase4 ["4. Faculty Governance, Compliance & Graduation"]
        V --> W["Coordinator: Verify Completion & Mediate Any Incident Reports"]:::coordinator
        W --> X["Coordinator: Export CHED CMO 104 s. 2017 Batch Reports & Certificate"]:::coordinator
        X --> Y["OJT Program Successfully Completed"]:::action
    end

    %% Session Security
    Z["Any Portal: Click Sign Out"] --> AA{"Confirm Logout Dialog?"}:::decision
    AA -->|"Cancel"| AB["Remain Logged In"]:::action
    AA -->|"Confirm"| AC["Secure Session Termination & Return to Login"]:::action
```

---

## 🏛️ System Architecture & Diagrams

Below are the architectural diagrams outlining the database structure, information architecture, and core system flows.

### Platform Site Map (Mermaid Architecture)

```mermaid
graph TD
    %% Styles
    classDef root fill:#58111a,stroke:#58111a,stroke-width:2px,color:#fff;
    classDef public fill:#f4ede7,stroke:#76696c,stroke-width:2px,color:#33292c;
    classDef student fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a;
    classDef supervisor fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;
    classDef coordinator fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px,color:#4c1d95;
    classDef subpage fill:#ffffff,stroke:#cbd5e1,stroke-width:1.5px,color:#334155;

    %% Root
    Root["MenteeLog Platform"]:::root

    %% Public Portal
    Root --> Public["Public Access & Authentication"]:::public
    Public --> PubHome["Landing Page (#/)"]:::subpage
    Public --> PubLogin["Sign In Portal (#/login)"]:::subpage
    PubLogin --> PubRole["Role Switcher (Student / Supervisor / Coordinator)"]:::subpage
    PubLogin --> PubClock["Live Interactive DTR Clock Dial"]:::subpage
    Public --> PubActivate["Account Activation (#/activate)"]:::subpage
    PubActivate --> PubOTP["6-Digit OTP & Password Setup"]:::subpage
    Public --> PubReset["Password Recovery (#/reset-password)"]:::subpage

    %% Student Portal
    Root --> StudentPortal["Student Portal (#/student)"]:::student
    StudentPortal --> SDash["Dashboard (#/student/dashboard)"]:::subpage
    SDash --> SProg["Progress Meter (Rendered / Required Hours)"]:::subpage
    SDash --> SRecent["Recent Activity & Supervisor Details"]:::subpage
    
    StudentPortal --> SJobs["OJT Placement (#/student/jobs)"]:::subpage
    SJobs --> SJobModal["Position Details & Application Modal"]:::subpage

    StudentPortal --> SApps["My Applications (#/student/applications)"]:::subpage
    SApps --> SAppStatus["Pipeline Tracker (Pending / Under Review / Accepted)"]:::subpage

    StudentPortal --> SDTR["Attendance & DTR (#/student/dtr)"]:::subpage
    SDTR --> SNotice["Official HTE Timekeeping Notice"]:::subpage
    SDTR --> STimer["Live Shift Timer & Millisecond Break Resume"]:::subpage
    SDTR --> SControls["Shift Controls (Clock In / Lunch Break / Clock Out)"]:::subpage
    SDTR --> SOutModal["Clock Out & Daily Logbook Modal (with Save as Draft)"]:::subpage
    SDTR --> SHistory["DTR History (#/student/dtr/history)"]:::subpage
    SDTR --> SDrafts["Saved Drafts History (#/student/dtr/drafts)"]:::subpage
    SDTR --> SDraftNew["Write / Edit Task Draft Modal"]:::subpage

    StudentPortal --> SAppraisal["Performance Appraisal (#/student/appraisal)"]:::subpage
    SAppraisal --> SApprScores["7-Criteria Rubric Breakdown & Drawn Signature"]:::subpage

    StudentPortal --> SVault["Requirements & Vault (#/student/documents)"]:::subpage
    SVault --> SUpModal["Document Uploader & Viewer"]:::subpage

    StudentPortal --> SIncidents["Incident Reports (#/student/incidents)"]:::subpage
    SIncidents --> SIncNew["File Incident Report Modal"]:::subpage

    StudentPortal --> SProfile["Profile Settings (#/student/profile)"]:::subpage
    StudentPortal --> SLogout["Sign Out (with Logout Confirmation Modal)"]:::subpage

    %% Supervisor Portal
    Root --> SupervisorPortal["Supervisor Portal (#/supervisor)"]:::supervisor
    SupervisorPortal --> SupDash["Dashboard (#/supervisor/dashboard)"]:::subpage
    SupDash --> SupStats["Active Interns & Pending Approval Counters"]:::subpage

    SupervisorPortal --> SupCand["Candidate Review (#/supervisor/candidates)"]:::subpage
    SupCand --> SupCandTabs["Pipeline Tabs (All / Pending / Under Review / Accepted / Rejected)"]:::subpage
    SupCand --> SupCandModal["Applicant Screening & Decision Modal"]:::subpage

    SupervisorPortal --> SupDTR["Log Sheets & Summary (#/supervisor/dtr)"]:::subpage
    SupDTR --> SupCards["Summary Cards (Total Rendered / Required / Remaining Hours)"]:::subpage
    SupDTR --> SupLogTable["Recent Log Sheets & Approvals Table"]:::subpage
    SupDTR --> SupVerifyModal["Logbook Verification Modal (Verify On-Site / Approve / Reject)"]:::subpage
    SupDTR --> SupProfileDTR["Intern Profile Log Sheet (#/supervisor/dtr/profile/:id)"]:::subpage
    SupDTR --> SupExport["Export Log Summary (PDF / CSV)"]:::subpage

    SupervisorPortal --> SupAppr["Performance Appraisal (#/supervisor/appraisals)"]:::subpage
    SupAppr --> SupEvalPage["7-Criteria Evaluation Station (#/supervisor/appraisals/evaluate/:id)"]:::subpage
    SupEvalPage --> SupRubric["5-Point Scoring Rubric (1-5 & NA)"]:::subpage
    SupEvalPage --> SupCanvas["Draw Digital Signature Canvas Pad"]:::subpage

    SupervisorPortal --> SupJobs["Slot Management (#/supervisor/jobs)"]:::subpage
    SupJobs --> SupJobPost["Create / Edit Training Slot Modal"]:::subpage

    SupervisorPortal --> SupInc["Incident Hub (#/supervisor/incidents)"]:::subpage
    SupInc --> SupIncLog["Report Disciplinary Issue / Workplace Incident"]:::subpage

    SupervisorPortal --> SupProf["Profile Settings (#/supervisor/profile)"]:::subpage
    SupervisorPortal --> SupLogout["Sign Out (with Logout Confirmation Modal)"]:::subpage

    %% Coordinator Portal
    Root --> CoordinatorPortal["Coordinator Portal (#/coordinator)"]:::coordinator
    CoordinatorPortal --> CoordDash["Dashboard (#/coordinator/dashboard)"]:::subpage
    CoordDash --> CoordStats["Cohort Statistics, Placement % & Compliance Alerts"]:::subpage

    CoordinatorPortal --> CoordPlac["Student Placement (#/coordinator/candidates)"]:::subpage
    CoordPlac --> CoordPlacTabs["Roster Tabs (All / Placed / Awaiting Placement / HTE Directory)"]:::subpage
    CoordPlac --> CoordAssign["Candidate Placement & Endorsement Modal"]:::subpage

    CoordinatorPortal --> CoordComp["HTE Accreditation (#/coordinator/companies)"]:::subpage
    CoordComp --> CoordCompModal["Accreditation Partner Directory & Verification"]:::subpage

    CoordinatorPortal --> CoordDTR["DTR Compliance Queue (#/coordinator/dtr)"]:::subpage
    CoordDTR --> CoordDTRRev["DTR Entry Compliance Review (#/coordinator/dtr/review/:id)"]:::subpage
    CoordDTR --> CoordScanner["Attendance Anomaly & GPS Scanner"]:::subpage
    CoordDTR --> CoordRules["Compliance Hours & Deadline Settings Modal"]:::subpage

    CoordinatorPortal --> CoordInc["Incident & Compliance Hub (#/coordinator/incidents)"]:::subpage
    CoordInc --> CoordMediate["Incident Mediation & Resolution Modal"]:::subpage

    CoordinatorPortal --> CoordRep["Report Generation (#/coordinator/reports)"]:::subpage
    CoordRep --> CoordCHED["CHED CMO 104 s. 2017 Batch Export (PDF / CSV)"]:::subpage

    CoordinatorPortal --> CoordUsers["User & Access Governance (#/coordinator/users)"]:::subpage
    CoordUsers --> CoordImport["Pre-Seed Candidate CSV Batch Import"]:::subpage
    CoordUsers --> CoordFac["Provision Faculty Coordinator Account"]:::subpage
    CoordUsers --> CoordRBAC["RBAC Security Summary Matrix"]:::subpage

    CoordinatorPortal --> CoordJobs["Job Listings Directory (#/coordinator/jobs)"]:::subpage
    CoordinatorPortal --> CoordProf["Profile Settings (#/coordinator/profile)"]:::subpage
    CoordinatorPortal --> CoordLogout["Sign Out (with Logout Confirmation Modal)"]:::subpage
```

### Database Schema (ERD)
![Entity-Relationship Diagram](docs/diagrams/erd_schema.png)

### Platform Site Map Image
![MenteeLog Site Map](docs/diagrams/sitemap.png)

### System Process Flow Image
![System Flowchart](docs/diagrams/system_flow.png)

---

## 🔐 Core Portals Breakdown

### 1. Student Portal (`#/student/dashboard`)
* **Dashboard:** Real-time visual progress bar (`rendered / required hours`), placement summary, and open incident tickets.
* **OJT Placement:** Filterable directory of accredited partner companies with skill-matching tags and slot availability.
* **My Applications:** Pipeline tracking from *Pending* to *Under Review* to *Accepted*.
* **DTR Hub:** Live read-only attendance logbook synced with supervisor sign-offs, displaying clock-in/out stamps, rendered hours, and supervisor remarks.
* **Requirements & Vault:** Secure drag-and-drop uploader for medical clearances, parent consent waivers, and endorsed MOAs.
* **Performance Appraisal:** Read-only view of supervisor rubric scores and final evaluations.
* **Incident Reports:** Dispute filing system with screenshot and document attachment support.

### 2. Supervisor Portal (`#/supervisor/dashboard`)
* **Dashboard:** Active intern roster, shifts currently in progress, and pending DTR approvals.
* **Candidate Review:** Resume screener and applicant pipeline with one-click *Accept* and *Reject* controls.
* **Attendance & Timekeeper Hub:** Real-time clock in and clock out terminal for intern shifts, lunch break tracking, and logbook approvals with digital signatures.
* **Performance Appraisal:** 5-point evaluation rubric automatically calculating weighted scores across 5 core competencies.
* **Slot Management:** Creation of training listings strictly bound to the supervisor's accredited company profile.
* **Incident Hub:** Disciplinary action reporting and incident tracking.

### 3. Coordinator Portal (`#/coordinator/dashboard`)
* **Dashboard:** Cohort placement statistics, accredited partner totals, and compliance alerts.
* **HTE Accreditation:** Directory management, accreditation renewals, and partner verification.
* **Candidate Placement:** Bulk assignment capabilities to match unplaced students with available training establishments.
* **DTR Compliance Queue:** Global audit log of all rendered student hours, flagged records, and attendance anomalies.
* **Report Generation:** Export batch completion certificates and CHED CMO-compliant CSV reports with a single click.
* **Central Incident Hub:** Mediation center for workplace harassment, AWOL claims, and placement reassignment.

---

## 🔑 Demo Accounts & Credentials

To explore the connected portals, use the following pre-configured demonstration accounts:

> **Universal Demo Password:** `Demo@2026!`

| Portal | Role | Username / Identifier | Registered Email | Assigned Company / Dept |
| --- | --- | --- | --- | --- |
| **Student** | OJT Student | `2021-00421` | `kenzosomes@gmail.com` | Accenture Philippines (Assigned to `shisuizhin`) |
| **Supervisor** | Industry Supervisor | `shisulzhin@gmail.com` | `shisulzhin@gmail.com` | Accenture Philippines (Supervising `kenzosomes`) |
| **Coordinator** | Faculty Admin | `FAC-2026-001` | `jeff.gentapanan2004525@gmail.com` | College of Information Technology |

---

## ⚡ Recent Updates & Key Improvements

### 1. Authentication Experience (`#/login`)
* **Interactive DTR Clock Mechanism:** Replaced static visuals with an active analog & digital clock dial animation featuring **CLOCK IN (08:00 AM)** and **CLOCK OUT (05:00 PM)** pins, glowing shift duration arc, and live sweeping clock hands.
* **Clean Geometric Map Grid:** Integrated dual-tier blueprint/map gridlines (30px / 150px) with coordinate crosshairs `+` and interactive cursor spotlight tracking (`--spotlight-x`, `--spotlight-y`).
* **Frosted Glass Acrylic Card:** Designed a modern, elevated card with a 4-color top spectrum line (`Burgundy → Rose → Sand Gold → Emerald`), an active **Role Status Indicator Banner**, focus glow inputs, luminous submit button, and an official SSL encryption seal.
* **Centered Identity:** Clean, balanced branding with centered MenteeLog logo in the card header.

### 2. Multi-Tab Session Isolation & Page Reload Fix
* Resolved browser storage and routing conflicts (`sessionStorage.SESSION.<role>`).
* Reloading any active tab now accurately persists the current portal view and prevents session drops or accidental role switches.

### 3. Core Accounts Connected & Cleaned
* Linked the core accounts: Student (`kenzosomes`), Supervisor (`shisuizhin`), and Coordinator (`jeff.gentapanan2004525`).
* Purged mock dummy intern data so time logs, active shifts, and placements reflect the actual users.

### 4. Character Encoding & UTF-8 Normalization
* Sanitized mangled unicode characters across all portal views (e.g. `â— `, `Â·`) with standard HTML entities and clean inline SVG icons.

### 5. Account Activation & OTP Verification Flow (`#/activate`)
* 3-step activation pipeline:
  1. Identifier & email verification.
  2. 6-digit numeric one-time passcode (OTP) validation.
  3. Secure password setup with live confirmation and input toggles.

### 6. Login UI & Responsive Layout Optimization (`#/login`)
* **Zero-Scroll 100% Zoom Fit:** Refined card width (`395px`) and vertical hierarchy to comfortably display all form inputs, role capsules, actions, and activation links without page or card scrolling.
* **Side-Slot Floating Badges:** Repositioned floating trust badges (`CHED CMO Verified`, `Clock In / Clock Out`, `3 Connected Portals`) into designated open side slots with gentle `±4px` physics and `z-index: 10`, ensuring full readability and zero collision with background HUD telemetry.
* **Cleaned HUD Labels:** Normalized the bottom portal HUD to `STATE UNIVERSITY OJT PORTAL`.

### 7. Department Hours Progress & Reporting (`#/coordinator/dashboard`)
* Replaced text summaries in the Coordinator Portal with modern, interactive progress cards featuring rendered vs. required hours, percentage completion, and automatic `BSIT` department badge fallback.

### 8. Terminology Alignment & Guide Modernization
* Removed specification module numbers (`1.1`, `2.4`, etc.) across Coordinator Incident tabs and the public Landing Page OJT Success Guide, replacing them with user-centric categories (*Attendance*, *Task Summaries*, *Compliance*, *Appraisals*, *Mediation*).

### 9. Candidate Pre-Seeding & Sync Resilience
* Enhanced `syncRemote` routines in `sync.js` to ingest and persist pre-seeded candidate activations from `school_registry`, preventing periodic remote sync cycles from purging pending student rosters.

### 10. Interactive Draw Signature Station for Appraisals (`#/supervisor/appraisals`)
* Replaced static demo text fields with an executive **Draw Signature** station featuring a high-DPI HTML5 canvas pad with mouse, pen, and touch-screen drawing support.
* Includes signature guideline (`✕ SIGN ABOVE THE LINE`), quick clear button, signatory name input, and institutional certification declaration.
* Resilient local and cloud persistence: automatically stores completed appraisals with score, comments, and the supervisor's drawn signature image into `db.appraisals` and `localStorage`, sending instant notifications to students.
* Students can immediately view their completed evaluation, rubric breakdown, comments, and the supervisor's authentic digital signature directly in their portal.

### 11. BSIT Scope Focus & Course Standardization
* Focused the academic scope strictly on **BSIT (Bachelor of Science in Information Technology)** across the public landing page, student directory, partner listings, and portal dashboards for singular, cohesive faculty administration.

### 12. Regional Partner Localization (MORE Power)
* Updated regional utility partner branding from Meralco to **MORE Power** (Iloilo City) for accurate geographic alignment.

### 13. Sidebar & Modal Layout Refinements
* Eliminated sidebar vertical scrollbar overflow in the Coordinator and portal navigation, ensuring all navigation elements fit cleanly within the viewport.
* Resolved modal drawer tab hover clipping and padding for seamless interactive navigation.

---

## 💻 Technology Stack

* **Frontend:** Vanilla JavaScript (ES6+ modular architecture), React 19, Vite 8, Leaflet.js (GIS/Mapping), GPU-accelerated CSS3.
* **Backend & Database:** Supabase, PostgreSQL, Node.js, Express.
* **Design & Motion:** Figma, React Bits, Anime.js-inspired keyframe physics.
* **Code Quality & Linting:** Oxlint, modern ES modules.

---

## 🚀 Local Development Setup

To run the application locally on your machine:

```bash
# 1. Navigate to the frontend directory
cd MenteeLog

# 2. Install dependencies
npm install

# 3. Start the local development server (Vite)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

To create a production build:
```bash
npm run build
```

---

## 📁 Repository Structure

```
Team_MenteeLog/
├── MenteeLog/                  # Core frontend application (Vite project)
│   ├── src/
│   │   ├── css/                # Stylesheets & animations (animations.css, portal-reference.css)
│   │   ├── js/                 # Application modules (app.js, public.js, portal-views.js, domain.js)
│   │   └── supabaseClient.js   # Supabase database & auth client
│   ├── public/                 # Static assets & logos
│   ├── package.json            # Dependencies and scripts
│   └── vite.config.js          # Vite bundler configuration
├── docs/                       # Project documentation & diagrams
│   ├── diagrams/               # Architecture diagrams (ERD, sitemap, process flow)
│   ├── design/                 # UI designs and design system specs
│   └── assets/                 # Supporting documentation media
├── scripts/                    # Developer & migration tooling
│   ├── maintenance/            # Utility scripts for unicode sanitization & README builds
│   └── migration_patches/      # Database and schema migration patches
├── .gitignore                  # Root git ignore file
└── README.md                   # Main project documentation
```

---

## 👥 Team MenteeLog

MenteeLog is developed collaboratively by:

| Name | Role / Responsibility |
| --- | --- |
| **Jeff A. Gentapanan** | Project Manager |
| **Kyle Renzo C. Alis** | Software Generalist |
| **Cristina Bernadette Porras** | UI/UX Designer |
| **John Paul B. Wendam** | Frontend Developer |
| **Jhodie Alyssa Ladran** | Backend Developer |
| **Sean Nichole S. Guipo** | Backend Developer |
| **Rolly G. Abella** | Researcher |

---

## 📄 License & Institutional Compliance
Designed and developed in compliance with **CHED Memorandum Order (CMO) No. 104, Series of 2017** (*Revised Guidelines for Student Internship Program in the Philippines*) for tertiary academic institutions.
