# Local validation record — October 3, 2026

Host: Nov, Windows, Node 26.3.1 / npm 11.16.0. Base: public HoneyDrunk.UI main `ae9ec4c36a454ba38a43d8e369a8758208b4bce1`. Work: isolated `feat/ui-accessible-foundation` worktree. Packages remain private and unpublished at 0.1.0; this is an unreleased additive change. No product workspace or prototype was modified. CI remains on Node 22; that Linux caller has not been exercised locally.

| Check | Result / limit |
|---|---|
| Locked dependency install | `npm ci --ignore-scripts` succeeded before edits; four focused dev dependencies added: Playwright, axe integration, esbuild, matching React DOM types |
| Typecheck | Passed, including legacy consumer compile contract |
| Lint | Passed with zero warnings |
| Component/contract/contrast | 30 tests passed, including fractional/extreme progress and native host-prop regressions |
| Build | Passed declaration generation and real RN Web consumer bundle |
| Browser integration | Seven Chromium tests passed; no page/console errors |
| Axe | No A/AA violations in both generic themes with visible error and busy states; this is fixture evidence, not native or app acceptance |
| Web screenshots | Dark/light/large-text inspected; review artifacts, no approved pixel regression baseline |
| Dependency security | Full and `--omit=dev` npm audit both failed: nine high affected package entries from one inherited braces advisory. All nine lock entries match the baseline; inspected watcher calls and the browser bundle do not reach the vulnerable walkers. See the [scoped assessment](dependency-security.md); no patched supported chain or clean-security claim |
| Native | iOS/Android rendering, device builds, VoiceOver/TalkBack, Dynamic Type, native keyboard/RTL and Maestro not run |
| Other delivery gates | Automated secret scan/SAST, performance, deployed E2E, package/release rollback and new GitHub Actions caller not run |
| Consumer provenance | Legacy source/type shape covered; isolated actual snapshot-adapter canary passed five-to-eleven-file sync and drift checks. Real consumer adoption/build not run |
| Review | Fresh defect-first review of committed checkpoint `d648d33` found and fixed two progress issues, then reviewed the final diff. No separate reviewer or remote PR review ran |

The audit paths are one advisory with propagated dependency impact, not nine independent flaws. [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) describes recursive-pattern stack exhaustion in braces through 3.0.3 and lists no patched version. The lockfile already had these affected paths before this change. The dependency graph includes production peers, so “dev-only” is not an accurate disposition. Package release needs a deliberate risk decision/remediation; source validation is not a clean security certificate.

Review checked contract compatibility, host state/value mapping, preserved input identity, disabled/busy event guards, focus styles, reduced-motion subscription cleanup/races, finite progress ranges, dependency direction, source/bundle resolution and the CI caller contract. Earlier implementation tests uncovered ignored grouped accessibility props in RN Web and the need for an explicit TypeScript 6 output root; both were corrected. The status component imports the theme module directly, avoiding a barrel cycle.

The fresh review found two further defects in Progress:

1. Unconditional range scaling lost precision for large, narrow ranges: `min=1e16`, `max=1e16+8`, `value=1e16+2` rendered roughly 28.57% instead of 25%. Subtracting first for finite spans, and halving only overflowing spans, preserves both narrow and opposite-extreme cases. Added positive/negative narrow, subnormal and fractional regressions.
2. The installed RN 0.86.3 Android `ReactAccessibilityDelegate.kt` reads accessibility range fields with `asInt()`. Fractional ranges can collapse; huge values are unsuitable for this boundary. Native Progress now sends a bounded whole percentage with the app's optional value text; web retains the original range. Both ARIA aliases and grouped props agree because RN View gives the aliases priority. Host-boundary tests cover Android/iOS mapping; these do not replace actual device checks.

After those fixes, `npm run validate` passed in full. The first sandboxed Node test invocation could not spawn workers (`EPERM`); the authorized local rerun completed all tests. Final screenshots were re-inspected. No additional blocking implementation defect was identified in this review; the unresolved security finding and external/native acceptance gaps above remain.

No image-match claim is made. The supplied approved visual could not be materialized into readable local bytes; the work used generic contract-based fixtures. App visual acceptance is still required.
