# Med Nykuto — grille choisie par Diego

Application du 6 septembre 2026 · issue #185 · `med-typography-v509.css`.

## Choix explicite du propriétaire

Après comparaison d'une image de textes de 20 à 8 px, Diego a choisi **12 px
comme référence, y compris à l'intérieur des cours**, avec des titres au-dessus
et des descriptions/détails à 10–11 px. Ce choix remplace, pour Med Nykuto,
la recommandation de lecture à 16 px du standard commun version 1.0.
Ne pas remonter automatiquement les cours à 16 px lors d'une future mise à jour.
La hiérarchie et les autres principes du standard restent applicables.
Cette décision propre à Med Nykuto ne modifie pas les six autres dépôts.

## Variables communes

Les équivalents suivants supposent une racine navigateur de 16 px, qui n'est
pas modifiée. Les tailles utilisent `rem` pour conserver l'agrandissement.

| Rôle | Variable | Mobile | Ordinateur ≥ 960 px |
| --- | --- | ---: | ---: |
| Titre de page | `--med-type-page` | 20 px | 24 px |
| Section / chapitre principal | `--med-type-section` | 18 px | 20 px |
| Sous-titre / catégorie | `--med-type-subheading` | 16 px | 16 px |
| Carte / notion | `--med-type-card` | 14 px | 14 px |
| Cours, QCM, cas, explication, contrôle textuel | `--med-type-body` | 12 px | 12 px |
| Description courte | `--med-type-description` | 11 px | 11 px |
| Date, badge, précision secondaire | `--med-type-meta` | 10 px | 10 px |
| Champ de saisie de texte | `--med-type-input` | 16 px | 16 px |

L'interligne est de 1,6 pour le contenu, 1,4 pour l'interface et 1,3 pour les
titres. Les champs à 16 px restent une exception fonctionnelle pour la saisie
sur iPhone ; les menus de sélection suivent les contrôles à 12 px. Les icônes
et leurs surfaces tactiles gardent leurs dimensions.
Les énoncés balisés comme titres HTML sont des textes de question à 12 px,
pas de nouveaux titres de section. Pas de réduction récursive des listes.

## Source et portée

`med-typography-v509.css` est chargé après les styles existants dans les 28 pages
d'interface, dont les espaces S3, S4, P1, communauté, fichiers, résultats,
comptes et gestion. Les redirections, l'audit interne de microbiologie et le
document de séminaire imprimable conservent leur fonction et leur format.

La couche CSS nommée `med-typography` porte les tailles par rôle. Ses règles
importantes ont priorité sur les anciennes surcharges mobiles non structurées
en couches. Les tokens, non importants, restent personnalisables ; aucun
changement de taille racine, de viewport ou de blocage de zoom n'est ajouté.
Conserver les boutons dont le texte source est masqué par une taille nulle :
leurs icônes ou libellés courts viennent de pseudo-éléments.

Les cartes de thèmes peuvent grandir et leurs titres revenir à la ligne.
Le shell hors connexion inclut cette feuille et utilise le cache v509.
Les deux validateurs de calendrier/thème suivent ce nouveau numéro de cache
et le contrôle du calendrier vérifie également la présence de la typographie.
Les polices, palettes clair/sombre/sépia, banques, cours, schémas et formules
ne sont pas remplacés. Aucun bundle ni contenu pédagogique n'est régénéré.

## Validation et limites

Avant publication : analyse du CSS et du chargement des pages, contrôle du diff,
`npm run validate`, hygiène du dépôt. Après publication : un seul workflow
consolidé `Med Nykuto site tests`, avec suivi automatique du commit publié.
Ces contrôles de source ne constituent pas une validation visuelle sur iPhone.
L'analyse CSS couvre les rôles à 320, 390, 768 et 1280 px, les variables avec
une racine doublée, les libellés masqués et la préservation des formules.
Ne pas annoncer les tests navigateur ou le déploiement verts avant leur résultat.
