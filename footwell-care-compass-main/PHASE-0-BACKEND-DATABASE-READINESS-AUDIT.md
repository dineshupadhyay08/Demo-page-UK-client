# Phase 0: Backend & Database Readiness Audit

**Project:** Footwell Care Compass  
**Audit date:** 27 October 2026  
**Scope:** Read-only implementation-readiness audit. No application code, configuration, package, database, migration, deployment, or data changes were made.

## Executive summary

The application is a Next.js App Router front end with a **schema-only Prisma/PostgreSQL foundation**. The current patient booking, document selection, course enrolment, payment, email, video, and account experiences are intentionally non-persistent UI flows. They must not be represented as live services until a backend is implemented.

The immediate readiness blocker is not a defect in the user interface: there is no local `DATABASE_URL`, no committed Prisma migration history, and no request-handling endpoint or server action. Before a production booking flow is enabled, the client must make the product, operational, privacy, and provider decisions in the checklist below.

## Audit evidence and limitations

| Area | Verified finding | Status |
| --- | --- | --- |
| Framework | Next.js `16.4.2`, React `19.2`, TypeScript, and App Router are installed. Routes are `/`, `/courses`, and `/courses/[slug]`. | Verified |
| Runtime | Node `v24.20.0` and npm `11.4.1` meet the declared minimums (Node `>=20.9.0`, npm `>=10.0.0`). | Verified |
| Server entry points | No `src/app/api/**/route.ts`, server action, middleware, or authentication implementation was found. | Verified |
| Prisma | `prisma/schema.prisma` targets PostgreSQL; `src/server/db/prisma.ts` provides a server-only Prisma singleton. | Verified |
| Database migrations | `prisma/migrations` does not exist. The schema has no committed migration history. | Verified |
| Environment | `.env.example` documents only `DATABASE_URL`; no local `.env` file was present. Secret values were not inspected. | Verified |
| Booking | The modal is explicitly an appointment-request preview and says nothing is sent or stored. | Verified |
| Documents | Browser-side selection/size/type checks exist. Files remain in React state only; no upload request, storage provider, or private retrieval policy exists. | Verified |
| Courses | Course data is static. The enrolment dialog says no enquiry is sent or saved; accounts, payment, video, and progress are not connected. | Verified |
| Payments, email, auth, video | No provider configuration, webhook, service, credential, or integration was found. | Verified |
| Git metadata | Branch, commit, and working-tree state could not be read in this environment: Git reports it cannot change to the parent worktree `E:/Assinement/Footwell-demo-page`. No Git repair was attempted. | Environment-limited |

This audit did not connect to PostgreSQL, inspect database contents, run migrations, inspect secret values, upload a file, contact an email/payment/video provider, or deploy anything. Therefore production database state, privileges, provider account configuration, DNS/domain verification, and Vercel configuration remain unverified.

## Current implementation assessment

### Database and Prisma

The Prisma schema contains a reasonable initial appointment domain:

- `PatientProfile` and `Practitioner` with unique email addresses.
- `Appointment` with treatment name, start, duration, consultation mode, status, note, patient and practitioner relations, and useful lookup indexes.
- `AppointmentDocument` metadata with a unique `storageKey`, original name, MIME type, byte size, and a cascading appointment relation.
- `AppointmentStatus` (`PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`) and `ConsultationMode` (`IN_CLINIC`, `VIDEO`) enums.

The schema is not yet a deployable persistence layer:

- There is no migration baseline, migration lock, or evidence of the target database state.
- No availability, service catalogue, opening hours, practitioner schedule, capacity, cancellation, audit, notification, payment, course-access, or user/role model exists.
- The schema has no database-level protection against overlapping practitioner appointments. The existing `(practitionerId, startsAt)` index improves lookup only; it does not prevent conflicts.
- `PatientProfile.email` is unique. That may be correct for authenticated patients, but it needs a deliberate guest-booking strategy before a request can be persisted safely.
- `AppointmentDocument.storageKey` correctly avoids public URLs, but no storage provider, ownership/authorisation policy, malware scanning, encryption/retention policy, or endpoint uses it.

