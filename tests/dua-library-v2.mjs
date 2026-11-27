import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const legacy=read('tahajjud.js');
const catalogSource=read('dua-catalog.js');
const src=read('dua-library-v2.js');
const css=read('dua-library-v2.css');
const index=read('index.html');
const sw=read('sw.js');

function app(initial={}){
  const handlers={};
  const stored=new Map(Object.entries(initial));
  const env={
    window:{
      scrollY:0,scrollTo:()=>{},
      DhikrDuaCatalog:null
    },
    localStorage:{
      getItem:key=>stored.get(key)??null,
      setItem:(key,value)=>stored.set(key,String(value)),
      removeItem:key=>stored.delete(key)
    },
    document:{
      addEventListener:(name,handler)=>{(handlers[name]??=[]).push(handler)},
      querySelector:()=>null,getElementById:()=>null
    },
    requestAnimationFrame:fn=>fn(),
    dudb:{'2026-11-26':['rizq-need']},
    dayInfo:()=>({day:'2026-11-26'}),
    expHas:(db,id)=>(db['2026-11-26']||[]).includes(id),
    expHeader:label=>'<header class="ex-top">'+label+'</header>',
    bn:n=>String(n).replace(/[0-9]/g,d=>'০১২৩৪৫৬৭৮৯'[Number(d)]),
    screen:'duas',selectedDua:'rizq-need',
    renderExperienceDuas:()=>'<div>old</div>',
    renderExperienceDuaReader:()=>'<div class="ex-reader">reader</div>',
    render:()=>{}
  };
  const begin=legacy.indexOf('const NIGHT_DUAS=[');
  const end=legacy.indexOf('const NIGHT_SURAHS=[',begin);
  runInNewContext(legacy.slice(begin,end),env);
  runInNewContext(catalogSource,env);
  runInNewContext(src,env);
  const original=runInNewContext('NIGHT_DUAS',env);
  const click=(action,details={})=>{
    const control={dataset:{dualib:action,...details}};
    const event={
      target:{closest:selector=>selector==='[data-dualib]'?control:null},
      preventDefault:()=>{},stopImmediatePropagation:()=>{}
    };
    handlers.click[0](event);
  };
  return {env,original,stored,click,render:()=>env.renderExperienceDuas(),library:env.window.DhikrDuaLibrary};
}
test('Phase 2 source, prior content and worker parse',()=>{
  for(const [name,code] of [['dua-library-v2.js',src],['sw.js',sw]])
    assert.doesNotThrow(()=>new Script(code,{filename:name}));
});
test('new library is after old UI, before smart header and cached offline',()=>{
  assert.ok(index.indexOf('dua-catalog.js?v=1.0.0')<index.indexOf('dua-library-v2.js?v=1.0.0'));
  assert.ok(index.indexOf('dua-compact.js?v=1.0.2')<index.indexOf('dua-library-v2.js?v=1.0.0'));
  assert.ok(index.indexOf('dua-library-v2.js?v=1.0.1')<index.indexOf('smart-header.js?v=1.0.0'));
  assert.match(index,/dua-library-v2\.css\?v=1\.0\.0/);
  assert.match(sw,/'\.\/dua-library-v2\.js'/);
  assert.match(sw,/'\.\/dua-library-v2\.css'/);
  assert.match(sw,/dubai-dhikr-v11\.6\.0/);
  assert.doesNotMatch(sw,/dua-entry-template\.json/);
});
test('initial page: 11 existing duas, four featured category cards and three quick scopes',()=>{
  const {render,env,original}=app();
  const html=render();
  assert.match(html,/class="ex-view dc-dua-page dl2-page"/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.match(html,/দোয়া সংগ্রহ/);
  assert.match(html,/data-dualib="expand"/);
  assert.match(html,/aria-expanded="false"/);
  assert.equal((html.match(/class="dl2-cat /g)||[]).length,4);
  assert.equal((html.match(/data-exp="dua-open"/g)||[]).length,11);
  assert.equal((html.match(/data-dualib="favorite"/g)||[]).length,11);
  assert.equal((html.match(/data-dualib="scope"/g)||[]).length,3);
  assert.match(html,/id="dc-dua-search"/);
  assert.match(html,/আজ পড়েছেন ১টি/);
  assert.equal(original.length,11);
});
test('expanding directory displays all 20 categories with clearly disabled empty topics',()=>{
  const {click,render}=app();
  click('expand');
  const html=render();
  assert.match(html,/aria-expanded="true"/);
  const categories=(html.match(/class="dl2-cat /g)||[]).length;
  assert.equal(categories,20);
  assert.match(html,/data-category="hajj-umrah"/);
  assert.match(html,/data-category="travel"/);
  assert.match(html,/class="dl2-cat dl2-cat-unavailable" aria-disabled="true" data-category="hajj-umrah"/);
  assert.match(html,/এখনও কোনো দোয়া যুক্ত হয়নি/);
  assert.match(html,/data-category="livelihood-debt"/);
});
test('fav state accepts canonical IDs, deduplicates and survives reload, with aria-pressed controls',()=>{
  const initial={dhikr_dua_favorites_v1:JSON.stringify(['rizq-need','unknown','rizq-need'])};
  const {click,render,stored,library}=app(initial);
  assert.deepEqual(Array.from(library.getState().favorites),['rizq-need']);
  assert.match(render(),/data-dualib="favorite" data-id="rizq-need" aria-pressed="true"/);
  click('favorite',{id:'rizq-halal'});
  assert.deepEqual(Array.from(library.getState().favorites),['rizq-need','rizq-halal']);
  click('scope',{scope:'favorites'});
  assert.equal((render().match(/data-exp="dua-open"/g)||[]).length,2);
  assert.match(render(),/পছন্দের দোয়া/);
  click('favorite',{id:'rizq-need'});
  assert.equal((render().match(/data-exp="dua-open"/g)||[]).length,1);
  assert.deepEqual(Array.from(app(Object.fromEntries(stored)).library.getState().favorites),['rizq-halal']);
});
test('recently read is tracked by original ID and completed legacy history is reused',()=>{
  const {env,render,click,library,stored}=app();
  click('scope',{scope:'recent'});
  assert.match(render(),/data-id="rizq-need"/);
  env.selectedDua='family-calm';
  env.renderExperienceDuaReader();
  assert.equal(library.getState().recent[0],'family-calm');
  assert.equal((render().match(/data-exp="dua-open"/g)||[]).length,2);
  assert.deepEqual(JSON.parse(stored.get('dhikr_dua_recent_v1')),['family-calm']);
  library.clearActivity();
  assert.equal(stored.has('dhikr_dua_recent_v1'),false);
  assert.equal((render().match(/data-exp="dua-open"/g)||[]).length,1);
});
test('invalid draft categories do not become published text or available buttons',()=>{
  const {render,click,env,original}=app();
  click('expand');
  const html=render();
  assert.ok(original.every(dua=>env.window.DhikrDuaCatalog.get(dua.id)));
  assert.doesNotMatch(html,/data-exp="dua-open" data-id="draft/);
  assert.match(html,/নিজের ভাষার দোয়া/);
  assert.doesNotMatch(html,/new-authentic-dua/);
});
test('layout maintains 44px controls, responsive grid, and no horizontal category scroller',()=>{
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/\.dl2-cat-unavailable/);
  assert.match(css,/@media\(max-width:355px\)/);
  assert.doesNotMatch(src,/class="ex-chip-scroll dc-filter-scroll"/);
});
