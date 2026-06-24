# AI_MED_NYKUTO_PROGRESS.md

Document permanent de suivi du travail Med Nykuto. À lire avec `AI_MED_NYKUTO_RULES.md` avant toute génération ou modification.

---

## État général actuel

Branche de travail : `preview`

Repo : `drsoliveirasantos-lab/med-nykuto`

Méthode technique actuelle :

- ne pas modifier directement les banques principales quand un patch séparé suffit ;
- créer des patchs dans `data/` ;
- charger les patchs via `data/med-practice-bank-loader.js` ;
- remplacer les questions existantes sans gonfler les totaux ;
- vérifier le loader après chaque patch ;
- préserver les patchs existants des autres matières.

---

## Règle d'interprétation : matière active de la conversation

Une priorité indiquée dans une matière ne doit pas être appliquée automatiquement à une autre matière.

- conversation Fisiología → continuer Fisiología et son module actif ;
- conversation Microbiología → continuer Microbiología et son module actif ;
- conversation d'une autre matière → continuer cette matière ;
- si la matière active n'est pas claire, demander confirmation avant toute modification GitHub.

---

## Règle de taille des lots

Utiliser le maximum autorisé par `AI_MED_NYKUTO_RULES.md` quand le format le permet, sans dépasser les limites :

- QCM : 40 par patch ;
- Verdadero/Falso : 20 à 25 par patch ;
- Casos clínicos : 15 par patch.

Exception : réduire le lot seulement si le nombre restant est inférieur au maximum, ou si une contrainte technique / pédagogique l'exige clairement.

---

## Matière : Fisiología

### Module 1

Module ID : `01-fisiologia-01-neurofisiologia-y-potencial-de-accion`

Titre : `Neurofisiología y potencial de acción`

Statut global : Module 1 complet sur Preview par patchs séparés.

| Format | État |
|---|---:|
| QCM | 200 / 200 corrigés |
| Verdadero/Falso | 50 / 50 corrigés |
| Casos clínicos | 50 / 50 corrigés |

Patchs Module 1 :

- `data/practice-bank-fisiologia-quality-patch-v314.js` à `data/practice-bank-fisiologia-quality-patch-v321.js` : QCM / V-F initiaux du Module 1.
- `data/practice-bank-fisiologia-quality-patch-v323.js` et `data/practice-bank-fisiologia-quality-patch-v324.js` : V/F 011-050.
- `data/practice-bank-fisiologia-quality-patch-v325.js` : Casos clínicos 001-015.
- `data/practice-bank-fisiologia-quality-patch-v327.js` : Casos clínicos 016-030.
- `data/practice-bank-fisiologia-quality-patch-v330.js` : Casos clínicos 031-045.
- `data/practice-bank-fisiologia-quality-patch-v331.js` : Casos clínicos 046-050.

### Module 2

Module ID : `01-fisiologia-02-transporte-de-membrana`

Titre : `Transporte de membrana`

Statut partiel : QCM 200 / 200 corrigés, V/F 50 / 50 corrigés, casos clínicos démarrés sur Preview par patchs séparés.

- `data/practice-bank-fisiologia-quality-patch-v322.js` : Module 2 QCM 001-040.
- `data/practice-bank-fisiologia-quality-patch-v326.js` : Module 2 QCM 041-080.
- `data/practice-bank-fisiologia-quality-patch-v333-m2-qcm-081-120.js` : Module 2 QCM 081-120.
- `data/practice-bank-fisiologia-quality-patch-v344-m2-qcm-121-160.js` : Module 2 QCM 121-160.
- `data/practice-bank-fisiologia-quality-patch-v345-m2-qcm-161-200.js` : Module 2 QCM 161-200.
- `data/practice-bank-fisiologia-quality-patch-v346-m2-vf-001-025.js` : Module 2 V/F 001-025.
- `data/practice-bank-fisiologia-quality-patch-v347-m2-vf-026-050.js` : Module 2 V/F 026-050.
- `data/practice-bank-fisiologia-quality-patch-v350-m2-cases-001-015.js` : Module 2 casos clínicos 001-015.

### Module 3

Titre : `Osmolaridad, ósmosis y tonicidad`

Statut partiel : reconstruction/correction démarrée sur Preview par patchs séparés.

| Format | État |
|---|---:|
| QCM | 150 / 200 corrigés |
| Verdadero/Falso | 0 / 50 corrigés |
| Casos clínicos | 0 / 50 corrigés |

- `data/practice-bank-fisiologia-quality-patch-v328.js` : Module 3 QCM 001-010.
- `data/practice-bank-fisiologia-quality-patch-v329.js` : Module 3 QCM 011-020.
- `data/practice-bank-fisiologia-quality-patch-v332.js` : Module 3 QCM 021-030.
- `data/practice-bank-fisiologia-quality-patch-v345-m3-qcm-031-070.js` : Module 3 QCM 031-070.
- `data/practice-bank-fisiologia-quality-patch-v347-m3-qcm-071-110.js` : Module 3 QCM 071-110.
- `data/practice-bank-fisiologia-quality-patch-v348-m3-qcm-111-150.js` : Module 3 QCM 111-150.

Objectifs couverts par `v328` : solución, soluto, solvente, membrana semipermeable, ósmosis, dirección del agua, presión osmótica, osmolaridad, osmolalidad, disociación iónica, tonicidad.

Objectifs couverts par `v329` : soluto osmóticamente efectivo, isotonicidad, hipotonicidad, hipertonicidad, osmolaridad versus tonicidad, urea, NaCl extracelular, agua libre, deshidratación hipertónica, hiperglucemia severa.

