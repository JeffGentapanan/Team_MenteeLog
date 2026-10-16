# MenteeLog — OJT & Internship Management System

**A modern, secure, and centralized web-based On-the-Job Training tracking platform.**

---

## 📌 Project Overview

**MenteeLog** is a centralized, department-level web platform designed to modernize and streamline On-the-Job Training (OJT) tracking. It eliminates paper-based Daily Time Records (DTR), simplifies Host Training Establishment (HTE) accreditation, automates attendance verification through GPS geofencing, and provides a connected, auditable digital workflow for students, company supervisors, and faculty coordinators.

Developed for university OJT programs (including Batangas State University), MenteeLog unifies placement discovery, automated geofence attendance tracking, daily task summaries, performance appraisals with drawn digital signatures, and CHED compliance reporting into three specialized portals.

---

## 🎨 Brand Guidelines & Identity

* **Primary Palette:** Deep Burgundy (`#58111A`), Rose Accent (`#D85A63`), Warm Sand/Cream (`#FAF4E8` / `#EFDFBB`), and Emerald Success (`#059669`).
* **Typography:** Clean, high-legibility sans-serif (`Inter`, `system-ui`) and monospace technical accents (`ui-monospace`, `JetBrains Mono`) for coordinate, telemetry, and time tracking.
* **UI Philosophy:** Frosted acrylic glassmorphism, hardware-accelerated GPU transitions, interactive React Bits & Anime.js-inspired physics, and responsive data tables.
* **Map Design:** Custom Leaflet.js map layer with branded vector SVG pins (teardrop corporate office pin for workplaces and live pulsing GPS radar beacons for interns).

---

## 🎯 Main Objectives & Key Pillars

* **Verified HTE Placements:** Eliminate unaccredited student placements through a vetted directory of partner companies with active Memorandums of Agreement (MOA).
* **Automated 100m GPS Geofence Verification:** Replace manual, easily-forged paper DTRs with automated geofence verification. Shifts clocked within the accredited 100-meter workplace perimeter are automatically verified upon clock-out, freeing company supervisors from tedious daily timekeeper tasks.
* **Interactive Fullscreen Mapping:** Equip students, supervisors, and coordinators with a high-definition Leaflet map and dedicated `⛶ Wide / Fullscreen` viewer to inspect clock-in coordinates, geofence boundaries, and live telemetry.
* **Exception-Based Anomaly Handling:** Shifts recorded outside the accredited 100m perimeter are flagged automatically, prompting the intern to submit an official justification with an embedded clock-in geolocation record map for supervisor review.
* **Granular Break & Shift Tracking:** Accurately compute net rendered hours by deducting lunch and personal breaks with precision resumption and zero lost time.
* **7-Criteria Performance Appraisal with Drawn Signatures:** Streamline intern evaluations with a 5-point rubric (+ N/A option) and an executive HTML5 high-DPI canvas drawing pad for authentic digital signatures.
* **Faculty Governance & God-View Analytics:** Equip coordinators with real-time cohort tracking, incident mediation hubs, and single-click CHED CMO 104 s. 2017 compliant completion and compliance reports.
* **Tamper-Resistant Security:** Enforce strict Role-Based Access Control (RBAC), multi-tab session isolation, OTP account activation, and comprehensive audit logs.

---

## 👥 System Roles & Permissions

