# Fondation multiturmas Med Nykuto

## Objectif du pilote

Cette fondation permet d'ouvrir plusieurs espaces de classe dans une seule application, sans dupliquer le site ni mélanger les données. Le 4.º E historique reste compatible et chaque nouvelle turma obtient son propre slug, ses matières, ses tâches, ses alertes, ses groupes, ses fichiers, ses dates, ses éditeurs et son historique d'audit.

Le pilote est un espace **non indexé, accessible par lien, sans données personnelles visibles publiquement**. Il ne doit pas être présenté comme un portail privé tant qu'une authentification étudiante n'a pas été ajoutée.

## Routes

| Usage | Route | Accès |
|---|---|---|
| Espace étudiant | `/turma/<slug>` | Lien de la turma, sans compte étudiant |
| Gestion | `/gestion/<slug>` | Jeton propriétaire ou éditeur de cette turma |
| Données publiques | `/api/class-hub?class=<slug>&resource=public` | Sans noms d'étudiants |
| Données de gestion | `/api/class-hub?class=<slug>&resource=admin` | Authentifié et limité à la turma |
| Registre des turmas | `/api/class-hub?class=<slug>&resource=classes` | Propriétaire uniquement |
| Manifeste PWA | `/api/class-manifest?class=<slug>` | Manifeste propre au slug |

Une requête historique sans paramètre `class` continue de viser `s4-e`.

## Rôles

| Rôle | Portée | Autorisations |
|---|---|---|
| Propriétaire | Toutes les turmas | Créer/archiver une turma, gérer ses matières, ses éditeurs et son audit, plus toutes les opérations éditoriales |
| Éditeur/délégué | Une seule turma | Tâches, alertes, activités, groupes, fichiers et dates de sa turma |
| Étudiant | Espace public d'une turma | Lire les publications, rejoindre/quitter un groupe ouvert et conserver son progrès local |

Un jeton éditeur créé pour `s4-e` n'est pas valable pour `s3-a`, même si l'URL ou le corps de requête est modifié.

## Onboarding d'une nouvelle turma

1. Ouvrir `/gestion/s4-e` avec le jeton propriétaire.
2. Dans **Turmas**, créer un slug stable, par exemple `s5-a`, puis indiquer le nom, le semestre, le groupe et éventuellement le Drive.
3. Ouvrir **Configurer maintenant** pour basculer vers `/gestion/s5-a`.
4. Ajouter les matières de la turma.
5. Créer une invitation limitée dans le temps depuis **Accès et audit**.
6. Copier l'invitation et l'envoyer au délégué par un canal privé.
7. Le délégué active son accès puis publie une première tâche, une alerte ou une date.
8. Vérifier le résultat sur `/turma/s5-a` avant de partager le lien aux étudiants.

Aucune donnée pédagogique ou opérationnelle n'est copiée automatiquement d'une turma à l'autre.

## Contrat de données et isolement

- `hub_classes` est le registre central des turmas.
- `hub_subjects` utilise une clé composite `(class_id, id)`.
- Toutes les tables opérationnelles possèdent `class_id NOT NULL DEFAULT 's4-e'`.
- Chaque lecture, mutation, jointure et audit opérationnel filtre par `class_id`.
- Les identifiants créés hors `s4-e` sont préfixés par le slug de la turma afin de préserver les anciennes clés primaires globales sans migration destructive.
- Le classement historique `semester-4-group-e` est rattaché à `s4-e`.
- La réponse publique contient seulement les compteurs d'occupation des groupes. Les noms sont lus uniquement par le snapshot administrateur authentifié.

Le schéma est créé et complété de façon idempotente au premier appel de Function. Les lignes historiques sans `class_id` sont rattachées à `s4-e` ; aucune banque de cours ou de questions n'est réécrite.

## Variables et services Cloudflare

La Function accepte le binding D1 `MED_NYKUTO_DB` (préféré) ou `DB`. Les secrets et options suivants sont lus côté serveur :

- `MED_NYKUTO_OWNER_TOKEN` : jeton propriétaire fort et unique ;
- `MED_NYKUTO_RATE_SALT` : sel pour les clés anonymisées de limitation ;
- `MED_NYKUTO_PUSH_WEBHOOK` et `MED_NYKUTO_PUSH_WEBHOOK_TOKEN` : envoi push optionnel ;
- `MED_NYKUTO_VAPID_PUBLIC_KEY` : clé publique Web Push optionnelle.

Les secrets ne doivent jamais être ajoutés au dépôt. La première ouverture authentifiée initialise le registre et migre le schéma existant.

## Sécurité et confidentialité

- Les pages de turma et de gestion sont `noindex,nofollow`.
- Gestion et API utilisent `no-store`.
- Le service worker ne précache ni API, ni Gestion, ni contenu propre à une turma.
- Le fallback hors ligne est neutre et ne redirige jamais vers un autre semestre.
- Les liens de notification sont limités à l'origine et à `/turma/`.
- Les URL de fichiers administrés acceptent uniquement HTTP(S).
- Les invitations expirent, ne sont affichées qu'une fois et peuvent être révoquées.
- Les mutations sont journalisées par turma dans `hub_audit`.
- Les captures nominatives et les listes d'étudiants ne sont pas publiées dans le DOM étudiant.

## Vérification avant pilote

Exécuter :

```bash
npm run validate
npm run test:e2e
```

Le validateur multiturmas vérifie notamment :

- la présence de `class_id` dans le schéma et les requêtes D1 ;
- le refus d'un éditeur d'une autre turma ;
- le rejet des slugs inconnus ;
- l'absence de noms dans la réponse publique ;
- la compatibilité `s4-e` et la migration du classement historique ;
- l'intégrité binaire des banques de cours et de questions protégées.

Avant d'inviter une classe réelle, effectuer un test avec une turma factice : créer deux tâches portant le même identifiant dans deux turmas, publier des contenus différents, puis confirmer que chaque URL n'affiche que ses propres données.

## Retour arrière et récupération

Le déploiement applicatif est réversible en remettant la branche de sauvegarde pré-déploiement. La migration D1, elle, est additive : les colonnes et tables ne doivent pas être supprimées pendant un rollback.

En cas d'incident :

1. désactiver ou révoquer les invitations/éditeurs concernés ;
2. archiver la turma si elle ne doit plus être visible ;
3. revenir au déploiement applicatif précédent ;
4. conserver D1 intact pour l'audit et la récupération ;
5. restaurer un export D1 seulement après avoir comparé l'heure de sauvegarde et l'audit.

Une fusion en production exige la validation explicite du propriétaire du projet et une branche de sauvegarde de `main` créée juste avant la fusion.

## Limites assumées du pilote

- Pas de comptes étudiants ni de contrôle d'accès par classe côté lecture.
- Pas d'upload direct : les fichiers sont publiés par URL HTTP(S).
- Pas de copie automatique de cours entre professeurs ou semestres.
- Pas de contenu généré automatiquement sans sources identifiées et validation humaine.
- Le push reste optionnel et dépend de la configuration serveur.

Ces limites gardent la première version simple, exploitable par un délégué et honnête sur la confidentialité.
