# Défi de la classe — règle « cours uniquement »

La banque active du défi est construite dans :

```txt
grupo-3-practice-grounded-v426.js
```

Elle remplace à l'exécution les anciennes questions enrichies. Elle contient sept thèmes et, pour chacun, dix idées explicitement présentes dans le cours. Chaque idée produit :

- 2 QCM ;
- 1 vrai/faux ;
- 1 application simple.

Cela donne 40 questions par thème et 280 questions au total.

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
- une idée utilisée dans un format différent de 2 QCM + 1 vrai/faux + 1 application.

Les liens OMS, CDC, NCBI ou autres peuvent rester dans les fiches comme vérifications éditoriales, mais ils ne servent pas à créer les questions du défi.