| Role | Main Responsibilities |
| :--- | :--- |
| **Student / Trainee** | Browse accredited HTEs, submit applications, upload clearances & MOAs, track live Attendance & DTR (100m GPS clock in/out, millisecond break resume, saved task drafts), review clock-in location maps, submit justifications for flagged shifts, and file incident claims. |
| **Supervisor / Industry Partner** | Post verified training slots, review applicants in a unified pipeline, monitor intern progress (Rendered, Required & Remaining hours), review flagged attendance anomalies and map justifications, and evaluate interns with 7-criteria performance appraisals signed on an interactive digital canvas. |
| **Coordinator / Faculty Admin** | Accredit HTE partners, manage bulk student placements, monitor cohort DTR compliance, mediate student incidents, pre-seed student cohorts via CSV, and export 1-click CHED CMO 104 s. 2017 reports. |

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
    classDef alert fill:#fff1f2,stroke:#dc2626,stroke-width:2px,color:#991b1b;

    %% 1. Pre-Placement Phase
    subgraph Phase1 ["1. OJT Discovery, Application & Placement"]
        A["Student: Browse Accredited HTE Directory"]:::student --> B["Student: Submit Application & Clearance Documents"]:::student
        B --> C["Supervisor: Screen in Unified Candidate Review Hub"]:::supervisor
        C --> D{"Supervisor Decision"}:::decision
        D -->|"Under Review / Interview"| C
        D -->|"Rejected"| B
        D -->|"Accepted"| E["Coordinator: Validate in Student Placement Hub & Lock Assignment"]:::coordinator
        E --> F["Student Officially Placed at Host Training Establishment (HTE)"]:::action
    end

    %% 2. Daily Attendance & Geofenced Timekeeping Phase
    subgraph Phase2 ["2. Automated Geofence Timekeeping, Breaks & Log Sheets"]
        F --> G["Student: Clock In on Student Portal with Live 100m GPS Verification"]:::student
        G --> H["Live Shift Timer Running (Millisecond Precision + Task Drafts)"]:::action
        H --> I{"Take Lunch / Personal Break?"}:::decision
        I -->|"Yes"| J["Student: Start Break (Work Timer Pauses, Break Timer Runs)"]:::student
        J --> K["Student: End Break & Resume (Precision Resumption)"]:::student
        K --> H
        I -->|"No"| L["Student: Clock Out & Submit Daily Task Summary"]:::student
        L --> M{"GPS Check: Within 100m HTE Geofence?"}:::decision
        M -->|"Yes (On-Site)"| N["✓ Auto-Verified On-Site: Hours Accrue Directly to Meter"]:::action
        M -->|"No (Off-Site Anomaly)"| O["⚠️ Shift Flagged: Student Submits Justification with Map Record"]:::alert
        O --> P["Supervisor: Review Flagged Shift, Explanation & Geolocation Map"]:::supervisor
        P --> Q{"Supervisor Sign-Off"}:::decision
        Q -->|"Approved"| N
        Q -->|"Rejected"| R["Shift Rejected / Resubmission Required"]:::alert
    end

    %% 3. Performance Appraisal & Evaluation Phase
    subgraph Phase3 ["3. 7-Criteria Performance Appraisal & Digital Signing"]
        N --> S{"Required Hours Rendered? (e.g. 500 Hours)"}:::decision
        S -->|"No"| G
        S -->|"Yes"| T["Supervisor: Complete 7-Criteria Rubric (5-Point Scale + NA)"]:::supervisor
        T --> U["Supervisor: Apply Digital Signature on High-DPI Canvas Station"]:::supervisor
        U --> V["Student: View Signed Appraisal Breakdown & Rubric Scores"]:::student
    end

    %% 4. Governance & Completion
    subgraph Phase4 ["4. Faculty Governance, Compliance & CHED Reports"]
        V --> W["Coordinator: Verify Completion, Documents & Incident Clearance"]:::coordinator
        W --> X["Coordinator: Export 1-Click CHED CMO 104 s. 2017 Reports & Certificate"]:::coordinator
        X --> Y["OJT Program Successfully Completed"]:::action
    end

    %% Session Security
    Z["Any Portal: Click Sign Out"] --> AA{"Confirm Logout Dialog?"}:::decision
    AA -->|"Cancel"| AB["Remain Logged In"]:::action
    AA -->|"Confirm"| AC["Secure Session Termination & Return to Login"]:::action
```

---

## 🏛️ System Architecture & Site Maps

### 1. Platform Site Map (Hierarchical View)

```mermaid
---
config:
  layout: elk
  theme: base
  themeVariables:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '13px'
    primaryColor: '#EFDFBB'
    primaryTextColor: '#1F2937'
    primaryBorderColor: '#58111A'
    lineColor: '#6B7280'
    tertiaryColor: '#FAF4E8'
    clusterBkg: '#FAF4E8'
    clusterBorder: '#EFDFBB'
