# Local validation record — October 3, 2026

Host: Nov, Windows, Node 26.3.1 / npm 11.16.0. Base: public HoneyDrunk.UI main `ae9ec4c36a454ba38a43d8e369a8758208b4bce1`. Work: isolated `feat/ui-accessible-foundation` worktree. Packages remain private and unpublished at 0.1.0; this is an unreleased additive change. No product workspace or prototype was modified. CI remains on Node 22; that Linux caller has not been exercised locally.

| Check | Result / limit |
|---|---|
| Locked dependency install | `npm ci --ignore-scripts` succeeded before edits; four focused dev dependencies added: Playwright, axe integration, esbuild, matching React DOM types |
| Typecheck | Passed, including legacy consumer compile contract |
| Lint | Passed with zero warnings |
| Component/contract/contrast | 36 tests passed, including progress host-prop regressions and shared motion-subscription lifecycle/query races |
| Build | Passed declaration generation and real RN Web consumer bundle |
| Browser integration | Nine Chromium tests passed, including both multiple-loader unmount orders and reconnects; no page/console errors |
| Axe | No A/AA violations in both generic themes with visible error and busy states; this is fixture evidence, not native or app acceptance |
| Web screenshots | Dark/light/large-text inspected; review artifacts, no approved pixel regression baseline |
| Dependency security | Full and `--omit=dev` npm audit both failed: nine high affected package entries from one inherited braces advisory. All nine lock entries match the baseline; inspected watcher calls and the browser bundle do not reach the vulnerable walkers. See the [scoped assessment](dependency-security.md); no patched supported chain or clean-security claim |
| Native | iOS/Android rendering, device builds, VoiceOver/TalkBack, Dynamic Type, native keyboard/RTL and Maestro not run |
| Other delivery gates | Automated secret scan/SAST, performance, deployed E2E, package/release rollback and new GitHub Actions caller not run |
| Consumer provenance | Legacy source/type shape covered; isolated actual snapshot-adapter canary passed five-to-eleven-file sync at `a208d8c`. Loading fix adds a twelfth package file; final snapshot adoption/build belongs to the consumer |
| Review | Fresh review fixed two progress issues; independent review then reported the confirmed multiple-loader motion P2 in `a208d8c`. Fix and regressions passed local checks and author review; independent re-verification pending |

The audit paths are one advisory with propagated dependency impact, not nine independent flaws. [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) describes recursive-pattern stack exhaustion in braces through 3.0.3 and lists no patched version. The lockfile already had these affected paths before this change. The dependency graph includes production peers, so “dev-only” is not an accurate disposition. Package release needs a deliberate risk decision/remediation; source validation is not a clean security certificate.

Review checked contract compatibility, host state/value mapping, preserved input identity, disabled/busy event guards, focus styles, reduced-motion subscription cleanup/races, finite progress ranges, dependency direction, source/bundle resolution and the CI caller contract. Earlier implementation tests uncovered ignored grouped accessibility props in RN Web and the need for an explicit TypeScript 6 output root; both were corrected. The status component imports the theme module directly, avoiding a barrel cycle.

The fresh review found two further defects in Progress:

1. Unconditional range scaling lost precision for large, narrow ranges: `min=1e16`, `max=1e16+8`, `value=1e16+2` rendered roughly 28.57% instead of 25%. Subtracting first for finite spans, and halving only overflowing spans, preserves both narrow and opposite-extreme cases. Added positive/negative narrow, subnormal and fractional regressions.
2. The installed RN 0.86.3 Android `ReactAccessibilityDelegate.kt` reads accessibility range fields with `asInt()`. Fractional ranges can collapse; huge values are unsuitable for this boundary. Native Progress now sends a bounded whole percentage with the app's optional value text; web retains the original range. Both ARIA aliases and grouped props agree because RN View gives the aliases priority. Host-boundary tests cover Android/iOS mapping; these do not replace actual device checks.

After those fixes, `npm run validate` passed in full. The first sandboxed Node test invocation could not spawn workers (`EPERM`); the authorized local rerun completed all tests. Final screenshots were re-inspected. No additional blocking implementation defect was identified in this review; the unresolved security finding and external/native acceptance gaps above remain.

Independent review subsequently found a P2 in the Loading lifecycle: RN Web 0.21.3 stores accessibility listeners using callback string keys. Identical per-loader closures collide, so unmounting the first loader removes the second loader's listener. A new Chromium regression reproduced the reported failure on `a208d8c` before the fix: the remaining loader stayed animated after reduced motion was enabled.

Loading now uses one shared `AccessibilityInfo` subscription through `useSyncExternalStore`, removed only when the last consumer unsubscribes. Static SSR/initial behavior and native busy/name/role semantics remain intact. Reconnection queries the current preference; events invalidate older queries, and disposed queries/callbacks cannot affect the new connection. Six adapter regressions and two real-browser unmount/reconnect regressions cover these boundaries. The new test's missing explicit Node Buffer import was corrected after lint caught it; the subsequent full `npm run validate` passed all 36 component/contract tests and nine browser tests, plus typecheck, zero-warning lint and build. Final diff review checked subscription ownership, cleanup, race ordering, SSR, and unchanged public signatures/dependencies. Independent re-verification and native/device acceptance remain pending.

The Loading fix adds `packages/ui-native/src/reducedMotion.ts`; source consumers must sync the full twelve-file package tree. It changes no dependency versions, security settings or audit disposition. Refreshed browser bundle evidence has 265 inputs and still excludes the implicated advisory tooling.

No image-match claim is made. The supplied approved visual could not be materialized into readable local bytes; the work used generic contract-based fixtures. App visual acceptance is still required.
