# Standard commun — hiérarchie typographique

Version 1.0 · 6 septembre 2026 · Consigne demandée par Diego.

## Portée

Ce standard s'applique aux créations et aux mises à jour des interfaces de tous
les sites de Diego, dont Nykuto, Ellen Studio et Med Nykuto. Il doit être lu avant
tout travail sur une page, une carte, un formulaire, une fiche ou un écran de cours.
La référence interprojets est
[Med Nykuto Core](https://github.com/drsoliveirasantos-lab/med-nykuto-core/blob/main/docs/typography-standard.md).
Chaque dépôt conserve cette version locale, accessible sans connexion.

## Règle obligatoire

À l'intérieur d'un même bloc de contenu, la taille diminue avec le niveau
d'information :

**Titre de page > titre de section > sous-titre / catégorie > titre de carte ou
d'élément > description courte / prix > métadonnées.**

- Une description, un prix, une date, un badge ou une précision ne doit pas être
  aussi grand ou plus grand que le titre du bloc auquel il appartient.
- Deux éléments du même rôle utilisent la même taille, la même graisse et le même
  interligne sur les différentes pages, à contexte et largeur identiques.
- Un nouveau bloc peut commencer par son propre titre : la règle suit la
  hiérarchie du contenu, pas l'ordre vertical absolu de toute la page.
- La profondeur du HTML ne commande pas la taille. Ne pas réduire les listes,
  paragraphes ou cartes de manière récursive jusqu'à les rendre illisibles.
  Quand le minimum lisible est atteint, simplifier l'imbrication et distinguer
  les rôles par l'espace, la graisse ou la couleur ; conserver le titre au-dessus.
- Garder des titres HTML sémantiques dans un ordre logique. Ne pas changer un
  niveau de titre uniquement pour obtenir un effet visuel.

## Échelle de départ pour une interface compacte

Équivalents en pixels CSS pour une racine normale de 16px ; implémenter en
`rem` avec des variables partagées. Cette grille est un point de départ,
à adapter ensemble selon le contenu et la police du projet.

| Rôle | Mobile | Ordinateur |
| --- | ---: | ---: |
| Titre principal de page | 32 | 44 |
| Titre de section | 24 | 28 |
| Catégorie / sous-titre | 18 | 20 |
| Nom de carte ou d'élément | 16 | 16 |
| Description courte, prix, navigation, bouton | 14 | 14 |
| Date, légende courte, précision secondaire | 12 | 12 |

N'utiliser que les niveaux nécessaires. Ne pas multiplier les familles de
polices ni copier l'identité d'Ellen Studio sur les autres marques. Adapter les
graisses, couleurs et interlignes à la police existante ; un prix doit être
repérable sans devenir plus grand que le nom de l'élément.

## Lecture longue, Med Nykuto et accessibilité

- Les paragraphes de cours, explications, énoncés de QCM et cas cliniques restent
  à **16px minimum** par défaut, avec un interligne d'environ 1,5 à 1,7.
  Les sous-titres qui les introduisent doivent rester plus grands, par exemple
  18 ou 20px, puis 24px pour la section. La grille des cartes compactes ne doit
  pas être appliquée aveuglément à un cours.
- Les descriptions courtes d'interface restent normalement à 14px minimum ;
  réserver 12px aux précisions secondaires réellement brèves.
- Préserver les réglages de lecture, le zoom et l'agrandissement utilisateur.
  Ne pas diminuer la taille racine ni bloquer le zoom pour compacter une page.
- Les champs de saisie restent à 16px minimum par défaut. Leur surface de saisie
  est un contrôle fonctionnel, distinct du texte descriptif de la carte.
- Conserver des cibles tactiles d'au moins 44 × 44px pour les boutons à icône.
  La taille d'un bouton ne se déduit pas de celle de son texte.
- Les équations, schémas, graphiques et logos gardent les dimensions nécessaires
  à leur lecture ; leurs légendes suivent la hiérarchie textuelle. Ne pas
  rapetisser un schéma pédagogique ou une formule pour simuler un sous-niveau.

## Application à chaque prochaine mise à jour

1. Identifier les styles réellement utilisés, y compris les surcharges mobiles,
   et relever les tailles de chaque rôle dans les composants touchés.
2. Corriger les inversions dans les pages et composants concernés par la demande,
   avec des variables communes plutôt que des tailles isolées répétées.
3. Vérifier la hiérarchie sur petit mobile et ordinateur, la lecture à texte
   agrandi, les retours à la ligne et les contrôles. Employer les validations
   adaptées au changement et autorisées dans l'environnement ; distinguer une
   analyse du CSS d'une vérification réellement effectuée dans un navigateur.
4. Résumer les rôles corrigés et les limites de validation. L'ajout de cette
   consigne ne constitue pas, à lui seul, une refonte du CSS des sites existants.

## Transmission aux futurs sites

À chaque création, copie ou extraction d'un nouveau site ou dépôt :

1. Inclure ce fichier sous `docs/typography-standard.md`.
2. Ajouter dans le `AGENTS.md` racine et les consignes Copilot l'obligation de le
   lire et de l'appliquer avant tout travail d'interface.
3. Lier le standard depuis la documentation du nouveau projet et définir sa
   grille de tailles commune dès le premier écran.
4. Vérifier que les consignes du modèle sont bien conservées après la copie.

GitHub ne transmet pas automatiquement le `AGENTS.md` d'un dépôt à un autre.
Cette étape de création est donc obligatoire, y compris pour un site créé de zéro.
Lors d'une évolution de ce standard commun, répercuter la règle et sa version
dans les dépôts concernés pour éviter les divergences.
