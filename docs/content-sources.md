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

### Guided respiratory exercise (S4)

The S4 guided respiratory mode is derived from the anonymously verified
Fisiología II teacher exercise with Drive id
`1Rd3P52HVoLK4J4iKL8Wve-FY7ML1ytXh`, titled
`1. Ejercicio de fijacion Ventilacion y circulacion pulmonar cont..pdf`. It
contains six respiratory cases plus one integrative EPOC case, including the
gasometry and spirometry values used by the guided flows. Corrections are
limited to mechanisms supported by the accompanying S4 decks:

- `1HPC8zwttUIQagpzyJRYBv0CyrWNXKugU` — ventilation and pulmonary circulation;
- `1JroULL116ctsT95fkZlRD6Epw3L5LcIh` — gas exchange and transport;
- `1RkHRfI5NyLELx9wN_vKD92j8k10E7B-g` — respiratory regulation.

`data/drive-files.json` remains metadata only. The reviewed local evidence
ledger, source locators, cases and corrections live in
`content/class/s4-guided-respiratory-cases.json`, tied to those exact Drive IDs
and modification timestamps. The browser consumes the generated
`data/s4-guided-clinical-cases-v177.js`; edit the JSON and rebuild instead of
editing the generated file. The older exercise id `1HR5mnhgQHCzouSql9ii_BI_kZHKqqMEE`
is marked missing and is not an active source for this mode.

Five short evidence statements are also verified against the existing lesson
containers `fisio-detail-2026-08-10` and `fisio-detail` in `clase.html`. Their
two `class-lesson` source records declare `derivedFromSourceIds` back to the
reviewed gas-exchange and respiratory-regulation PDFs; they are not new or
independent course sources.

The upload timestamp does not establish a class date. These cases remain an
undated guided P1 respiratory exercise attached to the documented 10 and 13
August lessons; they do not create a 31 August lesson or enter the certified
20/10/10 banks. The guided sequence itself contains 24 contextual QCM and four
contextual V/F while leaving the ordinary bank format and totals unchanged.
Four mechanism steps that require combining a teacher prompt with several
documented facts carry `groundingMode: guided-inference` and a learner-visible
note. They must not be presented as verbatim source statements.

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

The Microbiología II · Teórica class from 2026-08-17 initially used eight supplied photographs of two clinical cases. Their ordered, cropped quick-view copies remain at:

```txt
assets/class-hub/microbiology-theory/2026-08-17/cases/
```

The first case is pityriasis versicolor associated with `Malassezia spp.`; the second is tinea corporis associated with `Microsporum canis`. These two cases remain attached only to the 17 August lesson.

The Monday 24 August handoff is a new, independent Microbiology theory lesson. It documents two eumycetoma histories, occupational lymphocutaneous sporotrichosis and an opportunistic `Candida` block. The 304 MB, 21-page source PDF is image-only and is not committed. Six additional camera photographs are also excluded from runtime. A five-page, mobile-oriented derivative and two lightweight WebP previews live at:

```txt
assets/class-hub/microbiology-theory/2026-08-24/expanded-cases/
```

The derivative PDF preserves the histories as separate cases, displays the correct 24/08/2026 date and uses only conservative crop, exposure, contrast and sharpening corrections. It does not reconstruct or retouch lesions. The adjacent HTML lesson and its isolated 40-question bank belong to 24 August.

The Monday 24 August Fisiología II lesson is also independent from the 17 and 20 August nervous-system blocks. Its four original teacher PDFs are preserved unchanged at:

```txt
assets/class-hub/physiology/2026-08-24/sensibilidades-somaticas.pdf
assets/class-hub/physiology/2026-08-24/ejercicios-sensibilidades-somaticas.pdf
assets/class-hub/physiology/2026-08-24/participacion-activa-24-08.pdf
assets/class-hub/physiology/2026-08-24/repaso-sinapsis-receptores.pdf
```

The course and its isolated 40-question bank cover somatic sensitivities, receptors, proprioception, pain, temperature, ascending pathways and somatosensory cortex.

The 19–21 August 2026 handoff adds five dated lessons. Original teacher documents remain byte-for-byte unchanged at:

```txt
assets/class-hub/epidemiology/2026-08-19/organizacion-urgencias-emergencias.pptx
assets/class-hub/epidemiology/2026-08-19/trabajo-practico-salud-publica-epidemiologia.docx
assets/class-hub/physiology/2026-08-20/ejercicios-fijacion-sistema-nervioso.pdf
assets/class-hub/biochemistry/2026-08-21/actividades-3-y-4-bioquimica-ii.docx
```

