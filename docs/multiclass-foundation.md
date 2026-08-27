# Fondation multiturmas Med Nykuto

## Objectif du pilote

Cette fondation permet d'ouvrir plusieurs espaces de classe dans une seule application, sans dupliquer le site ni mélanger les données. Le 4.º E historique reste compatible et chaque nouvelle turma obtient son propre slug, ses matières, ses tâches, ses alertes, ses groupes, ses fichiers, ses dates, ses éditeurs et son historique d'audit.

Le pilote est un espace **non indexé et accessible par lien**. Les espaces génériques ne montrent aucune donnée personnelle étudiante. Exception explicite : le défi facultatif du 4.º E publie, après consentement, le nom complet et la catraca complète dans son classement. Une page `noindex` n'est pas privée : toute personne qui possède le lien peut voir ces deux données.

## Routes

| Usage | Route | Accès |
|---|---|---|
| Espace étudiant | `/turma/<slug>` | Lien de la turma, sans compte étudiant |
| Gestion | `/gestion/<slug>` | Jeton propriétaire/historique ou session délégué par courriel et mot de passe |
| Données publiques | `/api/class-hub?class=<slug>&resource=public` | Sans noms d'étudiants |
| Notes publiees | `/api/class-hub?class=<slug>&resource=academic-results` | Revision courante; uniquement catraca, note ou `Ausente`; `noindex` |
| Abonnement calendrier | `/api/class-calendar.ics?class=<slug>` | iCalendar public : uniquement dates et échéances publiées |
| Données de gestion | `/api/class-hub?class=<slug>&resource=admin` | Authentifié et limité à la turma |
| Pièce jointe d'un avis | `/api/class-hub?class=<slug>&resource=notice-attachment&upload=<id>` | Publique seulement si l'avis lié est publié ; brouillons réservés à la gestion authentifiée |
| Registre des turmas | `/api/class-hub?class=<slug>&resource=classes` | Propriétaire uniquement |
| Manifeste PWA | `/api/class-manifest?class=<slug>` | Manifeste propre au slug |
| Défi hebdomadaire 4.º E | `/api/community?class=s4-e` | Classement public par lien ; nom complet et catraca complète consentis, jamais le jeton privé |
| Notes et gabarits 4.º E | `/notas.html` | Page publique par lien et non indexee; recherche locale par catraca |

Une requête historique sans paramètre `class` continue de viser `s4-e`.

## Rôles

| Rôle | Portée | Autorisations |
|---|---|---|
| Propriétaire | Toutes les turmas | Créer/archiver une turma, gérer ses matières, ses éditeurs et son audit, plus toutes les opérations éditoriales |
| Administrateur de contenu | Une seule turma | Droits du délégué, plus brouillons et publications des cours, fiches et entraînements 20/10/10 ; aucun accès à la gestion des classes, comptes, permissions ou audits |
| Éditeur/délégué | Une seule turma | Tâches, avis officiels, activités, groupes, fichiers, dates et son propre profil WhatsApp dans sa turma |
| Étudiant | Espace public d'une turma | Lire les publications, rejoindre/quitter un groupe ouvert et conserver son progrès local |

Une session ou un jeton éditeur créé pour `s4-e` n'est pas valable pour `s3-a`, même si l'URL ou le corps de requête est modifié.

## Onboarding d'une nouvelle turma

1. Ouvrir `/gestion/s4-e` avec le jeton propriétaire.
2. Dans **Turmas**, créer un slug stable, par exemple `s5-a`, puis indiquer le nom, le semestre, le groupe et éventuellement le Drive.
3. Ouvrir **Configurer maintenant** pour basculer vers `/gestion/s5-a`.
4. Ajouter les matières de la turma.
5. Depuis **Accès et audit**, créer un lien privé d'invitation, valable au maximum sept jours.
6. Transmettre uniquement ce lien à la personne déléguée. Elle choisit elle-même son nom, son courriel et son mot de passe permanent ; l'invitation est consommée atomiquement avec la création de sa session.
7. Le délégué entre directement dans `/gestion/s5-a`, puis publie une première tâche, une alerte ou une date. La création manuelle avec mot de passe temporaire reste disponible comme solution de secours.
8. Vérifier le résultat sur `/turma/s5-a` avant de partager le lien aux étudiants.

