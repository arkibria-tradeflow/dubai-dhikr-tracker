import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const code=read('phase2-experience.js');
const stylesheet=read('phase2-experience.css');
const page=read('index.html');
const quran=read('reader.html');
const location=read('location-prayers.js');
const worker=read('sw.js');

function launch(){
  const root={classList:{toggle(){}},querySelector(){return null},querySelectorAll(){return []}};
  const context={
    window:{
      DailyZikr21:{exportData:()=>({'2026-11-07':{hawqala:8,istighfar:3,salawat:0}})},
      DhikrGeo:{location:{name:'ঢাকা'}}
    },
    document:{addEventListener(){},getElementById(){return root},querySelector(){return null},querySelectorAll(){return []}},
    sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
    dayInfo:()=>({day:'2026-11-07',tm:{Fajr:'05:00',Dhuhr:'12:00'},now:600}),
    todayStat:()=>({complete:1,stepsDone:3}),
    PRAYERS:[{key:'Fajr',bn:'ফজর'},{key:'Dhuhr',bn:'জোহর'}],
    unlocked:key=>key==='Fajr',
    sessionStats:()=>({started:false,complete:false}),
    validTimes:()=>true,minutes:()=>720,showTime:x=>x,
    expHeader:()=>'<header>Header</header>',expPrayerTiles:()=>'<button>Prayer choices</button>',
    banglaDate:()=> 'শনিবার',bn:n=>String(n),esc:s=>String(s),err:'',
    getHistDate:()=> '2026-11-07',
    renderHistory:()=>'<div class="mini-stats">Existing history</div>',
    nightRecord:()=>({rakaat:2}),
    qdb:{'2026-11-07':['112','113']},dudb:{'2026-11-07':['rizq-need']},
    renderExperienceHome:()=>'<div>Old hero</div>',
    renderExperienceDuaReader:()=>'<div class="ex-reader"><div class="ex-reader-scroll"><div class="ex-reader-paper">Pronunciation</div><div class="ex-reader-meaning">Meaning</div></div><div class="ex-reader-dock"><div class="dua-flow-nav">Existing navigation</div></div></div>',
    selectedDua:'rizq-need',expHas:()=>false,
    render(){},screen:'today',requestAnimationFrame(fn){fn()}
  };
  runInNewContext(code,context,{filename:'phase2-experience.js'});
  return context;
}

test('phase 2 code and inline Quran readers are syntactically valid',()=>{
  assert.doesNotThrow(()=>new Script(code));
  assert.doesNotThrow(()=>new Script(location));
  assert.doesNotThrow(()=>new Script(worker));
  for(const match of quran.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/g)){
    if(/src=|type="application\\/json"/.test(match[1]))continue;
    assert.doesNotThrow(()=>new Script(match[2]));
  }
});

test('Home makes the post-prayer dhikr action primary, and retains other routes',()=>{
  const app=launch();
  const html=app.renderExperienceHome();
  assert.match(html,/data-action="continue"/);
  assert.match(html,/data-d21="open-list"/);
  assert.match(html,/data-screen="prayers"/);
  assert.match(html,/data-screen="night"/);
  assert.match(html,/data-screen="history"/);
  assert.match(html,/ঢাকা/);
  assert.match(html,/11 \\/ ৬৩/);
  assert.doesNotMatch(html,/class="ex-hero ex-mosque"/);
});

test('History counts activities separately without changing existing history',()=>{
  const app=launch();
  const html=app.renderHistory();
  assert.match(html,/p2-history-summary/);
  assert.match(html,/নামাজ-পরবর্তী যিকির/);
  assert.match(html,/ব্যক্তিগত ২১ বার/);
  assert.match(html,/কুরআন পাঠ/);
  assert.match(html,/দোয়া পাঠ/);
  assert.match(html,/রাতের নামাজ/);
  assert.match(html,/Existing history/);
  assert.match(html,/11 \\/ ৬৩/);
});

test('Dua reader keeps list navigation and offers reading tabs and save action',()=>{
  const app=launch();
  const html=app.renderExperienceDuaReader();
  assert.match(html,/p2-reader-tabs/);
  assert.match(html,/data-p2="dua-mode"/);
  assert.match(html,/data-p2="dua-complete"/);
  assert.match(html,/dua-flow-nav/);
  assert.match(html,/aria-selected="true"/);
  assert.match(html,/class="ex-reader-meaning" hidden/);
});

test('location onboarding, Quran tab semantics, and PWA assets are registered',()=>{
  assert.match(location,/<details class="p2-advanced">/);
  assert.match(location,/ধাপ ১ \\/ ২/);
  assert.match(page,/phase2-experience.js\\?v=1.0.0/);
  assert.match(page,/phase2-experience.css\\?v=1.0.0/);
  assert.match(quran,/phase2-experience.css\\?v=1.0.0/);
  assert.match(quran,/role="tablist"/);
  assert.match(quran,/aria-selected/);
  assert.match(stylesheet,/p2-reader-standard/);
  assert.match(worker,/dubai-dhikr-v10.9.0/);
  assert.match(worker,/'\\.\\/phase2-experience.js'/);
});
