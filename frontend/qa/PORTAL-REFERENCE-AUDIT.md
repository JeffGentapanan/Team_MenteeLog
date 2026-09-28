# Portal reference audit — September 28, 2026

## Reference set

Reviewed the supplied `drive-download-20260928T071736Z-1-001` portal folders and the attached flowchart. The inventory contains **206 PNG files**: **112 coordinator**, **43 student**, and **51 supervisor** exports, with 203 distinct file hashes. All exports were visually inspected in contact sheets; selected screens were also inspected at original size. `Student DTR Hub/dtr-not-clocked-v2.png` is a 121×10 label fragment, not an additional page. Some dashboard “dropdown” exports have exactly the same pixels as the dashboard image.

`reference-audit/inventory.json` records every original relative filename, dimensions, SHA-256 hash, and corresponding sidebar route. Original reference files were not modified or copied into the deployable application. Temporary contact sheets were removed after inspection.

## Corrections by module

| Portal / module | Reference files | Implemented structure and flows |
| --- | ---: | --- |
| Student dashboard | 3 | Existing cream dashboard, hours/status tiles, weekly chart, notifications, placement summary retained. |
| Student placement | 8 | Program filters, expanded filters, vertical opportunity cards, full-page job details, resume/profile application dialog, submitted state. |
| Student application tracker | 1 | Compact application cards with four-step progress indicators and status badges. |
| Student DTR | 14 | Three summary tiles; clock/map/task column; history/draft column; clock-out confirmation, separate daily-log submission, saved drafts, justification/evidence, date-filtered PDF/CSV export. |
| Student documents | 5 | Upload area, category/file rows, metadata, preview/download controls; actual IndexedDB storage; 10 MB file limit. |
| Student appraisal | 1 | Identity banner and overall score, numbered five-item rubric with selected score boxes, supervisor comments panel. |
| Student incidents | 5 | Summary cards, case tabs, in-panel claim form, evidence, full case details and activity. |
| Supervisor dashboard | 14 | Four compact metrics, quick actions, assigned-intern roster, bulk approvals, slot creation, scoped emergency notification form. |
| Supervisor DTR | 10 | Compact review table; individual/rejection/bulk confirmation dialogs; draw/upload signature modes and typed fallback; full-page weekly record/task views. |
| Supervisor appraisal | 4 | Roster, full-page rubric form, submitted evaluation, success summary. |
| Supervisor slots | 12 | Active/archived lists, full-page details and editing, deactivate confirmation, restoration, application-review access. |
| Supervisor incidents | 5 | Source-specific forms with linked DTR, case listing/detail/evidence, coordinator resolution visibility. |
| Coordinator dashboard | 3 | Existing four metrics, placement breakdown, HTE status, activity feed retained. |
| Coordinator HTE | 12 | Metrics/table, company information/document drawer, three-step accreditation, renewal queue/form/success, activity list/export. Job management remains reachable through company details. |
| Coordinator placement | 25 | Table/grid/company/unassigned/cohort/performance views, intern profile tabs, assignment and batch assignment, clearance form, report/export access. |
| Coordinator DTR | 9 | Compliance tiles, student table, flagged queue/review, local validation results, settings, department chart, student DTR details/export. |
| Coordinator reports | 35 | Editable defaults, four report types/custom builder, configuration, paper preview/custom rows, PDF/CSV generation, success/download, history/edit/delete, analytics, email draft. |
| Coordinator governance | 10 | Overview/import, registered users, RBAC tabs; validated CSV preview then atomic import; inline faculty provisioning; account activation/locking preview. |
| Shared notification centers | 18 | Compact notification rows, All/Unread/System & DTR/Incidents & Alerts tabs, read/clear actions, dashboard return; header preview drawer retained. |

All detail/form routes stay nested below the correct portal sidebar route. Student profile setup and session termination remain in the top-right account menu, following the flowchart. Existing creator accounts and saved local records are preserved.

## Flowchart decisions and frontend boundaries

- The flowchart assigns DTR sign-off to supervisors. Coordinator compliance review records findings and returns entries for supervisor sign-off; it does not impersonate a supervisor despite approval buttons appearing in some coordinator PNGs.
- Names, counts, dates, companies, hours, and statuses come from the working local records. They intentionally change with user actions rather than reproducing fixed screenshot values.
- Reports generate real PDF or Excel-compatible CSV files. They are demonstration reports, not certified CHED submissions. Email sharing prepares a downloadable draft; there is no email service.
- Browser location capture is not presented as verified GPS. Signatures are locally stored marks for the frontend demonstration, not a production signing service.
- Account activation/token verification, authoritative RBAC, email/SMS, cloud persistence, and malware scanning still require a backend. The existing same-origin API adapter remains available for that integration.
- Generic accessible components are shared across similar dialogs and empty states. The work is a structural/visual correction based on all reference groups, not a pixel-diff certification of every exported state. No source font files were supplied; the existing local system font stack is retained.

## Verification

- `npm run check`: all nine JavaScript modules pass syntax checks.
- `npm test`: 19 tests pass, including 52 nested screen render cases, cross-role and record scope, atomic bulk approval/placement, duplicate CSV import validation, report filters, and PDF object offsets/pagination.
- Browser checks at the 1440×1024 desktop reference viewport: coordinator creator login, HTE drawer tabs, placement grid/profile tabs, report configuration/preview/generation, report success, governance/RBAC, incident details, compliance validation, logout; supervisor dashboard/DTR approval/signature modes/appraisal form/slot detail; student login/directory/detail/application upload and submission/document retrieval/DTR draft/incident form/appraisal.
- Mobile checks at 390×844: incident form, DTR hub, appraisal; document width matches viewport width without page-level horizontal overflow.
- Fixed the pre-existing missing `filesDB` initialization discovered during a real resume-upload test. Retest confirmed the application and uploaded document persist and the stored PDF preview is available.
- No browser console errors in the final student checks.

Visual evidence is saved alongside this audit. Only fictitious demo records were used for browser interactions.
