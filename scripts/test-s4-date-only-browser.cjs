// Local synthetic fixtures only; never contacts production or logs in.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const fixture={ok:true,class:{id:'s4-e',slug:'s4-e',name:'S4-E',semester:4},subjects:[],tasks:[{id:'civil-task',course:'Test',title:'Synthetic deadline',dueAt:'2099-10-02',status:'published'}],dates:[{id:'civil-date',label:'Synthetic calendar',startsAt:'2099-10-02'}],notices:[{id:'source-test',title:'Synthetic provenance',body:'Fixture',status:'published',targetType:'task',targetId:'civil-task',sourceLabel:'Synthetic source',sourceUrl:'https://example.test/evidence'},{id:'unrelated',title:'Other',body:'Fixture',status:'published',targetType:'task',targetId:'other-task',sourceLabel:'Must not leak'}]};
async function main(){
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const timezoneId of ['America/Asuncion','Pacific/Honolulu','Asia/Tokyo']){
      const context=await browser.newContext({timezoneId,viewport:{width:390,height:844},serviceWorkers:'block'});
      await context.route('**/*',async route=>{
        const url=new URL(route.request().url());
        if(url.hostname!=='med-local.test')return route.abort();
        if(url.pathname==='/api/class-hub')return route.fulfill({json:fixture});
        const rel=url.pathname.startsWith('/turma/')?'turma-shell/index.html':url.pathname.startsWith('/gestion/')?'gestion-shell/index.html':url.pathname.slice(1);
        const file=path.resolve(root,rel);
        if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
        let body=fs.readFileSync(file);
        // Test-only access to the actual editor functions, without authentication or production hooks.
        if(rel==='gestion-v440.js')body=Buffer.from(body.toString().replace(/\}\)\(\);\s*$/, 'window.__deadlineTest={setField:setField,showForm:showForm,taskFields:taskFields,dateFields:dateFields};})();'));
        return route.fulfill({body,contentType:({'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json'})[path.extname(file)]||'application/octet-stream'});
      });
      const page=await context.newPage();
      await page.goto('https://med-local.test/turma/s4-e');
      await page.locator('#homeTasks [data-task-id="civil-task"]').waitFor();
      const text=await page.locator('#homeTasks').textContent();
      assert.match(text,/02\/10\/2099 · Todo el día \(hora no indicada\)/);
      assert.doesNotMatch(text,/00:00|01\/10\/2099|Must not leak/);
      assert.match(text,/Fuente: Synthetic source/);
      assert.match(await page.locator('#dateList').textContent(),/02\/10\/2099 · Todo el día/);
      await page.setViewportSize({width:1280,height:900});
      await page.goto('https://med-local.test/clase.html#pendientes');
      await page.locator('[data-live-task-id="civil-task"]').waitFor();
      const notebook=await page.locator('[data-live-task-id="civil-task"]').textContent();
      assert.match(notebook,/02\/10\/2099 · Todo el día/);
      assert.match(notebook,/Fuente: Synthetic source/);
      assert.doesNotMatch(notebook,/Must not leak/);
      await page.goto('https://med-local.test/gestion/s4-e');
      const input=page.locator('#taskDueAtInput');
      assert.equal(await input.getAttribute('type'),'text');
      for(const value of ['2099-10-02','2099-10-02T10:30','2099-10-02T10:30:00-03:00']){
        assert.equal(await input.evaluate((node,value)=>{node.value=value;return node.value;},value),value);
        assert.equal(await input.evaluate(node=>node.validity.patternMismatch),false);
      }
      for(const value of ['2099-10-02T25:30','2099-10-02T10:99','not a date']){
        assert.equal(await input.evaluate((node,value)=>{node.value=value;return node.validity.patternMismatch;},value),true);
      }
      const recovery=await page.evaluate(()=>{
        const form=document.getElementById('taskForm'),input=form.elements.namedItem('dueAt'),suggested=document.getElementById('taskSuggestedDate'),api=window.__deadlineTest;
        const invalid=()=>{input.value='2026-02-31';input.dispatchEvent(new Event('input',{bubbles:true}));return input.validity.customError;};
        const result={invalidBeforeSuggestion:invalid()};
        const option=new Option('Synthetic next class','2026-03-02T11:20');suggested.add(option);suggested.value=option.value;suggested.dispatchEvent(new Event('change',{bubbles:true}));
        result.suggestionRecovered=input.checkValidity()&&input.value==='2026-03-02T11:20';
        result.invalidBeforeRecord=invalid();
        api.showForm('tasks','taskForm',api.taskFields({id:'valid-record',title:'Valid fixture',course:'Test',dueAt:'2026-03-03',status:'draft'}),'Actualizar tarea');
        result.recordRecovered=input.checkValidity()&&input.value==='2026-03-03';
        result.invalidBeforeClear=invalid();api.setField(form,'dueAt','');result.clearRecovered=input.checkValidity();
        result.invalidBeforeReset=invalid();form.reset();result.resetRecovered=input.checkValidity();
        const dates=document.getElementById('dateForm'),starts=dates.elements.namedItem('startsAt');
        api.setField(dates,'startsAt','2026-02-31');result.invalidDateRecord=starts.validity.customError;
        api.showForm('files','dateForm',api.dateFields({id:'date-valid',label:'Valid fixture',startsAt:'2026-03-03',status:'draft'}),'Actualizar fecha');
        result.dateRecordRecovered=starts.checkValidity()&&starts.value==='2026-03-03';
        return result;
      });
      for(const [scenario,passed] of Object.entries(recovery))assert.equal(passed,true,scenario);
      await page.goto('https://med-local.test/gestion/s5-a');
      assert.equal(await page.locator('#taskDueAtInput').getAttribute('type'),'datetime-local');
      await context.close();
      console.log('Browser passed: '+timezoneId+' (390px public, 1280px notebook/management, S4 date/source, other-class isolation).');
    }
  }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
