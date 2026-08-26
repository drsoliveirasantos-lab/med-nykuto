# Gestion dynamique de Med Nykuto

## Capacites

Le shell protege `gestion-shell/index.html`, publie sous `/gestion/:slug`, permet de publier sans redesploiement les taches, alertes, activites de groupe, fichiers et dates. Les contenus publies apparaissent dans `clase.html` et `archivos.html` par l'intermediaire de `functions/api/class-hub.js`.

- Le proprietaire est le seul role autorise a creer ou revoquer des invitations, creer un compte de delegue, reinitialiser sa connexion, revoquer un editeur et consulter le journal d'audit.
- Un editeur peut gerer les taches, avis officiels, groupes, fichiers, dates et son propre profil WhatsApp. Les cours, questions, profils enseignants, permissions et parametres restent bloques cote serveur.
- Le proprietaire peut accorder a un compte par courrier la capacite complementaire `content.manage`. L'interface l'affiche alors comme **Administrateur de contenu**, mais le compte reste limite a une seule turma et ne recoit aucun droit de proprietaire sur les classes, comptes, permissions ou audits.
- Les etats disponibles sont `draft`, `published` et `archived`.
- Les invitations sont a usage unique, limitees dans le temps et revocables.
- Les groupes imposent cote serveur une seule inscription par activite, la capacite du groupe et de l'activite, ainsi qu'une composition finale apres fermeture ou congelation.
- Les tentatives de connexion sont limitees a la fois par adresse reseau pseudonymisee et par empreinte du courrier normalise. Les inscriptions, activations d'invitation et abonnements push conservent leurs limites propres.
- Le courrier du delegue sert uniquement a son compte de gestion et reste limite a sa turma. Aucun courrier ni compte permanent n'est demande aux etudiants.
- La cle aleatoire d'un etudiant et les jetons de session de gestion ne sont conserves sur le serveur que sous forme de condensat SHA-256.
- Chaque export de groupes reste rattache a une seule activite : copie texte, ouverture du message dans le WhatsApp du delegue et impression PDF. Aucun export ne melange plusieurs activites.

Sur telephone, les outils restent dans une barre horizontale compacte. **Calendrier** et **Fichiers** sont deux espaces distincts, et les formulaires essentiels utilisent une fiche a deux colonnes lorsque la largeur le permet. La vue **Matieres** est un cockpit operationnel : elle regroupe les taches, avis, activites, groupes, fichiers et dates relies explicitement a chaque matiere, avec modification directe. Elle n'accorde aucun droit sur les cours, modules ou banques de questions.

## Cours et entrainements geres depuis la turma

La capacite `content.manage` ouvre un espace **Contenido** distinct de la logistique du delegue. Pour une matiere et une date donnees, l'administrateur de contenu peut coller le cours complet, la fiche rapide, la fiche ultra rapide et un paquet JSON de questions, puis enregistrer un brouillon ou publier. Le paquet publie contient exactement 20 QCM, 10 vrai/faux et 10 cas cliniques. Le serveur controle les options, les reponses, les doublons, les longueurs et l'isolation de la turma avant toute publication.

Les contenus de turma sont conserves dans D1 sans modifier la bibliotheque canonique de 59 modules sous `content/courses/**`. Deux tables additives portent ce flux :

- `hub_content_lessons` conserve la revision courante, son etat, sa matiere, sa date et le paquet normalise ;
- `hub_content_revisions` conserve les revisions precedentes avec leur auteur et leur horodatage.

Chaque question recoit un identifiant stable et une revision. Une modification du cours qui ne change pas les questions conserve donc le progres d'entrainement ; une question reellement remplacee ne reutilise pas silencieusement une ancienne reponse locale. Les brouillons et contenus archives ne sont jamais inclus dans la reponse publique.

L'autorisation est derivee exclusivement de la session D1. Le profil local de `compte.html`, une adresse comparee dans le navigateur et les anciens jetons d'editeur ne peuvent pas obtenir cette capacite. L'attribution et la revocation sont reservees au proprietaire et journalisees.

Format minimal accepte dans la zone d'entrainement :

