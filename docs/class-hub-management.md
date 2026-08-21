# Gestion dynamique de Med Nykuto

## Capacites

La page protegee `gestion.html` permet de publier sans redesploiement les taches, alertes, activites de groupe, fichiers et dates. Les contenus publies apparaissent dans `clase.html` et `archivos.html` par l'intermediaire de `functions/api/class-hub.js`.

- Le proprietaire est le seul role autorise a creer ou revoquer des invitations, revoquer un editeur et consulter le journal d'audit.
- Un editeur peut gerer les taches, alertes, groupes, fichiers et dates. Les cours, questions, profils enseignants, permissions et parametres restent bloques cote serveur.
- Les etats disponibles sont `draft`, `published` et `archived`.
- Les invitations sont a usage unique, limitees dans le temps et revocables.
- Les groupes imposent cote serveur une seule inscription par activite, la capacite du groupe et de l'activite, ainsi qu'une composition finale apres fermeture ou congelation.
- Les tentatives d'acces, d'inscription, d'activation d'invitation et d'abonnement push sont limitees par fenetre cote serveur; seules des empreintes pseudonymes de reseau sont conservees pour ce controle.
- Aucune adresse electronique, compte permanent ou identifiant sensible d'etudiant n'est demande. La cle aleatoire du navigateur n'est conservee sur le serveur que sous forme de condensat SHA-256.
- Les exports de groupes sont limites a une copie adaptee a WhatsApp et a l'impression PDF.

## Activation sur Cloudflare Pages

1. Dans le projet Pages, lier une base D1 sous le nom `MED_NYKUTO_DB`. La liaison existante `DB` reste compatible.
2. Ajouter un secret de production `MED_NYKUTO_OWNER_TOKEN` long, aleatoire et reserve au proprietaire.
3. Ajouter de preference un second secret aleatoire `MED_NYKUTO_RATE_SALT` pour isoler les empreintes utilisees par la limitation d'abus.
4. Redeployer. Les tables, index, deux taches actives, les alertes initiales et les emplacements de groupes vides sont crees automatiquement a la premiere requete.
5. Ouvrir `/gestion.html`, entrer le token proprietaire, puis creer si necessaire une invitation d'editeur.

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
3. Creer une tache brouillon, la publier, puis verifier son apparition sans nouveau deploiement.
4. Rejoindre un groupe depuis `clase.html`, verifier qu'une seconde inscription a la meme activite est refusee, puis congeler l'activite et verifier que les ajouts, retraits et deplacements sont bloques.
