# Gestion dynamique de Med Nykuto

## Capacites

Le shell protege `gestion-shell/index.html`, publie sous `/gestion/:slug`, permet de publier sans redesploiement les taches, alertes, activites de groupe, fichiers et dates. Les contenus publies apparaissent dans `clase.html` et `archivos.html` par l'intermediaire de `functions/api/class-hub.js`.

- Le proprietaire peut creer ou revoquer des invitations, creer un compte de delegue, reinitialiser sa connexion, revoquer un editeur, consulter le journal d'audit et publier des notes. Il peut aussi accorder separement la capacite `invite.manage` a un compte precis pour lui permettre uniquement de generer, consulter et revoquer les invitations de sa turma.
- Un editeur peut gerer les taches, avis officiels, groupes, fichiers, dates et son propre profil WhatsApp. Les cours, questions, profils enseignants, permissions et parametres restent bloques cote serveur.
- Le proprietaire peut accorder a un compte par courrier la capacite complementaire `content.manage`. L'interface l'affiche alors comme **Administrateur de contenu**, mais le compte reste limite a une seule turma et ne recoit aucun droit de proprietaire sur les classes, comptes, permissions ou audits.
- La capacite `invite.manage` ouvre l'onglet **Accesos** et son generateur de liens, sans montrer la creation manuelle de comptes, la liste des editeurs ni l'audit. Elle ne s'applique jamais aux autres delegues par defaut.
- Les etats disponibles sont `draft`, `published` et `archived`.
- Les invitations sont des liens prives a usage unique, limites dans le temps et revocables. La personne invitee choisit elle-meme son nom, son courrier et son mot de passe permanent.
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

Chaque avis peut porter une categorie, un cycle de vie, une audience, une date de prise d'effet, une expiration, une source HTTPS et une cible (`task`, `file`, `date` ou `subject`). Les cycles disponibles sont `active`, `scheduled`, `updated`, `extended`, `corrected`, `replaced`, `cancelled` et `expired`. Une modification exige la revision courante et conserve l'instantane precedent dans `hub_notice_revisions`; une correction met donc a jour la fiche existante sans effacer son historique. L'accueil ne reprend que les avis publies `important` ou `urgent` encore actifs. La liste complete conserve les autres cycles visibles et filtrables afin d'expliquer les corrections et remplacements.

Le bouton **Analizar con IA** travaille uniquement sur une image ou un PDF deja televerse dans le R2 prive. La Function convertit la piece jointe, traite son texte comme une source non fiable et demande a Workers AI une proposition structuree : titre, resume, matiere, priorite, categorie, cycle, audience, dates, source, cible et confiance. Le resultat remplit le formulaire en brouillon et affiche des avertissements generiques de donnees personnelles. Il ne sauvegarde ni ne publie rien. Une confirmation humaine est obligatoire pour tout avis publie; lorsqu'une donnee personnelle a ete detectee, l'upload conserve cette alerte et une seconde confirmation de confidentialite devient obligatoire. Une nouvelle analyse ne peut pas effacer une alerte precedente. Sans binding Workers AI `AI`, l'interface reste utilisable et explique que l'analyse assistee n'est pas configuree.

Une image distante reste facultative : le delegue peut fournir une URL HTTPS publique et un texte alternatif. Il peut aussi choisir directement sur son telephone une image raster ou un PDF de 15 Mio maximum. Une image raster televersee peut porter ce meme texte alternatif ; un PDF ne compte jamais comme image et ne peut donc pas justifier seul un texte alternatif. Le fichier binaire est conserve dans le bucket R2 prive `MED_NYKUTO_UPLOADS`; D1 ne garde que les metadonnees et la liaison vers l'avis. Un upload encore `staged` appartient a son auteur et ne peut pas etre lie par un autre delegue. Un brouillon reste reserve a la gestion authentifiee et la piece jointe ne devient publique que lorsque l'avis de la meme turma est publie. Le nom original reste visible en gestion, mais le public recoit toujours un titre et un nom de telechargement generiques si aucun titre neutre n'a ete fourni. Les avis normaux restent dans la liste complete afin de ne pas surcharger l'accueil. Les liens profonds utilisent `/turma/<slug>#avisos`.