---
graph TD
  %% ====================================================
  %% 1. PUBLIC & AUTHENTICATION PORTAL
  %% ====================================================
  subgraph PublicAuth ["1.0 Public & Authentication Portal"]
    P1["1.0 Landing Page (Hero & Stats)"]
    P2["1.1 Auth Hub (Multi-Role Gateway)"]
    P3["1.2 Forgot Password Modal"]
    P4["1.3 Account Activation / Password Reset"]

    P1 --> P2
    P2 --> P3
    P3 --> P4
  end

  %% ====================================================
  %% 2. OJT STUDENT PORTAL
  %% ====================================================
  subgraph StudentPortal ["2.0 OJT Student Portal"]
    S0["2.0 Student Dashboard<br/>(Rendered Hours, Progress Bar & Host Company)"]
    S1["2.1 Profile Setup & Settings"]
    S2["2.2 Job Browse & Apply<br/>(CHED Accredited HTE Listings)"]
    S3["2.3 Application Status Tracker"]
    S4["2.4 Attendance & DTR Geofence Hub<br/><b>100m Workplace Geofence · Live Map & Fullscreen View</b><br/><i>(Live Clock In/Out, Auto-Verification & Breaks)</i>"]
    S4_Justify["2.4a Attendance Justification Modal<br/><i>(Off-Site Flag Explanation & Clock-In Location Map)</i>"]
    S5["2.5 Student Incident Module (Form & Evidence Upload)"]
    S6["2.6 Performance Appraisal Result<br/>(7-Criteria Rubric Breakdown & Digital Signature)"]
    S7["2.7 Documents & Requirements<br/>(MOA, Endorsement Letter & Clearances)"]

    S0 --> S1
    S0 --> S2
    S0 --> S3
    S0 --> S4
    S4 -.->|If Shift Flagged Off-Site| S4_Justify
    S0 --> S5
    S0 --> S6
    S0 --> S7
  end

  %% ====================================================
  %% 3. COMPANY SUPERVISOR PORTAL
  %% ====================================================
  subgraph SupervisorPortal ["3.0 Company Supervisor Portal"]
    Sup0["3.0 Supervisor Dashboard<br/>(Active Interns Overview & Quick Action Cards)"]
    Sup1["3.1 Candidate & Application Review Hub<br/>(Pipeline: All, Under Review, Accepted, Rejected)"]
    Sup2["3.2 Log Sheets & Attendance Overview<br/><b>Auto-Verified Hours Tracking</b><br/><i>(Rendered, Required & Remaining Hours · Review Flagged Shifts & Record Map)</i>"]
    Sup3["3.3 Disciplinary Module (Incident Form & DTR Link)"]
    Sup4["3.4 Performance Appraisal Module<br/>(7-Criteria Rubric, 5-Point Scale & Canvas Signature)"]
    Sup5["3.5 Slot Management (OJT Job Postings & Capacity)"]

    Sup0 --> Sup1
    Sup0 --> Sup2
    Sup0 --> Sup3
    Sup0 --> Sup4
    Sup0 --> Sup5
  end

  %% ====================================================
  %% 4. FACULTY OJT COORDINATOR / ADMIN PORTAL
  %% ====================================================
  subgraph CoordinatorPortal ["4.0 Faculty OJT Coordinator Portal"]
    C0["4.0 Coordinator Dashboard"]
    C1["4.1 Job Management (Cross-HTE Oversight)"]
    C2["4.2 HTE Accreditation (Partner MOAs & Status)"]
    C3["4.3 Student Placement Hub<br/>(Roster Pipeline, Endorsement Letters & Supervisor Assignment)"]
    C4["4.4 DTR Compliance Review<br/>(Weekly Logbook Audit, 100m GPS Verification & Breaks)"]
    C5["4.5 Report Generation<br/>(CHED CMO 104 s. 2017 Compliance & Completion Reports)"]
    C6["4.6 Incident Reports<br/>(Red Queue & Mediation Meeting Scheduler)"]

    subgraph UserGov ["4.7 User Management Scope"]
      C7_1["Pre-Seed OJT Candidates<br/>(CSV Batch Import: identifier, name, email, course)"]
      C7_2["Provision Faculty Accounts"]
      C7_3["RBAC Security Summary"]
      C7_1 --> C7_2
      C7_2 --> C7_3
    end

    C0 --> C1
    C0 --> C2
    C0 --> C3
    C0 --> C4
    C0 --> C5
    C0 --> C6
    C0 --> UserGov
  end

  %% ====================================================
  %% 5. SHARED NAVIGATION & SYSTEM OVERLAYS
  %% ====================================================
  subgraph SharedServices ["Shared Navigation & System Overlay"]
    Sh1_Modal["1.3 Logout Confirmation Modal<br/>(Are you sure you want to log out?)"]
    Sh1["1.4 Sign Out / Session Termination"]
    Sh2["1.5 Header Notification Drawer"]
    Sh3["1.6 Notifications Center Page"]

    Sh1_Modal -->|Confirm Logout| Sh1
    Sh2 --> Sh3
  end

  %% ====================================================
  %% AUTHENTICATION ROUTING & SHARED OVERLAYS
  %% ====================================================
  P4 -->|Student Credentials| S0
  P4 -->|Supervisor Credentials| Sup0
  P4 -->|Coordinator Credentials| C0

  StudentPortal -.-> Sh1_Modal
  SupervisorPortal -.-> Sh1_Modal
  CoordinatorPortal -.-> Sh1_Modal
  Sh1 -->|Clear Session| P1

  StudentPortal -.-> Sh2
  SupervisorPortal -.-> Sh2
  CoordinatorPortal -.-> Sh2

  %% ====================================================
  %% BRANDED COLOR STYLES
  %% ====================================================
  classDef publicAuth fill:#FAF4E8,stroke:#EFDFBB,stroke-width:2px,color:#58111A
  classDef studentPortal fill:#FFFFFF,stroke:#EFDFBB,stroke-width:2px,color:#1F2937
  classDef supervisorPortal fill:#FFFFFF,stroke:#6B7280,stroke-width:2px,color:#1F2937
  classDef coordinatorPortal fill:#FFFFFF,stroke:#58111A,stroke-width:2px,color:#1F2937
  classDef sharedServices fill:#EFDFBB,stroke:#58111A,stroke-width:2px,color:#58111A
  classDef redReport fill:#58111A,stroke:#58111A,stroke-width:2px,color:#FAF4E8

  class P1,P2,P3,P4 publicAuth
  class S0,S1,S2,S3,S4,S4_Justify,S5,S6,S7 studentPortal
  class Sup0,Sup1,Sup2,Sup3,Sup4,Sup5 supervisorPortal
  class C0,C1,C2,C3,C4,C5,C6,C7_1,C7_2,C7_3 coordinatorPortal
  class Sh1_Modal,Sh1,Sh2,Sh3 sharedServices
  class C6,S5,Sup3 redReport