The Epidemiology `slides/` directory preserves all 57 PowerPoint pages in order. The Physiology `pages/` directory preserves all 13 PDF pages in order. The two `task-pages/` directories are quick-view renders of the received DOCX assignments.

The Epidemiology project also keeps the teacher's follow-up clarification unchanged at:

```txt
assets/class-hub/epidemiology/2026-08-19/teacher-guidance/0746E8D5-EFF3-46DF-99C4-CD3D83376F7A.jpeg
```

It confirms that every group member speaks, the deck has at most 15 slides, no separate written report is required, and one shared notebook/file is recommended to avoid compatibility problems. The image is displayed as an original teacher message and must not be redesigned or silently replaced.

The three SVGs in `assets/class-hub/biochemistry/2026-08-21/board/` are semantic vector reconstructions of the three board photographs supplied again on 22 August. Each hand-drawn object is first identified from the photographed board and the class chain (cell, adipocytes, skeletal muscle, liver, hepatocyte, mitochondrion, vessel, lungs, cerebral cell, normal brain and edematous brain), then redrawn clearly without changing the teacher's relative positions, arrow directions, causal connections, functional colors or teaching sequence. They must remain recognizable as the teacher's boards: do not reorganize them into editorial cards or generic infographics. The raw photographs are internal comparison sources and are not published.

Runtime visuals that do not have a directly comparable teacher-board photograph are explicitly presented as `ESQUEMA EXPLICATIVO DEL CURSO`, never as a reconstructed pizarra. This provenance distinction applies to every dated lesson: a contextual diagram can clarify the verified lesson text, but must not imitate or claim the professor's authorship.

The two older SVGs in `assets/class-hub/biochemistry/2026-08-19/board/` are retained only as non-runtime history. They are no longer presented as teacher-board reconstructions because the exact original photographs were not available for a faithful visual comparison. Re-enable or replace them only after the corresponding source photographs are supplied and reviewed.

The Microbiology practical lesson uses the public laboratory transcription only and excludes the unrelated private conversation. No new Nutrition lesson is inferred from this handoff.

Each of the five lessons owns an isolated 40-question bank (20 QCM, 10 true/false and 10 clinical/application cases) in:

```txt
grupo-3-practice-2026-08-21-v440.js
```

The Wednesday 26 August 2026 handoff adds two independent dated lessons: Bioquímica II and Epidemiología. Their public study layer is reconstructed from the oral transcripts and the supplied classroom photographs. Three privacy-reviewed WebP derivatives are kept at:

```txt
assets/class-hub/biochemistry/2026-08-26/ciclo-cori-pizarra.webp
assets/class-hub/biochemistry/2026-08-26/pentosas-pizarra.webp
assets/class-hub/epidemiology/2026-08-26/caso-clinico-co.webp
```

The Cori derivative contains the three supplied board views in their original order. The pentose-phosphate derivative keeps the photographed pathway without the phone screenshot bars. The Epidemiology photograph is cropped to the projected carbon-monoxide questions and excludes the patient's name, age, neighbourhood and the students in the room. A separate messaging screenshot that displayed a telephone number is intentionally excluded from the repository and runtime.

The adjacent HTML courses correct obvious speech-recognition and scientific errors without presenting the corrections as verbatim teacher statements. In particular, they preserve `ciclo de Cori`, the classic −4 ATP-equivalent interorgan balance, the NADPH/ribose roles of the pentose-phosphate pathway, carbon monoxide rather than carbon dioxide for a brazier exposure, and the limitation of conventional SpO₂ in carbon-monoxide poisoning. Each lesson owns a separate 20/10/10 bank in:

```txt
grupo-3-practice-2026-08-26-v484.js
```

## Clases del jueves 27 de agosto de 2026

El traspaso del 27 añade tres lecciones independientes: Nutrición, Fisiología II y Microbiología II · Práctica. La transcripción se depura para conservar solo contenido académico; el Drive corrobora el alcance, incluida la separación entre Respiratorio y Sensibilidades somáticas, pero no es la fuente de las imágenes.

Los visuales proceden de la exportación académica de WhatsApp «BATE-PAPO ALUNOS» del 27–28 de agosto de 2026:

- Nutrición: fotos `00005305` y `00005306`, publicadas como `nutrition-hidden-claims.webp` y `nutrition-protein-marketing.webp`;
- Fisiología: foto `00005330`, utilizada solo como referencia para la reconstrucción vectorial revisada `physiology-somatic-sensitivities-source.svg`; el runtime la etiqueta explícitamente como reconstrucción pedagógica y no como foto original;
- Microbiología práctica: fotos `00005349`–`00005357`, `00005366`–`00005368` y casos `00005378`–`00005379`.

