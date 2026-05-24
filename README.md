# QA Automation Portfolio

A production-structured Playwright test framework demonstrating UI automation, API testing, and data integrity validation — the same patterns used in fintech SaaS environments across distributed microservices.

---

## What's in here

| Suite | Location | What it covers |
|---|---|---|
| API — Users & Auth | `tests/api/users.spec.ts` | CRUD operations, auth flows, status codes, error handling |
| API — Data Integrity | `tests/api/data-integrity.spec.ts` | Schema validation, pagination consistency, field-level assertions |
| UI — Navigation & Layout | `tests/ui/playwright-site.spec.ts` | Navigation, search, responsive layout, accessibility, console errors |

---

## Stack

- **Framework:** Playwright (TypeScript)
- **CI:** GitHub Actions — parallel matrix across Chromium, Firefox, WebKit
- **Reporting:** Playwright HTML reporter
- **Target:** [reqres.in](https://reqres.in) (API) · [playwright.dev](https://playwright.dev) (UI)

---

## How to run

```bash
# Install
npm install
npx playwright install

# Run all tests
npm test

# Run only API tests
npm run test:api

# Run only UI tests
npm run test:ui

# Run headed (watch the browser)
npm run test:headed

# Open HTML report after a run
npm run report
```

---

## Project structure

```
├── tests/
│   ├── api/
│   │   ├── users.spec.ts          # CRUD + auth API tests
│   │   └── data-integrity.spec.ts # Schema + consistency tests
│   ├── ui/
│   │   └── playwright-site.spec.ts # UI regression suite
│   └── utils/
│       └── api-client.ts          # Typed API wrapper (base client)
├── fixtures/                      # Test data and shared fixtures
├── reports/                       # Generated HTML reports (gitignored)
├── playwright.config.ts           # Multi-browser config, parallelism, retries
└── .github/workflows/playwright.yml # CI pipeline
```

---

## Design decisions

**Typed API client** — `tests/utils/api-client.ts` wraps Playwright's `APIRequestContext` with typed methods and centralised status assertions. Individual test files focus on business logic, not HTTP boilerplate.

**Data integrity layer** — the `data-integrity.spec.ts` suite validates response schema, field types, boundary conditions, and cross-page consistency. This mirrors the SQL validation work done on reporting pipelines: assert the shape and correctness of data, not just the status code.

**Parallel by default** — `fullyParallel: true` in config, with a GitHub Actions matrix running Chromium, Firefox, and WebKit concurrently. CI fails fast only in PR checks; nightly runs retry twice per test to surface flakiness.

**No magic selectors** — UI tests use `getByRole`, `getByText`, and semantic locators throughout. No `div > span:nth-child(3)` selectors that break on any layout change.

---

## CI

Every push to `main` or `develop` triggers the full suite across three browsers in parallel. Test reports are uploaded as artifacts and retained for 14 days.

Nightly scheduled run at 2am UTC catches environment drift and third-party regressions.

---

## Background

Built to demonstrate the framework design and test strategy patterns from 8 years of QA work across fintech SaaS platforms. The structure here reflects how I approach automation at scale: typed abstractions over raw API calls, data validation as a first-class concern, and CI integration from day one.
