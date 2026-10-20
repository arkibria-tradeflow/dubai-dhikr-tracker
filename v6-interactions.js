(function installV6() {
  'use strict';
  let readingTab='bn', asmaNumber=1, advanceTimer=null;

  function cancelAdvance() {
    if (advanceTimer !== null) clearTimeout(advanceTimer);
    advanceTimer=null;
  }
  function nextUnread(number) {
    const sorted=[...NIGHT_SURAHS].sort((a,b)=>a.n-b.n);
    const i=sorted.findIndex(s=>s.n===number);
    return [...sorted.slice(i+1),...sorted.slice(0,i+1)].find(s=>!expHas(qdb,s.n))||null;
  }
  function renderVerses(s,mode) {
    const data=SURA_DETAILS[s.n];
    if(!data)return '<p>সুরার পাঠটি পাওয়া যাচ্ছে না।</p>';
    if(mode==='ar') {
      return `<p class="ex-bismillah" dir="rtl" lang="ar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>`+
        data.arabic.map((line,i)=>`<p class="ex-ayah ar" dir="rtl" lang="ar"><span class="ex-ayah-text">${esc(line)}</span><span class="ex-ayah-no">${bn(i+1)}</span></p>`).join('');
    }
    if(mode==='meaning') {
      return `<p class="ex-bismillah-bn">পরম করুণাময়, অসীম দয়ালু আল্লাহর নামে।</p>`+
        data.meaning.map((line,i)=>`<p class="ex-ayah meaning"><span class="ex-ayah-no">${bn(i+1)}</span><span>${esc(line)}</span></p>`).join('');
    }
    const lines=s.pron.split(/\n+/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('বিসমিল্লাহির'));
    return `<p class="ex-bismillah-bn">বিসমিল্লাহির রাহমানির রাহীম।</p>`+
      lines.map((line,i)=>`<p class="ex-ayah bn"><span class="ex-ayah-no">${bn(i+1)}</span><span>${esc(line)}</span></p>`).join('');
  }
  const originalQuranReader=renderExperienceQuranReader;
  renderExperienceQuranReader=function() {
    const s=SURA_BY_NO.get(selectedSurah);
    if(!s)return originalQuranReader();
    const completed=expHas(qdb,s.n);
    const tabs=[['bn','বাংলা উচ্চারণ'],['ar','আরবি'],['meaning','বাংলা অর্থ']].map(([key,label])=>`<button role="tab" aria-selected="${readingTab===key}" data-v6="mode" data-mode="${key}" class="${readingTab===key?'selected':''}">${label}</button>`).join('');
    return `<div class="ex-reader ex-quran-reader ${readingSize==='large'?'ex-large':''}"><div class="ex-reader-header"><button data-exp="reader-close" aria-label="কুরআনে ফিরে যান">✕</button><div><small>QUR’AN · READ & REFLECT</small><strong>${esc(s.title)}</strong></div><button data-exp="font" aria-label="লেখা বড় করুন">A${readingSize==='large'?'−':'+'}</button></div><div class="ex-reader-scroll"><div class="ex-reader-content"><span class="ex-reader-flower">۞</span>${expKicker(`সুরা ${bn(s.n)} · ${bn(s.ayat)} আয়াত`)}<h1>${esc(s.title)}</h1><div class="ex-reading-tabs" role="tablist">${tabs}</div><div class="ex-reader-paper">${renderVerses(s,readingTab)}</div><p class="ex-footnote">বাংলা উচ্চারণ শেখার সহায়ক, আরবি তিলাওয়াতের বিকল্প নয়। সঠিক উচ্চারণ বিশ্বস্ত কারির কাছে শিখুন।</p></div></div><div class="ex-reader-dock"><button data-exp="surah-mark" class="ex-primary-action">${completed?'✓ পড়া হয়েছে · পরবর্তী সুরা':'✓ পড়া শেষ'}<span>→</span></button><button data-exp="reader-close" class="ex-reader-bottom-link">কুরআন তালিকায় ফিরে যান ↑</button></div></div>`;
  };
  const originalQuran=renderExperienceQuran;
  renderExperienceQuran=function(){
    return originalQuran().replace('শুধু বাংলা উচ্চারণে সহজ পাঠ। আপনার ১০টি ছোট সুরা প্রস্তুত রয়েছে।','১০টি সহজ সুরা পড়ুন—আরবি, বাংলা উচ্চারণ ও অর্থসহ।');
  };
  function advanceFrom(number){
    cancelAdvance();
    if(screen!=='quran-reader'||selectedSurah!==number)return;
    const next=nextUnread(number);
    if(next){
      selectedSurah=next.n;
      readingTab='bn';
      render();
      const sc=document.querySelector('.ex-reader-scroll');
      if(sc)sc.scrollTop=0;
    }else{
      screen='quran';
      quranTab='ten';
      render();
      toast('মাশাআল্লাহ! সহজ ১০টি সুরা আজ সম্পন্ন হয়েছে।');
    }
  }
  function completeSurah(){
    cancelAdvance();
    const number=selectedSurah,day=dayInfo().day;
    const completed=new Set(qdb[day]||[]);
    completed.add(String(number));
    const updated={...qdb,[day]:[...completed]};
    if(!safeWrite(QKEY,updated)){toast('সেভ করা যায়নি। আবার চেষ্টা করুন।');return;}
    qdb=updated;
    const next=nextUnread(number);
    render();
    const reader=document.querySelector('.ex-quran-reader');
    if(!reader)return;
    reader.insertAdjacentHTML('beforeend',`<div class="ex-v6-finish" role="status" aria-live="polite"><div class="ex-v6-success"><div class="ex-v6-check">✓</div><small>SURAH COMPLETED</small><h2>মাশাআল্লাহ!</h2><p>${esc(SURA_BY_NO.get(number)?.title||'সুরা')} সম্পন্ন হয়েছে</p><button data-v6="continue" data-from="${number}">${next?'পরবর্তী সুরা পড়ুন →':'১০টি সুরার তালিকায় ফিরুন →'}</button></div></div>`);
    advanceTimer=setTimeout(()=>advanceFrom(number),1500);
  }
  const originalMore=renderExperienceMore;
  renderExperienceMore=function(){
    const mark='<div class="ex-more-list">';
    const card=`<button class="ex-v6-asmalink" data-v6="asma-open"><span>✧</span><div><b>আসমাউল হুসনা</b><small>আল্লাহর ৯৯টি সুন্দর নাম • উচ্চারণ • অর্থ • ফজিলত</small></div><span>›</span></button>`;
    return originalMore().replace(mark,mark+card);
  };
  function renderAsmaList(){
    return `<div class="ex-view ex-asma-view"><div class="ex-backhead"><button data-v6="asma-back" aria-label="আরও মেনুতে ফিরুন">✕</button><span>আসমাউল হুসনা</span><span>✧</span></div>${expKicker('THE MOST BEAUTIFUL NAMES')}<h1 class="ex-page-title">আল্লাহর ৯৯টি নাম</h1><p class="ex-subcopy">আরবি নাম, বাংলা উচ্চারণ, অর্থ ও প্রমাণিত সাধারণ ফজিলত।</p><div class="ex-asma-intro"><span class="emblem">۞</span><div><small>أَسْمَاءُ اللَّهِ الْحُسْنَىٰ</small><strong>তাঁর সুন্দর নামেই<br>আল্লাহকে ডাকুন</strong><p>কুরআন ৭:১৮০ • সহিহ বুখারি ২৭৩৬</p></div></div><label class="ex-search"><span>⌕</span><input id="v6-asma-search" type="search" placeholder="নাম, অর্থ বা নম্বর খুঁজুন" autocomplete="off"></label><div class="ex-asma-list">${ASMA_NAMES.map(n=>`<button class="ex-asma-row" data-v6="asma-detail" data-id="${n.n}" data-key="${esc((`${n.arabic} ${n.bn} ${n.meaning} ${n.n} ${bn(n.n)}`).toLowerCase())}"><span class="ex-asma-no">${bn(n.n)}</span><span class="ex-asma-copy"><strong>${esc(n.bn)}</strong><small>${esc(n.meaning)}</small></span><span class="ex-asma-ar" lang="ar" dir="rtl">${esc(n.arabic)}</span><span class="ex-goldarrow">›</span></button>`).join('')}</div><p id="v6-asma-empty" class="ex-empty" hidden>কোনো মিল পাওয়া যায়নি।</p><p class="ex-footnote">এটি প্রচলিত ৯৯ নামের তালিকা; নির্দিষ্ট ক্রম ও তালিকায় আলেমদের মতভিন্নতা আছে। কোনো নির্দিষ্ট নাম বারবার পড়লে নির্দিষ্ট পার্থিব ফলের নিশ্চয়তা দেওয়া হয়নি।</p></div>`;
  }
  function renderAsmaReader(){
    const n=ASMA_NAMES[asmaNumber-1]; if(!n)return renderAsmaList();
    return `<div class="ex-reader ex-asma-reader ${readingSize==='large'?'ex-large':''}"><div class="ex-reader-header"><button data-v6="asma-close" aria-label="নামের তালিকায় ফিরে যান">✕</button><div><small>ASMA UL HUSNA · ${bn(n.n)} / ৯৯</small><strong>${esc(n.bn)}</strong></div><button data-exp="font" aria-label="লেখা বড় করুন">A${readingSize==='large'?'−':'+'}</button></div><div class="ex-reader-scroll"><div class="ex-reader-content"><span class="ex-reader-flower">✧</span>${expKicker(`আল্লাহর নাম ${bn(n.n)} / ৯৯`)}<div class="ex-asma-reading-ar" lang="ar" dir="rtl">${esc(n.arabic)}</div><h1>${esc(n.bn)}</h1><div class="ex-reader-paper"><small>বাংলা অর্থ</small><p class="ex-asma-meaning">${esc(n.meaning)}</p></div><div class="ex-reader-meaning"><small>ফজিলত ও শিক্ষা</small><p>এই নামটি আল্লাহর ${esc(n.meaning)} গুণ স্মরণ করায়। নামের অর্থ বুঝে তাঁর কাছে দোয়া করতে পারেন।</p><p>${esc(ASMA_GENERAL_BENEFIT)}</p></div><div class="ex-asma-sources"><a href="https://quran.com/7/180" target="_blank" rel="noopener noreferrer">কুরআন ৭:১৮০ ↗</a><a href="https://sunnah.com/bukhari:2736" target="_blank" rel="noopener noreferrer">সহিহ বুখারি ২৭৩৬ ↗</a></div></div></div><div class="ex-reader-dock"><button class="ex-primary-action" data-v6="asma-next">${n.n<99?'পরবর্তী নাম দেখুন':'তালিকায় ফিরে যান'} <span>→</span></button><button class="ex-reader-bottom-link" data-v6="asma-close">৯৯টি নামের তালিকায় ফিরে যান ↑</button></div></div>`;
  }
  const previouslyRender=render;
  render=function(){
    if(screen==='asma'||screen==='asma-reader'){
      const reader=screen==='asma-reader';
      document.body.classList.toggle('focus-mode',reader);
      document.getElementById('root').innerHTML=reader?renderAsmaReader():renderAsmaList();
      renderExperienceNav();
      const nav=document.querySelector('.nav');
      if(nav)nav.hidden=reader;
      if(!reader){
        const button=document.querySelector('.nav [data-screen="more"]');
        if(button)button.classList.add('active');
      }
      return;
    }
    previouslyRender();
  };
  document.addEventListener('click',event=>{
    const control=event.target.closest('button');
    if(!control||control.disabled)return;
    const old=control.dataset.exp,cmd=control.dataset.v6;
    if(old==='reader-close')cancelAdvance();
    if(old==='surah-open')readingTab='bn';
    if(old==='surah-mark'){
      event.preventDefault();event.stopImmediatePropagation();
      completeSurah();return;
    }
    if(!cmd)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(cmd==='mode'){readingTab=control.dataset.mode;render();}
    else if(cmd==='continue')advanceFrom(Number(control.dataset.from));
    else if(cmd==='asma-open'){screen='asma';render();window.scrollTo(0,0);}
    else if(cmd==='asma-back'){screen='more';render();window.scrollTo(0,0);}
    else if(cmd==='asma-detail'){asmaNumber=Number(control.dataset.id);screen='asma-reader';render();window.scrollTo(0,0);}
    else if(cmd==='asma-close'){screen='asma';render();window.scrollTo(0,0);}
    else if(cmd==='asma-next'){
      if(asmaNumber<99){asmaNumber++;render();const sc=document.querySelector('.ex-reader-scroll');if(sc)sc.scrollTop=0;}
      else{screen='asma';render();}
    }
  },true);
  document.addEventListener('input',event=>{
    if(event.target.id!=='v6-asma-search')return;
    const query=event.target.value.trim().toLowerCase().replace(/[০-৯]/g,c=>String('০১২৩৪৫৬৭৮৯'.indexOf(c)));
    let found=0;
    document.querySelectorAll('.ex-asma-row').forEach(item=>{
      const visible=(item.dataset.key||'').includes(query);
      item.hidden=!visible;if(visible)found++;
    });
    const message=document.getElementById('v6-asma-empty');if(message)message.hidden=found>0;
  });
  render();
})();