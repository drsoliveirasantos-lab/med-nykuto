# Défi de la classe — règle « cours uniquement »

La banque active du défi est construite dans :

```txt
grupo-3-practice-grounded-v426.js
```

Elle remplace à l'exécution les anciennes questions enrichies. La politique active est `course-only-v431`. Elle contient sept thèmes et, pour chacun, dix idées explicitement présentes dans le cours. Chaque idée produit :

- 1 QCM direct formulé comme une vraie question sur l'idée ;
- 1 QCM relationnel qui relie cette idée à une seconde idée du même thème ;
- 1 vrai/faux de vérification ;
- 1 cas clinique en deux phrases qui combine deux éléments du cours.

Cela donne 40 questions par thème et 280 questions au total.

## Formulation des questions

Les questions actives interrogent directement le sujet. Elles ne demandent pas ce qui a été « vu en classe » ou « expliqué dans le cours ». Les formulations génériques du type « Quelle affirmation est correcte ? », les textes à trous et « À quel concept correspond cette description ? » sont interdits.

Les mauvaises réponses doivent rester plausibles et homogènes. Elles ne peuvent pas se signaler par des mots absolus comme `siempre`, `nunca`, `únicamente`, `solamente` ou `exclusivamente`. La banque neutralise ces formulations et le validateur les refuse si elles réapparaissent.

Les deux QCM d'une même idée ne sont jamais consécutifs. Ils utilisent des formulations et des listes de réponses différentes. Le QCM relationnel et le cas clinique n'utilisent pas la même seconde idée ; leurs listes de réponses ne peuvent donc pas recopier le QCM direct ni se recopier entre elles.

## Preuve obligatoire

Chaque question doit contenir :

```txt
grounding: course-only-v431
evidenceId: identifiant du passage
evidence: phrase visible dans le cours
sourceAnchor: lien vers la section exacte de clase.html
learningAngle: direct | relation | verification | clinical-integration
```

`scripts/validate-class-practice-bank.js` vérifie les 280 questions. Il refuse notamment :

- une preuve absente de la section du cours ;
- un lien de source externe dans la banque active ;
- une question sans preuve ;
- un nombre incorrect de questions ou de thèmes ;
- une idée utilisée dans un format différent de 2 QCM + 1 vrai/faux + 1 application ;
- une question qui parle de la classe ou du cours au lieu d'interroger directement le sujet ;
- une mauvaise réponse contenant un mot absolu qui rend la bonne réponse devinable ;
- deux QCM consécutifs fondés sur la même idée ;
- deux QCM d'une même idée qui réutilisent les mêmes réponses ;
- un cas clinique qui réutilise la liste de réponses ou la bonne réponse d'un QCM ;
- une ancienne formulation générique ou un texte à trous ;
- une réponse déjà écrite mot pour mot dans l'énoncé.

## Mode focus et classement

L'entraînement s'ouvre dans une fenêtre modale. La page derrière ne défile plus ; seules la question, ses réponses et sa correction défilent à l'intérieur. Fermer la fenêtre rend le focus au bouton qui l'a ouverte.

Chaque réponse enregistrée émet `mednykuto:practice-progress`; après un bloc terminé, `mednykuto:practice-complete` fournit aussi l'élément de résumé. Le snapshot cumule les réponses locales déjà réalisées tout en gardant une portée distincte pour `qcm`, `vf` et `cases`. Sur `clase.html`, `class-practice-ranking-v431.js` ajoute une publication volontaire qui synchronise ces trois portées avec un seul clic. La page **Estudiar** utilise le même snapshot et les mêmes identifiants : aucun score total supplémentaire n'est créé, donc un bloc historique n'est pas compté deux fois.

Les liens OMS, CDC, NCBI ou autres peuvent rester dans les fiches comme vérifications éditoriales, mais ils ne servent pas à créer les questions du défi.
