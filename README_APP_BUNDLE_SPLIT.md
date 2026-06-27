# Med Nykuto — app.bundle.js split

This refactor makes the main site JavaScript safer to edit.

## Current strategy

The runtime file remains:

```txt
app.bundle.js
```

The editable source fragments are generated in:

```txt
src/app-bundle/
  manifest.json
  parts/
    001-bundle-wrapper.js
    002-app-bootstrap-state.js
    ...
```

At this stage, the split is intentionally conservative: the fragments rebuild `app.bundle.js` byte-for-byte. This means the site behavior should not change.

## Commands

Split the current bundle into ordered fragments:

```bash
node scripts/split-app-bundle.js
```

Rebuild the runtime file from fragments:

```bash
node scripts/build-app-bundle.js
```

Validate that the fragments rebuild the current bundle exactly:

```bash
node scripts/validate-app-bundle-split.js
```

## Editing rule

Do not edit `app.bundle.js` directly when changing application logic. Edit the appropriate fragment under `src/app-bundle/parts/`, rebuild, then run validation and browser tests.

## Validation contract

The split is acceptable only if `scripts/validate-app-bundle-split.js` confirms that the rebuilt bundle is byte-identical to the current runtime file.

## Next evolution

The next cleanup phase can progressively convert these ordered fragments into true modules:

```txt
src/app/
src/i18n/
src/pages/
src/practice/
src/components/
```

This first step creates a safe bridge: the file is split and rebuildable without changing behavior.
