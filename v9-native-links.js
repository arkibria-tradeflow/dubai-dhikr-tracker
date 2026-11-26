/* v9 + Phase 1: provide truthful native links only for actually supported surahs. */
(function installNativeSurahLinks(){
  'use strict';
  const extraNumbers=[78,79,80,81,82,83,84,85,93,94,95,96,97,98,99,100,101,102,104,111];
  const offlineNumbers=NIGHT_SURAHS.map(s=>s.n);
  const available=[...new Set([...offlineNumbers,...extraNumbers])].sort((a,b)=>a-b);
  const supported=new Set(available);
  const onlineOnly=new Set(extraNumbers);
  const originalCatalog=renderExperienceQuran;
  renderExperienceQuran=function(){
    const tab=quranTab==='all'?'all':'ten';
    const numbers=tab==='ten'?available:Array.from({length:114},(_,i)=>i+1);
    const rows=numbers.map(n=>{
      const s=SURA_BY_NO.get(n);
      const title=s?.title||'সুরা '+QURAN_NAMES[n-1];
      const ready=supported.has(n);
      const complete=expHas(qdb,n);
      const label=ready?(complete?'✓ আজ পড়েছেন':onlineOnly.has(n)?'অনলাইনে পাঠ • ইন্টারনেট প্রয়োজন হতে পারে':'আরবি • বাংলা উচ্চারণ • অর্থ'):'পাঠ এখনো যুক্ত হয়নি';
      const copy='<span class="ex-surah-no">'+bn(n)+'</span><div><b>'+esc(title)+'</b><small>'+label+'</small></div><span class="ex-goldarrow">'+(complete?'✓':ready?'›':'—')+'</span>';
      const attrs='class="ex-surah-row'+(ready?'':' ex-unavailable')+'" data-filter-text="'+esc((title+' '+n+' '+bn(n)).toLowerCase())+'"';
      return ready?
        '<a '+attrs+' href="./reader.html?surah='+n+'&from='+tab+'" aria-label="'+esc(title)+', '+label+'" style="text-decoration:none">'+copy+'</a>':
        '<div '+attrs+' aria-disabled="true" aria-label="'+esc(title)+', পাঠ এখনো যুক্ত হয়নি">'+copy+'</div>';
    }).join('');
    let html=originalCatalog();
    // Quran-only layout: keep the app controls, replace repeated headings and the
    // oversized promotional banner with a compact title and real daily progress.
    html=html.replace('<div class="ex-view">','<div class="ex-view qc-quran-page">')
      .replace('THE HOLY QUR’AN','কুরআন লাইব্রেরি');
    const start=html.indexOf('<span class="ex-kicker">✦ QUR’AN LIBRARY</span>');
    const end=html.indexOf('<div class="ex-segment" role="tablist">',start);
    if(start>=0&&end>start){
      const completed=(qdb[dayInfo().day]||[]).length;
      const compact='<section class="qc-intro" aria-labelledby="qc-title">'+
        '<div class="qc-heading"><div class="qc-title-group">'+
        '<h1 id="qc-title">আল-কুরআন</h1>'+
        '<p>৩০টি সুরা উপলব্ধ <span aria-hidden="true">•</span> ১০টি অফলাইনে</p>'+
        '</div><div class="qc-today" aria-label="আজ '+bn(completed)+'টি সুরা পড়েছেন">'+
        '<span>আজ পড়েছেন</span><strong>'+bn(completed)+' <small>টি</small></strong></div></div>'+
        '</section>';
      html=html.slice(0,start)+compact+html.slice(end);
    }
    const anchor=/<div class="ex-surah-list">[\s\S]*?<\/div>(?=<p id="ex-search-empty")/;
    if(!anchor.test(html))return html;
    html=html.replace(anchor,'<div class="ex-surah-list">'+rows+'</div>');
    html=html.replaceAll('সহজ ১০টি সুরা','উপলব্ধ ৩০টি সুরা').replaceAll('সহজ ১০টি সূরা','উপলব্ধ ৩০টি সুরা');
    html=html.replace('শুধু বাংলা উচ্চারণে সহজ পাঠ। আপনার ১০টি ছোট সুরা প্রস্তুত রয়েছে।','১০টি ছোট সুরা অফলাইনে পড়া যায়। আরও ২০টি সুরার পাঠে ইন্টারনেট প্রয়োজন হতে পারে।');
    return html;
  };
  const params=new URLSearchParams(location.search);
  if(params.get('view')==='quran'){
    quranTab=params.get('collection')==='all'?'all':'ten';
    screen='quran';
  }
  render();
})();