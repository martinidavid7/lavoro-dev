# vagas.dev

Plataforma de vagas de emprego em tecnologia: aplicação **full stack** com API REST em **Laravel** e SPA em **Vue 3 + TypeScript**.

> Projeto de portfólio, em evolução. Veja o [roadmap](#roadmap).

## Funcionalidades

- Listagem de vagas paginada, com busca por título e filtros por modalidade e tipo de contratação
- Filtros sincronizados com a URL: dá para compartilhar uma busca e usar o voltar do navegador
- Página de detalhe da vaga
- Publicação de vaga com validação no servidor e erros exibidos por campo
- Vagas favoritas persistidas no navegador
- Notificações de feedback, estados de carregamento, de lista vazia e de erro

## Stack

| Camada | Tecnologias |
| --- | --- |
| **API** (`api/`) | PHP 8.4, Laravel 13, Sanctum, Eloquent API Resources, Form Requests, enums nativos, Pest |
| **Web** (`web/`) | Vue 3 (Composition API + `<script setup>`), TypeScript, Vite, Vue Router, Pinia, Tailwind CSS 4, Vitest |
| **Qualidade** | GitHub Actions, Laravel Pint, ESLint + Oxlint, Prettier, vue-tsc |

## Estrutura

```
vagas/
├── api/   API REST (Laravel)
├── web/   SPA (Vue 3 + TS)
└── .github/workflows/ci.yml
```

## Como rodar localmente

Pré-requisitos: PHP 8.3+, Composer e Node 22+.

**API** (http://localhost:8000):

```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed   # SQLite, com 30 vagas de exemplo
php artisan serve
```

**Web** (http://localhost:5173):

```bash
cd web
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:8000/api
npm run dev
```

## Testes

```bash
cd api && php vendor/bin/pest
cd web && npx vitest run
```

## API

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/vagas` | Lista paginada. Filtros: `titulo`, `modalidade` (1 = Home Office, 2 = Presencial), `tipo` (1 = CLT, 2 = PJ), `page` |
| `GET` | `/api/vagas/{id}` | Detalhe |
| `POST` | `/api/vagas` | Cria uma vaga (`titulo`, `descricao`, `salario`, `modalidade`, `tipo`) |
| `PATCH` | `/api/vagas/{id}` | Atualização parcial |
| `DELETE` | `/api/vagas/{id}` | Exclui |

## Roadmap

- [ ] Autenticação com Sanctum (login e cadastro)
- [ ] Perfis de **empresa** (publica e gerencia as próprias vagas) e **candidato** (se candidata)
- [ ] Candidaturas e acompanhamento de status
- [ ] Edição de vagas no front
- [ ] Documentação da API (OpenAPI)
- [ ] Deploy (web + API) com link público
