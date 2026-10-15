# Testing responsibilities and gates

This package owns reusable presentation behavior and token contracts. Apps own navigation, localization, product colors, domain rules, persistence, account boundaries and complete journeys. A browser adapter test does not prove a native app works. Automated accessibility passes do not certify ADA/legal compliance or complete WCAG conformance.

## Existing standards and reuse

Studio [ADR-0047](https://github.com/HoneyDrunkStudios/HoneyDrunk.Studio/blob/main/adrs/ADR-0047-testing-patterns-and-tooling.md) is Accepted: unit, in-process integration, real-dependency integration, deployed E2E and consumption canaries have different responsibilities. It selects Playwright's .NET binding for deployed web surfaces and Maestro for native E2E. [ADR-0074](https://github.com/HoneyDrunkStudios/HoneyDrunk.Studio/blob/main/adrs/ADR-0074-testing-library-stack.md) remains Proposed; the .NET stack is already committed by ADR-0047. Its xUnit/NSubstitute/AwesomeAssertions/coverlet choices are not JavaScript packages.

HoneyDrunk.Standards supplies .NET analyzers, test stack and coverage assets. No reusable TypeScript standards package was verified. This repository retains its Expo ESLint configuration, TypeScript strictness and Node test runner. Playwright's JavaScript runner here exercises the RN Web package adapter and consumer bundle; it is not a deployed product E2E replacement for the Studio .NET binding.

[HoneyDrunk.Actions](https://github.com/HoneyDrunkStudios/HoneyDrunk.Actions) owns reusable GitHub execution. The validation caller pins `job-node-workspace.yml` at `1d0be2dc9d3ccb010d243a9c9d6c8dbe91efb97b`, a verified upstream revision. HoneyDrunk.Pipelines is deprecated by the founder's current instruction and is excluded from this plan. No new Testing node or duplicate CI framework is needed.

## Checks implemented here

| Layer | Command / evidence | Purpose |
|---|---|---|
| Static contracts | `npm run typecheck` including `tests/contracts.tsx` | Original Theme shape and calls still compile; missing required new labels and invalid value types fail compilation |
| Unit/component/contract | `npm test` | Defaults/custom tokens, no theme mutation, real SSR primitives, roles/names/states, error association, range edges, native progress host-prop mapping, reduced-motion SSR/shared-subscription lifecycle/query races, text/boundary/opacity contrast |
| Consumer integration/build | `npm run build` | Emits declarations and bundles actual source package imports through RN Web with esbuild; no guessed registry releases |
| Browser integration | `npm run test:web` | Actual Chromium events, Enter/Space/Tab, focus outline, disabled/busy guards, theme update, error toggle without input remount, RTL, narrow layout, multiple-loader unmount orders and motion changes after reconnect |
| Automated accessibility | Browser test's axe A/AA scans | `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, both generic themes in busy/error states; no excluded rules or ignored violations |
| Manual web visual review | `artifacts/screenshots/*.png` | Inspect dark/light/large-text fixtures; screenshots are review artifacts, not a regression baseline |

Before this change CI ran typecheck, lint and five server-render tests. The local caller now runs declaration/bundle build and browser tests through Actions in addition to those layers. Browser installation uses the locked Playwright package. The job keeps `contents: read`; no credentials, protections, deployments, schedules or package publishing were added. Reusable workflow nesting changes the emitted GitHub check name; confirm any required-check references before publication without silently editing protections. The new remote caller has not run during this local-only task.

## Smallest native smoke harness

Recommended next native gate: one auth-free Expo example using the supported host versions (consumer currently Expo 57 / React 19.2.3 / RN 0.86.3). Give it a ScrollView, the two generic test themes, enabled/disabled/busy Buttons, an editable and read-only Input, error toggle, Badge, Progress, and Loading. Mirror the browser fixture's local state without its DOM/window entry code. Import the workspace packages directly; add no API, account state, artwork, navigation framework or release infrastructure.

Use local Android APK and iOS simulator builds of that example, stable testID selectors and a single Maestro flow under `tests/HoneyDrunk.UI.Tests.Mobile`. Launch, activate once, verify count, tap disabled/busy and verify unchanged count, edit, toggle errors and verify preserved text, switch theme, inspect progress, and scroll to the last action. Build/install first; a YAML file or Expo export alone is not a passed native test. Expo's [official Maestro guide](https://docs.expo.dev/eas/workflows/examples/e2e-tests/) supports local execution against installed emulator/simulator builds; a paid cloud service is unnecessary for this baseline. Windows cannot supply the iOS simulator gate. This task does not install Maestro or create an Expo example, and native E2E is unrun.

If native JS component failures appear, add SDK-matched `jest-expo` and React Native Testing Library in that example using Expo's [official testing guidance](https://docs.expo.dev/develop/unit-testing/). Avoid the deprecated react-test-renderer path. Keep semantic assertions, real events and contract-compatible seams; do not duplicate every style literal in snapshots.

## Manual acceptance required

On at least one real iOS and Android phone and a small supported layout, record OS, device, build revision and theme. Verify VoiceOver/TalkBack names, roles, busy/disabled/range values, error discovery, announcement timing and logical traversal. Test hardware keyboard focus, 200% system text, longer localized text, both light/dark palettes, RTL, reduced motion before and during loading, no clipping, reachable actions and 44-point iOS / 48-dp Android targets. Browser token scaling is only a reflow simulation; it is not native Dynamic Type verification.

Progress host-prop tests verify the native numeric boundary without running a native renderer. Include fractional and large custom ranges in device acceptance: native receives a rounded percentage, web retains the original range, and app-localized `valueText` carries units or finer precision. Host-prop assertions do not establish actual VoiceOver/TalkBack announcements.

Loading uses a shared `AccessibilityInfo` subscription through React's [external-store hook](https://react.dev/reference/react/useSyncExternalStore), with a static server snapshot and no subscription during server rendering. Browser regressions cover both two-loader unmount orders and removing/reconnecting all loaders. Adapter unit tests cover shared listener ownership, query/event races, stale callbacks after disposal, query failure and unavailable host subscriptions. Native device motion changes still need acceptance testing.

Inspect every app palette and actual adjacent surface. Text needs 4.5:1, essential boundaries/focus/progress fill need 3:1, and opacity-composited text needs review. Themeability means arbitrary app overrides can fail these requirements. Native live-region behavior differs: Android/web polite regions are covered structurally; iOS consumers must choose and verify deliberate [AccessibilityInfo announcements](https://reactnative.dev/docs/0.86/accessibilityinfo). Announce transitions once rather than repeated renders; keep celebratory motion optional and provide static readable confirmation.

## Risk-based follow-up gates

| Change / delivery boundary | Gate and owner |
|---|---|
| Every shared UI PR | Local static/component/build/browser gates; UI owns failures; run native smoke when native props/layout change |
| App adopts a UI revision | App source-provenance/drift check, typecheck, lint, tests and export/build; app palette/accessibility and navigation composition |
| Dependency or supply-chain change | Reuse Actions Node audit/dependency-report/secret-scan tooling; include the workspace root in audit so development tooling is not omitted. Resolve advisories or explicitly assess release risk |
| Security-sensitive frontend seam | Actions SAST after verifying a JS/TS-compatible caller; current CodeQL job defaults to C# and a .NET build, so it is not plug-and-play for this package |
| Stateful backend change | App .NET unit/domain tests, in-process API contracts, actual SQL migrations/transactions/retry/idempotency, account/tenant isolation, deletion/restore tests; UI owns none of this policy |
| Product staging/release | App-owned browser and Maestro native journeys, accessibility and offline/restart smoke; real sign-in/data boundaries; agreed performance targets on recorded devices/network |
| Visual/style change | Deterministic renderer/fonts/viewport baseline and reviewed diffs for affected themes; keep dynamic spinners out of comparisons; do not auto-approve snapshots |
| Package release | Build/payload/API/peer compatibility canary in a clean consumer, dependency/security review, deliberate version and changelog, prior-revision rollback rehearsal and consumer smoke |

Heavy deployed, real-provider and broad-device suites belong to selected staging/release work, not every inexpensive primitive edit. No coverage percentage is claimed here: the JS suite has not adopted a coverage tool or node criticality tier. .NET coverlet thresholds do not automatically measure this package. No automated secret/SAST/native/performance/deployed E2E or package-release gate has been run by this task. Existing runtime telemetry nodes are not test runners; do not attach them indiscriminately to static UI primitives.

## Official references checked

Repository runtime versions remain React 19.2.3, RN 0.86.3, RN Web 0.21.3 and TypeScript 6.0.3; no major upgrade. Current docs checked: [RN accessibility](https://reactnative.dev/docs/0.86/accessibility), [Pressable](https://reactnative.dev/docs/0.86/pressable), [Text](https://reactnative.dev/docs/0.86/text), [TextInput](https://reactnative.dev/docs/0.86/textinput), [AccessibilityInfo](https://reactnative.dev/docs/0.86/accessibilityinfo), [RTL](https://reactnative.dev/docs/0.86/i18nmanager), [RN testing](https://reactnative.dev/docs/0.86/testing-overview), [Playwright accessibility](https://playwright.dev/docs/accessibility-testing), and [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Automated tools cover only some accessibility requirements; manual and inclusive user testing remain necessary.

## Sonar analysis and source coverage

The CI Sonar job analyzes both authored packages and build tooling after normal
validation. Use CI analysis only; disable automatic analysis in the bound
`HoneyDrunkStudios_HoneyDrunk.UI` project. The existing organization SONAR_TOKEN
must include this repository. Fork and Dependabot PRs receive normal validation without the token.

`npm run test:coverage` collects V8 coverage through c8 and imports LCOV. The
CommonJS TypeScript test loaders emit inline source maps to preserve source
line mapping. Unexecuted package files are included with zero coverage; browser
tests and data-URL-loaded modules do not add to this report. Coverage is evidence
for the Node harness, not native rendering, accessibility or device acceptance.
The scanner waits for the real gate. Check exact-head new-code findings and
the imported paths before claiming readiness; no gate or rule is suppressed.

## Enforced package import boundaries

`npm run lint` applies the local `architecture/package-boundaries` ESLint rule to
both package source trees. Tokens can import only their own source. Native
primitives can import their own source plus the existing public dependencies
`react`, `react-native` and `@honeydrunk/ui-tokens`. Relative paths cannot escape
that package's `src` directory. Importing token internals by relative path is not
a substitute for the public workspace entrypoint. Navigation, authentication
and product domain dependencies belong in consumers; adding them to a manifest
does not silently expand the allowlist.

The AST check covers static imports, re-exports, TypeScript import types/import
equals, dynamic imports and direct `require`/`require.resolve` calls. The existing
TypeScript compiler parser also checks triple-slash `path` and `types` references
against the same boundary in JS and TS sources, and identifies external module
augmentations. Standalone ambient declarations in script/declaration files
define modules rather than import them; `.mts`/`.cts` source files are inherently
external modules, so their declarations are checked as augmentations. Ordinary comments and string literals are not imports. JSDoc type imports
(`import()` and `@import`) are outside this bounded rule set; review owns those
type-only dependencies. This rule does not claim whole-program semantic analysis. Nonliteral
module specifiers fail closed. This is an architectural lint check, not a security
sandbox or a semantic detector for app logic copied into a local source file.
Review still owns those cases and any deliberate change to the allowlist.

`tests/package-boundaries.test.mjs` exercises positive and negative fixtures with
the real root ESLint config and checks that the rule is enabled as an error in
both packages. These tests run in the existing `npm test`, `npm run validate` and
CI paths. No empty-test success option or extra test runner is introduced.

The lint override also covers `.mts`/`.cts` (and their declaration forms), using
Expo's existing TypeScript parser and checks, alongside `.ts`/`.tsx` and the
JavaScript suffixes. Existing typecheck, declaration-build and package-coverage
entry globs still target `.ts`/`.tsx`. If explicit-module TypeScript source files
are introduced, expand those entry globs and verify emitted declarations and
coverage too; lint support alone does not establish build support.
