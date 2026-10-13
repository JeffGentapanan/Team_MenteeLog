const fs = require('fs');
const readme = \# 🚀 MenteeLog - OJT & Internship Management System

**One digital log for students, supervisors, and coordinators.**

## Project Overview
MenteeLog is a centralized, multi-role web platform designed to streamline On-the-Job Training (OJT) tracking, Daily Time Record (DTR) logging, Host Training Establishment (HTE) accreditation, and compliance reporting across Philippine universities. It bridges the gap between students, industry partners, and academic coordinators into a single, seamless digital ecosystem.

## Main Goals & Objectives
* **Simplify Student Placement:** Provide a verified directory of HTEs for students to browse and apply to.
* **Digitize Timekeeping:** Replace paper DTRs with a Live GPS-verified digital clock-in/out system.
* **Automate Appraisals:** Eliminate manual grade computation using a built-in 5-point evaluation rubric for supervisors.
* **Centralize Coordinator Governance:** Give faculty coordinators a God-view analytics dashboard to monitor cohort compliance, track requirements, and export CHED reports.
* **Manage Incidents:** Provide a structured reporting module for disciplinary actions or safety claims.

---

## System Roles

| Role | Main Responsibilities |
| --- | --- |
| **Student / Trainee** | OJT Placement application, Requirement Uploads, Digital DTR (Read-Only), Incident Filing |
| **Supervisor / Industry Partner** | Application Review, Timekeeper Authority (Approve/Reject DTRs), 5-Point Performance Appraisal |
| **Coordinator / Faculty Admin**| HTE Accreditation, Bulk Assignment, Cohort Monitoring, Analytics, CHED Report Generation |

---

## System Overview & Core Flow

The MenteeLog ecosystem follows a strict chronological lifecycle to ensure OJT compliance:

\\\mermaid
flowchart TD
    A[Student / Trainee] --> B[Browse HTE Directory]
    B --> C[Submit Application & Requirements]
    C --> D[Coordinator Verifies Placement]
    D --> E[Student Begins OJT]
    
    E --> F[Digital DTR / Timekeeping]
    F --> G{Supervisor Validates}
    G -->|Reject| H[DTR Corrected]
    G -->|Approve| I[Hours Logged]
    
    I --> J{Hours Completed?}
    J -->|No| F
    J -->|Yes| K[Supervisor Performance Appraisal]
    
    K --> L[Automated Rubric Grading]
    L --> M[Coordinator Dashboard & Analytics]
    M --> N[Generate CHED Reports]
\\\

---

## System Architecture & Diagrams

Below are the architectural diagrams outlining the database structure, information architecture, and core system flows.

### Database Schema (ERD)
![Entity-Relationship Diagram](docs/diagrams/erd_schema.png)

### Platform Site Map
![MenteeLog Site Map](docs/diagrams/sitemap.png)

### System Process Flow
![System Flowchart](docs/diagrams/system_flow.png)

---

## Security & Core Logic

* **Absolute-Authority Timekeeping:** Supervisors have complete control over student attendance via a live Timekeeper Terminal. Students are provided a read-only DTR dashboard that reacts instantly to supervisor approvals.
* **Granular Break Tracking:** Break times are strictly tracked and calculated into total weekly hours to ensure labor compliance.
* **Role-Based Access Control (RBAC):** Strict boundaries prevent supervisors from accessing global cohort data or modifying company assignments without Coordinator clearance.

---

## Technology Stack

**Frontend:**
* React.js & Vite
* Vanilla JavaScript (ES6+)
* CSS3 (High-performance transitions & GPU acceleration)
* Leaflet.js (GPS & Geolocation mapping)

**Backend & Database:**
* Node.js & Express
* Supabase
* PostgreSQL
* RESTful APIs

**Design & Prototyping:**
* Figma

---

## Team MenteeLog

MenteeLog is developed collaboratively by:

| Name | Responsibility |
| --- | --- |
| **Jeff A. Gentapanan** | Project Manager |
| **Kyle Renzo C. Alis** | Software Generalist |
| **Cristina Bernadette Porras** | UI/UX Designer |
| **John Paul B. Wendam** | Frontend Developer |
| **Jhodie Alyssa Ladran** | Backend Developer |
| **Sean Nichole S. Guipo** | Backend Developer |
| **Rolly G. Abella** | Researcher |

---

## Live Frontend Demonstration

The working frontend prototype is located in the \rontend-react/\ directory.

\\\ash
cd frontend-react
npm install
npm run dev
\\\

### Sample Demo Accounts
*(Password for all demo accounts: \Demo@2026!\)*

* **Student:** \2021-00421\
* **Supervisor:** \carlos.jose@example.com\
* **Coordinator:** \FAC-2026-001\
\;
fs.writeFileSync('README.md', readme, 'utf8');
