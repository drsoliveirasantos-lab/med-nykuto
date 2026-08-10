# Site architecture — Med Nykuto

This document explains how the repository is organized so future human or AI contributors can work without damaging the source-of-truth structure.

## High-level model

Med Nykuto is organized around four layers:

1. **Editable sources** — the files humans and AI should normally edit.
2. **Generated runtime files** — files consumed by the browser and rebuilt or assembled from sources.
3. **Validation scripts** — scripts that protect source integrity, counters, links, assets, and runtime behavior.
4. **Documentation and governance** — files that explain what to edit, what not to edit, and how to validate changes.

## Branch model

- `preview` is the integration and validation branch.
- `main` is production.
- Feature, fix, audit, and documentation branches should target `preview` first.
- PRs should start as draft and become ready only after checks are green.

## Source-of-truth files

### Course content

```txt
content/courses/
  <course-id>/
    course.json
    modules/
      <module-source-files-or-folders>
```

Course metadata and module order live in each `course.json`. Global course counts are locked in `content-lock.json`.

Do not change visible counters by hand without also validating the lock files and course source structure.

### Runtime course data

```txt
data/med-courses-data.js
```

This file is browser runtime data. It is not the preferred editing surface. When course content changes, update the course sources and run the appropriate build/validation path.

### App bundle source

```txt
src/app-bundle/
src/dom/app-bundle/
src/i18n/app-bundle/
```

These are the editable source fragments for the runtime app bundle. Prefer editing these source areas instead of directly editing `app.bundle.js`.

### Runtime bundle

```txt
app.bundle.js
```

This is runtime output. Treat it as generated or assembled output unless the task explicitly requires runtime-level investigation.

## Validation layer

Important validators include:

```txt
scripts/validate-course-sources.js
scripts/validate-no-stale-files.js
scripts/validate-site-links.js
scripts/validate-data-health.js
scripts/validate-course-assets.js
scripts/validate-site-manifest.js
scripts/validate-strict-html-js-health.js
scripts/protected-data-guard.js
scripts/validate-seo-health.js
scripts/validate-branding-regression-advanced.js
scripts/validate-content-sanitization.js
scripts/validate-question-bank-deep-integrity.js
```

The permanent CI workflow is:

```txt
.github/workflows/site-tests.yml
```

It runs static validation and browser regression jobs.

## Protected data

The following files are protected against casual edits:

```txt
data/med-courses-data.js
data/med-practice-bank-init.js
data/med-practice-bank-loader.js
data/practice-bank-fisiologia.js
data/practice-bank-microbiologia.js
data/practice-bank-genetica.js
data/practice-bank-bioquimica.js
data/practice-bank-inmunologia.js
```

Only edit protected data when the task explicitly targets protected data and the source-of-truth implications are understood.

## Repository hygiene

The repository must not accumulate:

- migration manifests after migration is complete;
- `original-58` or stale module-count files;
- temporary debug workflows;
- backup dumps at runtime paths;
- archives committed to the repository;
- old copies of generated data that could be mistaken for source.

Suspicious historical material should be removed or placed under a documented archive only after explicit validation.

## AI workflow checklist

Before editing:

1. Read `SOURCE_OF_TRUTH.md`.
2. Read `AGENTS.md`.
3. Read this file.
4. Identify whether the target file is source, generated output, validator, documentation, or workflow.

Before opening a PR:

1. Confirm the change is narrow.
2. Mention source-of-truth impact.
3. Mention tests expected to run.
4. Keep the PR as draft until CI is green.

Before merging:

1. Confirm CI is green.
2. Confirm the user approved the merge.
3. Do not merge if there are unresolved source-of-truth doubts.