Aucune donnée pédagogique ou opérationnelle n'est copiée automatiquement d'une turma à l'autre.

## Contrat de données et isolement

- `hub_classes` est le registre central des turmas.
- `hub_subjects` utilise une clé composite `(class_id, id)`.
- `hub_editor_credentials` conserve par turma le courriel normalisé et uniquement le vérificateur PBKDF2 salé du mot de passe.
- `hub_editor_sessions` conserve par turma uniquement les condensats des jetons de session et anti-CSRF, avec expiration et révocation.
- `hub_editor_permissions` accorde de facon additive la capacite `content.manage` a un compte precis et conserve la turma, l'auteur et la date de l'attribution. Les jetons editeur historiques n'en heritent jamais.
- `hub_content_lessons` et `hub_content_revisions` conservent les cours dates propres a une turma, leurs brouillons, revisions et paquets d'entrainement. Seule la revision publiee est exposee sans authentification.
- Toutes les tables opérationnelles possèdent `class_id NOT NULL DEFAULT 's4-e'`.
- Chaque lecture, mutation, jointure et audit opérationnel filtre par `class_id`.
- Les identifiants créés hors `s4-e` sont préfixés par le slug de la turma afin de préserver les anciennes clés primaires globales sans migration destructive.
- Le classement historique `semester-4-group-e` est rattaché à `s4-e`.
- Le défi `s4-e` conserve séparément les résultats historiques et les profils consentis. Les lignes legacy restent visibles avec une identification en attente et sont exclues du prix jusqu'à confirmation ; aucune migration ne supprime leurs scores.
- Le classement du 4.º E additionne d'abord les bonnes réponses. Le meilleur résultat par portée et l'ordre global privilégient les points avant la précision, avec un départage stable.
- Le profil du défi stocke une catraca complète destinée à l'affichage public, une empreinte HMAC pour le rapprochement et uniquement le condensat du jeton d'accès. Une mise à jour d'identité exige le `playerId` et le jeton privés déjà détenus ; un conflit est refusé sans détourner le profil ni ses résultats.
- La réponse publique contient seulement les compteurs d'occupation des groupes. Les noms sont lus uniquement par le snapshot administrateur authentifié.
- `hub_editor_profiles` conserve le WhatsApp normalisé de chaque acteur de gestion. Ce numéro reste absent de la réponse publique et du journal d'audit.
- `hub_notices` accepte toujours une image facultative par URL HTTPS. Il peut aussi référencer une pièce jointe téléversée avec `attachment_upload_id` ; une image raster téléversée peut recevoir `image_alt`, contrairement à un PDF.
- `hub_notices` porte aussi categorie, cycle de vie, audience, dates d'effet/expiration, source, cible, resume de changement, revision et confiance d'analyse. `hub_notice_revisions` conserve chaque instantane remplace avec son auteur.
- `hub_grade_releases`, `hub_grade_revisions` et `hub_grade_entries` conservent les publications de notes, leurs revisions et leurs lignes. Elles sont reservees au proprietaire en ecriture et filtrees par `class_id`; la projection publique n'expose que la catraca et le resultat.
- `hub_uploads` conserve uniquement les métadonnées, la clé objet et l'alerte de confidentialite issue de l'analyse, toujours avec `class_id`. Le contenu binaire reste dans R2 et n'est jamais enregistré dans D1.
- `hub_notices`, `hub_activities` et `hub_dates` possèdent un champ `course` facultatif : le cockpit matière utilise cette liaison explicite et ne déduit pas la matière depuis le titre.
- Le flux iCalendar lit directement, avec `class_id`, les lignes `published` de `hub_dates` et les tâches `published` qui possèdent `due_at`. Ses UID dépendent uniquement de la turma, du type et de l'identifiant stable de la ligne ; modifier un titre ou une date met donc l'événement à jour sans en créer un second.

