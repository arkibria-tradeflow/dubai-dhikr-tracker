import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const legacy=read('tahajjud.js');
const catalogue=read('dua-catalog.js');
const code=read('dua-reader-v3.js');
const css=read('dua-reader-v3.css');
const html=read('index.html');
const sw=read('sw.js');

function app(){
  const events={},store=new Map(),day='2026-11-27';
  const env={
    window:{DhikrDuaCatalog:null,DhikrDuaLibrary:{
      visibleIds:()=>['rizq-need','wellness-ayyub','work-personal'],
      rememberOpened:id=>env.opened.push(id)
    }},
    opened:[],
    localStorage:{
      getItem:key=>store.get(key)??null,
      setItem:(key,value)=>store.set(key,String(value)),
      removeItem:key=>store.delete(key)
    },
    document:{
      addEventListener:(name,cb)=>{(events[name]??=[]).push(cb)},
      querySelector:()=>null
    },
    selectedDua:'rizq-need',
    dudb:{},
    dayInfo:()=>({day}),
    expHas:(db,id)=>(db[day]||[]).includes(String(id)),
    safeWrite:(key,value)=>{store.set(key,JSON.stringify(value));return true},
    DUAKEY:'dhikr_dubai_dua_v5',
    bn:value=>String(value).replace(/[0-9]/g,d=>'০১২৩৪৫৬৭৮৯'[Number(d)]),
    toast:()=>{},
    render:()=>{env.rendered=env.renderExperienceDuaReader()},
    renderExperienceDuaReader:()=>'<div>old-reader</div>'
  };
  const start=legacy.indexOf('const NIGHT_DUAS=[');
  const end=legacy.indexOf('const NIGHT_SURAHS=[',start);
  assert.ok(start>=0&&end>start);
  runInNewContext(legacy.slice(start,end),env);
  runInNewContext(catalogue,env);
  runInNewContext(code,env);
  function click(action){
    let prevented=0;
    const target={dataset:{dr3:action}};
    const event={
      target:{closest:()=>target},
      preventDefault:()=>prevented++,
      stopImmediatePropagation:()=>{}
    };
    events.click[0](event);
    return prevented;
  }
  function toggle(layer,checked){
    let input={dataset:{dr3Layer:layer},checked};
    events.change[0]({target:input});
    return input.checked;
  }
  return {
    env,store,click,toggle,
    render:()=>env.renderExperienceDuaReader(),
    options:()=>env.window.DhikrCompactDuaReader.options(),
    api:env.window.DhikrCompactDuaReader
  };
}
test('new script syntax, versioned assets and offline cache parse',()=>{
  assert.doesNotThrow(()=>new Script(code));
  assert.doesNotThrow(()=>new Script(sw));
  assert.match(html,/dua-reader-v3\.js\?v=1\.0\.0/);
  assert.match(html,/dua-reader-v3\.css\?v=1\.0\.0/);
  assert.match(sw,/'\.\/dua-reader-v3\.js'/);
  assert.match(sw,/'\.\/dua-reader-v3\.css'/);
  assert.match(sw,/dubai-dhikr-v11\.7\.0/);
  assert.ok(html.indexOf('dua-library-v2.js')<html.indexOf('dua-reader-v3.js'));
  assert.ok(html.indexOf('dua-reader-v3.js')<html.indexOf('smart-header.js'));
});
test('legacy 11 entries render without invented Arabic, oversized hero or tab strip',()=>{
  const {env,render}=app();
  const out=render();
  assert.match(out,/class="ex-reader dr3-reader dr3-size-2"/);
  assert.match(out,/class="dr3-pron"/);
  assert.match(out,/class="dr3-meaning"/);
  assert.match(out,/উচ্চারণ/);
  assert.match(out,/অর্থ/);
  assert.doesNotMatch(out,/class="dr3-arabic"/);
  assert.doesNotMatch(out,/data-dr3-layer="arabic"/);
  assert.match(out,/আরবি পাঠ সূত্র যাচাইয়ের পর যুক্ত হবে/);
  assert.match(out,/data-dr3="previous"/);
  assert.match(out,/data-dr3="save"/);
  assert.match(out,/data-dr3="next"/);
  assert.match(out,/data-dr3="list"/);
  assert.doesNotMatch(out,/ex-reader-flower|ex-reader-paper|p2-reader-tabs|dua-flow-open|dua-flow-nav/);
  assert.equal(env.opened[0],'rizq-need');
});
test('source metadata and wording match the originals, not generated translations',()=>{
  const {env,render}=app();
  const original=runInNewContext('NIGHT_DUAS',env);
  for(const item of original){
    env.selectedDua=item.id;
    const out=render();
    assert.ok(out.includes(item.pron),item.id+' pronunciation/personal wording');
    assert.ok(out.includes(item.meaning),item.id+' original meaning');
    if(item.url)assert.ok(out.includes(item.url),item.id+' source url');
    else assert.match(out,/ব্যক্তিগত বাংলা দোয়া/);
    assert.doesNotMatch(out,/class="dr3-arabic"/);
  }
});
test('verified Arabic gate requires explicit verified editorial status and reviewed source',()=>{
  const {api,env}=app();
  const original=env.window.DhikrDuaCatalog.get('rizq-need');
  assert.equal(api.hasVerifiedArabic(original),false);
  const checked={...original,editorial:{...original.editorial,status:'verified',
    sourceChecked:true,wordingChecked:true},
    text:{...original.text,arabic:'رَبِّ إِنِّي'}};
  assert.equal(api.hasVerifiedArabic(checked),true);
  assert.equal(api.hasVerifiedArabic({...checked,editorial:{...checked.editorial,sourceChecked:false}}),false);
  assert.equal(api.hasVerifiedArabic({...checked,source:{...checked.source,kind:'personal'}}),false);
  assert.equal(api.hasVerifiedArabic({...checked,text:{...checked.text,arabic:null}}),false);
});
test('personal Bengali wording is not mislabeled as Arabic pronunciation or Hadith',()=>{
  const {env,render}=app();
  env.selectedDua='work-personal';
  const out=render();
  assert.match(out,/data-dr3-layer="pron"/);
  assert.match(out,/দোয়া<\/span>/);
  assert.match(out,/ব্যাখ্যা<\/span>/);
  assert.match(out,/নিজের ভাষায় দোয়া/);
  assert.match(out,/নির্দিষ্ট কুরআনের আয়াত বা হাদিস নয়/);
  assert.doesNotMatch(out,/class="dr3-arabic"/);
});
test('checkboxes are independent, with at least one visible reading layer',()=>{
  const {render,toggle,options}=app();
  assert.match(render(),/data-dr3-layer="pron" checked/);
  assert.match(render(),/data-dr3-layer="meaning" checked/);
  assert.equal(toggle('pron',false),false);
  assert.equal(options().pron,false);
  assert.match(render(),/class="dr3-meaning"/);
  assert.doesNotMatch(render(),/class="dr3-pron"/);
  assert.equal(toggle('meaning',false),true);
  assert.equal(options().meaning,true);
  assert.match(render(),/class="dr3-meaning"/);
  assert.equal(toggle('pron',true),true);
  assert.equal(options().pron,true);
});
test('font controls persist levels and are bounded without affecting other readers',()=>{
  const {click,options,render,store}=app();
  assert.equal(options().level,2);
  assert.equal(click('smaller'),1);
  assert.equal(options().level,1);
  assert.match(render(),/dr3-size-1/);
  click('smaller');click('smaller');
  assert.equal(options().level,0);
  click('smaller');
  assert.equal(options().level,0);
  for(let i=0;i<6;i++)click('larger');
  assert.equal(options().level,4);
  assert.ok(store.has('dhikr_dua_reader_options_v1'));
  assert.equal(store.has('dhikr_dubai_reading_size_v3'),false);
});
test('save records the original daily ID once without toggling it off',()=>{
  const {click,env,render,store}=app();
  assert.match(render(),/✓ সেভ করুন/);
  click('save');
  assert.deepEqual(Array.from(env.dudb['2026-11-27']),['rizq-need']);
  click('save');
  assert.deepEqual(Array.from(env.dudb['2026-11-27']),['rizq-need']);
  assert.match(render(),/✓ আজ পড়েছেন/);
  assert.match(store.get('dhikr_dubai_dua_v5'),/rizq-need/);
});
test('Previous/Next follow the current Phase 2 filtered list, without renaming IDs',()=>{
  const {env,click,render}=app();
  assert.match(render(),/dr3-size-2/);
  click('next');assert.equal(env.selectedDua,'wellness-ayyub');
  click('next');assert.equal(env.selectedDua,'work-personal');
  click('next');assert.equal(env.selectedDua,'work-personal');
  click('previous');assert.equal(env.selectedDua,'wellness-ayyub');
  assert.equal(env.opened.at(-1),'wellness-ayyub');
});
test('styles keep 44px touch areas, side padding and three-action footer',()=>{
  assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1\.18fr\) minmax\(0,1fr\)/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/padding:clamp\(17px,5vw,27px\) clamp\(20px,5\.3vw,30px\) 30px/);
  assert.match(css,/\.dr3-reader \.dr3-reading \.dr3-arabic/);
  assert.match(css,/\.dr3-reader \.dr3-reading \.dr3-pron/);
  assert.match(css,/\.dr3-reader \.dr3-reading \.dr3-meaning/);
  assert.doesNotMatch(code,/Math\.random\(/);
});