Le contrat navigateur est volontairement en deux etapes :

1. envoyer un `FormData` par `POST /api/class-hub?class=<slug>&action=notice.attachment.upload`, avec un unique champ fichier nomme `file` ;
2. reutiliser `attachment.uploadId` de la reponse dans la mutation JSON `notice.upsert`, sous le champ `attachmentUploadId` et, facultativement, `attachmentTitle`.

Le televersement repond `201` avec `attachment.{uploadId,originalName,title,mimeType,sizeBytes,attachmentUrl}`. Les snapshots public et administrateur exposent ensuite `attachmentUploadId`, `attachmentUrl`, `attachmentTitle`, `attachmentMimeType` et `attachmentSizeBytes`. Le snapshot administrateur contient aussi `uploadPolicy.{enabled,maxBytes,maxStagedUploads,stagedTtlHours,acceptedMimeTypes}` afin que l'interface puisse desactiver clairement le selecteur si le binding R2 manque et expliquer les limites.

Chaque turma peut conserver au maximum 20 televersements encore en attente. Une reservation D1 atomique refuse le 21e avant toute ecriture R2. Un fichier reste en attente au maximum 24 heures s'il n'est relie a aucun avis. Envoyer `attachmentUploadId: null` detache l'ancien fichier ; s'il n'est reference par aucun autre avis de la meme turma, la Function le marque d'abord `deleting`, supprime l'objet R2, puis retire ses metadonnees. Si R2 refuse la suppression, le statut revient a `staged` afin qu'un prochain nettoyage puisse reessayer. Le meme cycle borne recupere les televersements abandonnes et les rares metadonnees orphelines apres une interruption de requete.

## Notes et gabarits publics

La page non indexee `/notas.html` lit exclusivement `GET /api/class-hub?class=s4-e&resource=academic-results`. Elle affiche la revision publiee courante de chaque evaluation, classee par matiere, avec son gabarit et une recherche locale par catraca. La recherche n'ecrit ni l'identifiant dans l'URL, ni dans un stockage navigateur, ni dans un service d'analyse.

Le proprietaire importe au maximum 500 lignes de deux colonnes : `catraca` et `nota` ou `Ausente`. La catraca doit contenir exactement 4 a 24 chiffres; ses zeros initiaux sont conserves. Le serveur accepte exactement `{studentId,grade}` ou `{studentId,absent:true}` et rejette les champs ou en-tetes de nom, CPF, CI/RG, telephone et courrier. L'enregistrement cree une revision brouillon. La publication est une action separee qui exige la revision encore courante et `privacyConfirmed:true`; elle remplace la revision publique precedente sans creer deux resultats concurrents. L'archivage retire toute revision de la lecture publique. Les tables D1 `hub_grade_releases`, `hub_grade_revisions` et `hub_grade_entries` sont toutes isolees par `class_id`.

## Synchronisation des fichiers Drive du 4.º E

Le catalogue public `data/drive-files.json` relie les documents du dossier S4 a leur matiere dans **Materia** et **Archivos**. L'identifiant Google Drive est l'identite stable : un renommage ou un deplacement modifie la meme entree. Seuls les fichiers verifies comme lisibles par un visiteur anonyme sont admis; la synchronisation ne change jamais leurs permissions. Une disparition constatee une premiere fois marque `missingSince`, puis une seconde analyse recursive complete ajoute `removedAt`; le navigateur masque alors le fichier et bloque aussi son doublon eventuel venu de l'API.

La tache horaire compare les donnees semantiques et n'ecrit sur `main` que lors d'un ajout, renommage, deplacement, retrait confirme ou retour reel. `scannedAt`, l'ordre des lignes et une analyse incomplete ne doivent jamais provoquer un commit ni une suppression. Les fichiers prives, caches ou contenant des notes ne sont pas publies par ce flux.