`src/lib/validations/appointment.ts` supplies a useful Zod contract for appointment metadata and limits document metadata to ten files at 10 MB each. It is not currently imported by a route handler or server action, so it provides no server-side protection in the running application.

### Booking and availability

`src/components/booking/BookingModal.tsx` holds treatment, date, time, consultation mode, and selected files in component state. Its dates are generated from the browser clock and its time slots are hard-coded/demo-filtered. This is a presentation preview, not live availability.

Consequences before launch:

- There is no server validation of treatment, time, duration, patient data, consultation mode, or document metadata.
- There is no persisted patient, appointment, availability query, conflict check, transaction, idempotency key, duplicate-submission defence, cancellation, reschedule flow, or staff notification.
- Documents survive modal step changes because they remain in modal state, but disappear on page reload/close and are not associated with any booking.
- The UI currently accepts PDF/JPG/JPEG/PNG up to 10 MB. A future server must independently validate MIME type, file signature/content, size, count, and ownership; client checks are not a security control.

### Courses, payments, communications, and video

- Course catalogue/detail content is local data in `src/lib/courses.ts`.
- The enrolment dialog prevents a browser-default submit and displays a message that nothing was sent or saved.
- There is no payment SDK, checkout creation, customer/payment record, webhook handler, idempotency/reconciliation process, refund workflow, or course-access entitlement.
- There is no email service, template, sender-domain configuration, background delivery/retry mechanism, or booking/course notification event.
- There is no authentication/session layer, patient account, staff role, consent record, protected course route, video provider, appointment-specific video room, or access check.

## Non-destructive validation results

| Command | Result | Notes |
| --- | --- | --- |
| `npx tsc --noEmit` | Passed | TypeScript reported exit code `0`. |
| `npm test` | Passed outside the sandbox | 2 test files and 5 tests passed. The first sandbox attempt was blocked by an OS temporary-cache `EPERM`; the same suite passed when rerun outside the sandbox. |
| `npm run lint` | Failed | Existing `react-hooks/set-state-in-effect` error in `src/components/theme/ThemeProvider.tsx:64` for synchronous `setThemeState` in an effect. This audit did not alter it. |
| `npm run prisma:validate` | Blocked as expected | Prisma config loading stopped with `PrismaConfigEnvError: Missing required environment variable: DATABASE_URL`. No database connection, migration, or write was attempted. |
| `npm run build` | Failed in this environment | Next/Turbopack could not create the PostCSS child process while processing `src/styles.css` (`node process exited before we could connect`, exit code `0`). It reproduced outside the sandbox. This is a tooling/environment failure; the audit did not change CSS or build configuration. |

## Client decisions required before implementation

### Booking and clinic operations

1. Confirm whether this is a **request-to-book** workflow (staff confirms later) or instant booking. The present copy and business process indicate request-to-book, while the UI visually resembles live slot selection.
2. Approve the canonical services, durations, lead times, booking horizon, location(s), practitioner assignment rules, buffers, capacity, working hours, holidays, breaks, and UK time-zone policy.
3. Set the cancellation/reschedule/no-show policy and whether patients can self-serve those actions.
4. Decide whether guest requests are allowed, and if so the email/phone verification, duplicate-contact, anti-spam, and staff-resolution policy.
5. Identify the staff/admin workflow for confirming, declining, rescheduling, and recording clinical outcome.

### Health-data, document, and privacy decisions

1. Confirm the data controller, privacy notice, lawful basis, special-category health-data condition, consent wording (if used), and whether a DPIA is required.
2. Set retention/deletion schedules for booking requests, clinical documents, failed uploads, email/event logs, payments, and course data; define subject-access, correction, and erasure handling.
3. Select a private, UK/EU-appropriate storage provider and confirm encryption, private bucket/container policy, signed-upload/read policy, provider access, audit logging, backup, malware scanning, content-type/signature validation, and incident-response ownership.
4. Confirm who can view uploaded documents and whether documents may be uploaded before a request ID exists. Direct-to-private-storage uploads should use short-lived, scoped credentials and a server-side finalisation check.

