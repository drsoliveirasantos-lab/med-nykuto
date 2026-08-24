# Gestion dynamique de Med Nykuto

## Capacites

Le shell protege `gestion-shell/index.html`, publie sous `/gestion/:slug`, permet de publier sans redesploiement les taches, alertes, activites de groupe, fichiers et dates. Les contenus publies apparaissent dans `clase.html` et `archivos.html` par l'intermediaire de `functions/api/class-hub.js`.

- Le proprietaire est le seul role autorise a creer ou revoquer des invitations, creer un compte de delegue, reinitialiser sa connexion, revoquer un editeur et consulter le journal d'audit.
- Un editeur peut gerer les taches, alertes, groupes, fichiers et dates. Les cours, questions, profils enseignants, permissions et parametres restent bloques cote serveur.
- Les etats disponibles sont `draft`, `published` et `archived`.
- Les invitations sont a usage unique, limitees dans le temps et revocables.
- Les groupes imposent cote serveur une seule inscription par activite, la capacite du groupe et de l'activite, ainsi qu'une composition finale apres fermeture ou congelation.
- Les tentatives de connexion sont limitees a la fois par adresse reseau pseudonymisee et par empreinte du courrier normalise. Les inscriptions, activations d'invitation et abonnements push conservent leurs limites propres.
- Le courrier du delegue sert uniquement a son compte de gestion et reste limite a sa turma. Aucun courrier ni compte permanent n'est demande aux etudiants.
- La cle aleatoire d'un etudiant et les jetons de session de gestion ne sont conserves sur le serveur que sous forme de condensat SHA-256.
- Les exports de groupes sont limites a une copie adaptee a WhatsApp et a l'impression PDF.

## Connexion delegue v472

La version `v472` charge `gestion-v440.css?v=472` et `gestion-v440.js?v=472`. Elle ajoute un acces par courrier et mot de passe sans supprimer le token proprietaire ni le parcours historique d'invitation.

1. Le proprietaire cree le compte dans **Acces et audit** avec un nom, un courrier et un mot de passe temporaire.
2. Le courrier est normalise cote serveur et le mot de passe est derive avec PBKDF2-HMAC-SHA-256, un sel aleatoire propre au compte et 100 000 iterations, calibre pour le budget CPU des Pages Functions. Le mot de passe en clair n'est jamais enregistre.
3. Le delegue se connecte sur `/gestion/<slug>`. Une session de huit heures est creee avec un jeton aleatoire dont seul le condensat est stocke dans D1.
4. Le cookie de session utilise `Secure`, `HttpOnly` et `SameSite=Strict`. Un second cookie lisible par l'interface fournit la valeur anti-CSRF, renvoyee dans l'en-tete `x-csrf-token` pour chaque mutation de session.
5. Une connexion par mot de passe temporaire ouvre uniquement l'ecran de changement obligatoire. La gestion reste bloquee jusqu'au choix d'une phrase de mot de passe d'au moins douze caracteres, suffisamment variee et non exclusivement numerique.
6. Le changement ou la reinitialisation du mot de passe revoque les sessions precedentes. La revocation du delegue revoque egalement toutes ses sessions actives.

Deux tables D1 tenant completees par `class_id` portent ce flux :

- `hub_editor_credentials` : courrier normalise, derive, sel, version et obligation de changement ;
- `hub_editor_sessions` : condensats de session/CSRF, expiration et revocation.

Les anciennes lignes `hub_editors` et leurs tokens restent compatibles pendant la transition. Les reponses de l'API ne renvoient jamais le derive, le sel, le jeton de session ou le mot de passe.

## Activation sur Cloudflare Pages

1. Dans le projet Pages, lier une base D1 sous le nom `MED_NYKUTO_DB`. La liaison existante `DB` reste compatible.
2. Ajouter un secret de production `MED_NYKUTO_OWNER_TOKEN` long, aleatoire et reserve au proprietaire.
3. Ajouter de preference un second secret aleatoire `MED_NYKUTO_RATE_SALT` pour isoler les empreintes utilisees par la limitation d'abus.
4. Utiliser des secrets et une base D1 distincts pour les environnements preview et production afin qu'un test de connexion ne modifie pas les comptes reels.
5. Redeployer. Les tables, index, deux taches actives, les alertes initiales, les emplacements de groupes vides et les deux tables d'authentification sont crees automatiquement a la premiere requete.
6. Ouvrir `/gestion/s4-e`, entrer le token proprietaire, puis creer un compte de delegue avec un mot de passe temporaire.

Sans D1, la page publique conserve ses donnees statiques de secours. La gestion protegee et les inscriptions de groupe restent volontairement indisponibles.

## Notifications push facultatives

Les alertes normales restent dans la campana du site. Les alertes importantes et urgentes peuvent en plus utiliser un service push externe.

- `MED_NYKUTO_VAPID_PUBLIC_KEY` : cle publique VAPID exposee au navigateur.
- `MED_NYKUTO_PUSH_WEBHOOK` : URL HTTPS du relais charge de signer et d'envoyer les messages Web Push.
- `MED_NYKUTO_PUSH_WEBHOOK_TOKEN` : secret Bearer facultatif du relais.

Une alerte urgente reste visible dans la campana et le bandeau meme si aucun relais push n'est configure.

## Verification rapide

1. `GET /api/class-hub?resource=public` doit repondre avec `ok: true`.
2. Avec `Authorization: Bearer <MED_NYKUTO_OWNER_TOKEN>`, `GET /api/class-hub?resource=admin` doit retourner l'acteur `owner`.
3. Avec des donnees factices en preview, creer un compte de delegue, verifier la connexion, le blocage avant changement de mot de passe et le renouvellement de session apres changement.
4. Verifier qu'une session de `s4-e` ne lit ni ne modifie `s3-a`, que les mutations sans en-tete anti-CSRF sont refusees et que la deconnexion revoque la session.
5. Creer une tache brouillon, la publier, puis verifier son apparition sans nouveau deploiement.
6. Rejoindre un groupe depuis `clase.html`, verifier qu'une seconde inscription a la meme activite est refusee, puis congeler l'activite et verifier que les ajouts, retraits et deplacements sont bloques.