## Profil WhatsApp et demande d'acces

Le delegue peut enregistrer son numero avec l'indicatif du pays, par exemple `+595…`, dans **Mon profil**. Le serveur retire les espaces et separateurs, puis exige le format E.164. La mention « format verifie » confirme seulement la structure du numero, pas son appartenance : une verification par code demanderait une integration WhatsApp Business distincte.

Le numero du delegue n'est jamais renvoye par l'API publique. Il sert uniquement, apres authentification, a ouvrir un message pre-rempli contenant les groupes de l'activite choisie. Le delegue confirme lui-meme l'envoi dans WhatsApp.

Sur la connexion, un futur delegue peut demander l'ouverture de son compte. Le contact vient de la turma ou de `MED_NYKUTO_SUPPORT_WHATSAPP`; s'il n'est pas encore configure, l'interface utilise `contact@nykuto.com` au lieu d'inventer un numero.

## Connexion delegue v488

La version `v490` charge `gestion-v440.css?v=488` et `gestion-v440.js?v=490`. Elle conserve l'acces par courrier et mot de passe, le cockpit compact par matiere, les avis officiels avec piece jointe, le profil WhatsApp prive et les exports de groupes lies a chaque activite. Sur mobile, un seul panneau de gestion reste visible a la fois, les formulaires occasionnels sont replies et l'activite recente est limitee a cinq lignes avant expansion. Elle garde aussi une identite proprietaire globale clairement marquee et protegee contre l'auto-revocation, ainsi que la capacite isolee de gestion des invitations pour les delegues autorises.

1. Le proprietaire cree le compte dans **Acces et audit** avec un nom, un courrier et un mot de passe temporaire.
2. Le courrier est normalise cote serveur et le mot de passe est derive avec PBKDF2-HMAC-SHA-256, un sel aleatoire propre au compte et 100 000 iterations, calibre pour le budget CPU des Pages Functions. Le mot de passe en clair n'est jamais enregistre.
3. Le delegue se connecte sur `/gestion/<slug>`. Une session de huit heures est creee avec un jeton aleatoire dont seul le condensat est stocke dans D1.
4. Le cookie de session utilise `Secure`, `HttpOnly` et `SameSite=Strict`. Un second cookie lisible par l'interface fournit la valeur anti-CSRF, renvoyee dans l'en-tete `x-csrf-token` pour chaque mutation de session.
5. Une connexion par mot de passe temporaire ouvre uniquement l'ecran de changement obligatoire. La gestion reste bloquee jusqu'au choix d'une phrase de mot de passe d'au moins douze caracteres, suffisamment variee et non exclusivement numerique.
6. Chaque connexion par courrier cree une session independante : ouvrir le meme compte sur un telephone ne remplace ni ne deconnecte la session de la tablette. Une deconnexion revoque uniquement la session du dispositif qui l'envoie.
7. Le changement ou la reinitialisation du mot de passe revoque toutes les sessions precedentes. La revocation du delegue revoque egalement toutes ses sessions actives.

Le lien d'invitation porte son secret dans le fragment `#invite=`, qui n'est pas transmis au serveur lors du chargement. L'interface le retire immediatement de l'URL, ne l'enregistre ni dans le DOM ni dans le stockage du navigateur, puis cree atomiquement le compte, son identifiant de connexion et sa premiere session. Le lien devient inutilisable apres cette activation ; le delegue peut ensuite se connecter sur plusieurs appareils avec le courrier et le mot de passe qu'il a choisis.

Deux tables D1 tenant completees par `class_id` portent ce flux :

- `hub_editor_credentials` : courrier normalise, derive, sel, version et obligation de changement ;
- `hub_editor_sessions` : condensats de session/CSRF, expiration et revocation.

