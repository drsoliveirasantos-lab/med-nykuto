const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const failures = [];

const boardGroups = [
  {
    lessonId: 'bioquimica-2026-08-14',
    archiveDate: '14 ago. 2026',
    directory: 'assets/class-hub/board-archive/bioquimica-2026-08-14/whiteboard-v2',
    materialRequired: false,
    boards: [
      ['01-mapa-general.webp', ['mapa general', 'glucólisis']],
      ['02-fase-preparatoria-1-3.webp', ['fase preparatoria', 'reacciones 1 a 3']],
      ['03-fase-preparatoria-4-5.webp', ['fase preparatoria', 'reacciones 4 y 5']],
      ['04-fase-beneficio-6-10.webp', ['fase de beneficio', 'reacciones 6 a 10']],
      ['05-balance-final.webp', ['balance', 'glucólisis']],
      ['06-regulacion-resumen.webp', ['regulación', 'glucolítica']],
      ['07-regulacion-anotada.webp', ['regulación', 'anotaciones', 'profesora']]
    ]
  },
  {
    lessonId: 'bioquimica-2026-08-19',
    archiveDate: '19 ago. 2026',
    directory: 'assets/class-hub/biochemistry/2026-08-19/board',
    materialRequired: true,
    boards: [
      ['01-pdh-cofactores.svg', ['destino aeróbico', 'piruvato', 'PDH']],
      ['02-regulacion-glucolisis.svg', ['regulación', 'hexoquinasa', 'glucoquinasa', 'PFK-1']]
    ]
  },
  {
    lessonId: 'bioquimica-2026-08-21',
    archiveDate: '21 ago. 2026',
    directory: 'assets/class-hub/biochemistry/2026-08-21/board',
    materialRequired: true,
    boards: [
      ['01-deficit-insulina.svg', ['insulina', 'glucosa', 'reservas']],
      ['02-cetogenesis-acidosis.svg', ['oxidación', 'cetogénesis', 'cetoacidosis']],
      ['03-cerebro-osmoles.svg', ['osmoles', 'edema', 'hipocalemia']]
    ]
  },
  {
    lessonId: 'bioquimica-2026-08-26',
    archiveDate: '26 ago. 2026',
    directory: 'assets/class-hub/biochemistry/2026-08-26/board',
    materialRequired: true,
    boards: [
      ['01-ciclo-cori-vias-balance.svg', ['Cori', 'vías', 'balance']],
      ['02-ciclo-cori-interorganico.svg', ['Cori', 'músculo', 'sangre', 'hígado']],
      ['03-via-pentosas-objetivos.svg', ['pentosas', 'objetivos', 'fases', 'destinos']]
    ]
  }
];

