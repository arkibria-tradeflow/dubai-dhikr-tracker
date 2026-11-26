import {readFileSync} from 'node:fs';
import {runInNewContext, Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const fn=(p,a,b)=>{
  const source=read(p);
  const start=source.indexOf(a),end=source.indexOf(b,start+a.length);
  assert.ok(start!==-1&&end>start,'Function extraction anchor missing: '+a);
  return source.slice(start,end);
};
const countCode=fn('app.js','function countChange(id,delta){','function prevDate(');
const nightCode=fn('tahajjud.js','function nightMutate(fn){','function nReaderParagraphs(');
const toggleCode=fn('experience.js','function expToggle(kind,id){','function expIcon(');

function counterHarness(saved=true,prior=0){
  const steps=[{id:'first',repeat:3}];
  const key='2026-11-26|Fajr';
  const old={version:1,sessions:prior?{[key]:{items:{first:{count:prior,completedAt:null}}}}:{}};
  let writes=0,renders=0,finishCalls=0,persisted=null;
  const context={
    db:old,DATA_KEY:'dhikr_dubai_records_v1',STEPS:steps,prayer:'Fajr',
    dayInfo:()=>({day:'2026-11-26'}),unlocked:()=>true,
    stepsFor:()=>steps,keyFor:(day,pr)=>day+'|'+pr,
    target:()=>3,screen:'session',focusId:null,
    navigator:{vibrate(){}},finishing:false,
    safeWrite:(k,v)=>{writes++;if(!saved)return false;persisted=structuredClone(v);return true;},
    render:()=>{renders++},toast:()=>{},
    cancelFinish:()=>{finishCalls++},
    nextUnfinished:()=>null,
    finishToken:0,finishTimer:null,
    setTimeout:()=>{},
    Date
  };
  runInNewContext(countCode,context);
  return {context,old,key,change:(delta=1)=>context.countChange('first',delta),
    stats:()=>({writes,renders,finishCalls,persisted})};
}

function nightHarness(saved=true){
  let writes=0,persisted=null;
  const old={nights:{'2026-11-26':{rakaat:2,witr:false,duas:['a'],surahs:['s']}}};
  const context={
    nightDb:old,nightWindow:()=>({active:true,date:'2026-11-26'}),
    nightRecord:d=>old.nights[d]||{rakaat:0,witr:false,duas:[],surahs:[]},
    NIGHT_STORAGE:'dhikr_dubai_night_v1',
    safeWrite:(k,v)=>{writes++;if(!saved)return false;persisted=structuredClone(v);return true;},
    toast:()=>{},Date
  };
  runInNewContext(nightCode,context);
  return {context,old,change:()=>context.nightMutate(r=>{r.rakaat+=2;r.duas.push('b');r.witr=true}),
    stats:()=>({writes,persisted})};
}

function toggleHarness(saved=true){
  let writes=0,vibrates=0,persisted=null;
  const qdb={'2026-11-26':['112']},dudb={'2026-11-26':['dua1']};
  const context={qdb,dudb,
    dayInfo:()=>({day:'2026-11-26'}),QKEY:'qkey',DUAKEY:'duakey',
    safeWrite:(k,v)=>{writes++;if(!saved)return false;persisted=structuredClone(v);return true;},
    navigator:{vibrate:()=>{vibrates++}}
  };
  runInNewContext(toggleCode,context);
  return {context,qdb,dudb,stats:()=>({writes,vibrates,persisted})};
}

test('modified scripts parse',()=>{
  for(const file of ['app.js','tahajjud.js','experience.js','daily-zikr.js','sw.js']){
    assert.doesNotThrow(()=>new Script(read(file),{filename:file}));
  }
});

test('five-waqt failed save never increments in-memory count or creates a ghost session',()=>{
  const h=counterHarness(false);
  h.change();
  assert.deepEqual(h.old.sessions,{});
  assert.deepEqual(h.context.db.sessions,{});
  assert.equal(h.stats().writes,1);
  assert.equal(h.stats().renders,0);
  assert.equal(h.stats().finishCalls,0);
});

test('failed save on final increment does not trigger a completion state',()=>{
  const h=counterHarness(false,2);
  h.context.screen='focus';h.context.focusId='first';
  h.change();
  assert.equal(h.context.db.sessions[h.key].items.first.count,2);
  assert.equal(h.context.finishing,false);
  assert.equal(h.stats().renders,0);
  assert.equal(h.stats().finishCalls,0);
});

test('successful five-waqt count is persisted before committing new in-memory state',()=>{
  const h=counterHarness(true,1);
  h.change();
  assert.equal(h.old.sessions[h.key].items.first.count,1,'old nested state stays unchanged');
  assert.equal(h.context.db.sessions[h.key].items.first.count,2);
  assert.equal(h.stats().persisted.sessions[h.key].items.first.count,2);
  assert.equal(h.stats().renders,1);
  h.change(-1);
  assert.equal(h.context.db.sessions[h.key].items.first.count,1);
  assert.equal(h.stats().persisted.sessions[h.key].items.first.count,1);
});

test('Tahajjud failure leaves Witr, rakaat and arrays unchanged',()=>{
  const h=nightHarness(false);
  assert.equal(h.change(),false);
  assert.equal(h.old.nights['2026-11-26'].rakaat,2);
  assert.equal(h.old.nights['2026-11-26'].witr,false);
  assert.deepEqual(h.old.nights['2026-11-26'].duas,['a']);
  assert.equal(h.context.nightDb,h.old);
  assert.equal(h.stats().writes,1);
});

test('Tahajjud successful save commits a new record without changing old arrays',()=>{
  const h=nightHarness(true);
  assert.equal(h.change(),true);
  const r=h.context.nightDb.nights['2026-11-26'];
  assert.equal(r.rakaat,4);
  assert.equal(r.witr,true);
  assert.deepEqual(Array.from(r.duas),['a','b']);
  assert.equal(h.old.nights['2026-11-26'].rakaat,2);
  assert.deepEqual(h.old.nights['2026-11-26'].duas,['a']);
  assert.equal(h.stats().persisted.nights['2026-11-26'].rakaat,4);
});

test('Quran and Dua toggle failure does not alter memory or vibrate',()=>{
  const h=toggleHarness(false);
  assert.equal(h.context.expToggle('q',113),false);
  assert.equal(h.context.expToggle('d','dua2'),false);
  assert.deepEqual(h.qdb['2026-11-26'],['112']);
  assert.deepEqual(h.dudb['2026-11-26'],['dua1']);
  assert.equal(h.stats().vibrates,0);
});

test('Quran and Dua completion toggles persist and can undo',()=>{
  const h=toggleHarness(true);
  assert.equal(h.context.expToggle('q',113),true);
  assert.deepEqual(Array.from(h.context.qdb['2026-11-26']),['112','113']);
  assert.equal(h.context.expToggle('q',113),true);
  assert.deepEqual(Array.from(h.context.qdb['2026-11-26']),['112']);
  assert.equal(h.context.expToggle('d','dua2'),true);
  assert.deepEqual(Array.from(h.context.dudb['2026-11-26']),['dua1','dua2']);
  assert.equal(h.stats().vibrates,3);
});

test('Daily 21 already writes before updating in-memory counts',()=>{
  const code=read('daily-zikr.js');
  assert.match(code,/if\(!safeWrite\(KEY,changed\)\)return;\s*records=changed;/);
  assert.match(code,/data-delta="\\?-1/);
});

test('accidental full reset requires confirmation, while single decrement remains available',()=>{
  const source=read('app.js');
  assert.match(source,/data-action="reset-dhikr" data-id="\$\{d\.id\}"/);
  assert.match(source,/else if\(a==='reset-dhikr'\).*confirm\('এই যিকিরের সংরক্ষিত গণনা শূন্য করবেন\?'\)/);
  assert.match(source,/data-action="adjust" data-id="\$\{d\.id\}" data-delta="-1"/);
});
