import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const reader=read('reader.html'),layout=read('quran-unified-reader.js');
const styles=read('quran-unified-reader.css');
const controls=read('reader-phase1.js');
const worker=read('sw.js');
const embedded=JSON.parse(reader.match(/<script id="surah-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);

test('all updated scripts and inline reader scripts parse',()=>{
  for(const name of ['quran-unified-reader.js','reader-phase1.js','sw.js'])
    assert.doesNotThrow(()=>new Script(read(name),{filename:name}));
  for(const part of reader.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
    if(/src=|type="application\/json"/.test(part[1]))continue;
    assert.doesNotThrow(()=>new Script(part[2],{filename:'reader.html inline'}));
  }
});

test('every offline surah has a one-to-one Arabic/pronunciation/meaning mapping',()=>{
  assert.equal(embedded.length,10);
  for(const item of embedded){
    const pronounce=item.pron.split(/\n/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('বিসমিল্লাহির'));
    assert.equal(item.arabic.length,item.ayat,'arabic '+item.n);
    assert.equal(item.meaning.length,item.ayat,'meaning '+item.n);
    assert.equal(pronounce.length,item.ayat,'pronunciation '+item.n);
    assert.ok(item.arabic.every(Boolean));
    assert.ok(item.meaning.every(Boolean));
  }
});

test('Quran API reader publishes matched and verified ayah data before ready',()=>{
  assert.match(reader,/DhikrSurahViewData=\{number:no,rows:rows\.map\(r=>\(\{\.\.\.r\}\)\)\}/);
  assert.match(reader,/new CustomEvent\('dhikr:surah-data'/);
  assert.match(reader,/window\.dispatchEvent\(new Event\('dhikr:surah-ready'\)\)/);
  assert.match(layout,/window\.addEventListener\('dhikr:surah-data'/);
  assert.match(layout,/detail\?\.number!==number\|\|!isValid\(detail\.rows\)/);
});

test('independent Arabic, pronunciation and meaning checkboxes and two smaller sizes',()=>{
  assert.match(layout,/data-uv-layer="ar"/);
  assert.match(layout,/data-uv-layer="bn"/);
  assert.match(layout,/data-uv-layer="meaning"/);
  assert.match(layout,/data-uv-size="-1"/);
  assert.match(layout,/data-uv-size="1"/);
  assert.match(layout,/level=Math\.max\(-2,Math\.min\(2/);
  assert.match(layout,/sizeNames=\['আরও ছোট','ছোট','স্বাভাবিক','বড়','আরও বড়'\]/);
  assert.match(layout,/if\(!Object\.values\(next\)\.some\(Boolean\)\)/);
  assert.match(layout,/VIEW_KEY='dhikr_dubai_reader_views_v1'/);
  assert.match(layout,/SIZE_KEY='dhikr_dubai_reader_size_v4'/);
  assert.match(layout,/localStorage\.getItem\('dhikr_dubai_reading_size_v3'\)/);
});

test('verse-by-verse content shows verified layers together, without inventing missing pronunciation',()=>{
  assert.match(layout,/class="verse uv-ayah"/);
  assert.match(layout,/class="uv-arabic" lang="ar" dir="rtl"/);
  assert.match(layout,/class="uv-pron" lang="bn"/);
  assert.match(layout,/class="uv-meaning" lang="bn"/);
  assert.match(layout,/pronUnavailable=!rows\.every/);
  assert.match(layout,/box\.disabled=key==='bn'&&\(!rows\|\|pronUnavailable\)/);
  assert.match(layout,/যাচাইকৃত বাংলা উচ্চারণ এখন উপলব্ধ নয়/);
  assert.match(layout,/function anchor\(\)/);
  assert.match(layout,/function restore\(place\)/);
});

test('previous, save and next are one footer row with readable mobile controls',()=>{
  assert.match(styles,/\.reader \.footer\.phase1-footer\.uv-footer/);
  assert.match(styles,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1\.15fr\) minmax\(0,1fr\)/);
  assert.match(styles,/\.reader \.uv-footer #prev/);
  assert.match(styles,/\.reader \.uv-footer #next/);
  assert.match(styles,/\.reader \.uv-footer \.reader-complete/);
  assert.match(styles,/grid-row:1/);
  assert.match(styles,/env\(safe-area-inset-bottom\)/);
  assert.match(styles,/\.reader \.tools\{display:none!important\}/);
  assert.match(controls,/complete\.textContent=done\?'✓ আজ পড়েছেন':readable\?'✓ সেভ করুন':'লোড হচ্ছে…'/);
  assert.match(controls,/formatToParts\(new Date\(\)\)/);
});

test('new files are registered and offline cached',()=>{
  assert.match(reader,/quran-unified-reader\.css\?v=1\.0\.0/);
  assert.match(reader,/reader-phase1\.js\?v=1\.0\.1/);
  assert.match(reader,/quran-unified-reader\.js\?v=1\.0\.0/);
  assert.match(worker,/dubai-dhikr-v11\.4\.0/);
  assert.match(worker,/'\.\/quran-unified-reader\.css'/);
  assert.match(worker,/'\.\/quran-unified-reader\.js'/);
});