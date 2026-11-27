import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const legacySource=read('tahajjud.js');
const catalogSource=read('dua-catalog.js');
const page=read('index.html');
const sw=read('sw.js');
const template=JSON.parse(read('docs/dua-entry-template.json'));
function createCatalog(){
  const ctx={window:{}};
  const start=legacySource.indexOf("const NIGHT_DUAS=[");
  const end=legacySource.indexOf('const NIGHT_SURAHS=[',start);
  assert.ok(start!==-1&&end>start);
  runInNewContext(legacySource.slice(start,end),ctx,{filename:'tahajjud.js:legacy-duas'});
  runInNewContext(catalogSource,ctx,{filename:'dua-catalog.js'});
  const original=runInNewContext('NIGHT_DUAS',ctx);
  return {catalog:ctx.window.DhikrDuaCatalog,original};
}
const {catalog,original}=createCatalog();

test('catalog and existing data scripts parse',()=>{
  assert.doesNotThrow(()=>new Script(catalogSource));
  assert.doesNotThrow(()=>new Script(read('dua-compact.js')));
  assert.equal(catalog.version,1);
});
test('20 distinctive category IDs have Bengali names and navigable subtopics',()=>{
  assert.equal(catalog.categories.length,20);
  assert.equal(new Set(catalog.categories.map(c=>c.id)).size,20);
  for(const row of catalog.categories){
    assert.match(row.id,/^[a-z]+(?:-[a-z]+)*$/);
    assert.ok(row.name.length>=4);
    assert.ok(row.en.length>2);
    assert.ok(row.subtopics.length>=2);
    assert.ok(Object.isFrozen(row));
  }
  assert.ok(catalog.categories.some(x=>x.id==='hajj-umrah'));
  assert.ok(catalog.categories.some(x=>x.id==='death-hereafter'));
});
test('all 11 original Dua IDs and original wording remain unchanged',()=>{
  assert.equal(original.length,11);
  assert.equal(catalog.entries.length,11);
  assert.equal(new Set(catalog.entries.map(x=>x.id)).size,11);
  assert.deepEqual(Array.from(catalog.entries.map(x=>x.id)),Array.from(original.map(x=>x.id)));
  for(const old of original){
    const row=catalog.get(old.id);
    assert.ok(row,old.id);
    assert.equal(row.id,old.id);
    assert.equal(row.title,old.title);
    assert.equal(row.legacyGroup,old.group);
    assert.equal(row.source.reference,old.ref);
    assert.equal(row.source.url,old.url||null);
    assert.equal(row.text.bengaliMeaning,old.meaning);
    assert.equal(row.text.arabic,null);
    assert.equal(row.prescribedCount,null);
    assert.equal(row.prescribedOccasion,null);
    assert.equal(row.editorial.status,'pending_review');
    assert.equal(row.editorial.sourceChecked,false);
    assert.equal(row.editorial.wordingChecked,false);
    assert.equal(row.editorial.reviewer,null);
    assert.equal(catalog.validateCandidate({...row,id:'draft-'+row.id}).valid,true);
    if(row.source.kind==='personal'){
      assert.equal(row.text.personalBengaliWording,old.pron);
      assert.equal(row.text.bengaliPronunciation,null);
    }else{
      assert.equal(row.text.bengaliPronunciation,old.pron);
      assert.equal(row.text.personalBengaliWording,null);
    }
  }
});
test('source classification is explicit and honest, not automatically authenticated',()=>{
  const kinds={};
  for(const row of catalog.entries)kinds[row.source.kind]=(kinds[row.source.kind]||0)+1;
  assert.equal(kinds.quran,6);
  assert.equal(kinds.hadith,2);
  assert.equal(kinds.dhikr,2);
  assert.equal(kinds.personal,1);
  assert.equal(catalog.get('work-personal').source.citationScope,'personal_wording');
  assert.equal(catalog.get('remembrance').source.citationScope,'general_encouragement');
  assert.equal(catalog.get('remembrance-salat').source.citationScope,'general_encouragement');
  assert.equal(catalog.entries.filter(x=>x.editorial.status==='verified').length,0);
});
test('a Dua has one primary category and reusable secondary categories',()=>{
  for(const row of catalog.entries){
    assert.equal(row.categoryIds[0],row.primaryCategory);
    assert.equal(new Set(row.categoryIds).size,row.categoryIds.length);
    assert.ok(catalog.categories.some(x=>x.id===row.primaryCategory));
    for(const id of row.categoryIds)assert.ok(catalog.categories.some(x=>x.id===id));
    assert.ok(Object.isFrozen(row.categoryIds));
  }
  const groups=catalog.categoryStats();
  assert.equal(groups.length,20);
  assert.ok(groups.find(x=>x.id==='health-healing').count>=2);
  assert.equal(groups.find(x=>x.id==='hajj-umrah').count,0);
  assert.equal(groups.find(x=>x.id==='ramadan-fasting').count,0);
});
test('search indexes topical synonyms, category names, and source text',()=>{
  assert.ok(catalog.searchText('work-personal').includes('চাকরি'));
  assert.ok(catalog.searchText('remembrance').includes('আত্মশুদ্ধি'));
  assert.deepEqual(Array.from(catalog.list({query:'আত্মশুদ্ধি'}).map(x=>x.id)),['remembrance']);
  assert.ok(catalog.list({category:'marriage-spouses'}).some(x=>x.id==='family-calm'));
  assert.ok(catalog.list({category:'family-children'}).some(x=>x.id==='family-calm'));
  assert.ok(catalog.list({query:'পরীক্ষা'}).some(x=>x.id==='work-knowledge'));
  assert.ok(catalog.list({kind:'personal'}).every(x=>x.source.kind==='personal'));
  assert.equal(catalog.normalize('ঋণ-২০২৬'),'ঋণ 2026');
  assert.ok(catalog.searchText('work-knowledge').includes(catalog.normalize('পড়াশোনা')));
  assert.equal(catalog.normalize('পড়াশোনা'),catalog.normalize('পড়াশোনা'));
  assert.match(read('dua-compact.js'),/const shared=typeof window!==/);
  assert.equal(catalog.get('does-not-exist'),null);
});
test('draft validation rejects duplicate IDs, invented Arabic, claims and unreviewed publication',()=>{
  const draft={
    id:'sample-new-source',title:'শিক্ষামূলক নমুনা',
    primaryCategory:'knowledge-learning',categoryIds:['knowledge-learning','work-decisions'],
    tags:['জ্ঞান'],
    source:{kind:'quran',reference:'REPLACE WITH REAL SOURCE',url:null,citationScope:'excerpt'},
    text:{arabic:null,bengaliPronunciation:null,personalBengaliWording:null,bengaliMeaning:'পর্যালোচনার অপেক্ষায়'},
    editorial:{status:'draft',sourceChecked:false,wordingChecked:false,pronunciationChecked:false,meaningChecked:false,reviewer:null,reviewedAt:null},
    prescribedCount:null,prescribedOccasion:null
  };
  const valid=catalog.validateCandidate(draft);
  assert.equal(valid.valid,true,valid.issues.join('; '));
  assert.equal(catalog.validateCandidate({...draft,id:'rizq-need'}).valid,false);
  assert.equal(catalog.validateCandidate({...draft,categoryIds:['not-a-category']}).valid,false);
  const published={...draft,editorial:{...draft.editorial,status:'published'}};
  assert.equal(catalog.validateCandidate(published).valid,false);
  assert.equal(catalog.validateCandidate({...draft,prescribedCount:{times:21}}).valid,false);
  const personal={...draft,source:{kind:'personal',reference:'নিজের ভাষায়',url:null},text:{arabic:'INVENTED',bengaliMeaning:'বাংলা অর্থ',personalBengaliWording:'নিজের দোয়া',bengaliPronunciation:null}};
  assert.equal(catalog.validateCandidate(personal).valid,false);
  const corrected={...draft,text:{...draft.text,arabic:'رَبِّ زِدْنِي عِلْمًا'},
    editorial:{...draft.editorial,status:'verified',sourceChecked:true,wordingChecked:true,pronunciationChecked:true,meaningChecked:true,reviewer:'Human reviewer',reviewedAt:'2026-11-27T00:00:00Z'}};
  assert.equal(catalog.validateCandidate(corrected).valid,true);
});
test('unpublished draft template is separate from runtime',()=>{
  assert.match(template._templateOnly,/NOT FOR PRODUCTION/);
  assert.equal(template.editorial.status,'draft');
  assert.equal(template.text.arabic,null);
  assert.ok(!catalog.get(template.id));
  assert.doesNotMatch(page,/dua-entry-template\.json/);
  assert.doesNotMatch(sw,/dua-entry-template\.json/);
});
test('catalog script is loaded after legacy data and before current Dua UI',()=>{
  assert.ok(page.indexOf('tahajjud.js?v=9.0.1')<page.indexOf('dua-catalog.js?v=1.0.1'));
  assert.ok(page.indexOf('dua-catalog.js?v=1.0.1')<page.indexOf('dua-compact.js?v=1.0.2'));
  assert.match(sw,/'\.\/dua-catalog\.js'/);
  assert.match(sw,/const CACHE='dubai-dhikr-v\d+\.\d+\.\d+'/);
});