```

---

### 2. Multi-Role System Architecture & Persistence Flow

```mermaid
---
config:
  layout: elk
  theme: base
  themeVariables:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '13px'
    primaryColor: '#EFDFBB'
    primaryTextColor: '#1F2937'
    primaryBorderColor: '#58111A'
    lineColor: '#6B7280'
    tertiaryColor: '#FAF4E8'
    clusterBkg: '#FAF4E8'
    clusterBorder: '#EFDFBB'
---
graph TB
  %% ====================================================
  %% 1. PUBLIC / AUTHENTICATION MODULE
  %% ====================================================
  subgraph PublicAuth["PUBLIC / AUTHENTICATION SERVICES"]
    LandingPage["1.0 Landing Page<br/><i>(Hero + Platform Stats + OJT Guide)</i>"]
    AuthHub[["1.1 Auth Hub<br/><b>Multi-Role Gateway</b>"]]
    ForgotPassword["1.2 Forgot Password Modal<br/><i>(Email Link Request)</i>"]
    AuthDecision{"Role Auth Check<br/><b>Valid Credentials?</b>"}

    subgraph AuthTabs["Authentication Portals"]
      StudentTab["Student Portal<br/><code>SR Code + Password</code>"]
      SupervisorTab["Supervisor Portal<br/><code>Corporate Email + Password</code>"]
      CoordinatorTab["Coordinator Portal<br/><code>Faculty ID + Password</code>"]
    end

    ActivationModal["Account Activation / Password Reset<br/><i>(Token Verification)</i>"]
    SignOutConfirmModal["1.3 Logout Confirmation Modal<br/><i>(Are you sure you want to log out?)</i>"]
    SignOutNode["1.4 Sign Out / Session Termination<br/><i>(Token Revocation & State Reset)</i>"]
    HeaderNotificationDrawer["1.5 Header Notification Drawer<br/><i>(Bell Icon Overlay)</i>"]
    NotificationCenter["1.6 Notifications Center Page<br/><i>(Tabs: All, Unread, System)</i>"]
  end

  %% ====================================================
  %% 2. STUDENT PORTAL
  %% ====================================================
  subgraph StudentPortal["STUDENT PORTAL SERVICES"]
    Dashboard2["2.0 Student Dashboard<br/><i>(OJT Progress, Hours & HTE Details)</i>"]
    ProfileSetup2["2.1 Profile Setup"]
    JobBrowse2["2.2 Job Browse & Apply<br/><i>(CHED Accredited Listings)</i>"]
    ApplicationStatus2["2.3 Application Status Tracker"]
    
    subgraph StudentDTRSub["2.4 Attendance & Geofence Hub"]
      DTRStudent2["Live Clock In, Break & Clock Out<br/><i>(Millisecond Timer + Policy Notice)</i>"]
      LiveMapStudent["Interactive HTE Geofence Map<br/><b>100m Perimeter · Live GPS Beacon</b><br/><i>(⛶ Wide / Fullscreen View Support)</i>"]
      GPSDecision{"GPS Check<br/><b>Within 100m Geofence?</b>"}
      AutoVerifiedLog["✓ Auto-Verified On-Site<br/><i>(Direct Approval)</i>"]
      FlaggedLog["⚠️ Flagged Shift<br/><i>(Outside Geofence Anomaly)</i>"]
      JustificationModal2["Attendance Justification Modal<br/><i>(Explanation + Proof + Record Map)</i>"]
    end

    StudentReport2["2.5 Student Incident Module<br/><i>(Form + Evidence Upload)</i>"]
    AppraisalResult2["2.6 Performance Appraisal Result<br/><b>7-Criteria Rubric Feedback</b><br/><i>(Score Breakdown + Digital Signature)</i>"]
    Documents2["2.7 Documents & Requirements<br/><i>(Uploads, MOAs & Clearances)</i>"]
  end

  %% ====================================================
  %% 3. SUPERVISOR PORTAL
  %% ====================================================
  subgraph SupervisorPortal["SUPERVISOR PORTAL SERVICES"]
    Dashboard3["3.0 Supervisor Dashboard<br/><i>(Active Interns & Quick Stats)</i>"]
    CandidateReview3["3.1 Candidate & Application Review Hub<br/><b>Pipeline: All, Review, Accepted, Rejected</b>"]
    
    subgraph SupervisorDTRSub["3.2 Attendance & DTR Overview"]
      LogSheetsSummary3["Log Sheets & Summary<br/><b>Rendered, Required & Remaining Hours</b>"]
      ReviewFlaggedDTR["Flagged Attendance Review<br/><i>(Inspect Justification & Clock-In Map Record)</i>"]
    end

    SupervisorReport3["3.3 Disciplinary Module<br/><i>(Form + DTR Log Link)</i>"]
    AppraisalSubmission3["3.4 Performance Appraisal Module<br/><b>7-Criteria Evaluation Instrument</b><br/><i>(5-Point Rubric + Canvas Digital Signature)</i>"]
    SlotManagement3["3.5 Slot Management<br/><i>(Job Postings & Available Slots)</i>"]
  end

  %% ====================================================
  %% 4. COORDINATOR / ADMIN PORTAL
  %% ====================================================
  subgraph CoordinatorPortal["COORDINATOR / ADMIN PORTAL SERVICES"]
    Dashboard4["4.0 Coordinator Dashboard"]
    JobManagement4["4.1 Job Management"]
    HTEAccreditation4["4.2 HTE Accreditation<br/><i>(Partner Companies & MOAs)</i>"]
    StudentPlacement4["4.3 Student Placement Hub<br/><b>Candidate Tracking & Endorsements</b>"]
    DTRCompliance4["4.4 DTR Compliance Review<br/><i>(Audit Logs, 100m GPS & Break Verification)</i>"]
    ReportsAnalytics4["4.5 Report Generation<br/><i>(CHED CMO 104 s. 2017 Compliance)</i>"]

    subgraph SidebarLeftNav["Central Compliance Drawer"]
      IncidentHub4["4.6 Incident Reports<br/><b>Red Queue • Disciplinary Logs</b>"]
    end

    subgraph UserManagementScope["4.7 User Management Scope"]
      PreSeedBatch4["Pre-Seed OJT Candidates<br/><i>(CSV Batch Import)</i>"]
      ProvisionCoordinator4["Provision Faculty Accounts"]
      RBACSummary4["RBAC Security Summary"]
    end
  end

  %% ====================================================
  %% 5. SHARED DATA STORES (PERSISTENCE LAYER)
  %% ====================================================
  subgraph SharedDataStores["SHARED PERSISTENCE LAYER (DATABASES)"]
    UserStore[("User Store<br/>Users & Accounts")]
    JobStore[("Job Store<br/>Listings & HTE Specs")]
    ApplicationStore[("Application Store<br/>Applications & Appraisals")]
    DTRStore[("DTR & Logbook Store<br/>Clock-ins, GPS, Breaks & Justifications")]
    ReportStore[("Incident Report Store<br/>Violations & Claims")]
    BadgesStore[("Badges & Status Store<br/>Role & Accreditation Flags")]
    NotificationStore[("Notification Store<br/>Logs & System Alerts")]
  end

  %% ====================================================
  %% CONNECTIONS & ROUTING FLOWS
  %% ====================================================
  LandingPage --> AuthHub
  AuthHub --> AuthTabs
  AuthTabs -.->|Reset Request| ForgotPassword
  ForgotPassword -->|Send Reset Token| ActivationModal
  StudentTab --> ActivationModal
  SupervisorTab --> ActivationModal
  CoordinatorTab --> ActivationModal
  ActivationModal -->|Token Verified| AuthDecision
  AuthDecision -->|Student Role| Dashboard2
  AuthDecision -->|Supervisor Role| Dashboard3
  AuthDecision -->|Coordinator Role| Dashboard4

  %% Logout Flow with Confirmation Modal
  Dashboard2 -.->|Sign Out Clicked| SignOutConfirmModal
  Dashboard3 -.->|Sign Out Clicked| SignOutConfirmModal
  Dashboard4 -.->|Sign Out Clicked| SignOutConfirmModal
  SignOutConfirmModal -->|Confirm Logout| SignOutNode
  SignOutConfirmModal -.->|Cancel| Dashboard2
  SignOutConfirmModal -.->|Cancel| Dashboard3
  SignOutConfirmModal -.->|Cancel| Dashboard4
  SignOutNode -->|Clear Session| LandingPage

  %% Notifications
  Dashboard2 -.->|Bell Icon| HeaderNotificationDrawer
  Dashboard3 -.->|Bell Icon| HeaderNotificationDrawer
  Dashboard4 -.->|Bell Icon| HeaderNotificationDrawer
  HeaderNotificationDrawer -->|View All| NotificationCenter
  NotificationCenter -.->|Back| Dashboard2
  NotificationCenter -.->|Back| Dashboard3
  NotificationCenter -.->|Back| Dashboard4

  %% Student Navigation & DTR Geofence Flow
  Dashboard2 --> ProfileSetup2
  Dashboard2 --> JobBrowse2
  Dashboard2 --> ApplicationStatus2
  Dashboard2 --> DTRStudent2
  Dashboard2 --> StudentReport2
  Dashboard2 --> AppraisalResult2
  Dashboard2 --> Documents2

  DTRStudent2 <--> LiveMapStudent
  DTRStudent2 -->|Clock Out Triggered| GPSDecision
  GPSDecision -->|Inside 100m| AutoVerifiedLog
  GPSDecision -->|Outside 100m| FlaggedLog
  AutoVerifiedLog -->|Save Approved Log| DTRStore
  FlaggedLog -->|Prompt Student| JustificationModal2
  JustificationModal2 -->|Submit Justification & Map| DTRStore
  FlaggedLog -.->|Alert Anomaly| NotificationStore

  %% Supervisor Navigation & Exception Handling
  Dashboard3 --> CandidateReview3
  Dashboard3 --> LogSheetsSummary3
  Dashboard3 --> SupervisorReport3
  Dashboard3 --> AppraisalSubmission3
  Dashboard3 --> SlotManagement3

  LogSheetsSummary3 -.->|Filter Flagged Shifts| ReviewFlaggedDTR
  ReviewFlaggedDTR -->|Sign-Off or Reject| DTRStore

  %% Coordinator Navigation
  Dashboard4 --> JobManagement4
  Dashboard4 --> HTEAccreditation4
  Dashboard4 --> StudentPlacement4
  Dashboard4 --> DTRCompliance4
  Dashboard4 --> ReportsAnalytics4
  Dashboard4 --> IncidentHub4
  Dashboard4 --> PreSeedBatch4
  PreSeedBatch4 --> ProvisionCoordinator4
  ProvisionCoordinator4 --> RBACSummary4

  %% Persistence & Store Data Flows
  LogSheetsSummary3 -.->|Read Verified Hours| DTRStore
  DTRCompliance4 -.->|Audit Logs & 100m Geofence| DTRStore
  StudentReport2 -->|Write Incident| ReportStore
  SupervisorReport3 -->|Write Disciplinary Log| ReportStore
  AppraisalSubmission3 -->|Write 7-Criteria Rubric & Canvas Signature| ApplicationStore
  AppraisalResult2 -.->|Read Score & Signature| ApplicationStore
  ReportStore -.->|Trigger Red Badge| IncidentHub4
  ReportStore -.->|Write Disciplinary Alert| NotificationStore
  ApplicationStore -.->|Write Status Change| NotificationStore
  ForgotPassword -.->|Verify Email| UserStore
  SignOutNode -.->|Revoke Token| UserStore
  HeaderNotificationDrawer -.->|Read Alerts| NotificationStore
  NotificationCenter -.->|Read/Write Status| NotificationStore
  Dashboard2 -.->|Read/Write| UserStore
  Dashboard2 -.->|Read| JobStore
  Dashboard2 -.->|Read/Write| ApplicationStore
  Dashboard2 -.->|Read| BadgesStore
  Dashboard3 -.->|Read| UserStore
  Dashboard3 -.->|Read| JobStore
  Dashboard3 -.->|Read/Write| ApplicationStore
  Dashboard4 -.->|Read/Write| UserStore
  Dashboard4 -.->|Read/Write| JobStore
  Dashboard4 -.->|Read/Write| ApplicationStore
  Dashboard4 -.->|Read/Write| BadgesStore
  IncidentHub4 -.->|Read/Write Status| ReportStore
  PreSeedBatch4 -.->|Batch Write| UserStore
  PreSeedBatch4 -.->|Batch Tag| BadgesStore

  %% ====================================================
  %% BRANDED COLOR STYLES (MenteeLog Palette)
  %% ====================================================
  classDef publicAuth fill:#FAF4E8,stroke:#EFDFBB,stroke-width:2px,color:#58111A;
  classDef studentPortal fill:#FFFFFF,stroke:#EFDFBB,stroke-width:2px,color:#1F2937;
  classDef supervisorPortal fill:#FFFFFF,stroke:#6B7280,stroke-width:2px,color:#1F2937;
  classDef coordinatorPortal fill:#FFFFFF,stroke:#58111A,stroke-width:2px,color:#1F2937;
  classDef sharedData fill:#EFDFBB,stroke:#58111A,stroke-width:2px,color:#58111A;
  classDef redReport fill:#58111A,stroke:#58111A,stroke-width:2px,color:#FAF4E8;
  classDef decision fill:#FAF4E8,stroke:#58111A,stroke-width:2px,color:#1F2937;
  classDef greenVerify fill:#F0FDF4,stroke:#16A34A,stroke-width:2px,color:#166534;
  classDef redFlag fill:#FEF2F2,stroke:#DC2626,stroke-width:2px,color:#991B1B;

  class LandingPage,AuthHub,StudentTab,SupervisorTab,CoordinatorTab,ActivationModal,ForgotPassword,SignOutConfirmModal,SignOutNode,HeaderNotificationDrawer,NotificationCenter publicAuth;
  class AuthDecision,GPSDecision decision;
  class Dashboard2,ProfileSetup2,JobBrowse2,ApplicationStatus2,DTRStudent2,LiveMapStudent,JustificationModal2,AppraisalResult2,Documents2 studentPortal;
  class Dashboard3,CandidateReview3,LogSheetsSummary3,ReviewFlaggedDTR,AppraisalSubmission3,SlotManagement3 supervisorPortal;
  class Dashboard4,JobManagement4,HTEAccreditation4,StudentPlacement4,DTRCompliance4,ReportsAnalytics4,RBACSummary4,PreSeedBatch4,ProvisionCoordinator4 coordinatorPortal;
  class StudentReport2,SupervisorReport3,IncidentHub4 redReport;
  class UserStore,JobStore,ApplicationStore,DTRStore,ReportStore,BadgesStore,NotificationStore sharedData;
  class AutoVerifiedLog greenVerify;
  class FlaggedLog redFlag;
