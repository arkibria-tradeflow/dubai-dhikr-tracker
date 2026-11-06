import {readFileSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const script=read('phase3-polish.js');
const css=read('phase3-polish.css');
const sw=read('sw.js');
const index=read('index.html');
const reader=read('reader.html');
const manifest=JSON.parse(read('manifest.webmanifest'));

test('Phase 3 scripts and embedded Quran reader scripts parse',()=>{
  for(const p of ['phase3-polish.js','sw.js']){
    assert.doesNotThrow(()=>new Script(read(p),{filename:p}));
  }
  for(const block of reader.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
    if(/src=|type="application\/json"/.test(block[1]))continue;
    assert.doesNotThrow(()=>new Script(block[2],{filename:'reader.html inline'}));
  }
});

test('Phase 3 assets and updated PWA manifest are registered',()=>{
  assert.match(index,/phase3-polish\.css\?v=1\.0\.0/);
  assert.match(index,/phase3-polish\.js\?v=1\.0\.0/);
  assert.match(reader,/phase3-polish\.css\?v=1\.0\.0/);
  assert.match(sw,/dubai-dhikr-v11\.0\.0/);
  assert.match(sw,/'\.\/phase3-polish\.css'/);
  assert.match(sw,/'\.\/phase3-polish\.js'/);
  assert.equal(manifest.lang,'bn');
  assert.match(manifest.description,/৩০টি উপলব্ধ সুরা/);
});

test('reading controls, Bengali reflow, contrast and error recovery have hooks',()=>{
  assert.match(css,/@media \(max-width: 360px\)/);
  assert.match(css,/@media \(max-height: 620px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /prefers-contrast: more/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /p3-visually-hidden/);
  assert.match(script,/getAnnouncer/);
  assert.match(script,/updateBanner/);
  assert.match(script,/data-p3="retry-times"/);
  assert.match(reader,/id=\\"reader-retry\\"/);
  assert.match(reader,/location\.reload\(\)/);
  assert.doesNotMatch(script,/localStorage\.setItem/);
});

test('offline PWA uses ignoreSearch to find a versioned cached script',async()=>{
  const events={};
  let requested=null;
  const cached=new Response('cached-js',{status:200,headers:{'Content-Type':'text/javascript'}});
  const ctx={
    self:{location:{origin:'https://example.test'},addEventListener:(name,fn)=>{events[name]=fn}},
    caches:{match:async(req,options)=>{requested={req,options};return cached}},
    fetch:()=>Promise.reject(new Error('offline')),
    URL,Response
  };
  runInNewContext(sw,ctx,{filename:'sw.js'});
  let pending=null;
  const req={method:'GET',url:'https://example.test/app.js?v=9.0.0',mode:'cors'};
  events.fetch({request:req,respondWith:p=>{pending=p}});
  assert.ok(pending,'fetch handler must respond');
  const result=await pending;
  assert.equal(await result.text(),'cached-js');
  assert.equal(requested.options.ignoreSearch,true);
  assert.equal(requested.req,req);
});

test('uncached offline navigation returns a recoverable document, not an empty response',async()=>{
  const events={};
  const ctx={
    self:{location:{origin:'https://example.test'},addEventListener:(name,fn)=>{events[name]=fn}},
    caches:{match:async()=>undefined},
    fetch:()=>Promise.reject(new Error('offline')),
    URL,Response
  };
  runInNewContext(sw,ctx,{filename:'sw.js'});
  let pending=null;
  events.fetch({request:{method:'GET',url:'https://example.test/unknown',mode:'navigate'},respondWith:p=>{pending=p}});
  const result=await pending;
  assert.equal(result.status,503);
  assert.match(result.headers.get('content-type'),/text\/html/);
  assert.match(await result.text(),/ইন্টারনেট সংযোগ নেই/);
});
