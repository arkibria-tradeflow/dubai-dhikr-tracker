import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const src=read('dua-compact.js');
const css=read('dua-compact.css');
const index=read('index.html');
const sw=read('sw.js');

function renderDuas(filter='all', completed=['rizq-need']){
  const handlers={};
  const groups=[
    {id:'rizq',name:'অভাব, রিজিক ও ঋণ'},
    {id:'work',name:'ব্যবসা ও কাজের উন্নতি'},
    {id:'family',name:'পরিবার ও দাম্পত্য'}
  ];
  const duas=[
    {id:'rizq-need',group:'rizq',title:'কল্যাণ ও জীবিকার জন্য',ref:'সুরা আল-কাসাস ২৮:২৪'},
    {id:'rizq-halal',group:'rizq',title:'হালাল রিজিক ও ঋণমুক্তি',ref:'জামে আত-তিরমিজি ৩৫৬৩'},
    {id:'work-knowledge',group:'work',title:'সঠিক জ্ঞান ও সিদ্ধান্তের জন্য',ref:'সুরা ত্বহা ২০:১১৪'},
    {id:'family-calm',group:'family',title:'পরিবার ও দাম্পত্য শান্তি',ref:'সুরা আল-ফুরকান ২৫:৭৪'}
  ];
  const env={
    document:{addEventListener:(name,fn)=>{handlers[name]??=[];handlers[name].push(fn)}},
    NIGHT_GROUPS:groups,NIGHT_DUAS:duas,duaFilter:filter,
    dudb:{'2026-11-26':completed},dayInfo:()=>({day:'2026-11-26'}),
    expHas:(db,id)=>(db['2026-11-26']||[]).includes(id),
    expHeader:label=>'<header class="ex-top"><span>'+label+'</span><button data-screen="settings">⚙</button></header>',
    bn:n=>String(n),esc:value=>String(value).replaceAll('"','&quot;'),
    renderExperienceDuas:()=>'<div>old page</div>',
    queueMicrotask,render:()=>{},screen:'duas'
  };
  runInNewContext(src,env,{filename:'dua-compact.js'});
  return {env,html:()=>env.renderExperienceDuas(),handlers};
}

test('scripts parse and the compact assets are registered',()=>{
  assert.doesNotThrow(()=>new Script(src));
  assert.doesNotThrow(()=>new Script(sw));
  assert.match(index,/dua-compact\.css\?v=1\.0\.0/);
  assert.match(index,/dua-compact\.js\?v=1\.0\.0/);
  assert.ok(index.indexOf('dua-compact.js')>index.indexOf('backup-recovery.js'));
  assert.match(sw,/dubai-dhikr-v11\.3\.2/);
  assert.match(sw,/'\.\/dua-compact\.js'/);
  assert.match(sw,/'\.\/dua-compact\.css'/);
});
test('single small Bengali heading replaces duplicated captions and promotional banner',()=>{
  const html=renderDuas().html();
  assert.match(html,/class="ex-view dc-dua-page"/);
  assert.match(html,/<h1 id="dc-title">দোয়া সংগ্রহ<\/h1>/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.match(html,/প্রয়োজন অনুযায়ী দোয়া বেছে নিন/);
  assert.match(html,/দোয়া লাইব্রেরি/);
  assert.doesNotMatch(html,/ASK ALLAH|DU’A COLLECTION|ex-dua-banner/);
  assert.match(html,/<strong>4<\/strong><small>টি দোয়া<\/small>/);
  assert.match(html,/আজ পড়েছেন 1টি/);
});
test('all list, topic filters and existing reading links remain intact',()=>{
  const html=renderDuas().html();
  assert.equal((html.match(/data-exp="dua-open"/g)||[]).length,4);
  assert.equal((html.match(/data-exp="dua-filter"/g)||[]).length,4);
  assert.match(html,/data-exp="dua-open" data-id="rizq-need"/);
  assert.match(html,/data-exp="dua-filter" data-filter="work" aria-pressed="false"/);
  assert.match(html,/data-exp="dua-filter" data-filter="all" aria-pressed="true"/);
  assert.match(html,/id="dc-dua-search"/);
  assert.match(html,/id="dc-search-status"/);
  assert.match(html,/সুরা আল-কাসাস ২৮:২৪/); // Source references remain visible
});
test('active topic only renders selected category items',()=>{
  const html=renderDuas('work').html();
  assert.equal((html.match(/data-exp="dua-open"/g)||[]).length,1);
  assert.match(html,/সঠিক জ্ঞান ও সিদ্ধান্তের জন্য/);
  assert.doesNotMatch(html,/হালাল রিজিক ও ঋণমুক্তি/);
  assert.match(html,/data-filter="work" aria-pressed="true"/);
  assert.match(html,/1টি পাওয়া গেছে/);
});
test('zero records display an accurate today counter',()=>{
  const html=renderDuas('all',[]).html();
  assert.match(html,/আজ পড়েছেন 0টি/);
});
test('styles preserve readable 44px chips and phone reflow',()=>{
  assert.match(css,/\.dc-dua-page \.ex-top/);
  assert.match(css,/\.dc-intro/);
  assert.match(css,/\.dc-dua-page \.dc-filter-scroll button/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/@media\(max-width:355px\)/);
  assert.match(css,/\.dc-dua-page \.dc-dua-row/);
  assert.doesNotMatch(css,/(^|\n)\.ex-top\s*\{/);
});
