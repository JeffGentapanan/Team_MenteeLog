# Backend integration contract

The frontend runs without a backend. `dist/js/api.js` exports `createApiClient()` and a default same-origin `/api/v1` client. It is an integration scaffold: demo mutations in app.js still use the local repository. Do not merely point the demo login at a server and treat the remaining browser state as trusted.

## Production migration

1. Implement the endpoints below against your ERD, mapping database snake_case fields to frontend camelCase DTOs.
2. Replace the local `load/save`, session helpers, and domain mutation handlers with a repository that calls the adapter. Load server data after session verification; show loading, empty, failed, and retry states. Keep draft-only browser data separate.
3. Obtain a CSRF token from a same-origin session/bootstrap endpoint. Instantiate `createApiClient({csrfToken: () => serverIssuedToken})`. The adapter sends credentials on same-origin requests and refuses writes without a CSRF token. It does not generate tokens itself.
4. Remove demo role entry, seed credentials, seed data, browser authorization assumptions, and `localStorage` record persistence from the production build.
5. Build authenticated document upload/download endpoints with ownership checks and malware scanning. Replace IndexedDB-only file operations. Use multipart FormData with the adapter's documents resource.
6. Add server-side integration tests for each role/ownership boundary, concurrent slot allocation, duplicate applications, DTR review transitions, appraisal finalization, and session revocation.

## HTTP conventions

- JSON request/response bodies; multipart uploads for files. Never return password hashes.
- Session cookie: HttpOnly, Secure in HTTPS deployment, appropriate SameSite, and server-enforced expiry. No bearer tokens in localStorage.
- `GET /auth/session` returns `{ user, csrfToken }`; optionally provide a CSRF bootstrap even before login.
- Standard errors: `{ "code": "FORBIDDEN", "message": "You cannot access this record.", "fieldErrors": {} }`.
- Statuses: 200 success, 201 created, 204 no content, 400 validation, 401 unauthenticated, 403 unauthorized/CSRF, 404 unavailable, 409 conflicting transition/duplicate, 413 upload limit, 429 rate limited.
- Paginate collection endpoints with `{items, nextCursor}` and normalize that shape in the repository. The adapter returns server JSON unchanged.
- The adapter uses a 15-second timeout and surfaces errors; provide retry controls in the production repository. Never retry mutations automatically without idempotency keys.

## Resources

| Endpoints | Access and behavior | ERD tables |
| --- | --- | --- |
| POST `/auth/login`, `/auth/logout` | Authenticate identifier/password; role comes from the database; logout revokes server session | USERS |
| POST `/auth/forgot-password`, `/auth/reset-password` | Generic recovery responses, expiring one-use token, no account enumeration | USERS + reset-token table |
| POST `/auth/activate` | Pre-provisioned accounts only; trusted token verification | USERS, BADGES_STATUS |
| GET `/jobs`, GET `/jobs/:id` | Student-visible active approved listings; staff scope on server | LISTINGS_JOBS |
| POST `/jobs`, PATCH `/jobs/:id` | Coordinator or explicitly permitted company supervisor; validate HTE accreditation | LISTINGS_JOBS |
| GET/POST `/applications`, PATCH `/applications/:id` | Own applications / assigned company reviews; atomic slot checks; audited coordinator endorsements | APPLICATIONS |
| GET/POST `/dtr`, PATCH `/dtr/:id` | Own logs; assigned supervisor review; immutable approved records or audited correction | DTR_LOGS |
| GET/POST `/appraisals`, GET `/appraisals/:id` | Assigned supervisor submits; evaluated student and coordinator read; validate accepted application | PERFORMANCE_APPRAISALS |
| GET/POST `/incidents`, PATCH `/incidents/:id` | Student/assigned supervisor can file; coordinator controls resolution | INCIDENTS |
| GET/POST `/meetings`, PATCH `/meetings/:id` | Coordinator mediation; supervisor mentoring; attendees read | MEDIATION_MEETINGS + mentoring extension |
| GET/POST `/users`, PATCH `/users/:id` | Coordinator provisions and changes account state; prohibit self-lockout/privilege escalation | USERS, BADGES_STATUS |
| PATCH `/users/me` | Allowlisted personal profile fields only; never role, status, or identifier | USERS + profile extension |
| GET `/notifications`, PATCH `/notifications/:id` | Current user's read state only; server creates notifications | NOTIFICATIONS |
| GET/POST `/htes`, PATCH `/htes/:id` | Coordinator accreditation management | Recommended HTE/MOA extension |
| GET/POST `/documents`, GET `/documents/:id` | Multipart upload and authenticated download; student ownership and staff scope | Recommended document table/object storage |
| GET `/reports?type=...` | Coordinator-only server-generated reporting; spreadsheet injection protection | Aggregated tables |

## Field mapping example

```json
{
  "studentId": "42",
  "supervisorId": "7",
  "clockIn": "2026-09-25T00:00:00.000Z",
  "clockOut": "2026-09-25T09:00:00.000Z",
  "breakMinutes": 60,
  "task": "Completed the assigned module and tests.",
  "justification": "Location permission unavailable.",
  "gps": null
}
```

Maps to `student_id`, `supervisor_id`, `clock_in`, `clock_out`, `task_summary`, `justification_note`, and `gps_coordinates`. The backend must derive `student_id` from the authenticated user and `supervisor_id` from the assignment, compute `total_hours`, and independently determine `is_gps_verified`. Do not trust those fields or status/approval timestamps from a client payload. Add break duration to the backend schema if the team adopts unpaid-break calculations.

The given ERD does not include standalone documents, HTE/MOA records, audit events, or reset tokens. These require additional tables/services. Typed demo signatures are acknowledgements, not digital certificates or trusted signature URLs. Define evidence and signed-document storage separately.
