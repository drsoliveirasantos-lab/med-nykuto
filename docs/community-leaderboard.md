# Classement hebdomadaire du 4.º E

## Fonctionnement

- La page publique `comunidade.html` est le centre **Estudiar / Estudar** : l'étudiant choisit d'abord une matière, puis un thème regroupant les cours qui portent sur le même contenu.
- Les entraînements de cette page chargent les banques de base puis les remplacent par `grupo-3-practice-grounded-v426.js` ; la banque active contient uniquement des questions rattachées à un passage précis de `clase.html`.
- Chaque question possède `grounding`, `evidence`, `evidenceId` et `sourceAnchor`. La validation bloque la publication si une preuve n'est pas retrouvée dans la section exacte du cours.
- À la fin d'un QCM lié à une matière ou à un module, l'étudiant peut publier volontairement son résultat sous un pseudonyme.
- Pour les entraînements de la classe, le thème et le format (`qcm`, `vf` ou `cases`) constituent la portée du meilleur résultat hebdomadaire.
- Pour chaque semaine, navigateur et matière/module, seul le meilleur résultat est conservé.
- Le classement additionne les bonnes réponses et utilise la précision pour départager les égalités.
- Le défi collectif vise 1 000 bonnes réponses. Il est remis à zéro chaque lundi selon l'heure du Paraguay.
- Aucun email, mot de passe, nom réel ou temps de réponse n'est stocké par l'application.

Le système repose volontairement sur la confiance : sans authentification, un utilisateur déterminé peut changer l'identifiant local de son navigateur. Le classement doit donc rester un outil amical, jamais un registre académique.

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
