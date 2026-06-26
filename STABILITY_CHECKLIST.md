# Med Nykuto — checklist de estabilidad

Fecha inicial: 2026-06-24
Rama protegida de referencia: `backup-working-preview-2026-06-24`

## Principio principal

Corregir primero la fuente real del problema. Antes de agregar un archivo nuevo, un parche externo o una capa adicional de JavaScript/CSS, identificar el archivo, la línea o la lógica responsable y corregirla directamente cuando sea posible.

Solo agregar código aparte si la corrección en la fuente no es segura o no es viable, por ejemplo:

- el archivo fuente es generado automáticamente;
- el archivo fuente está minificado o es demasiado riesgoso para editar directamente;
- hace falta preservar compatibilidad con código antiguo;
- no existe una corrección limpia en la fuente.

No tocar los archivos grandes de `/data` sin backup y verificacion. Pueden estar minificados en una sola linea gigante y parecer vacios o truncados en algunas herramientas.

## Archivos protegidos

- `data/med-courses-data.js`
- `data/med-practice-bank-init.js`
- `data/med-practice-bank-loader.js`
- `data/practice-bank-fisiologia.js`
- `data/practice-bank-microbiologia.js`
- `data/practice-bank-genetica.js`
- `data/practice-bank-bioquimica.js`
- `data/practice-bank-inmunologia.js`

## Antes de cada cambio

1. Confirmar que existe una rama backup funcional.
2. Confirmar que la preview actual funciona.
3. Diagnosticar la causa real antes de editar: archivo responsable, selector/funcion implicada, test afectado y efecto visible.
4. Corregir la fuente del bug si es posible, en lugar de agregar un archivo nuevo o un parche lateral.
5. No hacer cambios directos en `/data` para ajustes de interfaz.
6. Preferir cambios en archivos ligeros existentes: HTML, CSS, `v210-module-picker-overlay.js`, `_headers`.
7. Separar cada correccion en commits pequenos.

## Pruebas obligatorias despues de cada despliegue Cloudflare

- `/`
- `/matieres.html`
- `/modules.html`
- `/matiere.html?course=fisiologia`
- `/qcm.html?course=fisiologia`
- `/cas-cliniques.html?course=fisiologia`
- `/vrai-faux.html?course=fisiologia`
- `/examen.html`
- `/contact.html`

## Conteos esperados de interfaz

- Materias activas: 5
- Biofisica: visible como Proximamente
- Modulos activos: 58
- Idioma por defecto: espanol
- Marca: Med Nykuto

## Senales de alerta

- `Aucun module trouve` o `No se encontro ningun modulo` cuando los datos deberian estar cargados.
- QCM, casos o verdadero/falso aparecen vacios.
- Archivos `/data` con tamano anormalmente pequeno.
- Reaparicion de `Netlify Forms` en Contacto o Aviso legal.
- Reaparicion de `Med Cursos` en UI publica.
