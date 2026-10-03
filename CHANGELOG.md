# Changelog

## Unreleased

- Add optional semantic focus/progress colors and control size/typography tokens with legacy-theme defaults.
- Add named, clamped, nonanimated Progress and text Badge primitives.
- Preserve progress precision for narrow finite ranges and normalize native accessibility values to bounded percentages.
- Add Button busy guards, token-driven keyboard focus outlines, Input error association without losing input state, and standard Text props on Label.
- Respect reduced motion in Loading with a readable static fallback and host preference updates.
- Share the Loading preference subscription so unmounting one loader does not disconnect another; guard stale preference queries across reconnects.
- Add legacy type contracts, component/contrast regressions, declaration/consumer build checks and real browser interaction/accessibility tests.
- Reuse the pinned HoneyDrunk.Actions Node validation workflow; document native/consumer acceptance and publication limits.
- Document inherited dependency advisory reachability and unresolved remediation constraints.

## 0.1.0

- Introduce platform-neutral theme contracts and app-themed native primitives.
- Add accessibility, alternate-theme, disabled-state and contrast regression coverage.
- Keep workspace packages private and unpublished.