```

---

## 🔐 Core Portals Breakdown

### 1. Student Portal (`#/student/dashboard`)
* **Dashboard:** Visual progress bar (`Rendered / Required hours`), placement overview, and active supervisor contact details.
* **OJT Placement:** Directory of accredited partner companies with skill-matching badges, BSIT scope filters, and slot availability.
* **My Applications:** Pipeline tracking from *Pending* to *Under Review* to *Accepted*.
* **Attendance & DTR Hub (`#/student/dtr`):**
  * **100m GPS Geofence Verification:** Measures proximity to accredited workplace premises using Haversine calculation.
  * **Interactive Leaflet Map & Fullscreen Viewer:** High-definition vector pins (crimson building pin and green radar pulsing beacon) with a dedicated `⛶ Wide / Fullscreen` button.
  * **Automated Clock-Out Verification:** Shifts clocked inside the 100m perimeter are automatically verified on-site.
  * **Attendance Justification Modal:** Off-site shifts are flagged with an anomaly notice, allowing the intern to submit an explanation with attached evidence and inspect the recorded clock-in map.
  * **Break & Task Tracking:** High-precision pause/resume for lunch breaks and task reflection saving.
* **Requirements & Vault:** Secure document uploader for medical clearances, parent consent waivers, and endorsed MOAs.
* **Performance Appraisal:** 7-criteria rubric breakdown and digital drawn canvas signature verification.
* **Incident Reports:** Dispute filing system with screenshot and document attachment support.

