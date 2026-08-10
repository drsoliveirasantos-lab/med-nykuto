# Med Nykuto — Fisiología practice bank split

This migration makes the Fisiología practice bank editable by module and format.

## New source structure

```txt
content/practice/fisiologia/
  manifest.json
  modules/
    01-neurofisiologia-y-potencial-de-accion/
      qcm.json
      vf.json
      cases.json
      meta.json
    ...
    10-fisiologia-muscular/
      qcm.json
      vf.json
      cases.json
      meta.json
```

## Generated runtime file

The site still loads:

```txt
data/practice-bank-fisiologia.js
```

Do not edit that file manually. Edit the split sources, then rebuild:

```bash
node scripts/build-practice-bank-fisiologia.js
```

## Validation

```bash
node scripts/validate-practice-bank-fisiologia.js
node scripts/build-practice-bank-fisiologia.js
node scripts/validate-practice-bank-fisiologia.js
```

Expected totals at the moment of this split:

```txt
QCM = 1800
V/F = 450
Casos clínicos = 450
Unique IDs = 2700
```

Module 10 is included with empty arrays so that new questions can be added safely later.
