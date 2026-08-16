# Défi de la classe — règle « cours uniquement »

La banque active du défi est construite dans :

```txt
grupo-3-practice-grounded-v426.js
```

Elle remplace à l'exécution les anciennes questions enrichies. Elle contient sept thèmes et, pour chacun, dix idées explicitement présentes dans le cours. Chaque idée produit :

- 1 QCM qui demande de choisir l'affirmation correcte ;
- 1 QCM qui demande d'identifier le concept à partir d'une description ;
- 1 vrai/faux ;
- 1 application simple.

Cela donne 40 questions par thème et 280 questions au total.

## Formulation des questions

Les questions actives interrogent directement le concept. Elles ne demandent pas ce qui a été « vu en classe » ou « expliqué dans le cours ». Les applications partent d'une affirmation concrète à corriger, plutôt que d'un scénario générique de révision.

Les mauvaises réponses doivent rester plausibles et homogènes. Elles ne peuvent pas se signaler par des mots absolus comme `siempre`, `nunca`, `únicamente`, `solamente` ou `exclusivamente`. La banque neutralise ces formulations et le validateur les refuse si elles réapparaissent.

Les deux QCM d'une même idée ne sont jamais consécutifs. Ils utilisent des formulations et des listes de réponses différentes. Une réponse ne peut pas être recopiée dans l'énoncé : le second QCM masque le nom du concept dans la description et propose quatre concepts du même thème.

## Preuve obligatoire

Chaque question doit contenir :

```txt
grounding: course-only-v426
evidenceId: identifiant du passage
evidence: phrase visible dans le cours
sourceAnchor: lien vers la section exacte de clase.html
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
- une réponse déjà écrite mot pour mot dans l'énoncé.

Les liens OMS, CDC, NCBI ou autres peuvent rester dans les fiches comme vérifications éditoriales, mais ils ne servent pas à créer les questions du défi.
