/* v9: native hyperlink navigation. No delegated click handler is needed to open a Qur’an surah. */
(function installNativeSurahLinks(){
  'use strict';
  const originalCatalog = renderExperienceQuran;
  renderExperienceQuran = function(){
    return originalCatalog().replace(/<button\b([^>]*\bdata-exp="surah-open"[^>]*)>([\s\S]*?)<\/button>/g, function(_, attributes, inside){
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