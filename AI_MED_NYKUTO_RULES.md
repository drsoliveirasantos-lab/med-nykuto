# AI_MED_NYKUTO_RULES.md

Document permanent de référence pour toute conversation IA qui travaille sur le site Med Nykuto et ses banques de questions.

Avant de générer, corriger ou intégrer des questions dans le repo, lire ce fichier et appliquer ses règles. Lire aussi `AI_MED_NYKUTO_PROGRESS.md` pour connaître l'état actuel du travail.

---

## 1. Objectif général

Med Nykuto doit produire une banque d'entraînement médicale premium, en espagnol médical clair, pour apprendre, réviser et réussir les examens.

Les formats utilisés sont :

1. QCM à 4 options ;
2. Verdadero/Falso ;
3. Casos clínicos.

Le contenu final des questions, options, réponses et corrections doit être en espagnol médical clair, même si les échanges de travail avec l'utilisateur sont en français ou en portugais.

---

## 2. Workflow obligatoire par module

Ne pas générer un module entier sans analyse.

Ordre recommandé :

1. analyser le module : thèmes, objectifs pédagogiques, mécanismes, confusions fréquentes, pièges d'examen ;
2. proposer la distribution de production ;
3. produire par petits lots contrôlés ;
4. vérifier la qualité après chaque lot ;
5. intégrer par patch séparé dans le repo ;
6. mettre à jour le loader ;
7. vérifier le loader après chaque changement.

Tailles de lots optimales :

- QCM : 40 maximum optimal par lot ;
- V/F : 20 à 25 par lot ;
- Casos clínicos : 15 maximum optimal par lot.

Ne pas dépasser ces tailles sans justification explicite.

---

## 3. Règle anti-remplissage

Ne jamais produire des questions uniquement pour atteindre un nombre.

Chaque question doit tester un objectif différent ou un angle pédagogique distinct : définition, mécanisme, reconnaissance de patron, piège d'examen, application clinique, interprétation de résultat, ou intégration.

Éviter de produire plusieurs variantes du même micro-thème avec seulement des mots changés.

Une question simple doit rester directe. Une question complexe doit guider vers un vrai raisonnement.

---

## 4. Règles des QCM

Chaque QCM doit avoir :

- une question claire ;
- 4 options homogènes ;
- une seule meilleure réponse ;
- une correction détaillée ;
- une explication des distracteurs ;
- des points clés.

### 4.1 Homogénéité des options

Les distracteurs doivent appartenir à la même catégorie que la bonne réponse.

Exemples :

- si la question demande une structure bactérienne, les options doivent être des structures ;
- si elle demande un mécanisme de résistance, les options doivent être des mécanismes ;
- si elle demande un syndrome, les options doivent être des syndromes ;
- si elle demande un signe clinique, les options doivent être des signes cliniques.

Ne pas mélanger structure, maladie, enzyme, symptôme et traitement dans les mêmes options sauf si la question teste explicitement une intégration.

### 4.2 Nouvelle règle importante : options lisibles et interprétables

Les options ne doivent pas être de simples étiquettes incompréhensibles lorsque la question demande une proposition correcte.

Mauvais exemple :

- Cápsides eucariotas.
- Hormonas del huésped exclusivamente.
- Anticuerpos bacterianos secretados.

Ce type d'option est trop télégraphique. L'étudiant ne comprend pas clairement quelle affirmation il accepte ou refuse.

Bon exemple :

- Los PAMP bacterianos son patrones moleculares conservados asociados a microorganismos, reconocidos por la inmunidad innata.
- Los PAMP bacterianos son anticuerpos secretados por bacterias para neutralizar al huésped.
- Los PAMP bacterianos son cápsides propias de células eucariotas.
- Los PAMP bacterianos son hormonas exclusivas del huésped sin origen microbiano.

Règle :

- Si la question dit `¿cuál proposición es correcta?`, chaque option doit être une phrase complète.
- Si la question demande `¿qué estructura...?`, `¿qué enzima...?`, `¿qué mecanismo...?`, les options peuvent être plus courtes, mais doivent rester assez explicites pour être comprises seules.
- Un distracteur doit être pédagogiquement faux, pas simplement bizarre ou flou.
- Une option doit permettre à l'étudiant de comprendre ce qu'il est en train de choisir.

### 4.3 Corrections QCM

La correction doit expliquer pourquoi la bonne réponse est correcte, puis pourquoi chaque distracteur est faux.

Éviter les corrections génériques comme `Correcto` ou `Incorrecto` sans explication.

---

## 5. Règles des Verdadero/Falso

Chaque V/F doit tester une affirmation précise.

Règles :

- phrase complète ;
- pas d'ambiguïté ;
- ne pas utiliser des formulations pièges artificielles ;
- si faux, donner la correction exacte ;
- expliquer la notion, pas seulement dire `falso`.

