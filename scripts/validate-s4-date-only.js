#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
function extract(source, name) {
  const start = source.indexOf('  function '+name+'(');
  assert.ok(start >= 0, name);
  const end = source.indexOf('\n  function ', start+1);
  return source.slice(start, end < 0 ? undefined : end)+'\n';
}
async function main() {
  for (const file of ['gestion-v440.js','turma-v471.js','class-hub-runtime-v440.js']) {
    const context=vm.createContext({});
    vm.runInContext(extract(read(file),'dateOnlyLabel'),context);
    for (const value of ['2026-10-02','2028-02-29','2026-12-31']) {
      assert.ok(context.dateOnlyLabel(value).includes(value.split('-').reverse().join('/')));
      assert.ok(!context.dateOnlyLabel(value).includes('00:00'));
    }
    for (const value of ['2026-02-29','2026-02-31','2026-13-01','2026-00-12','2026-10-00','2026-10-02T10:30','']) assert.equal(context.dateOnlyLabel(value),'');
  }
  const source=read('gestion-v440.js'),context=vm.createContext({classSlug:'s4-e'});
  vm.runInContext(extract(source,'localDateTime')+extract(source,'deadlineInputValue'),context);
  for(const value of ['2026-10-02','2026-10-02T10:30:00-03:00',''])assert.equal(context.deadlineInputValue(value),value);
  assert.equal(context.localDateTime('2026-10-02T10:30:00-03:00'),'2026-10-02T10:30','Non-deadline fields retain their behavior in S4.');
  context.classSlug='s5-a';assert.equal(context.deadlineInputValue('2026-10-02T10:30:00-03:00'),'2026-10-02T10:30');
  let now=0,civilConversions=0;
  class Clock extends Date {
    constructor(...args){if(args.length&&/^\d{4}-\d{2}-\d{2}$/.test(String(args[0])))civilConversions++;super(...(args.length?args:[now]));}
    static now(){return now;}
  }
  const tasks=vm.createContext({Date:Clock,Intl,slug:'s4-e'});
  vm.runInContext(extract(read('turma-v471.js'),'dateOnlyLabel')+extract(read('turma-v471.js'),'activeTask'),tasks);
  for(const [instant,dueAt,expected] of [
    ['2026-10-02T23:59:59Z','2026-10-02',true], // 20:59:59 Paraguay
    ['2026-10-03T00:00:00Z','2026-10-02',true], // formerly lost after 21:00
    ['2026-10-03T02:59:59Z','2026-10-02',true],
    ['2026-10-03T03:00:00Z','2026-10-02',false],
    ['2027-01-01T02:59:59Z','2026-12-31',true],
    ['2027-01-01T03:00:00Z','2026-12-31',false],
    ['2028-03-01T02:59:59Z','2028-02-29',true],
    ['2028-03-01T03:00:00Z','2028-02-29',false]
  ]){now=Date.parse(instant);assert.equal(tasks.activeTask({dueAt,status:'published'}),expected,instant);}
  assert.equal(civilConversions,0,'S4 civil deadlines must never be parsed as instants.');
  assert.equal(tasks.activeTask({dueAt:'2099-10-02',status:'archived'}),false);
  assert.equal(tasks.activeTask({}),true);
  now=Date.parse('2026-10-03T01:00:00Z');
  for(const slug of ['s4-e','s5-a']){
    tasks.slug=slug;
    for(const dueAt of ['2026-10-02T10:30:00-03:00','2026-10-01T10:30:00-03:00'])assert.equal(tasks.activeTask({dueAt}),new Date(dueAt).getTime()>=now-86400000);
  }
  assert.equal(tasks.activeTask({dueAt:'2026-10-02'}),false,'Other-class date filtering is unchanged.');
  const calendar=await import('data:text/javascript;base64,'+Buffer.from(read('functions/api/class-calendar.ics.js')).toString('base64'));
  const body=calendar.buildCalendar({id:'s4-e',name:'S4-E'},[{id:'date',label:'Synthetic date',startsAt:'2026-10-02'}],[{id:'task',title:'Synthetic task',dueAt:'2028-02-29'}]);
  const events=body.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g);
  assert.equal(events.length,2);
  assert.match(events[0],/DTSTART;VALUE=DATE:20261002\r\n/);
  assert.match(events[1],/DTSTART;VALUE=DATE:20280229\r\n/);
  events.forEach(event=>assert.ok(!/DTSTART;TZID|DTSTART:|DTEND/.test(event)));
  assert.equal(calendar.calendarDateProperty('2026-02-31'),'');
  assert.match(calendar.calendarDateProperty('2026-10-02T10:30'),/TZID=America\/Asuncion:20261002T103000/);
  console.log('S4 date-only validation passed (civil dates, end-of-day/year/leap boundaries, isolation, preservation, ICS).');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
