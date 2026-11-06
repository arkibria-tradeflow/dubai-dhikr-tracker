import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const app=read('index.html');
const reader=read('reader.html');
const catalog=read('v9-native-links.js');
const readerLogic=read('reader-phase1.js');
const prayer=read('salah-companion.js');
const experience=read('experience.js');
const location=read('location-prayers.js');
const worker=read('sw.js');

test('all modified scripts and inline reader scripts parse',()=>{
  for(const name of ['salah-companion.js','experience.js','v9-native-links.js','reader-phase1.js','location-prayers.js','sw.js']){
    assert.doesNotThrow(()=>new Script(read(name),{filename:name}));
  }
  for(const match of reader.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
    if(/src=|type="application\/json"/.test(match[1]))continue;
    assert.doesNotThrow(()=>new Script(match[2],{filename:'reader.html inline'}));
  }
});

test('Quran lists exactly the supported 30 surahs',()=>{
  const numbers=(source,key)=>{
    const literal=source.match(new RegExp('const '+key+'\\s*=\\s*\\[([0-9,]+)\\]'));
    assert.ok(literal,key+' list exists');
    return JSON.parse('['+literal[1]+']');
  };
  const extra=numbers(catalog,'extraNumbers');
  const extraReader=numbers(readerLogic,'extra');
  assert.deepEqual(extra,extraReader);
  const match=reader.match(/<script id="surah-data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(match);
  const offline=JSON.parse(match[1]).map(x=>x.n);
  assert.equal(offline.length,10);
  assert.equal(new Set([...offline,...extra]).size,30);
  assert.match(catalog,/aria-disabled="true"/);
  assert.match(experience,/78,79,80,81,82,83,84,85,93,94/);
});

test('prayer learning and after-prayer dhikr remain separate',()=>{
  assert.match(prayer,/salah-learn-shortcut/);
  assert.match(prayer,/data-salah="learn"/);
  assert.match(prayer,/data-action="prayer"/);
  assert.doesNotMatch(prayer,/replaceAll\('data-action="prayer"','data-action="salah-tile"'\)/);
});

test('Quran record completion is explicit, local-date-aware and idempotent',()=>{
  assert.doesNotMatch(reader,/\$\('next'\)\.addEventListener\('click',saveReading\)/);
  assert.match(readerLogic,/reader-complete/);
  assert.match(readerLogic,/dhikr_prayer_location_v1/);
  assert.match(readerLogic,/formatToParts/);
  assert.match(readerLogic,/new Set\(\[\.\.\.rows\.map\(String\),String\(number\)\]\)/);
  assert.match(reader,/dhikr:surah-ready/);
  assert.match(reader,/dhikr:surah-failed/);
});

test('accessibility and offline asset registration are retained',()=>{
  assert.doesNotMatch(app,/id="root" aria-live="polite"/);
  assert.match(experience,/aria-current/);
  assert.match(location,/modalReturnFocus/);
  assert.match(location,/e\.key==='Escape'/);
  assert.match(app,/phase1-core\.css/);
  assert.match(reader,/reader-phase1\.js/);
  assert.match(worker,/'\.\/reader-phase1\.js'/);
  assert.match(worker,/'\.\/phase1-core\.css'/);
});
