/* Dhikr v7 — approved continuous Qur'an reading + interactive Asma tasbih. */
(function installFocusedReaders(){
 'use strict';
 const SURA_ORDER=[...NIGHT_SURAHS].sort((a,b)=>a.n-b.n);
 const ASMA_KEY='dhikr_asma_last_name_v7';
 let namePosition=Number(safeRead(ASMA_KEY,1));
 if(!Number.isInteger(namePosition)||namePosition<1||namePosition>99)namePosition=1;
 let transitionDirection='next';
 let preventGhostBeadClickUntil=0;
 const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const escText=v=>esc(String(v??''));
 function renderAllVerses(s,mode){
   const info=SURA_DETAILS[s.n];
   if(!info)return '<p>এই সুরার পাঠ পাওয়া যাচ্ছে না।</p>';
   let verses=[];
   if(mode==='ar')verses=info.arabic;
   else if(mode==='meaning')verses=info.meaning;
   else verses=s.pron.split(/\n+/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('বিসমিল্লাহির'));
   const bis=mode==='ar'?'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ':mode==='meaning'?'পরম করুণাময়, অসীম দয়ালু আল্লাহর নামে।':'বিসমিল্লাহির রাহমানির রাহীম।';
   const label=mode==='ar'?'আরবি':mode==='meaning'?'বাংলা অর্থ':'বাংলা উচ্চারণ';
   return `<p class="v7-basmala ${mode==='ar'?'v7-arabic':''}" ${mode==='ar'?'lang="ar" dir="rtl"':''}>${escText(bis)}</p>`+
   verses.map((line,i)=>`<p class="v7-verse ${mode==='ar'?'v7-arabic':''}" data-verse="${i+1}" ${mode==='ar'?'lang="ar" dir="rtl"':''}><span class="v7-verse-number" aria-label="আয়াত ${bn(i+1)}">${bn(i+1)}</span><span class="v7-verse-text">${escText(line)}</span></p>`).join('')+
   `<p class="v7-endnote">${escText(label)} · সুরার সব ${bn(s.ayat)}টি আয়াত</p>`;
 }
 function currentSurahIndex(){return SURA_ORDER.findIndex(s=>s.n===selectedSurah)}
 renderExperienceQuranReader=function(){
   const s=SURA_BY_NO.get(selectedSurah);if(!s){screen='quran';return renderExperienceQuran()}
   const idx=currentSurahIndex();
   const mode=surahReadingTab==='ar'?'ar':surahReadingTab==='meaning'?'meaning':'bn';
   const completed=expHas(qdb,s.n);
   return `<section class="ex-reader v7-quran ${readingSize==='large'?'v7-large':''}" aria-label="${escText(s.title)} পাঠ">
    <header class="v7-q-header"><button class="v7-header-back" data-v7="q-close" aria-label="কুরআন তালিকায় ফিরুন">←</button><div class="v7-q-heading"><strong>${escText(s.title)}</strong><small>সুরা ${bn(s.n)} · ${bn(s.ayat)} আয়াত</small></div><button data-v7="q-size" aria-label="ফন্ট সাইজ পরিবর্তন">A${readingSize==='large'?'−':'+'}</button></header>
    <div class="v7-secondary-modes" role="tablist" aria-label="পাঠের ধরন"><span class="v7-primary-label">বাংলা উচ্চারণ</span><button role="tab" data-v7="q-mode" data-mode="bn" aria-selected="${mode==='bn'}" class="${mode==='bn'?'v7-selected':''}">উচ্চারণ</button><button role="tab" data-v7="q-mode" data-mode="ar" aria-selected="${mode==='ar'}" class="${mode==='ar'?'v7-selected':''}">আরবি</button><button role="tab" data-v7="q-mode" data-mode="meaning" aria-selected="${mode==='meaning'}" class="${mode==='meaning'?'v7-selected':''}">অর্থ</button></div>
    <div id="v7-reading-scroll" class="v7-reading-scroll" tabindex="0" aria-label="সুরার পুরো পাঠ, উপর নিচে স্ক্রল করুন"><article class="v7-reading-text ${mode==='ar'?'v7-arabic-mode':''}">${renderAllVerses(s,mode)}</article></div>
    <div class="v7-scroll-tools" aria-label="পড়ার পাতা উপর নিচে"><button data-v7="q-page" data-dir="up" aria-label="আগের অংশ, এক লাইন ওভারল্যাপসহ">↑</button><button data-v7="q-page" data-dir="down" aria-label="পরের অংশ, আগের শেষ লাইন রেখে">↓</button></div>
    <footer class="v7-q-footer"><button class="v7-prev-surah" data-v7="q-prev" ${idx===0?'disabled':''}>← আগের সূরা</button><span class="v7-surah-position">${bn(idx+1)} / ${bn(SURA_ORDER.length)}</span><button class="v7-next-surah" data-v7="q-next">${idx===SURA_ORDER.length-1?'পড়া হয়েছে':'পরের সূরা'} →</button></footer>
    <span class="v7-sr-only" role="status">${completed?'আজ এই সুরাটি পড়েছেন':''}</span></section>`;
 };
 // Name-specific reflective teaching, not a claim of a guaranteed material result.
 const personalLessons={
  1:'আল্লাহর করুণা সবার ওপর বিস্তৃত। তাঁর রহমতের আশায় দোয়া করুন এবং মানুষকে দয়া করুন।',
  2:'আল্লাহর দয়া স্মরণ করুন; নিজের আচরণেও দয়া ও ক্ষমার চর্চা করুন।',
  3:'সবকিছুর মালিক আল্লাহ। ক্ষমতা ও সম্পদের জন্য কৃতজ্ঞ থাকুন।',
  4:'আল্লাহ সব অপূর্ণতা ও ত্রুটি থেকে পবিত্র। তাঁর মহিমা স্মরণ করুন।',
  5:'আল্লাহ শান্তির উৎস। ঘরে ও আচরণে শান্তি প্রতিষ্ঠার চেষ্টা করুন।',
  6:'নিরাপত্তা আল্লাহর অনুগ্রহ। তাঁর কাছে নিরাপত্তা চান এবং অন্যকে নিরাপদ রাখুন।',
  7:'আল্লাহ সবকিছুর তত্ত্বাবধায়ক। তাঁর ওপর ভরসা করুন এবং দায়িত্বে যত্নবান হোন।',
  8:'পরাক্রম আল্লাহর। নিজের শক্তি নিয়ে অহংকার না করে তাঁর কাছে সাহায্য চান।',
  11:'আল্লাহই স্রষ্টা। সৃষ্টিজগত দেখে তাঁর প্রজ্ঞা ও অনুগ্রহ স্মরণ করুন।',
  14:'আল্লাহ বারবার ক্ষমা করেন। আন্তরিক তওবা ও সংশোধনের পথে থাকুন।',
  16:'সব কল্যাণ আল্লাহর দান। নিজের প্রয়োজন তাঁর কাছে চান এবং কৃতজ্ঞতা প্রকাশ করুন।',
  17:'রিজিক আল্লাহর কাছ থেকে আসে। তাঁর কাছে হালাল জীবিকা চান এবং সৎ পথে চেষ্টা করুন।',
  19:'আল্লাহ সব জানেন। প্রকাশ্য ও গোপন কাজে সততার অভ্যাস গড়ে তুলুন।',
  26:'আল্লাহ সব শোনেন। আপনার প্রার্থনা ও মানুষের কথা—দুটোতেই মনোযোগ দিন।',
  27:'আল্লাহ সব দেখেন। নির্জনেও অন্যায় থেকে দূরে থাকার চেষ্টা করুন।',
  33:'আল্লাহ অশেষ সহনশীল। রাগের মুহূর্তে ধৈর্য ও ক্ষমা অনুশীলন করুন।',
  45:'আল্লাহ দোয়া শোনেন। আশা নিয়ে তাঁর কাছে কল্যাণ প্রার্থনা করুন।',
  48:'আল্লাহর ভালোবাসা স্মরণ করুন; সম্পর্কগুলোতে ভালোবাসা ও ন্যায় বজায় রাখুন।',
  81:'আল্লাহ তওবা কবুল করেন। ভুল বুঝতে পারলে তাঁর কাছে ফিরে আসুন।',
  95:'সঠিক পথের জন্য আল্লাহর কাছে দোয়া করুন এবং সত্যের পথে চলার চেষ্টা করুন।'
 };
 function lessonFor(n){return personalLessons[n.n]||`${n.meaning}—আল্লাহর এই গুণ নিয়ে চিন্তা করুন। তাঁর সুন্দর নাম ধরে দোয়া করুন এবং জীবনে বিনয় ও কৃতজ্ঞতা রাখুন।`}
 function readerName(n){
  const beads=Array.from({length:16},(_,i)=>`<i class="v7-bead" style="--angle:${i*22.5}deg" aria-hidden="true"></i>`).join('');
  return `<section class="ex-reader v7-asma" aria-label="আসমাউল হুসনা তসবীহ">
     <header class="v7-asma-header"><button data-v7="asma-exit" aria-label="আরও মেনুতে ফিরুন">←</button><div><strong>আসমাউল হুসনা</strong><small>${bn(n.n)} / ৯৯ · একটি করে নাম</small></div><button data-v7="asma-list" aria-label="৯৯টি নামের তালিকা">☷</button></header>
     <main class="v7-asma-scroll" id="v7-asma-scroll"><div class="v7-name-content v7-name-animate" data-direction="${transitionDirection}">
       <button class="v7-tasbih" data-v7="asma-next" aria-label="${escText(n.bn)}; পরের নামে যেতে তসবীহে ট্যাপ করুন">
         <span class="v7-tasbih-ring">${beads}</span><span class="v7-tasbih-core"><span class="v7-calligraphy" lang="ar" dir="rtl">${escText(n.arabic)}</span><span class="v7-pronunciation">${escText(n.bn)}</span><small>পরের নামের জন্য ট্যাপ করুন</small></span>
       </button>
       <section class="v7-name-detail"><div class="v7-name-meaning"><small>অর্থ</small><p>${escText(n.meaning)}</p></div>
       <div class="v7-name-lesson"><small>ফজিলত ও শিক্ষা</small><p>${escText(lessonFor(n))}</p></div></section>
      </div></main>
      <footer class="v7-asma-footer"><button data-v7="asma-prev" ${n.n===1?'disabled':''}>← আগের</button><button class="v7-asma-next" data-v7="asma-next">পরবর্তী →</button></footer>
      </section>`;
 }
 function asmaList(){return `<section class="ex-reader v7-asma-list" aria-label="৯৯টি নাম ও অর্থ">
  <header class="v7-asma-header"><button data-v7="asma-back-to-reader" aria-label="তসবীহে ফিরুন">←</button><div><strong>৯৯টি নাম ও অর্থ</strong><small>শুধু দেখার তালিকা · কোনো টিক বা কাউন্টার নয়</small></div><span class="v7-list-icon" aria-hidden="true">☷</span></header>
  <div class="v7-name-list-scroll">${ASMA_NAMES.map(x=>`<div class="v7-list-item"><span class="v7-name-index">${bn(x.n)}</span><div class="v7-list-name"><strong lang="ar" dir="rtl">${escText(x.arabic)}</strong><span>${escText(x.bn)}</span></div><span class="v7-list-meaning">${escText(x.meaning)}</span></div>`).join('')}</div></section>`}
 function goName(delta){
  namePosition=Math.min(99,Math.max(1,namePosition+delta));
  transitionDirection=delta<0?'prev':'next';
  safeWrite(ASMA_KEY,namePosition);screen='asma-reader';render();
  const viewport=document.getElementById('v7-asma-scroll');if(viewport)viewport.scrollTop=0;
 }
 const oldRender=render;
 render=function(){
  if(screen==='asma')screen='asma-reader';
  if(screen==='asma-reader'||screen==='asma-list'){
    document.body.classList.add('focus-mode');
    document.getElementById('root').innerHTML=screen==='asma-list'?asmaList():readerName(ASMA_NAMES[namePosition-1]);
    renderExperienceNav(); const nav=document.querySelector('.nav');if(nav)nav.hidden=true;
    return;
  }
  oldRender();
 };
 function moveSurah(delta,record=false){
  if(screen!=='quran-reader')return;
  const idx=currentSurahIndex(); if(idx<0)return;
  if(record){const key=dayInfo().day;const set=new Set(qdb[key]||[]);set.add(String(selectedSurah));const updated={...qdb,[key]:[...set]};if(!safeWrite(QKEY,updated))return;qdb=updated;}
  const next=SURA_ORDER[idx+delta];
  if(!next){screen='quran';quranTab='ten';render();return}
  selectedSurah=next.n;surahReadingTab='bn';render();
  document.getElementById('v7-reading-scroll')?.scrollTo(0,0);
 }
 function pageScroll(direction){
  const sc=document.getElementById('v7-reading-scroll');if(!sc)return;
  const sample=sc.querySelector('.v7-verse-text');const size=sample?parseFloat(getComputedStyle(sample).lineHeight):35;
  // Move by a viewport minus approximately 1.5 reading lines, keeping context visible.
  const overlap=(Number.isFinite(size)?size:35)*1.7;
  const distance=Math.max(90,sc.clientHeight-overlap);
  sc.scrollBy({top:direction*distance,behavior:reducedMotion()?'instant':'smooth'});
 }
 document.addEventListener('click',ev=>{
   const control=ev.target.closest('[data-v7]');if(!control||control.disabled)return;
   ev.preventDefault();ev.stopImmediatePropagation();
   const cmd=control.dataset.v7;
   if(cmd==='asma-next'&&Date.now()<preventGhostBeadClickUntil)return;
   if(cmd==='q-close'){screen='quran';render()}
   else if(cmd==='q-mode'){
      const sc=document.getElementById('v7-reading-scroll');const ratio=sc&&sc.scrollHeight>sc.clientHeight?sc.scrollTop/(sc.scrollHeight-sc.clientHeight):0;
      surahReadingTab=control.dataset.mode;render();const newer=document.getElementById('v7-reading-scroll');if(newer)newer.scrollTop=ratio*Math.max(0,newer.scrollHeight-newer.clientHeight);
   }
   else if(cmd==='q-size'){
      const sc=document.getElementById('v7-reading-scroll');const ratio=sc&&sc.scrollHeight>sc.clientHeight?sc.scrollTop/(sc.scrollHeight-sc.clientHeight):0;
      readingSize=readingSize==='normal'?'large':'normal';safeWrite('dhikr_dubai_reading_size_v3',readingSize);render();
      const newer=document.getElementById('v7-reading-scroll');if(newer)newer.scrollTop=ratio*Math.max(0,newer.scrollHeight-newer.clientHeight);
   }
   else if(cmd==='q-prev')moveSurah(-1);
   else if(cmd==='q-next')moveSurah(1,true);
   else if(cmd==='q-page')pageScroll(control.dataset.dir==='up'?-1:1);
   else if(cmd==='asma-next')goName(1);
   else if(cmd==='asma-prev')goName(-1);
   else if(cmd==='asma-list'){screen='asma-list';render()}
   else if(cmd==='asma-back-to-reader'){screen='asma-reader';render()}
   else if(cmd==='asma-exit'){screen='more';render()}
  },true);
 // Horizontal swipe changes names, vertical swipe remains natural content scrolling.
 let swipe=null;
 document.addEventListener('touchstart',ev=>{if(screen!=='asma-reader')return;const t=ev.touches[0];if(t)swipe={x:t.clientX,y:t.clientY};},{passive:true});
 document.addEventListener('touchend',ev=>{if(!swipe||screen!=='asma-reader')return;const t=ev.changedTouches[0];if(!t)return;const dx=t.clientX-swipe.x,dy=t.clientY-swipe.y;swipe=null;
   if(Math.abs(dx)>64&&Math.abs(dx)>1.35*Math.abs(dy)){preventGhostBeadClickUntil=Date.now()+550;goName(dx<0?1:-1)}
 },{passive:true});
 // Swap any already visible reader to new design without altering historical records.
 render();
})();