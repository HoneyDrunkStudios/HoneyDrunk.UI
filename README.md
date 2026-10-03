# HoneyDrunk.UI

Small, app-themed React Native UI foundation. Platform-neutral theme contracts live in @honeydrunk/ui-tokens; native primitives live in @honeydrunk/ui-native. These are private, unpublished workspace packages, not registry releases.

## Packages

- **ui-tokens**: semantic colors, typography, spacing, shape and control-state tokens, plus `resolveTheme` for additive defaults. No runtime or platform dependencies.
- **ui-native**: ThemeProvider, useTheme, Button, Label, Card, Input, Loading, Notice, Badge, Progress and style factories. React and React Native are host-supplied peers.

Apps supply a complete Theme to ThemeProvider. There is no implicit product theme. Input accepts standard TextInput props; Card accepts View props. Label accepts Text props and defaults to selectable text. Button defaults to a 48-by-48 minimum target and exposes disabled/busy semantics. Notice uses a polite live region on Android and web; iOS announcement timing belongs to the consumer. Tokens are JavaScript values; styles use React Native StyleSheet-compatible objects.

Navigation, authentication, domain state, quest policy, branding and artwork stay in consuming applications. Browser rendering uses the consumer's React Native Web adapter; no shadcn, Tailwind or separate CSS framework is included.

## Development

Use Node 22.13 or later, then run:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:web
```

`npm run validate` runs typecheck, lint with zero warnings, component/contract tests, declaration generation, a real consumer bundle and Chromium integration tests. The browser suite checks keyboard activation/focus, disabled/busy guards, theme switching, error association and input preservation, RTL, twofold text growth, reduced motion and axe WCAG A/AA rules. Screenshots go to `artifacts/screenshots`; these are review evidence, not approved visual baselines. The generic fixture is test code, not a product screen. See [testing responsibilities and gates](docs/testing.md) and [the validation record](docs/validation.md).

CI reuses the pinned HoneyDrunk.Actions Node workflow with the same build, checks and browser tests. Local execution does not prove the new remote caller has run. Native rendering, VoiceOver/TalkBack and real device acceptance remain separate.

## Additive primitives and states

```tsx
<Button title="Save" onPress={save} loading={saving} />
<Input accessibilityLabel="Name" value={name} onChangeText={setName} error={error} />
<Badge label="Available" />
<Progress label="Completion" value={25} min={0} max={100} valueText="25 percent" />
```

The app localizes labels, value descriptions and errors. Progress clamps out-of-range values, rejects nonfinite values or nonincreasing ranges, and has no animation. Web exposes the original numeric range; native accessibility receives a rounded 0–100 percentage because RN's Android delegate reads integer ranges. Supply `valueText` for localized units or precision beyond whole percentages. The visual fill retains the full fraction on both platforms. Badge is noninteractive text. Input adds an adjacent error Text without remounting the input; keep related fields in an app-owned layout container. Error text is associated with the field on web and added to the native accessibility hint. Notice/error live regions do not guarantee iOS announcements; consumers should announce meaningful transitions deliberately with React Native AccessibilityInfo and verify them on devices.

Loading shows its supplied label while the host motion preference resolves and whenever reduced motion is enabled; otherwise it shows the host activity indicator. Mounted loaders share one host preference subscription, so removing one loader preserves updates for the others. Reserve enough layout space for that readable fallback. Focus outlines use token colors/widths without shifting layout. No text is truncated and native font scaling remains enabled by default; Label and Input retain host text props.

## Token compatibility

Existing Theme objects still compile. New fields are optional: `colors.focus`, `colors.progressTrack`, `typography.subtitleWeight`, `typography.buttonWeight`, `spacing.buttonHorizontal`, `controls.minWidth`, `controls.focusWidth`, and `controls.progressHeight`. `resolveTheme` uses existing primary/border colors and foundation geometry/weights as fallbacks. Existing required fields and package versions remain unchanged for the private source-snapshot workflow. Elevation, animation presets and navigation abstractions are intentionally deferred until a concrete consumer needs them.

Apps must validate their actual theme: informative text at least 4.5:1, essential boundaries and focus at least 3:1, and progress fill at least 3:1 against its track. Set `progressTrack` explicitly when the fallback border color does not contrast with primary. Check opacity-composited disabled text too if the product requires 4.5:1 for all informative text. Theme overrides can reduce targets or contrast; the generic contract does not certify arbitrary palettes.

## Consumption before a registry release

Use the source packages in an Expo npm workspace. The initial Pocket Quests consumer keeps an explicit local workspace snapshot to avoid unpublished-registry dependencies. Its palette and app-specific panels stay app-owned. Synchronize generic source deliberately from a reviewed shared-repository revision; do not silently change all consumers. Packages expose TypeScript source for bundlers and currently target React 19.2 / React Native 0.86.

For changing themes at runtime, read useTheme in app-owned UI too and regenerate any app-level styles/navigation options. Foundation components follow ThemeProvider changes directly. No custom font download is required.

This change adds `src/theme.tsx`, `src/status.tsx`, `src/reducedMotion.ts` and package documentation. Snapshot consumers must synchronize the entire package tree from the reviewed commit and update their provenance manifest; copying only the old index/styles files is incomplete. Run the consumer's drift check, typecheck, lint, tests and build afterward. No consumer snapshot was changed here. Registry publication/versioning remains a separate authorized step.