Le schéma est créé et complété de façon idempotente au premier appel de Function. Les lignes historiques sans `class_id` sont rattachées à `s4-e` ; aucune banque de cours ou de questions n'est réécrite.

## Variables et services Cloudflare

La Function accepte le binding D1 `MED_NYKUTO_DB` (préféré) ou `DB`. Pour les pièces jointes d'avis, elle utilise exclusivement un binding R2 nommé `MED_NYKUTO_UPLOADS`. L'analyse facultative des pieces jointes utilise un binding Workers AI nomme `AI`; son absence ne bloque ni l'edition manuelle ni la publication humaine.

L'abonnement `.ics` utilise le même binding D1 en lecture seule. Sa réponse déterministe est diffusée avec un ETag SHA-256 et un cache public de cinq minutes sans fenêtre prolongée de contenu périmé ; un client qui renvoie `If-None-Match` reçoit `304`. Le fuseau déclaré est `America/Asuncion` et les lignes iCalendar utilisent CRLF, l'échappement texte et le pliage UTF-8 requis par RFC 5545.

Dans Cloudflare Pages, créer un bucket R2 privé, ajouter ce binding séparément aux environnements **Preview** et **Production**, puis redéployer chaque environnement. Le code ne rend jamais le bucket public : la Function vérifie la turma et l'état de l'avis avant de diffuser l'objet. Si le binding manque, le snapshot de gestion renvoie `uploadPolicy.enabled: false` et l'API répond explicitement `upload_storage_unavailable`.

Les secrets et options suivants sont lus côté serveur :

- `MED_NYKUTO_OWNER_TOKEN` : jeton propriétaire fort et unique ;
- `MED_NYKUTO_RATE_SALT` : sel pour les clés anonymisées de limitation ;
- `MED_NYKUTO_PUSH_WEBHOOK` et `MED_NYKUTO_PUSH_WEBHOOK_TOKEN` : envoi push optionnel ;
- `MED_NYKUTO_VAPID_PUBLIC_KEY` : clé publique Web Push optionnelle.
- `MED_NYKUTO_SUPPORT_WHATSAPP` : numéro public au format E.164 qui reçoit les demandes d'ouverture de compte lorsque la turma n'a pas son propre contact configuré.

Les secrets ne doivent jamais être ajoutés au dépôt. La première ouverture authentifiée initialise le registre et migre le schéma existant.

## Sécurité et confidentialité

