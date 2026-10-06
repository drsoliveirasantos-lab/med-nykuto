// Real Chromium service worker against a loopback-only server; no private site or session.
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const newCache='med-nykuto-shell-v510-s4-dates-r2',oldCache='med-nykuto-shell-v510';
const versions=[['turma-v471.js','488'],['class-hub-runtime-v440.js','501'],['gestion-v440.js','492']];
const fixture={ok:true,class:{id:'s4-e',slug:'s4-e',name:'S4-E'},subjects:[],tasks:[{id:'civil-task',course:'Test',title:'Synthetic deadline',dueAt:'2026-10-02',status:'published'}],dates:[],notices:[]};
let phase='old';
const requests=[];
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');requests.push(url.pathname+url.search);
  res.setHeader('Cache-Control','no-store');
  if(url.pathname==='/api/class-hub'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(fixture));return;}
  if(url.pathname==='/cache-probe.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Local cache fixture</title><p>Local cache fixture</p>');return;}
  const rel=url.pathname.startsWith('/turma/')?'turma-shell/index.html':url.pathname.startsWith('/gestion/')?'gestion-shell/index.html':url.pathname.slice(1);
  let file=path.resolve(root,rel);
  if(file.startsWith(root+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  let body=fs.readFileSync(file);
  if(rel==='service-worker.js'&&phase!=='new')body=Buffer.from(body.toString().replaceAll('-s4-dates-r2',''));
  if(phase==='old'&&versions.some(([name,version])=>rel===name&&url.searchParams.get('v')===version))body=Buffer.from('window.__staleDeadlineRuntime=true;');
  res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(body);
});
async function main(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  let browser;
  try{
    browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
    const context=await browser.newContext({timezoneId:'America/Asuncion',serviceWorkers:'allow',viewport:{width:390,height:844}});
    // Only loopback resources; do not load any third-party web assets or authenticated profile.
    await context.route(url=>url.origin!==origin,route=>route.abort());
    const page=await context.newPage();
    page.on('pageerror',error=>console.log('Local page error: '+error.message));
    page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(15000);
    await page.clock.setFixedTime(new Date('2026-10-03T00:01:00Z'));
    await page.goto(origin+'/cache-probe.html');
    console.log('SW test: installing old worker.');
    await Promise.race([page.evaluate(async()=>{await navigator.serviceWorker.register('/service-worker.js');await navigator.serviceWorker.ready;}),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Local worker installation timed out')),15000).unref())]);
    await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
    await page.waitForFunction(()=>navigator.serviceWorker.controller.state==='activated');
    console.log('SW test: old worker controls page.');
    await page.evaluate(async({oldCache,versions})=>{
      const cache=await caches.open(oldCache);
      for(const [name,version] of versions)await cache.put('/'+name+'?v='+version,new Response('window.__staleDeadlineRuntime=true;',{headers:{'Content-Type':'text/javascript'}}));
      const unrelated=await caches.open('unrelated-application-cache');await unrelated.put('/unrelated',new Response('keep'));
      await cache.put('/turma/s5-a',new Response('<!doctype html><title>S5-A retained snapshot</title><h1>S5-A synthetic offline snapshot</h1><script src="/saved-s5.js"></script>',{headers:{'Content-Type':'text/html'}}));
      await cache.put('/saved-s5.js',new Response('window.savedS5Asset="retained";',{headers:{'Content-Type':'text/javascript'}}));
    },{oldCache,versions});
    await page.addScriptTag({url:origin+'/turma-v471.js?v=488'});
    assert.equal(await page.evaluate(()=>window.__staleDeadlineRuntime),true,'The old cache fixture must really be served.');
    phase='assets';
    console.log('SW test: loading new assets under old worker.');
    await page.goto(origin+'/turma/s4-e');
    await page.locator('#homeTasks [data-task-id="civil-task"]').waitFor();
    assert.match(await page.locator('#homeTasks').textContent(),/02\/10\/2026.*Todo el día/);
    assert.equal(await page.evaluate(()=>Boolean(window.__staleDeadlineRuntime)),false,'An old worker must load the new versioned runtime on first navigation.');
    assert.ok((await page.evaluate(()=>caches.keys())).includes(oldCache),'First-navigation check must run with the old worker cache still present.');
    await page.waitForLoadState('networkidle');
    phase='new';
    console.log('SW test: activating updated worker.');
    await page.evaluate(async()=>{const registration=await navigator.serviceWorker.getRegistration();await registration.update();});
    await page.waitForFunction(async newCache=>(await caches.keys()).includes(newCache),newCache);
    await page.waitForFunction(()=>navigator.serviceWorker.controller&&navigator.serviceWorker.controller.state==='activated');
    assert.ok((await page.evaluate(()=>caches.keys())).includes('unrelated-application-cache'));
    assert.ok((await page.evaluate(()=>caches.keys())).includes(oldCache),'The previous class cache must not be purged.');
    const preserved=await page.evaluate(async oldCache=>{const cache=await caches.open(oldCache);return {html:await (await cache.match('/turma/s5-a')).text(),asset:await (await cache.match('/saved-s5.js')).text()};},oldCache);
    assert.match(preserved.html,/S5-A synthetic offline snapshot/);assert.equal(preserved.asset,'window.savedS5Asset="retained";');
    await page.reload();
    await page.locator('#homeTasks [data-task-id="civil-task"]').waitFor();
    await page.waitForFunction(async newCache=>Boolean(await (await caches.open(newCache)).match(location.href)),newCache);
    await page.waitForLoadState('networkidle');
    // Remove only the new S4 snapshot and retain an old one: current shell must win over stale HTML.
    await page.evaluate(async({newCache,oldCache})=>{const cache=await caches.open(newCache);for(const request of await cache.keys())if(new URL(request.url).pathname==='/turma/s4-e')await cache.delete(request);await (await caches.open(oldCache)).put('/turma/s4-e',new Response('<title>STALE S4 SNAPSHOT</title>',{headers:{'Content-Type':'text/html'}}));},{newCache,oldCache});
    await context.setOffline(true);
    console.log('SW test: offline reload.');
    await page.reload();
    await page.locator('#homeTasks [data-task-id="civil-task"]').waitFor();
    assert.match(await page.locator('#homeTasks').textContent(),/02\/10\/2026.*Todo el día/);
    assert.equal(await page.evaluate(()=>Boolean(navigator.serviceWorker.controller)),true);
    await page.goto(origin+'/turma/s5-a');
    assert.equal(await page.title(),'S5-A retained snapshot');
    assert.equal(await page.evaluate(()=>window.savedS5Asset),'retained','Another class must keep its offline assets as well as its HTML.');
    await page.goto(origin+'/turma/s6-a');
    assert.match(await page.title(),/Sin conexión/,'An uncached other class keeps the existing fallback.');
    await page.goto(origin+'/turma/s4-e');
    await page.locator('#homeTasks [data-task-id="civil-task"]').waitFor();
    await context.setOffline(false);
    await page.clock.setFixedTime(new Date('2026-10-03T03:00:00Z'));
    await page.reload();
    await page.locator('#homeTasks .empty-card').waitFor();
    assert.equal(await page.locator('#homeTasks [data-task-id="civil-task"]').count(),0,'The prior civil day must expire at the next Paraguay day.');
    await page.goto(origin+'/clase.html#pendientes');
    await page.locator('[data-live-task-id="civil-task"]').waitFor();
    assert.equal(await page.evaluate(()=>Boolean(window.__staleDeadlineRuntime)),false);
    await page.goto(origin+'/gestion/s4-e');
    assert.equal(await page.locator('#taskDueAtInput').getAttribute('type'),'text');
    for(const [name,version] of versions)assert.ok(requests.includes('/'+name+'?v='+version+'-s4-dates-r2'),'Missing versioned network request: '+name);
    console.log('Service worker passed: old caches retained; S5 snapshot and JS usable offline after activation; current S4 shell wins over stale S4 HTML; uncached other class unchanged; next-day expiry; all versioned runtimes.');
    await context.close();
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
