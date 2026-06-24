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

## Matière : Microbiología

### Module 1

Module ID : `02-microbiologia-01-estructura-bacteriana-y-patogenicidad`

Titre : `Estructura bacteriana y patogenicidad`

Statut global : contenu reconstruit et disponible sur Preview, mais une repasse de lisibilité des options QCM est nécessaire.

| Format | État |
|---|---:|
| QCM | 200 / 200 reconstruits |
| Verdadero/Falso | 50 / 50 reconstruits |
| Casos clínicos | 50 / 50 reconstruits |

---

## Patchs Microbiología Module 1 déjà créés

### QCM

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

---

## Loader actuel attendu

Le fichier `data/med-practice-bank-loader.js` doit charger les patchs Microbiología de `v312` à `v325`.

Il doit aussi conserver les patchs Physiología déjà présents.

Dernière vérification effectuée : le loader chargeait bien `practice-bank-microbiologia-quality-patch-v325.js` et conservait les patchs Physiología.

---

## Validation utilisateur

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

## Correction prioritaire suivante

Avant de passer au Module 2 Microbiología, effectuer une repasse de lisibilité sur les options QCM du Module 1.

Objectif : transformer les options trop télégraphiques en propositions complètes, surtout quand la question demande `¿cuál proposición es correcta?`.

Ne pas changer :

- le nombre d'items ;
- les IDs existants ;
- la réponse correcte ;
- le fond pédagogique déjà validé.

Changer :

- la formulation des options trop courtes ;
- les distracteurs incompréhensibles ;
- les options qui ne peuvent pas être interprétées seules.

Plan conseillé :

1. Patch lisibilité QCM 001-040 ;
2. Patch lisibilité QCM 041-080 ;
3. Patch lisibilité QCM 081-120 ;
4. Patch lisibilité QCM 121-160 ;
5. Patch lisibilité QCM 161-200.

Nom suggéré :

- `data/practice-bank-microbiologia-readable-options-patch-v326.js`
- puis `v327`, `v328`, etc.

---

## Règle spécifique pour la repasse options QCM

Quand la question est une proposition globale ou demande une proposition correcte, chaque option doit être une phrase complète.

Mauvais :

- `Cápsides eucariotas.`

Bon :

- `Los PAMP bacterianos son cápsides propias de células eucariotas.`

Mauvais :

- `Hormonas del huésped exclusivamente.`

Bon :

- `Los PAMP bacterianos son hormonas exclusivas del huésped sin origen microbiano.`

Mauvais :

- `Anticuerpos bacterianos secretados.`

Bon :

- `Los PAMP bacterianos son anticuerpos secretados por bacterias para neutralizar al huésped.`

---

## Prochaine étape recommandée

Créer un patch de repasse lisibilité :

`data/practice-bank-microbiologia-readable-options-patch-v326.js`

Cible : QCM 001-040 du Module 1 Microbiología.

Puis mettre à jour `data/med-practice-bank-loader.js` et vérifier que le patch est chargé.

---

## Instruction courte pour la prochaine conversation IA

Si une conversation repart de zéro, commencer par :

1. lire `AI_MED_NYKUTO_RULES.md` ;
2. lire `AI_MED_NYKUTO_PROGRESS.md` ;
3. travailler uniquement sur `preview` ;
4. commencer par la correction prioritaire : lisibilité des options QCM du Module 1 Microbiología.
