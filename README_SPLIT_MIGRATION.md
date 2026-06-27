# Med Nykuto — migration vers sources divisées

Ce package transforme le fichier géant `window.MED_COURSES_DATA` en une structure éditable par matière et par module.

## Ce que contient ce patch

- `content/courses/` : sources éditables des cours
- `scripts/build-courses-data.js` : reconstruit `data/med-courses-data.js`
- `scripts/validate-course-sources.js` : vérifie que les modules, métadonnées et images existent
- `scripts/extract-courses-from-window.js` : ré-extrait un fichier live si besoin
- `scripts/add-module.js` : crée un squelette de nouveau module
- `assets/figures/fisiologia-muscular/` : vraies images `.webp` du module 10
- `data/med-courses-data.js` : fichier final généré, prêt pour le site
- `_source_backup/med-courses-data-live-v363-original-58.js` : sauvegarde du fichier live original avant ajout du module 10

## État attendu

Après ce patch :

- totalModules = 59
- Fisiología = 10 modules
- Microbiología = 13 modules
- Genética = 12 modules
- Bioquímica = 12 modules
- Inmunología = 12 modules
- Biofísica = 0 module

Le nouveau module est :

`01-fisiologia-10-fisiologia-muscular`

## Validation CI

Les tests de régression doivent attendre 59 modules au total et 10 modules pour Fisiología. La banque d'entraînement de Fisiología reste validée sur les 9 modules existants jusqu'à création séparée de la banque du module 10.

## Workflow recommandé

1. Créer une branche séparée, par exemple :

```bash
git checkout -b refactor/split-courses-data
```

2. Copier les dossiers du patch à la racine du repo :

```txt
content/
scripts/
assets/
data/
content-lock.json
```

3. Valider les sources :

```bash
node scripts/validate-course-sources.js
```

4. Reconstruire le fichier utilisé par le site :

```bash
node scripts/build-courses-data.js
```

5. Tester le site.

## Règle importante

Ne plus modifier directement :

```txt
data/med-courses-data.js
```

Ce fichier doit être considéré comme généré automatiquement.

Pour modifier un module, éditer plutôt :

```txt
content/courses/<matiere>/modules/<module>/full.md
content/courses/<matiere>/modules/<module>/fiche.md
content/courses/<matiere>/modules/<module>/ultra.md
content/courses/<matiere>/modules/<module>/meta.json
content/courses/<matiere>/modules/<module>/figures.json
```

Puis relancer :

```bash
node scripts/build-courses-data.js
```

## Images

Les images optimisées pour le site sont dans :

```txt
assets/figures/fisiologia-muscular/
```

Les références dans le module 10 pointent vers ces fichiers.
