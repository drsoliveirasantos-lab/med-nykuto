# Med Nykuto — workflow de restauration des cours v362

## Objectif

Restaurer les vrais cours complets dans `data/med-courses-data.js` à partir d'une ancienne version fonctionnelle du site, sans écraser à l'aveugle le fallback actuel.

## Source prioritaire à retrouver

Le rapport Cloudflare v281 indique que la source complète était :

```text
site-med-cursos-v281-cloudflare-full-split.zip
```

Cette version contenait :

- toutes les matières ;
- tous les modules ;
- `data/med-courses-data.js` séparé ;
- fichiers `/data/` sous la limite Cloudflare Pages de 25 MiB.

Les rapports v282/v283 indiquaient aussi que `data/med-courses-data.js` faisait environ `2.79 MB`, ce qui est le signal attendu d'un fichier riche. Le fichier compact actuel est beaucoup plus petit et sert seulement de récupération fonctionnelle.

## Commande d'import

Après avoir récupéré le ZIP ou le dossier extrait sur ton ordinateur :

```bash
npm run import:courses -- /chemin/vers/site-med-cursos-v281-cloudflare-full-split.zip --write
```

Ou avec un dossier déjà décompressé :

```bash
npm run import:courses -- /chemin/vers/site-med-cursos-v281-cloudflare-full-split --write
```

Ou directement avec l'ancien fichier JS :

```bash
npm run import:courses -- /chemin/vers/data/med-courses-data.js --write
```

## Sécurité intégrée

Le script `scripts/import-legacy-courses.js` :

1. cherche les candidats `data/med-courses-data.js`, `data/courses-data.js`, `app.bundle.js` ;
2. extrait `window.MED_COURSES_DATA` ;
3. vérifie qu'il y a au moins 5 matières actives et 58 modules ;
4. rejette les données génériques de fallback, sauf option explicite `--allow-generic` ;
5. crée une sauvegarde de l'actuel `data/med-courses-data.js` ;
6. écrit le fichier restauré ;
7. demande ensuite de lancer les validateurs.

## Commandes après import

```bash
npm run validate
npm test
```

## Attention

Ne pas importer un fichier qui contient seulement des modules génériques du type :

```text
Este módulo organiza los puntos esenciales...
```

Ce texte indique un fallback fonctionnel, pas les vrais cours complets.

## Statut actuel

- `preview` contient une version fonctionnelle compacte de `data/med-courses-data.js`.
- L'historique GitHub récent montre une version vide, puis une version compacte générique.
- La source complète doit donc être reprise depuis l'ancien ZIP/dossier v281/v282 ou depuis les fichiers de cours individuels validés.