### Provider and commercial decisions

1. Choose the transactional email provider, sender domain, templates, reply handling, opt-out requirements, retries, and operational monitoring.
2. Choose payment provider/merchant account, currency/tax/refund policy, payment timing (deposit/full/post-confirmation), webhook secret ownership, reconciliation, and PCI boundary.
3. Choose the authentication approach for staff and course customers, required roles, MFA/SSO expectations, session duration, password/account recovery, and account deletion.
4. Choose the video-consultation provider and define consent, room lifecycle, participant identity, waiting-room policy, recording policy, and no-show process.
5. Confirm the course delivery/video host, entitlement rules, access expiry, progress tracking, content licensing, and support workflow.

## Recommended phased implementation plan

### Phase 1 — Backend and database foundation

**Likely files/modules**

- `prisma/schema.prisma` and a reviewed, newly generated `prisma/migrations/*` baseline.
- `src/server/db/prisma.ts` (reuse) plus focused server modules such as `src/server/appointments/*`, `src/server/services/*`, and `src/server/auth/*`.
- `src/lib/validations/appointment.ts` (reuse/extend) and dedicated server-only validation contracts.
- `.env.example` (add variable names only, after provider choices), deployment secret configuration, and operational runbook documentation.

**Dependencies**

- Approved PostgreSQL instance, least-privilege application/migration credentials, backup/restore plan, and client data model decisions.

**Acceptance criteria and tests**

- `prisma validate`, `prisma generate`, and a reviewed migration work against a disposable test database.
- Migration up/down/recovery procedure is documented and rehearsed; no production database is selected by default.
- Integration tests can create/clean isolated test records with no personal data in logs.

**Risks**

- Schema migration is irreversible without an explicit recovery plan; patient/contact data requires production change control.

### Phase 2 — Real guest appointment requests and conflict prevention

**Likely files/modules**

- `src/app/api/appointments/route.ts` or a narrowly scoped server action (choose one pattern).
- `src/server/appointments/create-request.ts`, `availability.ts`, `conflicts.ts`, and `idempotency.ts`.
- `src/components/booking/BookingModal.tsx` and `DocumentUpload.tsx` only after the contract is ready.
- Prisma models/migration for request tokens, schedules/availability, and operational audit events as approved.

**Dependencies**

- Phase 1 database, service/availability decisions, rate limiting, CAPTCHA/abuse controls if guest access is public, and staff confirmation workflow.

**Acceptance criteria and tests**

- All payloads are server-validated, including treatment/duration, timezone-normalised slot, mode, note length, and document metadata.
- Two concurrent requests for an unavailable slot cannot both be confirmed. Implement this with an explicit PostgreSQL constraint/transaction strategy; an index alone is insufficient.
- Requests use an idempotency key and return safe duplicate-submission behaviour.
- Request, confirmation, cancellation, and reschedule scenarios are covered by integration and end-to-end tests.

**Risks**

- Time zones, daylight-saving transitions, race conditions, and a confusing request-versus-confirmed status can cause patient harm and operational conflicts.

### Phase 3 — Transactional email

**Likely files/modules**

- `src/server/notifications/*`, email templates, an outbox/event model, and provider adapter.
- Booking-state transition integration points and staff-facing failure/retry visibility.

**Dependencies**

- Verified sender domain, provider account/secret, approved copy, privacy review, and retention/logging decision.

**Acceptance criteria and tests**

- Email is sent only after the database transaction succeeds; retries are idempotent and delivery failures are observable.
- No health-document contents or unnecessary sensitive data are included in email/logs.
- Provider sandbox tests cover request receipt, confirmation, cancellation, and failure/retry paths.

**Risks**

- Sending confirmation before persistence, duplicate emails, and putting health data in email are unacceptable failure modes.

