GUIA DE DESPLIEGUE — Med Nykuto / Cloudflare Pages

Workflow actual:
- GitHub contiene el sitio.
- Cloudflare Pages despliega automaticamente desde GitHub.
- Netlify ya no se usa para esta version.

Regla critica:
- No reemplazar ni reconstruir manualmente los archivos grandes del directorio /data.
- Esos archivos pueden estar minificados en una sola linea enorme y parecer vacios o truncados en algunas herramientas.
- Antes de modificar /data, verificar tamano, conteos y backup.

Archivos indispensables:
- index.html
- style.css
- app.bundle.js
- v210-module-picker-overlay.js
- premium-correction-v295.js
- practice-focus-toggle.css
- data/med-courses-data.js
- data/med-practice-bank-init.js
- data/med-practice-bank-loader.js
- data/practice-bank-fisiologia.js
- data/practice-bank-microbiologia.js
- data/practice-bank-genetica.js
- data/practice-bank-bioquimica.js
- data/practice-bank-inmunologia.js
- assets/

Estado de interfaz:
- Idioma por defecto: espanol.
- Marca publica: Med Nykuto.
- Biofisica permanece visible como Proximamente.
- Contacto ya no debe depender de Netlify Forms; en Cloudflare debe usarse mailto, Pages Functions, Worker o un servicio externo.

Pruebas despues de cada despliegue:
1. index.html
2. matieres.html
3. modules.html
4. matiere.html?course=fisiologia
5. qcm.html?course=fisiologia
6. cas-cliniques.html?course=fisiologia
7. vrai-faux.html?course=fisiologia
8. examen.html
9. contact.html

Checklist antes de tocar /data:
- Confirmar backup de la rama funcional.
- Confirmar que data/med-courses-data.js no es pequeno de forma anormal.
- Confirmar que las paginas muestran materias y modulos antes y despues.
- Confirmar que QCM, casos clinicos y verdadero/falso cargan preguntas reales.
- Si un archivo parece vacio, verificar primero si esta minificado en una sola linea gigante.
