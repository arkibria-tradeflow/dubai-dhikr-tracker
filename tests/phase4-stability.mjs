import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const controller=read('phase4-stability.js');
const core=read('app.js');
const location=read('location-prayers.js');
const index=read('index.html');
const worker=read('sw.js');

function harness(){
  const time={day:'2026-11-26',now:650,tm:{Fajr:'05:00',Dhuhr:'12:05',Asr:'15:20',Maghrib:'17:45',Isha:'19:05'}};
  let renders=0;
  const env={
    window:{},
    screen:'today',
    PRAYERS:['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(key=>({key})),
    dayInfo:()=>time,
    validTimes:tm=>Boolean(tm?.Fajr&&tm?.Dhuhr&&tm?.Asr&&tm?.Maghrib&&tm?.Isha),
    minutes:s=>{const [h,m]=s.split(':').map(Number);return h*60+m},
    render:()=>{renders++;return 'updated';}
  };
  runInNewContext(controller,env,{filename:'phase4-stability.js'});
  return {env,time,count:()=>renders,tick:()=>env.window.DhikrStableTick()};
}

test('stability controller and changed scripts have valid JavaScript',()=>{
  for(const p of ['phase4-stability.js','app.js','location-prayers.js','sw.js']){
    assert.doesNotThrow(()=>new Script(read(p),{filename:p}));
  }
});

test('idle clock changes do not rerender Home or session',()=>{
  const h=harness();
  assert.equal(h.tick(),false);
  h.time.now=651;
  assert.equal(h.tick(),false);
  h.time.now=700;
  assert.equal(h.tick(),false);
  assert.equal(h.count(),0);
  h.env.screen='session';
  h.env.render();
  h.time.now=710;
  assert.equal(h.tick(),false);
  assert.equal(h.count(),1);
});

test('crossing a prayer boundary redraws exactly once',()=>{
  const h=harness();
  h.time.now=725; // Dhuhr 12:05
  assert.equal(h.tick(),true);
  assert.equal(h.count(),1);
  assert.equal(h.tick(),false);
  assert.equal(h.count(),1);
  h.time.now=920; // Asr 15:20
  assert.equal(h.tick(),true);
  assert.equal(h.count(),2);
});

test('newly verified prayer timetable causes one update',()=>{
  const h=harness();
  h.time.tm=null;
  assert.equal(h.tick(),true);
  assert.equal(h.tick(),false);
  h.time.tm={Fajr:'05:00',Dhuhr:'12:05',Asr:'15:20',Maghrib:'17:45',Isha:'19:05'};
  assert.equal(h.tick(),true);
  assert.equal(h.count(),2);
});

test('other screens never redraw on a background tick',()=>{
  const h=harness();
  h.env.screen='dua-reader';
  h.time.now=900;
  assert.equal(h.tick(),false);
  assert.equal(h.count(),0);
});

test('clock loop delegates to stable tick and checks on app resume',()=>{
  assert.match(core,/setInterval\(refreshOnClockTick,15000\)/);
  assert.match(core,/window\.DhikrStableTick\(\)/);
  assert.match(core,/document\.addEventListener\('visibilitychange'/);
  assert.doesNotMatch(core,/else if\(screen==='today'\|\|screen==='session'\)\{if\(screen==='session'&&!unlocked\(prayer\)\)screen='today';render\(\)\}/);
});

test('background calendar refresh only rerenders if visible day changed',()=>{
  assert.match(location,/const visibleDate=locationDay\(\)\.day,previousVisible=/);
  assert.match(location,/const visibleChanged=JSON\.stringify\(times\[visibleDate\]\|\|null\)!==previousVisible/);
  assert.match(location,/if\(\(visibleChanged\|\|screen==='night'\)/);
});

test('PWA and index include stable clock script',()=>{
  assert.match(index,/phase4-stability\.js\?v=1\.0\.0/);
  assert.match(index,/app\.js\?v=9\.0\.\d+/);
  assert.match(index,/location-prayers\.js\?v=10\.9\.1/);
  assert.match(worker,/'\.\/phase4-stability\.js'/);
  assert.match(worker,/const CACHE='dubai-dhikr-v\d+\.\d+\.\d+'/);
});
