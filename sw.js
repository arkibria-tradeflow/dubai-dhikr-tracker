const CACHE='dubai-dhikr-v11.0.0';
const ASSETS=['./','./index.html','./reader.html','./reader-phase1.js','./bangla-pronunciation-a.json','./bangla-pronunciation-b.json','./v9-native-links.js','./dua-flow.js','./dua-flow.css','./salah-data.js','./salah-companion.js','./salah-companion.css','./location-prayers.js','./location-prayers.css','./daily-zikr.js','./daily-zikr.css','./phase1-core.css','./phase2-experience.css','./phase2-experience.js','./phase3-polish.js','./phase3-polish.css','./app.js','./tahajjud.js','./experience.js','./asma-v6.js','./surah-details-v6.js','./v6-interactions.js','./v7-reader.js','./v8-fixes.js','./tahajjud.css','./experience.css','./v6-enhancements.css','./v7-reader.css','./v8-polish.css','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});

/* Always try the network first. When offline, match assets even if the
   HTML requested a versioned URL (?v=...), but the precache stored the
   canonical file without its query string. */
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(request);
      if(response.ok){
        try{
          const cache=await caches.open(CACHE);
          await cache.put(request,response.clone());
        }catch(e){/* Cache quota must never block reading online. */}
      }
      return response;
    }catch(e){
      const cached=await caches.match(request,{ignoreSearch:true});
      if(cached)return cached;
      if(request.mode==='navigate'){
        return new Response(
          '<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>অফলাইনে</title>'+
          '<body style="margin:0;background:#08281f;color:#faf3d8;font:16px/1.8 system-ui,sans-serif;padding:32px;max-width:640px">'+
          '<h1>ইন্টারনেট সংযোগ নেই</h1><p>এই পাতাটি আগে সংরক্ষিত হয়নি। সংযোগ ফিরে এলে আবার চেষ্টা করুন।</p>'+
          '<a href="./" style="color:#ffe4a5">অ্যাপের হোমে ফিরুন</a></body></html>',
          {status:503,headers:{'Content-Type':'text/html; charset=utf-8'}}
        );
      }
      return new Response('Offline: requested file is not cached.',{
        status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}
      });
    }
  })());
});
