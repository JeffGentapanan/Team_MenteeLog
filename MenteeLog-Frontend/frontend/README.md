# MenteeLog frontend

A dependency-free, responsive HTML/CSS/JavaScript frontend based on the supplied MenteeLog Figma exports, sitemap, ERD, flowchart, and PRD. The original reference files remain untouched.

## Start locally

Requires Node.js 20 or newer. No package installation is needed.

```powershell
cd frontend
npm start
```

Open http://127.0.0.1:4173. Choose **Sign in**, select a role, and enter the sample credentials below. Run `npm run check` and `npm test` for verification.

Sample credentials (password for all: `Demo@2026!`):

| Portal | Identifier |
| --- | --- |
| Student | `2021-00421` |
| Supervisor | `carlos.jose@example.com` |
| Coordinator | `FAC-2026-001` |

These are public demo credentials, not real authentication. Never reuse this demo authentication in production.

## Included functionality

- Public landing page and role-based authentication hub; honest forgot-password and token-reset previews.
- Student dashboard, filtered job directory and applications, profile, DTR clock-in/out and task drafts, document uploads/downloads, incidents with evidence, appraisal results.
- Supervisor dashboard, assigned roster, application reviews, DTR review with comments and typed demo signatures, position management, five-criterion appraisal, disciplinary reports, local emergency alerts.
- Coordinator dashboard, HTE accreditation/MOA management, job management, placement and clearance checks, DTR compliance, CSV reporting, case notes/mediation, candidate CSV import, faculty provisioning, account status controls, permissions summary, and local activity history.
- Shared notification drawer/center, read states, profile, 30-minute demo session, mobile navigation, keyboard-accessible dialogs, print styles, search/filter empty states, validation and feedback.

## How the demo works

Records are stored under `menteelog.demo.v1` in localStorage. Sessions live in sessionStorage and expire after 30 minutes. Uploaded demo documents and evidence are stored in IndexedDB on the current browser. Passwords are not persisted. The sample history includes 280 prior approved hours for Maria plus 32 approved hours in the visible DTR records.

Switch roles through **Profile & settings → Switch portal** to review shared sample records. For example, add a student justification, switch to the supervisor to approve it, then return to the student dashboard to see approved hours increase. The coordinator sees the same changes. **Reset sample data** restores the original sample data and removes demo uploads from this browser.

Portal counts derive from the working sample cohort. Public landing statistics and opportunity cards reproduce the PNG design fixtures; they are illustrative, not live institutional statistics. Student names are drawn from the supplied designs; all contact addresses are example domains.

## Source layout

```text
dist/index.html          Application shell, metadata, CSP
dist/styles.css         Base responsive components
dist/reference.css      PNG-aligned public, authentication and portal styles
dist/js/public.js        Landing variants and authentication views
dist/tokens.css         Figma-derived burgundy/cream/sand tokens
dist/assets/logo.svg    Supplied team logo
dist/js/data.js          Sample data, roles, navigation, appraisal rubric
dist/js/domain.js        Testable permissions, hours, validation, CSV utilities
dist/js/app.js           Views, routing, forms, local demonstration repository
dist/js/api.js           Same-origin HTTP API integration adapter
server.mjs              Local static preview server with security headers
tests/domain.test.mjs    Domain and API adapter tests
API-CONTRACT.md          Backend handoff and ERD mapping
SECURITY.md              Frontend controls and backend obligations
```

The `dist` directory is the deployable static frontend source; no compilation/build step is required. Hash routes work on static hosts without server rewrites. This is vanilla JavaScript, so the team can extend it without installing a framework.

## Important boundaries

This deliverable is **frontend only**. There is no live database, trusted authentication, email delivery, server-verified GPS, legally binding e-signature, malware scanner, or automatic calendar integration. Notifications only modify this browser's demo data. Report exports are CSV; CHED output is a preparation worksheet, not a certified government submission. The production API adapter is provided but intentionally not connected to the local demo repository. See API-CONTRACT.md for the migration steps.

## Design references

The student, supervisor, coordinator, DTR, appraisal, authentication, and governance layouts follow the provided exported screens: burgundy side navigation, cream canvas, sand cards, table headers, status badges, and compact typography. The corrected landing page follows the PNG photo hero, section order, opportunity cards, wording, and burgundy footer. The public variants and authentication hub use the same supplied imagery. Photos are displayed through SVG viewports cropped to photographic regions of the local PNG exports because separate original photos were not supplied. UI text, navigation, buttons, forms, cards, and tables are HTML/CSS; the website is not a screenshot overlay. Raster photo crops have the resolution of the exports. Mobile layouts are added because the source designs are desktop exports.

## Scope of this correction

Learning Goals, Messages & Meetings, and Program Settings have been removed from the frontend routes, navigation, and view handlers. Documents, HTE accreditation, and slot management remain because they are shown in the supplied PNGs and support the placement/reporting modules. The three portals use working records, so counts, names, dates, populated rows, and empty states can differ from the static exports. Dialogs share accessible form components; this is not a claim that every one of the 200+ exported modal states has been pixel-diff verified.

## Creator portal accounts

Refresh the frontend before signing in. These accounts are added automatically without resetting existing sample records. Select the matching portal tab on the authentication page.

| Portal | Identifier | Password |
| --- | --- | --- |
| Student | CREATOR-STUDENT | Demo@2026! |
| Supervisor | creator.supervisor@example.com | Demo@2026! |
| Coordinator | CREATOR-FACULTY | Demo@2026! |

All three display MenteeLog Creator. The student is assigned to the creator supervisor through MenteeLog Demo HTE, with an accepted demo placement for testing attendance and appraisals. The coordinator has the normal coordinator governance tools. Creator accounts retain each portal's role and record-access rules; there is no authentication bypass or unrestricted superuser role.

These are public frontend demo credentials, not private production accounts. Example email addresses do not send or receive activation messages. Your backend must provision secure real accounts before deployment.

The supplied Property 1=MenteeLog - Logo.svg is copied unchanged to dist/assets/logo.svg. All site logo placements, including the footer and favicon, use that asset.
