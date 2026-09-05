# Cursos temáticos evolutivos S4

La vista principal de cada materia del 4.º E sigue esta jerarquía:

`Materia → gran tema → curso consolidado → capítulos/nociones → sesiones fechadas`.

El registro `s4-course-themes-v182.js` es una capa aditiva. No mueve ni copia
los 23 paneles fechados, sus bancos de práctica, documentos, imágenes o enlaces.
Cada noción consolidada guarda referencias explícitas a las sesiones que la
introdujeron, precisaron, ejemplificaron o corrigieron. Una sesión transversal
puede aportar a más de un tema, pero conserva una sola identidad y un solo banco.

## Fusión incremental

`mergeContentThemeContributions()` aplica reglas deterministas mediante IDs y
claves de deduplicación estables:

- repetición exacta: conserva una noción y añade la nueva procedencia;
- precisión: conserva el texto anterior en el historial y añade la versión;
- ejemplo o caso: añade un elemento trazable bajo la misma noción;
- subtema o tema nuevo: crea el nodo solicitado de forma explícita;
- divergencia: conserva las dos formulaciones y muestra el conflicto;
- replay de una contribución: no cambia el resultado.

Nunca se fusiona por similitud aproximada del título. Una sesión administrada
sin clasificación explícita permanece en la cronología y debe revisarse antes
de incorporarse a un curso temático.

La función exportada conserva semántica pura: devuelve un nuevo grafo. En el
modelo S4 instalado, la variante de un argumento fusiona sobre el grafo activo,
actualiza todos los índices y hace visibles inmediatamente los temas o nociones
nuevos mediante los métodos públicos de resolución. Las fechas explícitas de la fuente
ordenan también las sesiones futuras.

## Contratos de compatibilidad

- `Cuaderno` mantiene la cronología por materia y los hashes históricos.
- La cronología global reúne las 23 sesiones y enlaza a sus rutas originales.
- `Archivos` y `Progreso` conservan sus claves y comportamiento previos.
- `Entrenar` abre los bancos originales; no crea bancos agregados.
- Los temas de lectura `soft`, `sepia` y `focus` siguen separados en
  `readingThemes`.
- El estado de novedades usa únicamente
  `med-nykuto-s4-seen-content-v182` y guarda un snapshot de nociones, casos y
  documentos, además de la última pestaña y el último formato de curso.

Validación principal:

```bash
node scripts/validate-s4-theme-merge.js
node scripts/validate-s4-learning-experience.js
```
