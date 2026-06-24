# AI_MED_NYKUTO_PROGRESS.md

Document permanent de suivi du travail Med Nykuto.

À lire au début de toute nouvelle conversation IA qui reprend la reconstruction ou correction des banques de questions.

Lire aussi `AI_MED_NYKUTO_RULES.md` avant toute génération ou modification.

---

## État général actuel

Branche de travail : `preview`

Repo : `drsoliveirasantos-lab/med-nykuto`

Méthode technique actuelle :

- ne pas modifier directement les banques principales quand un patch séparé suffit ;
- créer des patchs dans `data/` ;
- charger les patchs via `data/med-practice-bank-loader.js` ;
- remplacer les questions existantes sans gonfler les totaux ;
- vérifier le loader après chaque patch.

---

## Règle d'interprétation : matière active de la conversation

Ce fichier contient plusieurs chantiers en parallèle. Une priorité indiquée dans une matière ne doit pas être appliquée automatiquement à une autre matière.

Avant de continuer, identifier la matière active de la conversation :

- conversation Fisiología → continuer Fisiología et son module actif ;
- conversation Microbiología → continuer Microbiología et son module actif ;
- conversation d'une autre matière → continuer cette matière ;
- si la matière active n'est pas claire, demander confirmation avant toute modification GitHub.

La priorité Microbiología ci-dessous concerne uniquement les conversations Microbiología, sauf demande explicite de l'utilisateur. Dans une conversation Fisiología, la prochaine étape est celle de la section Fisiología.

---

## Matière : Fisiología

### Module 1

Module ID : `01-fisiologia-01-neurofisiologia-y-potencial-de-accion`

Titre : `Neurofisiología y potencial de acción`

Statut global : reconstruction/correction en cours sur Preview par patchs séparés, sans modification directe de `data/practice-bank-fisiologia.js`.

| Format | État |
|---|---:|
| QCM | 200 / 200 corrigés |
| Verdadero/Falso | 50 / 50 corrigés |
| Casos clínicos | 15 / 50 corrigés |

### Patchs Fisiología Module 1 déjà créés

#### QCM

- `data/practice-bank-fisiologia-quality-patch-v314.js` : premier patch de sécurité, correction visible initiale et normalisations.
- `data/practice-bank-fisiologia-quality-patch-v315.js` : QCM 001-020.
- `data/practice-bank-fisiologia-quality-patch-v316.js` : QCM 021-060.
- `data/practice-bank-fisiologia-quality-patch-v317.js` : QCM 061-100.
- `data/practice-bank-fisiologia-quality-patch-v318.js` : QCM 101-140.
- `data/practice-bank-fisiologia-quality-patch-v319.js` : QCM 141-180.
- `data/practice-bank-fisiologia-quality-patch-v320.js` : QCM 181-200.

#### Verdadero/Falso

- `data/practice-bank-fisiologia-quality-patch-v321.js` : V/F 001-010.
- `data/practice-bank-fisiologia-quality-patch-v323.js` : V/F 011-030.
- `data/practice-bank-fisiologia-quality-patch-v324.js` : V/F 031-050.

#### Casos clínicos

- `data/practice-bank-fisiologia-quality-patch-v325.js` : Casos clínicos 001-015.

### Loader attendu pour Fisiología

Le fichier `data/med-practice-bank-loader.js` doit charger les patchs Fisiología Module 1 de `v314` à `v321`, puis `v323`, `v324` et `v325`, et conserver les patchs d'autres matières.

Note : `data/practice-bank-fisiologia-quality-patch-v322.js` existe déjà et concerne Fisiología Module 2 QCM 001-040. Ne pas l'écraser.

### Prochaine étape recommandée pour cette matière

Continuer Fisiología Module 1 avec les casos clínicos.

Prochain patch conseillé :

`data/practice-bank-fisiologia-quality-patch-v326.js`

Cible recommandée : Casos clínicos 016-030 du Module 1 Fisiología.

Ensuite :

1. Casos clínicos 031-045 ;
2. Casos clínicos 046-050.

### Module 2

Module ID : `01-fisiologia-02-transporte-de-membrana`

Titre : `Transporte de membrana`

Statut partiel : un patch QCM initial existe déjà.

- `data/practice-bank-fisiologia-quality-patch-v322.js` : Module 2 QCM 001-040.

---

## Matière : Microbiología

### Module 1

Module ID : `02-microbiologia-01-estructura-bacteriana-y-patogenicidad`

Titre : `Estructura bacteriana y patogenicidad`

Statut global : contenu reconstruit et disponible sur Preview. Repasse de lisibilité des options QCM en cours.

| Format | État |
|---|---:|
| QCM | 200 / 200 reconstruits |
| Verdadero/Falso | 50 / 50 reconstruits |
| Casos clínicos | 50 / 50 reconstruits |
| Repasse lisibilité options QCM | 120 / 200 corrigés |

---

## Patchs Microbiología Module 1 déjà créés

### QCM — reconstruction de fond

