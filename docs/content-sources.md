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

The Bioquímica II glycolysis board archive is rendered at:

```txt
assets/class-hub/board-archive/bioquimica-2026-08-14/whiteboard-v2/
```

These seven WebP files are clean whiteboard reconstructions of the seven board screenshots supplied for the 14 August class. They preserve the teacher's teaching order, arrows, relative layout, color roles and side annotations. They are derivative viewing assets, not an independent scientific source. The adjacent HTML lesson remains the verified study layer and explicitly clarifies the net balance, the cytosolic NADH shuttle caveat and the direct role of oxygen. The older `restored/` renders remain non-runtime history and must not replace `whiteboard-v2/` without a new visual review.

The Fisiología II class from 2026-08-17 keeps the teacher PDF unchanged at:

```txt
assets/class-hub/physiology/2026-08-17/organizacion-sinapsis-receptores.pdf
```

The adjacent `slides/` directory contains the 35 PDF pages rendered in their original order. The `board/` directory publishes only the clean computer reconstruction that preserves the teacher's spatial organization, arrows and teaching sequence; the raw board photograph is intentionally excluded from the public runtime. The linked PhET neuron simulator is a class resource, but the lesson text and training bank are grounded only in the teacher PDF, reconstructed board and supplied class transcription.

The Microbiología II · Teórica class from 2026-08-17 uses eight supplied photographs of the two clinical cases. Their ordered, cropped quick-view copies live at:

```txt
assets/class-hub/microbiology-theory/2026-08-17/cases/
```

The first case is pityriasis versicolor associated with `Malassezia spp.`; the second is tinea corporis associated with `Microsporum canis`. The same class transcription is the source for the comparison by depth and the three subcutaneous mycoses. Training questions for this date must not introduce facts absent from these teacher materials.

The 19–21 August 2026 handoff adds five dated lessons. Original teacher documents remain byte-for-byte unchanged at:

```txt
assets/class-hub/epidemiology/2026-08-19/organizacion-urgencias-emergencias.pptx
assets/class-hub/epidemiology/2026-08-19/trabajo-practico-salud-publica-epidemiologia.docx
assets/class-hub/physiology/2026-08-20/ejercicios-fijacion-sistema-nervioso.pdf
assets/class-hub/biochemistry/2026-08-21/actividades-3-y-4-bioquimica-ii.docx
```

The Epidemiology `slides/` directory preserves all 57 PowerPoint pages in order. The Physiology `pages/` directory preserves all 13 PDF pages in order. The two `task-pages/` directories are quick-view renders of the received DOCX assignments.

The three SVGs in `assets/class-hub/biochemistry/2026-08-21/board/` are clean vector tracings of the three board photographs supplied again on 22 August. They preserve the teacher's original spatial layout, arrow directions, color roles, cell and organ drawings, and teaching sequence. They must remain recognizable as the teacher's boards: do not reorganize them into editorial cards or generic infographics. The raw photographs are not published.

The two older SVGs in `assets/class-hub/biochemistry/2026-08-19/board/` are retained only as non-runtime history. They are no longer presented as teacher-board reconstructions because the exact original photographs were not available for a faithful visual comparison. Re-enable or replace them only after the corresponding source photographs are supplied and reviewed.

The Microbiology practical lesson uses the public laboratory transcription only and excludes the unrelated private conversation. No new Nutrition lesson is inferred from this handoff.

Each of the five lessons owns an isolated 40-question bank (20 QCM, 10 true/false and 10 clinical/application cases) in:

```txt
grupo-3-practice-2026-08-21-v440.js
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
