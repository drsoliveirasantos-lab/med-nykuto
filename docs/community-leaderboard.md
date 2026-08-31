# Classement hebdomadaire du 4.º E

## Fonctionnement

- La page publique `comunidade.html` est le centre **Estudiar / Estudar** : l'étudiant choisit d'abord une matière, puis un thème regroupant les cours qui portent sur le même contenu.
- Les entraînements de cette page chargent les banques de base puis les remplacent par `grupo-3-practice-grounded-v426.js` ; la banque active `course-only-v431` contient uniquement des questions rattachées à un passage précis de `clase.html`.
- Les dix cas de chaque thème sont de vraies mini-vignettes : patient, histoire ou contexte en deux phrases, puis une question ciblée. Le scénario sert uniquement à appliquer l'élément vérifié du cours.
- Chaque question possède `grounding`, `evidence`, `evidenceId` et `sourceAnchor`. La validation bloque la publication si une preuve n'est pas retrouvée dans la section exacte du cours.
- Dès qu'une réponse est enregistrée, **Estudiar** affiche le total cumulé des bonnes réponses parmi les questions déjà réalisées. Depuis **Estudiar** ou **Matières**, un seul clic volontaire synchronise ensemble les progrès QCM, vrai/faux et cas cliniques déjà présents sur l'appareil, après confirmation de l'identité de membre du 4.º E.
- L'exercice se déroule dans une fenêtre de focus qui bloque le défilement de la page derrière. Le bouton de fermeture ramène au menu précédent.
- Pour les entraînements de la classe, le thème et le format (`qcm`, `vf` ou `cases`) constituent la portée du meilleur résultat hebdomadaire.
- La synchronisation groupée réutilise exactement ces trois portées historiques : elle ne crée pas de quatrième score « total » et ne double donc pas un bloc déjà publié. Pour une série encore partielle, l'interface affiche les questions effectivement répondues, tandis que la précision du classement conserve comme dénominateur la taille complète du format afin de ne pas favoriser artificiellement une série arrêtée après ses premières bonnes réponses.
- La participation est facultative. Pour rejoindre le défi, l'étudiant saisit son **nom complet** (deux mots, 5 à 60 caractères), sa **catraca complète**, atteste appartenir au 4.º E et consent explicitement à rendre ces deux valeurs visibles à toute personne disposant du lien du classement.
- Le profil local conserve le même `playerId`, le nom complet, la catraca complète et un jeton d'accès opaque. Le nom et la catraca sont publics par consentement ; le jeton reste strictement privé, n'apparaît ni dans le classement, ni dans l'URL, ni dans la réponse publique de lecture.
- Une mise à jour d'identité existante exige le `playerId` et le jeton déjà enregistré. Une catraca liée à un autre profil, un jeton absent ou un jeton incorrect produit `identity_conflict` sans modifier le profil local ni les résultats. Le navigateur génère et conserve le jeton avant la première requête ; l'API garde le même jeton lors des mises à jour autorisées afin qu'une réponse réseau perdue puisse être rejouée sans bloquer le profil.
- Pour chaque semaine, participant et matière/module, seul le meilleur résultat est conservé.
- Le classement du 4.º E place d'abord le total de bonnes réponses (**points**), puis la précision, la première activité enregistrée et enfin une clé interne stable. Dans chaque matière/module, le meilleur résultat est lui aussi choisi d'abord selon les bonnes réponses.
- Le défi collectif vise 1 000 bonnes réponses. Il est remis à zéro chaque lundi selon l'heure du Paraguay.
- Le chrono est synchronisé avec l'heure renvoyée par l'API, et non uniquement avec l'horloge du téléphone. Il décompte jusqu'au **dimanche à 20 h 00 précises, heure du Paraguay** (`America/Asuncion`).
- À 20 h 00, le serveur refuse toute nouvelle publication avec `challenge_closed` et le classement de la semaine reste figé pour la vérification du gagnant. Un résultat terminé sur le téléphone reste conservé localement, mais ne modifie plus le classement fermé.
- Le premier rang provisoire à l'arrêt du chrono reçoit **50 R$ par Pix** après contrôle manuel de l'appartenance au 4.º E, de l'identité et du résultat. Aucune clé Pix n'est demandée dans le site.
- La classification publique montre le nom complet et la catraca complète consentis. Elle n'expose jamais l'empreinte HMAC, le jeton d'accès ou l'identifiant interne. Un profil complet mais non contrôlé porte la mention « vérification en attente / classement provisoire » ; une ligne historique sans identité complète reste visible mais n'est pas éligible au prix.

