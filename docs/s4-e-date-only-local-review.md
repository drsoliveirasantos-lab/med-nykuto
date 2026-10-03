# S4-E — revue locale des dates sans heure

Révision 3 : corrections de revue et conservation des snapshots des autres classes,
toujours locales. Aucune publication effectuée.

Base inspectée : `main` à `cf9cfd47bd4730d6dbebf59f7f74289c3eca8add`.
Branche locale : `codex/s4-e-date-only-local`.

## Inspection

Consignes lues : `SOURCE_OF_TRUTH.md`, `AGENTS.md`,
`.github/copilot-instructions.md`, `docs/site-architecture.md`,
`docs/multiclass-foundation.md` et les deux standards typographiques.
Aucun autre `AGENTS.md` ni dossier `.agents/skills` présent dans ce checkout.
Les consignes historiques divergent sur main/preview ; la demande explicite
de branche locale sans publication prévaut pour ce travail.

Le site utilise des shells publics et de gestion et des Functions Cloudflare
adossées à D1, avec filtrage par classe. Le carnet S4 reste distinct des cours
et banques protégés. Les trois fichiers JavaScript modifiés sont les runtimes
autonomes de ces interfaces, pas des sorties du bundle applicatif.

## Ce qui existait déjà

- `task.upsert` et `date.upsert` conservent une chaîne `YYYY-MM-DD` dans
  `due_at` / `starts_at`, sans conversion en instant. La projection publique
  conserve ces chaînes. Leur validation serveur reste permissive.
- `functions/api/class-calendar.ics.js` valide les dates civiles et produit
  `DTSTART;VALUE=DATE:YYYYMMDD`. L'événement n'a ni heure ni TZID ; le TZID
  global du calendrier concerne les événements horaires existants.
- Les avis disposent de `sourceLabel`, `sourceUrl`, `linkedTaskId` et
  `targetType` / `targetId`. Les sources sont déjà visibles dans Avisos.
- Les requêtes D1 et les droits sont cloisonnés par classe.

## Correction minimale

