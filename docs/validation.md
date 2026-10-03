# Local validation record — October 3, 2026

Host: Nov, Windows, Node 26.3.1 / npm 11.16.0. Base: public HoneyDrunk.UI main `ae9ec4c36a454ba38a43d8e369a8758208b4bce1`. Work: isolated `feat/ui-accessible-foundation` worktree. Packages remain private and unpublished at 0.1.0; this is an unreleased additive change. No product workspace or prototype was modified. CI remains on Node 22; that Linux caller has not been exercised locally.

| Check | Result / limit |
|---|---|
| Locked dependency install | `npm ci --ignore-scripts` succeeded before edits; four focused dev dependencies added: Playwright, axe integration, esbuild, matching React DOM types |
| Typecheck | Passed, including legacy consumer compile contract |
| Lint | Passed with zero warnings |
| Component/contract/contrast | 24 tests passed |
| Build | Passed declaration generation and real RN Web consumer bundle |
| Browser integration | Seven Chromium tests passed; no page/console errors |
| Axe | No A/AA violations in both generic themes with visible error and busy states; this is fixture evidence, not native or app acceptance |
| Web screenshots | Dark/light/large-text inspected; review artifacts, no approved pixel regression baseline |
| Dependency security | `npm audit --json` failed: nine high-severity affected package paths from the inherited braces advisory through Metro/RN tooling. No patched braces registry release was available; no forced RN downgrade or audit suppression |
| Native | iOS/Android rendering, device builds, VoiceOver/TalkBack, Dynamic Type, native keyboard/RTL and Maestro not run |
| Other delivery gates | Automated secret scan/SAST, performance, deployed E2E, package/release rollback and new GitHub Actions caller not run |
| Consumer provenance | Legacy source/type shape covered here; actual consumer snapshot adoption and build not run |
| Independent review | No independent reviewer ran; explicit author review used the Studio defect-first rubric |

The audit paths are one advisory with propagated dependency impact, not nine independent flaws. [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) describes recursive-pattern stack exhaustion in braces through 3.0.3 and lists no patched version. The lockfile already had these affected paths before this change. Package release needs a deliberate risk decision/remediation; source validation is not a clean security certificate.

Author review checked contract compatibility, host state/value mapping, preserved input identity, disabled/busy event guards, focus styles, reduced-motion subscription cleanup/races, finite progress ranges, dependency direction, source/bundle resolution and the CI caller contract. Tests uncovered ignored grouped accessibility props in RN Web and the need for an explicit TypeScript 6 output root; both were corrected. The status component imports the theme module directly, avoiding a barrel cycle. No blocking finding remains in changed behavior; the external/runtime gaps above remain explicit.

No image-match claim is made. The supplied approved visual could not be materialized into readable local bytes; the work used generic contract-based fixtures. App visual acceptance is still required.