Los derivados recortados y optimizados viven en:

```txt
assets/courses/2026-08-27/
```

El Work Pack de reconocimiento P1 recibido el 30 de agosto conserva diez campos microscópicos reales únicos y dos variantes duplicadas. La rotación móvil utiliza únicamente los diez WebP no generativos con nombres hachados de `assets/courses/2026-08-27/micro-p1/`; las variantes 10 y 12 quedan excluidas. Las etiquetas proceden del material compartido y mantienen el aviso `Validación docente pendiente`: sirven para memorizar las referencias de la clase, no para afirmar una identificación diagnóstica aislada. Las reconstrucciones IA del Work Pack no se publican ni se usan en preguntas.

Solo se conservan zonas pedagógicas. Conversaciones domésticas, audio accidental, ruido ambiental, personas e identificadores privados se excluyen del runtime y de las preguntas. Las láminas de Microbiología son referencias visuales rotuladas: permiten describir y comparar estructuras, pero una fotografía aislada no confirma una especie ni una infección. El tercer caso práctico no fotografiado no se reconstruye.

Las tres lecciones extienden el modelo estático mediante `academic-model-2026-08-27-v494.js`, sin sobrescribir evidencias anteriores.

Cada lección mantiene una banca aislada de 20 QCM, 10 verdadero/falso y 10 casos en:

```txt
grupo-3-practice-nutricion-2026-08-27-v494.js
grupo-3-practice-fisiologia-2026-08-27-v494.js
grupo-3-practice-microbiologia-practica-2026-08-27-v494.js
```

Nutrición queda confirmada dentro del alcance P1 hasta el 27 de agosto. En Fisiología, la docente limitó oralmente P1 a Respiratorio; la clase del 27 sobre propiocepción, tacto, dolor, temperatura, vías y decusación permanece fuera de P1. Microbiología práctica conserva su modo visual en la revisión general y no debe inferir material ausente de las fotografías.

El espacio P2 provisional no introduce una fuente académica nueva. Reutiliza únicamente los bancos verificados de Fisiología II del 17, 20, 24 y 27 de agosto de 2026. Estas cuatro fechas aportan 160 preguntas fuente mediante la lista explícita de `p2-s4-e-v1.js`; el agrupamiento anticipado es una ayuda de estudio y no prueba que la cátedra haya confirmado oficialmente el alcance de la segunda parcial.

## Clases y avisos del viernes 28 de agosto de 2026

El traspaso del 28 añade dos lecciones independientes, reconstruidas desde las transcripciones completas recibidas:

- Bioquímica II: vía de las pentosas fosfato, fase oxidativa y no oxidativa, balances, destinos de NADPH/ribosa y preparación estructural de glucosa y glucógeno;
- Epidemiología y Salud Pública: sistema de salud paraguayo, RIISS, microredes, cuatro niveles de atención, referencia/contrarreferencia y preparación práctica de Manchester, START y SHORT.

La reconstrucción no trata la transcripción automática como una fuente científica literal. Se revisaron las afirmaciones con documentación primaria: Reactome/IUBMB/NCBI para la vía de las pentosas y MSPBS/OPS/IPS para el sistema paraguayo. La capa publicada corrige NADH por NADPH cuando corresponde, transaldolasa a una transferencia de tres carbonos, `RISC` por `RIISS` y la clasificación oficial a cuatro niveles. Quedan excluidos los porcentajes de cobertura sin año o fuente, la supuesta sustitución general de cotizaciones IPS por otro seguro, la reclasificación informal de hospitales regionales, relatos de pacientes, datos personales, opiniones políticas y episodios coyunturales no necesarios para estudiar.

Los contenidos se implementan en:

```txt
academic-model-2026-08-28-v500.js
grupo-3-practice-bioquimica-2026-08-28-v500.js
grupo-3-practice-epidemiologia-2026-08-28-v500.js
```

Cada banco mantiene exactamente 20 QCM, 10 verdadero/falso y 10 casos. Ambos cursos quedan disponibles como práctica individual y como scopes del ranking. Bioquímica del 28 también forma parte del banco P1 por decisión directa de estudio, sin convertir esa inclusión en una afirmación sobre el temario oficial; Epidemiología del 28 permanece fuera de P1 y ambas clases permanecen fuera de P2.

