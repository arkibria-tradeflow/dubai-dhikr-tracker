import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const code=read('smart-header.js'),css=read('smart-header.css'),index=read('index.html'),sw=read('sw.js');
test('smart header source compiles and preserves existing navigation',()=>{
  assert.doesNotThrow(()=>new Script(code));
  assert.match(code,/cloneNode\(true\)/);
  assert.match(code,/previousRender=render/);
  assert.match(code,/requestAnimationFrame\(update\)/);
  assert.match(code,/data-smart-head/);
  assert.doesNotMatch(code,/localStorage\.(setItem|removeItem)/);
});
test('scroll direction and reading modes are explicitly guarded',()=>{
  assert.match(code,/upTravel>=13/);
  assert.match(code,/downTravel>=9/);
  assert.match(code,/source\.getBoundingClientRect\(\)\.height\+18/);
  assert.match(code,/hiddenScreens=new Set/);
  for(const mode of ['focus','quran-reader','dua-reader','night-reader','daily21-reader'])
    assert.ok(code.includes("'"+mode+"'"),mode);
  assert.match(code,/document\.activeElement\?\.matches/);
  assert.match(code,/bk-overlay,.geo-overlay,.dua-flow-overlay/);
});
test('accessible header is not available to keyboard focus when hidden',()=>{
  assert.match(code,/bar\.inert=!visible/);
  assert.match(code,/bar\.setAttribute\('aria-hidden',visible\?'false':'true'\)/);
  assert.match(code,/source\.inert=true/);
  assert.match(code,/source\.inert=false/);
  assert.match(code,/aria-label','পৃষ্ঠার শুরুতে যান'/);
});
test('compact mobile style respects safe areas and reduced motion',()=>{
  assert.match(css,/position:fixed/);
  assert.match(css,/inset:0 0 auto/);
  assert.match(css,/env\(safe-area-inset-top\)/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/@media\(min-width:768px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/:focus-visible/);
});
test('script loads last and versioned assets are precached',()=>{
  assert.match(index,/smart-header\.css\?v=1\.0\.0/);
  assert.match(index,/smart-header\.js\?v=1\.0\.0/);
  assert.ok(index.indexOf('smart-header.js?v=1.0.0')>index.indexOf('dua-compact.js?v=1.0.2'));
  assert.match(sw,/const CACHE='dubai-dhikr-v\d+\.\d+\.\d+'/);
  assert.match(sw,/'\.\/smart-header\.js'/);
  assert.match(sw,/'\.\/smart-header\.css'/);
});
