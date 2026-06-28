# Med Nykuto — content source of truth

This document defines the authoritative course/module source structure.

## Authoritative sources

The editable source files live under:

```txt
content/courses/
```

Each course owns a `course.json` file with:

```txt
moduleCount
moduleOrder
```

The current expected module counts are locked in:

```txt
content-lock.json
```

Current counts:

```txt
Fisiología     10
Microbiología  13
Genética       12
Bioquímica     12
Inmunología    12
Biofísica       0
Total          59
```

## Generated runtime data

The browser runtime file is generated from the source tree:

```txt
data/med-courses-data.js
```

Do not edit it manually. Rebuild it with:

```bash
node scripts/build-courses-data.js
```

## Validation

Before merging content changes, run:

```bash
node scripts/validate-course-sources.js
```

This validator checks:

- total module count against `content-lock.json`;
- per-course module counts;
- `course.json` metadata alignment;
- duplicate module IDs;
- missing markdown content;
- local figure/image references;
- homepage module counters against the locked total.

## Editing rule

To edit a module, update files under:

```txt
content/courses/<course>/modules/<module>/
```

Common files:

```txt
meta.json
full.md
fiche.md
ultra.md
markdown.md
figures.json
exam.json
```

Then rebuild and validate:

```bash
node scripts/build-courses-data.js
node scripts/validate-course-sources.js
```