- `data/practice-bank-microbiologia-quality-patch-v312.js` : QCM 001-010 + premiers V/F + premiers casos.
- `data/practice-bank-microbiologia-quality-patch-v313.js` : QCM 011-020.
- `data/practice-bank-microbiologia-quality-patch-v314.js` : QCM 021-040.
- `data/practice-bank-microbiologia-quality-patch-v315.js` : QCM 041-060.
- `data/practice-bank-microbiologia-quality-patch-v316.js` : QCM 061-080.
- `data/practice-bank-microbiologia-quality-patch-v317.js` : QCM 081-120.
- `data/practice-bank-microbiologia-quality-patch-v318.js` : QCM 121-160.
- `data/practice-bank-microbiologia-quality-patch-v319.js` : QCM 161-200.

### Verdadero/Falso

- `data/practice-bank-microbiologia-quality-patch-v320.js` : V/F 006-025.
- `data/practice-bank-microbiologia-quality-patch-v321.js` : V/F 026-050.

### Casos clínicos

- `data/practice-bank-microbiologia-quality-patch-v322.js` : Casos 004-018.
- `data/practice-bank-microbiologia-quality-patch-v323.js` : Casos 019-033.
- `data/practice-bank-microbiologia-quality-patch-v324.js` : Casos 034-048.
- `data/practice-bank-microbiologia-quality-patch-v325.js` : Casos 049-050.

### Repasse lisibilité options QCM

- `data/practice-bank-microbiologia-readable-options-patch-v326.js` : QCM 001-020.
- `data/practice-bank-microbiologia-readable-options-patch-v327.js` : QCM 021-040.
- `data/practice-bank-microbiologia-readable-options-patch-v328.js` : QCM 041-060.
- `data/practice-bank-microbiologia-readable-options-patch-v329.js` : QCM 061-080.
- `data/practice-bank-microbiologia-readable-options-patch-v330.js` : QCM 081-100.
- `data/practice-bank-microbiologia-readable-options-patch-v331.js` : QCM 101-120.

---

## Loader actuel attendu

Le fichier `data/med-practice-bank-loader.js` doit charger :

- les patchs Fisiología existants, sans suppression ;
- les patchs Microbiología de `v312` à `v325` ;
- les patchs de lisibilité Microbiología `v326` à `v331`.

Dernière vérification effectuée : le loader chargeait bien `practice-bank-microbiologia-readable-options-patch-v330.js` et `practice-bank-microbiologia-readable-options-patch-v331.js`, en conservant les patchs Fisiología jusqu'à `v326`.

---

## Validation utilisateur Microbiología

L'utilisateur a vérifié le Module 1 Microbiología sur Preview.

Il a confirmé que le module est disponible sur Preview et que les questions apparaissent.

Problème détecté sur mobile : certaines options QCM sont trop courtes et ne se lisent pas comme de vraies propositions pédagogiques.

Exemple observé sur Preview :

Question : `Sobre «PAMP bacteriano», ¿cuál proposición es correcta?`

Options problématiques :

- `Anticuerpos bacterianos secretados.`
- `Cápsides eucariotas.`
- `Hormonas del huésped exclusivamente.`

Problème : l'étudiant ne comprend pas clairement la proposition complète à accepter ou rejeter.

---

## Correction prioritaire suivante pour Microbiología

Continuer la repasse de lisibilité sur les options QCM du Module 1.

Déjà fait :

1. QCM 001-020 → `data/practice-bank-microbiologia-readable-options-patch-v326.js` ;
2. QCM 021-040 → `data/practice-bank-microbiologia-readable-options-patch-v327.js` ;
3. QCM 041-060 → `data/practice-bank-microbiologia-readable-options-patch-v328.js` ;
4. QCM 061-080 → `data/practice-bank-microbiologia-readable-options-patch-v329.js` ;
5. QCM 081-100 → `data/practice-bank-microbiologia-readable-options-patch-v330.js` ;
6. QCM 101-120 → `data/practice-bank-microbiologia-readable-options-patch-v331.js`.

À faire ensuite :

1. QCM 121-160 → créer les prochains patchs de lisibilité, idéalement en deux blocs de 20 si nécessaire ;
2. QCM 161-200.

Ne pas changer :

- le nombre d'items ;
- les IDs existants ;
- la réponse correcte ;
- le fond pédagogique déjà validé.

Changer :

- la formulation des options trop courtes ;
- les distracteurs incompréhensibles ;
- les options qui ne peuvent pas être interprétées seules.

---

## Règle spécifique pour la repasse options QCM

Quand la question est une proposition globale ou demande une proposition correcte, chaque option doit être une phrase complète.

Mauvais :

- `Cápsides eucariotas.`

Bon :

- `Los PAMP bacterianos son cápsides propias de células eucariotas.`

Mauvais :

- `Hormonas del huésped exclusivement.`

Bon :

- `Los PAMP bacterianos son hormonas exclusivas del huésped sin origen microbiano.`

Mauvais :

- `Anticuerpos bacterianos secretados.`

Bon :

- `Los PAMP bacterianos son anticuerpos secretados por bacterias para neutralizar al huésped.`

---

## Prochaine étape recommandée selon la matière active

- Si conversation active = Fisiología : continuer `data/practice-bank-fisiologia-quality-patch-v326.js`, cible Casos clínicos 016-030 du Module 1 Fisiología.
- Si conversation active = Microbiología : continuer la repasse lisibilité avec QCM 121-160 du Module 1 Microbiología.