El Work Pack recibido conserva un chat y adjuntos como material interno de análisis; el ZIP, teléfonos, nombres y lista de participantes no se publican. Para el proyecto de Epidemiología, la evidencia confirma una actividad de toda la clase dividida por grupos, no un trabajo personal aislado. El Grupo 10 tiene el tema Malaria; la presentación fue reprogramada para la semana siguiente y la fecha exacta continúa por confirmar. La explicación oral atribuye a esta presentación un valor de 1,0 % en la materia, distinto del 5 % anunciado para las pruebas prácticas.

En Bioquímica, la preparación siguiente combina repaso estructural de α/β-glucosa y enlaces glucosídicos con una actividad oral: se forman grupos para preparar el paso asignado, pero cada estudiante debe explicarlo después sin teléfono ni lectura de apuntes. Los trabajos deben llevarse firmados; no se inventa una hora que la transcripción no confirma.

### Pruebas prácticas P1

La fuente exacta es `_chat.txt`, mensaje de la delegada del 29/08/2026 a las 16:17:45, acompañado de `00000063-PHOTO-2026-08-29-16-17-45.jpg`. Confirma fechas impuestas por la facultad, uniforme con chompa, modalidades definidas por cada docente, separación respecto de los exámenes teóricos P1 y Microbiología II práctica el jueves por la tarde:

- 31/08: Fisiología II;
- 01/09: Bioética;
- 02/09: Epidemiología;
- 03/09: Nutrición;
- 04/09: Bioquímica II.

La explicación oral del 28 confirma para Epidemiología una ficha individual en papel, sin celular ni tablet, de aproximadamente treinta minutos, sobre Manchester, START y SHORT. El runtime `class-practical-exams-2026-p1-v500.js` muestra únicamente esas modalidades verificadas y corrige la antigua tarjeta que situaba Bioquímica el 02/09.

Fuentes oficiales de comprobación utilizadas para la capa de revisión:

- Reactome, Pentose phosphate pathway: `https://reactome.org/content/detail/R-HSA-71336`;
- IUBMB, balance de la vía: `https://iubmb.qmul.ac.uk/enzyme/reaction/polysacc/PPP3.html`;
- NCBI Bookshelf, G6PD y defensa antioxidante: `https://www.ncbi.nlm.nih.gov/books/NBK500351/`;
- MSPBS, Resolución 423/2019 y cartera de servicios: `https://www.mspbs.gov.py/marco-normativo.html`;
- OPS/OMS, RIISS en Paraguay: `https://www.paho.org/es/noticias/19-8-2026-caazapa-identifica-fortalezas-desafios-para-avanzar-consolidacion-sus-redes`;
- IPS, preguntas frecuentes sobre aportes: `https://portal.ips.gov.py/sistemas/ipsportal/contenido.php?sm=40`;
- Manchester Triage Group, referencia oficial del MTS: `https://www.triagenet.net/`;
- HHS/REMM, algoritmo START para adultos: `https://remm.hhs.gov/startadult.htm`;
- Peláez Corres et al., artículo original del método SHORT: `https://revistaemergencias.org/numeros-anteriores/volumen-17/numero-4/metodo-short-primer-triaje-extrahospitalario-ante-multiples-victimas/`.

Los tres métodos no se presentan como equivalentes: Manchester organiza el riesgo clínico habitual con personal formado; START es un triaje fisiológico rápido para múltiples víctimas; SHORT se diseñó como primer triaje extrahospitalario simplificado, incluso para intervinientes no sanitarios. La evaluación práctica debe seguir el método solicitado en cada ficha y no mezclar sus algoritmos.

## D1-managed dated class content

The protected management shell may also create date-based lessons for one class without changing the 59-module library. These records are class-hub overlays stored in D1, not new entries in `content/courses/**` and not inputs to `data/med-courses-data.js`.

The editable package contains:

- a tenant subject identifier and an ISO lesson date;
- full, quick and ultra Markdown;
- exactly 20 QCM, 10 true/false and 10 clinical cases before publication;
- stable question identifiers and revisions assigned by the server.

Only authenticated accounts carrying the class-scoped `content.manage` permission, or the owner, may create drafts or publish them. The public class API returns published overlays only. The browser overlays a matching legacy lesson by exact subject/date or appends a new dated lesson, while an API failure leaves all static material unchanged.

Do not copy a D1 lesson into `exam.json`: that file belongs to the canonical module pipeline and does not use the 20/10/10 class-bank schema. Moving a reviewed D1 lesson into the canonical library is a separate, explicit migration with the normal source builders and validators.

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