- Les pages de turma et de gestion sont `noindex,nofollow`.
- Gestion et API utilisent `no-store`.
- Exception volontaire : le flux `.ics` ne contient que le nom public de la turma, les dates publiées et les champs publics des tâches publiées. Il n'expose ni auteur, ni membre, ni profil, ni éditeur et peut donc utiliser un cache public borné avec ETag.
- Le service worker ne précache ni API, ni Gestion, ni contenu propre à une turma.
- Le fallback hors ligne est neutre et ne redirige jamais vers un autre semestre.
- Les liens de notification sont limités à l'origine et à `/turma/`.
- Les URL de fichiers administrés acceptent uniquement HTTP(S).
- Les images d'avis acceptent uniquement une URL HTTPS sans identifiants intégrés. Elles sont chargées avec une politique de référent restrictive et restent facultatives.
- Un téléversement d'avis exige une session propriétaire/délégué valide, l'origine du site, le jeton anti-CSRF et une taille HTTP vérifiable. Il accepte un seul PDF ou une seule image raster (JPEG, PNG, WEBP, GIF, HEIC/HEIF ou AVIF), avec contrôle de la signature binaire et une limite de 15 Mio.
- Les identifiants et clés R2 sont produits par Web Crypto et ne contiennent jamais le nom du fichier. Le nom nettoyé, le type, la taille, l'ETag et l'eventuelle alerte de confidentialite sont les seules métadonnées conservées dans D1.
- Une pièce jointe liée à un brouillon reste inaccessible au public. Un upload encore `staged` ne peut etre utilise que par son auteur. La lecture publique devient possible seulement lorsque l'upload est `linked` et qu'un avis de la même turma est `published`. Le titre et le nom de telechargement publics ne reprennent jamais le nom original. Les réponses sont diffusées en flux, prennent en charge une plage d'octets unique et utilisent `no-store`, `nosniff`, une politique same-origin et une CSP restrictive.
- Chaque turma est limitée atomiquement à 20 téléversements `staged` ou en cours de suppression. Les fichiers non référencés expirent après 24 heures. Un détachement ou une expiration marque d'abord la ligne `deleting` avec une garde `class_id` et `NOT EXISTS`, puis supprime R2 avant les métadonnées D1 ; un échec R2 remet la ligne en `staged` pour permettre une nouvelle tentative sans course avec une publication.
- Le WhatsApp du délégué est normalisé au format E.164 et réservé au snapshot authentifié. « Format vérifié » ne signifie pas que la propriété du numéro a été confirmée par SMS ou par WhatsApp.
- Les invitations expirent, ne sont affichées qu'une fois et peuvent être révoquées. Leur secret reste dans un fragment URL supprimé immédiatement et la création du compte, de son identifiant de connexion et de la session est transactionnelle.
- Les mots de passe utilisent PBKDF2-HMAC-SHA-256 avec un sel aléatoire propre à chaque compte ; aucune valeur en clair n'est stockée ou renvoyée.
- Le mot de passe temporaire expire et doit être changé avant tout accès aux données de gestion.
- La session de huit heures repose sur un cookie `Secure`, `HttpOnly`, `SameSite=Strict` et un contrôle anti-CSRF séparé pour les mutations.
- Un changement/réinitialisation de mot de passe ou la révocation d'un éditeur invalide ses sessions précédentes.
- Les mutations sont journalisées par turma dans `hub_audit`.
- Les mutations de contenu exigent soit le proprietaire, soit une session courrier/mot de passe portant `content.manage`. Un role inconnu, un jeton editeur historique ou un profil `localStorage` echoue par defaut.
- Une analyse IA exige une session de gestion, l'anti-CSRF, une piece jointe R2 autorisee et une limite de debit. Le document est traite comme non fiable; la sortie reste une proposition de brouillon et ses avertissements ne recopient jamais les donnees personnelles detectees. Une alerte de confidentialite devient durable pour cet upload et impose une seconde confirmation avant publication; une nouvelle analyse ne peut pas la remettre a zero.
- Les mutations de notes sont reservees au proprietaire. Le serveur applique une liste blanche stricte, n'accepte qu'une catraca numerique de 4 a 24 chiffres, refuse les champs de nom, CPF, CI/RG, telephone ou courrier, exige une confirmation de confidentialite et un controle de revision avant publication. La page publique utilise `no-store`, `noindex,nofollow` et `no-referrer`; cela evite l'indexation mais ne rend pas le lien prive.
- La publication d'un cours est refusee sans les trois formats de contenu et sans exactement 20 QCM, 10 vrai/faux et 10 cas cliniques valides. La revision et son instantane sont ecrits atomiquement, avec controle de concurrence optimiste.
- Les espaces génériques des autres turmas ne publient pas de liste nominative dans le DOM étudiant. Exception explicitement validée pour le tableau officiel du 4.º E : lorsqu'une activité est publiée, son tableau peut exposer uniquement le nom d'affichage et le marqueur de responsable. Les identifiants de ligne, empreintes d'appareil, dates et métadonnées administratives restent privés.
- Exception distincte pour le défi hebdomadaire facultatif du 4.º E : après une attestation d'appartenance et un consentement explicite, le classement expose le nom complet et la catraca complète à toute personne ayant le lien. Le jeton d'accès, son condensat, l'empreinte HMAC et le `playerId` restent privés. Les profils en attente sont provisoires et le Pix de **50 R$** n'est versé qu'après validation manuelle de l'identité, de l'appartenance au 4.º E et du résultat.

