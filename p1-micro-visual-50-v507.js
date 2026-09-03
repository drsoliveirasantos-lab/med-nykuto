(function(){
  'use strict';

  var PRACTICE_ID='microbiologia-practica-2026-08-27';
  var EXPECTED_TOTAL=53;
  var BANK_VERSION='p1-micro-practica-pdf-2026-09-03-v4';
  var TILE_SIZE=220;
  var SPRITE_COLUMNS=7;
  var SPRITE_ROWS=8;
  var SPRITE_BYTES=89968;
  var SPRITE_PARTS=[
    "assets/p1-micro-practica-pdf-sprite-v508.part01?v=508",
    "assets/p1-micro-practica-pdf-sprite-v508.part02?v=508",
    "assets/p1-micro-practica-pdf-sprite-v508.part03?v=508",
    "assets/p1-micro-practica-pdf-sprite-v508.part04?v=508",
    "assets/p1-micro-practica-pdf-sprite-v508.part05?v=508",
    "assets/p1-micro-practica-pdf-sprite-v508.part06?v=508",
    "assets/p1-micro-practica-pdf-sprite-v508.part07?v=508",
    "assets/p1-micro-practica-pdf-sprite-v508.part08?v=508"
  ];
  var SOURCE_ITEMS=[{"page":1,"answer":"Hifas cenocíticas","category":"structure"},{"page":2,"answer":"Cryptococcus neoformans","category":"agent"},{"page":3,"answer":"Hifas cenocíticas","category":"structure"},{"page":4,"answer":"Aspergillus niger","category":"agent"},{"page":5,"answer":"Hifas cenocíticas","category":"structure"},{"page":6,"answer":"Aspergillus fumigatus","category":"agent"},{"page":7,"answer":"Hifas tabicadas","category":"structure"},{"page":8,"answer":"Micelio","category":"structure"},{"page":9,"answer":"Candida","category":"agent"},{"page":10,"answer":"Conidióforo","category":"structure"},{"page":11,"answer":"Micelio","category":"structure"},{"page":12,"answer":"Rhizopus","category":"agent"},{"page":13,"answer":"Hifas tabicadas","category":"structure"},{"page":14,"answer":"Aspergillus niger","category":"agent"},{"page":15,"answer":"Candida","category":"agent"},{"page":16,"answer":"Aspergillus flavus","category":"agent"},{"page":17,"answer":"Hifas tabicadas","category":"structure"},{"page":18,"answer":"Cryptococcus neoformans","category":"agent"},{"page":19,"answer":"Levaduras","category":"structure"},{"page":20,"answer":"Aspergillus fumigatus","category":"agent"},{"page":21,"answer":"Conidios","category":"structure"},{"page":22,"answer":"Rhizopus","category":"agent"},{"page":23,"answer":"Micelio","category":"structure"},{"page":24,"answer":"Mucor","category":"agent"},{"page":25,"answer":"Aspergillus fumigatus","category":"agent"},{"page":26,"answer":"Mucor","category":"agent"},{"page":27,"answer":"Cryptococcus neoformans","category":"agent"},{"page":28,"answer":"Mucor","category":"agent"},{"page":29,"answer":"Rhizopus","category":"agent"},{"page":30,"answer":"Macronidio","category":"structure"},{"page":31,"answer":"Aspergillus niger","category":"agent"},{"page":32,"answer":"Aspergillus flavus","category":"agent"},{"page":33,"answer":"Micronidios","category":"structure"},{"page":34,"answer":"Macronidios","category":"structure"},{"page":35,"answer":"Rhizopus","category":"agent"},{"page":36,"answer":"Macronidio","category":"structure"},{"page":37,"answer":"Aspergillus fumigatus","category":"agent"},{"page":38,"answer":"Macronidio","category":"structure"},{"page":39,"answer":"Micronidio","category":"structure"},{"page":40,"answer":"Aspergillus niger","category":"agent"},{"page":41,"answer":"Pseudohifas","category":"structure"},{"page":42,"answer":"Macronidio","category":"structure"},{"page":43,"answer":"Aspergillus fumigatus","category":"agent"},{"page":44,"answer":"Artroconidios","category":"structure"},{"page":45,"answer":"Candida","category":"agent"},{"page":46,"answer":"Cryptococcus neoformans","category":"agent"},{"page":47,"answer":"Aspergillus flavus","category":"agent"},{"page":48,"answer":"Aspergillus fumigatus","category":"agent"},{"page":49,"answer":"Aspergillus niger","category":"agent"},{"page":50,"answer":"Rhizopus","category":"agent"},{"page":51,"answer":"Tinta china","category":"stain"},{"page":52,"answer":"Tinción de Gram","category":"stain"},{"page":53,"answer":"Azul de lactofenol","category":"stain"}];
  var POOLS={
    agent:['Aspergillus niger','Aspergillus fumigatus','Aspergillus flavus','Cryptococcus neoformans','Candida','Rhizopus','Mucor'],
    structure:['Hifas cenocíticas','Hifas tabicadas','Micelio','Conidióforo','Levaduras','Conidios','Macronidio','Macronidios','Micronidio','Micronidios','Pseudohifas','Artroconidios'],
    stain:['Tinta china','Tinción de Gram','Azul de lactofenol']
  };

  function clearStaleVisualSession(){
    var scope=window.MedNykutoP1Scope;
    if(!scope||!scope.id)return;
    var sessionKey='medNykuto:p1Exam:'+scope.id;
    var markerKey='medNykuto:p1VisualBankVersion:'+scope.id;
    try{
      if(localStorage.getItem(markerKey)===BANK_VERSION)return;
      var rawSession=localStorage.getItem(sessionKey);
      if(rawSession){
        try{
          var savedSession=JSON.parse(rawSession);
          if(savedSession&&savedSession.kind==='visual-recognition')localStorage.removeItem(sessionKey);
        }catch(parseError){
          localStorage.removeItem(sessionKey);
        }
      }
      localStorage.setItem(markerKey,BANK_VERSION);
    }catch(storageError){}
  }

  function fetchPart(src){
    return fetch(src,{credentials:'same-origin'}).then(function(response){
      if(!response.ok)throw new Error('No se pudo cargar '+src+' ('+response.status+')');
      return response.arrayBuffer();
    });
  }

  function loadSprite(){
    return Promise.all(SPRITE_PARTS.map(fetchPart)).then(function(parts){
      var total=parts.reduce(function(sum,part){return sum+part.byteLength;},0);
      if(total!==SPRITE_BYTES)throw new Error('Sprite visual incompleto: '+total+' de '+SPRITE_BYTES+' bytes');
      var spriteUrl=URL.createObjectURL(new Blob(parts,{type:'image/webp'}));
      return new Promise(function(resolve,reject){
        var image=new Image();
        image.onload=function(){
          if(image.naturalWidth!==SPRITE_COLUMNS*TILE_SIZE||image.naturalHeight!==SPRITE_ROWS*TILE_SIZE){
            URL.revokeObjectURL(spriteUrl);
            reject(new Error('Dimensiones inesperadas del banco visual'));
            return;
          }
          resolve({image:image,url:spriteUrl});
        };
        image.onerror=function(){
          URL.revokeObjectURL(spriteUrl);
          reject(new Error('No se pudo decodificar el banco visual'));
        };
        image.src=spriteUrl;
      });
    });
  }

  function cropSprite(sprite){
    var images={};
    var canvas=document.createElement('canvas');
    canvas.width=TILE_SIZE;
    canvas.height=TILE_SIZE;
    var context=canvas.getContext('2d',{alpha:false});
    if(!context)throw new Error('Canvas no disponible');
    for(var page=1;page<=EXPECTED_TOTAL;page+=1){
      var index=page-1;
      var sourceX=(index%SPRITE_COLUMNS)*TILE_SIZE;
      var sourceY=Math.floor(index/SPRITE_COLUMNS)*TILE_SIZE;
      context.clearRect(0,0,TILE_SIZE,TILE_SIZE);
      context.drawImage(sprite.image,sourceX,sourceY,TILE_SIZE,TILE_SIZE,0,0,TILE_SIZE,TILE_SIZE);
      images[String(page)]=canvas.toDataURL('image/jpeg',0.68);
    }
    URL.revokeObjectURL(sprite.url);
    return images;
  }

  function sameFamily(left,right){
    var families={
      Macronidio:'macro',Macronidios:'macro',
      Micronidio:'micro',Micronidios:'micro'
    };
    return left===right||(families[left]&&families[left]===families[right]);
  }

  function rotateOptions(correct,pool,page){
    var distractors=pool.filter(function(value){return !sameFamily(value,correct);});
    var start=(page*5)%Math.max(1,distractors.length);
    var selected=[];
    var wanted=Math.min(3,distractors.length);
    for(var offset=0;selected.length<wanted&&offset<distractors.length*2;offset+=1){
      var candidate=distractors[(start+offset)%distractors.length];
      if(selected.indexOf(candidate)<0)selected.push(candidate);
    }
    var options=selected.slice();
    var correctIndex=page%(options.length+1);
    options.splice(correctIndex,0,correct);
    return {options:options,answer:correctIndex};
  }

  function promptFor(item){
    if(item.category==='stain')return 'Imagen '+item.page+': ¿cuál es la tinción utilizada?';
    if(item.category==='agent')return 'Imagen '+item.page+': ¿qué agente corresponde según el práctico P1?';
    return 'Imagen '+item.page+': ¿qué estructura corresponde según el práctico P1?';
  }

  function buildQuestions(images){
    return SOURCE_ITEMS.map(function(item){
      var rotated=rotateOptions(item.answer,POOLS[item.category],item.page);
      return {
        prompt:promptFor(item),
        options:rotated.options,
        answer:rotated.answer,
        explanation:'Según el gabarito docente, la imagen '+item.page+' corresponde a '+item.answer+'.',
        imageSrc:images[String(item.page)]||'',
        imageAlt:'Imagen '+item.page+' del PDF P1 Micro Práctica',
        visualRecognitionId:'micro-p1-practica-pdf-'+String(item.page).padStart(3,'0'),
        visualClues:['Imagen original '+item.page+' del PDF.','Respuesta del gabarito: '+item.answer+'.','Fuente: P1 Micro Práctica.'],
        validationPending:false,
        teacherAngle:'fuente-docente-p1-pdf',
        teacherAngleLabel:'GABARITO DOCENTE · PDF'
      };
    });
  }

  function bank(){
    var practice=window.MedNykutoClassPractice;
    return practice&&practice.banks&&practice.banks[PRACTICE_ID];
  }

  var ready=false;
  var readyPromise=loadSprite().then(function(sprite){
    var images=cropSprite(sprite);
    window.MedNykutoP1PdfQuestions=buildQuestions(images);
    ready=window.MedNykutoP1PdfQuestions.length===EXPECTED_TOTAL;
    if(!ready)throw new Error('Banco visual incompleto');
    syncCopy();
    return true;
  }).catch(function(error){
    ready=false;
    window.MedNykutoP1PdfLoadError=String(error&&error.message||error);
    syncCopy();
    return false;
  });

  function installForOneClick(){
    var target=bank();
    if(!target||!Array.isArray(target.qcm))return false;
    var original=target.qcm;
    var nonVisual=original.filter(function(question){return !(question&&question.visualRecognitionId);});
    target.qcm=nonVisual.concat((window.MedNykutoP1PdfQuestions||[]).slice());
    window.setTimeout(function(){target.qcm=original;},0);
    return true;
  }

  function handleVisualClick(event){
    var button=document.getElementById('p1StartVisual');
    if(!ready){
      event.preventDefault();
      event.stopImmediatePropagation();
      if(button)button.disabled=true;
      readyPromise.then(function(ok){
        if(button)button.disabled=false;
        if(ok&&button)button.click();
      });
      return;
    }
    if(!installForOneClick()){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  function syncCopy(){
    var button=document.getElementById('p1StartVisual');
    if(!button)return;
    var strong=button.querySelector('strong');
    var small=button.querySelector('small');
    var selected=document.querySelector('input[name="p1-correction-mode"]:checked');
    var training=!selected||selected.value==='training';
    if(!ready){
      if(strong)strong.textContent='Preparando 53 imágenes del práctico…';
      if(small)small.textContent='Cargando el PDF y su gabarito docente';
      return;
    }
    if(strong)strong.textContent='Reconocer 53 imágenes · '+(training?'corrección inmediata':'corrección al final');
    if(small)small.textContent='50 diagnósticos/estructuras + 3 tinciones · imágenes originales';
  }

  clearStaleVisualSession();
  if(typeof document!=='undefined'){
    var button=document.getElementById('p1StartVisual');
    if(button){
      button.addEventListener('click',handleVisualClick,true);
      syncCopy();
    }
    window.addEventListener('load',function(){
      syncCopy();
      document.querySelectorAll('input[name="p1-correction-mode"]').forEach(function(input){
        input.addEventListener('change',function(){window.setTimeout(syncCopy,0);});
      });
    });
  }
})();
