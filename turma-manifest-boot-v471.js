(function(){
  'use strict';
  var path=location.pathname.match(/^\/turma\/([a-z0-9-]+)\/?$/i);
  var query=new URLSearchParams(location.search).get('class');
  var raw=String((path&&path[1])||query||'').trim().toLowerCase();
  var slug=!raw?'s4-e':/^[a-z0-9][a-z0-9-]{0,30}$/.test(raw)?raw:'invalid-class';
  var link=document.getElementById('classManifest');
  if(link)link.href='/api/class-manifest?class='+encodeURIComponent(slug);
})();
