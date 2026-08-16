# Glossaire médical interactif

Le fichier `medical-glossary-v425.js` ajoute une aide de lecture globale aux pages étudiantes. Les termes médicaux complexes, les abréviations et certains signes sont automatiquement mis en évidence dans le contenu visible. Un toucher ou un clic ouvre une définition courte dans la langue active (espagnol ou portugais du Brésil).

## Règles d’interface

- Le glossaire analyse `main` et les fenêtres `dialog`, y compris le contenu ajouté après le chargement.
- Les liens, boutons, réponses de QCM, champs, tableaux de code et contrôles de formulaire ne sont jamais transformés.
- La définition apparaît au-dessus du terme quand l’espace le permet, sinon juste en dessous.
- La fenêtre reste ouverte pour laisser le temps de lire. Elle se ferme avec la croix, un clic extérieur ou la touche Échap.
- Le texte est volontairement simple. Il sert d’aide de lecture et ne remplace pas le cours ni un avis médical.

## Références éditoriales

Les définitions sont reformulées en langage simple à partir de familles de références institutionnelles :

- NCI Dictionary of Cancer Terms : https://www.cancer.gov/publications/dictionaries/cancer-terms/
- CDC, Principles of Epidemiology — Glossary : https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/glossary.html
- WHO, Primary health care : https://www.who.int/health-topics/primary-health-care
- NHGRI, Talking Glossary of Genomic and Genetic Terms : https://www.genome.gov/genetics-glossary
- NCBI Bookshelf, physiologie cellulaire et potentiels d’action : https://www.ncbi.nlm.nih.gov/books/NBK538143/

## Ajouter un terme

Ajouter une entrée à `entries` avec une clé stable, les formes espagnoles/portugaises rencontrées dans le cours, puis une définition `es` et `br`. Les formes les plus longues sont automatiquement prioritaires. Les contenus académiques protégés dans `data/` ne doivent pas être modifiés pour alimenter le glossaire.
