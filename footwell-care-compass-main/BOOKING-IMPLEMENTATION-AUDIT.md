# Appointment booking implementation audit

Audit date: 2026-10-27

## Current state

- The Next.js home page renders `HomePage` from `src/routes/index.tsx`, which uses the active booking modal in `src/components/booking/BookingModal.tsx`.
- The active modal is a client-side request preview. It creates dates and time slots in the browser and does not call an API or persist an appointment.
- The booking request schema only accepts `VIDEO`, but the Prisma `ConsultationMode` enum still includes `IN_CLINIC`.
- `prepareOnlineAppointmentRequest` validates a request and assigns `PENDING`, but intentionally does not access Prisma or store data.
- `AppointmentRepository` is an interface only; there is no persistence implementation, App Router booking route, availability route, email provider, video provider, or object-storage integration.
- `AppointmentDocument` contains metadata fields only. The document UI validates files in the browser but does not upload them.

## Database and environment findings

- Prisma 6.19.3 is configured for PostgreSQL through the server-side `DATABASE_URL` variable.
- A local ignored `.env` contains `DATABASE_URL`; its value was not recorded in this document or command output.
- `prisma validate` passed on 2026-10-27.
- There is no `prisma/migrations` directory in the working tree.
- `prisma migrate status` and a read-only `SELECT 1` could not connect from this workspace. A TCP reachability probe to the configured database endpoint also failed. No metadata, appointment data, or migration history was read.
- `.env.example` is currently absent, despite being allowed by `.gitignore`.

## Required implementation sequence

1. Restore read-only database connectivity and inspect migration history, table metadata, and existing data state without querying patient records.
2. Propose the minimum reviewed migration for a non-guessable booking reference, online-only constraints, server-side availability, and conflict prevention. Obtain explicit approval before applying it to the production branch.
3. Implement and test server-side availability and appointment-creation route handlers, with transactional conflict handling and safe responses.
4. Connect the existing modal to those routes while preserving its design and accessibility.
5. Integrate private document storage and email only after a configured provider is inspected and tested.
6. Run schema, type, lint, unit, build, read/write synthetic-booking, conflict, and private-upload tests. Clean up only test records created by those tests.

## Current gate

No schema, migration, production-data, or deployment action may proceed until the workspace can make a verified read-only connection to the configured Neon database and its migration/data state is known.
