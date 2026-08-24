(function(){
  'use strict';
  var files=[
    ['Bioquímica II','21 ago. 2026','Actividades 3 y 4 · DOCX','assets/class-hub/biochemistry/2026-08-21/actividades-3-y-4-bioquimica-ii.docx'],
    ['Bioquímica II','21 ago. 2026','Pizarra · déficit de insulina','assets/class-hub/biochemistry/2026-08-21/board/01-deficit-insulina.svg'],
    ['Bioquímica II','21 ago. 2026','Pizarra · cetogénesis y acidosis','assets/class-hub/biochemistry/2026-08-21/board/02-cetogenesis-acidosis.svg'],
    ['Bioquímica II','21 ago. 2026','Pizarra · cerebro y osmoles','assets/class-hub/biochemistry/2026-08-21/board/03-cerebro-osmoles.svg'],
    ['Bioquímica II','19 ago. 2026','Pizarra · complejo PDH','assets/class-hub/biochemistry/2026-08-19/board/01-pdh-cofactores.svg'],
    ['Bioquímica II','19 ago. 2026','Pizarra · regulación glucolítica','assets/class-hub/biochemistry/2026-08-19/board/02-regulacion-glucolisis.svg'],
    ['Epidemiología','19 ago. 2026','Organización Urg y Emergencias · PPTX','assets/class-hub/epidemiology/2026-08-19/organizacion-urgencias-emergencias.pptx'],
    ['Epidemiología','19 ago. 2026','Trabajo práctico · DOCX','assets/class-hub/epidemiology/2026-08-19/trabajo-practico-salud-publica-epidemiologia.docx'],
    ['Epidemiología','Bloque anterior','Atención Primaria de la Salud · PPTX','assets/class-hub/epidemiology/2026-08-16/atencion-primaria-salud.pptx'],
    ['Epidemiología','Bloque anterior','Manual RAC Paraguay · PDF','assets/class-hub/epidemiology/2026-08-16/manual-rac-paraguay-2011.pdf'],
    ['Epidemiología','Bloque anterior','Salud Pública Paraguay · PDF','assets/class-hub/epidemiology/2026-08-16/salud-publica-paraguay.pdf'],
    ['Fisiología II','20 ago. 2026','Ejercicios de fijación del sistema nervioso · PDF','assets/class-hub/physiology/2026-08-20/ejercicios-fijacion-sistema-nervioso.pdf'],
    ['Fisiología II','24 ago. 2026','Sensibilidades somáticas · PDF','assets/class-hub/physiology/2026-08-24/sensibilidades-somaticas.pdf'],
    ['Fisiología II','24 ago. 2026','Ejercicios · sensibilidades somáticas · PDF','assets/class-hub/physiology/2026-08-24/ejercicios-sensibilidades-somaticas.pdf'],
    ['Fisiología II','24 ago. 2026','Participación activa 24-08 · PDF','assets/class-hub/physiology/2026-08-24/participacion-activa-24-08.pdf'],
    ['Fisiología II','24 ago. 2026','Repaso · sinapsis y receptores · PDF','assets/class-hub/physiology/2026-08-24/repaso-sinapsis-receptores.pdf'],
    ['Fisiología II','17 ago. 2026','Organización, sinapsis y receptores · PDF','assets/class-hub/physiology/2026-08-17/organizacion-sinapsis-receptores.pdf'],
    ['Microbiología II · Teórica','24 ago. 2026','Casos clínicos y candidiasis · PDF optimizado','assets/class-hub/microbiology-theory/2026-08-24/expanded-cases/casos-clinicos-y-candidiasis-24-08.pdf'],
    ['Microbiología II · Teórica','10 ago. 2026','Micología · generalidades · PDF','assets/class-hub/microbiology-theory/2026-08-10/micologia-generalidades.pdf'],
    ['Microbiología II · Teórica','10 ago. 2026','Micosis superficiales · PDF','assets/class-hub/microbiology-theory/2026-08-10/micosis-superficiales.pdf'],
    ['Nutrición','Seminario','Instrucciones para presentación oral · DOCX','assets/class-hub/instructivo-presentacion-oral-semana-3.docx'],
    ['Nutrición','Seminario','Ejemplo de primera página · DOCX','assets/class-hub/modelo-portada-seminario-nutricion.docx']
  ];
  function el(tag,className,text){var node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function render(){var host=document.getElementById('fileGroups'),groups={};files.forEach(function(file){(groups[file[0]]||(groups[file[0]]=[])).push(file);});host.replaceChildren();Object.keys(groups).forEach(function(subject){var section=el('section','file-group'),head=el('header');head.appendChild(el('span','',String(groups[subject].length)+' ARCHIVOS'));head.appendChild(el('h2','',subject));section.appendChild(head);var list=el('div','file-list');groups[subject].forEach(function(file,index){var row=el('label','file-row'),check=el('input');check.type='checkbox';check.value=file[3];check.setAttribute('aria-label','Seleccionar '+file[2]);var copy=el('span');copy.appendChild(el('strong','',file[2]));copy.appendChild(el('small','',file[1]));var open=el('a','','Abrir');open.href=file[3];open.target='_blank';open.rel='noopener';row.appendChild(check);row.appendChild(copy);row.appendChild(open);list.appendChild(row);});section.appendChild(list);host.appendChild(section);});}
  function addDynamic(){fetch('/api/class-hub?resource=public').then(function(response){if(!response.ok)throw new Error();return response.json();}).then(function(data){(data.files||[]).forEach(function(file){if(!files.some(function(item){return item[3]===file.url;}))files.push([file.course,file.lessonDate||'Publicado',file.title+' · '+(file.fileType||'enlace').toUpperCase(),file.url]);});render();}).catch(function(){});}
  function init(){render();addDynamic();var select=document.getElementById('selectAllFiles'),download=document.getElementById('downloadFiles'),status=document.getElementById('fileStatus');select.addEventListener('click',function(){var checks=document.querySelectorAll('.file-row input'),all=Array.prototype.every.call(checks,function(check){return check.checked;});checks.forEach(function(check){check.checked=!all;});select.textContent=all?'Seleccionar todo':'Quitar selección';});download.addEventListener('click',function(){var chosen=Array.prototype.slice.call(document.querySelectorAll('.file-row input:checked'));if(!chosen.length){status.textContent='Selecciona al menos un archivo.';return;}status.textContent='Iniciando '+chosen.length+' descargas…';chosen.forEach(function(check,index){setTimeout(function(){var link=el('a');link.href=check.value;link.download='';document.body.appendChild(link);link.click();link.remove();},index*250);});});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
