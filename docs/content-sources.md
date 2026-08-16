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

## Class hub teacher documents

Teacher-provided files displayed in the 4.º E class hub live under:

```txt
assets/class-hub/
```

The Microbiología II · Teórica archive added on 2026-08-16 keeps the two received PDFs unchanged at:

```txt
assets/class-hub/microbiology-theory/2026-08-10/micologia-generalidades.pdf
assets/class-hub/microbiology-theory/2026-08-10/micosis-superficiales.pdf
```

The adjacent `generalidades/` and `micosis-superficiales/` WebP files are page renders used only for the in-site slide viewer. They must preserve the PDF page order and content. The homework review explicitly distinguishes material developed in those PDFs (dermatophytes and tinea) from the three subcutaneous mycoses announced for the following class.

The Epidemiología y Salud Pública archive added on 2026-08-16 keeps the three received teacher files unchanged at:

```txt
assets/class-hub/epidemiology/2026-08-16/atencion-primaria-salud.pptx
assets/class-hub/epidemiology/2026-08-16/manual-rac-paraguay-2011.pdf
assets/class-hub/epidemiology/2026-08-16/salud-publica-paraguay.pdf
```

The `aps-slides/` directory contains the 36 PowerPoint renders in their original order. The `rac-pages/` and `salud-publica-pages/` directories contain only quick-view renders; the complete PDFs remain available from the archive. The Epidemiology homework card is grounded in the Paraguay RAC manual: printed pages 15 and 16 (PDF pages 17 and 18). The APS quick review uses pages 30 and 31 of the public-health book.

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
