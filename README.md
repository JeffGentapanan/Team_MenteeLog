# 🚀 MenteeLog - OJT & Internship Management System

**A modern, secure, and structured web-based On-the-Job Training tracking system.**

## Project Overview
MenteeLog is a centralized, department-level web platform designed to streamline On-the-Job Training (OJT) tracking, eliminate paper-based Daily Time Records (DTR), simplify Host Training Establishment (HTE) accreditation, and provide a highly controlled digital workflow for students, industry supervisors, and academic coordinators.

## Brand Guidelines & Identity
MenteeLog represents a modern, clean, and highly professional aesthetic.
* **Colors:** Deep Maroon (Primary branding), Soft Sand/Beige (Backgrounds and premium cards), Clean White (Negative space), and Dark Slate (Typography).
* **Typography:** Modern sans-serif fonts optimized for maximum readability across dense data tables and mobile dashboards.
* **UI Philosophy:** Buttery-smooth CSS transitions, hardware-accelerated GPU animations, and zero-jank interaction design.

## Main Goals
* Simplify student OJT placements with a verified HTE directory.
* Eliminate manual, easily-forged paper DTRs.
* Provide GPS-verified clock-in and clock-out mechanisms.
* Support granular tracking of intern break times.
* Allow strict Electoral/Supervisor review and approval of daily hours.
* Automate the student grading process via a built-in 5-point evaluation rubric.
* Provide God-view analytics for cohort compliance.
* Generate instant CHED-compliant export reports.
* Maintain strict audit logs and incident reporting structures.

---

## System Roles
MenteeLog consists of three strictly separated system roles.

| Role | Main Responsibilities |
| --- | --- |
| **Student / Trainee** | Placement application, requirement document uploads, read-only DTR monitoring, and incident filing. |
| **Supervisor / Industry Partner** | Slot management, candidate review, Timekeeper Authority (approving DTRs), and performance appraisals. |
| **Coordinator / Faculty Admin**| System administration, HTE accreditation, bulk assignment, compliance monitoring, analytics, and CHED reports. |

---

## System Overview & Core Workflow

The overall MenteeLog process follows this strict lifecycle:

1. **Coordinator sets up the environment** by accreditating HTEs and managing supervisor accounts.
2. **Supervisor posts available OJT positions** (Slots) for their specific company.
3. **Student logs in** and navigates to the OJT Placement directory.
4. **Student submits an application** to an active position.
5. **Supervisor reviews the application** and decides to Accept, Reject, or put Under Review.
6. **Coordinator verifies the placement**, officially locking the student to that HTE.
7. **Student begins OJT**.
8. **Supervisor manages the DTR Terminal**, clocking the student in, managing break times, and clocking them out using Live GPS verification.
9. **Student monitors hours** on their Read-Only DTR dashboard.
10. **Supervisor performs Final Appraisal** using a built-in 5-point grading rubric once hours are met.
11. **Coordinator monitors global progress** and generates final compliance reports for the university.

---

## Portal Modules Breakdown

### Student Portal
* **Dashboard:** Overview of active hours and placement status.
* **OJT Placement:** Verified directory of available HTE positions.
* **My Applications:** Status tracker for submitted placement requests.
* **Performance Appraisal:** Read-only view of supervisor evaluations.
* **DTR Hub:** Read-only digital time record synced instantly with the supervisor's terminal.
* **Documents:** Secure portal to upload clearances, waivers, and ID requirements.
* **Incident Reports:** Direct line to file safety claims or disputes.

### Supervisor Portal
* **Dashboard:** Roster of active interns and pending tasks.
* **Candidate Review & Application Review:** Pipeline for accepting or rejecting student applicants.
* **Attendance & DTR:** The "Timekeeper Terminal" with absolute authority to log student hours, breaks, and remarks.
* **Performance Appraisal:** Built-in 5-point grading rubric to instantly compute student performance.
* **Slot Management:** Creation of job postings tied securely to the supervisor's read-only company profile.
* **Incident Reports:** Disciplinary logging system.

### Coordinator Portal
* **Dashboard:** High-level metrics of cohort placement and compliance.
* **Job Management & Application Review:** Oversight of all active postings and placements.
* **HTE Accreditation:** Management of partnered companies.
* **Student Placement:** Bulk assignment capabilities for unplaced students.
* **DTR Compliance:** God-view audit of all logged hours across all companies.
* **Report Generation:** Analytics charts and 1-click CHED compliance CSV exports.
* **User Management & Incident Reports:** Administrative oversight of accounts and severe disputes.

---

## Security & Authentication Logic

MenteeLog uses layered security mechanisms to enforce data integrity:
* **Role-Based Access Control (RBAC):** Users are strictly routed to their designated portals. Supervisors cannot access global cohort data, and Students cannot alter their own DTR hours.
* **Absolute-Authority Timekeeping:** Unlike legacy systems where students punch their own time, MenteeLog grants *only* the Supervisor the authority to commit hours, ensuring zero forgery.
* **Field-Level Locks:** Sensitive data, such as a Supervisor's company affiliation, is locked (`readonly`) at the UI level to prevent misrepresentation during slot creation.

---

## Architecture & Diagrams

Below are the architectural diagrams outlining the database structure, information architecture, and core system flows.

### Database Schema (ERD)
![Entity-Relationship Diagram](docs/diagrams/erd_schema.png)

### Platform Site Map
![MenteeLog Site Map](docs/diagrams/sitemap.png)

### System Process Flow
![System Flowchart](docs/diagrams/system_flow.png)

---

## Testing Strategy

**Student Testing:**
* Valid login and profile access.
* Placement application submission.
* Correct denial of access to editing DTR fields.
* Real-time reaction of the DTR Hub when a supervisor clocks them in.

**Supervisor Testing:**
* RBAC restrictions on the Company name during Slot Management.
* Acceptance and rejection of candidates.
* Accurate calculation of Net Hours (subtracting break times).
* Successful submission of the 5-point rubric evaluation.

**Coordinator Testing:**
* Accurate generation of bulk CSV reports.
* Correct display of cohort analytics charts.
* Successful bulk assignment of students to an HTE.

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
MenteeLog is developed collaboratively by Team MenteeLog.

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

## Live Demonstration

The working frontend prototype is located in the `frontend-react/` directory.

```bash
cd frontend-react
npm install
npm run dev
```

### Sample Demo Accounts
*(Password for all accounts: `Demo@2026!`)*

* **Student:** `2021-00421`
* **Supervisor:** `carlos.jose@example.com`
* **Coordinator:** `FAC-2026-001`
