# Med Nykuto — Frontend consolidation v313

Objectif : conserver le site stable tout en réduisant progressivement les scripts-patchs.

## État actuel

Les corrections importantes sont isolées dans des fichiers versionnés afin de limiter les risques :

- `site-global-polish-v310.js` : identité, langue, méta et petits textes globaux.
- `qcm-picker-force-v304.js` : picker premium QCM stable sur iOS/Safari.
- `qcm-tap-guard-v309.js` : zones mortes non cliquables en QCM.
- `catalog-module-force-v311.js` : ouverture stable des modules depuis la page Materias.
- `practice-picker-force-v313.js` : picker premium pour Casos clínicos et V/F.
- `premium-correction-v313.js` : correction premium pour Casos clínicos et V/F.
- `practice-tap-guard-v313.js` : protection tactile pour Casos clínicos et V/F.

## Cible propre

À terme, fusionner sans casser :

- `site-global.js`
- `catalog-ui.js`
- `practice-ui.js`
- `premium-correction.js`

## Règle de migration

1. Ne pas supprimer un patch tant que son équivalent consolidé n’a pas été testé sur iPhone Safari.
2. Maintenir une version cache unique (`v314`, `v315`, etc.) à chaque étape.
3. Tester au minimum : accueil, materias, modules, module reader, QCM, casos, V/F, contact.
4. Ne pas modifier simultanément la banque de questions et le moteur UI dans le même commit majeur.

## Domaine final prévu

Domaine recommandé : `med.nykuto.com`.

Pendant la preview Cloudflare, conserver :

`https://preview.med-nykuto-git.pages.dev`

Au passage production, remplacer les canonical/OG par :

`https://med.nykuto.com`
