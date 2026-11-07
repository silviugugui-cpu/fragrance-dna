# FragranceDNA Project Instructions

## Local Development

* Always use localhost:3000.
* Never switch to ports 3001, 3002, 3003 or any alternative port.
* If port 3000 is occupied:

  * identify the process
  * stop the conflicting process if appropriate
  * restart the project on port 3000
* All local testing, screenshots and verification must use:

  * http://localhost:3000

---

## Fonts

Use only free and legally redistributable fonts.

Preferred solution:

* next/font/google

Do not introduce:

* paid fonts
* proprietary fonts
* licensed commercial fonts
* manually downloaded fonts
* fonts requiring future purchases

If a font is missing:

1. identify the visual intent
2. find the closest Google Font equivalent
3. implement using next/font/google

Typography must:

* work locally
* work in production
* generate no 404 requests
* require no manual asset installation
* generate no licensing concerns

---

## Deployment

### Default workflow: local only

* Implement, test, and build changes locally. Keep the work persisted in the local repository.
* Do not commit, push/synchronize with GitHub, trigger a deployment, or publish changes unless the user explicitly asks to deploy.
* Never deploy automatically after completing an individual task.
* When the user explicitly requests a deployment, deploy the complete accumulated set of local changes since the last deployed version together.

### Only when deployment is explicitly requested

* Review and validate the full accumulated change set before publishing.
* Synchronize GitHub and deploy to Vercel only as part of that requested batch.
* Verify the deployed production version after deployment and report the result.

---

## Verification

For normal local-only tasks, verify relevant behavior at `http://localhost:3000`, run the applicable tests, and build when appropriate.
Do not treat GitHub synchronization, Vercel deployment, or production checks as task requirements unless the user explicitly requests a deployment.
Do not claim verification that was not actually performed.

---

## Technical Standards

* TypeScript only
* Avoid any types
* Reuse existing components
* Prefer reusable architecture over one-off solutions
* Fix build errors before reporting completion
* Fix TypeScript errors before reporting completion

---

## UX Standards

* Never leave empty charts
* Never leave placeholder dashboards
* Never leave unfinished sections visible to users
* Every visible widget should provide meaningful information

---

## Dashboard Standards

When showing analytics:

* prefer real data
* provide graceful empty states
* avoid fake metrics
* avoid hardcoded demo values unless explicitly marked as examples

---

## Production Quality

This repository is building a production product, not a prototype.

Prefer:

* maintainability
* extensibility
* reusable architecture

over quick hacks.
## Architecture Reference

Always read and follow:

/docs/FRAGRANCEDNA_ARCHITECTURE.md

before implementing major features.
