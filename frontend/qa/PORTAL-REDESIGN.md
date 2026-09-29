# Portal layout redesign — September 28, 2026

The shared portal shell now uses a desktop sidebar, sticky header, and a mobile navigation drawer. `portal-layout.css` is scoped to the portal shell, preserving public landing styles and logo assets. It defines common spacing, cards, form controls, tables, status badges, and responsive layouts. Existing local records are preserved.

Student and coordinator dashboards were rebuilt around role-scoped placement, attendance, incidents, and notifications. The previous dashboard referenced an undefined `c` variable; the new dashboard uses the current data store. Supervisor candidate/application review and coordinator job management are directly accessible from navigation, matching the flowchart.

## Verification

- JavaScript syntax checks and 21 automated tests passed.
- All 22 sidebar routes checked at 1440 × 900 and 390 × 844: no unavailable-page message and no page-wide horizontal overflow.
- Eight coordinator routes also checked at 768 × 1024.
- Mobile drawer open, navigation, Escape dismissal, account switching, notifications drawer/center, and account provisioning dialog inspected through the UI.
- Modal field IDs are scoped to avoid collisions with underlying page forms.
- Tables retain every column and scroll within their container; keyboard users can focus the container.
- Browser console reported no errors during verification.

Measurements are saved in `responsive-layout-checks.json`. Screenshots include student, supervisor, and coordinator desktop views and student/coordinator phone views. These checks cover route rendering and representative interactions, not every possible data state or backend integration. Authentication and persistence remain the existing frontend demonstration.