```json
{
  "qcm": [{"prompt":"¿Pregunta?","options":["A","B","C","D"],"answer":1,"explanation":"Justificacion."}],
  "trueFalse": [{"prompt":"Afirmacion.","answer":true,"explanation":"Justificacion."}],
  "clinicalCases": [{"scenario":"Paciente...","prompt":"¿Conducta?","options":["A","B","C","D"],"answer":2,"explanation":"Justificacion."}]
}
```

L'interface accepte aussi les alias `vf` et `cases`, puis affiche les trois compteurs avant l'enregistrement. Le texte Markdown est rendu par creation de noeuds DOM et non par injection de HTML brut.

## Avis officiels

Un avis publie apparait dans la vue **Avisos** de la turma. Les avis `important` et `urgent` peuvent aussi occuper le cadre compact de l'accueil, un seul a la fois. Avec plusieurs avis mis en avant, le cadre change environ toutes les six secondes et propose toujours des commandes precedent, suivant et pause. Le mouvement automatique est desactive si le navigateur demande une reduction des animations.

Une image distante reste facultative : le delegue peut fournir une URL HTTPS publique et un texte alternatif. Il peut aussi choisir directement sur son telephone une image raster ou un PDF de 15 Mio maximum. Une image raster televersee peut porter ce meme texte alternatif ; un PDF ne compte jamais comme image et ne peut donc pas justifier seul un texte alternatif. Le fichier binaire est conserve dans le bucket R2 prive `MED_NYKUTO_UPLOADS`; D1 ne garde que les metadonnees et la liaison vers l'avis. Un brouillon reste reserve a la gestion authentifiee et la piece jointe ne devient publique que lorsque l'avis de la meme turma est publie. Les avis normaux restent dans la liste complete afin de ne pas surcharger l'accueil. Les liens profonds utilisent `/turma/<slug>#avisos`.

Le contrat navigateur est volontairement en deux etapes :

1. envoyer un `FormData` par `POST /api/class-hub?class=<slug>&action=notice.attachment.upload`, avec un unique champ fichier nomme `file` ;
2. reutiliser `attachment.uploadId` de la reponse dans la mutation JSON `notice.upsert`, sous le champ `attachmentUploadId` et, facultativement, `attachmentTitle`.

Le televersement repond `201` avec `attachment.{uploadId,originalName,title,mimeType,sizeBytes,attachmentUrl}`. Les snapshots public et administrateur exposent ensuite `attachmentUploadId`, `attachmentUrl`, `attachmentTitle`, `attachmentMimeType` et `attachmentSizeBytes`. Le snapshot administrateur contient aussi `uploadPolicy.{enabled,maxBytes,maxStagedUploads,stagedTtlHours,acceptedMimeTypes}` afin que l'interface puisse desactiver clairement le selecteur si le binding R2 manque et expliquer les limites.

Chaque turma peut conserver au maximum 20 televersements encore en attente. Une reservation D1 atomique refuse le 21e avant toute ecriture R2. Un fichier reste en attente au maximum 24 heures s'il n'est relie a aucun avis. Envoyer `attachmentUploadId: null` detache l'ancien fichier ; s'il n'est reference par aucun autre avis de la meme turma, la Function le marque d'abord `deleting`, supprime l'objet R2, puis retire ses metadonnees. Si R2 refuse la suppression, le statut revient a `staged` afin qu'un prochain nettoyage puisse reessayer. Le meme cycle borne recupere les televersements abandonnes et les rares metadonnees orphelines apres une interruption de requete.

## Profil WhatsApp et demande d'acces

Le delegue peut enregistrer son numero avec l'indicatif du pays, par exemple `+595…`, dans **Mon profil**. Le serveur retire les espaces et separateurs, puis exige le format E.164. La mention « format verifie » confirme seulement la structure du numero, pas son appartenance : une verification par code demanderait une integration WhatsApp Business distincte.

Le numero du delegue n'est jamais renvoye par l'API publique. Il sert uniquement, apres authentification, a ouvrir un message pre-rempli contenant les groupes de l'activite choisie. Le delegue confirme lui-meme l'envoi dans WhatsApp.

