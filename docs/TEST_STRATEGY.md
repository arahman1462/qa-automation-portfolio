# Test Strategy

This repository is intentionally small, but it is structured like a production QA automation framework: deterministic test data, typed helpers, CI-ready commands, and a clear split between API and browser coverage.

## Scope

| Area | Coverage | Notes |
|---|---|---|
| API contract | Status codes, payload schema, CRUD-style flows, negative login path | Runs against a local mock API so CI does not depend on third-party uptime or rate limits. |
| Data integrity | Type checks, uniqueness, pagination math, cross-response consistency | Mirrors the checks used when validating reporting APIs and downstream data feeds. |
| UI regression | Navigation, search, responsive layout, basic accessibility signals, console errors | Uses semantic Playwright locators against a stable public documentation site. |

## Project Layout

- `tests/api` covers service-level behavior through Playwright's `APIRequestContext`.
- `tests/ui` covers browser behavior across desktop and mobile projects.
- `tests/utils` keeps low-level request helpers out of test cases.
- `tools/mock-api.js` provides a deterministic local API contract for repeatable CI runs.

## Quality Gates

Before opening a pull request, run:

```bash
npm run typecheck
npm test
```

The GitHub Actions workflow runs the same checks on pushes and pull requests, uploads the HTML report, and keeps browser projects separate from API tests so failures are easier to triage.

## Triage Notes

When a test fails, check artifacts in this order:

1. Playwright HTML report for the failing project.
2. Trace viewer for retry failures.
3. Screenshot or error context under `test-results/`.
4. CI job logs for environment or dependency failures.
