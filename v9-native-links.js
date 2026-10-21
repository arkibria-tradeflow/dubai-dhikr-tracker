/* v9: native hyperlink navigation. No delegated click handler is needed to open a Qur’an surah. */
(function installNativeSurahLinks(){
  'use strict';
  const extraNumbers = [78,79,80,81,82,83,84,85,93,94,95,96,97,98,99,100,101,102,104,111];
  const originalCatalog = renderExperienceQuran;
  renderExperienceQuran = function(){
    let html = originalCatalog();
    if(quranTab==='ten'){
      const extraRows=extraNumbers.map(n=>{
        const name=QURAN_NAMES[n-1];
        return '<button class="ex-surah-row" data-exp="surah-open" data-no="'+n+'" data-filter-text="'+name+' '+n+'"><span class="ex-surah-no">'+bn(n)+'</span><div><b>সুরা '+esc(name)+'</b><small>আরবি ও বাংলা অর্থ · উচ্চারণ যাচাই চলছে</small></div><span class="ex-goldarrow">›</span></button>';
      }).join('');
      html=html.replace('<div class="ex-surah-list">','<div class="ex-surah-list">'+extraRows);
      html=html.replaceAll('সহজ ১০টি সুরা','নির্বাচিত ৩০টি সুরা');
    }
    return html.replace(/<button\b([^>]*\bdata-exp="surah-open"[^>]*)>([\s\S]*?)<\/button>/g, function(_, attributes, inside){
      const found = attributes.match(/\bdata-no="(\d+)"/);
      if(!found) return _;
      const n=Number(found[1]);
      const href='./reader.html?surah='+n+'&from='+(quranTab==='all'?'all':'ten');
      let clean=attributes.replace(/\s+data-exp="surah-open"/,'').replace(/\s+disabled(?=\s|$)/g,'');
      return '<a'+clean+' href="'+href+'" aria-label="সুরা '+n+' পড়ুন" style="text-decoration:none;cursor:pointer">'+inside+'</a>';
    });
  };
  const params = new URLSearchParams(location.search);
  if(params.get('view')==='quran'){
    quranTab=params.get('collection')==='all'?'all':'ten';
    screen='quran';
  }
  render();
})();