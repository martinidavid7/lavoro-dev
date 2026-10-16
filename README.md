# lavoro.dev

Tech job board: a **full stack** application with a REST API in **Laravel** and an SPA in **Vue 3 + TypeScript**. The user interface is in Italian.

> Portfolio project, under active development. See the [roadmap](#roadmap).

## Features

- Paginated job listing, with title search and filters by work mode and contract type
- Filters synced with the URL: searches can be shared and the browser back button works
- Job posting detail page
- Job posting creation with server-side validation and per-field error messages
- Shared job posting editor for creation and updates, with a live preview; only the owner company can edit
- Comparison of up to three job postings, with highlighted differences, salary comparison and matching skills
- Sign-up and login as a **company** or a **candidate**, with session cookie authentication (Sanctum SPA mode, CSRF protected)
- Route guards by role: only companies publish job postings, and only the company that published one can delete it
- Public company pages (description, sector, city, size, contacts, logo and job postings), edited by the company itself, with logo upload
- Candidate profile: contacts, professional profile, links, photo and PDF CV (stored privately, downloaded through the API)
- Applications: candidates apply with their CV and an optional cover letter, and follow the status in "Le mie candidature"; companies see the applicants of each job posting (profile, matching skills, cover letter, CV) and move them through *In valutazione*, *Colloquio*, *Non selezionato* and *Assunto*
- Applicant Kanban board alongside the list view, with drag and drop, keyboard-accessible status menus, name search and sorting by date, name or matching skills; failed moves restore the original state
- Skills from a shared catalog, picked with a searchable multi-select: companies tag their job postings, candidates list their own and filter the job postings that match them, best matches first
- Favorite job postings saved in the candidate's account (guests are asked to log in, companies have none)
- Feedback notifications, plus loading, empty and error states
- Italian UI: translated validation messages, euro amounts (gross annual salary, RAL) and Italian date format

## Stack

| Layer | Technologies |
| --- | --- |
| **API** (`api/`) | PHP 8.4, Laravel 13, Sanctum, Eloquent API Resources, Form Requests, native enums, localization, Pest |
| **Web** (`web/`) | Vue 3 (Composition API + `<script setup>`), TypeScript, Vite, Vue Router, Pinia, Tailwind CSS 4, Vitest |
| **Quality** | GitHub Actions, Laravel Pint, ESLint + Oxlint, Prettier, vue-tsc |

## Structure

```
lavoro-dev/
├── api/   REST API (Laravel)
├── web/   SPA (Vue 3 + TS)
└── .github/workflows/ci.yml
```

## Running locally

Requirements: PHP 8.3+, Composer and Node 22.18+ or 24.12+.

**API** (http://localhost:8000):

```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed   # SQLite, with sample companies and job postings
php artisan storage:link     # serves the uploaded company logos
php artisan serve
```

**Web** (http://localhost:5173):

```bash
cd web
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:8000/api
npm run dev
```

Demo logins (password `password`): `azienda@example.com` (company) and `candidato@example.com` (candidate).

> Open the app at `http://localhost:5173`, not `127.0.0.1`: the session cookie is only sent when the web app and the API share the same host (`FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS` in `api/.env`).

## Tests

```bash
cd api && php vendor/bin/pest
cd web && npx vitest run
```

## API

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/job-postings` | Paginated list. Filters: `title`, `work_mode`, `contract_type`, `company` (company id), `skills[]` (skill ids, best matches first), `page` |
| `GET` | `/api/skills` | The skills catalog |
| `GET` | `/api/job-postings/{id}` | Detail |
| `POST` | `/api/job-postings` | Creates a job posting (`title`, `description`, `salary`, `work_mode`, `contract_type`). Companies only |
| `PATCH` | `/api/job-postings/{id}` | Partial update. Owner only |
| `DELETE` | `/api/job-postings/{id}` | Deletes. Owner only |
| `GET` | `/api/companies/{id}` | Public company page, with the number of job postings |
| `PATCH` | `/api/company-profile` | Updates the logged in company's profile (`name`, `description`, `sector`, `city`, `size`, `website`, `contact_email`, `phone`). Companies only |
| `POST` | `/api/company-profile/logo` | Uploads the logo (multipart `logo`: JPG, PNG or WebP, up to 1 MB). Companies only |
| `DELETE` | `/api/company-profile/logo` | Removes the logo. Companies only |
| `GET` / `PATCH` | `/api/candidate-profile` | The logged in candidate's profile (`name`, `phone`, `city`, `headline`, `experience_years`, `bio`, `linkedin_url`, `github_url`, `portfolio_url`, `skills`). Candidates only |
| `POST` / `DELETE` | `/api/candidate-profile/photo` | Uploads (multipart `photo`: JPG, PNG or WebP, up to 1 MB) or removes the photo |
| `POST` / `GET` / `DELETE` | `/api/candidate-profile/cv` | Uploads (multipart `cv`: PDF, up to 5 MB), downloads or removes the CV |
| `POST` | `/api/job-postings/{id}/applications` | Applies, sending the CV in the profile (`cover_letter` optional). Candidates only, once per job posting |
| `GET` | `/api/job-postings/{id}/applications` | The applicants, with counts per status. Filter: `status`. Owner company only |
| `GET` | `/api/applications` | The logged in candidate's applications |
| `PATCH` | `/api/applications/{id}` | Changes the status (`in_review`, `interview`, `rejected`, `hired`). Owner company only |
| `DELETE` | `/api/applications/{id}` | Withdraws the application. The candidate, unless already hired |
| `GET` | `/api/applications/{id}/cv` | The CV sent with the application. The candidate and the owner company |
| `POST` | `/api/register` | Creates an account and logs it in (`name`, `email`, `password`, `password_confirmation`, `role`: `company` or `candidate`) |
| `POST` | `/api/login` | Logs in (`email`, `password`) |
| `POST` | `/api/logout` | Logs out |
| `GET` | `/api/user` | The logged in user |

Authentication uses Sanctum's SPA mode: the web app first calls `GET /sanctum/csrf-cookie`, then sends the session cookie and the `X-XSRF-TOKEN` header. Without a session, protected routes answer `401`; a user without permission gets `403`.

Enum values:

- `work_mode`: 1 = remote (*Da remoto*), 2 = on-site (*In sede*), 3 = hybrid (*Ibrido*)
- `contract_type`: 1 = permanent (*Tempo indeterminato*), 2 = fixed-term (*Tempo determinato*), 3 = freelance (*Partita IVA*), 4 = internship (*Stage*)

Responses include the translated labels (`work_mode_label`, `contract_type_label`), following the `APP_LOCALE` setting (`it` by default).

## Roadmap

- [x] Authentication with Sanctum (login and sign-up)
- [x] **Company** and **candidate** roles; companies publish and manage their own job postings
- [x] Candidate profile with photo, CV and skills; job postings filtered by skills
- [x] Company page: company details, contacts, logo and published job postings
- [x] Applications, with the applicants of each job posting and their status (interview, rejected, hired)
- [x] Job posting editing in the web app, with a live preview
- [x] Job comparison and applicant Kanban board
- [ ] API documentation (OpenAPI)
- [ ] Deployment (web + API) with a public link
