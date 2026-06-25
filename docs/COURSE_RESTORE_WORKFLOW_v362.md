# Med Nykuto — workflow de restauration des cours et banques v363

## Objectif

Restaurer les vrais cours complets et les banques d'entraînement depuis un ancien dossier fonctionnel du site, sans modifier `main` et sans écraser à l'aveugle les sécurités actuelles de `preview`.

## Source récupérée

Le dossier récupéré doit contenir au minimum :

```text
med-courses-data.js
med-practice-bank-init.js
practice-bank-fisiologia.js
practice-bank-microbiologia.js
practice-bank-genetica.js
practice-bank-bioquimica.js
practice-bank-inmunologia.js
```

Le fichier `med-practice-bank-loader.js` peut être présent dans la source, mais le workflow v363 ne le remplace pas par défaut, pour conserver le loader `preview` actuel avec fallback et patchs qualité.

## Résultat de vérification du dossier récupéré

La source récupérée correspond à une ancienne base riche :

| Fichier | Statut vérifié |
|---|---|
| `med-courses-data.js` | 6 matières, 58 modules, vrais cours longs, 0 module générique |
| `practice-bank-fisiologia.js` | 9 modules, 1800 QCM, 450 V/F, 450 cas |
| `practice-bank-microbiologia.js` | 13 modules, 2600 QCM, 650 V/F, 650 cas |
| `practice-bank-genetica.js` | 12 modules, 2400 QCM, 600 V/F, 600 cas |
| `practice-bank-bioquimica.js` | 12 modules, 600 QCM, 600 cas, pas de V/F dans cette source |
| `practice-bank-inmunologia.js` | 12 modules, 600 QCM, 600 cas, pas de V/F dans cette source |

## Commande recommandée

Depuis un checkout local de la branche `preview`, placer le dossier récupéré quelque part sur l'ordinateur, puis lancer :

```bash
npm run import:legacy-data -- /chemin/vers/dossier-recupere --write
```

Avec un ZIP :

```bash
npm run import:legacy-data -- /chemin/vers/dossier-recupere.zip --write
```

## Pourquoi ne pas remplacer le loader par défaut ?

Le loader actuel de `preview` charge :

1. les banques principales restaurées si elles existent ;
2. le fallback fonctionnel ;
3. les patchs qualité plus récents.

Il est donc plus sûr que l'ancien loader v282. L'ancien loader peut être copié seulement si nécessaire :

```bash
npm run import:legacy-data -- /chemin/vers/dossier-recupere --write --replace-loader
```

## Fallback V/F pour Bioquímica et Inmunología

Les fichiers récupérés pour Bioquímica et Inmunología ne contiennent pas de tableau `vf`. Le fallback `practice-bank-functional-fallback-v360.js` a donc été durci en v363 : il n'écrase pas les vraies banques, mais complète uniquement les formats absents.

## Commandes après import

```bash
npm run validate
npm test
```

## Règles de sécurité

- Ne pas modifier `main`.
- Importer sur `preview` uniquement.
- Vérifier les tailles : les gros fichiers sont normaux.
- Refuser les fichiers qui ne contiennent que du fallback générique.
- Garder une sauvegarde automatique avant remplacement.
