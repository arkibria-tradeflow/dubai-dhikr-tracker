import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const legacy=read('tahajjud.js');
const data=read('dua-content-phase4.js');
const catalogCode=read('dua-catalog.js');
const index=read('index.html');
const sw=read('sw.js');
function load(){
  const ctx={window:{}};
  const start=legacy.indexOf('const NIGHT_DUAS=['),end=legacy.indexOf('const NIGHT_SURAHS=[',start);
  runInNewContext(legacy.slice(start,end),ctx);
  runInNewContext(data,ctx);
  runInNewContext(catalogCode,ctx);
  return {catalog:ctx.window.DhikrDuaCatalog,sourced:ctx.window.DhikrDuaPhase4.items,
    original:runInNewContext('NIGHT_DUAS',ctx)};
}
const {catalog,sourced,original}=load();
test('separate content scripts parse and are offline-cached in correct dependency order',()=>{
  assert.doesNotThrow(()=>new Script(data));
  assert.doesNotThrow(()=>new Script(catalogCode));
  const a=index.indexOf('tahajjud.js?v=9.0.1');
  const b=index.indexOf('dua-content-phase4.js?v=1.0.0');
  const c=index.indexOf('dua-catalog.js?v=1.0.1');
  assert.ok(a<b&&b<c);
  assert.match(sw,/'\.\/dua-content-phase4\.js'/);
  assert.match(sw,/dubai-dhikr-v\d+\.\d+\.\d+/);
});
test('first source-linked batch has 29 Quranic and 29 Hisn entries, plus 11 preserved',()=>{
  assert.equal(sourced.length,58);
  assert.equal(sourced.filter(x=>x.sourceKind==='quran').length,29);
  assert.equal(sourced.filter(x=>x.sourceKind==='hadith').length,29);
  assert.equal(catalog.entries.length,69);
  assert.equal(catalog.legacyCount,11);
  assert.equal(catalog.sourcedCount,58);
  assert.equal(new Set(catalog.entries.map(x=>x.id)).size,69);
  for(const old of original){
    const got=catalog.get(old.id);
    assert.ok(got);
    assert.equal(got.title,old.title);
    assert.equal(got.source.reference,old.ref);
    assert.equal(got.text.arabic,null);
    assert.equal(got.text.bengaliMeaning,old.meaning);
    assert.equal(got.editorial.status,'pending_review');
  }
});
test('all 20 categories have source-linked coverage but no duplicates in ID space',()=>{
  const stats=catalog.categoryStats();
  assert.equal(stats.length,20);
  assert.ok(stats.every(x=>x.count>0));
  for(const cat of stats){
    const rows=catalog.list({category:cat.id});
    assert.equal(rows.length,cat.count);
    assert.equal(new Set(rows.map(x=>x.id)).size,rows.length);
  }
  assert.ok(catalog.list({category:'hajj-umrah'}).some(x=>x.id==='h-233'));
  assert.ok(catalog.list({category:'ramadan-fasting'}).some(x=>x.id==='h-176'));
});
test('source records have clickable primary links, Arabic, and honest provisional Bengali status',()=>{
  for(const item of sourced){
    const got=catalog.get(item.id);
    assert.ok(got,item.id);
    assert.equal(got.editorial.status,'source_checked');
    assert.equal(got.editorial.sourceChecked,true);
    assert.equal(got.editorial.wordingChecked,true);
    assert.equal(got.editorial.pronunciationChecked,false);
    assert.equal(got.editorial.meaningChecked,false);
    assert.equal(got.editorial.reviewer,null);
    assert.equal(got.source.url,item.url);
    assert.equal(got.text.arabic,item.arabic);
    assert.ok(got.text.arabic.length>3&&got.text.bengaliMeaning.length>6);
    assert.equal(got.prescribedCount,null);
    assert.equal(got.prescribedOccasion,null);
    assert.match(item.id,/^[qh]-[a-z0-9]+(?:-[a-z0-9]+)*$/);
    if(item.sourceKind==='quran')assert.match(item.url,/^https:\/\/quran\.com\/\d+\/\d+/);
    if(item.sourceKind==='hadith')assert.match(item.url,/^https:\/\/sunnah\.com\/hisn:\d+$/);
  }
  for(const id of ['h-21','h-178','h-179','h-207'])
    assert.equal(catalog.get(id).source.citationScope,'excerpt');
});
test('existing user records, source codes and metadata stay independent',()=>{
  assert.equal(catalog.get('rizq-need').id,'rizq-need');
  assert.equal(catalog.get('work-personal').source.kind,'personal');
  assert.equal(catalog.get('h-233').source.reference,'হিসনুল মুসলিম 233');
  assert.equal(catalog.get('h-233').text.bengaliMeaning.includes('আল্লাহ'),true);
  assert.ok(catalog.list({query:'ইফতার'}).some(e=>e.id==='h-176'));
  assert.ok(catalog.list({query:'মা-বাবা'}).some(e=>e.id==='q-14-41'));
  assert.match(index,/experience\.js\?v=\d+\.\d+\.\d+/);
  assert.ok(index.includes('dua-library-v2.js?v=1.0.2'));
  assert.ok(index.includes('dua-reader-v3.js?v=1.0.1'));
});