const expectedBoards = boardGroups.flatMap((group) => group.boards.map(([filename, titleTerms]) => ({
  lessonId: group.lessonId,
  archiveDate: group.archiveDate,
  directory: group.directory,
  materialRequired: group.materialRequired,
  filename,
  titleTerms,
  asset: `${group.directory}/${filename}`
})));

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function readText(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing source file: ${relativePath}.`);
    return '';
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function countValues(values) {
  return values.reduce((counts, value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map());
}

function compareExactCoverage(label, actual, expected) {
  const actualCounts = countValues(actual);
  const expectedSet = new Set(expected);
  const missing = expected.filter((value) => !actualCounts.has(value));
  const unexpected = [...actualCounts.keys()].filter((value) => !expectedSet.has(value));
  const duplicated = [...actualCounts.entries()].filter(([, count]) => count > 1);

  expect(actual.length === expected.length, `${label}: expected exactly ${expected.length} board references, found ${actual.length}.`);
  if (missing.length) failures.push(`${label}: missing ${missing.join(', ')}.`);
  if (unexpected.length) failures.push(`${label}: unexpected ${unexpected.join(', ')}.`);
  duplicated.forEach(([value, count]) => failures.push(`${label}: ${value} is referenced ${count} times; expected once.`));
}

function visualFilesIn(relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!fs.existsSync(absoluteDirectory)) {
    failures.push(`Missing board directory: ${relativeDirectory}.`);
    return [];
  }
  return fs.readdirSync(absoluteDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(?:svg|webp|png|jpe?g)$/i.test(entry.name))
    .map((entry) => `${relativeDirectory}/${entry.name}`)
    .sort();
}

function extractElementById(source, id) {
  const idPattern = new RegExp(`\\bid\\s*=\\s*["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
  const idMatch = idPattern.exec(source);
  if (!idMatch) return '';
  const opening = source.lastIndexOf('<div', idMatch.index);
  if (opening < 0) return '';
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = opening;
  let depth = 0;
  let match;
  while ((match = tags.exec(source))) {
    depth += /^<\//.test(match[0]) ? -1 : 1;
    if (depth === 0) return source.slice(opening, tags.lastIndex);
  }
  return '';
}

function extractMaterialPanel(lessonBlock) {
  const attribute = /\bdata-lesson-tab-panel\s*=\s*["']material["']/i.exec(lessonBlock);
  if (!attribute) return '';
  const opening = lessonBlock.lastIndexOf('<section', attribute.index);
  if (opening < 0) return '';
  const tags = /<\/?section\b[^>]*>/gi;
  tags.lastIndex = opening;
  let depth = 0;
  let match;
  while ((match = tags.exec(lessonBlock))) {
    depth += /^<\//.test(match[0]) ? -1 : 1;
    if (depth === 0) return lessonBlock.slice(opening, tags.lastIndex);
  }
  return '';
}

function parseArchiveRows(source) {
  const rows = [];
  const rowPattern = /\[\s*(["'])(.*?)\1\s*,\s*(["'])(.*?)\3\s*,\s*(["'])(.*?)\5\s*,\s*(["'])(.*?)\7\s*\]/g;
  let match;
  while ((match = rowPattern.exec(source))) {
    rows.push({ course: match[2], date: match[4], title: match[6], asset: match[8] });
  }
  return rows;
}

expect(expectedBoards.length === 15, `Validator contract error: expected 15 declared boards, found ${expectedBoards.length}.`);
expect(new Set(expectedBoards.map((board) => board.asset)).size === 15, 'Validator contract error: board paths are not unique.');

boardGroups.forEach((group) => {
  const expected = group.boards.map(([filename]) => `${group.directory}/${filename}`).sort();
  compareExactCoverage(`${group.lessonId} asset directory`, visualFilesIn(group.directory), expected);
});

const hashes = new Map();
expectedBoards.forEach((board) => {
  const absolutePath = path.join(root, board.asset);
  expect(fs.existsSync(absolutePath), `${board.lessonId}: missing board asset ${board.asset}.`);
  if (!fs.existsSync(absolutePath)) return;
  const stat = fs.statSync(absolutePath);
  expect(stat.isFile(), `${board.lessonId}: board asset is not a file: ${board.asset}.`);
  expect(stat.size > 0, `${board.lessonId}: board asset is empty: ${board.asset}.`);
  if (!stat.isFile() || stat.size === 0) return;

  const contents = fs.readFileSync(absolutePath);
  const digest = crypto.createHash('sha256').update(contents).digest('hex');
  if (!hashes.has(digest)) hashes.set(digest, []);
  hashes.get(digest).push(board.asset);

  if (board.filename.endsWith('.svg')) {
    const svg = contents.toString('utf8');
    expect(/^\s*<svg\b/.test(svg), `${board.asset}: SVG root element is missing.`);
    expect(/<title\b[^>]*>[^<]+<\/title>/.test(svg), `${board.asset}: accessible SVG title is missing.`);
    expect(/<desc\b[^>]*>[^<]+<\/desc>/.test(svg), `${board.asset}: accessible SVG description is missing.`);
  } else if (board.filename.endsWith('.webp')) {
    const isWebp = contents.subarray(0, 4).toString('ascii') === 'RIFF' && contents.subarray(8, 12).toString('ascii') === 'WEBP';
    expect(isWebp, `${board.asset}: file extension is WebP but the RIFF/WEBP signature is invalid.`);
  }
});
hashes.forEach((assets) => {
  expect(assets.length === 1, `Distinct-board contract violated: byte-identical assets found at ${assets.join(' and ')}.`);
});

const notebook = readText('class-notebook-v445.js');
const allBoardTypes = notebook.match(/\btype\s*:\s*["']board["']/g) || [];
const notebookBoardAssets = [];
const boardPairPattern = /\btype\s*:\s*["']board["']\s*,\s*src\s*:\s*["']([^"']+)["']/g;
let boardPair;
while ((boardPair = boardPairPattern.exec(notebook))) notebookBoardAssets.push(boardPair[1]);
expect(allBoardTypes.length === 15, `class-notebook-v445.js must declare exactly 15 type: 'board' visuals; found ${allBoardTypes.length}.`);
expect(notebookBoardAssets.length === allBoardTypes.length, `class-notebook-v445.js has ${allBoardTypes.length} board definitions but only ${notebookBoardAssets.length} adjacent src declarations.`);
compareExactCoverage('class-notebook-v445.js board registry', notebookBoardAssets, expectedBoards.map((board) => board.asset));

const classHtml = readText('clase.html');
boardGroups.filter((group) => group.materialRequired).forEach((group) => {
  const lessonBlock = extractElementById(classHtml, group.lessonId);
  expect(Boolean(lessonBlock), `clase.html: missing lesson panel ${group.lessonId}.`);
  if (!lessonBlock) return;
  const materialPanel = extractMaterialPanel(lessonBlock);
  expect(Boolean(materialPanel), `clase.html: ${group.lessonId} is missing its Material de la clase panel.`);
  if (!materialPanel) return;
  group.boards.forEach(([filename]) => {
    const asset = `${group.directory}/${filename}`;
    expect(materialPanel.includes(asset), `clase.html: ${group.lessonId} material panel does not expose ${asset}.`);
  });
  expect(!/fuente visual pendiente|se añadirá únicamente/i.test(materialPanel), `clase.html: ${group.lessonId} still describes its reviewed boards as pending.`);
});

const archiveSource = readText('archivos-v440.js');
const archiveRows = parseArchiveRows(archiveSource);
const expectedAssetSet = new Set(expectedBoards.map((board) => board.asset));
const relevantArchiveRows = archiveRows.filter((row) => expectedAssetSet.has(row.asset));
compareExactCoverage('archivos-v440.js board catalog', relevantArchiveRows.map((row) => row.asset), expectedBoards.map((board) => board.asset));

expectedBoards.forEach((board) => {
  const rows = relevantArchiveRows.filter((row) => row.asset === board.asset);
  if (rows.length !== 1) return;
  const row = rows[0];
  expect(normalizeText(row.course) === 'bioquimica ii', `${board.asset}: Archive course must be “Bioquímica II”, found “${row.course}”.`);
  expect(row.date === board.archiveDate, `${board.asset}: Archive date must be “${board.archiveDate}”, found “${row.date}”.`);
  const normalizedTitle = normalizeText(row.title);
  expect(normalizedTitle.startsWith('pizarra '), `${board.asset}: Archive title must begin with “Pizarra”, found “${row.title}”.`);
  expect(normalizedTitle.length >= 24, `${board.asset}: Archive title is not descriptive enough: “${row.title}”.`);
  const missingTerms = board.titleTerms.filter((term) => !normalizedTitle.includes(normalizeText(term)));
  expect(missingTerms.length === 0, `${board.asset}: Archive title “${row.title}” is missing descriptive term(s): ${missingTerms.join(', ')}.`);
});

if (failures.length) {
  console.error(`Biochemistry board validation failed with ${failures.length} issue${failures.length === 1 ? '' : 's'}:`);
  failures.forEach((failure, index) => console.error(` ${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('Biochemistry board validation OK: 15 distinct boards (7 on 14 Aug, 2 on 19 Aug, 3 on 21 Aug, 3 on 26 Aug), 15 notebook board visuals, complete lesson materials for 19/21/26 and 15 descriptive Archive entries.');
