import {readFileSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const source=read('v9-native-links.js');
const css=read('quran-compact.css');
const index=read('index.html');
const sw=read('sw.js');

function renderCatalog(tab='ten',readCount=2){
  const original=()=>[
    '<div class="ex-view">',
    '<header class="ex-top"><div class="ex-appmark">যিকির <small>THE HOLY QUR’AN</small></div>',
    '<button data-action="nav" data-screen="settings" aria-label="সেটিংস">⚙</button></header>',
    '<span class="ex-kicker">✦ QUR’AN LIBRARY</span>',
    '<h1 class="ex-page-title">আল-কুরআন</h1>',
    '<p class="ex-subcopy">শুধু বাংলা উচ্চারণে সহজ পাঠ। আপনার ১০টি ছোট সুরা প্রস্তুত রয়েছে।</p>',
    '<div class="ex-quran-banner"><span>۞</span><div><small>YOUR READING JOURNEY</small>',
    '<strong>পড়ুন, শিখুন, আল্লাহকে স্মরণ করুন</strong><p>আজ ২টি সুরা পড়েছেন</p></div></div>',
    '<div class="ex-segment" role="tablist"><button data-exp="quran-tab" data-tab="ten">সহজ ১০টি সুরা</button>',
    '<button data-exp="quran-tab" data-tab="all">সব ১১৪টি</button></div>',
    '<label class="ex-search"><input id="ex-search-surah" type="search"></label>',
    '<div class="ex-surah-list"><button>old</button></div>',
    '<p id="ex-search-empty" hidden>Empty</p></div>'
  ].join('');
  const offline=[103,105,106,107,108,109,110,112,113,114];
  const ctx={
    NIGHT_SURAHS:offline.map(n=>({n,title:'সুরা '+n})),
    SURA_BY_NO:new Map(offline.map(n=>[n,{n,title:'সুরা '+n}])),
    QURAN_NAMES:Array.from({length:114},(_,i)=>String(i+1)),
    quranTab:tab,qdb:{'2026-11-26':Array.from({length:readCount},(_,i)=>String(offline[i]))},
    dayInfo:()=>({day:'2026-11-26'}),
    bn:n=>String(n),esc:s=>String(s),
    expHas:(db,id)=>(db['2026-11-26']||[]).includes(String(id)),
    renderExperienceQuran:original,URLSearchParams,
    location:{search:''},screen:'quran',render:()=>{}
  };
  runInNewContext(source,ctx);
  return ctx.renderExperienceQuran();
}

test('new compact Quran page compiles',()=>{
  assert.doesNotThrow(()=>new Script(source));
});
test('hero and duplicate headings are replaced with one small semantic intro',()=>{
  const html=renderCatalog();
  assert.match(html,/class="ex-view qc-quran-page"/);
  assert.match(html,/<section class="qc-intro" aria-labelledby="qc-title">/);
  assert.match(html,/<h1 id="qc-title">আল-কুরআন<\/h1>/);
  assert.match(html,/৩০টি সুরা উপলব্ধ/);
  assert.match(html,/১০টি অফলাইনে/);
  assert.match(html,/আজ পড়েছেন/);
  assert.match(html,/<strong>2 <small>টি<\/small><\/strong>/);
  assert.doesNotMatch(html,/<div class="ex-quran-banner">/);
  assert.doesNotMatch(html,/<span class="ex-kicker">✦ QUR’AN LIBRARY<\/span>/);
  assert.doesNotMatch(html,/YOUR READING JOURNEY/);
  assert.doesNotMatch(html,/THE HOLY QUR’AN/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.match(html,/data-screen="settings"/);
});
test('30 supported surahs and all 114 list retain their actual availability',()=>{
  const ten=renderCatalog('ten');
  const all=renderCatalog('all');
  assert.equal((ten.match(/<a class="ex-surah-row/g)||[]).length,30);
  assert.equal((ten.match(/aria-disabled="true"/g)||[]).length,0);
  assert.equal((all.match(/<a class="ex-surah-row/g)||[]).length,30);
  assert.equal((all.match(/aria-disabled="true"/g)||[]).length,84);
  assert.match(ten,/href="\.\/reader\.html\?surah=78&from=ten"/);
  assert.match(all,/href="\.\/reader\.html\?surah=78&from=all"/);
  assert.match(ten,/id="ex-search-surah"/);
  assert.match(all,/data-exp="quran-tab"/);
});
test('styles scope to Quran only, keep tap targets and updated PWA cache',()=>{
  assert.match(css,/\.qc-quran-page \.ex-top/);
  assert.match(css,/\.qc-intro/);
  assert.match(css,/\.qc-quran-page \.ex-segment button/);
  assert.match(css,/min-height: 44px/);
  assert.match(css,/@media \(max-width: 355px\)/);
  assert.match(index,/quran-compact\.css\?v=1\.0\.0/);
  assert.match(index,/v9-native-links\.js\?v=9\.2\.0/);
  assert.match(sw,/const CACHE='dubai-dhikr-v\d+\.\d+\.\d+'/);
  assert.match(sw,/'\.\/quran-compact\.css'/);
});
