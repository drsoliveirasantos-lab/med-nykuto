# Consignes de travail — Med Nykuto

Ce dépôt doit être géré avec un workflow strict, traçable et stable.

## Branches

- `preview` = développement, corrections, tests et validation.
- `main` = production uniquement.
- Avant toute mise à jour importante de `main`, créer une branche de sauvegarde : `backup-main-YYYYMMDD`.

## Règle principale

Ne jamais modifier `main` directement pour une correction de site, sauf urgence explicitement validée par le propriétaire du dépôt.

Workflow recommandé :

1. Corriger sur `preview`.
2. Tester sur `preview`.
3. Créer ou mettre à jour une issue GitHub qui décrit le bug ou l'amélioration.
4. Ouvrir une PR `preview → main` quand la correction est validée.
5. Comparer `preview` et `main` avant merge.
6. Sauvegarder `main` avant tout alignement forcé.
7. Ne publier en production que si les contrôles essentiels sont OK.

## Règle GitHub Actions — un seul workflow consolidé

Ne pas lancer plusieurs workflows séparés pour tester la même correction.

Règle obligatoire :

- Utiliser un seul workflow principal pour une validation complète.
- Regrouper tous les tests nécessaires dans ce workflow unique sous forme de jobs séparés.
- Ne pas créer de workflows debug parallèles qui se déclenchent sur le même commit si le workflow principal couvre déjà le besoin.
- Ne pas déclencher plusieurs commits de test successifs avant que le run précédent ait livré ses résultats, sauf correction urgente d'un échec déjà diagnostiqué.
- Préférer ajouter un job au workflow principal plutôt que créer un nouveau workflow.
- Les jobs doivent couvrir : validation data, smoke tests, practice-flow, restored-data, module UI, click-audit, real-click/QCM critical, et tout test spécifique ajouté ensuite.
- Le `concurrency` doit éviter les annulations inutiles. Pour les runs de validation, préférer `cancel-in-progress: false`, sauf cas explicitement voulu.

Objectif : un commit important doit produire un seul run lisible avec tous les jobs nécessaires, au lieu de plusieurs runs qui s'annulent ou se concurrencent.

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
- les critères d'acceptation ;
- le statut des tests.

## Mise en production

Avant de mettre à jour `main`, confirmer :

- `preview` est validé visuellement ;
- les changements sont compris ;
- une sauvegarde de `main` existe si le changement est important ;
- la PR ou le commit décrit clairement les modifications ;
- le workflow principal complet est vert ou les exceptions sont explicitement documentées.