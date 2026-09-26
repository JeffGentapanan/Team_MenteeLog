# Verification — design correction, 26 September 2026

## Automated checks

- npm run check: app, public views, data, domain, and API modules parse successfully.
- npm test: 10 passing tests covering role routes, removed-module access, DTR calculations, ownership checks, duplicate review/application rejection, uploads, HTML/CSV escaping, and same-origin/CSRF API behavior.

## Browser verification

Tested localhost:4173, separately from the user's 127.0.0.1:4173 records.

- Landing hero and lower photo cards visually inspected against the PNG exports.
- Student and supervisor sign-in, dashboards, application tracker, DTR, incident table, appraisal table, and slot management rendered.
- Bell opens a dropdown; View All opens Notifications Center; profile dropdown exposes sign out.
- Coordinator dashboard, HTE accreditation, placement, DTR compliance, reports, governance, and incidents rendered with the expected headings.
- Coordinator dashboard and landing fit at 390 × 844 without document-level horizontal overflow. Mobile navigation opens. Viewport override reset afterward.
- Browser error log empty after these checks.

Evidence: landing-corrected.png and coordinator-corrected.png. Portal fixtures reflect earlier successful local workflow tests: DTR justification to supervisor approval, submitted appraisal, and resolved incident. These changes remain isolated to the QA browser origin.

## Boundaries

This is a frontend demonstration with a backend API handoff. Email, server authentication, database persistence, GPS verification, and trusted signatures are not live integrations. Landing statistics reproduce the design's illustrative content. Portal records determine their own totals. Main layouts were visually checked; not every exported modal state has been independently pixel-diff verified.

The existing Sites project registration remains in .openai/hosting.json; no version has been published. The referenced Sites publishing helper scripts are unavailable on this machine. The local preview and static dist source are available.