### 2. Supervisor Portal (`#/supervisor/dashboard`)
* **Dashboard:** Active intern roster overview with quick-action cards and shift status summaries.
* **Candidate Review:** Unified applicant pipeline with tabs (*All*, *Under Review*, *Accepted*, *Rejected*) and resume preview.
* **Log Sheets & Attendance Overview (`#/supervisor/dtr`):**
  * **Automatic Attendance Monitoring:** Tracks accrued intern hours without requiring daily manual clock-in intervention.
  * **Flagged Shift Review & Map Inspection:** Review off-site attendance anomalies, read intern justifications, and inspect the exact clock-in geolocation with the `⛶ Wide / Fullscreen` map viewer.
* **Performance Appraisal (`#/supervisor/appraisals`):** 7-criteria evaluation instrument with 1–5 scoring scale (+ N/A option) and an executive HTML5 high-DPI canvas drawing pad for authentic digital signatures.
* **Slot Management:** Creation of training listings strictly bound to the supervisor's accredited company profile.
* **Incident Hub:** Disciplinary action reporting and incident tracking.

### 3. Coordinator Portal (`#/coordinator/dashboard`)
* **Dashboard:** Cohort placement statistics, accredited partner totals, and compliance alerts.
* **HTE Accreditation:** Directory management, accreditation renewals, and partner verification.
* **Student Placement:** Unified roster pipeline to review applications and assign students to accredited HTEs.
* **DTR Compliance Queue:** Global audit log of all rendered student hours, flagged records, and attendance anomalies.
* **Report Generation:** Export batch completion certificates and CHED CMO-compliant CSV reports with a single click.
* **Central Incident Hub:** Mediation center for workplace harassment, AWOL claims, and placement reassignment.
* **User Management Scope:** Pre-seed candidate rosters via CSV import, provision faculty accounts, and review RBAC security.

