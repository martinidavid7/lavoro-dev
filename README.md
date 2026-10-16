# lavoro.dev

Tech job board: a **full stack** application with a REST API in **Laravel** and an SPA in **Vue 3 + TypeScript**. The user interface is in Italian.

> Portfolio project, under active development. See the [roadmap](#roadmap).

## Features

- Paginated job listing, with title search and filters by work mode and contract type
- Filters synced with the URL: searches can be shared and the browser back button works
- Job posting detail page
- Job posting creation with server-side validation and per-field error messages
- Favorite job postings persisted in the browser
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
vagas/
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
php artisan migrate --seed   # SQLite, with 30 sample job postings
php artisan serve
```

**Web** (http://localhost:5173):

```bash
cd web
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:8000/api
npm run dev
```

## Tests

```bash
cd api && php vendor/bin/pest
cd web && npx vitest run
```

## API

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/job-postings` | Paginated list. Filters: `title`, `work_mode`, `contract_type`, `page` |
| `GET` | `/api/job-postings/{id}` | Detail |
| `POST` | `/api/job-postings` | Creates a job posting (`title`, `description`, `salary`, `work_mode`, `contract_type`) |
| `PATCH` | `/api/job-postings/{id}` | Partial update |
| `DELETE` | `/api/job-postings/{id}` | Deletes |

Enum values:

- `work_mode`: 1 = remote (*Da remoto*), 2 = on-site (*In sede*), 3 = hybrid (*Ibrido*)
- `contract_type`: 1 = permanent (*Tempo indeterminato*), 2 = fixed-term (*Tempo determinato*), 3 = freelance (*Partita IVA*), 4 = internship (*Stage*)

Responses include the translated labels (`work_mode_label`, `contract_type_label`), following the `APP_LOCALE` setting (`it` by default).

## Roadmap

- [ ] Authentication with Sanctum (login and sign-up)
- [ ] **Company** profiles (publish and manage their own job postings) and **candidate** profiles (apply)
- [ ] Applications and status tracking
- [ ] Job posting editing in the web app
- [ ] API documentation (OpenAPI)
- [ ] Deployment (web + API) with a public link
