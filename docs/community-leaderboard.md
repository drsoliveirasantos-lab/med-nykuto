# Classement hebdomadaire du 4.º E

## Fonctionnement

- La page publique `comunidade.html` est le centre **Estudiar / Estudar** : l'étudiant choisit d'abord une matière, puis un thème regroupant les cours qui portent sur le même contenu.
- Les entraînements de cette page chargent les banques de base puis les remplacent par `grupo-3-practice-grounded-v426.js` ; la banque active `course-only-v431` contient uniquement des questions rattachées à un passage précis de `clase.html`.
- Les dix cas de chaque thème sont de vraies mini-vignettes : patient, histoire ou contexte en deux phrases, puis une question ciblée. Le scénario sert uniquement à appliquer l'élément vérifié du cours.
- Chaque question possède `grounding`, `evidence`, `evidenceId` et `sourceAnchor`. La validation bloque la publication si une preuve n'est pas retrouvée dans la section exacte du cours.
- À la fin d'un bloc lié à une matière ou à un module, l'étudiant peut publier volontairement son résultat sous un pseudonyme, aussi bien depuis **Estudiar** que depuis **Matières**.
- L'exercice se déroule dans une fenêtre de focus qui bloque le défilement de la page derrière. Le bouton de fermeture ramène au menu précédent.
- Pour les entraînements de la classe, le thème et le format (`qcm`, `vf` ou `cases`) constituent la portée du meilleur résultat hebdomadaire.
- Le pseudonyme normalisé est l'identité anonyme du classement. Si le navigateur privé recrée son identifiant local, reprendre exactement le même pseudonyme réunit les résultats sur une seule ligne.
- Pour chaque semaine, pseudonyme et matière/module, seul le meilleur résultat est conservé.
- Le classement additionne les bonnes réponses et utilise la précision pour départager les égalités.
- Le défi collectif vise 1 000 bonnes réponses. Il est remis à zéro chaque lundi selon l'heure du Paraguay.
- Aucun email, mot de passe, nom réel ou temps de réponse n'est stocké par l'application.

Le système repose volontairement sur la confiance : sans authentification, deux personnes qui choisissent volontairement le même pseudonyme partageraient la même ligne. Le classement doit donc rester un outil amical, jamais un registre académique.

## Activation Cloudflare Pages

Le code serveur se trouve dans `functions/api/community.js` et utilise de préférence une liaison D1 nommée `MED_NYKUTO_DB`. La liaison courte `DB`, déjà utilisée sur certains déploiements, reste également acceptée.

1. Dans Cloudflare, créer une base D1, par exemple `med-nykuto-community`, ou réutiliser la base existante `med-nykuto-db`.
2. Ouvrir le projet Pages Med Nykuto, puis **Settings → Bindings → D1 database bindings**.
3. Ajouter la variable `MED_NYKUTO_DB` et sélectionner la base créée. Si le projet expose déjà cette base sous le nom `DB`, aucune nouvelle liaison n'est nécessaire.
4. Configurer au minimum l'environnement Preview, puis Production au moment de la promotion.
5. Relancer un déploiement.

La table et son index sont créés automatiquement lors de la première requête. Aucune migration manuelle n'est nécessaire.

Sans cette liaison, les QCM continuent de fonctionner et la page affiche un état d'activation explicite ; aucun résultat local n'est supprimé.

## Vérification rapide

Après déploiement, `GET /api/community` doit répondre avec `ok: true`, une semaine, un défi et un tableau `ranking`. Terminer ensuite un QCM depuis une URL contenant `course` ou `module`, publier un score et vérifier qu'il apparaît dans `comunidade.html`.