## Vérification avant pilote

Exécuter :

```bash
npm run validate
npm run test:e2e
```

Le validateur multiturmas vérifie notamment :

- la présence de `class_id` dans le schéma et les requêtes D1 ;
- l'isolation de `hub_uploads`, le binding R2 direct, les types/taille/signatures, la liaison à un avis publié et les en-têtes sûrs ;
- le texte alternatif des images téléversées, le refus pour un PDF sans image, le quota `staged`, le TTL, le marquage atomique `deleting` et la reprise après un échec R2 ;
- l'isolation tenant de `hub_editor_credentials` et `hub_editor_sessions` ;
- le refus d'un éditeur d'une autre turma ;
- la présence du helper PBKDF2, des cookies sécurisés, de l'anti-CSRF et du changement obligatoire ;
- le contrat HTML/JavaScript `v472` pour connexion, session, changement et création/réinitialisation de compte, sans identifiants réels dans les sources ;
- le rejet des slugs inconnus ;
- l'absence de noms dans la réponse publique ;
- la compatibilité `s4-e` et la migration du classement historique ;
- l'intégrité binaire des banques de cours et de questions protégées.
- le filtrage D1 public du calendrier, les UID stables, le fuseau paraguayen, CRLF, l'échappement, le pliage à 75 octets, le cache/ETag et la réponse `304`.

Avant d'inviter une classe réelle, effectuer un test avec une turma factice : créer deux tâches portant le même identifiant dans deux turmas, publier des contenus différents, puis confirmer que chaque URL n'affiche que ses propres données.

## Retour arrière et récupération

Le déploiement applicatif est réversible en remettant la branche de sauvegarde pré-déploiement. La migration D1, elle, est additive : les colonnes et tables ne doivent pas être supprimées pendant un rollback.

En cas d'incident :

1. désactiver ou révoquer les invitations/éditeurs concernés et leurs sessions ;
2. archiver la turma si elle ne doit plus être visible ;
3. revenir au déploiement applicatif précédent ;
4. conserver D1 intact pour l'audit et la récupération ;
5. restaurer un export D1 seulement après avoir comparé l'heure de sauvegarde et l'audit.

Une fusion en production exige la validation explicite du propriétaire du projet et une branche de sauvegarde de `main` créée juste avant la fusion.

## Limites assumées du pilote

- Pas de comptes étudiants ni de contrôle d'accès par classe côté lecture.
- L'URL d'abonnement calendrier est publique comme l'espace étudiant : ne jamais publier dans une date ou une tâche un détail destiné à rester privé.
- Le lien du classement 4.º E est public : le consentement est obligatoire pour y publier le nom complet et la catraca complète, mais ne remplace pas une authentification. La participation et le Pix restent facultatifs, provisoires et soumis à une vérification humaine.
- Les pièces jointes directes sont limitées aux avis officiels et à 15 Mio ; les autres archives continuent d'utiliser une URL HTTP(S) ou le Drive de la turma.
- L'envoi vers WhatsApp ouvre un message prérempli : le navigateur ne l'envoie jamais automatiquement et ne joint pas un PDF sans action de l'utilisateur.
- Pas de copie automatique de cours entre professeurs ou semestres.
- Pas de contenu généré automatiquement sans sources identifiées et validation humaine.
- L'IA ne publie jamais un avis et ne garantit pas l'exactitude de sa proposition; le proprietaire ou le delegue doit verifier le document, les dates, la source et toute alerte de confidentialite.
- La page de notes est volontairement publique par lien conformement a la decision du proprietaire du 4.º E. Elle n'est pas un portail authentifie et ne doit donc jamais accueillir d'autres donnees etudiantes.
- Le push reste optionnel et dépend de la configuration serveur.

Ces limites gardent la première version simple, exploitable par un délégué et honnête sur la confidentialité.
