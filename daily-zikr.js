/* Daily 21-count personal dhikr routine.
   Kept separate from established post-salah counts and records. */
(function installDailyZikr21(){
  'use strict';
  const KEY='dhikr_dubai_daily21_v1';
  const GOAL=21;
  const ITEMS=[
    {id:'hawqala',title:'লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ',
      arabic:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
      pron:'লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহিল আলিয়্যিল আযীম।',
      meaning:'মহান ও সর্বোচ্চ আল্লাহর সাহায্য ছাড়া কোনো শক্তি বা সামর্থ্য নেই।',
      note:'আল্লাহর ওপর নির্ভরতা',source:'মূল “লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ” বাক্যের ফজিলত: সহিহ বুখারি ৬৩৮৪।',
      sourceUrl:'https://sunnah.com/bukhari:6384'},
    {id:'istighfar',title:'আস্তাগফিরুল্লাহ, ইন্নাল্লাহা গাফুরুর রাহীম',
      arabic:'أَسْتَغْفِرُ اللَّهَ، إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ',
      pron:'আস্তাগফিরুল্লাহ। ইন্নাল্লাহা গাফুরুর রাহীম।',
      meaning:'আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি। নিশ্চয়ই আল্লাহ অত্যন্ত ক্ষমাশীল, পরম দয়ালু।',
      note:'ক্ষমা প্রার্থনা',source:'ইস্তিগফারের সাধারণ ফজিলত: সুরা নুহ ৭১:১০–১২।',
      sourceUrl:'https://quran.com/71/10-12'},
    {id:'salawat',title:'আল্লাহুম্মা সাল্লি ওয়া সাল্লিম আলা নাবিয়্যিনা মুহাম্মাদ',
      arabic:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
      pron:'আল্লাহুম্মা সাল্লি ওয়া সাল্লিম আলা নাবিয়্যিনা মুহাম্মাদ।',
      meaning:'হে আল্লাহ! আমাদের নবী মুহাম্মদ ﷺ-এর ওপর রহমত ও শান্তি বর্ষণ করুন।',
      note:'নবী ﷺ-এর ওপর দরুদ',source:'দরুদ পাঠের সাধারণ ফজিলত: সহিহ মুসলিম ৪০৮।',
      sourceUrl:'https://sunnah.com/muslim:408'}
  ];
  function clean(raw){
    const result={};
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
    for(const [day,counts] of Object.entries(raw).slice(-1500)){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!counts||typeof counts!=='object'||Array.isArray(counts))continue;
      const safe={};
      ITEMS.forEach(item=>{
        const v=counts[item.id];
        if(Number.isInteger(v)&&v>=0&&v<=GOAL)safe[item.id]=v;
      });
      if(Object.keys(safe).length)result[day]=safe;
    }
    return result;
  }
  let records=clean(safeRead(KEY,{}));
  let selected=ITEMS[0].id;
  let tab='pron';
  function day(){return dayInfo().day;}
  function count(id){return (records[day()]||{})[id]||0;}
  function progress(){
    const sum=ITEMS.reduce((n,item)=>n+count(item.id),0);
    return {sum,total:ITEMS.length*GOAL,complete:ITEMS.filter(item=>count(item.id)===GOAL).length};
  }
  function dailyHomeCard(){
    const p=progress();
    return '<button type="button" class="d21-home-card" data-d21="open-list" aria-label="দৈনিক ২১ বার যিকির খুলুন">'+
      '<span class="d21-home-symbol">✦</span><span class="d21-home-copy"><small>ব্যক্তিগত দৈনিক আমল</small>'+
      '<strong>দৈনিক ২১ বার যিকির</strong><span>৩টি যিকির · '+bn(p.sum)+' / '+bn(p.total)+' বার</span></span>'+
      '<span class="d21-home-arrow">›</span></button>';
  }
  function moreLink(){
    return '<button type="button" data-d21="open-list"><span>✦</span><div><b>দৈনিক ২১ বার যিকির</b>'+
      '<small>৩টি যিকির • আরবি • বাংলা উচ্চারণ • অর্থ • কাউন্টার</small></div><span>›</span></button>';
  }
  function renderList(){
    const p=progress();
    const cards=ITEMS.map((item,i)=>{
      const n=count(item.id),done=n===GOAL;
      return '<button type="button" class="d21-item '+(done?'is-done':'')+'" data-d21="open-reader" data-id="'+item.id+'">'+
        '<span class="d21-index">'+(done?'✓':bn(i+1))+'</span>'+
        '<span class="d21-item-copy"><b>'+esc(item.title)+'</b><small>'+esc(item.note)+'</small>'+
        '<span class="d21-item-meter"><span style="width:'+(n/GOAL*100)+'%"></span></span></span>'+
        '<span class="d21-item-count">'+bn(n)+'<small>/ '+bn(GOAL)+'</small></span></button>';
    }).join('');
    return '<div class="ex-view d21-view">'+
      '<div class="ex-backhead"><button type="button" data-d21="back-more" aria-label="আরও মেনুতে ফিরুন">←</button><span>দৈনিক যিকির</span><span>✦</span></div>'+
      '<div class="d21-hero"><small>PERSONAL DAILY DHIKR</small><h1>প্রতিদিন ২১ বার</h1>'+
      '<p>আল্লাহর স্মরণ, ইস্তিগফার ও দরুদ—নিজের প্রতিদিনের আমল হিসেবে।</p>'+
      '<div class="d21-hero-bottom"><strong>'+bn(p.sum)+' <span>/ '+bn(p.total)+'</span></strong>'+
      '<small>'+bn(p.complete)+' / ৩টি যিকির সম্পন্ন</small></div>'+
      '<div class="d21-progress"><span style="width:'+(p.sum/p.total*100)+'%"></span></div></div>'+
      (p.complete===3?'<div class="d21-success" role="status">✓ আলহামদুলিল্লাহ! আজকের তিনটি যিকির সম্পন্ন।</div>':'')+
      '<h2 class="d21-heading">আজকের যিকির</h2><div class="d21-items">'+cards+'</div>'+
      '<p class="d21-disclaimer">২১ বার আপনার ব্যক্তিগত লক্ষ্য। এই নির্দিষ্ট সংখ্যার আলাদা ফজিলত সহিহ সূত্রে প্রমাণিত নয়। নামাজ-পরবর্তী নির্ধারিত যিকিরের গণনা অপরিবর্তিত রয়েছে।</p>'+
      '<p class="d21-save-note">আপনার গণনা এই ডিভাইসে সংরক্ষিত হয় এবং দুবাইয়ের তারিখ অনুযায়ী প্রতিদিন নতুন করে শুরু হয়।</p></div>';
  }
  function renderReader(){
    const item=ITEMS.find(x=>x.id===selected)||ITEMS[0];
    const index=ITEMS.indexOf(item);
    const n=count(item.id);
    const reading=tab==='ar'?item.arabic:tab==='meaning'?item.meaning:item.pron;
    const tabs=[['pron','বাংলা উচ্চারণ'],['ar','আরবি'],['meaning','অর্থ']].map(t=>
      '<button type="button" data-d21="tab" data-tab="'+t[0]+'" class="'+(tab===t[0]?'active':'')+
      '" role="tab" aria-selected="'+(tab===t[0])+'">'+t[1]+'</button>'
    ).join('');
    return '<section class="d21-reader">'+
      '<header class="d21-reader-head"><button type="button" data-d21="close" aria-label="যিকির তালিকায় ফিরুন">✕</button>'+
      '<div><small>DAILY DHIKR • '+bn(index+1)+' / ৩</small><b>'+esc(item.note)+'</b></div>'+
      '<button type="button" data-d21="font" aria-label="ফন্টের আকার পরিবর্তন">A'+(readingSize==='large'?'−':'+')+'</button></header>'+
      '<div class="d21-reader-progress"><span style="width:'+(n/GOAL*100)+'%"></span></div>'+
      '<div class="d21-reader-scroll"><div class="d21-reader-inner">'+
      '<span class="d21-flower">✦</span><h1>'+esc(item.title)+'</h1>'+
      '<p class="d21-goal">'+bn(GOAL)+' বার পড়ুন • ব্যক্তিগত লক্ষ্য</p>'+
      '<div class="d21-tabs" role="tablist" aria-label="পাঠের ধরন">'+tabs+'</div>'+
      '<div class="d21-reading-paper '+(tab==='ar'?'is-arabic':'')+' '+(readingSize==='large'?'large':'')+
      '" '+(tab==='ar'?'lang="ar" dir="rtl"':'lang="bn"')+'><small>'+
      (tab==='ar'?'মূল আরবি':tab==='meaning'?'বাংলা অর্থ':'বাংলা উচ্চারণ')+
      '</small><p>'+esc(reading)+'</p></div>'+
      '<div class="d21-meaning"><small>অর্থ ও শিক্ষা</small><p>'+esc(item.meaning)+'</p></div>'+
      '<p class="d21-source">'+esc(item.source)+' <a href="'+item.sourceUrl+'" target="_blank" rel="noopener noreferrer">উৎস দেখুন ↗</a></p>'+
      '<p class="d21-disclaimer">২১ বার ব্যক্তিগত লক্ষ্য, নির্দিষ্ট সুন্নাহ বা বিশেষ ফলের নিশ্চয়তা নয়। বাংলা উচ্চারণের পাশাপাশি শুদ্ধ আরবি শিখুন।</p>'+
      '</div></div>'+
      '<footer class="d21-dock"><div class="d21-dock-count"><span>পড়া হয়েছে</span><strong>'+bn(n)+' <small>/ '+bn(GOAL)+'</small></strong></div>'+
      '<div class="d21-action-row"><button type="button" class="d21-minus" data-d21="adjust" data-id="'+item.id+'" data-delta="-1" '+(n===0?'disabled':'')+' aria-label="একবার কমান">−</button>'+
      '<button type="button" class="d21-add" data-d21="adjust" data-id="'+item.id+'" data-delta="1" '+(n===GOAL?'disabled':'')+'>'+
      (n===GOAL?'✓ সম্পন্ন হয়েছে':'✦ পড়া হয়েছে · ট্যাপ করুন')+'</button></div>'+
      (n===GOAL?'<button type="button" class="d21-next" data-d21="next">'+(index<ITEMS.length-1?'পরবর্তী যিকির →':'তালিকায় ফিরে যান →')+'</button>':'')+
      '</footer></section>';
  }
  const priorHome=renderExperienceHome;
  renderExperienceHome=function(){
    const html=priorHome();
    const anchor='<div class="ex-mini-title"><h2>আজকের অগ্রগতি</h2>';
    return html.includes(anchor)?html.replace(anchor,dailyHomeCard()+anchor):html+dailyHomeCard();
  };
  const priorMore=renderExperienceMore;
  renderExperienceMore=function(){
    return priorMore().replace('<div class="ex-more-list">','<div class="ex-more-list">'+moreLink());
  };
  const priorRender=render;
  render=function(){
    if(screen!=='daily21'&&screen!=='daily21-reader')return priorRender();
    const reader=screen==='daily21-reader';
    document.body.classList.toggle('focus-mode',reader);
    document.getElementById('root').innerHTML=reader?renderReader():renderList();
    renderExperienceNav();
    const nav=document.querySelector('.nav');
    if(nav)nav.hidden=reader;
    if(!reader)document.querySelector('.nav [data-screen="more"]')?.classList.add('active');
  };
  function adjust(id,delta){
    if(!ITEMS.some(x=>x.id===id)||!Number.isInteger(delta)||Math.abs(delta)!==1)return;
    const old=count(id),next=Math.min(GOAL,Math.max(0,old+delta));
    if(next===old)return;
    const d=day();
    const changed={...records,[d]:{...(records[d]||{}),[id]:next}};
    if(!safeWrite(KEY,changed))return;
    records=changed;
    render();
    if(next===GOAL&&delta>0)toast('আলহামদুলিল্লাহ! ২১ বার সম্পন্ন হয়েছে।');
  }
  document.addEventListener('click',function(event){
    const control=event.target.closest('[data-d21]');
    if(!control||control.disabled)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const action=control.dataset.d21;
    if(action==='open-list'){screen='daily21';render();window.scrollTo(0,0);}
    else if(action==='back-more'){screen='more';render();window.scrollTo(0,0);}
    else if(action==='open-reader'){selected=control.dataset.id;tab='pron';screen='daily21-reader';render();window.scrollTo(0,0);}
    else if(action==='close'){screen='daily21';render();window.scrollTo(0,0);}
    else if(action==='adjust'){adjust(control.dataset.id,Number(control.dataset.delta));}
    else if(action==='tab'){tab=control.dataset.tab;render();}
    else if(action==='font'){readingSize=readingSize==='large'?'normal':'large';safeWrite('dhikr_dubai_reading_size_v3',readingSize);render();}
    else if(action==='next'){
      const index=ITEMS.findIndex(x=>x.id===selected);
      if(index<ITEMS.length-1){selected=ITEMS[index+1].id;tab='pron';render();}
      else{screen='daily21';render();}
    }
  },true);
  window.addEventListener('storage',function(e){
    if(e.key!==KEY)return;
    records=clean(safeRead(KEY,{}));
    if(screen==='daily21'||screen==='daily21-reader')render();
  });
  window.DailyZikr21={
    key:KEY,
    clean:clean,
    exportData:function(){return clean(records);},
    reload:function(){records=clean(safeRead(KEY,{}));}
  };
  render();
})();
