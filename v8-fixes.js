/* v8: accessible Quran catalogue and reliable tapping. */
(function installDhikrV8(){
'use strict';
let requestedSurah=null;
const oldCatalog=renderExperienceQuran;
renderExperienceQuran=function(){
 return oldCatalog().replace(/(<button\b[^>]*data-exp="surah-open"[^>]*?)\sdisabled(?=>)/g,'$1')
 .replaceAll('পাঠ এখনও যুক্ত হয়নি','বাংলা পাঠ প্রস্তুত হচ্ছে · বিস্তারিত দেখুন');
};
const oldRender=render;
function pendingScreen(){
 const n=requestedSurah,name=QURAN_NAMES[n-1]||'';
 return '<section class="v8-pending" aria-label="সুরার পাঠের অবস্থা">'+
 '<header class="v8-pending-head"><button data-v8="pending-back" aria-label="কুরআন তালিকায় ফিরুন">←</button><strong>সুরা '+esc(name)+'</strong><span></span></header>'+
 '<main class="v8-pending-body"><span class="v8-pending-symbol" aria-hidden="true">۞</span><small>সুরা '+bn(n)+' / ১১৪</small><h1>এই সুরার বাংলা পাঠ এখনো প্রস্তুত নয়</h1><p>এখন সম্পূর্ণ বাংলা উচ্চারণ, আরবি ও বাংলা অর্থসহ ১০টি ছোট সুরা পড়তে পারবেন। যাচাই ছাড়া অন্য সুরার উচ্চারণ দেখানো হচ্ছে না।</p><button class="v8-return-collection" data-v8="pending-ten">সহজ ১০টি সুরা খুলুন <span>→</span></button></main>'+
 '<footer class="v8-pending-footer"><button data-v8="pending-back">← কুরআন তালিকায় ফিরুন</button></footer></section>';
}
render=function(){
 if(screen==='surah-pending'){
  document.body.classList.add('focus-mode');
  const root=document.getElementById('root');if(root)root.innerHTML=pendingScreen();
  const nav=document.querySelector('.nav');if(nav)nav.hidden=true;
  return;
 }
 oldRender();
};
document.addEventListener('click',function(e){
 const row=e.target.closest('[data-exp="surah-open"]');
 if(row){
  e.preventDefault();e.stopImmediatePropagation();
  const n=Number(row.dataset.no);if(!Number.isInteger(n)||n<1||n>114)return;
  if(SURA_BY_NO.has(n)){
   if(typeof expClearSurahTimer==='function')expClearSurahTimer();
   selectedSurah=n;surahReadingTab='bn';screen='quran-reader';
  }else{requestedSurah=n;screen='surah-pending';}
  render();window.scrollTo(0,0);return;
 }
 const action=e.target.closest('[data-v8]');if(!action)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(action.dataset.v8==='pending-back'){screen='quran';quranTab='all';render()}
 else if(action.dataset.v8==='pending-ten'){screen='quran';quranTab='ten';render()}
},true);
render();
})();