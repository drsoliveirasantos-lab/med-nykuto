# Med Nykuto — app.bundle.js split

This refactor makes the main site JavaScript safer to edit.

## Current strategy

The runtime file remains:

```txt
app.bundle.js
```

The editable source fragments are organized in:

```txt
src/app-bundle/
  manifest.json
  modules/
    runtime/
    app/
    pages/
    practice/
    misc/

src/i18n/
  app-bundle/

src/dom/
  app-bundle/
```

At this stage, the split is intentionally conservative: the fragments rebuild `app.bundle.js` byte-for-byte. This means the site behavior should not change.

## Commands

Split the current bundle into ordered fragments:

```bash
node scripts/split-app-bundle.js
```

Organize existing fragments by domain:

```bash
node scripts/organize-app-bundle-sources.js
```

Refine oversized fragments into smaller ordered fragments:

```bash
node scripts/refine-app-bundle-fragments.js
```

Extract i18n fragments into the i18n source area:

```bash
node scripts/extract-app-bundle-i18n.js
```

Reclassify the large content-normalization fragment if it is incorrectly grouped with i18n:

```bash
node scripts/reclassify-content-normalization-source.js
```

Extract DOM helper fragments into the DOM source area:

```bash
node scripts/extract-app-bundle-dom.js
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

Do not edit `app.bundle.js` directly when changing application logic. Edit the appropriate source fragment, rebuild, then run validation and browser tests.

For translations and language helpers, edit files under:

```txt
src/i18n/app-bundle/
```

For DOM selector/helper glue, edit files under:

```txt
src/dom/app-bundle/
```

Application glue, storage helpers and content-normalization helpers remain under:

```txt
src/app-bundle/modules/app/
```

Other generated application fragments remain under:

```txt
src/app-bundle/modules/
```

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
