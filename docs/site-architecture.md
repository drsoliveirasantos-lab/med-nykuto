# Site architecture — Med Nykuto

This document explains how the repository is organized so future human or AI contributors can work without damaging the source-of-truth structure.

## High-level model

Med Nykuto is organized around four layers:

1. **Editable sources** — the files humans and AI should normally edit.
2. **Generated runtime files** — files consumed by the browser and rebuilt or assembled from sources.
3. **Validation scripts** — scripts that protect source integrity, counters, links, assets, and runtime behavior.
4. **Documentation and governance** — files that explain what to edit, what not to edit, and how to validate changes.

The shared operational layer for multiple classes is documented in
[`docs/multiclass-foundation.md`](multiclass-foundation.md). It uses one generic
student shell (`turma-shell/index.html`), one class-aware management shell (`gestion-shell/index.html`)
and Cloudflare Functions backed by a tenant-scoped D1 schema. The S3 course
library and the bespoke 4.º E notebook remain separate source-of-truth surfaces.

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

### 4.º E additive learning layer

The dated S4 notebook remains a separate source surface from the canonical
59-module library in `content/courses/**`. Its additive learning model lives in
`s4-learning-model-v178.js`; `s4-learning-experience-v178.js` and
`s4-learning-experience-v178.css` render the same twenty-three existing lessons
as `Comprender` → `Repasar` → `Recordar` → `Entrenar`. The layer derives its
blocks from the established academic lesson records instead of maintaining a
second copy of course facts.

Compatibility ids remain unchanged: `curso`, `rapida`, `ultra`, `training`,
`material` and `ia`. The `training` surface continues to resolve the lesson's
protected `practiceId` bank, so the adapter cannot mutate questions, counters,
bank isolation or partial-exam allowlists. Reading themes (`Claro suave`,
`Sepia lectura`, `Oscuro concentración`) are stored as local presentation
preferences only.

Every one of the twenty-three lesson ids maps to a specialized visual organizer
that covers all of that lesson's notion blocks. The renderer selects a topic-
appropriate family (sequence, feedback loop, causal chain, decision tree,
comparison, hierarchy, care network, laboratory workflow or recognition map),
derives its nodes from the existing course DOM and links each node back to its
source block. It cannot add a branch or conclusion absent from the course.

Provenance is explicit and limited to `PROFESORA · CONFIRMADO`,
`REFORMULACIÓN NYKUTO`, `AMPLIACIÓN CLÍNICA`, `PRECISIÓN MÉDICA` and
`POR CONFIRMAR`. Estimated or unverified dates use `POR CONFIRMAR`; the UI must
not turn them into confirmed lesson records. Glycolysis is the molecular
variant: it uses original reproducible SVG schematics and four pedagogical
boards in the guided sequence while preserving all seven reviewed boards in
the archive.

`s4-course-themes-v182.js` adds a thematic index over that same evidence, and
`class-notebook-v445.js` / `s4-course-themes-v182.css` render it as the default
subject entry. The hierarchy is subject → major theme → consolidated course →
chapters/notions → dated sessions. It is a projection, not another course
corpus: lesson panels, hashes, documents, protected banks, progress and P1/P2
allowlists stay in place. Each notion carries lesson and section references;
multi-theme contributions are cross-links rather than cloned sessions. The
pure incremental merge contract and compatibility rules are documented in
`docs/s4-thematic-courses.md` and guarded by
`scripts/validate-s4-theme-merge.js`.

### Public Drive material registry

```txt
data/drive-files.json
```

This allowlisted registry is maintained from the 4.º E semester Drive. Google
Drive file IDs are stable identities; the browser merges active entries into
the matching subject and Archives views. It is operational metadata, not course
content. Only anonymously verified files may be present, and records carrying a
`removedAt` tombstone must remain hidden. Automated scans must not touch
`content/courses/**` or protected question banks.

### 4.º E P1 review

`p1.html` is the dedicated mobile-first cumulative review for the first partial.
Its versioned lesson allowlist lives in `p1-s4-e-v2.js`, while
`class-p1-v1.js` builds fiches and exam attempts from the existing dated S4
banks. It must not reuse the legacy S3 `examen.html` bank, write ordinary class
practice progress, or post to the community ranking. Its practice surface has
two durable session modes: `training` locks and explains each answer after the
student explicitly checks it, while `exam` withholds all correction until the
final result. The practice surface is the mobile default; the cumulative sheet
remains one tap away. Run
`scripts/validate-p1-s4.js` whenever its scope or runtime changes.

The 28 August lessons never enter a partial automatically. Bioquímica II is explicitly included in the P1 question pool by a direct study-scope decision, producing an 18-lesson/720-question contract; its full lesson stays in the class notebook and is omitted from the cumulative-sheet lesson cards through `sheetPracticeIds`. Epidemiología remains outside P1, and both 28 August lessons remain outside the provisional 4-lesson/160-question P2 contract.

### 4.º E guided respiratory practice

Guided multi-step respiratory cases are a separate notebook overlay. Their
editable data lives in `content/class/s4-guided-respiratory-cases.json`; a build
produces `data/s4-guided-clinical-cases-v177.js`, and the isolated
`s4-guided-clinical-cases-v177.js` runtime mounts launchers beside the two
documented respiratory practices in `clase.html`. Its local state, DOM
selectors and events are intentionally separate from the 23 certified class
banks, P1/P2 and the community ranking. The seven cases expose 24 contextual
QCM and four contextual V/F through the same one-question-at-a-time engine.
Source-derived chains that are not stated verbatim are labeled as guided
inferences in both canonical data and the learner interface.

The overlay may reference existing lesson ids but cannot declare a new lesson
from a Drive upload timestamp. `scripts/validate-s4-guided-clinical-cases.js`
checks source metadata, evidence links, sequential reasoning levels, generated
data parity and runtime isolation.

### 4.º E notice presentation

Home renders one compact important notice at a time: complete poster thumbnail
plus title, with no body or metadata. The banner advances automatically, pauses
while pressed or focused, and each short tap deep-links to the exact full notice
in `#avisos`. The Avisos view keeps the complete text, filters and attachments,
but constrains poster images inside visible lateral margins on phones.

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
scripts/validate-multiclass-foundation.js
scripts/validate-calendar-subscription.js
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

## Shared typography

[The common typography standard](typography-standard.md) defines the text-size
hierarchy for page, section, category, item, description/price and metadata roles.
AGENTS and Copilot require it before UI work and require its inclusion in future
site repositories. Compact interface text and long-form learning text have
different readability needs; both keep details subordinate to their own heading.

The runtime scale is `med-typography-v509.css`, loaded last by the interface
pages and included in service-worker cache v509. The owner's explicit choice
is 12px for course/body text, progressive headings and 10–11px details, taking
precedence over the shared default. See [implementation](typography-implementation.md).
