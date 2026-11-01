# Phase 1: PostgreSQL and Prisma Foundation Proposal

**Project:** Footwell Care Compass  
**Prepared:** 27 October 2026  
**Scope:** Proposal and safe migration plan only. No Prisma schema, application code, package, environment, migration, or database changes were made.

## Decision status

The product direction for this phase is **guest appointment requests**: a visitor may submit a request without an account, and clinic staff confirm it later. This matches the current booking UI wording and the existing `PENDING` appointment status.

This document deliberately does not turn the current preview into a live booking feature. It introduces no API route, server action, availability logic, payment, email, authentication, video, file upload, provider, or database connection.

## Current verified foundation

| Item | Current state |
| --- | --- |
| Prisma packages | `prisma` and `@prisma/client` are pinned through the current dependency set at `6.19.3`. No package change is required. |
| Provider | `postgresql` in `prisma/schema.prisma`. |
| Prisma configuration | `prisma.config.ts` loads `DATABASE_URL`, points to `prisma/schema.prisma`, and reserves `prisma/migrations` for migrations. |
| Database client | `src/server/db/prisma.ts` imports `server-only` and exposes a singleton `PrismaClient`; no client component imports it. |
| Migration history | No `prisma/migrations` directory or baseline migration exists. |
| Environment | Only `.env.example` exists and documents `DATABASE_URL`; no `.env` file or non-production connection is configured locally. |
| Existing schema | `PatientProfile`, `Practitioner`, `Appointment`, and `AppointmentDocument`; appointment statuses are `PENDING`, `CONFIRMED`, `CANCELLED`, and `COMPLETED`. |

## Proposed schema direction — awaiting approval

### 1. Represent a guest without creating a patient account

The existing `PatientProfile` looks like the beginning of a registered-patient profile: it has a globally unique email and a direct relation to every appointment. That does not express an unauthenticated guest safely or accurately:

- Family members can share an email address.
- An email address alone does not prove identity.
- Creating a permanent patient profile from an unverified request conflates a guest contact record with a clinical/patient account.

**Recommended baseline change:** replace the initial, unused `PatientProfile` model with a narrowly scoped `GuestBookingContact` model, related to an appointment request. It should contain only the contact data the approved booking form will collect: first name, last name, email, and an optional phone number. Its email should not be globally unique. Do not add authentication credentials, account/session fields, verification flags, consent fields, or clinical records in Phase 1; each requires a separate approved workflow and privacy decision.

Because the current database has no migration history or configured database, this is a design correction before the first migration, not a data migration. It must still be reviewed before the schema is edited.

### 2. Keep `Appointment` as the appointment-request record

For the confirmed request-to-book workflow, the existing `Appointment` model can remain the primary record if its names and meanings are approved:

- `PENDING` means a guest request received but not accepted by the clinic.
- `CONFIRMED` means a clinic-confirmed appointment.
- `CANCELLED` and `COMPLETED` retain their normal operational meanings.
- `startsAt` must be explicitly defined as either the **guest's requested start** while pending or the **clinic-confirmed start**. The present UI supplies a preferred slot, so this distinction needs an approval before implementation.

**No new status should be added now.** In particular, `DECLINED`, `EXPIRED`, `NO_SHOW`, and reschedule states are operational-policy choices. They should be introduced only with the clinic's staff workflow, patient messaging, retention, and reporting requirements.

### 3. Two safe alternatives for requested versus confirmed time

Choose one before editing the schema:

| Option | Proposed fields | Best when | Trade-off |
| --- | --- | --- | --- |
| A — one appointment time | Keep `startsAt`; document that it is a requested time until status becomes `CONFIRMED`. | Staff usually accepts the requested slot unchanged. | Historic intent is lost if staff later moves the appointment. |
| B — retain intent and schedule | Rename/replace `startsAt` with `requestedStartsAt`, and add nullable `confirmedStartsAt`. | Staff may propose or select a different time. | Requires clear UI/admin semantics and a more involved initial schema. |

The audit does not select either option. The current UI describes a preferred date/time, so Option B is the safer data-model candidate, but it needs client approval.

### 4. Retain practitioner and document boundaries, with explicit limits

- Retain `Practitioner` and the appointment-to-practitioner relation. A required practitioner assignment presumes that the clinic will either select one before persisting a request or create an approved default/triage workflow. This must be decided before a request endpoint is built.
- Retain `AppointmentDocument` only as metadata (`storageKey`, original name, MIME type, byte size). It must not gain a public URL.
- Do not implement uploads, storage keys, document records, signed URLs, malware scanning, or document access in this phase. Those need a selected private provider and health-data approval.

