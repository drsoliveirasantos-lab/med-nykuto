GUIDE DE DÉPLOIEMENT — Med Cursos

1. Décompressez le ZIP.
2. Envoyez tout le contenu du dossier à la racine de Netlify ou Cloudflare Pages.
3. Vérifiez que les fichiers suivants restent présents :
   - app.bundle.js
   - style.css
   - data/med-courses-data.js
   - data/med-practice-bank-init.js
   - data/med-practice-bank-loader.js
   - data/practice-bank-*.js
   - assets/
4. Ne supprimez pas le dossier /data : les pages QCM, cas cliniques et vrai/faux chargent les banques depuis ce dossier.
5. Après publication, testez :
   - index.html
   - matieres.html
   - qcm.html?course=fisiologia
   - cas-cliniques.html?course=fisiologia
   - vrai-faux.html?course=fisiologia

Correction appliquée dans cette version :
- stabilisation des observateurs JavaScript des pages d’entraînement ;
- suppression d’une boucle de mutations qui pouvait bloquer le clic sur les réponses ;
- ajout de ce guide pour éviter le lien cassé README_DEPLOIEMENT.txt.