---

## 🔑 Demo Accounts & Credentials

To explore the connected portals, use the following pre-configured demonstration accounts:

> **Universal Demo Password:** `Demo@2026!`

| Portal | Role | Username / Identifier | Registered Email | Assigned Company / Dept |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | OJT Student | `2021-00421` | `kenzosomes@gmail.com` | Accenture Philippines (Assigned to `shisuizhin`) |
| **Supervisor** | Industry Supervisor | `shisulzhin@gmail.com` | `shisulzhin@gmail.com` | Accenture Philippines (Supervising `kenzosomes`) |
| **Coordinator** | Faculty Admin | `FAC-2026-001` | `jeff.gentapanan2004525@gmail.com` | College of Information Technology |

---

## ⚡ Recent Updates & Key Improvements

### 1. Automated 100m GPS Geofence Verification (`#/student/dtr`)
* Scaled down the geofence perimeter from an overly broad 500m area to a focused **100-meter radius**, representing the actual building footprint and campus grounds (e.g. Accenture Philippines at Iloilo Business Park).
* On-site shifts are placed directly within the building premises (~11 meters from building center).
* When interns clock out on-site, attendance is automatically verified, relieving supervisors of tedious daily manual timekeeping sign-offs.

### 2. High-Definition Vector Map Pins & Pulse Animation
* **Accredited Workplace Pin:** Replaced generic emoji circles with an executive teardrop pin in MenteeLog's signature deep burgundy (`#58111A`), a white circular badge with a corporate building vector icon, and a dark *"Workplace"* label pill.
* **Intern Location Beacon:** Custom emerald green pin (`#059669`) featuring an intern silhouette icon, 3D drop shadow, an animated pulsing radar wave (`@keyframes mlgPulse`), and a *"You (On-Site)"* label pill.
* **Off-Site Warning Pin:** Crimson alert pin (`#dc2626`) with a warning indicator and red pulsing radar ring for anomalous locations.
* **Pixel-Perfect Needle Tip:** Anchors are calibrated to `[22, 53]` to pinpoint coordinates on the map tiles with exact precision.