Une table singleton distincte, `hub_site_owner_account`, peut relier exactement un de ces comptes a l'administration globale de Med Nykuto. Le mot de passe n'est pas duplique : la session conserve la classe canonique de la credencial et le serveur projette ensuite le role `owner` dans la classe demandee. Une promotion invalide les anciennes sessions et exige une nouvelle connexion. Les comptes delegues et leurs anciens Bearer restent limites a leur classe.

Les anciennes lignes `hub_editors` et leurs tokens restent compatibles pendant la transition. Les reponses de l'API ne renvoient jamais le derive, le sel, le jeton de session ou le mot de passe.

## Activation sur Cloudflare Pages

1. Dans le projet Pages, lier une base D1 sous le nom `MED_NYKUTO_DB`. La liaison existante `DB` reste compatible.
2. Creer un bucket R2 prive et lier celui-ci sous le nom exact `MED_NYKUTO_UPLOADS`, dans Preview puis dans Production. Redeployer apres chaque ajout de binding.
3. Pour **Analizar con IA**, ajouter un binding Workers AI nomme exactement `AI` dans Preview et Production. Ce binding n'est pas un secret; les quotas et couts Workers AI du compte restent applicables.
4. Ajouter un secret de production `MED_NYKUTO_OWNER_TOKEN` long, aleatoire et reserve au proprietaire.
5. Ajouter de preference un second secret aleatoire `MED_NYKUTO_RATE_SALT` pour isoler les empreintes utilisees par la limitation d'abus.
6. Utiliser des secrets, une base D1 et si possible un bucket R2 distincts pour les environnements preview et production afin qu'un test ne modifie pas les comptes ou fichiers reels.
7. Redeployer. Les tables, index, deux taches actives, les alertes initiales, les emplacements de groupes vides et les tables d'authentification/metadonnees R2 sont crees automatiquement a la premiere requete.
8. Ouvrir `/gestion/s4-e`, entrer le token proprietaire, puis creer un compte de delegue avec un mot de passe temporaire.
9. Pour un administrateur de contenu, confirmer exactement son courrier dans la liste des comptes puis activer **Cursos y preguntas**. Ne jamais inscrire un courrier personnel dans le code ou dans une variable publique du navigateur.
10. La designation du proprietaire global n'est pas disponible dans l'interface : elle doit etre effectuee une seule fois comme operation d'infrastructure, par identifiant interne et apres verification du courrier, puis suivie d'une nouvelle connexion sur chaque appareil.

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
4. Ouvrir deux sessions factices du meme compte, verifier que leurs jetons et anti-CSRF sont distincts, puis confirmer que la deconnexion de l'une laisse l'autre active. Verifier aussi qu'une session de `s4-e` ne lit ni ne modifie `s3-a` et que les mutations sans en-tete anti-CSRF sont refusees.
5. Creer une tache brouillon, la publier, puis verifier son apparition sans nouveau deploiement.
6. Rejoindre un groupe depuis `clase.html`, verifier qu'une seconde inscription a la meme activite est refusee, puis congeler l'activite et verifier que les ajouts, retraits et deplacements sont bloques.
7. Televerser un PDF factice dans un avis brouillon, verifier qu'il est illisible sans session, publier l'avis, puis verifier son ouverture sur telephone et son affichage dans la bonne turma uniquement.
8. Avec un compte factice portant `content.manage`, enregistrer un cours en brouillon, verifier son absence de la reponse publique, publier un paquet 20/10/10 puis verifier son apparition dans **Materia** et **Entrenamiento**. Revoquer ensuite la capacite et confirmer que la mutation est refusee.
9. Televerser un document factice, lancer l'analyse assistee et verifier que la proposition reste dans le formulaire, que les avertissements ne recopient aucune donnee personnelle et qu'aucune publication n'a lieu sans confirmation humaine.
10. Importer une petite liste fictive `catraca,nota`, verifier le brouillon masque, publier apres confirmation de confidentialite, puis confirmer que `/notas.html` expose uniquement catraca, note ou `Ausente`. Publier une seconde revision et verifier qu'elle remplace la premiere.