### Phase 4 — Payments

**Likely files/modules**

- `src/server/payments/*`, a checkout endpoint, webhook route, payment/ledger Prisma models and migration, and booking/course state integrations.

**Dependencies**

- Merchant/provider selection, product/pricing/tax/refund decisions, verified webhook secret, finance reconciliation owner, and terms/policies.

**Acceptance criteria and tests**

- Checkout creation is server-side and tied to a validated booking/order.
- Webhooks verify signatures, persist event IDs, handle replay/idempotency, and reconcile a failed/late event without granting access incorrectly.
- Refund/cancellation and provider test-mode flows are documented and tested.

**Risks**

- Client-reported payment success, unverified webhooks, and missing reconciliation create financial and access-control errors.

### Phase 5 — Protected course access

**Likely files/modules**

- Authentication/session modules, user/role/entitlement/progress Prisma models and migrations.
- Protected course route/server checks and course access UI states.

**Dependencies**

- Authentication provider, account lifecycle and privacy decisions, payment completion policy, course-host/video provider.

**Acceptance criteria and tests**

- Unauthenticated or non-entitled users cannot retrieve protected content or signed media URLs.
- Entitlements are granted/revoked from authoritative server-side payment/course events.
- Role, session expiry, account recovery, and access-revocation tests pass.

**Risks**

- Client-only gating exposes paid content; account support and deletion obligations must be operationally viable.

### Phase 6 — Video consultations

**Likely files/modules**

- `src/server/video/*`, provider adapter, appointment-specific room/token issuance, and staff/patient join flows.

**Dependencies**

- Video provider contract, authenticated/verified appointment ownership, clinical governance, consent and recording policies.

**Acceptance criteria and tests**

- Join credentials are short-lived, scoped to the appointment, and unavailable to unauthorised users.
- Cancellation/reschedule revokes or rotates access; no room links are exposed in public pages.
- Provider webhook/error paths and operational fallback are tested.

**Risks**

- Video links and recordings are highly sensitive health data; provider configuration needs clinical/privacy sign-off.

### Phase 7 — Security, observability, launch readiness

**Likely files/modules**

- Security headers/CSP review in `next.config.ts`, route-level auth/rate limits, structured redacted logging, monitoring/alerting, backup/runbook documentation, and full test suites.

**Dependencies**

- Incident owner, monitoring provider, secrets management, vulnerability remediation plan, penetration/security review, and client launch approval.

**Acceptance criteria and tests**

- Unit, integration, end-to-end, webhook replay, concurrency, upload-validation, authorisation, accessibility, backup/restore, and incident-response tests are completed.
- Production build and lint are clean in the target CI/runtime environment.
- Privacy notice, operational runbooks, data-retention jobs, access controls, and monitoring have client approval.

**Risks**

- Sensitive health data requires ongoing access review, log redaction, dependency patching, backup restoration testing, and a documented incident process.

## Suggested implementation order

Do not begin payment, course protection, or video integration until Phase 1 has a reviewed migration and an approved data/privacy model. Implement appointment requests before instant confirmation; then add email only after request persistence and staff workflow are reliable. Use payment/provider webhooks—not browser state—as the source of truth for money and entitlements.

## Files inspected

- `package.json`, `package-lock.json`, `.env.example`, `README.md`, `next.config.ts`, `postcss.config.mjs`, `prisma.config.ts`, and `scripts/run-next.mjs`
- `prisma/schema.prisma`
- `src/app/**`, `src/server/db/prisma.ts`, and `src/lib/validations/appointment.ts`
- `src/components/booking/BookingModal.tsx` and `src/components/booking/DocumentUpload.tsx`
- Course components/routes/data and the existing test files

## Next safe action

Obtain written decisions from the client-decision checklist, then create a separate approved implementation task for Phase 1. That task should begin with a migration/design review against a non-production PostgreSQL environment; it should not infer credentials, providers, privacy policy, or clinical workflow from the current UI.
