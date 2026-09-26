# Security boundaries

This is a local frontend demonstration, **not a production security boundary**. Anyone with browser developer tools can inspect/change local data and select demo roles. Never load real records into it.

## Included frontend measures

- Dynamic text and attributes are HTML-escaped; user strings are not executed as HTML.
- No third-party scripts, CDNs, analytics, fonts, or runtime package dependencies.
- Restrictive Content Security Policy; local server also sends nosniff, anti-framing, referrer, and permissions headers. Configure equivalent HTTP headers on a deployment host; meta CSP cannot enforce frame-ancestors.
- Role-gated navigation and scoped demo queries/review actions; these support correct UX, but are not server authorization.
- Thirty-minute demo sessions in sessionStorage. Password input is never persisted.
- File size/type/extension checks, no SVG or executable HTML uploads, browser-local file storage, safe download filenames from selected files.
- CSV formula neutralization and quoted cell escaping. Imports validate required fields, duplicates, and limits before adding any records.
- Meetings accept HTTPS Google Meet, Teams, and Zoom URLs only; external links use noopener/noreferrer.
- DTR duration and break validation; approved hours separated from pending/flagged entries; duplicate review prevention; clearance requirements checked.
- API adapter restricted to a same-origin path, cookie credentials, CSRF header requirement for writes, timeouts, and explicit errors.

## Required backend controls before real use

Implement server-side authentication, role/tenant/record-ownership checks for every endpoint, secure password hashing, HTTPS, server session expiration and revocation, CSRF validation, output/data validation, rate limits, account recovery tokens, and append-only audit records. Recompute hours, slot capacity, scores, ownership, and statuses on the server using transactions. Do not trust the UI or localStorage.

Store uploaded files outside the web root with randomized names, authenticated download permissions, server content sniffing, size limits, malware scanning, and safe Content-Disposition. Client MIME/extension checks are usability checks only. Define retention policies and consent requirements for location/incident data. GPS from a browser can be unavailable or spoofed; location capture is explicitly not labeled verified in this demo.

Any production reset/activation screen must verify a one-time server token and never accept a client-side mock check as success. Email delivery, real notifications, signatures, mediation invitations, and account suspension enforcement require server implementations.

The local preview binds only to 127.0.0.1 and serves the `dist` directory. Original team documents and Figma references are not served. No secrets are required for the frontend.
