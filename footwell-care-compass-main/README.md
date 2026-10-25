# Footwell Podiatry

Website for Footwell Podiatry, a specialist podiatry and lower-limb care clinic in Marylebone, London.

## Development

Requires Node.js 20.9 or later and npm 10 or later.

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

The development server runs at `http://localhost:3000`. The project scripts set the appropriate
`NODE_ENV` automatically, including in shells where that variable was previously set to a non-standard value.

For a production-mode local check:

```sh
npm run build
npm start
```

## Verification

```sh
npx tsc --noEmit
npm run lint
npm test
npm run prisma:validate
```

## Built with

- Next.js App Router
- TypeScript
- React
- Tailwind CSS

## Online courses

Routes: `/courses` (catalogue) and `/courses/[slug]` (detail, lesson outline, enrolment-interest dialog). Course content lives in `src/lib/courses.ts`.

**Functional:** navigation, course catalogue, detail pages, interactive lesson outline (previous/next), educational content, enrolment form validation.

**Backend integration still required:** user accounts/authentication, enrolment storage, payment processing, video hosting/streaming, learning-progress tracking, and confirmation emails. Educational content should be reviewed by the clinic's clinician.

## Database foundation

The project uses Prisma with PostgreSQL for the initial appointment-domain schema. Copy `.env.example` to `.env` and provide `DATABASE_URL` before running database commands. The schema has not been migrated because no database credentials are committed to this project.

```sh
npm run prisma:generate
npm run prisma:validate
```

Only run a Prisma migration after reviewing it and selecting the intended database. No migration has
been applied by this project setup.

Appointment documents are represented by private storage keys and metadata only. Configure an authenticated private storage provider before implementing document uploads.