Le score provient encore de l'entraînement dans le navigateur. La classification reste donc **provisoire** et le paiement ne peut pas être automatisé : le premier rang doit être contrôlé avant le Pix. Ce classement n'est pas un registre académique.

## Persistance et mises à jour

- `community_scores` reste la source historique des résultats et n'est jamais vidée par une publication du site.
- Rejouer la synchronisation est idempotent : chaque format garde son meilleur résultat hebdomadaire et un bloc déjà enregistré n'est pas ajouté deux fois.
- La limite hebdomadaire autorise les trois formats des quatorze thèmes actifs (42 portées) tout en conservant une petite marge technique ; elle ne bloque donc pas un étudiant qui réalise toute la bibliothèque de la semaine.
- `community_participants` est créée de façon additive avec `CREATE TABLE IF NOT EXISTS`. Elle conserve la catraca publique consentie, son empreinte HMAC de rapprochement et seulement le condensat du jeton d'accès.
- Les anciennes lignes sous pseudonyme restent conservées et visibles avec la mention « identification en attente · sans prix ». Lorsque le même `playerId` confirme son identité, ses scores existants sont rattachés au profil sans réécriture ni suppression.
- Le code de migration n'utilise ni `DROP`, ni `DELETE`, ni `REPLACE` sur les tables de participation.
- Les semaines sont séparées par `week_key`; une nouvelle semaine n'écrase pas les précédentes.

## Activation Cloudflare Pages

Le code serveur se trouve dans `functions/api/community.js` et utilise de préférence une liaison D1 nommée `MED_NYKUTO_DB`. La liaison courte `DB`, déjà utilisée sur certains déploiements, reste également acceptée.

1. Dans Cloudflare, créer une base D1, par exemple `med-nykuto-community`, ou réutiliser la base existante `med-nykuto-db`.
2. Ouvrir le projet Pages Med Nykuto, puis **Settings → Bindings → D1 database bindings**.
3. Ajouter la variable `MED_NYKUTO_DB` et sélectionner la base créée. Si le projet expose déjà cette base sous le nom `DB`, aucune nouvelle liaison n'est nécessaire.
4. Configurer un secret `MED_NYKUTO_CATRACA_PEPPER` dans Preview et Production. Il sert à produire l'empreinte HMAC utilisée pour rapprocher une identité sans exposer cette empreinte ; la catraca complète reste néanmoins une donnée publique du défi après consentement. Le secret ne doit jamais être commité.
5. Configurer au minimum l'environnement Preview, puis Production au moment de la promotion.
6. Relancer un déploiement.

La table et son index sont créés automatiquement lors de la première requête. Aucune migration manuelle n'est nécessaire.

Sans cette liaison, les QCM continuent de fonctionner et la page affiche un état d'activation explicite ; aucun résultat local n'est supprimé.

## Vérification rapide

Après déploiement, `GET /api/community?class=s4-e` doit répondre avec `ok: true`, une semaine, un défi, le prix et un tableau `ranking`. Enregistrer un profil de test avec consentement, terminer ensuite un entraînement du 4.º E, publier le score et vérifier que le nom complet et la catraca complète apparaissent dans `comunidade.html`, tandis que le jeton reste absent de la réponse publique. Vérifier aussi qu'un changement avec un jeton erroné est refusé sans altérer le profil, et qu'aucun Pix n'est déclenché avant le contrôle manuel du gagnant.