### 5. Do not add availability or conflict mechanics in Phase 1

The existing appointment indexes are useful lookup indexes but do not prevent overlaps. Slot validation, opening hours, availability, buffers, locking/transactions, PostgreSQL exclusion constraints, idempotency, and duplicate-request protection belong to Phase 2 after the clinic approves its scheduling rules. No availability table or database constraint is proposed now.

## Required client approvals before schema editing

1. Confirm that a guest can submit a request without an account and that the request is not an instant, guaranteed appointment.
2. Approve the contact fields: required first name, last name, email; optional/required phone; and the wording/privacy notice presented with the request.
3. Choose Option A or Option B for requested versus confirmed appointment time.
4. Confirm whether a practitioner is assigned at request creation, via a known default/triage practitioner, or only after staff review. The current required foreign key needs one of these approaches.
5. Confirm the canonical service names/durations and whether they remain application configuration or become an approved database-managed catalogue in a later phase.
6. Confirm the lifecycle meanings and permissions for `PENDING`, `CONFIRMED`, `CANCELLED`, and `COMPLETED`; defer any additional status until the workflow is approved.
7. Approve the health-data governance prerequisites: data controller, lawful basis/special-category condition, retention/deletion policy, and whether a DPIA is required.
8. Provide a named, disposable **non-production PostgreSQL** environment and identify the authorised migration operator. Do not provide its credentials in source control or chat.

## Environment-variable documentation

`DATABASE_URL` is the only currently required variable. `.env.example` already provides a non-secret placeholder and must continue to contain no real credential.

Do not add `DIRECT_URL`, provider tokens, storage credentials, email keys, payment secrets, auth secrets, or video credentials in Phase 1. Those variables are provider-dependent and must be added only with their later approved integrations. The future non-production `DATABASE_URL` must point to a clearly labelled disposable development/test database, use a least-privilege application account where supported, and be supplied through local secret management or the deployment environment—not committed to the repository.

## Safe migration plan

### Before any migration command

1. Obtain every approval in the preceding list and record the selected appointment-time option.
2. Provision an empty, explicitly non-production PostgreSQL database. Confirm its host, database name, owner, backup/recovery approach, and that it is not production.
3. Provide `DATABASE_URL` only through a local ignored `.env` or authorised secret store. Verify the target with the database owner; never paste the connection string into source, logs, or tickets.
4. Review the final Prisma schema change and generated SQL before any database operation.

### Only after those prerequisites are met

1. Update `prisma/schema.prisma` to the approved guest-contact and appointment-time design.
2. Run `npm run prisma:validate` and `npm run prisma:generate` locally. These validate/generate the client; record their output without exposing environment values.
3. Generate the first baseline migration against the approved disposable database:

   ```powershell
   npx prisma migrate dev --name init_appointment_foundation
   ```

4. Review every generated SQL file in `prisma/migrations/*`, including foreign keys, unique constraints, indexes, defaults, and destructive-operation warnings. Do not accept a migration by filename alone.
5. Run `npx prisma migrate status` against the same non-production database and test migration application from a clean disposable database.
6. Add focused database integration tests using only synthetic data; ensure logs redact emails, phones, notes, and document names.
7. Submit the schema and migration for review. A separate, explicitly approved production change plan must cover backup, change window, rollback/forward-fix procedure, and use of `prisma migrate deploy`; do not use `migrate dev` against production.

## Current stop condition

No local `.env` or other non-production database configuration is present. As required, migration generation and execution have **not** been attempted. No schema or migration file was changed because the guest-contact shape, appointment-time semantics, practitioner assignment, and data-governance choices still require client approval.

## Ready now

- The existing Prisma configuration and server-only client are suitable to reuse.
- Prisma package versions are already present; no installation or upgrade is needed.
- The baseline schema is a clear starting point and its document metadata design avoids public file URLs.
- This proposal provides the decisions and command sequence needed to create a reviewed first migration safely once a non-production database is authorised.

## Requires approval or external setup

- All eight client decisions above.
- An explicitly non-production PostgreSQL `DATABASE_URL` managed outside source control.
- Review of the final schema and generated migration SQL.
- A privacy/health-data decision before any contact or document data is persisted.

## Files inspected

- `PHASE-0-BACKEND-DATABASE-READINESS-AUDIT.md`
- `package.json`, `prisma.config.ts`, `.env.example`, and `prisma/schema.prisma`
- `src/server/db/prisma.ts`
- `src/components/booking/BookingModal.tsx`, `src/config/clinic.ts`, and `src/lib/validations/appointment.ts`
