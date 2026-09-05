# P1 Microbiología — ejercicio visual del PDF docente

Issues de seguimiento: #181 (histórico) y #183 (integridad del ejercicio PDF).

## Alcance actual

El modo `Reconocimiento visual` utiliza el archivo docente exacto
`P1 Micro Prática.pdf`, de 57 páginas:

- páginas 1–53: los 53 campos visuales originales, en el mismo orden;
- páginas 54–57: el gabarito manuscrito utilizado para construir las respuestas;
- 50 preguntas de agente/estructura y 3 preguntas de tinción.

El PDF fuente queda fuera del repositorio público. El runtime publica únicamente
miniaturas 220 × 220 sin el solucionario. Las imágenes se agrupan en un WebP
1540 × 1760 y después se reparten entre los ocho fragmentos
`assets/p1-micro-practica-pdf-sprite-v508.part01` a `.part08`.

El comando de reconstrucción es:

```bash
python3 scripts/build-p1-pdf-sprite.py "/ruta/al/P1 Micro Prática.pdf"
```

Requiere Poppler (`pdfimages`) y Pillow, verifica la presencia exacta de las 53
imágenes integradas y excluye automáticamente las cuatro páginas del
solucionario. El validador `scripts/validate-p1-s4.js` recompone después los ocho
fragmentos y comprueba el tamaño total, la cabecera RIFF/WebP y la cuadrícula
7 × 8 antes de ejecutar cualquier suite de navegador.

## Aislamiento del banco P1

Los 10 campos fechados del 27 de agosto y el contrato certificado de 720
preguntas permanecen sin cambios. Al pulsar el modo visual, el módulo PDF
reemplaza temporalmente las preguntas visuales por los 53 campos, construye la
sesión y restaura de inmediato el banco original. Por tanto, un examen P1
ordinario no recibe ninguna de estas preguntas adicionales.

El suplemento anterior de 13 referencias CDC PHIL permanece solo como solución
de respaldo si el módulo PDF no se carga. Cuando el módulo PDF está presente,
posee explícitamente la acción de inicio para evitar dos inyectores concurrentes
y cualquier persistencia accidental de las referencias CDC en el banco fechado.

## Respuestas e indicios

Antes de la corrección, el texto alternativo permanece neutro y nunca contiene
la respuesta. El gabarito, la explicación y los indicios aparecen únicamente
después de validar la respuesta en entrenamiento, o dentro de la corrección
final del modo examen. Una fuente visual aislada no debe presentarse como un
diagnóstico clínico autónomo.