Sur la connexion, un futur delegue peut demander l'ouverture de son compte. Le contact vient de la turma ou de `MED_NYKUTO_SUPPORT_WHATSAPP`; s'il n'est pas encore configure, l'interface utilise `contact@nykuto.com` au lieu d'inventer un numero.

## Connexion delegue v476

La version `v476` charge `gestion-v440.css?v=476` et `gestion-v440.js?v=476`. Elle conserve l'acces par courrier et mot de passe, puis ajoute le cockpit compact par matiere, les avis officiels avec piece jointe, le profil WhatsApp prive et les exports de groupes lies a chaque activite.

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
2. Creer un bucket R2 prive et lier celui-ci sous le nom exact `MED_NYKUTO_UPLOADS`, dans Preview puis dans Production. Redeployer apres chaque ajout de binding.
3. Ajouter un secret de production `MED_NYKUTO_OWNER_TOKEN` long, aleatoire et reserve au proprietaire.
4. Ajouter de preference un second secret aleatoire `MED_NYKUTO_RATE_SALT` pour isoler les empreintes utilisees par la limitation d'abus.
5. Utiliser des secrets, une base D1 et si possible un bucket R2 distincts pour les environnements preview et production afin qu'un test ne modifie pas les comptes ou fichiers reels.
6. Redeployer. Les tables, index, deux taches actives, les alertes initiales, les emplacements de groupes vides et les tables d'authentification/metadonnees R2 sont crees automatiquement a la premiere requete.
7. Ouvrir `/gestion/s4-e`, entrer le token proprietaire, puis creer un compte de delegue avec un mot de passe temporaire.
8. Pour un administrateur de contenu, confirmer exactement son courrier dans la liste des comptes puis activer **Cursos y preguntas**. Ne jamais inscrire un courrier personnel dans le code ou dans une variable publique du navigateur.

Sans D1, la page publique conserve ses donnees statiques de secours. La gestion protegee et les inscriptions de groupe restent volontairement indisponibles.

## Notifications push facultatives

Les alertes normales restent dans la campana du site. Les alertes importantes et urgentes peuvent en plus utiliser un service push externe.

- `MED_NYKUTO_VAPID_PUBLIC_KEY` : cle publique VAPID exposee au navigateur.
- `MED_NYKUTO_PUSH_WEBHOOK` : URL HTTPS du relais charge de signer et d'envoyer les messages Web Push.
- `MED_NYKUTO_PUSH_WEBHOOK_TOKEN` : secret Bearer facultatif du relais.

Une alerte urgente reste visible dans le cadre d'accueil et dans la vue complete des avis meme si aucun relais push n'est configure.

## Verification rapide

1. `GET /api/class-hub?resource=public` doit repondre avec `ok: true`.
2. Avec `Authorization: Bearer <MED_NYKUTO_OWNER_TOKEN>`, `GET /api/class-hub?resource=admin` doit retourner l'acteur `owner`.
3. Avec des donnees factices en preview, creer un compte de delegue, verifier la connexion, le blocage avant changement de mot de passe et le renouvellement de session apres changement.
4. Verifier qu'une session de `s4-e` ne lit ni ne modifie `s3-a`, que les mutations sans en-tete anti-CSRF sont refusees et que la deconnexion revoque la session.
5. Creer une tache brouillon, la publier, puis verifier son apparition sans nouveau deploiement.
6. Rejoindre un groupe depuis `clase.html`, verifier qu'une seconde inscription a la meme activite est refusee, puis congeler l'activite et verifier que les ajouts, retraits et deplacements sont bloques.
7. Televerser un PDF factice dans un avis brouillon, verifier qu'il est illisible sans session, publier l'avis, puis verifier son ouverture sur telephone et son affichage dans la bonne turma uniquement.
8. Avec un compte factice portant `content.manage`, enregistrer un cours en brouillon, verifier son absence de la reponse publique, publier un paquet 20/10/10 puis verifier son apparition dans **Materia** et **Entrenamiento**. Revoquer ensuite la capacite et confirmer que la mutation est refusee.
