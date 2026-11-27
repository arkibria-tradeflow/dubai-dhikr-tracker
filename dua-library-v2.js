/* Dua Library Phase 2: compact, category-first mobile discovery.
 * Uses the verified structure from Phase 1 and the original 11 reading IDs.
 * No new religious wording or editorial authentication is introduced.
 */
(function installDuaLibraryPhase2(){
  'use strict';
  const catalog=window.DhikrDuaCatalog;
  if(!catalog||!catalog.entries||!catalog.categories)return;

  const FAV_KEY='dhikr_dua_favorites_v1';
  const RECENT_KEY='dhikr_dua_recent_v1';
  const known=new Set(NIGHT_DUAS.map(item=>item.id));
  const localRead=key=>{
    try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}
  };
  const uniqueIds=(input,max)=>{
    if(!Array.isArray(input))return [];
    return [...new Set(input.filter(id=>typeof id==='string'&&known.has(id)))].slice(0,max);
  };
  const write=(key,values)=>{
    try{localStorage.setItem(key,JSON.stringify(values));return true}catch(e){return false}
  };
  let favorites=uniqueIds(localRead(FAV_KEY),300);
  let recent=uniqueIds(localRead(RECENT_KEY),25);
  let mode='all',selectedCategory=null,expanded=false,term='',returnScroll=null;
  let lastOpened=null;
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
  const normalize=value=>catalog.normalize(value);
  const categories=catalog.categoryStats();
  const countById=new Map(categories.map(cat=>[cat.id,cat.count]));
  const categoryById=new Map(categories.map(cat=>[cat.id,cat]));
  const idToDua=new Map(NIGHT_DUAS.map(dua=>[dua.id,dua]));
  const order=new Map(NIGHT_DUAS.map((item,index)=>[item.id,index]));
  const sourceLabel={
    quran:'কুরআন',
    hadith:'হাদিস সূত্র',
    dhikr:'যিকির',
    personal:'নিজের ভাষার দোয়া'
  };

  function completedIds(){
    if(typeof dudb!=='object'||!dudb)return [];
    return uniqueIds(
      Object.keys(dudb).filter(day=>/^\d{4}-\d{2}-\d{2}$/.test(day))
        .sort().reverse().flatMap(day=>
          Array.isArray(dudb[day])?[...dudb[day]].reverse():[]),25);
  }
  function recentIds(){return uniqueIds([...recent,...completedIds()],25)}
  function filtered(){
    let entries=catalog.entries.filter(entry=>known.has(entry.id));
    if(mode==='favorites')entries=entries.filter(entry=>favorites.includes(entry.id));
    else if(mode==='recent'){
      const ids=recentIds();
      entries=entries.filter(entry=>ids.includes(entry.id))
        .sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));
    }else{
      if(selectedCategory)entries=entries.filter(entry=>entry.categoryIds.includes(selectedCategory));
      entries.sort((a,b)=>order.get(a.id)-order.get(b.id));
    }
    if(term.trim()){
      const q=normalize(term);
      entries=entries.filter(entry=>catalog.searchText(entry.id).includes(q));
    }
    return entries;
  }
  function categoriesSorted(){
    return [...categories].sort((a,b)=>b.count-a.count||
      catalog.categories.findIndex(c=>c.id===a.id)-catalog.categories.findIndex(c=>c.id===b.id));
  }
  function categoryCard(cat){
    const disabled=cat.count===0;
    const selected=cat.id===selectedCategory;
    const caption=disabled?'এখনও কোনো দোয়া যুক্ত হয়নি':bn(cat.count)+'টি দোয়া';
    const name=escapeHtml(cat.name);
    const copy='<span class="dl2-cat-title">'+name+'</span>'+
      '<span class="dl2-cat-caption">'+caption+'</span>';
    if(disabled)return '<div class="dl2-cat dl2-cat-unavailable" aria-disabled="true" '+
      'data-category="'+escapeHtml(cat.id)+'">'+copy+'</div>';
    return '<button type="button" class="dl2-cat '+(selected?'dl2-selected':'')+'" '+
      'data-dualib="category" data-category="'+escapeHtml(cat.id)+'" '+
      'aria-pressed="'+selected+'" aria-label="'+name+' — '+caption+'">'+copy+'</button>';
  }
  function categoryArea(){
    if(mode!=='all'||term.trim())return '';
    const ordered=categoriesSorted();
    const selection=expanded?ordered:ordered.filter(cat=>cat.count>0).slice(0,4);
    const showMore=ordered.length>selection.length;
    return '<section class="dl2-directory" id="dl2-directory" aria-labelledby="dl2-category-title">'+
      '<div class="dl2-section-head">'+
        '<h2 id="dl2-category-title">বিষয় অনুযায়ী</h2>'+
        '<button type="button" data-dualib="expand" aria-expanded="'+expanded+'" aria-controls="dl2-category-grid" '+
        'class="dl2-more-categories">'+(expanded?'কম দেখুন':'সব ২০ বিভাগ')+' <span aria-hidden="true">'+(expanded?'⌃':'⌄')+'</span></button>'+
      '</div><div class="dl2-category-grid" id="dl2-category-grid">'+
        selection.map(categoryCard).join('')+
      '</div>'+
      (selectedCategory?
        '<button class="dl2-clear-category" type="button" data-dualib="clear-category">✕  বিভাগ ফিল্টার সরান</button>':'')+
      '</section>';
  }
  function quickTabs(){
    const choices=[
      ['all','সব দোয়া',catalog.entries.length],
      ['favorites','পছন্দের',favorites.length],
      ['recent','সম্প্রতি',recentIds().length]
    ];
    return '<div class="dl2-scopes" role="group" aria-label="দোয়া দেখার ধরন">'+
      choices.map(([value,label,count])=>
        '<button type="button" data-dualib="scope" data-scope="'+value+'" '+
        'aria-pressed="'+(mode===value)+'" class="'+(mode===value?'dl2-active':'')+'">'+
        '<span>'+label+'</span><small>'+bn(count)+'</small></button>').join('')+
      '</div>';
  }
  function entryCard(entry){
    const dua=idToDua.get(entry.id);
    if(!dua)return '';
    const completed=expHas(dudb,dua.id);
    const saved=favorites.includes(dua.id);
    const source=entry.source.kind==='personal'?'নিজের ভাষার দোয়া':
      sourceLabel[entry.source.kind]+' · '+entry.source.reference;
    return '<div class="dl2-item">'+
      '<button type="button" class="ex-dua-row dc-dua-row dl2-open" data-exp="dua-open" '+
        'data-id="'+escapeHtml(dua.id)+'" aria-label="'+escapeHtml(dua.title+', '+source+(completed?', আজ পড়েছেন':''))+'">'+
        '<span class="dl2-row-symbol" aria-hidden="true">'+(completed?'✓':'•')+'</span>'+
        '<span class="dl2-row-copy"><b>'+escapeHtml(dua.title)+'</b>'+
        '<small>'+escapeHtml(source)+'</small></span>'+
        '<span class="dl2-row-arrow" aria-hidden="true">›</span>'+
      '</button>'+
      '<button type="button" class="dl2-fav" data-dualib="favorite" data-id="'+escapeHtml(dua.id)+'" '+
      'aria-pressed="'+saved+'" aria-label="'+escapeHtml((saved?'পছন্দের তালিকা থেকে সরান: ':'পছন্দের তালিকায় রাখুন: ')+dua.title)+'" '+
      'title="'+(saved?'পছন্দের তালিকা থেকে সরান':'পছন্দের তালিকায় রাখুন')+'">'+
      '<span aria-hidden="true">'+(saved?'★':'☆')+'</span></button>'+
    '</div>';
  }
  function heading(){
    const chosen=categoryById.get(selectedCategory);
    let name=mode==='favorites'?'পছন্দের দোয়া':mode==='recent'?'সম্প্রতি পড়েছেন':
      chosen?chosen.name:'সব দোয়া';
    if(term.trim())name='খোঁজার ফলাফল';
    return name;
  }
  function emptyMessage(){
    if(term.trim())return 'এই শব্দে কোনো দোয়া পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।';
    if(mode==='favorites')return 'এখনও পছন্দের দোয়া নেই। দোয়ার পাশে ☆ চিহ্নে ট্যাপ করে রাখুন।';
    if(mode==='recent')return 'এখনও কোনো দোয়া খোলা হয়নি। তালিকা থেকে একটি দোয়া পড়ুন।';
    if(selectedCategory)return 'এই বিভাগে এখন কোনো দোয়া পাওয়া যাচ্ছে না।';
    return 'এখনও কোনো দোয়া পাওয়া যায়নি।';
  }
  function resultsHtml(){
    const rows=filtered();
    return {
      count:rows.length,
      html:rows.map(entryCard).join(''),
      empty:emptyMessage()
    };
  }
  renderExperienceDuas=function(){
    const results=resultsHtml();
    const today=Array.isArray(dudb?.[dayInfo().day])?dudb[dayInfo().day].length:0;
    return '<div class="ex-view dc-dua-page dl2-page">'+expHeader('দোয়া লাইব্রেরি')+
      '<section class="dl2-intro" aria-labelledby="dc-title">'+
        '<div><h1 id="dc-title">দোয়া সংগ্রহ</h1><p>প্রয়োজন অনুযায়ী দোয়া খুঁজে নিন</p></div>'+
        '<div class="dl2-total" aria-label="'+bn(NIGHT_DUAS.length)+'টি উপলব্ধ দোয়া">'+
          '<strong>'+bn(NIGHT_DUAS.length)+'</strong><small>টি দোয়া</small></div>'+
      '</section>'+
      '<div class="dl2-search-wrap">'+
        '<label class="dc-search dl2-search" for="dc-dua-search">'+
          '<span class="dl2-search-icon" aria-hidden="true">⌕</span>'+
          '<input id="dc-dua-search" type="search" inputmode="search" autocomplete="off" '+
            'placeholder="দোয়া বা বিষয় খুঁজুন" value="'+escapeHtml(term)+'" aria-label="দোয়া খুঁজুন"></label>'+
        '<button class="dl2-search-clear" type="button" data-dualib="clear-search" '+
          'aria-label="খোঁজা মুছুন" '+(term?'':'hidden')+'>✕</button>'+
      '</div>'+
      quickTabs()+categoryArea()+
      '<section class="dl2-results" id="dl2-results" aria-labelledby="dl2-results-title">'+
        '<div class="dl2-results-head">'+
          '<h2 id="dl2-results-title" tabindex="-1">'+escapeHtml(heading())+'</h2>'+
          '<div class="dc-counts">'+
            '<small id="dc-search-status" role="status" aria-live="polite">'+bn(results.count)+'টি পাওয়া গেছে</small>'+
            (mode==='all'?'<small>আজ পড়েছেন '+bn(today)+'টি</small>':'')+
          '</div></div>'+
        '<div class="ex-dua-list dc-dua-list dl2-list">'+results.html+'</div>'+
        '<p class="dc-empty dl2-empty" id="dc-dua-empty" '+(results.count?'hidden':'')+'>'+escapeHtml(results.empty)+'</p>'+
      '</section>'+
      '<p class="ex-footnote dl2-note">এখানে থাকা দোয়ার সূত্র ও পাঠের যাচাই চলমান। কোনো বিশেষ সংখ্যা বা ফলাফল নিশ্চিত করা হচ্ছে না।</p>'+
    '</div>';
  };

  function updateResults(){
    const root=document.querySelector('.dl2-page');
    if(!root)return;
    const result=resultsHtml();
    const list=root.querySelector('.dl2-list');
    if(list)list.innerHTML=result.html;
    const header=root.querySelector('#dl2-results-title');
    if(header)header.textContent=heading();
    const status=root.querySelector('#dc-search-status');
    if(status)status.textContent=bn(result.count)+'টি পাওয়া গেছে';
    const empty=root.querySelector('#dc-dua-empty');
    if(empty){empty.textContent=result.empty;empty.hidden=result.count>0}
    const directory=root.querySelector('#dl2-directory');
    if(directory)directory.hidden=Boolean(term.trim());
    const clear=root.querySelector('.dl2-search-clear');
    if(clear)clear.hidden=!term;
    const scopeButtons=root.querySelectorAll('.dl2-scopes [data-scope]');
    scopeButtons.forEach(button=>{
      const label=button.querySelector('small');
      if(label)label.textContent=bn(button.dataset.scope==='favorites'?favorites.length:
        button.dataset.scope==='recent'?recentIds().length:catalog.entries.length);
    });
  }
  function rerender({scrollToResults=false,preserveY=false}={}){
    const y=window.scrollY||0;
    render();
    if(scrollToResults){
      requestAnimationFrame(()=>{
        const title=document.getElementById('dl2-results-title');
        title?.scrollIntoView({block:'start',behavior:'instant'});
        title?.focus({preventScroll:true});
      });
    }else if(preserveY){
      requestAnimationFrame(()=>window.scrollTo(0,y));
    }
  }
  function remember(id){
    if(!known.has(id)||recent[0]===id)return;
    recent=[id,...recent.filter(existing=>existing!==id)].slice(0,25);
    write(RECENT_KEY,recent);
  }
  const previousReader=renderExperienceDuaReader;
  renderExperienceDuaReader=function(){
    if(typeof selectedDua==='string')remember(selectedDua);
    return previousReader();
  };

  document.addEventListener('input',event=>{
    if(event.target?.id!=='dc-dua-search'||
       !document.querySelector('.dl2-page'))return;
    term=event.target.value;
    if(term.trim())selectedCategory=null;
    updateResults();
  },true);
  document.addEventListener('click',event=>{
    const control=event.target.closest('[data-dualib]');
    if(control){
      const action=control.dataset.dualib;
      event.preventDefault();
      event.stopImmediatePropagation();
      if(action==='favorite'){
        const id=control.dataset.id;
        if(!known.has(id))return;
        favorites=favorites.includes(id)?
          favorites.filter(row=>row!==id):[...favorites,id];
        if(!write(FAV_KEY,favorites))return;
        updateResults();
        const current=document.querySelector('.dl2-fav[data-id="'+id+'"]');
        current?.focus({preventScroll:true});
      }else if(action==='scope'){
        if(!['all','favorites','recent'].includes(control.dataset.scope))return;
        mode=control.dataset.scope;
        selectedCategory=null;
        rerender({scrollToResults:mode!=='all',preserveY:mode==='all'});
      }else if(action==='category'){
        const id=control.dataset.category;
        if(!(countById.get(id)>0))return;
        mode='all';selectedCategory=id;
        rerender({scrollToResults:true});
      }else if(action==='clear-category'){
        selectedCategory=null;
        rerender({scrollToResults:true});
      }else if(action==='expand'){
        expanded=!expanded;
        rerender({preserveY:true});
        requestAnimationFrame(()=>{
          const button=document.querySelector('.dl2-more-categories');
          button?.focus({preventScroll:true});
        });
      }else if(action==='clear-search'){
        term='';
        const input=document.getElementById('dc-dua-search');
        if(input){
          input.value='';
          updateResults();
          input.focus({preventScroll:true});
        }else rerender({preserveY:true});
      }
      return;
    }
    const open=event.target.closest('.dl2-page [data-exp="dua-open"]');
    if(open&&known.has(open.dataset.id)){
      returnScroll=window.scrollY||0;
    }
    const close=event.target.closest('.ex-reader [data-exp="dua-close"]');
    if(close&&screen==='dua-reader'&&returnScroll!==null){
      const y=returnScroll;
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(document.querySelector('.dl2-page'))window.scrollTo(0,y);
      }));
    }
  },true);

  // This is user activity, unlike Favorites (a personal preference).
  // Clearing all activity must also clear the locally recorded opening history.
  window.DhikrDuaLibrary=Object.freeze({
    getState:()=>({
      favorites:[...favorites],recent:[...recent],recentIncludingLegacy:recentIds(),
      mode,selectedCategory,expanded,term
    }),
    clearActivity:()=>{
      recent=[];
      try{localStorage.removeItem(RECENT_KEY)}catch(e){}
    },
    keys:Object.freeze({favorites:FAV_KEY,recent:RECENT_KEY})
  });
})();