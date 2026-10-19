# Footwell Podiatry

Website for Footwell Podiatry, a specialist podiatry and lower-limb care clinic in Marylebone, London.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Online Courses demo

Routes: `/courses` (catalogue) and `/courses/$slug` (detail, lesson outline, learning-interface preview, enrolment dialog). Course content lives in `src/lib/courses.ts`.

**Functional:** navigation, course catalogue, detail pages, interactive lesson outline (previous/next), content preview, enrolment form validation.

**Demo only — backend still required:** user accounts/authentication, enrolment storage, payment processing, video hosting/streaming, learning-progress tracking, and confirmation emails. Educational content should be reviewed by the client's clinician.
