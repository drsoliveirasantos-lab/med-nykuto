(function(){
  'use strict';

  var practice = window.MedNykutoClassPractice;
  var community = window.MedNykutoCommunity;
  if(!practice || !practice.banks || typeof practice.mountStandalone !== 'function' || !community) return;

  var banks = practice.banks;
  var activeSubject = 'nutricion';
  var activeTopic = '';
  var lastResult = null;
  var publishing = false;

  var subjects = [
    {id:'nutricion',icon:'class-icon-nutrition',es:'Nutrición',br:'Nutrição'},
    {id:'fisiologia',icon:'class-icon-physiology',es:'Fisiología II',br:'Fisiologia II'},
    {id:'bioquimica',icon:'class-icon-biochemistry',es:'Bioquímica II',br:'Bioquímica II'},
    {id:'epidemiologia',icon:'class-icon-epidemiology',es:'Epidemiología',br:'Epidemiologia'},
    {id:'microbiologia-teorica',icon:'class-icon-microbiology',es:'Microbiología · Teórica',br:'Microbiologia · Teórica'},
    {id:'microbiologia-practica',icon:'class-icon-lab',es:'Microbiología · Práctica',br:'Microbiologia · Prática'}
  ];

  var preferredTopicOrder = [
    'nutricion',
    'fisiologia-2026-08-20',
    'fisiologia-2026-08-17',
    'fisiologia-2026-08-13',
    'fisiologia-2026-08-10',
    'bioquimica-2026-08-21',
    'bioquimica-2026-08-19',
    'bioquimica',
    'epidemiologia-2026-08-19',
    'epidemiologia',
    'microbiologia-teorica-2026-08-17',
    'microbiologia-teorica',
    'microbiologia-practica-2026-08-20',
    'microbiologia-practica'
  ];

  function t(key,variables){ return community.t(key,variables); }
  function lang(){ return community.getLanguage(); }
  function element(tag,className,text){
    var node = document.createElement(tag);
    if(className) node.className = className;
    if(text !== undefined) node.textContent = text;
    return node;
  }
  function subjectName(subject){ return subject[lang()] || subject.es; }
  function exact(value){
    var service = window.MedNykutoClassI18n;
    return lang() === 'br' && service && service.exact && service.exact[value] ? service.exact[value] : value;
  }
  function topicIds(subjectId){
    return Object.keys(banks).filter(function(id){
      var bank = banks[id];
      return (bank.sectionId || bank.courseId) === subjectId;
    }).sort(function(left,right){
      var a = preferredTopicOrder.indexOf(left);
      var b = preferredTopicOrder.indexOf(right);
      return (a === -1 ? 999 : a) - (b === -1 ? 999 : b);
    });
  }
  function questionTotal(bank){
    return ['qcm','vf','cases'].reduce(function(total,type){
      return total + (Array.isArray(bank[type]) ? bank[type].length : 0);
    },0);
  }
  function iconUse(iconId){
    var span = element('span','study-picker-icon');
    span.innerHTML = '<svg aria-hidden="true"><use href="#' + iconId + '"></use></svg>';
    return span;
  }

  function renderSubjects(){
    var picker = document.getElementById('studySubjectPicker');
    if(!picker) return;
    picker.replaceChildren();
    subjects.forEach(function(subject){
      var count = topicIds(subject.id).length;
      var button = element('button','study-subject-option');
      button.type = 'button';
      button.dataset.studySubject = subject.id;
      button.setAttribute('aria-pressed',subject.id === activeSubject ? 'true' : 'false');
      button.appendChild(iconUse(subject.icon));
      var copy = element('span','study-picker-copy');
      copy.appendChild(element('strong','',subjectName(subject)));
      copy.appendChild(element('small','',count === 1 ? t('oneTopic') : t('topics',{count:count})));
      button.appendChild(copy);
      button.addEventListener('click',function(){
        activeSubject = subject.id;
        activeTopic = topicIds(activeSubject)[0] || '';
        lastResult = null;
        render();
      });
      picker.appendChild(button);
    });
  }

  function renderTopics(){
    var picker = document.getElementById('studyTopicPicker');
    if(!picker) return;
    picker.replaceChildren();
    var ids = topicIds(activeSubject);
    if(ids.indexOf(activeTopic) === -1) activeTopic = ids[0] || '';
    ids.forEach(function(id,index){
      var bank = banks[id];
      var button = element('button','study-topic-option');
      button.type = 'button';
      button.dataset.studyTopic = id;
      button.setAttribute('aria-pressed',id === activeTopic ? 'true' : 'false');
      button.appendChild(element('span','study-topic-number',String(index + 1).padStart(2,'0')));
      var copy = element('span','study-topic-copy');
      copy.appendChild(element('strong','',exact(bank.title)));
      copy.appendChild(element('small','',t('questionCount',{count:questionTotal(bank)})));
      button.appendChild(copy);
      if(bank.lessonDateLabel) button.appendChild(element('span','study-topic-date',bank.lessonDateLabel));
      button.addEventListener('click',function(){
        activeTopic = id;
        lastResult = null;
        renderTopics();
        hidePublishPanel();
        mountPractice();
      });
      picker.appendChild(button);
    });
  }

  function mountPractice(){
    var host = document.getElementById('studyPracticeHost');
    if(!host || !activeTopic) return;
    practice.mountStandalone(host,activeTopic);
  }

  function hidePublishPanel(){
    var panel = document.getElementById('studyPublishPanel');
    if(panel) panel.hidden = true;
  }

  function aggregateScore(result){
    if(!result) return {correct:0,total:0};
    return {
      correct:Number.isFinite(Number(result.aggregateCorrect)) ? Number(result.aggregateCorrect) : Number(result.correct) || 0,
      total:Number.isFinite(Number(result.aggregateTotal)) ? Number(result.aggregateTotal) : Number(result.total) || 0
    };
  }

  function renderResult(){
    var panel = document.getElementById('studyPublishPanel');
    var score = aggregateScore(lastResult);
    if(!panel || !lastResult || !score.total){ hidePublishPanel(); return; }
    var closed = typeof community.isChallengeClosed === 'function' && community.isChallengeClosed();
    panel.hidden = false;
    document.getElementById('studyPublishTitle').textContent = t('publishTitle',{score:score.correct,total:score.total});
    document.getElementById('studyPublishCopy').textContent = t('publishCopy');
    document.getElementById('studyPublishButton').disabled = publishing || closed;
    document.getElementById('studyPublishButton').textContent = closed ? t('publishClosedButton') : publishing ? t('publishing') : t('publishButton');
  }

  function rememberProgress(event,scroll){
    if(!event.detail || event.detail.topicId !== activeTopic) return;
    var score = aggregateScore(event.detail);
    lastResult = score.total ? event.detail : null;
    var status = document.getElementById('studyPublishStatus');
    status.textContent = '';
    status.removeAttribute('data-state');
    renderResult();
    if(scroll && lastResult) document.getElementById('studyPublishPanel').scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function handleCompleted(event){ rememberProgress(event,true); }
  function handleProgress(event){ rememberProgress(event,false); }

  function publish(){
    if(!lastResult || publishing) return;
    var publishedResult = lastResult;
    var profile = community.getProfile();
    var status = document.getElementById('studyPublishStatus');
    if(typeof community.isChallengeClosed === 'function' && community.isChallengeClosed()){
      status.dataset.state = 'error';
      status.textContent = t('publishClosed');
      renderResult();
      return;
    }
    if(typeof community.isProfileReady === 'function' ? !community.isProfileReady(profile) : (!profile.fullName || !profile.catraca || profile.classConfirmed !== true || !profile.accessToken)){
      status.dataset.state = 'error';
      status.textContent = t('nicknameNeeded');
      var identity = document.getElementById('communityDisplayName');
      if(identity){ identity.focus(); identity.scrollIntoView({behavior:'smooth',block:'center'}); }
      return;
    }
    publishing = true;
    document.getElementById('studyPublishButton').disabled = true;
    renderResult();
    var scores = Array.isArray(publishedResult.scores) && publishedResult.scores.length ? publishedResult.scores : [publishedResult];
    var publishRequest = typeof community.publishScores === 'function' ? community.publishScores(scores) : community.publishScore(publishedResult);
    publishRequest.then(function(data){
      if(lastResult !== publishedResult) return;
      status.dataset.state = 'success';
      status.textContent = data.saved ? t('publishSuccess') : t('publishKept');
    }).catch(function(error){
      if(lastResult !== publishedResult) return;
      status.dataset.state = 'error';
      status.textContent = error && error.code === 'challenge_closed'
        ? t('publishClosed')
        : error && error.code === 'identity_required'
          ? t('identityExpired')
          : t('publishError');
    }).finally(function(){
      publishing = false;
      document.getElementById('studyPublishButton').disabled = false;
      renderResult();
    });
  }

  function render(){
    renderSubjects();
    renderTopics();
    mountPractice();
    renderResult();
  }

  function refreshLanguage(){
    render();
  }

  function init(){
    activeTopic = topicIds(activeSubject)[0] || '';
    document.addEventListener('mednykuto:practice-complete',handleCompleted);
    document.addEventListener('mednykuto:practice-progress',handleProgress);
    document.getElementById('studyPublishButton').addEventListener('click',publish);
    render();
  }

  window.MedNykutoCommunityStudy = {
    refreshLanguage:refreshLanguage,
    challengeStateChanged:renderResult,
    profileChanged:function(){
      var status = document.getElementById('studyPublishStatus');
      if(status && status.dataset.state === 'error'){
        status.textContent = '';
        status.removeAttribute('data-state');
      }
    }
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