- S4-E uniquement : les deux champs de gestion acceptent une date ISO seule
  ou une date-heure explicite. L'aide explique de ne pas inventer une heure
  ni un fuseau. Le champ texte évite que `datetime-local` efface une date seule
  ou tronque un décalage fourni. Les dates civiles impossibles sont bloquées
  dans ces formulaires. Les autres classes gardent leurs champs existants.
  La validité est maintenant recalculée sur `input`, `change`, `setField`
  (chargement d'une autre fiche) et avant soumission ; `reset` efface l'erreur.
  Une suggestion ou une fiche valide ne reste donc pas bloquée après le 31 février.
- `/turma/s4-e` et le carnet `clase.html` affichent les dates seules sous la
  forme `02/10/2099 · Todo el día (hora no indicada)`, sans conversion de fuseau.
  Le carnet n'affiche plus « date à confirmer » lorsqu'une date seule existe
  sans `dueLabel`. Les libellés complémentaires restent conservés.
- S4-E uniquement : le filtre des tâches actives compare `YYYY-MM-DD` au jour
  civil courant en `America/Asuncion`, fuseau de classe déjà établi dans l'API
  et le calendrier. Il ne construit jamais un instant à partir de l'échéance.
  Une tâche reste active à 21 h et 23 h 59 le jour indiqué, puis cesse de l'être
  le jour suivant. Ce changement n'ajoute aucune heure à la donnée ni à l'ICS.
  Les tâches horaires et les autres classes gardent leur filtre antérieur.
- Les cartes de devoirs et calendrier reprennent uniquement la provenance
  d'avis publics en cours explicitement liés au même identifiant. Aucun
  rapprochement par titre ou matière. Les URL passent par le filtre HTTPS
  existant ; les textes sont rendus avec `textContent`. Une absence de source
  reste une absence, sans validation humaine supposée.

Aucune modification de Functions, schéma, D1, auth, secrets, cours, banques,
données métier, workflow distant ou configuration Cloudflare.
Aucun push, déploiement, PR, issue distante ou abonnement payant créé.

## Diffusion et cache

Les trois URLs JavaScript de gestion, turma et carnet portent maintenant le
suffixe `-s4-dates-r2`. Le cache du service worker devient
`med-nykuto-shell-v510-s4-dates-r2` et précache la nouvelle URL du runtime turma.
Les assertions existantes de versions ont été actualisées ; aucun contrôle
de données protégées n'a été assoupli.

Les pages HTML sont déjà servies avec revalidation selon `_headers` ; la
gestion est `no-store` et exclue du worker. Une navigation en ligne peut ainsi
charger les nouvelles URLs même si l'ancien worker contrôle encore la page.
L'activation ne supprime désormais aucun cache antérieur. Le cache courant est
consulté en priorité, puis les caches conservés. Les snapshots et ressources
hors connexion d'autres classes restent disponibles, sans copie ni migration.
Cette décision conserve davantage de stockage local ; un éventuel nettoyage
ultérieur devra être traité séparément, sans être ajouté à ce chantier S4-E.

Si aucun snapshot n'existe dans le cache courant,
seule la route `/turma/s4-e` (avec ou sans slash final) peut utiliser le shell
public courant précaché, avant tout ancien snapshot S4-E. L'interface réutilise alors les dernières données
locales et son avertissement hors connexion existant. Les autres routes
conservent leur repli antérieur. Ni l'API ni la gestion ne sont mises en cache.
Un onglet déjà ouvert garde son JavaScript jusqu'à la prochaine navigation ;
un appareil resté hors connexion ne peut pas recevoir une version non téléchargée.

## Vérification locale

- `node scripts/validate-s4-date-only.js` : réussi ; dates civiles, années
  bissextiles, conservation des valeurs et de l'offset explicite, autre classe,
  événements ICS de date et de tâche sans heure/TZID. Tests ajoutés autour de
  21 h, 23 h 59 et du jour suivant au Paraguay, du changement d'année et du
  29 février ; contrôle qu'aucune date civile S4 n'est passée au constructeur Date.
- `node scripts/test-s4-date-only-browser.cjs` : réussi dans Chrome headless,
  fixtures synthétiques interceptées localement, aucun login ni accès production.
  Trois fuseaux : Asunción, Honolulu, Tokyo. Public à 390 px, carnet et gestion
  à 1280 px. Date identique, provenance liée présente, avis non lié absent,
  valeurs de formulaire préservées et champ d'une autre classe inchangé.
  Tests ajoutés : date impossible suivie d'une suggestion, d'une autre fiche,
  d'un effacement et d'un reset ; récupération aussi vérifiée dans le formulaire
  des dates. Les fonctions de l'éditeur sont exposées seulement dans la copie
  instrumentée du test, jamais dans les sources de production.
  Requiert Playwright ; `CHROME_PATH` peut désigner le Chrome local.
- `node scripts/test-s4-date-only-service-worker.cjs` : serveur HTTP de boucle
  locale, contexte Chrome neuf avec `serviceWorkers: 'allow'`, aucun profil
  utilisateur, aucune session privée et aucun accès production. Ancien cache
  contenant des scripts périmés, première navigation avec nouvelles URLs sous
  l'ancien worker, activation du nouveau worker sans purge, conservation d'un
  cache tiers et d'un snapshot S5-A avec son JavaScript. Après activation,
  S5-A est réellement ouvert hors connexion et exécute son asset conservé.
  Sans snapshot courant S4-E, le shell neuf est choisi malgré un ancien HTML
  S4-E toujours en cache. Vérification du repli inchangé pour une classe non mise en cache,
  de l'expiration au jour suivant et des trois URLs réellement demandées.
- Validateurs calendrier, langue du hub, contenu de gestion, cours, P1/P2,
  banques et hygiène : réussis. Vérification syntaxique des trois JS et
  `git diff --check` : réussies.
- Tous les scripts de `npm run validate` ont été exécutés individuellement
  avec Node, plus le contrôle d'hygiène. Quatre échecs ont été reproduits
  strictement à l'identique après remise temporaire des trois sources à HEAD :
  `validate-s4-guided-clinical-cases` (sortie générée différente),
  `validate-2026-08-21-handoff` (captures/photos signalées),
  `validate-multiclass-foundation` (hashes des huit fichiers protégés),
  `validate-app-bundle-split` (bundle différent de la reconstruction).
  Le checkout final conserve les octets Git des fichiers non modifiés.
  Ces échecs de base empêchent de qualifier la validation complète de verte.

## Limites et suite

Le relevé WhatsApp n'a pas été intégré ni collecté dans ce checkout. Aucun
devoir, avis ni calendrier réel n'a été ajouté ou actualisé par cette mission.
Le chantier principal signale neuf événements D1/ICS déjà publiés ; ils n'ont
pas été relus ni modifiés ici. Aucune lecture
de D1 production n'a été effectuée : cette revue vérifie le contrat du code,
pas les données actuellement publiées.

Les tâches/dates n'ont pas de colonnes de provenance propres et l'ICS n'inclut
pas les sources des avis. Cette correction réutilise le modèle existant sans
migration : une provenance visible requiert un avis publié, en cours et
explicitement lié. Une provenance indépendante persistante, son édition
directe dans les tâches/dates ou son export ICS seraient une extension distincte.
Les règles existantes de tri et de filtrage des tâches horaires restent inchangées.
La validation serveur permissive des dates reste également hors de ce diff.

Ni validation visuelle humaine ni autorisation de publication ne sont attestées.

Six captures Chrome locales accompagnent cette révision : tâche mobile,
calendrier desktop, carnet desktop, formulaire mobile avant/après récupération
et formulaire desktop récupéré. Chaque image porte un bandeau explicite de
candidat local et de données fictives. Pour les formulaires, l'état de gestion
et sa visibilité sont fournis par le harnais local, sans login ni modification
de l'authentification livrée. Les contrôles, styles et fonctions de validation
proviennent du code candidat. Les captures ne représentent pas la production.
