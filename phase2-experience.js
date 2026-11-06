/* Phase 2: unified mobile experience. No existing storage keys or counters are replaced. */
(function installPhase2Experience(){
  'use strict';
  const qSearchKey='dhikr_phase2_quran_search_v1';
  const qScrollKey='dhikr_phase2_quran_scroll_v1';
  const qReturnKey='dhikr_phase2_quran_return_v1';
  let duaMode='pron',lastDuaId=null;
  const readSession=(key,fallback)=>{try{return sessionStorage.getItem(key)||fallback}catch(e){return fallback}};
  const writeSession=(key,value)=>{try{sessionStorage.setItem(key,String(value))}catch(e){}};
  const forgetSession=key=>{try{sessionStorage.removeItem(key)}catch(e){}};
  const dayCounts=date=>{
    const day=window.DailyZikr21?.exportData?.()?.[date]||{};
    return ['hawqala','istighfar','salawat'].reduce((sum,id)=>sum+Math.max(0,Math.min(21,Number(day[id])||0)),0);
  };
  const currentCity=()=>{
    const location=window.DhikrGeo?.location;
    return location?.name||'আপনার শহর';
  };
  const oldHome=renderExperienceHome;
  renderExperienceHome=function(){
    const today=dayInfo(),s=todayStat(today.day),valid=validTimes(today.tm);
    const next=PRAYERS.find(p=>valid&&today.now<minutes(today.tm[p.key]));
    const unfinished=[...PRAYERS].reverse().find(p=>unlocked(p.key,today)&&sessionStats(today.day,p.key).started&&!sessionStats(today.day,p.key).complete)||
      PRAYERS.find(p=>unlocked(p.key,today)&&!sessionStats(today.day,p.key).complete);
    const personal=dayCounts(today.day);
    const headline=unfinished?
      '<button class="p2-primary" data-action="continue" data-prayer="'+unfinished.key+'"><span><small>আজকের পরবর্তী আমল</small><strong>'+esc(unfinished.bn)+' নামাজের পর যিকির</strong></span><b aria-hidden="true">→</b></button>':
      '<div class="p2-primary p2-primary-idle"><span><small>আজকের নামাজ-পরবর্তী যিকির</small><strong>'+(!valid?'নামাজের সময় লোড হচ্ছে':s.complete===5?'আলহামদুলিল্লাহ, সব সম্পন্ন':'বর্তমানে কোনো যিকির বাকি নেই')+'</strong></span><span aria-hidden="true">✓</span></div>';
    const nextLabel=!valid?'নামাজের সময় পাওয়া যায়নি':next?next.bn:'আজকের সব ওয়াক্ত শুরু হয়েছে';
    const nextTime=!valid?'—':next?showTime(today.tm[next.key]):'—';
    return [
      '<div class="ex-view p2-home">',expHeader(),
      '<section class="p2-intro"><span class="p2-eyebrow">আসসালামু আলাইকুম · '+esc(currentCity())+'</span>',
      '<h1>আজকের যিকির ও আমল</h1><p>'+esc(banglaDate(today.day))+'</p></section>',
      headline,
      '<section class="p2-status-row" aria-label="আজকের অগ্রগতি">',
        '<div><small>নামাজ-পরবর্তী যিকির</small><strong>'+bn(s.complete)+' <span>/ ৫</span></strong></div>',
        '<div><small>ব্যক্তিগত যিকির</small><strong>'+bn(personal)+' <span>/ ৬৩</span></strong></div>',
      '</section>',
      '<div class="p2-time-strip"><span><small>পরবর্তী নামাজ</small><strong>'+esc(nextLabel)+'</strong></span><b>'+esc(nextTime)+'</b></div>',
      '<button class="p2-personal" data-d21="open-list"><span class="p2-personal-icon">✦</span><span><strong>দৈনিক ২১ বার যিকির</strong><small>৩টি যিকির · '+bn(personal)+' / ৬৩ বার হয়েছে</small></span><span aria-hidden="true">›</span></button>',
      '<div class="ex-mini-title"><h2>পাঁচ ওয়াক্তের যিকির</h2><button data-action="nav" data-screen="prayers">সব দেখুন ›</button></div>',
      '<div class="ex-prayer-grid">'+expPrayerTiles(today)+'</div>',
      '<div class="p2-secondary-links">',
        '<button data-action="nav" data-screen="night"><span>☾</span><span><strong>তাহাজ্জুদ</strong><small>রাতের নামাজ ও আমল</small></span><span aria-hidden="true">›</span></button>',
        '<button data-action="nav" data-screen="history"><span>▥</span><span><strong>আমার ইতিহাস</strong><small>দিনভিত্তিক অগ্রগতি</small></span><span aria-hidden="true">›</span></button>',
      '</div>',
      (err?'<div class="errbox">'+esc(err)+'</div>':''),
      '</div>'
    ].join('');
  };
  const oldHistory=renderHistory;
  renderHistory=function(){
    const selected=getHistDate(),current=dayInfo().day;
    const done=PRAYERS.filter(p=>sessionStats(selected,p.key).complete).length;
    const personal=dayCounts(selected);
    const surahs=Array.isArray(qdb[selected])?qdb[selected].length:0;
    const duas=Array.isArray(dudb[selected])?dudb[selected].length:0;
    const night=nightRecord(selected);
    const tiles=[
      ['নামাজ-পরবর্তী যিকির',bn(done)+' / ৫','পাঁচ ওয়াক্তের যিকির সেশন'],
      ['ব্যক্তিগত ২১ বার',bn(personal)+' / ৬৩','তিনটি দৈনিক যিকির'],
      ['কুরআন পাঠ',bn(surahs),'পড়া হয়েছে হিসেবে সেভ'],
      ['দোয়া পাঠ',bn(duas),'পড়া হয়েছে হিসেবে চিহ্নিত'],
      ['রাতের নামাজ',bn(night.rakaat)+' রাকাত','তাহাজ্জুদ / কিয়ামুল লাইল']
    ].map(item=>'<div class="p2-record-tile"><small>'+item[0]+'</small><strong>'+item[1]+'</strong><span>'+item[2]+'</span></div>').join('');
    const summary='<section class="p2-history-summary" aria-label="নির্বাচিত দিনের আমলের সারাংশ">'+
      '<div class="p2-history-head"><strong>আমলের সারাংশ</strong><small>'+esc(banglaDate(selected))+'</small></div>'+
      '<div class="p2-record-grid">'+tiles+'</div>'+
      '<p class="p2-note">এখানে নামাজ আদায়ের সংখ্যা নয়, নামাজ-পরবর্তী যিকিরের সেশন গণনা দেখানো হয়। রাতের রাকাত ওই রাতের শুরুর তারিখে সংরক্ষিত থাকে।</p></section>';
    let html=oldHistory().replace('আমার জিকিরের রেকর্ড','আমার আমলের ইতিহাস');
    const anchor='<div class="mini-stats">';
    if(html.includes(anchor))html=html.replace(anchor,summary+anchor);
    return html;
  };
  const oldDua=renderExperienceDuaReader;
  renderExperienceDuaReader=function(){
    if(selectedDua!==lastDuaId){lastDuaId=selectedDua;duaMode='pron'}
    let html=oldDua();
    if(!html.includes('class="ex-reader-scroll"'))return html;
    const tabs='<div class="p2-reader-tabs" role="tablist" aria-label="দোয়া পড়ার ধরন">'+
      '<button role="tab" data-p2="dua-mode" data-mode="pron" aria-selected="'+(duaMode==='pron')+'" class="'+(duaMode==='pron'?'active':'')+'">বাংলা উচ্চারণ</button>'+
      '<button role="tab" data-p2="dua-mode" data-mode="meaning" aria-selected="'+(duaMode==='meaning')+'" class="'+(duaMode==='meaning'?'active':'')+'">বাংলা অর্থ</button></div>';
    html=html.replace('class="ex-reader"', 'class="ex-reader p2-dua-reader"');
    html=html.replace('<div class="ex-reader-scroll">',tabs+'<div class="ex-reader-scroll">');
    if(duaMode==='pron')html=html.replace('class="ex-reader-meaning"','class="ex-reader-meaning" hidden');
    else html=html.replace('class="ex-reader-paper"','class="ex-reader-paper" hidden');
    const completed=expHas(dudb,selectedDua);
    const action='<button type="button" class="p2-dua-complete" data-p2="dua-complete" '+(completed?'disabled':'')+'>'+
      (completed?'✓ আজ পড়েছেন':'✓ পড়া শেষ — সেভ করুন')+'</button>';
    html=html.replace('<div class="ex-reader-dock">','<div class="ex-reader-dock">'+action);
    return html;
  };
  function applyQuranSearch(){
    if(screen!=='quran')return;
    const field=document.getElementById('ex-search-surah');
    if(!field)return;
    const q=readSession(qSearchKey,'');
    field.value=q;
    const term=q.toLowerCase().trim().replace(/[০-৯]/g,ch=>String('০১২৩৪৫৬৭৮৯'.indexOf(ch)));
    let shown=0;
    document.querySelectorAll('.ex-surah-row').forEach(row=>{
      const show=(row.dataset.filterText||'').includes(term);
      row.hidden=!show;
      if(show)shown++;
    });
    const empty=document.getElementById('ex-search-empty');
    if(empty)empty.hidden=shown!==0;
  }
  const oldRender=render;
  render=function(){
    const value=oldRender();
    const root=document.getElementById('root');
    if(!root)return value;
    root.classList.toggle('p2-history-mode',screen==='history');
    root.classList.toggle('p2-reading-mode', ['focus','daily21-reader','dua-reader','night-reader','quran-reader'].includes(screen));
    if(screen==='quran'){
      applyQuranSearch();
      if(readSession(qReturnKey,'')==='yes'){
        const y=Math.max(0,Number(readSession(qScrollKey,'0'))||0);
        forgetSession(qReturnKey);
        requestAnimationFrame(()=>window.scrollTo(0,y));
      }
    }
    if(screen==='daily21'){
      const note=root.querySelector('.d21-save-note');
      if(note)note.textContent=note.textContent.replace('দুবাইয়ের তারিখ','নির্বাচিত শহরের তারিখ');
    }
    if(['focus','daily21-reader','dua-reader','night-reader','quran-reader'].includes(screen)){
      root.querySelectorAll('.v2-focus-page,.d21-reader,.ex-reader,.nt-fullscreen,.v7-quran').forEach(el=>el.classList.add('p2-reader-standard'));
    }
    return value;
  };
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-p2]');
    if(!target||target.disabled)return;
    const action=target.dataset.p2;
    event.preventDefault();event.stopImmediatePropagation();
    if(action==='dua-mode'){
      const old=document.querySelector('.ex-reader-scroll');
      const ratio=old&&old.scrollHeight>old.clientHeight?old.scrollTop/(old.scrollHeight-old.clientHeight):0;
      duaMode=target.dataset.mode==='meaning'?'meaning':'pron';
      render();
      const next=document.querySelector('.ex-reader-scroll');
      if(next)next.scrollTop=ratio*Math.max(0,next.scrollHeight-next.clientHeight);
    }else if(action==='dua-complete'){
      if(expHas(dudb,selectedDua))return;
      const key=dayInfo().day,updated={...dudb,[key]:[...new Set([...(dudb[key]||[]),String(selectedDua)])]};
      if(!safeWrite(DUAKEY,updated))return;
      dudb=updated;
      const currentScroll=document.querySelector('.ex-reader-scroll')?.scrollTop||0;
      render();
      const scroll=document.querySelector('.ex-reader-scroll');
      if(scroll)scroll.scrollTop=currentScroll;
      toast('আজকের দোয়া পাঠ সেভ হয়েছে');
    }
  },true);
  document.addEventListener('input',event=>{
    if(event.target.id==='ex-search-surah')writeSession(qSearchKey,event.target.value);
  },true);
  document.addEventListener('click',event=>{
    if(event.target.closest('.ex-surah-row[href]')){
      writeSession(qReturnKey,'yes');writeSession(qScrollKey,window.scrollY||0);
    }
  },true);
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-exp="dua-open"]')){
      const id=event.target.closest('[data-exp="dua-open"]')?.dataset.id;
      if(id!==lastDuaId){lastDuaId=null;duaMode='pron'}
    }
  },true);
  render();
})();
