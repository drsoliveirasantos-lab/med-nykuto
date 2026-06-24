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

Statut partiel : patchs QCM initiaux existants.

- `data/practice-bank-fisiologia-quality-patch-v322.js` : Module 2 QCM 001-040.
- `data/practice-bank-fisiologia-quality-patch-v326.js` : Module 2 QCM 041-080.

### Module 3

Titre : `Osmolaridad, ósmosis y tonicidad`

Statut partiel : reconstruction/correction démarrée sur Preview par patchs séparés.

- `data/practice-bank-fisiologia-quality-patch-v328.js` : Module 3 QCM 001-010.
- `data/practice-bank-fisiologia-quality-patch-v329.js` : Module 3 QCM 011-020.
- `data/practice-bank-fisiologia-quality-patch-v332.js` : Module 3 QCM 021-030.

Objectifs couverts par `v328` : solución, soluto, solvente, membrana semipermeable, ósmosis, dirección del agua, presión osmótica, osmolaridad, osmolalidad, disociación iónica, tonicidad.

Objectifs couverts par `v329` : soluto osmóticamente efectivo, isotonicidad, hipotonicidad, hipertonicidad, osmolaridad versus tonicidad, urea, NaCl extracelular, agua libre, deshidratación hipertónica, hiperglucemia severa.

Objectifs couverts par `v332` : sueros isotónicos, sueros hipotónicos, sueros hipertónicos, eritrocito en medio hipotónico, eritrocito en medio hipertónico, acuaporinas, equilibrio osmótico, compartimentos corporales, presión oncótica, albúmina y edema.

### Loader attendu pour Fisiología

`data/med-practice-bank-loader.js` doit charger les patchs Fisiología existants jusqu'à `v332`, en conservant les patchs d'autres matières.

Ne pas écraser :

- `v322` : Fisiología Module 2 QCM 001-040 ;
- `v326` : Fisiología Module 2 QCM 041-080 ;
- `v327` : Fisiología Module 1 casos 016-030 ;
- `v328` : Fisiología Module 3 QCM 001-010 ;
- `v329` : Fisiología Module 3 QCM 011-020 ;
- `v330` : Fisiología Module 1 casos 031-045 ;
- `v331` : Fisiología Module 1 casos 046-050 ;
- `v332` : Fisiología Module 3 QCM 021-030.

### Prochaine étape recommandée pour Fisiología

Si la matière active est Fisiología Module 3, continuer avec :

`data/practice-bank-fisiologia-quality-patch-v333.js`

Cible recommandée : Module 3 QCM 031-070, soit 40 QCM, remplacement count-safe, sans gonfler les totaux.

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

- les patchs Fisiología jusqu'à `v332` ;
- les patchs Microbiología de reconstruction `v312` à `v325` ;
- les patchs Microbiología de lisibilité `v326` à `v335`.

Dernière vérification : le loader charge `practice-bank-fisiologia-quality-patch-v332.js` et conserve les patchs Microbiología jusqu'à `practice-bank-microbiologia-readable-options-patch-v335.js`.

---

## Prochaine étape recommandée selon la matière active

- Fisiología Module 3 : créer `data/practice-bank-fisiologia-quality-patch-v333.js`, cible QCM 031-070, soit 40 QCM.
- Fisiología Module 1 : demander validation utilisateur sur Preview avant nouvelle repasse.
- Microbiología : demander validation utilisateur du Module 1 sur Preview avant de démarrer Module 2.