### 3. Dedicated Wide / Fullscreen Interactive Map Viewer
* Added **`⛶ Wide / Fullscreen`** buttons across the Student DTR card, DTR History modal, and Attendance Justification modal.
* Opens an expansive viewport overlay with backdrop blur, coordinates badge, geofence status badge, pan/zoom controls, and instant **`ESC` key** dismissal.
* In on-site mode, the map automatically fits closely around the 100m circle (Zoom Level 18) for an unobstructed, close-up street view.

### 4. Interactive Draw Signature Station for Appraisals (`#/supervisor/appraisals`)
* Replaced text fields with an executive **Draw Signature** station featuring a high-DPI HTML5 canvas pad with mouse, pen, and touch-screen drawing support.
* Includes signature guideline (`✕ SIGN ABOVE THE LINE`), quick clear button, signatory name input, and institutional certification declaration.
* Resilient persistence across Supabase, local cache, and notification dispatch.

### 5. Multi-Tab Session Isolation & Page Reload Fix
* Resolved browser storage and routing conflicts using scoped session storage (`sessionStorage.SESSION.<role>`).
* Reloading any active tab accurately persists the current portal view and prevents session drops or accidental role switching.

### 6. Interactive DTR Clock & Modern Authentication Experience (`#/login`)
* Active analog & digital clock dial animation featuring **CLOCK IN (08:00 AM)** and **CLOCK OUT (05:00 PM)** pins, glowing shift duration arc, and live sweeping clock hands.
* Blueprint geometric gridlines with interactive cursor spotlight tracking (`--spotlight-x`, `--spotlight-y`).
* Zero-scroll 100% zoom fit ensuring all form inputs, role capsules, actions, and activation links fit cleanly without page scrolling.

### 7. Account Activation & OTP Verification Flow (`#/activate`)
* 3-step activation pipeline: identifier & email verification, 6-digit numeric OTP validation, and secure password setup.

### 8. BSIT Scope Focus & Academic Standardization
* Standardized academic scope strictly to **BSIT (Bachelor of Science in Information Technology)** across the public landing page, student directory, partner listings, and portal dashboards.

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
| :--- | :--- |
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
