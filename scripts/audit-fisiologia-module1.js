#!/usr/bin/env node
/* Med Nykuto — Fisiología Módulo 1 quality audit.
   Run from repo root on branch preview:
   node scripts/audit-fisiologia-module1.js

   Purpose:
   - Read the compacted Fisiología bank locally, without editing it.
   - Audit QCM, V/F and clinical cases for module 1.
   - Classify every item as A = keep, B = correct, C = replace.
   - Produce a Markdown report in docs/fisiologia-module1-audit-v315.md.
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const MODULE_ID = '01-fisiologia-01-neurofisiologia-y-potencial-de-accion';
const MODULE_N = 1;
const OUT = path.join(root, 'docs', 'fisiologia-module1-audit-v315.md');

const ctx = {
  window: {},
  console: { log(){}, warn(){}, error(){} },
  document: { write(){}, body:{dataset:{} } },
  localStorage: null,
  setTimeout,
  clearTimeout,
  URLSearchParams,
};
ctx.window.window = ctx.window;
ctx.globalThis = ctx.window;

function load(rel){
  const file = path.join(root, rel);
  if(!fs.existsSync(file)) throw new Error('Missing file: ' + rel);
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { filename: rel });
}

function norm(s=''){
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9+]+/g,' ')
    .trim();
}
function text(x){
  if(typeof x === 'string') return x;
  if(x && typeof x === 'object') return x.es || x.title || x.name || x.label || x.fr || x.br || '';
  return '';
}
function sentenceCount(s){
  return String(s||'').split(/[.!?]\s+/).filter(x=>x.trim().length>12).length;
}
function wordCount(s){ return norm(s).split(/\s+/).filter(Boolean).length; }
function hasPatientStory(item){
  const combined = [item.case, item.story, item.clinicalCase, item.question, item.stem, item.prompt].map(text).join(' ');
  return /paciente|var[oó]n|mujer|hombre|niñ|adolescente|consulta|acude|presenta|antecedente|exploraci[oó]n|laboratorio|gasometr/i.test(combined) && sentenceCount(combined) >= 2;
}
function likelyGeneratedParasite(s){
  return /La opci[oó]n elegida afirma|Correcci[oó]n: La se[nñ]al el[eé]ctrica biol[oó]gica|durante el potencial de acci[oó]n\.$|con efecto sobre el umbral\.$/i.test(String(s||''));
}
function optionTypes(options){
  return options.map(o => {
    const s = norm(o);
    if(/na|k|ca|cl|ion|canal|bomba|membrana|gradiente|permeabilidad/.test(s)) return 'mechanism';
    if(/aumenta|disminuye|inhibe|activa|produce|bloquea|entra|sale/.test(s)) return 'effect';
    if(/diagnostico|sindrome|enfermedad|lesion|neuropatia/.test(s)) return 'diagnosis';
    if(/mv|mmhg|ph|hco3|paco2|po2/.test(s)) return 'data';
    return 'other';
  });
}
function heterogeneousOptions(options){
  const types = optionTypes(options);
  const counts = types.reduce((a,t)=>(a[t]=(a[t]||0)+1,a),{});
  const max = Math.max(...Object.values(counts));
  return options.length >= 4 && max <= 2;
}
function duplicateOptions(options){
  const ns = options.map(norm).filter(Boolean);
  return new Set(ns).size !== ns.length;
}
function tooObviousCorrect(item){
  const opts = (item.options||[]).map(text);
  const idx = Number(item.answerIndex||0);
  if(!opts[idx] || opts.length < 4) return false;
  const lengths = opts.map(wordCount);
  const avgOther = lengths.filter((_,i)=>i!==idx).reduce((a,b)=>a+b,0) / Math.max(1, lengths.length-1);
  return lengths[idx] > avgOther * 1.9 && lengths[idx] > 18;
}
function repeatedStem(item, seen){
  const q = norm(text(item.question || item.stem || item.prompt)).slice(0,160);
  if(!q) return null;
  if(seen.has(q)) return seen.get(q);
  seen.set(q, item.id);
  return null;
}
function repeatedOptions(item, seen){
  const opts = (item.options||[]).map(text).map(norm).sort().join('|').slice(0,500);
  if(!opts) return null;
  if(seen.has(opts)) return seen.get(opts);
  seen.set(opts, item.id);
  return null;
}
function classify(item, type, seenQ, seenOpt){
  const issues = [];
  const q = text(item.question || item.stem || item.prompt);
  const opts = Array.isArray(item.options) ? item.options.map(text) : [];
  const repQ = repeatedStem(item, seenQ);
  const repO = repeatedOptions(item, seenOpt);

  if(!item.id) issues.push(['high','missing_id','ID ausente']);
  if(!q || q.length < 18) issues.push(['high','weak_stem','Pregunta demasiado corta o ausente']);
  if(type === 'qcm' && opts.length !== 4) issues.push(['high','bad_qcm_options','QCM sin 4 opciones']);
  if((type === 'qcm' || type === 'case') && (item.answerIndex == null || Number(item.answerIndex) < 0 || Number(item.answerIndex) >= opts.length)) issues.push(['high','bad_answer_index','answerIndex inválido']);
  if(opts.length && duplicateOptions(opts)) issues.push(['high','duplicate_options','Opciones duplicadas o casi duplicadas']);
  if(repQ) issues.push(['medium','repeated_stem','Pregunta repetida o muy similar a ' + repQ]);
  if(repO) issues.push(['medium','reused_options','Mismo bloque de opciones que ' + repO]);
  if(opts.some(o => o.length > 240)) issues.push(['medium','long_option','Opción excesivamente larga']);
  if(opts.some(likelyGeneratedParasite) || likelyGeneratedParasite(item.explanation)) issues.push(['medium','generated_phrase','Frase parásita de generación detectada']);
  if(type === 'qcm' && heterogeneousOptions(opts)) issues.push(['medium','heterogeneous_options','Distractores posiblemente heterogéneos']);
  if(type === 'qcm' && tooObviousCorrect(item)) issues.push(['medium','obvious_correct','Respuesta correcta demasiado reconocible por longitud/detalle']);
  if(!item.explanation || String(item.explanation).length < 50) issues.push(['medium','weak_explanation','Corrección ausente o insuficiente']);
  if(type === 'vf'){
    const s = norm(q);
    if(/siempre|nunca|todos|ningun/.test(s) && !/excepto|salvo/.test(s)) issues.push(['low','absolute_wording','V/F con palabra absoluta: revisar ambigüedad']);
    if(q.includes('?')) issues.push(['medium','vf_question_mark','V/F formulado como pregunta, no como afirmación']);
  }
  if(type === 'case' && !hasPatientStory(item)) issues.push(['high','weak_case_story','Caso clínico sin mini-historia clínica real']);

  let cls = 'A';
  if(issues.some(x=>x[0]==='high')) cls = 'C';
  else if(issues.length) cls = 'B';
  return { item, type, cls, issues };
}
function moduleFilter(item){
  return item && (item.moduleId === MODULE_ID || Number(item.moduleNumber) === MODULE_N);
}
function arr(bank, name){ return Array.isArray(bank && bank[name]) ? bank[name] : []; }

load('data/med-practice-bank-init.js');
load('data/practice-bank-fisiologia.js');

const bank = ctx.window.MED_PRACTICE_BANK && ctx.window.MED_PRACTICE_BANK.byCourse && ctx.window.MED_PRACTICE_BANK.byCourse.fisiologia;
if(!bank) throw new Error('Fisiología bank not loaded');

const lists = {
  qcm: arr(bank, 'qcm').filter(moduleFilter),
  vf: arr(bank, 'vf').filter(moduleFilter),
  case: (arr(bank, 'cases').length ? arr(bank,'cases') : arr(bank,'case')).filter(moduleFilter),
};

const results = [];
Object.entries(lists).forEach(([type, items]) => {
  const seenQ = new Map();
  const seenOpt = new Map();
  items.forEach(item => results.push(classify(item, type, seenQ, seenOpt)));
});

const counts = results.reduce((a,r)=>{ a[r.type]=a[r.type]||{A:0,B:0,C:0,total:0}; a[r.type][r.cls]++; a[r.type].total++; return a; },{});
const total = results.reduce((a,r)=>{ a[r.cls]++; a.total++; return a; },{A:0,B:0,C:0,total:0});

function mdEscape(s){ return String(s||'').replace(/\|/g,'\\|').replace(/\n/g,' '); }
function topIssues(){
  const m = new Map();
  results.forEach(r => r.issues.forEach(i => m.set(i[1], (m.get(i[1])||0)+1)));
  return [...m.entries()].sort((a,b)=>b[1]-a[1]);
}

let md = '';
md += '# Auditoría — Fisiología Módulo 1\n\n';
md += 'Módulo: Neurofisiología y potencial de acción\n\n';
md += 'Fecha generada: ' + new Date().toISOString() + '\n\n';
md += '## Resumen\n\n';
md += '| Formato | Total | A guardar | B corregir | C reemplazar |\n|---|---:|---:|---:|---:|\n';
['qcm','vf','case'].forEach(t => { const c=counts[t]||{A:0,B:0,C:0,total:0}; md += `| ${t.toUpperCase()} | ${c.total} | ${c.A} | ${c.B} | ${c.C} |\n`; });
md += `| TOTAL | ${total.total} | ${total.A} | ${total.B} | ${total.C} |\n\n`;
md += '## Problèmes les plus fréquents\n\n';
topIssues().forEach(([k,n]) => { md += `- ${k}: ${n}\n`; });
md += '\n## Détail item par item\n\n';
md += '| ID | Format | Classe | Problèmes | Question |\n|---|---|---:|---|---|\n';
results.forEach(r => {
  const id = r.item.id || 'missing-id';
  const q = text(r.item.question || r.item.stem || r.item.prompt).slice(0,150);
  const iss = r.issues.map(i=>i[1]).join(', ') || 'OK';
  md += `| ${mdEscape(id)} | ${r.type} | ${r.cls} | ${mdEscape(iss)} | ${mdEscape(q)} |\n`;
});

fs.mkdirSync(path.dirname(OUT), { recursive:true });
fs.writeFileSync(OUT, md, 'utf8');
console.log(md);