Format recommandé :

- `question` : affirmation complète ;
- `options` : `["Verdadero", "Falso"]` ;
- `answerIndex` : 0 ou 1 ;
- `explanation` : justification ;
- `correctionIfFalse` : correction concise si faux.

---

## 6. Règles des casos clínicos

Chaque cas clinique doit avoir une vraie mini-histoire clinique en 2 à 3 phrases courtes.

Le cas doit inclure :

- un patient ;
- un contexte ;
- ce qui s'est passé ;
- les symptômes, résultats ou données pertinentes ;
- une question qui teste un raisonnement précis.

Ne jamais faire un cas clinique qui n'est qu'une phrase technique.

Mauvais exemple :

- `Paciente con bacteria encapsulada. ¿Qué factor de virulencia?`

Bon exemple :

- `Un niño presenta meningitis bacteriana. El laboratorio describe bacterias encapsuladas, y el profesor insiste en que los anticuerpos contra la cápsula son protectores. ¿Cuál es la función patogénica principal de la cápsula en este contexto?`

Les options doivent rester homogènes et la correction doit expliquer le raisonnement clinique.

---

## 7. Règles techniques repo

Toujours travailler sur la branche `preview`, sauf demande explicite contraire.

Ne pas modifier directement les grosses banques si un patch séparé est plus sûr.

Approche recommandée :

1. créer un fichier de patch séparé dans `data/` ;
2. remplacer les items existants par ID ou par index de module ;
3. ne jamais augmenter artificiellement le nombre total d'items ;
4. mettre à jour `data/med-practice-bank-loader.js` ;
5. vérifier que le loader charge bien le nouveau patch ;
6. ne pas supprimer les patchs existants des autres matières.

Exemples de patchs :

- `data/practice-bank-microbiologia-quality-patch-v312.js`
- `data/practice-bank-microbiologia-quality-patch-v325.js`

Le loader doit chaîner les patchs après le fichier principal de la matière.

---

## 8. Règle de prudence technique

Avant de modifier `data/med-practice-bank-loader.js`, toujours récupérer la version actuelle et son SHA.

Quand on ajoute un patch d'une matière, préserver les patchs déjà présents pour les autres matières.

Exemple : ne pas effacer les patchs `fisiologia` en ajoutant un patch `microbiologia`.

---

## 9. Règle d'état d'avancement

Après chaque lot, mettre à jour mentalement ou dans `AI_MED_NYKUTO_PROGRESS.md` :

- module travaillé ;
- format ;
- plage corrigée ;
- fichier patch créé ;
- état restant ;
- problèmes de qualité détectés.

Si une nouvelle conversation commence, lire `AI_MED_NYKUTO_PROGRESS.md` avant de continuer.

### 9.1 Règle de matière active par conversation

`AI_MED_NYKUTO_PROGRESS.md` peut contenir plusieurs matières et plusieurs priorités en parallèle.

La priorité à appliquer dépend de la matière active de la conversation en cours :

- si la conversation travaille sur `Fisiología`, continuer la section Fisiología et son module actif ;
- si la conversation travaille sur `Microbiología`, continuer la section Microbiología et son module actif ;
- si la matière active n'est pas claire, demander confirmation à l'utilisateur avant toute modification GitHub ;
- ne jamais appliquer automatiquement la priorité d'une autre matière simplement parce qu'elle apparaît plus haut ou plus récemment dans le fichier de progression.

Une priorité écrite dans une section de matière est prioritaire seulement pour cette matière, sauf instruction explicite contraire de l'utilisateur.

---

## 10. Problème détecté à corriger en priorité

Dans Microbiología Module 1, le contenu de fond a été reconstruit, mais une vérification utilisateur sur Preview a montré que certaines options QCM restent trop courtes ou trop télégraphiques.

Exemple observé :

- `Cápsides eucariotas.`
- `Hormonas del huésped exclusivamente.`

Action à faire : repasse de lisibilité sur les options QCM, surtout quand la question demande une proposition correcte.

Objectif : transformer les options en propositions complètes et interprétables, sans changer le fond ni le nombre d'items.

Cette priorité concerne la section Microbiología. Dans une conversation dont la matière active est Fisiología ou une autre matière, continuer la matière active sauf demande explicite de changer de matière.

---

## 11. Instruction courte pour future conversation

Quand une nouvelle conversation IA reprend le travail, l'utilisateur peut dire :

`Lis AI_MED_NYKUTO_RULES.md et AI_MED_NYKUTO_PROGRESS.md dans le repo Med Nykuto, puis continue sur la branche preview.`

L'IA doit alors appliquer ces règles sans demander à l'utilisateur de recoller le prompt complet, puis identifier la matière active de la conversation avant toute modification GitHub.