# QA Automation Portfolio

Playwright + TypeScript test automation framework that demonstrates API contract testing, data integrity checks, and cross-browser UI regression coverage.

This repo is built as a resume-ready sample: small enough to review quickly, but structured with the same habits used in production QA work: deterministic test data, typed helpers, CI gates, isolated projects, and actionable reports.

## Highlights

- API tests use Playwright's `APIRequestContext` through a typed client wrapper.
- Local mock API keeps CI stable and avoids flaky third-party auth/rate-limit issues.
- Data integrity suite validates schemas, pagination math, uniqueness, and cross-response consistency.
- UI suite uses semantic locators for navigation, search, responsive layout, console errors, and accessibility signals.
- GitHub Actions runs type checks plus separate API, desktop browser, and mobile browser projects.

## Tech Stack

| Area | Tooling |
|---|---|
| Test runner | Playwright Test |
| Language | TypeScript |
| API target | Local Node mock API |
| UI target | `https://playwright.dev` |
| Reporting | Playwright HTML report, traces, screenshots on failure |
| CI | GitHub Actions |

## Project Structure

```text
.
├── .github/workflows/playwright.yml
├── docs/
│   └── TEST_STRATEGY.md
├── tests/
│   ├── api/
│   │   ├── data-integrity.spec.ts
│   │   └── users.spec.ts
│   ├── ui/
│   │   └── playwright-site.spec.ts
│   └── utils/
│       └── api-client.ts
├── tools/
│   └── mock-api.js
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Getting Started

```bash
npm install
npx playwright install
npm test
```

Playwright starts the mock API automatically before tests run. To run it manually:

```bash
npm run mock:api
```

## Useful Commands

| Command | Purpose |
|---|---|
| `npm test` | Run the full API and UI suite |
| `npm run test:api` | Run API contract and data integrity tests |
| `npm run test:ui` | Run browser UI tests across configured projects |
| `npm run test:headed` | Run tests with visible browsers |
| `npm run test:debug` | Open Playwright Inspector |
| `npm run typecheck` | Validate TypeScript without emitting files |
| `npm run report` | Open the latest HTML report |

## Configuration

Defaults are ready to run locally. Optional environment variables are documented in `.env.example`.

| Variable | Default | Purpose |
|---|---|---|
| `API_BASE_URL` | `http://127.0.0.1:4010` | Base URL for API tests |
| `MOCK_API_PORT` | `4010` | Port used by the local mock API |

## CI Pipeline

The GitHub Actions workflow runs on pushes, pull requests, and a nightly schedule:

1. Install dependencies with `npm ci`.
2. Run `npm run typecheck`.
3. Run Playwright projects independently: `api`, `chromium`, `firefox`, `webkit`, and `mobile-chrome`.
4. Upload the Playwright HTML report as a CI artifact.

## Test Strategy

See [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md) for scope, quality gates, and triage notes.

## Resume Talking Points

- Built a Playwright automation framework with separate API and browser projects.
- Designed typed API helpers to reduce repeated request/assertion code.
- Added deterministic mock services to make CI reliable and repeatable.
- Covered data validation beyond happy-path status checks.
- Configured GitHub Actions with parallel project execution and retained reports.
