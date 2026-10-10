# HoneyDrunk.UI agent instructions

Own platform-neutral theme contracts in `packages/ui-tokens` and reusable React Native primitives in `packages/ui-native`. Product themes, navigation, authentication and domain state belong in consuming applications. Packages are private unpublished workspace packages; source-snapshot synchronization is explicit, not a registry release.

Read [README.md](README.md), [testing responsibilities](docs/testing.md) and the relevant package docs. Preserve accessibility semantics, theme overrides, native/web distinctions and host-supplied React/React Native peers. Do not introduce a separate CSS framework or app-specific panels here.

Read the [shared engineering conventions](https://github.com/HoneyDrunkStudios/HoneyDrunk.Standards/blob/main/HoneyDrunk.Standards/docs/CONVENTIONS.md) and this repository's owning documentation before editing. Apply the parts relevant to this stack; preserve existing public contracts, dependency direction and repository-specific behavior. Verify shared capabilities in current code before reusing them; a catalog entry or scaffold is not an implemented integration.

Work within the selected request. Preserve unrelated changes and use a separate worktree when needed. Review the final diff, use Conventional Commits and ready-for-review PRs with exactly one accurate `Authorship:` line and a `Request:` line; include the authorship in commit trailers. Run meaningful checks for the affected behavior and report the reviewed/tested revision, failures and unrun checks. For documentation-only changes, check links, paths and instruction consistency. Preserve required checks and inspect actual latest-head Sonar new-code findings where analysis applies; do not suppress findings or weaken gates to obtain a pass. Legacy Grid Review is retired; do not restore its workers, queues or bypass labels. A configured replacement reviewer is not evidence of a completed review or enforcing merge check.

## Verification

Use the Node requirement and locked dependencies in this repo. From the root: `npm ci`, `npx playwright install chromium`, then `npm run validate`. That script covers typecheck, lint, component/contracts, declaration generation, the consumer bundle and browser tests. Report VoiceOver/TalkBack, real native rendering and device acceptance separately; Chromium is not native evidence.
