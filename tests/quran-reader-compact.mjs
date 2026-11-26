import {readFileSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const script=read('quran-unified-reader.js');
const css=read('quran-unified-reader.css');
const html=read('reader.html');
const sw=read('sw.js');

function displayFirstAyah(text,index){
  const begin=script.indexOf('  function firstAyahArabic(');
  const end=script.indexOf('  function readableLayers(',begin);
  assert.ok(begin>=0&&end>begin,'display-only deduplication helper is present');
  const ctx={text,index,result:null};
  runInNewContext(script.slice(begin,end)+'\nresult=firstAyahArabic(text,index);',ctx);
  return ctx.result;
}

test('reader code and embedded scripts parse',()=>{
  assert.doesNotThrow(()=>new Script(script));
  for(const part of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
    if(/src=|type="application\/json"/.test(part[1]))continue;
    assert.doesNotThrow(()=>new Script(part[2]));
  }
});

test('first ayah does not repeat a Bismillah already displayed above it',()=>{
  const source='بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ عَمَّ يَتَسَاءَلُونَ';
  assert.equal(displayFirstAyah(source,0),'عَمَّ يَتَسَاءَلُونَ');
  assert.equal(displayFirstAyah(source,1),source,'only the first verse may be deduplicated');
  assert.equal(displayFirstAyah('عَنِ النَّبَإِ الْعَظِيمِ',0),'عَنِ النَّبَإِ الْعَظِيمِ');
  assert.equal(displayFirstAyah('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ عَمَّ يَتَسَاءَلُونَ',0),'عَمَّ يَتَسَاءَلُونَ');
  assert.ok(script.includes('remainder||text'),'source content never disappears on empty remainder');
});

test('X closes reader while leaving previous/next footer navigation intact',()=>{
  assert.match(html,/id="back"[^>]*aria-label="পাঠ বন্ধ করে কুরআন তালিকায় ফিরুন">✕<\/a>/);
  assert.match(html,/id="prev"/);
  assert.match(html,/id="next"/);
  assert.match(html,/id="footer"/);
});

test('unbroken Arabic cannot force a reader row wider than its viewport',()=>{
  assert.match(css,/\.reader \.verse\.uv-ayah\s*\{\s*display:grid/);
  assert.match(css,/grid-template-columns:25px minmax\(0,1fr\)/);
  assert.match(css,/\.reader \.uv-ayah-text>p/);
  assert.match(css,/overflow-wrap:anywhere/);
  assert.match(css,/white-space:normal/);
  assert.match(css,/max-width:100%/);
  assert.match(css,/direction:rtl/);
  assert.match(script,/element\.scrollWidth>element\.clientWidth\+2/);
});

test('only a long or overflowing Arabic verse reduces its individual font',()=>{
  assert.match(script,/function fitArabicVerses\(\)/);
  assert.match(script,/element\.style\.fontSize=''/);
  assert.match(script,/element\.textContent\.trim\(\)\.length>64/);
  assert.match(script,/size=Math\.max\(minimum,size-1\)/);
  assert.match(script,/element\.style\.fontSize=size\+'px'/);
  assert.match(script,/fitArabicVerses\(\);\s*restore\(place\)/);
  assert.match(script,/window\.addEventListener\('resize'/);
});

test('checkbox and footer buttons are quieter and shorter, but still tappable',()=>{
  assert.match(css,/\.reader \.uv-options label\s*\{[\s\S]*?min-height:44px/);
  assert.match(css,/\.reader \.uv-footer \.reader-complete,[\s\S]*?min-height:44px/);
  assert.match(css,/\.reader \.verse\.uv-ayah[\s\S]*?padding:11px 0 12px/);
  assert.match(css,/\.reader \.uv-ayah-text[\s\S]*?gap:5px/);
  assert.match(css,/line-height:1\.78/);
  assert.match(css,/\.reader \.footer\.phase1-footer\.uv-footer/);
});

test('patched asset URLs and PWA cache are available',()=>{
  assert.match(html,/quran-unified-reader\.css\?v=1\.0\.3/);
  assert.match(html,/quran-unified-reader\.js\?v=1\.0\.1/);
  assert.match(sw,/dubai-dhikr-v11\.4\.2/);
  assert.match(sw,/'\.\/quran-unified-reader\.css'/);
  assert.match(sw,/'\.\/quran-unified-reader\.js'/);
});

test('Quran layer options have zero filled backgrounds in checked and unchecked states',()=>{
  assert.match(css,/\.reader \.modes\.uv-options\{[\s\S]*?background:transparent;/);
  assert.match(css,/\.reader \.uv-options label\{[\s\S]*?border:0;[\s\S]*?background:transparent;/);
  assert.match(css,/\.reader \.uv-options label\.uv-checked\{[\s\S]*?border:0;[\s\S]*?background:transparent;/);
  assert.match(css,/\.reader \.uv-options label\{[\s\S]*?min-height:44px;/);
});
