# Footwell Podiatry — Project Status, Technical Specification & Implementation Roadmap

**Live Demo / Current Preview:** [supplied preview link](https://footwell-care-compass-main-blond.vercel.app/)

> The URL above was supplied in the brief. It is recorded as a preview link only: its availability, ownership, deployment configuration, and production readiness were not verified.

**Local Project Directory:** E:\Assinement\Footwell-demo-page

**Audited application directory:** E:\Assinement\Footwell-demo-page\footwell-care-compass-main

**Project Type:** UK podiatry website prototype intended to evolve into a complete healthcare and online-learning platform.

**Current Stage:** Frontend client-presentation demo. No verified production database, appointment service, authentication, payment integration, video provider, or deployment configuration exists in the audited code.

**Documentation Purpose:** Preserve verified current state, distinguish demos from production functionality, and provide an implementation roadmap.

**Brand note:** “Footwell Podiatry” is treated as a temporary demonstration brand unless client-approved business information establishes otherwise.

## Table of contents

- [1. Project overview](#1-project-overview)
- [2. Client requirements](#2-client-requirements)
- [3. Current state summary](#3-current-state-summary)
- [4. Audit of the current demo](#4-audit-of-the-current-demo)
- [5. Current and target technology stack](#5-current-and-target-technology-stack)
- [6. Target application architecture](#6-target-application-architecture)
- [7. Recommended production project structure](#7-recommended-production-project-structure)
- [8. Proposed database design](#8-proposed-database-design)
- [9. Feature implementation plan](#9-feature-implementation-plan)
- [10. SEO and accessibility plan](#10-seo-and-accessibility-plan)
- [11. Security, privacy, and healthcare considerations](#11-security-privacy-and-healthcare-considerations)
- [12. Potential third-party services](#12-potential-third-party-services)
- [13. Testing and acceptance criteria](#13-testing-and-acceptance-criteria)
- [14. Running, maintenance, and GitHub workflow](#14-running-maintenance-and-github-workflow)
- [15. Priorities and roadmap](#15-priorities-and-roadmap)
- [16. Open questions and client inputs](#16-open-questions-and-client-inputs)
- [17. Final project handover summary](#17-final-project-handover-summary)

## Status terminology

| Status | Meaning |
| --- | --- |
| **Implemented** | Verified in audited code as a local frontend capability; this does not imply production readiness. |
| **Partially Implemented** | Relevant UI or code exists but workflow, data, security, or integration work is missing. |
| **Demo Only** | Visual or in-memory simulation with no production provider or persistence. |
| **Planned** | Requirement or recommendation without verified implementation. |
| **Not Verified** | Evidence was insufficient for a reliable claim. |

## 1. Project overview

Footwell Podiatry is intended to begin as a professional public-facing website for a UK podiatry practice and later become a secure healthcare and education platform. The public site should explain services, establish trust, provide educational resources, and guide visitors toward the correct appointment path.

The future platform may include a public marketing site, practitioner/clinic information, treatments, biomechanics and orthotics information, authentic authorised patient stories, a journal, appointment booking, forms and confirmation emails, optional payments, appointment-specific video consultations, courses, student accounts, protected lessons, and learning progress. A health-related AI chatbot is a future option only; it is not a verified current feature or initial delivery requirement.

The intended audience is people in the UK seeking podiatry information or consultation options. The source contains sample business details, testimonials, qualifications, availability statements, and clinical content. Those are demonstration content only until supplied and approved by the client.

## 2. Client requirements

| Requirement | Business purpose | Expected user experience | Current status | Remaining work | Dependencies / risks |
| --- | --- | --- | --- | --- | --- |
| Public website | Establish trust and explain services | Clear access to services, clinic information, resources, and contact | **Implemented** as static frontend | Replace demo data, add approved legal/content workflow | Accurate client and clinical review |
| Treatments and services | Explain care options | Explore categories and request appointments | **Partially Implemented** | Approved services, eligibility, prices, booking types | Clinical/commercial approval |
| Biomechanics and orthotics | Communicate specialist offer | Informational service page | **Implemented** as static UI | Verify copy, claims, imagery, pathway | Clinical review |
| Practitioner/clinic profile | Build confidence | Understand provider and location | **Demo Only** | Verified identity, credentials, address, accessibility/contact facts | Client-approved data |
| Patient stories | Provide social proof | Read authentic approved stories | **Demo Only** | Consent, evidence, approval, moderation policy | Privacy and claims risks |
| Journal | Support education and search discovery | Read useful articles | **Demo Only** | Article routes/CMS and review workflow | Editorial ownership |
| Online courses | Education/future revenue | Browse and preview lessons | **Partially Implemented** | Accounts, enrolment, payment decision, protected media/progress/dashboard | Product/content/provider decisions |
| Appointment CTA | Convert interest | Choose service/date/time/preferences | **Demo Only** | Secure booking service, availability, confirmation | Database, policy, email |
| Real booking | Operate appointments | Validated submission, conflict prevention, confirmation/reschedule | **Planned** | Full lifecycle, persistence, cancellation rules, optional payments | Security/data protection/provider choice |
| Video consultations | Support remote care | Authorised appointment-specific room | **Demo Only** visual preview | Provider, short-lived credentials, access controls, failure states | Privacy/security/clinical process |
| Student dashboard | Deliver protected learning | Enrolled learners see lessons/progress | **Planned** | Authentication, access control, progress persistence | Identity and media architecture |
| Future AI chatbot | Optional assistance | Safe non-diagnostic guidance/escalation | **Planned, out of initial scope** | Separate clinical safety/privacy/scoping work | Explicit client approval |

## 3. Current state summary

The codebase is a TypeScript/TanStack Start frontend with file-based routes for the home page, a course catalogue, and course detail pages. It includes responsive layout utilities, a mobile navigation drawer, local brand assets, course data held in code, local modal interactions, SEO metadata, a permissive robots file, error-handling scaffolding, and one routing test.

The code explicitly labels several interactions as previews. Booking, course-enrolment interest, video controls, lesson selection, and symptom answers are kept in React component state. No database, business API, third-party booking/email/payment/video service, authentication flow, protected-content check, or persistent dashboard was found. The demo must not be used with real patient data or for clinical/financial operations.

## 4. Audit of the current demo
### 4.1 Repository and application structure

| Area | Verified evidence | Finding |
| --- | --- | --- |
| Application root | **footwell-care-compass-main/** | Current source, package config, public assets, and generated route tree. |
| Entry/server handling | **src/router.tsx**, **src/start.ts**, **src/server.ts** | TanStack Router and custom error/CSRF middleware wrapper. No business API endpoints found. |
| Routes | **src/routes/__root.tsx**, **index.tsx**, **courses.index.tsx**, **courses.$slug.tsx** | File-based routes provide home, courses catalogue, and course detail paths. |
| Route tree | **src/routeTree.gen.ts** | Generated route tree; route README says not to edit manually. |
| Shared course UI | **src/components/courses/CourseShell.tsx** | Course header, cards, metadata, explicit demo notice. |
| Reusable UI | **src/components/ui/** and **components.json** | Radix/shadcn-style component set; not every component is necessarily used. |
| Assets | **src/assets/** and **public/** | Clinic/course images plus local Footwell brand/favicon assets. |
| Tests | **src/test/app-routing.test.tsx**, **vitest.config.ts** | One route-matching test; no booking/auth/accessibility/E2E tests found. |
| Documentation | **README.md**, **src/routes/README.md** | Concise development/readme and routing conventions. |

### 4.2 Verified feature audit

| Feature | Status | Evidence and limits |
| --- | --- | --- |
| Home page | **Implemented** | **src/routes/index.tsx** provides the public marketing page. Its business/clinical content remains sample content unless approved. |
| Header/navigation | **Implemented** | Desktop links, mobile menu, brand mark, and appointment action are in the home route; course pages use **CourseHeader**. |
| Responsive styling | **Partially Implemented** | Tailwind responsive utilities and mobile-menu state exist. A 1440px desktop navbar was inspected during current work; no full device/browser matrix was run. |
| Hero/calls to action | **Implemented** | Trust bar, hero and calls to action exist; outcomes remain demo interactions. |
| Treatments/services | **Implemented** static UI | Local **TREATMENTS** data/category tabs; no CMS, availability or approved source. |
| Biomechanics/orthotics | **Implemented** static UI | Informational section only; no diagnostic/order service. |
| Practitioner/about | **Demo Only** | Source itself identifies business data as demo data. |
| Patient stories | **Demo Only** | Hard-coded testimonials; no consent/source workflow. |
| Journal | **Demo Only** | Static teaser cards only; no article routes or publishing system. |
| Symptom finder | **Demo Only** | In-memory treatment suggestion with explicit non-diagnosis text; no clinical assessment or storage. |
| Booking modal | **Demo Only** | Local steps for treatment/date/time/preferences and demo completion. No endpoint, persistence, availability source, email, conflict prevention, cancellation, or payment. |
| Video consultation | **Demo Only** | Visual preview and local microphone/camera toggle states only; no SDK, room, credential, or provider configuration. |
| Course catalogue | **Implemented** static frontend | **/courses** renders cards from **src/lib/courses.ts**. |
| Course detail/lesson preview | **Implemented** static frontend | **/courses/:slug** renders local lesson navigation and preview content; invalid slugs use a route not-found view. |
| Course enrolment | **Demo Only** | Browser-only dialog validates basic inputs then says nothing is sent or saved. |
| Student dashboard | **Not Verified** | No dashboard route/component was found. |
| Authentication/authorisation | **Not Verified / not implemented** | No login route, identity provider, session handling, role model, or access checks found. |
| Database/persistence | **Not Verified / not implemented** | No database package/config, schema, migration, or persistence calls found. |
| Email/payment/video integrations | **Not Verified / not implemented** | No provider SDKs or related network calls found in audited source. |
| Branding/favicon | **Implemented** | Public directory contains ICO, SVG, PNG icons, Apple touch icon, manifest, and brand mark; root route links them. |
| Metadata | **Partially Implemented** | Root/home/course route metadata and relative course canonicals exist. No verified production URL, sitemap, or structured data. |
| Robots | **Implemented** | **public/robots.txt** permits common crawlers and all user agents. No sitemap was found. |
| Error/CSRF scaffold | **Partially Implemented** | **src/start.ts**, **src/server.ts**, and error helpers provide fallback behaviour/CSRF middleware for server functions; this is not a full security programme. |

### 4.3 Accessibility observations

The code uses semantic header, navigation, main, section, footer, list, heading, dialog, tab, progress, and form elements; labelled icon controls; modal/menu accessible names; and focus styling in **src/styles.css**. This is useful groundwork.

Accessibility is **Partially Implemented**, not certified. No evidence of a keyboard-only audit, screen-reader audit, contrast audit, reduced-motion support, form-error summary pattern, automated accessibility suite, or WCAG conformance assessment was found.

### 4.4 SEO observations

**src/routes/__root.tsx** declares application/title/description/theme/Open Graph/Twitter metadata. Home and course routes add route-specific metadata; course pages add relative canonical paths. **public/robots.txt** exists.

SEO is **Partially Implemented**. No XML sitemap, verified production domain, absolute canonical strategy, structured data based on verified facts, image strategy, or content-governance system was found. The root document uses **lang=en**; the team should consider **en-GB** only after confirming language/content policy.

### 4.5 Git and environment audit

- The application directory did not expose a usable Git worktree in the audit listing.
- A parent directory contains a **.git** folder, but Git status and remote commands from the audited app directory failed with a Git worktree/path error. Branch, commit, remote, and clean/dirty state are **Not Verified**. No repository was initialised or modified.
- No environment files were present in the audited listing and no concrete environment-variable reads were found. A Vite-config comment mentions generic VITE-prefixed injection; this is not proof of any configured value.
- No credentials, tokens, or patient data were inspected or recorded.

## 5. Current and target technology stack

### A. Current demo stack

| Concern | Current technology/evidence | Status |
| --- | --- | --- |
| Framework | TanStack Start 1.168.60; **vite.config.ts**, **src/start.ts**, **src/server.ts** | **Implemented** |
| UI runtime | React 19.2.0 / React DOM 19.2.0 | **Implemented** |
| Language | TypeScript with strict options in **tsconfig.json** | **Implemented** |
| Routing | TanStack Router 1.170.41, generated file routing | **Implemented** |
| Data/query client | TanStack React Query 5.101.1 created in **src/router.tsx** | **Implemented**, though no remote query usage found |
| Build tool | Vite 8.1.5 | **Implemented** |
| Hosting target hint | Nitro configuration; local build output used a Cloudflare-module preset | **Partially Implemented**; no deployment configuration verified |
| Styling | Tailwind CSS 4.2.1, CSS variables, tw-animate-css | **Implemented** |
| UI primitives | Radix packages and shadcn-style configuration | **Implemented** as available components |
| Icons | Lucide React 0.575.0 | **Implemented** |
| Forms/validation | React Hook Form, resolvers and Zod are dependencies | **Partially Implemented**; key demo forms use local/native handling |
| Tests | Vitest, Testing Library, jsdom; one routing test | **Partially Implemented** |
| Tooling | ESLint, Prettier, TypeScript ESLint packages and scripts | **Implemented** as configuration |
| Package manager | **bun.lock**/**bunfig.toml** and **package-lock.json** both exist | **Not standardised** |
| External integrations | Booking/email/payment/video/auth/database/storage | **Not implemented / Not Verified** |

**Build evidence:** a local **npm run build** completed successfully on 19 October 2026, with advisory plugin-timing and large-chunk warnings. This is not proof of deployment quality. The lint and test scripts were not run during this documentation-only audit.

### B. Proposed production stack

This is a recommendation, not a claim about current code. Confirm it before implementation:

- Frontend: Next.js, React, TypeScript, Tailwind CSS, reusable accessible components.
- Backend: Next.js server functions/API routes or dedicated Node API after complexity review.
- Data: PostgreSQL with Prisma.
- Identity: secure server-side sessions and role-based access control for visitor, student/patient, and practitioner/admin.
- Validation: typed schemas and server-side validation.
- Operations: persistent availability/appointments, transactional email, provider-hosted payments where approved, appointment-specific video SDK credentials, protected media storage, Git/GitHub, and layered tests.
- Hosting: a suitable production provider with region/privacy assessment appropriate to the final service.

Do not migrate the demo simply because Next.js is proposed. Make an explicit architecture decision first.

## 6. Target application architecture

1. **Public frontend**: approved public content, course catalogue and booking entry points.
2. **Authenticated student area**: authorised enrolments, lessons, progress and account controls.
3. **Practitioner/admin area**: restricted management of services, availability, appointments, content and enrolments.
4. **Backend/API**: server validation, identity checks, business rules and provider orchestration.
5. **PostgreSQL**: source of truth for roles, appointments, availability, enrolments, progress and audit references.
6. **Access control**: resource-level server checks, not UI-only protection.
7. **Booking/email/payment/video/media services**: narrowly integrated third-party capabilities with server-controlled credentials and webhooks.
8. **Logging/monitoring**: structured, access-controlled observability without unnecessary sensitive data.

~~~mermaid
flowchart LR
  Public[Public website] --> Web[Frontend routes]
  Student[Authenticated student] --> Web
  Admin[Practitioner/admin] --> Web
  Web --> Auth[Authentication and access control]
  Web --> API[Server actions or API]
  Auth --> API
  API --> Validate[Server validation and business rules]
  Validate --> DB[(PostgreSQL)]
  Validate --> Booking[Booking and availability]
  Booking --> Email[Transactional email]
  Booking --> Payment[Payment provider]
  Booking --> Video[Video provider]
  API --> Courses[Course/media access]
  Courses --> Storage[Private media storage]
  API --> Monitor[Logging and monitoring]
~~~

Application responsibilities are validation, authorisation, business rules, database records, safe user-facing errors, and audit decisions. Providers perform bounded tasks such as email, payment, video, or storage. Provider webhooks must be validated server-side before changing data.

### High-level booking workflow

~~~mermaid
sequenceDiagram
  participant Visitor
  participant UI as Booking UI
  participant API as Server API
  participant DB as PostgreSQL
  participant Email as Email provider
  participant Pay as Payment provider

  Visitor->>UI: Choose approved service and time
  UI->>API: Submit request
  API->>API: Validate inputs and permissions
  API->>DB: Atomically check availability and create appointment
  alt Payment required
    API->>Pay: Create hosted payment session
    Pay-->>API: Verified webhook/status
    API->>DB: Update payment/appointment status
  end
  API->>Email: Request confirmation/reminder
  API-->>UI: Safe confirmation or actionable error
~~~

## 7. Recommended production project structure

The following illustrative structure is for a future Next.js decision, not the current TanStack Start app.

~~~text
app/
  (public)/              public pages, services, journal, catalogue
  booking/               booking and confirmation routes
  courses/[slug]/        public course routes
  dashboard/             authenticated learner routes
  admin/                 practitioner/admin routes
  api/                   webhooks and required HTTP routes
components/
  ui/ booking/ courses/ layout/
lib/
  auth/ db/ validation/ services/ permissions/ observability/
prisma/
  schema.prisma migrations/
emails/
  booking/ payment/ course/
tests/
  unit/ integration/ e2e/ accessibility/
docs/
  architecture/ operations/ handover/
~~~

Keep secrets/server provider clients out of browser bundles, define ownership for each operational workflow, and preserve an explicit audit trail for data changes where appropriate.

## 8. Proposed database design

This is a target model, not a current database.

| Entity | Purpose / key fields | Relationships and safeguards |
| --- | --- | --- |
| User | Opaque ID, verified contact fields, account state, timestamps | Can have roles, appointments, enrolments and consent records; minimise collection |
| Role/permission | Public visitor implicit; student/patient and practitioner/admin as needed | Enforce server-side action/resource checks |
| PractitionerProfile | Approved professional presentation data | Publish only verified client-approved claims |
| Service | Name, duration, price policy, booking rules, active state | Referenced by appointments; avoid client hard-coding of operational price |
| AvailabilityRule/Exception | Hours, breaks, closures, availability | Booking service uses it; edits are auditable |
| Appointment | Service, participant, start/end, status, source, minimal data policy | Database constraints/transactions prevent conflicts |
| BookingNotification | Message type, provider ID, delivery state | Do not retain unnecessary message/sensitive content |
| PaymentRecord | Provider reference, amount/currency, state, timestamps/refund state | Never store card numbers; verified webhooks control changes |
| VideoSession | Provider session reference, appointment link, expiry/status | Never expose raw reusable tokens/permanent public URLs |
| Course/Module/Lesson | Publication state, ordered content, media reference | Server checks publication/enrolment before delivery |
| Enrolment | User/course, status, payment/source reference, timestamps | Valid active enrolment gates protected content |
| LessonProgress | User/lesson status and useful progress state | Protect as account data; avoid unnecessary tracking |
| BlogArticle | Draft/published content, reviewer, slug, SEO fields | Require editorial/clinical approval |
| Consent/AuditEvent | Consent version/action/actor/time or audit metadata | Restrict access and define retention/deletion policy |

Use foreign keys, timestamps, opaque unique IDs, explicit state machines, and retention/deletion rules. Keep any clinical records separate from a marketing/booking platform unless a suitably governed clinical-record system is explicitly in scope.

## 9. Feature implementation plan

### Phase A — Demo completion

**Status: Partially Implemented.**

- Complete desktop/tablet/mobile and navigation verification.
- Keep booking, enrolment, symptom finder and video labels clearly marked as demos.
- Confirm local brand assets and replace only with approved brand files.
- Add a student-dashboard preview only if it is required for demonstration, and label it as a preview.
- Remove/replace sample claims before external use.

**Acceptance criteria:** no dead links or overlap, responsive routes are checked, all simulated flows are clearly identified, and no visible content is mistaken for verified healthcare/business fact.

### Phase B — Production foundation

**Status: Planned.** Confirm final scope and stack; select a package manager; create development/staging/production environments; configure PostgreSQL/migrations; implement authentication/roles, typed server validation, structured error logging, tests and deployment workflow.

### Phase C — Booking system

**Status: Demo Only in UI; production work Planned.** Build an accessible flow, service catalogue, availability engine, transactional conflict prevention, appointment lifecycle, notifications, cancellation/rescheduling policy, and optionally hosted payment. Test concurrent requests, field validation, email failure, payments/webhooks and permissions.

### Phase D — Video consultations

**Status: Demo Only visual preview; production work Planned.** Select an approved provider, attach sessions to appointments, verify participant/appointment/role server-side, issue short-lived credentials, and test cancellation, expiry, denied access, and join failures.

### Phase E — Online learning platform

**Status: Static catalogue/detail frontend Implemented; protected platform Planned.** Build database-backed courses, modules and lessons; authenticated students; approved enrolment/payment flow; protected media; dashboard; persisted progress; and direct-URL/expired-access tests.

### Phase F — Content, SEO and launch

**Status: Partially Implemented in demo.** Confirm all business/clinical content; build reviewed journal workflow; finish metadata/sitemap/canonical/image strategy; perform accessibility/performance/security/privacy review; configure monitoring/backups; conduct final QA and handover.

### Phase G — Future enhancements

**Status: Planned.** AI chatbot, advanced analytics, reminders, and languages require independent approved scope. A health chatbot needs clinical governance, privacy review, clear non-diagnostic boundaries and escalation guidance.

## 10. SEO and accessibility plan

### SEO requirements

- Unique titles/descriptions and logical headings for every indexable page.
- Semantic HTML, descriptive internal links, useful alternate text and optimised images.
- Verified-domain absolute canonicals, XML sitemap and intentional robots directives.
- Open Graph/social image strategy.
- Structured data only for accurate approved facts; never generate local-business schema from demo address, review, hours, registration or contact content.
- Index public material only; prevent indexing of private student/admin pages.
- UK English where content policy approves it, and genuinely useful clinically reviewed content.

### Accessibility requirements

- Target WCAG 2.2 AA; do not claim conformance before testing.
- Keyboard operation for navigation, menus, dialogs, forms, booking and lesson controls.
- Visible focus, contrast checks, responsive reflow/zoom, clear names/labels.
- Screen-reader-friendly status/error messages, form errors and error summary patterns.
- Reduced-motion preferences and manual assistive-technology testing.

## 11. Security, privacy, and healthcare considerations

Production requires an appropriate UK privacy/data-protection/consumer/healthcare review. This is not legal advice or compliance certification.

- Authenticate and authorise on the server; use resource-level role checks.
- Validate all untrusted input server-side, handle output safely, and rate-limit sensitive endpoints.
- Use secure session/cookie settings and CSRF protection where applicable.
- Keep secrets in server environment configuration; never commit them or expose them to browser code.
- Use provider-hosted sensitive-payment interfaces; do not store card information.
- Make video credentials short-lived and appointment-specific.
- Protect media and lessons with actual enrolment checks, not obscured URLs.
- Collect minimal data; do not place health questions into generic marketing forms without approved governance.
- Keep sensitive information out of logs, define access/retention/deletion, backups/recovery and incident processes.
- Maintain dependencies and add secret scanning/security review.

The demo must not contain real patient data. Production use must not begin until security, privacy, clinical, contractual and operational checks are complete.

## 12. Potential third-party services

| Service | Why it may be needed | Required configuration | Approval/cost decision |
| --- | --- | --- | --- |
| Booking/scheduling | Availability and appointment operations | Durations, policies, calendars, data handling | Client/provider/subscription approval |
| Transactional email | Confirmation, reminders, notifications | Sender domain, templates, events, suppression | Provider contract and usage cost |
| Payment provider | Optional appointment/course payments | Products, webhooks, refunds, hosted checkout | Client approval and transaction fees |
| Video provider | Remote consultation rooms | Tokens, expiry, controls, data-processing review | Security/provider/recurring-cost approval |
| Database/hosting | Persistent app and deployment | Environments, backups, region, monitoring | Budget and data-residency choice |
| Secure media storage | Course recordings/assets | Private storage, signed URLs, lifecycle rules | Storage/transfer budget |
| Analytics/monitoring | Performance/errors/operations | Privacy-aware retention/access configuration | Consent/cost review |

No active third-party integration was verified. Development cost, subscriptions, transaction fees, storage and video usage must be budgeted separately.

## 13. Testing and acceptance criteria

| QA area | Current evidence | Required next action |
| --- | --- | --- |
| Desktop layout | **Partially verified**: latest navbar inspected at 1440px | Test browsers, zoom and all routes |
| Tablet/mobile | **Needs verification**: responsive utilities/menu exist | Test common viewport/touch/keyboard matrix |
| Navbar/routing | **Partially verified**: route code and one home-route test | Exercise every link, deep link, back/forward/mobile menu |
| Booking/conflicts | **Future implementation required** | Unit/integration/E2E conflict tests |
| Email | **Future implementation required** | Sandbox/retry/failure/deliverability tests |
| Payment | **Future implementation required** | Provider success/failure/webhook tests |
| Auth/permissions | **Future implementation required** | Anonymous/student/admin/revoked/expired cases |
| Video access | **Future implementation required** | Appointment match, expiry, cancellation, denied access |
| Course protection | **Future implementation required** | Enrolment, payment state, direct URL, media access tests |
| SEO | **Partially verified** route metadata | Verify rendered tags, final canonicals, sitemap, social previews |
| Accessibility | **Needs verification** | Automated plus keyboard/screen-reader/contrast/zoom audit |
| Runtime errors | **Partially implemented** fallbacks | Verify safe user errors and monitored failures |
| Production config | **Future implementation required** | TLS, secrets, environments, headers and deployment checks |
| Backup/recovery | **Future implementation required** | Define and rehearse restore procedure |
| GitHub handover | **Needs verification** | Verify repository/remote/CI/branch protection |

The present test suite has one route-matching test; it does not prove production quality or security.

## 14. Running, maintenance, and GitHub workflow

### Verified scripts

The following scripts are declared in **package.json**:

~~~sh
# Installation: standardise on Bun or npm before handover.
bun install
# or
npm install

# Development
bun run dev
npm run dev

# Production build
bun run build
npm run build

# Production preview
bun run preview
npm run preview

# Tooling
bun run lint
bun run test
bun run format  # writes changes; do not use as read-only check
~~~

There is no dedicated **typecheck** script. TypeScript configuration exists, but a non-writing type-check script should only be added after team agreement.

### Package-manager note

Both Bun configuration/lockfile and an npm lockfile exist. The README uses npm while Bun configuration is present. Choose one authoritative package manager and lockfile before handover, verify clean install/build/test in CI, and document the decision. Do not delete either lockfile until that decision is made and verified.

### GitHub/repository handover

1. Confirm the actual Git worktree and remote from a correct checkout; neither is verified here.
2. Review with status/diff and run build/tests before commit once Git works.
3. Exclude environment files, credentials, provider keys, exports, patient data and generated output.
4. Commit small working increments; do not rewrite pushed history in the connected-editor workflow.
5. Establish branch protection, review, CI, secret scanning, dependency maintenance and deployment ownership.
6. Hand a new developer approved content, architecture/provider decisions, environment guide and escalation contacts.

## 15. Priorities and roadmap

| Priority | Work item | Why it matters | Dependencies | Completion criteria | Status |
| --- | --- | --- | --- | --- | --- |
| P0 | Audit demo/content | Avoid presentation of placeholders as facts | Client review | Verified inventory and gap list | **Partially complete** through this document |
| P0 | Fix visual/navigation defects | Usability/presentation | Responsive QA | Links/menu/routes tested | **Partially Implemented** |
| P0 | Confirm courses demo | Avoid misleading platform claims | Content owner | Demo notices/routes/preview verified | **Partially Implemented** |
| P0 | Verify branding/favicon | Correct browser identity | Brand approval/browser QA | Approved assets/browser checks | **Implemented locally; production validation pending** |
| P0 | Clean Git handover | Traceable collaboration | Functional Git remote | Remote/branch/CI verified | **Not Verified** |
| P1 | Confirm scope/stack | Prevent rework | Client decisions | Recorded architecture decision | **Planned** |
| P1 | Database/auth/validation | Secure baseline | Provider/hosting decisions | Migrations, roles, tests, logging work | **Planned** |
| P2 | Booking/email/payment | Core business operation | Policies/database/providers | Conflict-safe booked lifecycle | **Planned** |
| P2 | Secure video | Safe remote consultations | Provider/auth/appointments | Short-lived authorised access tested | **Planned** |
| P3 | Learning platform | Protected teaching experience | Auth/media/payment policy | Access/progress tests pass | **Planned** |
| P4 | Launch readiness | Discoverable/reliable site | Approved content/domain/operations | QA, monitoring, recovery, sign-off | **Planned** |
| P4 | AI chatbot | Future optional feature | Explicit safety/client approval | Reviewed safe scope and escalation | **Planned** |

No delivery dates are given. Timing depends on confirmed scope, content, provider selection, integrations, testing and approval.

## 16. Open questions and client inputs

- Actual legal/business name, approved brand, domain and preview ownership.
- Verified practitioner identity, qualification/registration/affiliation, clinic address/contact/hours/accessibility information.
- Approved services, treatment text, price policy, images, testimonials and consent evidence.
- Appointment duration, availability, intake questions, cancellation/rescheduling/no-show policy and payment requirement.
- Booking/payment/video/email/hosting/database/media/monitoring provider choices, account owners and budget.
- Course catalogue, prices, lesson material, refunds, media rights, access/enrolment rules and editorial process.
- Whether a practitioner/admin dashboard is required and which staff may access what data.
- Privacy/cookie/legal/retention requirements and applicable review.
- Required integrations, deployment/support ownership and launch acceptance process.

## 17. Final project handover summary

### What the project is

A polished frontend prototype for a future UK podiatry website, booking experience, video-consultation capability and online-learning platform.

### What is verified now

TanStack Start, React, TypeScript, TanStack Router, React Query, Vite, Tailwind CSS, Radix/shadcn-style UI components, Lucide, Vitest/Testing Library, Nitro tooling, public marketing routes, static courses, local lesson navigation, responsive UI, local brand assets, metadata and one routing test are evidenced in files.

### What remains a simulation

Booking, availability, confirmation, payments, video consultation, enrolment, course media, learning progress, dashboards, accounts, practitioner/admin tools and real clinic/business data are not verified production capabilities.

### What must be built before production

Approved content/policies; architecture/provider decisions; secure authentication/database/server validation; booking, notifications/payment/video as approved; protected courses; tests; monitoring/backups; accessibility/privacy/security/legal review; deployment and support operations.

### Recommended next three actions

1. Run a client scope/content decision session and approve facts, policies, course plan and providers.
2. Stabilise repository workflow: verify Git remote/worktree, choose Bun or npm, create CI/environments and record architecture decisions.
3. Build the secure foundation before transactional features: database, migrations, authentication/roles, validation, logs, tests and secret handling.

### Major risks

The primary risks are treating demo interactions/data as real, collecting personal/health data before controls exist, selecting providers without privacy/cost/ownership review, and proceeding without a verified repository/deployment workflow.

### How a New Developer Should Continue This Project

1. Read this document, **README.md**, **src/routes/README.md**, **package.json**, **vite.config.ts**, and the source routes.
2. Confirm a usable Git checkout/remote; do not initialise a replacement repository or rewrite history without owner direction.
3. Choose/document one package manager and establish a clean CI install/build/test baseline.
4. Treat visible clinic, practitioner, testimonial, course and service information as sample data until approved.
5. Turn the open questions into a scoped production backlog; start with foundation/security, not live conversion of local modal state.
6. Keep secrets, personal data, provider credentials and payment details out of source control and client code.

### Source of Truth and Verification Notes

- **Verified from files:** routes, components, dependencies, scripts, styles, assets, course data, tests, metadata, and error/CSRF scaffolding.
- **Verified by execution:** local **npm run build** completed on 19 October 2026; a 1440px desktop navbar preview was visually inspected during the latest UI task.
- **Supplied in the brief:** future platform ambitions, preview URL, UK context, required roadmap content and proposed production direction.
- **Unverified:** preview availability, real client content/identity, Git remote/branch state, deployment/hosting, provider accounts, legal/compliance status and production integrations.

