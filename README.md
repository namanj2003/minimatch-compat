# minimatch-compat

An adapter so tools written for minimatch 3's callable export can run on patched minimatch 11.0.3. It addresses the export-shape incompatibility when upgrading lint dependencies affected by [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).

CommonJS `require("minimatch")` remains callable. The callable carries the real module's exports, including `Minimatch`, `filter`, `escape` and `GLOBSTAR`. Its `.minimatch` and `.default` properties refer to itself, and `defaults(options)` returns the same callable shape. ESM provides that same callable as its default and `minimatch` exports, plus the real module's named exports. No `makeRe` helper is added when upstream does not export one.

The matching implementation is the exact `minimatch@11.0.3` release, installed under the alias `minimatch-real`. This keeps an override for `minimatch` from redirecting the adapter's own dependency back to itself.

## Use with npm overrides

Add this entry alongside any existing root overrides:

```json
{
  "overrides": {
    "minimatch": "https://github.com/namanj2003/minimatch-compat/releases/download/v1.0.0/minimatch-compat-1.0.0.tgz"
  }
}
```

After the release tarball is available, run `npm install`, then `npm ci` and `npm audit`. Commit the updated lockfile so installs retain the tarball's resolved URL and integrity.

This package adapts the export shape only. Consumers that rely on minimatch 3's internals or older matching semantics may still break. Verify your tool's behaviour, including the files linted or ignored and all diagnostics, before adopting the override.

## Test and package

Use a Node version supported by minimatch: `18 || 20 || >=22`.

```sh
npm ci
npm test
npm pack
```

Archive this repo once your tools depend on minimatch ≥ 11.0.1 directly.
