const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

global.window = {};
require(path.join(root, 'academic-model-v445.js'));
[
  'academic-model-2026-08-27-v494.js',
  'academic-model-2026-08-28-v500.js'
].forEach((filename) => require(path.join(root, filename)));
const model = global.window.MedNykutoAcademicModel;
delete global.window;

const failures = [];

function fail(location, message) {
  failures.push(`${location}: ${message}`);
}

function stripMarkup(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(value) {
  const matches = stripMarkup(value).match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+(?:[’'][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)?/g);
  return matches ? matches.length : 0;
}

function completeSentences(value) {
  const matches = stripMarkup(value).match(/[.!?](?=[”»)'\]]*(?:\s|$))/g);
  return matches ? matches.length : 0;
}

function endsAsSentence(value) {
  return /[.!?][”»)'\]]*$/.test(stripMarkup(value));
}

function normalize(value) {
  return stripMarkup(value)
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (digit) => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(digit)])
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (digit) => '0123456789'['⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(digit)])
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/*
 * Acronyms are checked only in the full narrative source. A full name or a
 * nearby functional explanation is accepted, which keeps the rule useful for
 * beginners without forcing one rigid editorial formula such as “Name (ABC)”.
 */
const acronymRules = [
  { name: 'ADN', token: /\badn\b/, explains: [/acido desoxirribonucleico/, /adn.{0,100}(?:material genetico|informacion genetica)/, /(?:material genetico|informacion genetica).{0,100}adn/] },
  { name: 'ARN', token: /\barn\b/, explains: [/acido ribonucleico/, /arn.{0,100}(?:sintesis de proteinas|expresion genetica)/, /(?:sintesis de proteinas|expresion genetica).{0,100}arn/] },
  { name: 'ATP', token: /\batp\b/, explains: [/adenosina trifosfato/, /trifosfato de adenosina/, /atp.{0,90}(?:energia|fosfato)/, /(?:energia|fosfato).{0,90}atp/] },
  { name: 'ADP', token: /\badp\b/, explains: [/adenosina difosfato/, /difosfato de adenosina/, /adp.{0,90}(?:energia|fosfato)/, /(?:energia|fosfato).{0,90}adp/] },
  { name: 'AMP', token: /\bamp\b/, explains: [/adenosina monofosfato/, /monofosfato de adenosina/, /amp.{0,90}(?:energia|fosfato)/, /(?:energia|fosfato).{0,90}amp/] },
  { name: 'APS', token: /\baps\b/, explains: [/atencion primaria (?:de|a la) salud/] },
  { name: '2,3-BPG', token: /\bbpg\b/, explains: [/2,?3[- ]bisfosfoglicerato/, /bpg.{0,140}(?:afinidad|curva|desplaza)/, /(?:afinidad|curva|desplaza).{0,140}bpg/] },
  { name: 'CO', token: /\bco\b/, explains: [/monoxido de carbono/] },
  { name: 'CO2', token: /\bco2\b/, explains: [/dioxido de carbono/] },
  { name: 'DHAP', token: /\bdhap\b/, explains: [/dihidroxiacetona fosfato/] },
  { name: 'EPOC', token: /\bepoc\b/, explains: [/enfermedad pulmonar obstructiva cronica/] },
  { name: 'FEV1', token: /\bfev1\b/, explains: [/volumen espiratorio forzado.{0,80}(?:primer|1)(?:\s+segundo)?/] },
  { name: 'FVC', token: /\bfvc\b/, explains: [/capacidad vital forzada/] },
  { name: 'G3P', token: /\bg3p\b/, explains: [/gliceraldehido[- ]3[- ]fosfato/] },
  { name: 'G6PD', token: /\bg6pd\b/, explains: [/glucosa[- ]6[- ]fosfato deshidrogenasa/] },
  { name: 'GABA', token: /\bgaba\b/, explains: [/acido gamma[- ]aminobutirico/] },
  { name: 'GAPDH', token: /\bgapdh\b/, explains: [/gliceraldehido[- ]3[- ]fosfato deshidrogenasa/] },
  { name: 'GTP', token: /\bgtp\b/, explains: [/trifosfato de guanosina/, /guanosina trifosfato/] },
  { name: 'Hb', token: /\bhb\b/, explains: [/hemoglobina/] },
  { name: 'IPS', token: /\bips\b/, explains: [/instituto de prevision social/] },
  { name: 'KOH', token: /\bkoh\b/, explains: [/hidroxido de potasio/, /koh.{0,120}(?:aclara|queratina|examen directo)/, /(?:aclara|queratina|examen directo).{0,120}koh/] },
  { name: 'LDH', token: /\bldh\b/, explains: [/lactato deshidrogenasa/] },
  { name: 'LCR', token: /\blcr\b/, explains: [/liquido cefalorraquideo/] },
  { name: 'MSPBS', token: /\bmspbs\b/, explains: [/ministerio de salud publica y bienestar social/] },
  { name: 'NAD', token: /\bnad\b/, explains: [/dinucleotido de nicotinamida y adenina/, /nad.{0,100}(?:electron|hidrogen|oxid|reduc)/, /(?:electron|hidrogen|oxid|reduc).{0,100}nad/] },
  { name: 'NADH', token: /\bnadh\b/, explains: [/dinucleotido de nicotinamida y adenina/, /nadh.{0,100}(?:electron|hidrogen|oxid|reduc)/, /(?:electron|hidrogen|oxid|reduc).{0,100}nadh/] },
  { name: 'NADP', token: /\bnadp\b/, explains: [/fosfato de dinucleotido de nicotinamida y adenina/, /dinucleotido de nicotinamida y adenina.{0,50}fosfato/, /nadp.{0,100}(?:electron|hidrogen|oxid|reduc)/, /(?:electron|hidrogen|oxid|reduc).{0,100}nadp/] },
  { name: 'NADPH', token: /\bnadph\b/, explains: [/fosfato de dinucleotido de nicotinamida y adenina/, /dinucleotido de nicotinamida y adenina.{0,50}fosfato/, /nadph.{0,120}(?:electron|poder reductor|defensa antioxidante|sintesis reductora)/, /(?:electron|poder reductor|defensa antioxidante|sintesis reductora).{0,120}nadph/] },
  { name: 'PFK-1', token: /\bpfk-?1\b/, explains: [/fosfofructoquinasa[- ]?1/] },
  { name: 'PFK-2', token: /\bpfk-?2\b/, explains: [/fosfofructoquinasa[- ]?2/] },
  { name: 'PDH', token: /\bpdh\b/, explains: [/(?:complejo )?piruvato deshidrogenasa/] },
  { name: 'RAC', token: /\brac\b/, explains: [/recepcion,? acogida y clasificacion/] },
  { name: 'RIISS', token: /\briiss\b/, explains: [/red(?:es)? integrada(?:s)? e integral(?:es)? de servicios de salud/] },
  { name: 'SHORT', token: /\bshort\b/, explains: [/sale caminando.{0,180}habla.{0,180}obedece.{0,180}respira.{0,180}taponar hemorragias/, /short.{0,180}(?:triaje|prioridad|victimas)/, /(?:triaje|prioridad|victimas).{0,180}short/] },
  { name: 'SNC', token: /\bsnc\b/, explains: [/sistema nervioso central/] },
  { name: 'SNP', token: /\bsnp\b/, explains: [/sistema nervioso periferico/] },
  { name: 'START', token: /\bstart\b/, explains: [/triaje simple y tratamiento rapido/, /marcha.{0,180}respiracion.{0,180}perfusion.{0,180}estado mental/, /start.{0,180}(?:triaje|prioridad|victimas)/, /(?:triaje|prioridad|victimas).{0,180}start/] },
  { name: 'TPP', token: /\btpp\b/, explains: [/(?:tiamina pirofosfato|pirofosfato de tiamina)/] },
  { name: 'USF', token: /\busf\b/, explains: [/unidad(?:es)? de salud de la familia/] },
  { name: 'FAD', token: /\bfad\b/, explains: [/(?:dinucleotido de flavina y adenina|flavin adenina dinucleotido)/] },
  { name: 'DGVS', token: /\bdgvs\b/, explains: [/direccion general de vigilancia de la salud/] },
  { name: 'V/Q', token: /\bv\s*\/\s*q\b/, explains: [/ventilacion.{0,80}perfusion/] }
];

const knownAcronyms = new Set(acronymRules.map((rule) => normalize(rule.name).replace(/[^a-z0-9]/g, '')));
knownAcronyms.add('bpg');
const ignoredAcronyms = new Set(['ii', 'p1', 'p2', 'qcm', 'vf', 'o2', 'h2o']);

function acronymCandidates(value) {
  const visible = stripMarkup(value)
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (digit) => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(digit)])
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (digit) => '0123456789'['⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(digit)]);
  return visible.match(/\b[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9-]{1,9}\b/g) || [];
}

function validateAcronyms(lessonId, narrativeText) {
  const normalized = normalize(narrativeText);
  acronymRules.forEach((rule) => {
    const match = rule.token.exec(normalized);
    if (!match) return;
    /* Allow the full name before the acronym or immediately after its first use. */
    const introduction = normalized.slice(
      Math.max(0, match.index - 240),
      match.index + match[0].length + 420
    );
    if (!rule.explains.some((pattern) => pattern.test(introduction))) {
      fail(lessonId, `${rule.name} appears before a nearby full name or functional explanation.`);
    }
  });

  const unknown = new Set();
  acronymCandidates(narrativeText).forEach((candidate) => {
    const key = normalize(candidate).replace(/[^a-z0-9]/g, '');
    if (!key || knownAcronyms.has(key) || ignoredAcronyms.has(key) || /^[ivxlcdm]+$/.test(key) || /^[a-z]\d+$/.test(key)) return;
    unknown.add(candidate);
  });
  unknown.forEach((candidate) => fail(lessonId, `unknown acronym ${candidate}; spell it out or add a reviewed definition rule.`));
}

function validateNarrative(lessonId, narrative) {
  if (!narrative || !Array.isArray(narrative.sections)) {
    fail(lessonId, 'narrative or section list is missing.');
    return;
  }

  if (!stripMarkup(narrative.title)) fail(`${lessonId}/title`, 'needs a visible course title.');

  const lead = stripMarkup(narrative.lead);
  if (words(lead) < 30) fail(`${lessonId}/lead`, 'needs at least 30 words to orient the learner.');
  if (completeSentences(lead) < 2 || !endsAsSentence(lead)) fail(`${lessonId}/lead`, 'needs at least two complete sentences.');

  narrative.sections.forEach((section, sectionIndex) => {
    const location = `${lessonId}/section-${sectionIndex + 1}`;
    if (!Array.isArray(section) || section.length < 4) {
      fail(location, 'needs a step label, a title and at least two explanatory paragraphs.');
      return;
    }

    if (!stripMarkup(section[0])) fail(`${location}/label`, 'needs a visible step label.');
    if (!stripMarkup(section[1])) fail(`${location}/title`, 'needs a visible section title.');

    const paragraphs = section.slice(2).map(stripMarkup).filter(Boolean);
    if (paragraphs.length < 2) fail(location, 'needs at least two explanatory paragraphs.');
    paragraphs.forEach((paragraph, paragraphIndex) => {
      if (words(paragraph) < 12) fail(`${location}/paragraph-${paragraphIndex + 1}`, 'needs at least 12 words.');
      if (!endsAsSentence(paragraph)) fail(`${location}/paragraph-${paragraphIndex + 1}`, 'must end as a complete sentence.');
    });

    const explanation = paragraphs.join(' ');
    const sectionWords = words(explanation);
    if (sectionWords < 55) fail(location, `needs at least 55 explanatory words; found ${sectionWords}.`);
    if (completeSentences(explanation) < 3) fail(location, 'needs at least three complete sentences across its explanatory paragraphs.');

  });

  const narrativeText = [narrative.title, narrative.lead]
    .concat(narrative.sections.flatMap((section) => section.slice(2)))
    .join(' ');
  validateAcronyms(lessonId, narrativeText);
}

const staticLessonIds = [
  'fisiologia-2026-08-20',
  'bioquimica-2026-08-19',
  'bioquimica-2026-08-21',
  'bioquimica-2026-08-26',
  'epidemiologia-2026-08-19',
  'epidemiologia-2026-08-26',
  'microbiologia-practica-2026-08-20'
];

function firstTagText(markup, tagName, className) {
  const classPattern = className ? `(?=[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'])` : '';
  const match = markup.match(new RegExp(`<${tagName}\\b${classPattern}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? stripMarkup(match[1]) : '';
}

function readStaticNarratives() {
  const html = fs.readFileSync(path.join(root, 'clase.html'), 'utf8');
  const panelMatches = Array.from(html.matchAll(/<div\s+id="([^"]+)"\s+class="[^"]*\bdated-lesson-panel\b[^"]*"/g));
  const panels = new Map();

  panelMatches.forEach((match, index) => {
    const next = panelMatches[index + 1];
    panels.set(match[1], html.slice(match.index, next ? next.index : html.length));
  });

  return staticLessonIds.map((lessonId) => {
    const panel = panels.get(lessonId) || '';
    const courseMarker = panel.search(/<section\b[^>]*class="[^"]*\bcourse-chapter-2026\b[^"]*"[^>]*data-lesson-tab-panel="curso"/i);
    const quickOffset = courseMarker >= 0 ? panel.slice(courseMarker).search(/<section\b[^>]*data-lesson-tab-panel="rapida"/i) : -1;
    const course = courseMarker >= 0
      ? panel.slice(courseMarker, quickOffset >= 0 ? courseMarker + quickOffset : panel.length)
      : '';
    const lead = firstTagText(course, 'p', 'course-chapter-lead');
    const title = firstTagText(course, 'h3');
    const sections = [];
    const sectionPattern = /<section\b[^>]*class="[^"]*\bcourse-chapter-section\b[^"]*"[^>]*>([\s\S]*?)<\/section>/gi;
    let sectionMatch;

    while ((sectionMatch = sectionPattern.exec(course))) {
      const block = sectionMatch[1];
      const label = firstTagText(block, 'p', 'course-chapter-step');
      const sectionTitle = firstTagText(block, 'h4');
      const paragraphs = [];
      const paragraphPattern = /<p\b([^>]*)>([\s\S]*?)<\/p>/gi;
      let paragraphMatch;
      while ((paragraphMatch = paragraphPattern.exec(block))) {
        if (/\bcourse-chapter-step\b/.test(paragraphMatch[1])) continue;
        const paragraph = stripMarkup(paragraphMatch[2]);
        if (paragraph) paragraphs.push(paragraph);
      }
      if (paragraphs.length < 2) {
        const listItems = Array.from(block.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi))
          .map((item) => stripMarkup(item[1]))
          .filter(Boolean);
        if (listItems.length) paragraphs.push(listItems.join(' '));
      }
      sections.push([label, sectionTitle].concat(paragraphs));
    }

    if (!panel) fail(lessonId, 'static lesson panel is missing from clase.html.');
    if (!course) fail(lessonId, 'static full-course panel is missing from clase.html.');
    if (sections.length < 6) fail(lessonId, `needs at least six sequential sections; found ${sections.length}.`);
    return [lessonId, { title, lead, sections }];
  });
}

if (!model || !model.narratives) {
  fail('academic-model', 'S4 narratives are unavailable.');
} else {
  Object.entries(model.narratives).forEach(([lessonId, narrative]) => validateNarrative(lessonId, narrative));
  readStaticNarratives().forEach(([lessonId, narrative]) => validateNarrative(lessonId, narrative));
}

if (failures.length) {
  console.error('S4 narrative readability validation failed:');
  failures.forEach((message) => console.error(` - ${message}`));
  process.exit(1);
}

console.log(`S4 narrative readability OK: ${Object.keys(model.narratives).length + staticLessonIds.length} full-course narratives have complete sentences, explanatory depth and introduced acronyms.`);
