# HoneyDrunk.UI

Small, app-themed React Native UI foundation. Platform-neutral theme contracts live in @honeydrunk/ui-tokens; native primitives live in @honeydrunk/ui-native. These are private, unpublished workspace packages, not registry releases.

## Packages

- **ui-tokens**: semantic colors, typography, spacing, shape and control-state tokens. No runtime or platform dependencies.
- **ui-native**: ThemeProvider, useTheme, Button, Label, Card, Input, Loading, Notice and style factories. React and React Native are host-supplied peers.

Apps supply a complete Theme to ThemeProvider. There is no implicit product theme. Input accepts standard TextInput props; Card accepts View props. Label preserves selectable text, Button preserves disabled accessibility semantics and a 48-point default touch target, and Notice announces errors politely. Tokens are JavaScript values; styles use React Native StyleSheet-compatible objects.

Navigation, authentication, domain state, quest policy, branding and artwork stay in consuming applications. Browser rendering uses the consumer's React Native Web adapter; no shadcn, Tailwind or separate CSS framework is included.

## Development

Use Node 22.13 or later, then run:

```sh
npm ci
npm run typecheck
npm run lint
npm test
```

The tests render real primitives through React Native Web, check independent theme rendering, accessibility, state precedence and contrast. Device-level native validation remains separate.

## Consumption before a registry release

Use the source packages in an Expo npm workspace. The initial Pocket Quests consumer keeps an explicit local workspace snapshot to avoid unpublished-registry dependencies. Its palette and app-specific panels stay app-owned. Synchronize generic source deliberately from a reviewed shared-repository revision; do not silently change all consumers. Packages expose TypeScript source for bundlers and currently target React 19.2 / React Native 0.86.

For changing themes at runtime, read useTheme in app-owned UI too and regenerate any app-level styles/navigation options. Foundation components follow ThemeProvider changes directly. No custom font download is required.
