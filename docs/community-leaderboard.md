# Classement hebdomadaire du 4.º E

## Fonctionnement

- La page publique `comunidade.html` est le centre **Estudiar / Estudar** : l'étudiant choisit d'abord une matière, puis un thème regroupant les cours qui portent sur le même contenu.
- Les entraînements de cette page chargent les banques de base puis les remplacent par `grupo-3-practice-grounded-v426.js` ; la banque active `course-only-v431` contient uniquement des questions rattachées à un passage précis de `clase.html`.
- Les dix cas de chaque thème sont de vraies mini-vignettes : patient, histoire ou contexte en deux phrases, puis une question ciblée. Le scénario sert uniquement à appliquer l'élément vérifié du cours.
- Chaque question possède `grounding`, `evidence`, `evidenceId` et `sourceAnchor`. La validation bloque la publication si une preuve n'est pas retrouvée dans la section exacte du cours.
- À la fin d'un bloc lié à une matière ou à un module, l'étudiant peut publier volontairement son résultat depuis **Estudiar** ou **Matières**, après avoir confirmé son identité de membre du 4.º E.
- L'exercice se déroule dans une fenêtre de focus qui bloque le défilement de la page derrière. Le bouton de fermeture ramène au menu précédent.
- Pour les entraînements de la classe, le thème et le format (`qcm`, `vf` ou `cases`) constituent la portée du meilleur résultat hebdomadaire.
- L'étudiant saisit son nom visible et sa catraca. Le navigateur ne conserve jamais la catraca complète : l'API en garde seulement une empreinte HMAC liée à la classe et les quatre derniers caractères destinés au masque public.
- L'inscription renvoie un jeton opaque. Une nouvelle inscription avec la même catraca retrouve le même participant et renouvelle ce jeton, sans réinitialiser ses résultats.
- Pour chaque semaine, participant et matière/module, seul le meilleur résultat est conservé.
- Le classement additionne les bonnes réponses. Le départage est déterministe : points, précision, première activité enregistrée, puis clé interne stable.
- Le défi collectif vise 1 000 bonnes réponses. Il est remis à zéro chaque lundi selon l'heure du Paraguay.
- Le premier rang provisoire reçoit **50 R$ par Pix** après contrôle manuel de l'appartenance au 4.º E, de l'identité et du résultat. Aucune clé Pix n'est demandée dans le site.
- La classification publique montre le nom consenti et une catraca masquée. Elle n'expose jamais le numéro complet, son empreinte, le jeton d'accès ou l'identifiant interne.

Le score provient encore de l'entraînement dans le navigateur. La classification reste donc **provisoire** et le paiement ne peut pas être automatisé : le premier rang doit être contrôlé avant le Pix. Ce classement n'est pas un registre académique.

## Persistance et mises à jour

- `community_scores` reste la source historique des résultats et n'est jamais vidée par une publication du site.
- `community_participants` est créée de façon additive avec `CREATE TABLE IF NOT EXISTS`.
- Les anciennes lignes sous pseudonyme restent conservées et visibles avec la mention « profil en attente ». Dès que le même navigateur confirme son identité, ses scores existants sont automatiquement rattachés à son profil.
- Le code de migration n'utilise ni `DROP`, ni `DELETE`, ni `REPLACE` sur les tables de participation.
- Les semaines sont séparées par `week_key`; une nouvelle semaine n'écrase pas les précédentes.

## Activation Cloudflare Pages

Le code serveur se trouve dans `functions/api/community.js` et utilise de préférence une liaison D1 nommée `MED_NYKUTO_DB`. La liaison courte `DB`, déjà utilisée sur certains déploiements, reste également acceptée.

1. Dans Cloudflare, créer une base D1, par exemple `med-nykuto-community`, ou réutiliser la base existante `med-nykuto-db`.
2. Ouvrir le projet Pages Med Nykuto, puis **Settings → Bindings → D1 database bindings**.
3. Ajouter la variable `MED_NYKUTO_DB` et sélectionner la base créée. Si le projet expose déjà cette base sous le nom `DB`, aucune nouvelle liaison n'est nécessaire.
4. Configurer un secret `MED_NYKUTO_CATRACA_PEPPER` dans Preview et Production. Il sert à produire une empreinte non réversible et ne doit jamais être commité.
5. Configurer au minimum l'environnement Preview, puis Production au moment de la promotion.
6. Relancer un déploiement.

La table et son index sont créés automatiquement lors de la première requête. Aucune migration manuelle n'est nécessaire.

Sans cette liaison, les QCM continuent de fonctionner et la page affiche un état d'activation explicite ; aucun résultat local n'est supprimé.

## Vérification rapide

Après déploiement, `GET /api/community?class=s4-e` doit répondre avec `ok: true`, une semaine, un défi, le prix et un tableau `ranking`. Enregistrer un profil, terminer ensuite un entraînement du 4.º E, publier le score et vérifier que le nom et la catraca masquée apparaissent dans `comunidade.html`.
