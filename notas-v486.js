(function(){
  'use strict';

  var API='/api/class-hub?class=s4-e&resource=academic-results';
  var releases=[];
  var searchInput=document.getElementById('studentIdSearch');
  var releaseList=document.getElementById('releaseList');
  var resultCount=document.getElementById('resultCount');
  var loadError=document.getElementById('loadError');

  function el(tag,className,text){
    var node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  }

  function cleanText(value,max){
    return String(value===undefined||value===null?'':value).normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
  }

  function canonicalStudentId(value){
    return String(value||'').normalize('NFKC').toUpperCase().replace(/[\s._-]+/g,'');
  }

  function publicStudentId(value){
    var id=canonicalStudentId(value);
    return /^\d{4,24}$/.test(id)?id:'';
  }

  function publicResult(value){
    if(typeof value==='number')return Number.isFinite(value)&&value>=0?String(value):'';
    var text=cleanText(value,32);
    if(text.toLocaleLowerCase('es')==='ausente')return'Ausente';
    return /^\d+(?:[.,]\d{1,2})?$/.test(text)?text.replace(',','.'):'';
  }

  function normalizeRelease(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    var id=cleanText(value.id,80);
    var rows=Array.isArray(value.rows)?value.rows.map(function(row){
      if(!row||typeof row!=='object'||Array.isArray(row))return null;
      var studentId=publicStudentId(row.studentId),result=publicResult(row.result);
      return studentId&&result?{studentId:studentId,result:result}:null;
    }).filter(Boolean):[];
    var answerKey=Array.isArray(value.answerKey)?value.answerKey.map(function(item){
      if(!item||typeof item!=='object'||Array.isArray(item))return null;
      var question=cleanText(item.question,24),answer=cleanText(item.answer,40);
      return question&&answer?{question:question,answer:answer}:null;
    }).filter(Boolean):[];
    if(!id)return null;
    rows.sort(function(left,right){return left.studentId.localeCompare(right.studentId,'es',{numeric:true});});
    return{
      id:id,
      course:cleanText(value.course,100)||'Materia',
      title:cleanText(value.title,180)||'Evaluación',
      evaluation:cleanText(value.evaluation,120)||'Evaluación',
      revision:Number.isSafeInteger(Number(value.revision))&&Number(value.revision)>0?Number(value.revision):1,
      publishedAt:cleanText(value.publishedAt,40),
      maxGrade:publicResult(value.maxGrade),
      rows:rows,
      answerKey:answerKey
    };
  }

  function formatDate(value){
    var date=value?new Date(value):null;
    if(!date||Number.isNaN(date.getTime()))return value||'Fecha no indicada';
    try{return new Intl.DateTimeFormat('es-PY',{dateStyle:'medium',timeStyle:'short'}).format(date);}catch(error){return value;}
  }

  function answerKeyNode(release){
    var details=el('details','answer-key'),summary=el('summary','',release.answerKey.length?'Gabarito · '+release.answerKey.length+' respuestas':'Gabarito no publicado');
    details.appendChild(summary);
    if(!release.answerKey.length)return details;
    var list=el('ol','answer-key-list');
    release.answerKey.forEach(function(item){var row=el('li'),label=el('small','','Pregunta '+item.question),answer=el('strong','',item.answer);row.appendChild(label);row.appendChild(answer);list.appendChild(row);});
    details.appendChild(list);
    return details;
  }

  function releaseNode(release,query){
    var matched=release.rows.filter(function(row){return!query||row.studentId.indexOf(query)===0;});
    var card=el('article','release-card');
    card.id='release-'+release.id.replace(/[^a-zA-Z0-9_-]/g,'-');
    card.hidden=Boolean(query&&!matched.length);
    var head=el('header','release-head'),copy=el('div'),course=el('span','release-course',release.course),title=el('h2','',release.title),evaluation=el('p','release-evaluation',release.evaluation),meta=el('div','release-meta');
    title.id=card.id+'-title';card.setAttribute('aria-labelledby',title.id);copy.appendChild(course);copy.appendChild(title);copy.appendChild(evaluation);
    meta.appendChild(el('span','','Versión '+release.revision));
    var published=el('time','',formatDate(release.publishedAt));if(release.publishedAt)published.dateTime=release.publishedAt;meta.appendChild(published);
    if(release.maxGrade)meta.appendChild(el('span','','Nota máxima · '+release.maxGrade));
    head.appendChild(copy);head.appendChild(meta);card.appendChild(head);

    var body=el('div','release-body'),tableWrap=el('div','results-table-wrap'),table=el('table','results-table'),caption=el('caption','',release.course+' · '+release.evaluation),thead=el('thead'),headRow=el('tr'),tbody=el('tbody');
    headRow.appendChild(el('th','','Catraca / matrícula'));headRow.appendChild(el('th','','Nota / estado'));thead.appendChild(headRow);table.appendChild(caption);table.appendChild(thead);
    matched.forEach(function(row){var tr=el('tr');tr.appendChild(el('td','',row.studentId));tr.appendChild(el('td','',row.result));tbody.appendChild(tr);});
    table.appendChild(tbody);tableWrap.appendChild(table);body.appendChild(tableWrap);body.appendChild(answerKeyNode(release));
    if(!matched.length){tableWrap.hidden=true;body.appendChild(el('p','release-empty','No hay resultados que coincidan con esta búsqueda.'));}
    card.appendChild(body);
    return{node:card,count:matched.length,visible:!card.hidden};
  }

  function render(){
    var query=canonicalStudentId(searchInput.value),visibleRows=0,visibleReleases=0;
    releaseList.replaceChildren();
    releases.forEach(function(release){var rendered=releaseNode(release,query);releaseList.appendChild(rendered.node);if(rendered.visible){visibleRows+=rendered.count;visibleReleases+=1;}});
    if(!releases.length){releaseList.appendChild(el('p','release-empty','Todavía no hay notas ni gabaritos publicados.'));resultCount.textContent='0 publicaciones disponibles.';return;}
    if(query&&visibleRows===0)resultCount.textContent='No encontramos una catraca o matrícula con ese inicio.';
    else resultCount.textContent=visibleRows+' '+(visibleRows===1?'resultado':'resultados')+' en '+visibleReleases+' '+(visibleReleases===1?'evaluación':'evaluaciones')+'.';
  }

  function load(){
    releaseList.setAttribute('aria-busy','true');loadError.hidden=true;resultCount.textContent='Cargando publicaciones…';
    return fetch(API,{headers:{accept:'application/json'},cache:'no-store',credentials:'same-origin'}).then(function(response){
      return response.json().catch(function(){return{};}).then(function(body){if(!response.ok){throw new Error(body.error||'No se pudieron cargar las publicaciones.');}return body;});
    }).then(function(body){
      releases=(Array.isArray(body.releases)?body.releases:[]).map(normalizeRelease).filter(Boolean);
      render();
    }).catch(function(error){
      releases=[];releaseList.replaceChildren();resultCount.textContent='No hay resultados disponibles ahora.';document.getElementById('loadErrorMessage').textContent=error.message;loadError.hidden=false;
    }).finally(function(){releaseList.setAttribute('aria-busy','false');});
  }

  document.getElementById('resultSearchForm').addEventListener('submit',function(event){event.preventDefault();render();});
  searchInput.addEventListener('input',render);
  searchInput.addEventListener('search',render);
  document.getElementById('clearStudentSearch').addEventListener('click',function(){searchInput.value='';render();searchInput.focus({preventScroll:true});});
  document.getElementById('retryResults').addEventListener('click',load);
  load();
})();