Objectifs couverts par `v332` : sueros isotónicos, sueros hipotónicos, sueros hipertónicos, eritrocito en medio hipotónico, eritrocito en medio hipertónico, acuaporinas, equilibrio osmótico, compartimentos corporales, presión oncótica, albúmina y edema.

Objectifs couverts par `v345-m3` : osmolaridad plasmática, osmolalidad efectiva, hiponatremia hipotónica, pseudohiponatremia, hiponatremia hipertónica, sodio corregido, hipernatremia, sed osmótica, ADH, SIADH, diabetes insípida, polidipsia primaria, correcciones osmóticas, manitol, soluciones intravenosas, fuerzas de Starling, diuresis osmótica, gradiente medular, agua libre renal y osmoreceptores.

Objectifs couverts par `v347-m3` : agua corporal total, distribución LIC/LEC, plasma/intersticio, cambios de compartimentos por ganancia o pérdida de agua y NaCl, diagramas volumen-osmolaridad, distribución iónica, gap osmolar, adaptación cerebral a hipo/hipernatremia, coeficiente de reflexión, cristaloides/coloides, tercer espacio, quemaduras, permeabilidad capilar, drenaje linfático, edema intersticial, soluciones balanceadas, osmolaridad urinaria y concentración versus cantidad total de sodio.

Objectifs couverts par `v348-m3` : clasificación de hiponatremia, osmolaridad urinaria, sodio urinario, hiponatremia hipovolémica, SIADH, cirrosis, diuréticos, aldosterona, estímulos no osmóticos de ADH, insuficiencia suprarrenal, hipotiroidismo severo, diabetes insípida, prueba con desmopresina, baja carga de solutos, glucosuria, estado hiperosmolar, urea, manitol, edema nefrótico/inflamatorio/venoso/linfático y tonicidad clínica.

### Loader attendu pour Fisiología

`data/med-practice-bank-loader.js` doit charger les patchs Fisiología existants jusqu'à `v348-m3-qcm-111-150`, en conservant les patchs d'autres matières.

Ne pas écraser :

- `v322` : Fisiología Module 2 QCM 001-040 ;
- `v326` : Fisiología Module 2 QCM 041-080 ;
- `v327` : Fisiología Module 1 casos 016-030 ;
- `v328` : Fisiología Module 3 QCM 001-010 ;
- `v329` : Fisiología Module 3 QCM 011-020 ;
- `v330` : Fisiología Module 1 casos 031-045 ;
- `v331` : Fisiología Module 1 casos 046-050 ;
- `v332` : Fisiología Module 3 QCM 021-030 ;
- `v333-m2` : Fisiología Module 2 QCM 081-120 ;
- `v344-m2` : Fisiología Module 2 QCM 121-160 ;
- `v345-m2` : Fisiología Module 2 QCM 161-200 ;
- `v346-m2` : Fisiología Module 2 V/F 001-025 ;
- `v347-m2` : Fisiología Module 2 V/F 026-050 ;
- `v350-m2` : Fisiología Module 2 casos clínicos 001-015 ;
- `v345-m3` : Fisiología Module 3 QCM 031-070 ;
- `v347-m3` : Fisiología Module 3 QCM 071-110 ;
- `v348-m3` : Fisiología Module 3 QCM 111-150.

### Prochaine étape recommandée pour Fisiología

Si la matière active est Fisiología Module 3, continuer avec :

`data/practice-bank-fisiologia-quality-patch-v349-m3-qcm-151-190.js`

Cible recommandée : Module 3 QCM 151-190, soit 40 QCM, remplacement count-safe, sans gonfler les totaux.

Si la matière active est Fisiología Module 1, demander validation utilisateur sur Preview avant nouvelle repasse.

---

## Matière : Microbiología

### Module 1

Module ID : `02-microbiologia-01-estructura-bacteriana-y-patogenicidad`

Titre : `Estructura bacteriana y patogenicidad`

Statut global : contenu reconstruit et disponible sur Preview. Repasse de lisibilité des options QCM terminée.

| Format | État |
|---|---:|
| QCM | 200 / 200 reconstruits |
| Verdadero/Falso | 50 / 50 reconstruits |
| Casos clínicos | 50 / 50 reconstruits |
| Repasse lisibilité options QCM | 200 / 200 corrigés |

Patchs de reconstruction : `v312` à `v325`.

Patchs de lisibilité QCM : `data/practice-bank-microbiologia-readable-options-patch-v326.js` à `data/practice-bank-microbiologia-readable-options-patch-v335.js`.

Aucune correction prioritaire restante sur Microbiología Module 1. Avant de passer à Microbiología Module 2, demander validation utilisateur sur Preview.

---

## Loader actuel attendu

Le loader doit charger :

- les patchs Fisiología jusqu'à `practice-bank-fisiologia-quality-patch-v348-m3-qcm-111-150.js` ;
- les patchs Microbiología de reconstruction `v312` à `v325` ;
- les patchs Microbiología de lisibilité `v326` à `v335`.

Dernière vérification : le loader charge `practice-bank-fisiologia-quality-patch-v348-m3-qcm-111-150.js` et conserve les patchs Microbiología jusqu'à `practice-bank-microbiologia-readable-options-patch-v335.js`.

---

## Prochaine étape recommandée selon la matière active

- Fisiología Module 3 : créer `data/practice-bank-fisiologia-quality-patch-v349-m3-qcm-151-190.js`, cible QCM 151-190, soit 40 QCM.
- Fisiología Module 1 : demander validation utilisateur sur Preview avant nouvelle repasse.
- Microbiología : demander validation utilisateur du Module 1 sur Preview avant de démarrer Module 2.
