---
name: deploy
description: Deploy the expense tracker to staging - run all tests, build the production bundle, then push to the staging branch on origin. Use only when the user runs /deploy.
disable-model-invocation: true
---

# Deploy to staging

Run these steps in order from the project root. **Stop at the first failure**, show the
failing output, and do not continue to later steps. Never skip a step or bypass a failure
(no `--force`, no `--no-verify`).

## 1. Preflight

- Run `git status --porcelain`. If the working tree is not clean, stop and tell the user:
  only committed work gets deployed, so they should commit or stash first.
- Note the commit being deployed: `git log -1 --oneline`.

## 2. Run all tests

- If `package.json` has a `test` script, run `npm test` and require it to pass.
- If it has none (true today: this project has no test framework), say so plainly, then run
  `npm run lint` as the quality gate instead. Do not install a test runner as part of a deploy.
- Lint errors fail the deploy. Warnings do not.

## 3. Build the production bundle

- Run `npm run build`. It must exit 0 and produce `dist/`.
- Report the bundle sizes that Vite prints.

## 4. Push to staging

- Run `git push origin HEAD:staging`. The first push creates the `staging` branch on GitHub.
- If the push is rejected as non-fast-forward, stop and report it. Do not force-push. The
  user decides whether staging should be reset.
- `dist/` is gitignored and is not pushed. Staging receives the source at this commit, and
  the host that deploys from the `staging` branch builds it.

## 5. Report

Summarize in a few lines: the commit deployed, the test/lint result, the build result, and
the push result (with the branch URL
`https://github.com/JDpyCoder/expense-tracker-starter/tree/staging`).
