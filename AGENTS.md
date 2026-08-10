# Consignes de travail — Med Nykuto

Ce dépôt doit être géré avec un workflow strict, traçable et stable. Ces consignes s’appliquent à tout le repository, sauf si un `AGENTS.md` plus spécifique existe dans un sous-dossier.

## Lecture obligatoire avant modification

Avant de modifier le site, lire dans cet ordre :

1. `SOURCE_OF_TRUTH.md`
2. `AGENTS.md`
3. `.github/copilot-instructions.md`
4. `docs/site-architecture.md`
5. `docs/content-sources.md` si le changement touche les cours ou les banques de questions
6. `.github/pull_request_template.md` avant d’ouvrir une PR

Ne pas modifier en devinant. Identifier d’abord la source officielle, puis faire le plus petit changement sûr.

## Branches

- `preview` = développement, corrections, tests et validation.
- `main` = production uniquement.
- Avant toute mise à jour importante de `main`, créer une branche de sauvegarde : `backup-main-YYYYMMDD`.

Ne jamais modifier `main` directement pour une correction de site, sauf urgence explicitement validée par le propriétaire du dépôt.

Workflow recommandé :

1. Créer une branche dédiée depuis `preview`.
2. Corriger sur cette branche.
3. Ouvrir une PR draft vers `preview`.
4. Laisser la CI s’exécuter.
5. Corriger jusqu’à ce que les checks soient verts.
6. Marquer la PR ready seulement quand elle est vérifiée.
7. Merger uniquement après validation explicite de l’utilisateur.

Ne pas supprimer de branche, fichier, workflow, donnée générée ou sauvegarde historique sans validation explicite.

## Règle GitHub Actions — workflow consolidé

Ne pas lancer plusieurs workflows séparés pour tester la même correction.

Règle obligatoire :

- Utiliser le workflow principal `Med Nykuto site tests` pour la validation complète.
- Ajouter un job au workflow principal plutôt que créer un workflow parallèle.
- Ne pas créer de workflows debug permanents si le workflow principal couvre déjà le besoin.
- Ne pas déclencher plusieurs commits de test successifs avant que le run précédent ait livré ses résultats, sauf correction urgente d’un échec déjà diagnostiqué.
- Le `concurrency` doit éviter les annulations inutiles. Pour les runs de validation, préférer `cancel-in-progress: false`, sauf cas explicitement voulu.

Objectif : un commit important doit produire un seul run lisible avec tous les jobs nécessaires.

## Sources officielles

Cours et modules :

- `content/courses/**` = source éditable officielle des cours.
- `content-lock.json` = verrou global des volumes et compteurs.
- `content/courses/<course>/course.json` = ordre et nombre de modules d’une matière.
- `data/med-courses-data.js` = donnée runtime générée, ne pas éditer manuellement sauf tâche explicitement liée au fichier généré.

Application :

- `src/app-bundle/**` = sources éditables du bundle applicatif.
- `src/dom/app-bundle/**` = sources DOM extraites.
- `src/i18n/app-bundle/**` = sources i18n extraites.
- `app.bundle.js` = bundle runtime généré ou assemblé, ne pas traiter comme source primaire.

## Hygiène repository

Ne pas introduire :

- fichiers `original-58` ;
- manifestes de migration obsolètes ;
- archives `.zip`, `.rar`, `.7z`, `.tar`, `.tgz`, `.gz` dans le repo ;
- fichiers temporaires `tmp`, `temp`, `old`, `copy`, `backup`, `legacy`, `obsolete` sans justification ;
- workflows ponctuels laissés en place après migration.

Le validateur `scripts/validate-no-stale-files.js` bloque les fichiers dangereux connus et signale les chemins suspects à réviser.

## Qualité des corrections

- Corriger la cause exacte, pas ajouter des rustines inutiles.
- Modifier le plus petit bloc responsable possible.
- Ne pas supprimer de contenu métier sans confirmation.
- Ne pas remplacer massivement des fichiers si une correction ciblée suffit.
- Pour un bug UI, corriger le HTML/CSS/JS responsable et vérifier le comportement réel.

## Fichiers de données protégés

Ne pas modifier les fichiers suivants pour corriger un bug UI, cache, test ou workflow :

- `data/med-courses-data.js`
- `data/med-practice-bank-init.js`
- `data/med-practice-bank-loader.js`
- `data/practice-bank-fisiologia.js`
- `data/practice-bank-microbiologia.js`
- `data/practice-bank-genetica.js`
- `data/practice-bank-bioquimica.js`
- `data/practice-bank-inmunologia.js`

## Règles de contenu pédagogique

Le contenu final d’étude doit être en espagnol médical clair, sauf demande explicite contraire. Pour les banques de questions :

- produire des questions pédagogiques et non répétitives ;
- éviter le remplissage artificiel ;
- varier les objectifs testés ;
- garder des distracteurs homogènes avec le type de question ;
- écrire les cas cliniques comme de mini-situations réalistes de 2–3 phrases ;
- mettre les réponses en gras et justifier immédiatement ;
- expliquer les mauvaises options quand c’est utile.

## Issues GitHub

Créer une issue pour chaque chantier réel :

- bug UI ;
- bug QCM / Casos clínicos / V/F ;
- qualité des corrections pédagogiques ;
- CI / déploiement ;
- refactor technique ;
- contenu ou banque de questions.

Chaque issue doit contenir :

- le problème observé ;
- le résultat attendu ;
- les fichiers probablement concernés ;
- les critères d’acceptation ;
- le statut des tests.

## Mise en production

Avant de mettre à jour `main`, confirmer :

- `preview` est validé visuellement ;
- les changements sont compris ;
- une sauvegarde de `main` existe si le changement est important ;
- la PR ou le commit décrit clairement les modifications ;
- le workflow principal complet est vert ou les exceptions sont explicitement documentées.
