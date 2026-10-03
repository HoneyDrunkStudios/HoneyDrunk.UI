# Dependency advisory assessment — October 3, 2026

Status: **unresolved inherited dependency finding**. Full `npm audit --json` and `npm audit --omit=dev --json` both exit 1 with nine high-severity affected package entries. They trace to one advisory, [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): deeply nested patterns can exhaust the recursive walkers in braces through 3.0.3. The advisory lists no patched version. This assessment narrows demonstrated reachability; it does not suppress the finding or establish clean security.

## Provenance and installed chain

Compared every affected lock entry, including version, integrity, resolution and flags, with the original `ae9ec4c36a454ba38a43d8e369a8758208b4bce1` lockfile. All nine are identical. None was introduced or upgraded by this foundation work.

`npm explain braces` resolves:

```text
react-native 0.86.3
  @react-native/community-cli-plugin 0.86.3
    metro / metro-config / metro-transform-worker 0.84.5
      metro-file-map 0.84.5
        micromatch 4.0.8
          braces 3.0.3
```

The ninth affected package is `@react-native/virtualized-lists` 0.86.3, propagated through its React Native peer. Root React Native is a dev dependency and a peer of the UI workspace package. npm includes that chain in the production dependency graph as well; calling the finding “dev-only” would be inaccurate. Dependency installation and inclusion in a shipped bundle are separate questions.

## Reachability inspected

- **Shared UI source:** imports React, React Native and the platform-neutral token package. Labels, input text, theme strings and progress values are not passed to glob parsing APIs. No direct micromatch/braces import exists in the source packages.
- **Production-mode browser fixture:** reproduced `scripts/build.mjs` settings with an esbuild metafile. Across 264 build inputs, none comes from braces, micromatch, Metro or the RN CLI plugin. This is evidence for this RN Web fixture, not a deployed consumer or arbitrary server-side consumer bundle.
- **Installed Metro watcher:** the only executable micromatch use found in the inspected Metro/RN toolchain is `metro-file-map/src/watchers/common.js` (`includedByGlob`). It calls `micromatch.some`. In installed micromatch 4.0.8, `.some` invokes Picomatch directly. The vulnerable braces walkers are used by `.braces`, `.braceExpand` and `.parse`, not this inspected matching path. Merely requiring micromatch loads braces without calling those walkers.
- **Pattern origin:** `metro-file-map/src/Watcher.js` constructs watcher globs from fixed package/health-check patterns and configured extensions. File names are candidate strings, not parsed glob patterns. The reviewed path does not show a user-entered label or remote request reaching braces.
- **Bounded local trace:** instrumented the braces function in a separate process and called the real installed `includedByGlob` with four ordinary cases, including a brace-pattern extension and a file path containing braces. Zero braces calls; a positive-control `micromatch.braces` call registered once. This supports the source trace; it is not an exhaustive Metro fuzz test or a denial-of-service reproduction.
- **Native/device and app runtime:** no native bundle, device build, deployed app, backend glob service or consumer-specific Metro plugin was inspected. These must be assessed in the owning app. No production runtime exploit path was demonstrated in the inspected UI source/browser bundle; that is narrower than proving every consumer unaffected.

Local supporting files are `artifacts/security/review.mjs`, `reachability.json` and `web-metafile.json`. They are ignored review artifacts, not package payload. The source paths above refer to the installed versions in the locked dependency tree.

## Supported remediation options and decision

Registry reads returned latest braces 3.0.3 and micromatch 4.0.8, which still requires `braces ^3.0.3`. React Native's available 0.86 versions end at 0.86.3. Even latest metro-file-map 0.87.1 still declares `micromatch ^4.0.4`; moving to a different Metro line does not establish remediation and would need host compatibility review.

The audit's suggested React Native 0.72.17 is a breaking downgrade from this repository's 0.86.3 host contract, not a supported safe fix. No forced update, dependency removal, alternate-package alias, unreviewed fork, audit suppression or disabled check was applied. A custom depth guard would require a separately reviewed dependency patch and upstream semantics/testing; it is not justified as an incidental UI change.

Retain the existing lockfile and unresolved advisory evidence for this local work. A patched braces release within the declared compatible range, or a supported upstream Metro/micromatch release removing the vulnerable path, would enable a focused lockfile update followed by audit, full UI validation and native/consumer checks. Until then, do not expose braces parsing/expansion to untrusted patterns in an app or build service, and keep build configuration under the existing review boundary. Those constraints reduce potential exposure; they do not patch the installed package.

Before a package or app release, the owner must resolve the finding or make an explicit, recorded release-risk decision using that consumer's actual build/runtime evidence. Public publication remains outside this task's authorization. No security settings or grants were changed.
